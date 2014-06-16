/** @jsx React.DOM */

var UserMessageInbox = React.createClass({
    render : function() {
      return (
        <div className="UserInfoxMessages">
        <div className="messageHeader">{i18n.messages.messagehead}</div>
        <ComposeNode/>
        <ThreadBox pollInterval={2000}/>
        </div>
      );
    }
});

var ComposeNode = React.createClass({
  render: function(){
    return (
        <Route route={app.routes.compose_message}>
          <span>{i18n.messages.inbox.compose_link}</span>
        </Route>
    )
  }
});

var ThreadBox = React.createClass({
  getInitialState: function() {
    return {threadlist: {}};
  },
  loadThreadsFromServer: function() {
    var opts = {
      ok: function(data){
        if(data){
          this.setState({threadlist:<ThreadList threads={data}/>});
        } else {
          this.setState({threadlist: <NoContent/>});
        }
      }.bind(this),
      fail: function(data){
        this.setState({threadlist: <NoContent/>});
      }.bind(this)
    };
    app.api.messages.loadInbox(opts);
  },
  componentWillMount: function() {
    this.loadThreadsFromServer();
    setInterval(this.loadThreadsFromServer, this.props.pollInterval);
  },
  render: function(){
    return (
      <div>
      {this.state.threadlist}
     </div>
    );
  }
});

var ThreadList = React.createClass({
  render: function(){
    var listThreads = this.props.threads.map(function(thread) {
        return (
            <Thread
            key={thread._id}
            threadId={thread._id}
            unreadcount={thread.unreadcount}
            messages={thread.messages}
            threadinitiator={thread.initiator}
            recipients={thread.recipients}/>
          );
       });
    return (
      <ul>{listThreads}</ul>
    );
  }
});

var Thread =  React.createClass({
  render: function() {
    return (
      <div className="thread">
        <span className="unreadCount">{this.props.unreadcount}</span>
       <SimpleMessage
          message={this.props.messages[0]}
          recipients={this.props.recipients}
          threadinitiator={this.props.threadinitiator}
          threadId={this.props.threadId}/>
      </div>
    );
  }
});

var SimpleMessage = React.createClass({
  render: function() {
    var date = (this.props.message.timestamp) ? <RelativeDate date={$.parseDate(this.props.message.timestamp)} /> : null;
    var avatar = (this.props.message.sender.avatar) ? <Avatar avatar={this.props.message.sender.avatar} size="small"/> : null;
    return (
      <div className="simplemessage">
        {avatar}
        <div>
          {this.props.message.sender.displayName}
          {date}
          <MessageSpan message={this.props.message} threadId={this.props.threadId} />
        </div>
      </div>
    );
  }
});

var MessageSpan =  React.createClass({
  render: function() {
    if (this.props.message.isSender == true )
     {
        var msgIcon = 'ic icon-reply';
     } else if (this.props.message.isRead == false ) {
       var msgIcon = 'ic icon-envelope-thin';
     }
     var params = [{name:'id', value: this.props.threadId}]; 
    return (
      <div>
        <i className={msgIcon}/>
        <Route route={app.routes.show_conversation} params={params}>
        <span className="multiline" ref="span">{this.props.message.messageBody}</span>
        </Route>
      </div>
    );
  },
  componentDidMount : function() {
    if (this.props.message.messageBody.length > 200) {
      var span = this.refs.span.getDOMNode();
      span.innerHTML = this.props.message.messageBody.substr(0, 200) + "...";
    } 
  }
});

//ToDo: recipients ids will come from autocomplete services
var ComposeMessage = React.createClass({
  isAuthenticated: function() {
    return app.authenticated;  
  },
  handleSubmit: function(data) {
    var that = this;
    var opts = {
      form: {
        initiatorId: this.props.user.id,
        recipients: data.recipients,
        language: app.language,
        message: {
          messageBody: data.messageBody,
          senderId: this.props.user.id
        },
      },
      ok: function(data){
        app.routes.messages.go();
      },
      fail: function(data){
        that.props.callback(that.props.displayName);
      }
    };
    app.api.messages.shareMessage(opts);
  },
  handleFocus: function(event) {
    if( !this.isAuthenticated() ){
      if( app.currentRoute.route == app.routes.login ){
        Utils.scrollToElement("auth");
      } else {
        app.routes.login.go();
      }
      event.target.blur();
    }
  },
  render: function() {
    return (
      <ComposeMessageForm onMessageSubmit = {this.handleSubmit} onFocus={this.handleFocus} takeFocus={this.props.takeFocus} />
    );
  }
    
});

var ComposeMessageForm = React.createClass({
  getInitialState: function(){
    return {follows: '', options: '', recipients: [], userName: [], userNames: []};;
  },
  displayErrors: function(errors){
    this.setState({errors: errors});
  },
  submitMessage: function(){
    var messageBody = this.refs.messageBody.getDOMNode();
    var recipients = this.state.recipients;
    var text = messageBody.value.trim();
    if (text != null && text.length != 0) {
      if (text.length > 1000) {
        this.displayErrors({msg:{code:'not_accepted', message: i18n.messages.share.limit}});
      } else {
        this.props.onMessageSubmit({messageBody:text, recipients: recipients});
        this.refs.messageBody.getDOMNode().value='';
      }
    }
    return false;
  },
  handleClick: function(ev){
    that = this;
    var item = ev.target.value;
    var l = this.state.recipients.length;
    var yes = false;
    if(l > 0){
      for (i in this.state.recipients)
      if(this.state.recipients[i].id == item._id){
        yes = true;
        break;
      }
    }
    if(!yes) {
      this.state.userName.push(item);
      this.state.recipients.push({id: item._id});
      that.setState({userName: this.state.userName});
      var op = '';
      var op = this.state.userName.map(function(item, i) {
        return (
          <div value={item._id} onClick={that.removeUser}>
            {item.displayName},
          </div>
        );
      }.bind(this));
      that.setState({userNames: op});
    }
  },
  removeUser: function(em){
    var rec = [];
    var name = [];
    that = this;
    for(prop in this.state.recipients){
      if(this.state.recipients[prop].id != em.currentTarget.attributes[1].value){
        rec.push(this.state.recipients[prop]);
        name.push(this.state.userName[prop]);
      }
    }
    var op = '';
    var op = name.map(function(item, i) {
      return (
        <div value={item._id} onClick={that.removeUser}>
          {item.displayName},
        </div>
      );
    }.bind(this));
    that.setState({recipients: rec});
    that.setState({userName: name});
    that.setState({userNames: op});
  },
  handleKeyUp: function(e) {
    that = this;
    var q = e.target.value;
    if(q && q.length > 2) {
      var opts = {
      form: {
        userString: q
        },
      ok: function(data){
        if(data) {
          var option = '';
          var value = '';
          var name = '';
          var len = data.length;
          var option = data.map(function(item, i) {
            return (
              <div value={item} onClick={that.handleClick}>
                {item.displayName}
              </div>
            );
          }.bind(this));
        }
        that.setState({options: option});
      },
      fail: function(data){
        console.log(data);
      }
      };
    app.api.messages.searchUser(opts);
    }
  },
  componentDidMount : function() {
    var textArea = this.refs.messageBody.getDOMNode();
    textArea.style.resize = 'none';
    if (this.props.takeFocus){
      this.refs.messageBody.getDOMNode().focus();
    }
  },
  componentWillMount: function(){
    that = this;
    var opts = {
      ok: function(data){
        that.setState({id: data.id});
      },
      fail: function(data){
      }
    };
    app.api.medani.load(opts, '');
  },
  displayErrors: function(errors){
    this.setState({errors: errors});
  },
  render : function() {
    if( this.state.errors ){
      var errs = this.state.errors;
      if( errs.msg ){
        var message = errs.msg.message;
        var messageError =  <ErrorMsg msg={message}/>;
      }
    }
    return (
       <div>
        {messageError}
        <form id="composeMessage" method="post" onSubmit={this.submitMessage}>
          <h1>{i18n.messages.share.header}</h1>
          <div>{i18n.messages.share.sendto}</div>
          <div className="selected-users">
            {this.state.userNames}
          </div>
          <div>
            <input id="recipient" type="text" name="recipient" placeholder={i18n.messages.form.send_to_placeholder} onKeyUp={this.handleKeyUp} required/>
            <section className="user_options">
            {this.state.options}
          </section>
          </div>
          <div>{i18n.messages.share.message}</div>
          <div>
            <textarea id="messageBody" type="text" name="messageBody" ref="messageBody" onFocus={this.props.onFocus} placeholder={i18n.messages.share.placeholder} required/>
          </div>
          <input type="submit" value={i18n.messages.share.button}/>
        </form>
      </div>
    );
  }
});

var ConversationBox = React.createClass({
  getInitialState: function(){
    return {};
  },
  render: function(){
    if(this.props.thread.ref){
      var PreviewBox = <ReferenceBox thread={this.props.thread} /> ;
    }
    var conversationWith = <conversationWithBox recipients={this.props.thread.recipients} />
    var conversation = <MessagesBox threadId={this.props.thread._id} pollInterval={2000}/>
    return(
      <div className="posts">
        {conversationWith}
        {PreviewBox}
        {conversation}
      </div>
    )
  }
});

var MessagesBox = React.createClass({
  getInitialState: function() {
    return {messages: {}};
  },
  loadMessagesFromServer: function() {
    var opts = {
      ok: function(data){
        if(data){
          var sortedData=data.messages.reverse();
          this.setState({messages: <MessageList messages={sortedData} />});
        } else {
          this.setState({messages: <NoContent/>});
        }
      }.bind(this),
      fail: function(data){
        this.setState({messages: <NoContent/>});
      }.bind(this)
    };
      app.api.messages.load(this.props.threadId, opts);
  },
  handleSubmit: function(reply) {
    var opts = {
      form:{ 
        message: reply
        },
      ok: function(data) {
        if(data){
          var sortedData=data.messages.reverse();
          this.setState({messages: <MessageList messages={sortedData} />});
        } else {
          this.setState({messages: <NoContent/>});
        }
      }.bind(this),
      fail: function(data){
        this.setState({messages: <NoContent/>});
      }.bind(this)
    };
    console.log(this.props.threadId);
      app.api.messages.saveReply(this.props.threadId, opts);
  },
  componentWillMount: function() {
    this.loadMessagesFromServer();
    setInterval(this.loadMessagesFromServer, this.props.pollInterval);
  },
  render: function() {
    return (
      <div className="messageBox">
        <h3>Messages</h3>
        {this.state.messages}
        <MessageForm onMessageSubmit={this.handleSubmit}/>
      </div>
    );
  }
});

var MessageForm = React.createClass({
  getInitialState: function(){
    return {};
  },
  displayErrors: function(errors){
    this.setState({errors: errors});
  },
  submitMessage: function(){
    var messageBody = this.refs.messageBody.getDOMNode();
    var text = messageBody.value.trim();
    if (text != null && text.length != 0) {
      if (text.length > 1000) {
        this.displayErrors({msg:{code:'not_accepted', message: i18n.messages.share.limit}});
      } else {
        this.props.onMessageSubmit({messageBody:text});
        this.refs.messageBody.getDOMNode().value='';
      }
    }
    return false;
  },
  componentDidMount : function() {
    var inputValue = this.refs.messageBody.getDOMNode();
    if (this.props.takeFocus){
      this.refs.messageBody.getDOMNode().focus();
    }
  },
  render: function() {
    if( this.state.errors ){
      var errs = this.state.errors;
      if( errs.msg ){
        var message = errs.msg.message;
        var messageError =  <ErrorMsg msg={message}/>;
      }
    }
    return (
      <div>
        {messageError}
        <form id="messageForm" method="post" onSubmit={this.submitMessage}>
          <div>
            <input id="messageBody" type="text" name="messageBody" ref="messageBody" onFocus={this.props.onFocus} placeholder={i18n.messages.share.placeholder} required/>
          </div>
          <input type="submit" value={i18n.messages.share.button}/>
        </form>
      </div>
    );
  }
});

var MessageList = React.createClass({
  render: function() {
    var messageNodes = this.props.messages.map(function (message) {
      return <Message key={message._id} message={message} />;
    });
    return (
      <div className="messageList">
        {messageNodes}
      </div>
    );
  }
});

var Message = React.createClass({
  render: function() {
    var date = (this.props.message.timestamp) ? <RelativeDate date={$.parseDate(this.props.message.timestamp)} /> : null;
    var avatar = (this.props.message.sender.avatar) ? <Avatar avatar={this.props.message.sender.avatar} size="small"/> : null;
    var messageCss="reciever";
    if(this.props.message.isSender){
      var messageCss="sender";
    }
    return (
      <div className={messageCss}>
      <div className="senderDetails">
        {avatar}
        <span>{this.props.message.sender.displayName}</span>
      </div>
      <div className="timeAgo">
        {date}
      </div>
        {this.props.message.messageBody}
      </div>
    );
  }
});

var ReferenceBox = React.createClass({
  getInitialState: function(){
    return {};
  },
  componentWillMount: function(){
    var that = this;
    var opts = {
      ok: function(data){
        if(data){
          that.setState({content: <ReferencePreviewBox item={data} />});
        } else {
          that.setState({content: <NoContent/>});
        }
      },
      fail: function(data){
        that.setState({content: <NoContent/>});
      }
    };
    if(this.props.thread.ref.type == 'article'){
      app.api.articles.load(this.props.thread.ref.uri, opts);
    }else if(this.props.thread.ref.type == 'event'){
      app.api.events.load(this.props.thread.ref.uri, opts);
    };
  },
  render: function(){
   return(
      <div className="posts">
        {this.state.content}
      </div>
    )
  }
});

var ReferencePreviewBox = React.createClass({
  render:function(){
    return (
      <section id="articles">
       <PreviewBox key={this.props.item.id} item={this.props.item} />
      </section>
    );
  }
});

var conversationWithBox = React.createClass({
  render:function(){
    if ((this.props.recipients).length == 1){
      var converation_display = (i18n.messages.conversation.conversation_with) + ' ' + this.props.recipients[0].displayName;
    }
    if ((this.props.recipients).length == 2){
      var converation_display = (i18n.messages.conversation.conversation_with) + ' ' + this.props.recipients[0].displayName 
                                + ' ' + (i18n.messages.conversation.conversation_glue)
                                + ' ' + this.props.recipients[1].displayName;
    }
    if ((this.props.recipients).length > 2){
      var converation_display = (i18n.messages.conversation.conversation_with) + ' ' + this.props.recipients[0].displayName 
                                + ', ' + this.props.recipients[1].displayName
                                + ' ' + (i18n.messages.conversation.conversation_glue)
                                + ' ' + (i18n.messages.conversation.conversation_other);
    }
    return (
      <div className="recipients">
       {converation_display}
      </div>
    );
  }
});

var ShareMessage = React.createClass({
	render: function(){
		return (
			<div className="message-layout">
			<ShareMedaniUser user={this.props.user} toId={this.props.recipientId}/>
			</div>
		)
	}
});

var ShareMedaniUser = React.createClass({
	mixins:[React.addons.LinkedStateMixin],
	getInitialState: function(){
    return {};
  },
  processing: function(){
    this.setState({active:true});
  },
  finished: function(){
    this.setState({active:false});
  },
  displayErrors: function(errors){
    this.setState({errors: errors});
  },
	doShareMessage: function(){
		if( this.state.messageBody.length > 1000 ){
    	this.displayErrors({msg:{code:'not_accepted', message: i18n.messages.share.limit}});
    	return false;
    }
		var that = this;
		var initiatorId = this.props.user.id;
		var recipient = this.props.toId;
    var opts = {
    	form: {
	    	initiatorId: initiatorId,
	      recipients: [{"id": recipient}],
	      language: app.language,
	      message: {
	      	messageBody: this.state.messageBody,
	      	senderId: initiatorId
	    	}
      },
    	ok: function(data){
        var param = { name:'id', value: recipient}; 
        var params = {};
        params.param = param;
        app.routes.profile.go(params);
    	},
    	fail: function(data){
    		that.props.callback(that.props.displayName);
    	}
    };
    app.api.messages.shareMessage(opts);
    return false;
	},
	render: function(){
		if( this.state.errors ){
			var errs = this.state.errors;
			if( errs.msg ){
    	  var message = errs.msg.message;
	      var messageError =  <ErrorMsg msg={message}/>;
    	}
		}

		return (
			<div id="message-share" className="hasProcessing">
			{messageError}
				<form id="shareMessage" method="post" onSubmit={this.doShareMessage}>
					<h1>{i18n.messages.share.header}</h1>
					<div>{i18n.messages.share.sendto}</div>
					<div className="recipient-id">
            <RecipientUsername id={this.props.toId}/>
					</div>
					<div>{i18n.messages.share.message}</div>
					<div>
						<textarea id="messageBody" type="text" name="messageBody" valueLink={this.linkState('messageBody')} placeholder={i18n.messages.share.placeholder} required/>
					</div>
					<input type="submit" value={i18n.messages.share.button}/>
				</form>
			</div>
		)
	}
});

var RecipientUsername = React.createClass({
  getInitialState: function(){
    return {follows: []};
  },
  componentWillMount: function(){
    that = this;
    var opts = {
      ok: function(data){
        that.setState({recUsername: data.displayName});
      },
      fail: function(data){
      }
    };
    app.api.medani.load(opts, this.props.id);
  },
  render: function() {
    return (
      <div>{this.state.recUsername}</div>
    )
  }
});

var ShareArticle = React.createClass({
  mixins:[React.addons.LinkedStateMixin],
  getInitialState: function(){
    return {follows: '', options: '', recipients: [], userName: [], userNames: []};
  },
  componentWillMount: function(){
    that = this;
    var opts = {
      ok: function(data){
        that.setState({id: data.id});
      },
      fail: function(data){
      }
    };
    app.api.medani.load(opts, '');
  },
  displayErrors: function(errors){
    this.setState({errors: errors});
  },
  handleClick: function(ev){
    that = this;
    var item = ev.target.value;
    var l = this.state.recipients.length;
    var yes = false;
    if(l > 0){
      for (i in this.state.recipients)
      if(this.state.recipients[i].id == item._id){
        yes = true;
        break;
      }
    }
    if(!yes) {
      this.state.userName.push(item);
      this.state.recipients.push({id: item._id});
      that.setState({userName: this.state.userName});
      var op = '';
      var op = this.state.userName.map(function(item, i) {
        return (
          <div value={item._id} onClick={that.removeUser}>
            {item.displayName},
          </div>
        );
      }.bind(this));
      that.setState({userNames: op});
    }
  },
  removeUser: function(em){
    var rec = [];
    var name = [];
    that = this;
    for(prop in this.state.recipients){
      if(this.state.recipients[prop].id != em.currentTarget.attributes[1].value){
        rec.push(this.state.recipients[prop]);
        name.push(this.state.userName[prop]);
      }
    }
    var op = '';
    var op = name.map(function(item, i) {
      return (
        <div value={item._id} onClick={that.removeUser}>
          {item.displayName},
        </div>
      );
    }.bind(this));
    that.setState({recipients: rec});
    that.setState({userName: name});
    that.setState({userNames: op});
  },
  handleKeyUp: function(e) {
    that = this;
    var q = e.target.value;
    if(q && q.length > 2) {
      var opts = {
      form: {
        userString: q
        },
      ok: function(data){
        if(data) {
          var option = '';
          var value = '';
          var name = '';
          var len = data.length;
          var option = data.map(function(item, i) {
            return (
              <div value={item} onClick={that.handleClick}>
                {item.displayName}
              </div>
            );
          }.bind(this));
        }
        that.setState({options: option});
      },
      fail: function(data){
        console.log(data);
      }
      };
    app.api.messages.searchUser(opts);
    }
  },
  doShareArticle: function(){
    if(this.state.recipients.length == 0) {
      this.displayErrors({msg:{code:'not_accepted', message: i18n.messages.share.addRecipient}});
      return false;
    }
    if( this.state.messageBody.length > 1000 ){
      this.displayErrors({msg:{code:'not_accepted', message: i18n.messages.share.limit}});
      return false;
    }
    var that = this;
    var initiatorId = this.state.id;
    var recipient = this.state.recipients;
    var articleId = this.props.data.id;
    var opts = {
      form: {
        ref: {
          "type": "article",
          "uri": this.props.data.id,
          "displayName": this.props.data.title,
          "language": app.language
        },
        initiatorId: initiatorId,
        recipients: recipient,
        language: app.language,
        message: {
          messageBody: this.state.messageBody,
          senderId: initiatorId
        }
      },
      ok: function(data){
        if(data) {
          var param = { name:'id', value: articleId}; 
          var params = {};
          params.param = param;
          app.routes.article.go(params);
        }
      },
      fail: function(data){
      }
    };
    app.api.messages.shareMessage(opts);
    return false;
  },
  render: function(){
      if( this.state.errors ){
      var errs = this.state.errors;
      if( errs.msg ){
        var message = errs.msg.message;
        var messageError =  <ErrorMsg msg={message}/>;
      }
    }
    return (
      <div id="article-share" className="hasProcessing">
      {messageError}
        <form id="shareArticle" method="post" onSubmit={this.doShareArticle}>
          <h1>{i18n.messages.article_share}</h1>
          <div>
          	<div className="article-title">{this.props.data.title}</div>
          	<div className="article-text">{this.props.data.summary}</div>
          </div>
          <div>{i18n.messages.form.recipients}</div>
          <div className="selected-users">
            {this.state.userNames}
          </div>
          <div>
            <input type="text" id="recipients" placeholder={i18n.messages.form.send_to_placeholder} onKeyUp={this.handleKeyUp} />
          </div>
          <section className="user_options">
            {this.state.options}
          </section>
          <div>{i18n.messages.share.message}</div>
          <div>
            <textarea type="text" name="messageBody" valueLink={this.linkState('messageBody')} placeholder={i18n.messages.share.placeholder} required/>
          </div>
          <input type="submit" value={i18n.messages.form.send_button}/>
        </form>
      </div>
    )
  }
});

var ErrorMsg = React.createClass({
  render:function(){
    return (
      <div className="error">
        {this.props.msg}
      </div>
    );
  }
});


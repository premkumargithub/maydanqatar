/** @jsx React.DOM */

var anon = {
  displayName : "",
  imageURL : ""
};

var api = {
  loadForum: function(opts) {
    app.api.comments.load(opts);
  },
  submitReply : function (opts) {
    var comments = opts.forum.comments;
    var comment = opts.comment;
    var parentComment = opts.parentComment;
    parentComment.replies.push(comment);
    app.api.comments.reply({
      forumURL: opts.forum.url,
      commentId: parentComment._id,
      reply: comment ,
      success: opts.success,
      error: opts.error
    });
  },
  submitComment : function (opts) {
    var comments = opts.forum.comments;
    var comment = opts.comment;
    comments.splice(0,0,comment);
    app.api.comments.add({
      forumURL: opts.forum.url,
      comment: comment,
      success: opts.success,
      error: opts.error
    });
  },
  submit: function(opts) {
    if (opts.parentComment) {
      this.submitReply(opts);
    }else {
      this.submitComment(opts);
    }
  }
};

var UserBox = React.createClass({
  handleClick: function(){
    app.routes.profile.go([{ name:'id', value:this.props.user.id }]);
  },
  render : function() {
    if (this.props.user === null || this.props.user === anon){
      return (
        <div className="user"></div>
      );
    } else {
      var date = (this.props.date) ? <div><RelativeDate date={this.props.date} /></div> : null;
      return (
        <div className="user link" onClick={this.handleClick}>
          <Avatar avatar={this.props.user.avatar} size="small"/>
          <span>{this.props.user.displayName}</span>
          {date}
        </div>
      );
    }
  }
});


var CommentControls =  React.createClass({
	render: function() {
		if (this.props.data) {
		  var controls = {};
		  $(this.props.data).each(function (button, index) {
        controls['_'+index] = (
          <Button
            css={button.className}
            action={button.onClick}
            text={button.text}
            icon={button.icon}/>
        );
      });
      return (
        <div className="commentControls">
          {controls}
        </div>
      );
    } else {
      return <div className="commentControls"/>
    }
  }
});


var CommentSpan =  React.createClass({
	readMore : function() {
		var span = this.refs.span.getDOMNode();
		span.innerHTML = this.props.comment.text;
		var readmore = this.refs.readmore.getDOMNode();
		readmore.style.display = 'none';
	},
	render: function() {
		var readMoreStyle = { display : 'none' };
		return (
		  <div>
				<span className="multiline" ref="span">{this.props.comment.text}</span>
				<button onClick={this.readMore} style={readMoreStyle} ref="readmore">{i18n.forum.readmore}</button>
				<CommentControls data={this.props.controls} />
			</div>
		);
	},
	componentDidMount : function() {
		if (this.props.comment.text.length > 200) {
			var span = this.refs.span.getDOMNode();
			span.innerHTML = this.props.comment.text.substr(0, 200) + "...";
			var readmore = this.refs.readmore.getDOMNode();
			readmore.style.display = '';
		}	
	}
});

var SimpleComment = React.createClass({
  getInitialState: function(){
    return {
      hearted: this.props.comment.hearted,
      hearts: this.props.comment.hearts
    };
  },
  handleHeartClick: function(){
    this.props.onHeartClick({
      user: this.props.comment.user,
      commentId: this.props.comment._id,
      hearted: this.state.hearted,
      ok: (this.state.hearted) ? this.handleUnhearted : this.handleHearted,
      fail: console.log
    });
  },
  handleUnhearted: function(data){
    this.setState({
      hearted: false,
      hearts: data.score
    });
  },
  handleHearted: function(data){
    this.setState({
      hearted: true,
      hearts: data.score
    });
  },
	render: function() {
		var short = window.__mode.size === 'large' ? false : true;
		return (
      <div className="simplecomment">
        <UserBox user={this.props.comment.user} date={this.props.comment.timestamp} />
        <CommentSpan comment={this.props.comment} controls={this.props.controls} />
        <Hearts
          count={this.state.hearts}
          short={short}
          hearted={this.state.hearted}
          onHeartClick={this.handleHeartClick}/>
      </div>
    );
 	}
});

var Reply =  React.createClass({
	render: function() {
		return (
      <div className="reply">
        <SimpleComment
          comment={this.props.comment}
          onHeartClick={this.props.onHeartClick}/>
      </div>
	  );
  }
});

var ReplyList  = React.createClass({
	render: function() {
		var replies = {};
		var that = this;
		if (this.props.comment.replies) {
			$(this.props.comment.replies).each(function (reply, index) {
        replies[reply._id] = (
          <Reply
            comment={reply}
            onHeartClick={that.props.onHeartClick} />
        );
      });
		}
		var replyBox = undefined;
		if (this.props.showReplyBox){
		  replyBox = (
		    <div key="form" style={this.props.replyStyle}>
          <CommentForm
            comment={this.props.comment}
            onCommentSubmit={this.props.onReply}
            takeFocus={true} />
        </div>
      );
		}
		return (
		  <div className="replies" >
        {replies}
        {replyBox}
      </div>
    );
	}
});

var Comment = React.createClass({
  getInitialState: function(){
    return {
      showReply: false
    };
  },
	handleReply: function() {
    this.setState({
      showReply: !this.state.showReply
    });
	},
	render: function() {
		var controls = [{
		  text : i18n.forum.reply,
		  onClick: this.handleReply,
		  className: 'reply_button',
		  icon: 'ic icon-reply' },
    ];
		return (
      <div className="comment">
        <SimpleComment
          comment={this.props.comment}
          onHeartClick={this.props.onHeartClick}
          controls={controls} />
        <ReplyList
          comment={this.props.comment}
          onReply={this.props.onReply}
          showReplyBox={this.state.showReply}
          onHeartClick={this.props.onHeartClick}/>
      </div>
    );
	}
});


var CommentList = React.createClass({
  handleHeartClick:function(opts){
    var payload = {
      recipient: opts.user,
      context: this.props.context,
      target: {
        type: 'comment',
        uri: opts.commentId,
        displayName: '',
        language: app.language
      }
    };
    if (opts.hearted){
      app.api.heart_remove({
        payload: payload,
        ok: opts.ok,
        fail: opts.fail
      });
    } else {
      app.api.heart_add({
        payload: payload,
        ok: opts.ok,
        fail: opts.fail
      });
    }
  },
  render: function() {
    var that = this;
    var comments = {};
    this.props.data.each(function (comment, index) {
      comments[comment._id] = (
        <Comment
          comment={comment}
          onReply={that.props.onReply}
          onHeartClick={that.handleHeartClick}/>
      );
    });
    return <div className="commentList">{comments}</div>;
  }
});


var CommentBox = React.createClass({
  loadCommentsFromServer: function() {
    var that = this;
	  api.loadForum({
		  forumURL: that.props.url, 
		  success : function(data) {
			  that.setState({ data: data });
		  }
	  });
  },
  handleSubmit: function(data) {
	  var that = this;
	  api.submit({
		  forum: this.state.data, 
		  parentComment : data.parentComment,
		  comment : {
		    text: data.text,
		    user: data.user
		  },
		  success : function(data) {
		    if (/iP(hone|od|ad)/.test(navigator.platform)) {
          // trigger css refresh to avoid stupid iOS webview bug
          // see jira issue MQ-223
          window.location.reload();
        } else {
          that.setState({
            data: data
          });
		    }
		  },
		  error : function (err,statusText,req) {
		    if (/iP(hone|od|ad)/.test(navigator.platform)) {
          // trigger css refresh to avoid stupid iOS webview bug
          // see jira issue MQ-223
          window.location.reload();
        }
	      console.log(err);
		  }
	  });
  },
  getInitialState: function() {
    return {data: null};
  },
  componentWillMount: function() {
	  this.loadCommentsFromServer();
  },
  componentWillUnmount: function() {
	  clearInterval(this.refreshIntervalId);
  },
  render: function() {
	  if (this.state.data == null)  {
		  return (
			  <div className="commentBox" ref="commentBox">
			 	  <h3>Comments</h3>
				  {i18n.forum.notavailable}
			  </div>
			);
	  } else { 
	    return (
	      <div className="commentBox" ref="commentBox">
	      	<h3>{i18n.content.comments}</h3>
	        <CommentForm
	          onCommentSubmit={this.handleSubmit}
	          takeFocus={false}/>
	        <CommentList
	          data={this.state.data.comments}
	          context={this.props.context}
	          onReply={this.handleSubmit} />
	      </div>
	    );
	  }
  }
});


/*
 * props.onCommentSubmit props.parentCommentId; optional used for replies
 */
var CommentTextAreaForm = React.createClass({
	change : function (e) {
	  var textArea = this.refs.text.getDOMNode();
    textArea.style.overflow = 'hidden';
    textArea.style.height = 0;
    textArea.style.height = textArea.scrollHeight + 'px';
	},
	submitComment: function(){
		var textArea = this.refs.text.getDOMNode();
		var text = textArea.value.trim();
		if (text != null && text.length != 0) {
			this.props.onSubmit(text);
      this.refs.text.getDOMNode().value='';
		}
    return false;
	},
	componentDidMount : function() {
		var textArea = this.refs.text.getDOMNode();
		textArea.style.resize = 'none';
    if (this.props.takeFocus){
      this.refs.text.getDOMNode().focus();
    }
	},
	render : function() {
		return (
			<form className="commentForm" onSubmit={this.submitComment} method="post">
        <textarea
          type="text"
          placeholder={this.props.placeholder}
          ref="text"
          onFocus={this.props.onFocus}
          onChange={this.change}/>
        <input className="light_button" type="submit" value={i18n.forum.submit}/>
      </form>
    );
	}
});


var CommentForm = React.createClass({
  isAuthenticated: function() {
		return app.authenticated;  
  },
  handleSubmit: function(text) {
    if (this.isAuthenticated()){
      this.props.onCommentSubmit({
        parentComment: this.props.comment,
        text: text,
        user: app.user
      });
    }
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
    var placeholder=i18n.forum.login;
    if( this.isAuthenticated() ){
    	placeholder=i18n.forum.saysomething;
    }
    return (
      <CommentTextAreaForm placeholder={placeholder} onSubmit={this.handleSubmit} onFocus={this.handleFocus} takeFocus={this.props.takeFocus} />
    );
  }
    
});

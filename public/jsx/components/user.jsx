/** @jsx React.DOM */

var LARGE_AVATAR = app.config.urls.image + '/i/avatar-large.png';
var SMALL_AVATAR = app.config.urls.image + '/i/avatar.png';

var UserProfile = React.createClass({
	render: function(){
		var message = this.props.me ? undefined : <UserMessage id={this.props.id}/>;
		var avatarClick = this.props.me ? this.props.uploadAvatar : null;
		return (
		  <div className="profile">
		    <Avatar key={this.props.avatar} avatar={this.props.avatar} size="large" select={avatarClick}/>
		    {message}
		    <EditableUserName displayName={this.props.displayName} followable={!this.props.me} callback={this.props.onNameChanged}/>
		    <UserAbout name={this.props.displayName} about={this.props.about} editable={this.props.me} callback={this.props.onAboutChanged}/>
		  </div>
		);
	}
});

var Avatar = React.createClass({
	click: function(){
		if(this.props.select){
			this.props.select(this.props.avatar);
		}
	},
  render:function(){
    var placeholder = (this.props.size === 'large') ? LARGE_AVATAR : SMALL_AVATAR;
    var clzz = this.props.selected ? "avatar selected" : "avatar";
    return (
      <div className={clzz} onClick={this.click}>
        <Image
        	key={this.props.avatar}
          src={this.props.avatar}
          placeholder={placeholder} />
      </div>
    );
  }
});

var EditableUserName = React.createClass({
	getInitialState: function(){
		return {editing:false};
	},
	componentWillReceiveProps: function(){
		this.setState({editing:false});
	},
	edit: function(){
		this.setState({editing:true});
	},
	saveDisplayName: function(text){
		var that = this;
    var opts = {
      form: {
        displayName: text
      },
      ok: function(data){
      	that.props.callback(data.displayName);
      },
      fail: function(data){
      	that.props.callback(that.props.displayName)
      }
    };
    app.api.profile.displayName.post(opts);
    return false;
	},
	render: function(){
		var username = this.state.editing ? 
			<UserNameForm initialUsername={this.props.displayName} post={this.saveDisplayName}/> : 
				<UserName username={this.props.displayName}/>
		var follow = this.props.followable ? (
			<span className="link follow off" onClick={this.props.follow}>
          <i className="ic icon-plus"/>
          <span>{i18n.medani.profile.follow}</span>
        </span>
			) : undefined;
		var edit = !this.props.followable && !this.state.editing ?	( 
				<span className="link" onClick={this.edit}>
				{i18n.common.edit}
				</span>
			) : undefined;
		return (
			<div className="username">
			  {username}
			  {edit}
			  {follow}
			</div>
		);
	}
})

var UserName = React.createClass({
	render: function(){
		return (
			<span className="tag user">{this.props.username}</span>
		);
	}
});

var UserNameForm = React.createClass({
	mixins: [React.addons.LinkedStateMixin],
	getInitialState: function(){
		return {username:this.props.initialUsername};
	},
	doPost: function(){
		this.props.post(this.state.username);
		return false;
	},
	render: function(){
		return (
			<form className="form" onSubmit={this.doPost} method="post">
        <input type="text" name="username" valueLink={this.linkState('username')} />
        <input className="light_button" type="submit" value={i18n.common.save}/>
      </form>
		)
	}
})

var UserMessage = React.createClass({
	render: function(){
		var params = [{name:'id', value: this.props.id}]; 
		return (
			<div className="options">
      	<Route route={app.routes.share_message} params={params}>
					<span className="light_button">{i18n.medani.profile.message}</span>
				</Route>
			</div>
		)
	}
});

var UserAbout = React.createClass({
	getInitialState: function(){
		return {editing:false};
	},
	componentWillReceiveProps: function(nextProps){
		this.setState({editing:false});
	},
	edit: function(){
		this.setState({editing:true});
	},
	saveAbout: function(text){
		var that = this;
    var opts = {
      form: {
        about: text
      },
      ok: function(data){
      	that.props.callback(data.about);
      },
      fail: function(data){
      	that.props.callback(that.props.about);
      }
    };
    app.api.profile.about.post(opts);
    return false;
	},
	render: function(){
		var edit;
		var about; 
		if( this.props.editable && this.state.editing ){
			edit = undefined;
			about = <AboutForm initialAbout={this.props.about} post={this.saveAbout}/>;
		} else {
			if( this.props.editable ){
			  edit = <span className="link" onClick={this.edit}>{i18n.common.edit}</span>;
			}
			else edit = undefined;
			about = <AboutBody text={this.props.about}/>;
		}
	  return (
	    <div className="about">
	      <div className="heading">
	        <h3>{i18n.medani.profile.about} {this.props.name}</h3>
	        {edit}
	      </div>
	      {about}
	    </div>
    );
	}
});

var AboutBody = React.createClass({
	render: function(){
		return (
			<div className="text multiline">
        {this.props.text}
      </div>
		)
	}
});

var AboutForm = React.createClass({
	mixins: [React.addons.LinkedStateMixin],
	getInitialState: function(){
		return {about:this.props.initialAbout};
	},
	doPost: function(){
		this.props.post(this.state.about);
		return false;
	},
	render: function(){
		return (
			<form className="form" onSubmit={this.doPost} method="post">
        <textarea type="text" name="about" valueLink={this.linkState('about')} />
        <input className="light_button" type="submit" value={i18n.common.save}/>
      </form>
		)
	}
});

var AvatarSelection = React.createClass({
	getInitialState: function(){
		return {selected:this.props.initialSelection, myAvatars:[]};
	},
	selectSystemAvatar: function(url){
		this.setState({selected: url});
	},
	submitSelection: function(){
		var that = this;
    var opts = {
    	form: {avatar: this.state.selected},
    	ok: function(data){
    		that.props.onSelection(data.avatar);
    	},
    	fail: function(data){
    	} 
    };
    app.api.profile.avatar.system(opts);
    return false;
	},
	submitFile:function() {
    var that = this;
    var formElement = document.getElementById("avatarForm");
    var form = new FormData(formElement);
    var opts = {
    	form: form,
    	ok: function(data){
    		that.props.onSelection(data.avatar);
    	},
    	fail: function(data){
    	} 
    };
    app.api.profile.avatar.upload(opts);
    return false;
  },
  componentWillMount: function(){
  	var that = this;
  	var opts = {
    	ok: function(data){
    		that.setState({myAvatars:data.avatars});
    	},
    	fail: function(data){
    	} 
    };
    app.api.profile.avatar.get(opts);
    return false;
  },
	render: function(){
		var systemAvatars = [];
		for( var i=0; i<this.state.myAvatars.length; i++){
			var url = this.state.myAvatars[i];
			var selected = url == this.state.selected ? true : false;
  	  systemAvatars.push(<Avatar key={url} avatar={url} selected={selected} select={this.selectSystemAvatar}/>);
	  }
		return (
			<div className="avatar-selection">
			  <div className="heading">
			    <h3>{i18n.medani.avatar.header}</h3>
			    <form id="avatarForm" className=" end-of-line upload-form" onSubmit={this.submitFile} method="post" >
			    <input type="file" className="file" onChange={this.submitFile} name="avatarUpload" id="avatarUpload"/>
			    <span className="fakefile">{i18n.common.browse}</span>
			    </form>
			  </div>
			  <div>
			    <form id="avatarSelection" method="post" onSubmit={this.submitSelection}>
			      <ul>
			        {systemAvatars}
			      </ul>
			      <div>
			        <input className="light_button" type="submit" value={i18n.common.select}/>
			        <span onClick={this.props.onCancel} className="link cancel light_button">{i18n.common.cancel}</span>
			      </div>
			    </form>
			  </div>
			</div>
		);
	}
});

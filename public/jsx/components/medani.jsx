/** @jsx React.DOM */
var Medani = React.createClass({
	getInitialState: function(){
		return {follows:[]};
	},
	avatarChanged: function(newAvatar){
		this.setState({avatarSelection:undefined, avatar:newAvatar});
	},
	displayNameChanged: function(newDisplayName){
		this.setState({displayName:newDisplayName});
	},
	aboutChanged: function(newAbout){
		this.setState({about: newAbout});
	},
	uploadAvatar: function(){
		var that = this;
	  var close = function(){
      that.setState({avatarSelection:undefined});
	  };
		if( window.__mode.size == 'small' ){
			this.setState({avatarSelection:<AvatarSelection onCancel={close} initialSelection={this.state.avatar} onSelection={this.avatarChanged}/>});
		} else {
      var vwd = 530;
      var h = 507;
      var c = window.innerWidth/2;
      var w = vwd/2;
  	  var dh = (window.innerHeight-h)/2  
    
      var style = {
        position:'absolute',
        height: h,
        width: vwd,
        top:dh,
        left: c-w,
        bottom:dh,
        right:c-w
      };
		  this.setState( {avatarSelection: (
        <LightBox style={style} close={close} hideCloseButton={true}>
          <AvatarSelection onCancel={close} initialSelection={this.state.avatar} onSelection={this.avatarChanged}/>
        </LightBox>
      )});
		}
	},
	componentWillMount: function(){
		var that = this;
    var opts = {
      ok: function(data){
      	if( data ){
          that.setState({
          	me: data.isCurrent,
          	email:data.email, 
          	about:data.about, 
          	displayName:data.displayName, 
          	avatar:data.avatar, 
          	follows:data.follows
          });
      	} else {
      	}
      },
      fail: function(data){
      }
    };
		app.api.medani.load(opts, this.props.id);
	},
	render: function(){
		return (
			<div className="medani">
				{this.state.avatarSelection}
			  <UserProfile me={this.state.me}
			  	id={this.props.id}
			  	displayName={this.state.displayName}
			  	avatar={this.state.avatar}
			  	about={this.state.about}
			  	onNameChanged={this.displayNameChanged} 
			  	onAboutChanged={this.aboutChanged}
			  	uploadAvatar={this.uploadAvatar}/>
			  <MedaniTags me={this.state.me} displayName={this.state.displayName} follows={this.state.follows}/>
			</div>
		);
	}
});

var MedaniTags = React.createClass({
	getInitialState: function(){
		return {all:false}
	},
	showAll: function(){
		this.setState({all:true});
	},
	hideAll: function(){
		this.setState({all:false});
	},
	render: function(){
		var length = this.state.all ? this.props.follows.length : (window.__mode.size == 'small' ? 8 : 8);
		var first = function(elem, index){
			return index < length;
		};
		var tags = (!this.props.follows) ? null:
      $(this.props.follows).filter(first).map(function(tag){
      	return <MedaniTag tag={tag}/>
      });
    var person = this.props.me ? 'first_person' : 'third_person';
    var see_all = (this.state.all || length >= this.props.follows.length) ? <span/> : <span className="link" onClick={this.showAll}>{i18n.common.see_all}</span>;
		return (
			<div className="tags">
			  <div className="heading">
			    <h3>{i18n.common.possessive_form(person, this.props.displayName, i18n.medani.tags)}</h3>
			    {see_all}
			  </div>
			  <div>
			    <ul className="tag-list">
			      {tags}
			    </ul>
			  </div>
			</div>
		);
	}
});

var MedaniTag = React.createClass({
  render: function(){
    return (
      <li className="link">
        <Tag key={this.props.tag.id} type={this.props.tag.type} tag={this.props.tag} />
        <Badge score={this.props.tag.score} crown={this.props.tag.crown} />
      </li>
    );
  }
});

var MedaniPosts = React.createClass({
	getInitialState: function(){
		return {};
	},
	componentWillMount: function(){
		/** TODO: fetch the user by id from properties  **/
		var that = this;
    var opts = {
      ok: function(data){
      	if( data.results && data.results.length > 0 ){
          that.setState({content: <PreviewBoxes data={data.results}/>});
      	} else {
      		that.setState({content: <NoContent/>});
      	}
      },
      fail: function(data){
      	that.setState({content: <NoContent/>});
      }
    };
		app.api.medani.posts(opts);
	},
	render: function(){
		var person = this.props.me ? 'first_person' : 'third_person';
		return(
			<div className="posts">
			  <div className="heading">
			    <h3>{i18n.common.possessive_form(person, this.props.displayName, i18n.medani.posts)}</h3>
			    <span>{i18n.common.see_all}</span>
			  </div>
			  {this.state.content}
			</div>
		)
	}
});

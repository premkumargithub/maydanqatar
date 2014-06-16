/** @jsx React.DOM */

var tagToParams = function(tag){
  return [{
    name:'id', value: tag.id
  }, {
    name:'type', value: (tag.scheme || tag.type)
  }, {
    name:'label', value: tag.label
  }];
};

var Tags = React.createClass({
  map:function(tags, type){
    var result = {};
    if (tags) {
      $(tags).each(function(tag){
        result[tag.id] = (<Tag type={type} tag={tag} />);
      });
    }
    return result;
  },
	render:function(){
		var venue = (this.props.venue) ? <Tag key={this.props.venue.id} type="venue" tag={this.props.venue} /> : undefined;
		var special = this.map(this.props.special, 'special');
    var source = this.map(this.props.source, 'source');
    var topic = this.map(this.props.topic, 'topic');
		return (
			<div className="tags">
				<div key="venue" className="venue">{venue}</div>
			  <div key="special" className="special">{special}</div>
			  <div key="source" className="source">{source}</div>
			  <div key="topic" className="topic">{topic}</div>
			</div>
		);
	}
});


var Tag = React.createClass({
	render:function(){
		var css = "tag link " + (this.props.tag.scheme || this.props.tag.type);
		var params = tagToParams(this.props.tag);
		return (
      <Route css={css} route={app.routes.tag_content} params={params} inactive={this.props.inactive}>
        <span>{this.props.tag.label}</span>
      </Route>
		);
	}
});

var Follow = React.createClass({
  render:function(){
    return (
      <span className="link follow off" onClick={this.props.follow}>
        <i className="ic icon-plus"/>
        <span>{i18n.content.follow}</span>
      </span>
    );
  }
});

var Unfollow = React.createClass({
  render:function(){
    return (
      <span className="link follow on" onClick={this.props.unfollow}>
        <i className="ic icon-minus"/>
        <span>{i18n.content.unfollow}</span>
      </span>
    );
  }
});

var FollowUnfollow = React.createClass({
  getInitialState:function(){
    return {
      following:this.props.following
    };
  },
  handleClick:function(ev){
    if (this.state.following){
      this.unfollow();
    } else {
      this.follow();
    }
  },
  follow:function(){
    var that = this;
    app.api.tags.follow(this.props.tag, {
      type:'POST',
      ok: function(data){
        that.setState({ following:true });
      },
      fail: function(data, msg){
        console.log(msg);
        // todo: show something to the user
      }
    });
  },
  unfollow:function(){
    var that = this;
    app.api.tags.unfollow(this.props.tag, {
      type:'POST',
      ok: function(data){
        that.setState({ following:false });
      },
      fail: function(data, msg){
        console.log(msg);
        // todo: show something to the user
      }
    });
  },
  componentWillMount:function(){
    var that = this;
    app.api.tags.following(this.props.tag, {
      ok: function(data){
        that.setState({ following: data.following });
      }
    });
  },
  render:function(){
    return (this.state.following) ?
      <Unfollow unfollow={this.handleClick}/>:
      <Follow follow={this.handleClick}/>;
  }
});

var TagListEntry = React.createClass({
  getInitialState:function(){
    return {
      following: (this.props.following || false)
    };
  },
  handleClick:function(){
    if (this.state.following){
      this.unfollow();
    } else {
      this.follow();
    }
  },
  follow:function(){
    var that = this;
    app.api.tags.follow(this.props.tag, {
      type:'POST',
      ok: function(data){
        that.setState({ following:true });
      },
      fail: function(data, msg){
        console.log(msg);
        // todo: show something to the user
      }
    });
  },
  unfollow:function(){
    var that = this;
    app.api.tags.unfollow(this.props.tag, {
      type:'POST',
      ok: function(data){
        that.setState({ following:false });
      },
      fail: function(data, msg){
        console.log(msg);
        // todo: show something to the user
      }
    });
  },
  componentWillMount:function(){
    var that = this;
    app.api.tags.following(this.props.tag, {
      ok: function(data){
        that.setState({ following: data.following });
      }
    });
  },
  render:function(){
    // todo: would be nicer to use props, and have Followed and Unfollowed variants
    var maybe_follow = (this.state.following) ? <Unfollow /> : <Follow />;
    return (
      <li className="link" onClick={this.handleClick}>
        <Tag type={this.props.type} tag={this.props.tag} inactive={true}/>
        {maybe_follow}
      </li>
    );
  }
});

var TagList = React.createClass({
  render:function(){
    var result = {};
    var push = function(tags, type){
      if (tags) {
        $(tags).each(function(tag){
          result[tag.id] = (<TagListEntry type={type} tag={tag} />);
        });
      }
    }
    push(this.props.tags, this.props.type);
    return (
      <ul className="tag-list">
        {result}
      </ul>
    );
  }
});
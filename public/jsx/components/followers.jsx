/** @jsx React.DOM */

var CROWNS = [ 'gold', 'silver', 'bronze'];

var Badge = React.createClass({
  render:function(){
    var icon = 'ic icon-' + ((this.props.crown === 'heart') ? 'heart ' : 'crown ') + this.props.crown;
    return (
      <span className={this.props.crown}>
        <i className={icon}/>
        <span>{this.props.score}</span>
      </span>
    );
  }
});

var Follower = React.createClass({
  handleClick:function(){
    app.routes.profile.go([{ name:'id', value:this.props.user.id }]);
  },
  render:function(){
    return (
      <div className="follower">
        <span className="user link" onClick={this.handleClick}>
          <Avatar avatar={this.props.user.avatar}/>
          <span>{this.props.user.displayName}</span>
        </span>
        <Badge score={this.props.score} crown={this.props.crown}/>
      </div>
    );
  }
});

var Followers = React.createClass({
  render:function(){
    var adapter = function(follower){
      crown = (follower.__index < 4) ? CROWNS[follower.__index-1] : 'heart';
      return (
        <Follower
          key={follower.user.id}
          user={follower.user}
          score={follower.score}
          crown={crown}/>
      );
    };
    return (
      <InfiniteScroller
        key={'_' + Date.now()}
        id="followers"
        adapter={adapter}
        cursor={this.props.cursor} />
    );
  }
});
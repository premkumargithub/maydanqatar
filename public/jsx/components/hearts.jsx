/** @jsx React.DOM */
var Hearts = React.createClass({
  render:function(){
    var icon = this.props.hearted ? "ic icon-heart" : "ic icon-heart-outline";
    var likes = (this.props.short) ? this.props.count : i18n.forum.likes(this.props.count);
    return (
      <span className="hearts">
        <a className="link" onClick={this.props.onHeartClick}><i className={icon}/></a>
        <span>{likes}</span>
      </span>
    );
  }
});
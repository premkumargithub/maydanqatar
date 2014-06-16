/** @jsx React.DOM */
var Route = React.createClass({
	handleClick:function(ev){
	  window.location = this.props.route.toString(this.props.params);
	  ev.preventDefault();
    return false;
	},
	render:function(){
	  var css = (this.props.css) ? "link " + this.props.css : "link";
		return (<span className={css} onClick={this.props.inactive ? null : this.handleClick}>{this.props.children}</span>);
	}
});
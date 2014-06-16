/** @jsx React.DOM */

var Video = React.createClass({
	render: function(){
	  var src = '/video/';
	  src += encodeURIComponent(this.props.url);
	  src += '/';
	  src += encodeURIComponent(this.props.thumbnail);
	  src += '/';
	  if (this.props.aspectw)
	    src += this.props.aspectw + '/';
	  if (this.props.aspecth)
	    src += this.props.aspecth + '/';
	  var style = {
	    border:'none',
	    width: '100%',
	    minHeight: '100%'
	  };
		return ( 
			<iframe style={style} className="video" src={src} />
		);
	}
});
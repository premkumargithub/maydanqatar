/** @jsx React.DOM */
var LightBox = React.createClass({
  handleClose:function(){
    this.props.close();
  },
  preventClose:function(e){
  	e.stopPropagation();
  },
  render:function(){
    var glasspanel = {
      position:'fixed',
      left:0,
      right:0,
      top:0,
      bottom:0,
      zIndex:1000
    };
    var lightbox = this.props.style || {};
    lightbox.zIndex = 1001;
    
    var close = this.props.hideCloseButton ? undefined : 
      (<div className="link close" onClick={this.handleClose}>
        <div className="clx">
          <div className="x"/>
        </div>
      </div>);

    return (
      <div style={glasspanel} className="glasspanel" onClick={this.handleClose}>
        <div style={lightbox} className="lightbox" onClick={this.preventClose}>
          {close}
          {this.props.children}
        </div>
      </div>
    );
  }
});
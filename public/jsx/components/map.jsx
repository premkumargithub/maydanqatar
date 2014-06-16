/** @jsx React.DOM */

var Map = React.createClass({
  render:function(){
    var style = {
      border:'none'
    };
    var src = '/map/' + this.props.location.geo.lat + '/' + this.props.location.geo.lon + '/' + encodeURIComponent(this.props.location.label) + '/';
    return <iframe style={style} className="map" src={src} />
  }
});

/** @jsx React.DOM */
var ShareBox = React.createClass({
  loadSharers : function() {
    var that = this;
    app.api.share.load({
      success : function(data) {
        that.setState({ data: data });
      }
    });
  },
  getInitialState: function() {
    return {data: []};
  },
  componentWillMount: function() {
    this.loadSharers();
  },
	render:function(){
    var url = this.props.url;
    var text = this.props.text;
    var title = (this.props.type === 'article') ?
    i18n.content.share.article : i18n.content.share.event;

    var u = encodeURIComponent(url),
        t = encodeURIComponent(text),
        t_140 = encodeURIComponent(text.substring(0, 130));

    var socialNodes = this.state.data.map(function (network, index) {
      var href = network.url.replace('|u|',u).replace('|t|',t).replace('|t_140|',t);
      var className = "social-" + network.name;
      var icon = 'ic ' + network.icon;
      return (

        <li key={'_'+index} className={className}>
          <a href={href} target='_blank'><i className={icon}/>{network.label}</a>
        </li>
      )
    });

    var maydanNode = <MedanShareNode articleId={this.props.id}/>;

		return (
			<div ref="sharers" className="share widget">
			  <h3>{title}</h3>
			  <ul className="social">
			  {socialNodes}
        {maydanNode}
			  </ul>
			</div>
		);
	}
});

var MedanShareNode = React.createClass({
  render: function(){
    var params = [{name:'id', value: this.props.articleId}]; 
    return (
      <li className="social-maydan">
        <Route route={app.routes.share_to_user} params={params}>
          <span className="maydan_button">{i18n.messages.article_share}</span>
        </Route>
      </li>
    )
  }
});

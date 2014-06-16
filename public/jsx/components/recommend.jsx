/** @jsx React.DOM */
var Recommendations = React.createClass({
	getInitialState: function(){
		return {content: <div/>};
	},
	componentWillMount: function(){
		/*Ajax request the data and set in state*/
		var that = this;
    var opts = {
      ok: function(data){
      	if( data.results && data.results.length > 0 ){
          that.setState({content: <RecommendationsBox recommended={data.results}/>});
      	} else {
      		that.setState({content: <div/>})
      	}
      },
      fail: function(data){
      	that.setState({content: <div/>});
      }
    };
		app.api.articles.recommended(this.props.id, opts);
	},
	render:function(){
		return this.state.content;
	}
});

var RecommendationsBox = React.createClass({
	render: function(){
		return (
			<div className="recommendations widget">
				<h3>{i18n.content.recommended.header}</h3>
				<PreviewBoxes data={this.props.recommended}/>
			</div>
		);
	}
});
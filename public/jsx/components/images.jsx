/** @jsx React.DOM */

var PLACEHOLDER_IMG = app.config.urls.image + '/i/placeholder.png';

var Image = React.createClass({

	getInitialState:function(){
		return {
			src: this.props.src || this.props.placeholder || PLACEHOLDER_IMG,
			aspect: 'square'
		};
	},

	handleOnLoad:function(ev){
		this.setState({
			aspect:(ev.target.width > ev.target.height) ? 'landscape' : 'portrait'
		});
	},

	handleOnError:function(ev){
		this.setState({
			src: this.props.placeholder || PLACEHOLDER_IMG
		});
	},

	render:function(){
		return (
			<span className="image">
				<span className={this.state.aspect}>
					<img src={this.state.src} onLoad={this.handleOnLoad} onError={this.handleOnError}/>
				</span>
			</span>
		);
	}

});
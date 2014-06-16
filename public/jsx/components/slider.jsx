/** @jsx React.DOM */
var Slider = React.createClass({

	mixins: [SetIntervalMixin],

	createState: function(cards, current, direction){
		return {
			direction: direction,
			previous: (current === 0) ? cards.length-1 : current-1,
			current: current,
			next: (current === cards.length-1) ? 0 : current+1
		};
	},

  getInitialState: function() {
		return this.createState(this.props.children, 0, 'fw');
	},

	next: function(){
		if (this.props.children.length > 1)
			this.setState(this.createState(this.props.children, this.state.next, 'fw'));
	},

	previous: function(){
		if (this.props.children.length > 1)
			this.setState(this.createState(this.props.children, this.state.previous, 'bw'));
	},

	getCardClassName: function(index){
		if (index === this.state.current)
		 	return 'current-card-' + this.state.direction;
		if ('fw' === this.state.direction) {
			if (index === this.state.previous)
				return 'previous-card-' + this.state.direction;
		} else {
			if (index === this.state.next)
				return 'previous-card-' + this.state.direction;
		}
		return 'hide-' + this.state.direction;
	},

	componentWillMount: function() {
		if ((this.props.children.length > 1) && (this.props.slideInterval))
	 		this.setInterval(this.next, this.props.slideInterval);
 	},

	render:function(){
	  var that = this;
	  var cards = {};
    $(this.props.children).each(function(child, index){
    	cards['_'+index] = (<li className={that.getCardClassName(index)}>{child}</li>);
    });

    var prev_icon = 'fa fa-arrow-circle-' + (app.direction === 'ltr' ? 'left' : 'right');
    var prev_button = (cards.length > 1) ? (
    	<span className="link prev" onClick={this.next}/>
		) : undefined;

    var next_icon = 'fa fa-arrow-circle-' + (app.direction === 'ltr' ? 'right' : 'left');
    var next_button = (cards.length > 1) ? (
    	<span className="link next" onClick={this.previous}/>
		) : undefined;

    return (
    	<div className={this.props.className}>
    		<div className="slider">
					{prev_button}
					{next_button}
					<ol className="cards">
						{cards}
					</ol>
				</div>
    	</div>
    );
	}

});
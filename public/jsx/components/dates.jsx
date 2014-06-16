/** @jsx React.DOM */

var TEN_SECONDS = 1000 * 10;
var ONE_MINUTE = 1000 * 60;
var ONE_HOUR = ONE_MINUTE * 60;
var ONE_DAY = ONE_HOUR * 24;
var THIS_YEAR = new Date().getYear();

var formatFull = function(date){
	var result = i18n.dates.suffix(date.getDate()) + ' ' + i18n.dates.months[date.getMonth()];
	if (date.getYear() !== THIS_YEAR)
		result += ', ' + date.getYear();
	return result + ', ' + formatTime(date)
}

var formatShort = function(date){
	return i18n.dates.months[date.getMonth()] + ' ' + i18n.dates.suffix(date.getDate());
}

var formatMins = function(mins){
	if (mins >= 10)
		return mins;
	if (mins < 10)
		return '0'+mins;
	return '00';
}

var formatTime = function(time){
	var hrs = time.getHours();
	var mins = time.getMinutes();
	var ampm = ' AM';
	if (hrs > 12) {
		hrs = hrs-12;
		ampm = ' PM'
	}
	return hrs + '.' + formatMins(mins) + ampm;
}

var DateRange = React.createClass({
	render:function(){
		var from = formatShort(this.props.from);
		var to = (this.props.to.getMonth() === this.props.from.getMonth()) ?
			i18n.dates.suffix(this.props.to.getDate()) : formatShort(this.props.to);
		return (
			<span className="date-range">
				<span className="from">{from}</span>
				<span className="to">{to}</span>
			</span>
		);
	}
});

var TimeRange = React.createClass({
	render:function(){
		var from = formatTime(this.props.from);
		var to = formatTime(this.props.to);
		return (
			<span className="time-range">
				<span className="from">{from}</span>
				<span className="to">{to}</span>
			</span>
		);
	}
});

var RelativeDate = React.createClass({

	mixins: [SetIntervalMixin],

	getInitialState:function(){
		return this.calc();
	},

	componentWillMount:function(){
		this.adjustUpdateInterval();
	},

	// todo: consider using statics instead (react statics - see lifecycle docs)
	adjustUpdateInterval: function(){
	  // clear existing interval, if set
		this.intervals.map(clearInterval);

		var that = this;
    var recalc = function(){
      that.setState(that.calc());
      that.adjustUpdateInterval();
    }

		// try not to recalculate more often than is really necessary
		if (this.state.diff < ONE_MINUTE) {
			this.setInterval(recalc, TEN_SECONDS);
		} else {
			if (this.state.diff < ONE_HOUR) {
				this.setInterval(recalc, ONE_MINUTE);
			} else {
				if (this.state.diff < ONE_DAY) {
					this.setInterval(recalc, ONE_HOUR);
				}
			}
		}
	},

	calc:function(){
		var now = new Date().getTime();
		var diff = (now - this.props.date.getTime());
		var text = null;
		if (diff < ONE_MINUTE) {
			var seconds = Math.round(diff/1000);
			text = i18n.dates.seconds_ago(seconds);
		} else {
			if (diff < ONE_HOUR) {
				var minutes = Math.round(diff/ONE_MINUTE);
				text = i18n.dates.minutes_ago(minutes);
			} else {
				if (diff < ONE_DAY){
					var hours = Math.round(diff/ONE_HOUR)
					text = i18n.dates.hours_ago(hours);
				} else {
		      text = formatFull(this.props.date);
				}
			}
		}
		return {
			text: text,
			diff: diff
		};
	},

	render:function(){
    return (
    	<span className="rel_date">{this.state.text}</span>
		);
	}
});
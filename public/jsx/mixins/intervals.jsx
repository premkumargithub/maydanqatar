/** @jsx React.DOM */

var SetIntervalMixin = {

  componentWillMount: function() {
    this.intervals = [];
  },

  setInterval: function() {
    this.intervals.push(setInterval.apply(window, arguments));
  },

  componentWillUnmount: function() {
    this.intervals.map(clearInterval);
  }

};
/** @jsx React.DOM */
var SCROLL_THRESHOLD = 800;

// TODO: hide the scroll bar
var Scroller = React.createClass({
  getInitialState:function(){
    var that = this;
    return {
      css:'scroll hide',
      content: that.props.children
    };
  },
  componentDidMount:function(){
    if (this.props.init){
      var that = this;
      this.props.init(function(content){
        that.setState({
          css:'scroll show',
          content:content
        });
      });
    } else {
      this.setState({
        css:'scroll show'
      });
    }
  },
  render:function(){
    return (
      <div className={this.state.css}>
        {this.state.content}
      </div>
    );
  }
});

// TODO: hide the scroll bar
var InfiniteScroller = React.createClass({
  getInitialState:function(){
    this.loading = false;
    return {
      css: 'scroll hide',
      top: [],
      bottom: []
    };
  },
  loadInitialData:function(){
    this.loading = true;
    var that = this;
    this.props.cursor.init({
      start: 1,
      end: app.config.paging.size
    }, function(result){
      that.loading = false;
      that.setState({
        top: result.rows,
        bottom: [],
        hasNext: result.hasNext(),
        hasPrevious: result.hasPrevious(),
        css:'scroll show'
      });
    });
  },
  loadNextBatch:function(){
    if (!this.loading) {
      this.loading = true;
      var that = this;
      this.props.cursor.next(function(result){
//	      history.pushState({
//          range: result.range,
//          scroll: that.refs.scroll.getDOMNode().scrollTop
//        }, '', window.location.href + '/' + that.refs.scroll.getDOMNode().scrollTop);
        that.setState({
          css: 'scroll show',
          top: (that.state.bottom.length > 0 ? that.state.bottom : that.state.top),
          bottom: result.rows,
          hasNext: result.hasNext(),
          hasPrevious: result.hasPrevious()
        });
        that.loading = false;
      });
    }
  },
  loadPreviousBatch:function(){
    if (!this.loading) {
      this.loading = true;
      var that = this;
      this.props.cursor.prev(function(result){
//	      history.pushState({
//          range: result.range,
//          scroll: that.refs.scroll.getDOMNode().scrollTop
//        }, '', window.location.href + '/' + that.refs.scroll.getDOMNode().scrollTop);
        that.setState({
          top: result.rows,
          bottom: that.state.top,
          hasNext: result.hasNext(),
          hasPrevious: result.hasPrevious()
        });
        that.loading = false;
      });
    }
  },
  bindScrollListeners:function(){
    var that = this;
    this.scrollTop = 0;
    var node = this.refs.scroll.getDOMNode();
    $(node).on('scroll', function(){
      if (node.scrollTop >= that.scrollTop) {
	      var gap = node.scrollHeight - (node.clientHeight + node.scrollTop);
        if (gap <= SCROLL_THRESHOLD && !that.loading && that.state.hasNext) {
          that.loadNextBatch();
        }
      } else {
        if (node.scrollTop <= SCROLL_THRESHOLD && !that.loading && that.state.hasPrevious) {
          that.loadPreviousBatch();
        }
      }
      that.scrollTop = node.scrollTop;
    });
  },
  componentDidMount:function(){
    if (history.state){
      console.log('todo: we have history state!');
      console.log(history.state);
      this.loadInitialData();
    } else {
      this.loadInitialData();
    }
    this.bindScrollListeners();
  },
  componentWillUpdate:function(){
    if (this.state.bottom && this.state.bottom.length > 0) {
      var node = this.refs.scroll.getDOMNode();
      if (node.scrollTop <= SCROLL_THRESHOLD) {
        this.scrollUpReset = node.scrollTop;
      } else {
        this.scrollDownReset = node.scrollTop - this.refs.top_batch.getDOMNode().scrollHeight;
      }
    }
  },
  componentDidUpdate:function(){
    var node = this.refs.scroll.getDOMNode();
    if (this.scrollUpReset){
      node.scrollTop = this.scrollUpReset + this.refs.top_batch.getDOMNode().scrollHeight;
      this.scrollUpReset = null;
    } else if (this.scrollDownReset){
      node.scrollTop = this.scrollDownReset;
      this.scrollDownReset = null;
    }
  },
  adapt:function(data){
    var result = {};
    var that = this;
    $(data).each(function(row){
      result['_'+row.__index] = that.props.adapter(row);
    });
    return result;
  },
  render:function(){
    var top = this.adapt(this.state.top);
    var bottom = this.adapt(this.state.bottom);
    return (
      <section className={this.state.css} id={this.props.id} ref="scroll">
        <div>
          <div ref="top_batch">{top}</div>
          <div ref="bottom_batch">{bottom}</div>
        </div>
      </section>
    );
  }
});
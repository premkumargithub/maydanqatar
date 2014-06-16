/** @jsx React.DOM */
var SearchForm = React.createClass({
  getInitialState:function(){
    return {
      q: this.props.q,
      search: $.throttle(250, this.props.search)
    };
  },
  handleQuery:function(q){
    this.state = {
      q: q,
      search: this.state.search
    };
    this.state.search(q);
  },
  render:function(){
    return (
      <div className="search_form">
        <SearchBox q={this.state.q} go={this.handleQuery}/>
      </div>
    );
  }
});

var SearchBox = React.createClass({
  getInitialState:function(){
    return {
      q: this.props.q
    };
  },
  componentDidMount:function(){
    var node = this.refs.input.getDOMNode();
    node.value = (!!this.props.q ? this.props.q : '');
    node.focus();
  },
  maybeForcePrefixIfLastWordIsNotTooShort:function(q){
    var parts = q.split(' ');
    if ((parts[parts.length-1].length > 2) && (q[q.length] !== ' '))
      return q + '*';
    return q.trim();
  },
  handleKeyUp:function(ev){
    var q = ev.target.value;
    if (q && q.length > 0) {
      q = this.maybeForcePrefixIfLastWordIsNotTooShort(q);
      if (q.length > 0)
        this.props.go(q);
    }
  },
  render:function(){
    return (
      <div>
        <input ref="input" className="search_box" onKeyUp={this.handleKeyUp}/>
      </div>
    );
  }
});

var SearchCriteria = React.createClass({
  render:function(){
    return (
      <div className="search_criteria">
        <h4>{this.props.q}</h4>
        <span className="link" onClick={this.props.cancel}>
          <i className="ic icon-search"></i>
        </span>
      </div>
    );
  }
});

var ComboSearchResult = React.createClass({
  createShowArticlesLink:function(){
    if (this.props.articles.results.length === 0) {
      return null;
    } else {
      var that = this;
      return {
        label: i18n.common.see_all,
        onClick: function(){
          app.routes.article_search.go([{ name:'q', value: that.props.q }]);
        }
      };
    }
  },
  createShowEventsLink:function(){
    if (this.props.events.results.length === 0) {
      return null;
    } else {
      var that = this;
      return {
        label: i18n.common.see_all,
        onClick: function(){
          app.routes.event_search.go([{ name:'q', value: that.props.q }]);
        }
      };
    }
  },
  render:function(){
    var tags = this.props.tags;
    var tagsTitle = i18n.search.tags(tags.special.length + tags.source.length + tags.topic.length);
    var articlesTitle = i18n.search.articles(this.props.articles.range.total);
    var eventsTitle = i18n.search.events(this.props.events.range.total);
    var that = this;
    return (
      <div className="search_result">
        <FoldingSection title={tagsTitle} open={false} css="tags">
          <Tags
            special={this.props.tags.special}
            source={this.props.tags.source}
            topic={this.props.tags.topic}/>
        </FoldingSection>
        <Section title={articlesTitle} link={this.createShowArticlesLink()}>
          <PreviewBoxes data={this.props.articles.results}/>
        </Section>
        <Section title={eventsTitle} link={this.createShowEventsLink()}>
          <PreviewBoxes data={this.props.events.results}/>
        </Section>
      </div>
    );
  }
});
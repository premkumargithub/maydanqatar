/** @jsx React.DOM */
var Button = React.createClass({
  render:function(){
    var iconClass = this.props.icon;
    var icon = (this.props.icon) ? <i className={iconClass}></i> : undefined;
    var css = this.props.css ? "button link " + this.props.css : "button link"; 
    return (
      <span id={this.props.id} className={css} onClick={this.props.action}>
				{icon}
				<span className="text">{this.props.text}</span>
			</span>
		);
  }
});

var ButtonBar = React.createClass({
  render:function(){
    return (
      <ol className="buttonbar">{this.props.children}</ol>
    );
  }
});

var ButtonBarButton = React.createClass({
  render:function(){
    var css = this.props.active ? 'active' : 'inactive link';
    return (
      <li className={css} onClick={this.props.action}>{this.props.label}</li>
    );
  }
});

var Section = React.createClass({
  render:function(){
    var link = null;
    if (this.props.link){
      link = <span className="link" onClick={this.props.link.onClick}>{this.props.link.label}</span>;
    }
    return (
      <section className={this.props.css}>
        <div className="heading">
          <h3>{this.props.title}</h3>
          {link}
        </div>
        {this.props.children}
      </section>
    );
  }
});

var FoldingSection = React.createClass({
  getInitialState:function(){
    return this.update(!!this.props.open);
  },
  open:function(){
    this.setState(this.update(true));
  },
  close:function(){
    this.setState(this.update(false));
  },
  update:function(open){
    if (open){
      return {
        css: (this.props.css ? 'open ' + this.props.css : 'open'),
        link:{
          onClick: this.close,
          label: i18n.common.see_less
        }
      }
    } else {
      return {
        css: (this.props.css ? 'closed ' + this.props.css : 'closed'),
        link:{
          onClick: this.open,
          label: i18n.common.see_all
        }
      }
    }
  },
  render:function(){
    return (
      <Section title={this.props.title} link={this.state.link} css={this.state.css}>
        {this.props.children}
      </Section>
    );
  }
});
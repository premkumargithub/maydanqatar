/** @jsx React.DOM */

var SiteNavigation = React.createClass({
	componentWillMount: function(){
	  var that = this;
	},
	render:function(){
		return (
			<div id="menu" className={this.props.visible ? 'shown' : 'hidden'}>
				<div className="surface">
					<div className="groups">
						<NavGroup
						  id="header"
						  authenticated={this.props.authenticated}
						  links={this.props.groups.main}
						  go={this.props.go}/>
					<NavGroup
						  id="footer"
						  authenticated={this.props.authenticated}
						  links={this.props.groups.settings}
						  go={this.props.go}/>
					</div>
					<div className="outside link" onClick={this.props.toggleMenu}></div>
				</div>
			</div>
		);
	}
});


var NavGroup = React.createClass({
	render:function(){
		var that = this;
		var links = this.props.links.map(function(link, index){
      if (that.props.authenticated) {
        if (link.auth === 'yes' || link.auth === 'maybe')
			    return <NavLink key={link.id} link={link} go={that.props.go}/>;
			  else
			    return null;
			} else {
			  if (link.auth === 'no' || link.auth === 'maybe')
          return <NavLink key={link.id} link={link} go={that.props.go}/>;
			}
		});
		return (
			<nav id={this.props.id}>
				<ul>{links}</ul>
  		</nav>
  	);
	}
});


var NavLink = React.createClass({

	handleClick:function(ev){
		this.props.go(this.props.link);
	},

	render:function(){
		return (
			<li className={this.props.link.active ? 'active' : ''} onClick={this.handleClick}>
				<i className={this.props.link.icon}></i>
				<span>{this.props.link.label}</span>
			</li>
		);
	}

});
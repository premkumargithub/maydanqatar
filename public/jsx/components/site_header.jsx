/** @jsx React.DOM */

var Topper = React.createClass({
  getInitialState:function(){
    return {
      where: undefined
    }
  },
  componentWillMount: function() {
    var that = this;
    app.on('route', function(ev){
      that.setState({
        where: ev.detail.to.route
      });
    });
    if (app.currentRoute){
      this.setState({
        where: app.currentRoute.route
      });
    }
  },
  render:function(){
    var isAuthVisible = !!(
      !this.authenticated &&
      this.state.where &&
      this.state.where.groups.find(function(group){
        return group === 'auth';
      }));

    return (window.__mode.size === 'small') ?
      <SmallSiteTopper
        where={this.state.where}
        showAuth={isAuthVisible}
        authenticated={this.props.authenticated}/>:
      <LargeSiteTopper
        where={this.state.where}
        showAuth={isAuthVisible}
        authenticated={this.props.authenticated}
        style={window.__mode.size}/>;
  }
});

var SmallSiteTopper = React.createClass({
  render:function(){
    if (this.props.authenticated){
      return (
        <header>
          <WelcomeBack/>
        </header>
      );
    } else {
      if (this.props.showAuth) {
      	var isDefault = (this.props.where.id === 'terms');
        return (
          <header>
            <LanguageChooser />
            <AuthBox mode={this.props.where.id}/>
            <AuthBar isDefault={isDefault}/>
          </header>
        );
      } else {
        return (
          <header>
            <LanguageChooser />
            <WelcomeAndLogin style="small"/>
          </header>
        );
      }
    }
  }
});

var LargeSiteTopper = React.createClass({
  render:function(){
    if (this.props.authenticated){
      return (
        <header>
          <WelcomeBack start={this.props.isStart}/>
        </header>
      );
    } else {
      if (this.props.showAuth) {
        return (
          <header>
            <AuthBox mode={this.props.where.id}/>
          </header>
        );
      } else {
        return (
          <header>
            <Welcome style={this.props.style}/>
          </header>
        );
      }
    }
  }
});

var Header = React.createClass({
  render:function(){
    return (window.__mode.size === 'small') ?
      <SmallSiteHeader
        title={this.props.title}
        back={this.props.back}
        toggleMenu={this.props.toggleMenu}
        activeSub={this.props.activeSub}
        subheader={this.props.subheader}/>:
      <LargeSiteHeader
        authenticated={this.props.authenticated}
        title={this.props.title}
        back={this.props.back}
        toggleMenu={this.props.toggleMenu}
        activeSub={this.props.activeSub}
        subheader={this.props.subheader}/>;
  }
});

var SmallSiteHeader = React.createClass({
  render:function(){
    return (
      <SiteHeader
        title={this.props.title}
        back={this.props.back}
        toggleMenu={this.props.toggleMenu}
        activeSub={this.props.activeSub}
        subheader={this.props.subheader}>
      </SiteHeader>
    );
  }
});

var LargeSiteHeader = React.createClass({
  render:function(){
    var login = (this.props.authenticated) ? null:
      <span>
        <RegisterLink/>
        <LoginLink/>
      </span>;
    var lang = (this.props.authenticated)?
      null : <AltLangLink/>;
    return (
      <SiteHeader
        logo={true}
        title={i18n.site.title}
        back={this.props.back}
        toggleMenu={this.props.toggleMenu}
        activeSub={this.props.activeSub}
        subheader={this.props.subheader}>
        {lang}
        {login}
      </SiteHeader>
    );
  }
});

var SiteHeader = React.createClass({
  back:function(){
    history.go(-1);
  },
	render:function(){
	  var backIcon = (app.direction === 'ltr') ? 'fa-chevron-left' : 'fa-chevron-right';
	  var logo = (this.props.logo) ?
	    <img src={i18n.site.logo_icon}/> : null
	  var title = (!this.props.back) ?
	    this.props.title:
	    <Button
	      icon={backIcon}
	      text={i18n.nav.back}
	      action={this.back} />
    return (
    	<header className="head" id="site">
    	  {logo}
				<h3>{title}<span>{i18n.site.version}</span></h3>
				<nav>
					<ol>
						<li>
							<TagButton selected={this.props.activeSub === 'tags'}/>
						</li>
						<li>
							<SearchButton selected={this.props.activeSub === 'search'}/>
						</li>
						<li>
							<a onClick={this.props.toggleMenu}><i className="icon-nav"></i></a>
						</li>
					</ol>
				</nav>
				{this.props.children}
				<div id="sub">
				  {this.props.subheader}
				</div>
    	</header>
    );
	}
});

var TagButton = React.createClass({
  render:function(){
    //return <a id="tag_button"><i className="ic icon-tag-ar"></i></a>;
    return <span/>;
  }
});

var SearchButton = React.createClass({
  handleClick:function(){
    app.routes.search.go();
  },
  render:function(){
    var css = 'link' + (this.props.selected ? ' selected' : '');
    return <a id="search_button" className={css} onClick={this.handleClick}><i className="ic icon-search"></i></a>;
  }
});

var HeaderBar = React.createClass({
	render:function(){
	  var bar = (
	    <header className="head">
	      <div className="head">
          <span className="start_of_line">{this.props.start}</span>
          {this.props.children}
          <span className="end_of_line">{this.props.end}</span>
        </div>
      </header>
    );

    // todo: rely on app size and an app resize event...
    if (window.__mode.size === 'small'){
      return <header>{bar}</header>;
    } else {
      return bar;
		}
	}
});

var AltLangLink = React.createClass({
  render:function(){
    var altLangLink = ((app.language == 'en') ? app.routes.arabic : app.routes.english);
    return <a id="alt_lang" href={altLangLink}><h3>{i18n.site.alt_lang}</h3></a>;
  }
});

var LanguageChooser = React.createClass({
	close:function(){
		console.log('todo: close the language-chooser!');
	},
	render:function(){
		var lang = <AltLangLink />;
    var close = null; // <span id="lang_close"/>; // MQ-42
    return (<HeaderBar start={lang} end={close}/>);
  }
});


var WelcomeBack = React.createClass({
	render: function(){
		return (<div/>);
  }
});

var Tour1 = React.createClass({
  render:function(){
    var img = app.config.urls.image + '/i/tour-logo.gif';
    return (
      <div id="tour_logo" className="card">
        <img src={img}/>
      </div>
    );
  }
});

var Tour2 = React.createClass({
  render:function(){
    var img = app.config.urls.image + '/i/tour-news.jpg';
    return (
      <div className="card">
        <img src={img}/>{i18n.site.tour.about1}
      </div>
    );
  }
});

var Tour3 = React.createClass({
  handleClick:function(){
    app.routes.register.go();
  },
  render:function(){
    var img = app.config.urls.image + '/i/tour-tags.jpg';
    return (
      <div className="card" onClick={this.handleClick}>
        <img src={img}/>{i18n.site.tour.about2}
      </div>
    );
  }
});

var Tour4 = React.createClass({
  handleClick:function(){
    app.routes.register.go();
  },
  render:function(){
    var img = app.config.urls.image + '/i/tour-network.jpg';
    return (
      <div className="card" onClick={this.handleClick}>
        <img src={img}/>{i18n.site.tour.about3}
      </div>
    );
  }
});

var SmallWelcome = React.createClass({
	render: function(){
		return (
			<HeaderBar>
				<Slider className="intro" slideInterval={5000}>
			    <Tour1/>
			    <Tour2/>
          <Tour3/>
          <Tour4/>
        </Slider>
			</HeaderBar>
		);
  }
});

var MediumWelcome = React.createClass({
	render: function(){
		return (
			<HeaderBar>
				<Slider className="intro" slideInterval={5000}>
					<Tour2/>
					<Tour3/>
					<Tour4/>
        </Slider>
			</HeaderBar>
		);
  }
});

var LargeWelcome = React.createClass({
	render: function(){
		return (
			<HeaderBar>
				<div className="intro">
					<Tour2/>
					<Tour3/>
					<Tour4/>
        </div>
			</HeaderBar>
		);
  }
});

var Welcome = React.createClass({
  render:function(){
    switch (this.props.style){
      case 'small':
        return <SmallWelcome/>;
        break;
      case 'medium':
        return <MediumWelcome/>;
        break;
      default:
        return <LargeWelcome/>;
    }
  }
});

var WelcomeAndLogin = React.createClass({
	render:function(){
    return (
      <div>
        <Welcome style={this.props.style}/>
        <AuthBar isDefault={true}/>
      </div>
    );
	}
});
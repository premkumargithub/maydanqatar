/** @jsx React.DOM */
var AuthBox = React.createClass({
  render:function(){
    switch (this.props.mode){
      case 'login':
      case 'noauth_medani':
        return <LoginPanel/>;
      case 'register':
        return <RegisterPanel/>;
      case 'terms':
        return <TermsAndConditionsPanel/>;
      case 'forgot_password':
        return <ForgotPasswordPanel/>;
      default:
        return <span/>;
    }
	}
});

var LoginPanel = React.createClass({
  render:function(){
    return (
      <header id="auth" className="head">
        <div>
          <LoginForm/>
          <SocialLogin/>
        </div>
      </header>
    );
  }
});

var RegisterPanel = React.createClass({
  done:function(data){
    app.trigger('signed_in', {
      username:data.email,
      first_visit:true
    });
  },
  render:function(){
    return (
      <header id="auth" className="head">
        <div>
          <RegisterForm callback={this.done}/>
          <SocialLogin/>
        </div>
      </header>
    );
  }
});

var TermsAndConditionsPanel = React.createClass({
  render:function(){
    return (
      <header id="auth" className="head">
        <TermsAndConditions/>
      </header>
    );
  }
});

var ForgotPasswordPanel = React.createClass({
  render:function(){
    return (
      <header id="auth" className="head">
        <ForgotPassword/>
      </header>
    );
  }
});

var LoginLink = React.createClass({
  render:function(){
    return (
      <Route route={app.routes.login}>
        <h3>{app.routes.login.label}</h3>
      </Route>
    )
  }
});

var RegisterLink = React.createClass({
  render:function(){
    return (
      <Route route={app.routes.register}>
        <h3>{app.routes.register.label}</h3>
      </Route>
    )
  }
});

var BackLink = React.createClass({
  back:function(){
    history.go(-1);
  },
	render:function(){
		return(
			<span className="link" onClick={this.back}>
			  <h3>{i18n.nav.back}</h3>
			</span>
		);
	}
});

var ForgotPasswordLink = React.createClass({
	go: function(){
		if( this.props.callback ) this.props.callback();
		app.routes.forgot_password.go();
	},
  render:function(){
    return (
      <a className="link" onClick={this.go}>{this.props.label}</a>
    )
  }
});

var AuthBar = React.createClass({
	render: function(){
		var login = <LoginLink/>;
		var register = <RegisterLink/>;
		var back = <BackLink/>;
		if( this.props.isDefault){
			return( <HeaderBar start={login} end={register}/>);
		} else {
			return( <HeaderBar start={back} end={register}/>);
		}
	}
});

var ForgotPassword = React.createClass({
  getInitialState: function() {
    return {mode: 'default'};
  },
  redraw: function(mode){
    this.setState({mode:mode});
  },
  resetDone: function(){
    this.redraw('reset-done');
  },
  requestResetComplete: function(){
    this.resetDone();
  },
  handleLogin:function(){
    app.routes.login.go();
  },
  render: function(){
    switch(this.state.mode){
      case 'reset-done':
        return (
          <div>
            <div><p>{i18n.reset_password.done}</p></div>
            <div><a className="link" onClick={this.handleLogin}>{i18n.reset_password.login}</a></div>
          </div>
        );
      default:
        return (
          <ForgotPasswordForm onRequestReset={this.requestResetComplete}/>
        );
    }
 }
});

var SocialLogin = React.createClass({
  render: function(){
    var social_cnf = app.config.social.providers;
    var providers = social_cnf.map(function(social, index){
      var url = "javascript:window.connect('"+ social.name+"')";
      var clazz = "large ic icon-"+social.name;
      return (
        <li>
          <a href={url}>
            {i18n.login.social.sign_in_with} {i18n.login.social[social.name]}
          </a>
        </li>
      );
    });
   return (
       <div id="social-login">
       <ul className="social">
            {providers}
        </ul>
       </div>
    );
  }
});

/** @jsx Extracting forms and other pages **/
var TermsAndConditions = React.createClass({
	getInitialState: function(){
		return {content:''}
	},
	componentWillMount: function(){
		var that = this;
    var opts = {
      ok: function(data){
        that.setState({content: data});
      },
      fail: function(data){
      	that.setState({content:'ERROR'});
      }
    };
		app.api.auth.terms(opts);
	},
	handleBack: function(){
	  // could just do history.go(-1)?
	  app.routes.register.go();
	},
  render: function(){
  	var html = (this.state.content);
    return (
      <div>
        <h2>{i18n.terms_and_conditions.header}</h2>
        <div>
        {html}
        </div>
        <div>
          <a className="link" onClick={this.handleBack}>{i18n.terms_and_conditions.back}</a>
        </div>
      </div>
    )
  }
});

var ErrorMsg = React.createClass({
  render:function(){
    return (
      <div className="error">
        {this.props.msg}
      </div>
    );
  }
});

var RegisterForm = React.createClass({
	mixins: [React.addons.LinkedStateMixin],
  getInitialState: function(){
    return {active:false, terms_accepted:false};
  },
  displayErrors: function(errors){
    this.setState({errors: errors});
  },
  processing: function(){
    this.setState({active:true});
  },
  finished: function(){
    this.setState({active:false});
  },
  handleTermsCheck: function(event){
  	var isSelected = event.target.checked;
  	this.setState({terms_accepted:isSelected});
  },
  doRegister: function(){
    if( !this.state.terms_accepted ){
    	this.displayErrors({terms:{code:'not_accepted', message: 'You should accept the Terms and Conditions'}})
    	return false;
    }
    var that = this;
    var opts = {
      form: {
        email: this.state.email,
        password: this.state.password,
        phone: this.state.phone
      },
      ok: function(data){
      	that.finished();
        that.props.callback(data);
      },
      fail: function(data){
      	that.displayErrors(data);
      	that.finished();
      }
    };
    that.processing();
    app.api.auth.register(opts);
    return false;
  },
  handleTermsClick:function(){
    app.routes.terms.go();
  },
  render: function(){
    if( this.state.errors ){
    	var errs = this.state.errors;
    	if( errs.terms ){
    	  var message = errs.terms[0] ? 
		      i18n.register.error.terms[errs.terms[0]] : 'Accept terms and conditions';
	      var termsErr = <ErrorMsg msg={message}/>;
    	}
    	if( errs.email ){
    	  var message = errs.email[0] ? 
		      i18n.register.error.email[errs.email[0]] : 'Email cannot be used';
	      var emailErr =  <ErrorMsg msg={message}/>;
    	}
    	if( errs.password ){
    	  var message = errs.password[0] ? 
		      i18n.register.error.password[errs.password[0]] : 'Password cannot be used';
	      var passwordErr = <ErrorMsg msg={message}/>;
    	}
    }
    var checked = this.state.terms_accepted ? true : false;
    return (
    	<div>
    	  <h2>{i18n.register.header}</h2>
        <div id="local-register" className="hasProcessing">
        <form id="register" method="post" onSubmit={this.doRegister}>
          <div>
            <label>{i18n.register.form.email}</label>
            <input id="email" type="text" name="email" valueLink={this.linkState('email')}/>
          </div>
          {emailErr}
          <div>
            <label>{i18n.register.form.password}</label>
            <input id="password" type="password" name="password" valueLink={this.linkState('password')}/>
          </div>
          {passwordErr}
          <div>
            <label>{i18n.register.form.phone} {i18n.register.form.optional}</label>
            <input id="phone" type="text" name="phone" valueLink={this.linkState('phone')}/>
          </div>
          <div>
            <span>{i18n.register.terms_and_conditions_text} 
            <a className="link" onClick={this.handleTermsClick}> {i18n.register.terms_and_conditions_link}</a>
            </span>
            <input type="checkbox" id="terms" name="terms" checked={checked} onChange={this.handleTermsCheck}/>
          </div>
          {termsErr}
          <div>
          <input type="submit" value={i18n.register.form.button}/>
          </div>
        </form>
        </div>
        <Processing active={this.state.active}/>
      </div>
    )
  }
});

var ForgotPasswordForm = React.createClass({
  mixins:[React.addons.LinkedStateMixin],
  getInitialState: function(){
    return {active:false};
  },
  processing: function(){
    this.setState({active:true});
  },
  finished: function(){
    this.setState({active:false});
  },
  requestReset: function(){
    var that = this;
    var opts = {
      form: {
        email: this.state.email,
      },
      ok: function(data){
        that.props.onRequestReset();
      },
      fail: function(error){
      	that.setState({error:error});
      },
      after: function(){
      	that.finished();
      }
    };
    that.processing();
    app.api.auth.requestPasswordReset(opts);
    return false;
  },
  render: function(){
    if( this.state.error ){
		  var message = this.state.error.code ? 
		    i18n.reset_password.error[this.state.error.code] : this.state.error.message;
	    var errorDiv = <ErrorMsg msg={message}/>
		}
    return (
    	<div>
    	  <h2>{i18n.reset_password.header}</h2>
        <div id="reset" className="hasProcessing">
        {errorDiv}
        <form id="reset-password" method="post" onSubmit={this.requestReset}>
          <div>
            <label>{i18n.reset_password.form.email}</label>
            <input id="email" type="text" name="email" valueLink={this.linkState('email')}/>
          </div>
          <div>
            <input id="reset" type="submit" value={i18n.reset_password.form.button}/>
          </div>
        </form>
        </div>
        <Processing active={this.state.active}/>
      </div>
    );
  }
});

var LoginForm = React.createClass({
	mixins:[React.addons.LinkedStateMixin],
	getInitialState: function(){
		return {};
	},
	displayError: function(error){
		this.setState({error: error});
	},
  doLogin: function(event){
    var that = this;
    var opts = {
      form: {
        email: this.state.email,
        password: this.state.password
      },
      ok: function(data){
        app.trigger('signed_in', {username:data.email});
      },
      fail: function(info){
      	that.displayError(info);
      }
    };
    app.api.auth.login(opts);
    return false;
  },
  handleForgotPasswordClick:function(){
    app.routes.forgot_password.go();
  },
  render: function(){
    if( this.state.error ){
		  var message = this.state.error.code ? 
		    i18n.login.error[this.state.error.code] : this.state.error.message;
	    var errorDiv = <ErrorMsg msg={message}/>
		 }
    return (
      <div>
        <h2>{i18n.login.header}</h2>
        <div id="local-login">
        {errorDiv}
        <form id="login" method="post" onSubmit={this.doLogin}>
          <div>
            <label>{i18n.login.form.email}</label>
            <input id="email" type="text" name="email" valueLink={this.linkState('email')}/>
          </div>
          <div>
            <label>{i18n.login.form.password}</label>
            <input id="password" type="password" name="password" valueLink={this.linkState('password')}/>
          </div>
          <div>
            {i18n.login.form.remember_password} 
            <input type="checkbox" id="remember" name="remember" valueLink={this.linkState('remember')}/>
          </div>
          <div>
            <input id="log_in" type="submit" value={i18n.login.form.button}/>
          </div>
          <div className="end_of_line">
            <ForgotPasswordLink label={i18n.login.form.forgot_password}/>
          </div>
        </form>
        </div>
      </div>
    );
  }
});

var Processing = React.createClass({
  render: function(){
    if( this.props.active ) {
      return (
        <div id="processing">
          <div id="processing-inner">
           <img src="/i/loader.gif"/>
          </div>
        </div>
      );
    } else {
      return (<div/>);
    }
  }
});

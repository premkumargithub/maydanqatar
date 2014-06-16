/** @jsx React.DOM */
var ResetPassword = React.createClass({
	getInitialState: function(){
		return {content : <div>{i18n.common.loading}</div>}
	},
	onPasswordChanged: function(){
		this.setState({content: <PasswordChanged />});
	},
	componentWillMount: function(){
		var that = this;
    var opts = {
      ok: function(data){
        that.setState({content: <ResetPasswordForm email={data.email} done={that.onPasswordChanged}/>});
      },
      fail: function(data){
      	var email = data.resend ? that.props.email : null; 
      	that.setState({content: <InvalidLink error={data.error} email={email}/>});
      }
    };
		app.api.auth.passwordReset.get(this.props.email, this.props.time, this.props.token, opts);
	},
	render: function(){
		return (
			<div>
				{this.state.content}
			</div>
		)
	}
});

var PasswordChanged = React.createClass({
	render: function(){
		return (
			<div className="feedback" >
			<p>{i18n.change_password.success}</p>
			</div>
		);
	}
});

var ResetPasswordForm = React.createClass({
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
  setError: function(err){
  	this.setState({error: err});
  },
  validPassword: function(){
  	return this.state.password && this.state.password.length > 6;
  },
  changePassword: function(){
  	if( this.validPassword() ){
	    var that = this;
	    var opts = {
	      form: {
	        email: this.props.email,
	        password: this.state.password
	      },
	      ok: function(data){
	      	app.trigger('signed_in', {username:data.email});
	        that.props.done(data);
	      },
	      fail: function(data){
	      	that.setError(data);
	      },
	      after: function(data){
	      	that.finished();
	      }
	    };
	    that.processing();
	    app.api.auth.passwordReset.post(opts);
  	} else {
  		this.setError({code:'invalid'})
  	}
    return false;
  },
	render: function(){
		var errorDiv = this.state.error ? <div>{i18n.change_password.error[this.state.error.code]}</div> : undefined;
		return (
			<div>
			<h2>{i18n.reset_password.header}</h2>
			<div className="hasProcessing">
			  {errorDiv}
			  <form id="change-password" method="post" onSubmit={this.changePassword}>
            <div>
                <input id="email" type="hidden" name="email" value={this.props.email}/>
                <label>{i18n.change_password.form.password}</label>
                <input id="password" type="password" name="password" valueLink={this.linkState('password')}/>
            </div>
            <div>
                <input id="reset" class="light_button" type="submit" value={i18n.change_password.form.button}/>
            </div>
        </form>
        <Processing active={this.state.active}/>
			</div>
			</div>
		);
	}
});

var InvalidLink = React.createClass({
	getInitialState: function(){
		return {cleared:false};
	},
	clear: function(){
		this.setState({cleared:true});
	},
	render: function(){
		if( this.state.cleared ){
			return <NoContent/>
		}
		if( this.props.error ){
		  var message = this.props.error.code ? 
		    i18n.reset_password.error[this.props.error.code] : 'Invalid Reset Link';
		  var resetError = <ErrorMsg msg={message}/>;
		}
		if( this.props.email ){
			var resetPassword = (
				<div>
				<ForgotPasswordLink label={i18n.reset_password.resend} callback={this.clear}/>
				</div>
			);
		}
    return (
    	<div>
    	  {resetError}
    	  {resetPassword}
    	</div>
    )
	}
});
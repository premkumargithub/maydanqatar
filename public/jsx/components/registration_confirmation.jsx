/** @jsx React.DOM */
var RegistrationConfirmation = React.createClass({
	getInitialState: function(){
		return {content: <div>{i18n.common.loading}</div>}
	},
	componentWillMount: function(){
		var that = this;
    var opts = {
      ok: function(data){
        that.setState({content: <RegistrationConfirmed email={data.email}/>});
      },
      fail: function(data){
      	var doResend = data.regenerate ? that.resendConfirmationEmail : null; 
      	that.setState(
      		{content: <RegistrationConfirmationFailed 
      		            error={data.error} resend={doResend}/>
      		}
      	);
      }
    };
		app.api.auth.confirmRegistration.confirm(this.props.email, this.props.token, opts);
	},
	resendConfirmationEmail: function(){
		var that = this;
    var opts = {
      ok: function(data){
        that.setState({content: <RegistrationConfirmationEmailSent email={data.email}/>});
      },
      fail: function(data){
      	that.setState({content: <RegistrationConfirmationEmailFailed error={data.error}/>});
      }
    };
		app.api.auth.confirmRegistration.request(this.props.email, opts);
	},
	render: function(){
		return (
			<div>
			{this.state.content}
			</div>
		);
	}
});

var RegistrationConfirmed = React.createClass({
	render: function(){
		return (
			<div className="feedback">
			<p>{i18n.confirmation.done}</p>
			</div>
		);
	}
});

var RegistrationConfirmationFailed = React.createClass({
	getInitialState: function(){
		return {cleared:false};
	},
	clear: function(){
		this.setState({cleared:true});
	},
	render: function(){
		if( this.props.error ){
		  var message = this.props.error.code ? 
		    i18n.confirmation.error[this.props.error.code] : 'Invalid Reset Link';
		  var confError = <ErrorMsg msg={message}/>;
		}
		if( this.props.resend ){
			var regenerate = (
				<div>
				  <a className="link" onClick={this.props.resend}>{i18n.confirmation.re_generate}</a>
				</div>
			);
		}
    return (
    	<div className="feedback">
    	  {confError}
    	  {regenerate}
    	</div>
    )
	}
});

var RegistrationConfirmationEmailSent = React.createClass({
	render: function(){
		return (
			<div className="feedback">
			  <p>{i18n.confirmation.sent}</p>
			</div>
		)
	}
});

var RegistrationConfirmationEmailFailed = React.createClass({
	render: function(){
		var message = i18n.confirmation.error[this.props.error.code];
		return (
			<div className="feedback">
			  <p>{i18n.confirmation.not_sent}</p>
			  <p>{message}</p>
			</div>
		)
	}
});

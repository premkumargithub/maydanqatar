/** @jsx React.DOM */

var Start = React.createClass({
	render:function(){
	  return (
	    <div className="start">
        <TagList tags={this.props.data.special} type="special"/>
        <TagList tags={this.props.data.source} type="source"/>
        <TagList tags={this.props.data.topic} type="topic"/>
        <TagList tags={this.props.data.venue} type="venue"/>
        <Route route={app.routes.akhbari}>
          <span className="large_button link">
        		<span className="text">{i18n.nav.go}</span>
        	</span>
        </Route>
      </div>
    );
  }
});

var StartHeader = React.createClass({
	render: function(){
	  var icon = 'ic icon-tag-' + app.language;
    return (
      <header id="start" className="head">
        <div>
          <h3><i className={icon}></i> {i18n.start.header}</h3>
        </div>
      </header>
    );
	}
});

var StartTopper = React.createClass({
	render: function(){
		var social = app.user && app.user.isSocial;
		if (social) {
// TODO: replace with the commented code below when progress
//       continues on MQ-3
      return <header/>
// MQ-3 incomplete:
//		  return (
//		    <header id="auth" className='notification'>
//          <header className='head'>
//            <ConfirmEmail email={app.user.email}/>
//          </header>
//		    </header>
//		  );
		} else {
		  return(
		  	<header className='notification'>
          <header className='head'>
            <div>
              <p>{i18n.start.validate}</p>
            </div>
          </header>
        </header>
	    );
		}
	}
});

var ConfirmEmail = React.createClass({
  mixins: [React.addons.LinkedStateMixin],
  getInitialState:function(){
    return {
      email:this.props.email
    }
  },
  handleConfirmEmail: function(){
    console.log('todo: confirm ' + this.state.email);
  },
  render: function(){
    return (
      <form id="confirm_email" method="post" onSubmit={this.handleConfirmEmail}>
        <div>
          <label>{i18n.register.form.email}</label>
          <input id="email" type="text" name="email" valueLink={this.linkState('email')}/>
        </div>
      </form>
    );
  }
});
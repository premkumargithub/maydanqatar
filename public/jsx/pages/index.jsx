/** @jsx React.DOM */
$.on('ready',function(){

  var prepareAndDisplay = function(){
    var nav_groups = {
  		main: app.routes.filter(function(route){
  			return (!route.groups) ? false : route.groups.any(function(group){
  				return (group === 'main');
  			});
  		}),
  		settings: app.routes.filter(function(route){
  			return (!route.groups) ? false : route.groups.any(function(group){
  				return (group === 'settings');
  			});
  		})
  	};

  	React.renderComponent(<Site	authenticated={app.authenticated}	nav_groups={nav_groups}/>, document.body);
  }

  app.on('signed_in', function(ev,user){
  	if( ev.detail && ev.detail.first_visit ){
  		app.routes.start.go();
  		app.user = ev.detail;
  	}
  	else if( user && user.first_visit ){
  		app.routes.start.go();
  		app.user = user;
  	}
    app.authenticated = true;
    prepareAndDisplay();
  });

  app.on('signed_out', function(){
  	app.user = undefined;
    app.authenticated = false;
    prepareAndDisplay();
  });

  prepareAndDisplay();

});
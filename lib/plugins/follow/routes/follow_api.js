module.exports = function(opts) {

  var app = opts.app;
  var service = opts.service;
  var eventbus = opts.eventbus;

  var follow = function(opts, res) {
    var tag = {
      scheme: opts.scheme,
      tagId: opts.id,
      label: opts.label
    };
    opts.user.follow(tag, function(err, user) {
      if (err) {
        res.statusCode = 400;
        res.json({ error:'' });
      } else {
        res.json({ 
          scheme: opts.scheme,
          id: opts.id,
          label: opts.label
        });
        // ideally we should move this to the follow
        // plugin's /lib/user.js, but then we don't have
        // access to the language :(
        eventbus.emit('followed', {
          tag: tag,
          user: user,
          language: opts.language
        });
      }
    });
  };
  
  var unfollow = function(opts, res) {
    var tag = {
      scheme: opts.scheme,
      tagId: opts.id,
      label: opts.label
    };
    opts.user.unfollow(tag, function(err, user){
      if (err) {
        console.log(err);
        res.statusCode = 400;
        res.json({ error:'' });
      } else {
        res.json({
          scheme:opts.scheme,
          id:opts.id
        });
        // ideally we should move this to the follow
        // plugin's /lib/user.js, but then we don't have
        // access to the language :(
        eventbus.emit('unfollowed', {
          tag: tag,
          user: user,
          language: opts.language
        });
      }
    });
  };

  var following = function(user, scheme, id, res){
    var tag = {
      scheme: scheme,
      tagId: id
    };
    if (user && user.isFollowing(tag)){
      res.json({ following:true });
    } else {
      res.json({ following:false });
    }
  };

  var followers = function(req, res){
    service.hearts.followers({
      target: {
        scheme: req.params.scheme,
        id: req.params.tag,
        label: req.params.label,
        uri: req.params.tag,
        language: req.params.language
      },
      language: req.params.language,
      range: app.ensureQueryRange(req.params)
    }, function(err, result){
      if (err) {
        console.log(err);
        res.send(500);
      } else {
        res.json(result);
      }
    });
  }

  app.post('/lang/:language/api/tags/:scheme/:tag/:label/follow/', function(req, res, next){
    follow({
      user: req.user,
      scheme: req.params.scheme,
      id: req.params.tag,
      label: req.params.label,
      language: req.params.language
    }, res);
  });

  app.post('/lang/:language/api/tags/:scheme/:tag/:label/unfollow/', function(req, res, next){
    unfollow({
      user: req.user,
      scheme: req.params.scheme,
      id: req.params.tag,
      label: req.params.label,
      language: req.params.language
    }, res);
  });

  app.get('/lang/:language/api/tags/:scheme/:tag/:label/following/', function(req, res, next){
    following(req.user, req.params.scheme, req.params.tag, res);
  });

  app.get('/lang/:language/api/tags/:scheme/:tag/:label/followers/count/', function(req, res, next){
    app.doCache(res, 60);
    service.hearts.followerCount({
      target: {
        scheme: req.params.scheme,
        id: req.params.tag,
        label: req.params.label,
        uri: req.params.tag,
        language: req.params.language
      },
      language: req.params.language,
      range: app.ensureQueryRange(req.params)
    }, function(err, result){
      if (err) {
        console.log(err);
        res.send(500);
      } else {
        res.json(result);
      }
    });
  });

  app.get('/lang/:language/api/tags/:scheme/:tag/:label/followers/', function(req, res, next){
    app.doCache(res, 60);
    followers(req, res);
  });

  app.get('/lang/:language/api/tags/:scheme/:tag/:label/followers/:start-:end/', function(req, res, next){
    app.doCache(res, 60);
    followers(req, res);
  });

};

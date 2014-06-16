module.exports = function(config, app, service) {

  var _ = require('lodash');

  app.post('/lang/:lang/api/hearts/add/', function(req, res, next) {
    if (req.user){
      service.hearts.add({
        user: req.user.summarize(),
        target: req.body.target,
        context: req.body.context,
        recipient: req.body.recipient
      }, function(err, result){
        if (err){
          console.log(err);
          res.send(500);
        } else {
          res.statusCode = 200;
          res.json(result);
        }
      });
    } else {
      res.send(403);
    }
  });

  app.post('/lang/:lang/api/hearts/remove/', function(req, res, next) {
    if (req.user){
      service.hearts.remove({
        user: req.user.summarize(),
        target: req.body.target,
        context: req.body.context,
        recipient: req.body.recipient
      }, function(err, result){
        if (err){
          console.log(err);
          res.send(500);
        } else {
          res.statusCode = 200;
          res.json(result);
        }
      });
    } else {
      res.send(403);
    }
  });

};
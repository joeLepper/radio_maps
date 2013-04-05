var port = 27505

  , start = function(app){
      app.listen(port);
      console.log("Started listening to " + port + ' ,bitchez.');
    };

exports.start = start;
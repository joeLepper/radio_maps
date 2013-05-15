var port = 5555

  , start = function(app){
      app.listen(port);
      console.log("Started listening to " + port + ' ,bitchez.');
    };

exports.start = start;
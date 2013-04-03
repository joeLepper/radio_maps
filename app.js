var express    = require('express')
  , app        = express()
  , server     = require('./server')
  , reqHandle  = require('./request')

app.use(express.static(__dirname + '/public'));


app.configure(function(){
  app.use(express.bodyParser());
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
  app.use(express.logger());
});


app.get('/', function(req,res){
  console.log("Service!");
	reqHandle.start(req,res);
});

app.get('/parse', function(req,res){
  reqHandle.parseIt(req,res);
});

app.get('/coordquery/:lat/:lng',function(req,res){
  console.log('coordQuery post')
  reqHandle.coordQuery(req,res);
});

server.start(app);
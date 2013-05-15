var newRelic   = require('newrelic')
  , express      = require('express')
  , Binary       = require('binaryjs').BinaryServer
  , fs           = require('fs')
  , app          = express()
  , server       = require('http').createServer(app)
  , reqHandle    = require('./request')

  , binaryServer = Binary({server:server})

app.use(express.static(__dirname + '/public'));

server.listen(5555);

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

app.get('/fullrequest', function(req,res){
  reqHandle.fullRequest(req,res);
});

app.get('/coordquery/:lat/:lng',function(req,res){
  console.log('coordQuery post')
  reqHandle.coordQuery(req,res);
});

binaryServer.on('connection', function(client){
  reqHandle.stream(function(data){
    var file = fs.createReadStream(data);
    client.send(file);
  })
  
})
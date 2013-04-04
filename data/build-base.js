var mongoose = require('mongoose')

  , Schema   = mongoose.Schema
  , db       = mongoose.createConnection( 'localhost'
  							 									      , 'radio')

  , repeater
  , repeating = false

  , loc = { type        : { type: String }
	  			, coordinates : { type: mongoose.Schema.Types.Mixed } }

	, radiostation = new Schema( { broadcastType : String
	  													 , callSign      : String
	  													 , loc           : loc
	  													 , appID         : String 
	  													 , frequency     : Number } )

	, Radiostation = db.model('Radiostation',radiostation)
	
  , updateDB = function(stations,callback){
  		var stationsLength = stations.length
  		  , stationObj
  		  , loc
  		  , rsObj
  		  , newStation
  		  , saved = 0

  		for(var i = 0; i < stationsLength; i++){

  			stationObj = stations[i];
	  		rsObj = {};
	  		loc = { type        : "Polygon"
	  		      , coordinates : [stationObj.coords] }

	  		rsObj['broadcastType'] = stationObj.bType;
	  		rsObj['frequency']     = stationObj.freq;
	  		rsObj['callSign']      = stationObj.call;
	  		rsObj['appID']         = stationObj.appID;
	  		rsObj['loc']           = loc;

			  newStation = new Radiostation( rsObj );
			  newStation.save(function(err,data){
			  	if(err){
			  		console.log("There was a problem saving: " + err);
			  	}
			  	else{
			  		if(saved === stationsLength - 1){
						  callback();
			  		}
			  		else{
			  			saved += 1;
			  		};
			  	};
			  });
  		};
		}

	, dump = function(stationsArr) {
			for(var i = 0; i < stationsArr.length; i++){
				inserter.add(stationsArr[i]);
			}
			if(!repeating){
				repeater = setInterval(function() {
	        inserter.insert();
	      }, 250);
	      repeating = true;
			}
		}

  , Inserter = function () {
	    this.data           = [];
	    this.maxThreads     = 4;
	    this.currentThreads = 0;
	    this.batchSize      = 250;
	    this.queue          = 0;
	    this.inserted       = 0;
	    this.startTime      = Date.now();
	};

Inserter.prototype.add = function(data) {
    this.data.push(data);
};

// Use force=true for last insert
Inserter.prototype.insert = function(force) {
    var that = this;
    if (this.data.length >= this.batchSize || force) {
        if (this.currentThreads >= this.maxThreads) {
            this.queue++;
            return;
        }
        this.currentThreads++;
        updateDB(this.data.splice(0, this.batchSize), function() {
            that.inserted += that.batchSize;
            var currentTime = Date.now();
            var workTime = Math.round((currentTime - that.startTime) / 1000);

            console.log('// ----------------    INSERTING    ---- //');
            console.log('// ---------------- inserted: ' + that.inserted);
            console.log('// ---------------- queue: ' + that.queue);
            console.log('// ------------------------------------- //');
            console.log("");

            that.currentThreads--;
            if (that.queue > 0) {
                that.queue--;
                that.insert(false);
            };
        });
    }
    else{
    	if(!that.data.length){
    		console.log("DONE");
    		clearInterval(repeater);
    		repeating = false;
    	}
    	else{
      	that.insert(true);                		
    	}
    }
};

var inserter = new Inserter();


mongoose.connection.on('error',function(err){
	console.log("MongoDB error: " + err)
});
radiostation.index({name:"coordinates",type:"2dsphere"})

exports.dump = dump;
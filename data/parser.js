var fs          = require ('fs')
  , db          = require('./build-base')

  , request
  , response

  , initialArr  = []
  , freqList    = []

  , Station = function(atts){
      this.call = atts.call;
      this.freq = atts.freq;
      this.type = atts.type;
      this.coords = atts.coords;
      this.appID = atts.appID;
    }

  , LatLng = function(latLng){
	  	this.latLng = latLng;
	  }

  , buildContours = function(){
			fs.readFile('data/export/home/radioTVdata/results/FM_service_contour_current.txt', 'UTF-8', function(err,data){
        if(err){
          console.log(err);
        }
        else{
        	console.log('CALLING TO BUILD FREQ LIST')
        	contours = data.split('\n');
  				buildFreqList(contours);
        }
      })		  				
	  }

	, buildFreqList = function(contours){

			var stationsData = []
			  , typeList     = []
			  , stationObj
			  , station;

  		fs.readFile('data/fm_query_data.txt', 'UTF-8', function(err,data){
  			if(err){
  				console.log(err);
  			}
  			else{
  				stationsData = data.split('\n');
  				stationsLength = stationsData.length;
  				for (var j = 0; j < stationsLength; j++){
  					stationObj = buildFreqObj(stationsData[j])
  					if(typeof stationObj !== 'undefined'){
	  					freqList.push(stationObj);
  					}
  				};
  				batcher.startRepeater(populateArr,contours);
  			};
  		});
	  }

	, buildFreqObj = function(stationData){
		  var stationObj = {}
			  , badCall    = false
			  , station    = stationData.split('|');

			if(typeof station[1] !== 'undefined'){
				stationObj['call'] = station[1].split(' ')[0];
				if(stationObj.call === "NEW" || stationObj.call === '-'){
					badCall = true;
				};
				if(!badCall){
					stationObj['freq'] = parseFloat(station[2].split(' ')[0]);
					stationObj['type'] = station[3].split(' ')[0];
	  				return stationObj;
				};
			};
		}

	, populateArr = function(contours,callback){
			// console.log("POPULATING ARRAY");

			var contoursLength = contours.length
			  , stationArr     = []
			  , stationsArr    = []
			  , stationObj     = {}
			  , coords         = []
			  , curLatLng      = []
			  , maxLatLng      = []
			  , minLatLng      = []
			  , workArr        = []
			  , thisStation
			  , thisIsNan
			  , badCall
			  , badStation
			  , stationArrLength;

			for ( var i = 0; i < contoursLength; i++){

				thisStation = contours.pop();
				if(typeof thisStation !== 'undefined'){
					badCall     = false;
					badStation  = false;
					coords      = [];
					stationArr  = thisStation.split('|');

					// the FCC's list has some weirdness in its formatting
					// so make sure that we're dealing with good data
					stationObj['appID'] = stationArr.shift();
					if(typeof stationObj.appID === 'undefined'){
						badStation = true;
					};

					// make sure we've got some useful data
					stationObj['bType'] = stationArr.shift();
					if(typeof stationObj.bType === 'undefined'){
						badStation = true;
					}
					else{

						// make sure that we're not dealing
						// with whitespace in the spectrum
						// or a new application
						stationObj['call']  = stationArr
																		.shift()
																		.split(' ')[0]
																		.split('-')[0];
						if(stationObj.call === 'NONE' || stationObj.call === 'NEW'){
							badCall = true;
						};

						// We can use this data so chop the coords
						// into an array of lat / lng pairs 
						stationArrLength = stationArr.length;
						for(var j = 0; j < stationArrLength; j++){

							// again, protect against
							// the FCC's data's weirdness
							thisIsNan = false;
							curLatLng = [];
							workArr   = stationArr[j].split(',');
							for(var k = 0; k < workArr.length; k++){
								curLatLng.unshift(parseFloat(workArr[k]));
								if(isNaN(curLatLng[k])){
									thisIsNan = true;
									break;
								}
							};
							if(!thisIsNan){
								newLatLng = new LatLng(curLatLng);
								coords.push(newLatLng.latLng);
							};
						};

					}
				};

				coords[0] = coords[coords.length - 1];

				stationObj['coords'] = coords;

				if(!badStation && !badCall && ( coords[0] !== null || typeof coords[0] !== 'undefined') ){
					var completeStation = confirmStation(stationObj);

					if(typeof completeStation !== 'undefined'){
						stationsArr.push(completeStation);
					}
				};
			};
			db.dump(stationsArr);
			callback();
		}

	, confirmStation = function(stationObj){
			var freqListLength = freqList.length
			  , myStation = new Station(stationObj)
			  , curStation;

			for (var k = 0; k < freqListLength; k++) {
				curStation = freqList[k];
				if (typeof curStation !== 'undefined'){
					if(myStation.call === curStation.call){
						myStation['freq'] = curStation.freq
						freqList.splice(k,1);
						return myStation;
					};
				}
			};
		}

	, parse = function(req,res){

			request  = req;
			response = res;

			buildContours();
		}

	, Batcher = function(atts){
			this.data           = [];
			this.maxThreads     = 4;
			this.currentThreads = 0;
			this.batchSize      = 250;
			this.queue          = 0;
			this.pushed         = 0;
			this.startTime      = Date.now();
			this.repeater;
		};

Batcher.prototype.add = function(datum){
	this.data.push(datum);
};

Batcher.prototype.startRepeater = function(execute,data){
	var that = this
	this.data = data;
	this.repeater = setInterval(function() {
    that.ship(false,execute);
  }, 750);
};

Batcher.prototype.stopRepeater = function(){
	console.log("STOPPING SHIP REPEATER")
	clearInterval(this.repeater);
}

Batcher.prototype.ship = function(force, execute){
	var that = this;
  if (this.data.length >= this.batchSize || force) {
      if (this.currentThreads >= this.maxThreads) {
          this.queue++;
          return;
      }
      this.currentThreads++;
      execute(this.data.splice(0, this.batchSize), function() {
          that.pushed += that.batchSize;

          console.log('// ----    SHIPPING    ---- //');
          console.log('// --- Total Shipped: ' + that.pushed);
          console.log('// --- Queue Size: ' + that.queue);
          console.log('// ------------------------ //');
		      console.log("")

          that.currentThreads--;
          if (that.queue > 0) {
              that.queue--;
              that.ship(false,execute);
          };
      });
  }
  else{
  	if(!that.data.length){
  		console.log("SHIPPING Data is empty");
  		this.stopRepeater();
  	}
  	else{
    	that.ship(true,execute);                		
  	}
  }
};

var batcher = new Batcher()

exports.parse = parse;


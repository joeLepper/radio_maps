var mongoose = require('mongoose')
  , Schema   = mongoose.Schema
  , fs       = require('fs')
  , db       = mongoose
  							 .createConnection( 'localhost'
								 									, 'radio')
  							 // .createConnection( '173.255.241.26'
								 	// 								, 'radio')

  , loc = { type        : { type: String }
	  			, coordinates : { type: mongoose.Schema.Types.Mixed } }

	, radiostation = new Schema( { broadcastType : String
	  													 , callSign      : String
	  													 , loc           : loc
	  													 , appID         : String 
	  													 , frequency     : Number } )

	, Radiostation = db.model('Radiostation',radiostation)

	, cache = {}
		
	// , radioQuery = function(callSign, callback){
	// 	  Radiostation.find({callSign:callSign}, function(err,results){
	// 	    if(err){                                                                               
	//         console.log(err)	
	//       }
	//       else{
	// 			  console.log("calling back " + results)
	//         callback(results);
	// 		  };
	// 	  });
	// 	}
	
	, coordQuery = function(latLng,callback){
			console.log(latLng);
			var point = { type 				: "Point"
									, coordinates : latLng };

			Radiostation.find( { loc: { $geoIntersects: { $geometry: point } } }, function(err,results){
				if(err){
					console.log(err)
				}
				else{
					console.log("SUCCESS:");
					console.log(results);
					callback(results);
				};
			});
		}
	, stream = function(callback){
		var file = fs.createWriteStream('/temp/cache.txt',JSON.toString(cache),function(err){
			if(err){
				console.log(err);
			}
			else{
				console.log("file's saved");
				callback('/temp/cache.txt');
			}
		})
			
		}

	, fullRequest = function(callback){
		// console.log("asking Mongoose for something")
		// 	Radiostation.find({},function(err,results){
		// 		if(err){
		// 			console.log(err);
		// 		}
		// 		else{
		// 			console.log("SUCCESS:");
		// 			console.log(typeof results);
		// 			console.log(results.length);
					callback('cache');
			// 	}
			// })	
		};

	console.log('caching......')
	Radiostation.find({},function(err,results){
		if(err){
			console.log(err)
		}
		else{
			console.log('cached');
			cache = results;
		};
	});

exports.coordQuery  = coordQuery;
exports.fullRequest = fullRequest;
exports.stream      = stream;
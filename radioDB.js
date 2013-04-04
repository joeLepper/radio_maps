var mongoose = require('mongoose')
  , Schema   = mongoose.Schema
  , db       = mongoose
  							 .createConnection( 'localhost'
  							 									, 'radio')

  , loc = { type        : { type: String }
	  			, coordinates : { type: mongoose.Schema.Types.Mixed } }

	, radiostation = new Schema( { broadcastType : String
	  													 , callSign      : String
	  													 , loc           : loc
	  													 , appID         : String 
	  													 , frequency     : Number } )

	, Radiostation = db.model('Radiostation',radiostation)
		
	, radioQuery = function(callSign, callback){
		  Radiostation.find({callSign:callSign}, function(err,results){
		    if(err){                                                                               
	        console.log(err)	
	      }
	      else{
				  console.log("calling back " + results)
	        callback(results);
			  };
		  });
		}
	
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
		};

exports.radioQuery  = radioQuery;
exports.coordQuery  = coordQuery;
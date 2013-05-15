var fetcher  = require('./fetcher')
  , parser   = require('./data/parser')
  , radioDB  = require('./radioDB')

  , start = function (req,res) {

		console.log("start called")
    res.sendfile('public/index.html');
	}

	/*
	 *Retrieves radio DB queries
	 */
	, radioQuery = function(req,res){

	    var callSign = req.params.callsign;
		  radioDB.radioQuery(callSign, function(results){
			  if( typeof results[0] === "object" ){
			    res.send(results)
			  }
			  else{
			  	res.send('database error');
			  }
		  })
		}
		
	, coordQuery = function(req,res){

	      var lat = parseFloat(req.params.lat)
		      , lng = parseFloat(req.params.lng)
	        , latLng = [ lng, lat ];

	        console.log("lat " + lat);
	        console.log("lng " + lng);

	        console.log(latLng);


	      radioDB.coordQuery(latLng, function(results){
		      console.log("reults from radioDB.coordQuery: " + results);
			    res.send(results)
		    }); 
		}
	, stream = function(callback){
			radioDB.stream(callback);
		}

	, fullRequest = function(req,res){
			radioDB.fullRequest(function(results){
				console.log('returning data to the browser');
				res.send(results);
			});
		};

/* -----------------------------------
 *
 * Currently the database needs
 * to be manually cleared before 
 * fetching and updating the records
 * but eventually this will just run
 * the database population every 1 day.
 *
 * ----------------------------------- */
 
// setInterval(function(){
// 	fetcher.fetch();
// },86400000);
// fetcher.fetch();

exports.start       = start;
exports.fullRequest = fullRequest;
exports.coordQuery  = coordQuery;
exports.stream      = stream;

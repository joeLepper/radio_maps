var fs      = require ('fs')
  , http    = require('http')
  , unzip   = require('unzip')
  , parser  = require('./data/parser')

  , readyState = 0
  , initialArr = []
  , request
  , response

  , fetchContoursList = function(){

  		http.get('http://transition.fcc.gov/ftp/Bureaus/MB/Databases/fm_service_contour_data/FM_service_contour_current.zip',function(response){
  			console.log("CALLING BACK WITH ZIP")
  			var origin = fs.createWriteStream('data/contours.zip');
  			var file = response.pipe(origin);
  			response.on('end',function(data){

  				console.log("we can't be friends now")
					fs.createReadStream('data/contours.zip')
						.pipe(unzip.Extract({ path: 'data' })
							.on('close',function(){

			  				console.log("GOT THE ZIP")
			  				if(readyState === 1){
			  					callParse();
			  				};
			  				readyState = 1;
				  		})
						);
				})
		  })
		}

	, fetchFreqList = function(){

			var stationsData = []
			  , stationsArr  = []
			  , typeList     = []
			  , stationObj
			  , station;

  		http.get('http://transition.fcc.gov/fcc-bin/fmq?state=&call=&city=&arn=&serv=&vac=&freq=0.0&fre2=107.9&facid=&class=&dkt=&list=4&dist=&dlat2=&mlat2=&slat2=&NS=N&dlon2=&mlon2=&slon2=&EW=W&size=9',function(response){
  			console.log("CALLING BACK WITH FM QUERY")
  			var origin = fs.createWriteStream('data/fm_query_data.txt');
  			var file = response.pipe(origin);
  			response.on('end',function(data){
  				console.log("GOT THE FM QUERY");
  				if(readyState === 1){
  					callParse();
  				};
  				readyState = 1;
  			})
  		})
	  }

	, callParse = function(){
		
			parser.parse(request,response);
		}

	, fetch = function(){

			fetchContoursList();
			fetchFreqList();
		}

exports.fetch = fetch;
exports.callParse = callParse;
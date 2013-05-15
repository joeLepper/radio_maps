'use strict';

/* Controllers */


function MyCtrl1($scope, $http, $filter) {

	angular.element(window.document).ready(function(){
		console.log('jqLite in the hizzy.');
		$scope.onresize()
		angular.element(window).on('resize',$scope.onresize);

		//commenting this out for experiment
		// $scope.$watch('centerProperty.lat', $scope.mapMove);
		$scope.graphItAll()
	});

  angular.extend($scope, { centerProperty           : { lat: 42
																					            , lng: -87.5 }
												 , zoomProperty             : 8
												 , markersProperty          : [ { latitude  : 45
											 												          , longitude : -74 } ]
										 		 , polygons                 : []
										 		 , clickedLatitudeProperty  : null
										 		 , clickedLongitudeProperty : null } );


	$scope.validLocalsProperty = [];


	$scope.coordQuery = function(){
    var lat = $scope.centerProperty.lat
      , lng = $scope.centerProperty.lng

		$scope.polygons = [];

		console.log('coordQuery');

		//post to server
		$http( { method:"get"
		       , url: '/coordquery/' + lat +'/' + lng } )
	      
		  .success(function(data, status) {
	      var currentStationObj = {};

			  $scope.status = status;
	      $scope.data = data;

			  for(var i = 0; i < data.length; i++){
			  	currentStationObj = data[i];

			  	delete currentStationObj.broadcastType;
			  	delete currentStationObj.callSign;
			  	delete currentStationObj.appID;


			  	$scope.validLocalsProperty.push(data[i].loc['coordinates']);
			  	$scope.polygons.push(currentStationObj);
			  };
		  })
			.error(function(data, status) {
		    $scope.data = data || "Request failed";
		    $scope.status = status;
		  });
  };

  $scope.findStations = function(_callSign){
	
	  //post to server
	  $http({method:"post", url: '/radioquery/' + _callSign}).
      
	    success(function(data, status) {
        
			  // instantiate the station object
			  // and the coord array
			  var newPolyCoords = []
			    , stationObj = {};

			  //data-bind response from server
			  $scope.status = status;
	      $scope.data   = data;

			  /* BUILD IT
				 */
				for (var h = 0; h < data.length; h++){
					if(data[h].broadcastType === 'FM'){
					  for(var i = 0; i < data[h].signalContour.length; i++){
			        newPolyCoords.push([data[h].signalContour[i][0],data[h].signalContour[i][1]])
			      }

			      stationObj.coords = newPolyCoords;
			      stationObj.name   = _callSign;

					  if($scope.findInArray($scope.polygons,'name',_callSign)){
					    $scope.polygons.push(stationObj);
					  }
					}
				}
      }).
      error(function(data, status) {
        $scope.data = data || "Request failed";
        $scope.status = status;
      });


  };

  $scope.onresize = function(){
		var height    = window.innerHeight * .95
		  , mapWidth  = window.innerWidth * .8
		  , listWidth = window.innerWidth * .1;

		angular.element('.google-map').css( { height : height
																				, width  : mapWidth } );
		angular.element('station-table').css( { height : height
																	 			  , width  : listWidth } );
  };

  $scope.mapMove = function(){
  	console.log($scope.checking);

  	if(!$scope.checking){

	  	var that = this;
	  	this.curCenter = angular.extend({},$scope.centerProperty)

	  	console.log(this);
	  	console.log('curCenter');
	  	console.log(that.curCenter);
	  	console.log('scopeCenter');
	  	console.log($scope.centerProperty);
	  	console.log(that.curCenter.lat === $scope.centerProperty.lat && that.curCenter.lng === $scope.centerProperty.lng);
	  	console.log('');

	  	var checker = setInterval( function(){
	  	  if(that.curCenter.lat === $scope.centerProperty.lat && that.curCenter.lng === $scope.centerProperty.lng){
					$scope.coordQuery();
					$scope.checking = false;
					clearInterval(checker);
	  	  }
	  	  else{
  		  	that.curCenter = angular.extend({},$scope.centerProperty)

	  	  	console.log("still moving");
	  	  };
			},100);
	  	$scope.checking = true;
  	}
  }

  $scope.findInArray = function(array, key, val){

  	var forReturn = 1 

  	angular.forEach(array, function(obj, index){

  		if(obj[key] === val){

  			forReturn = 0;
  		}
  	});
  	return forReturn;
  };

  $scope.graphItAll = function(){
	  $http({method:"get", url: '/fullrequest'})
	  .success(function(data,status){
	  	console.log('returned');
	  	console.log(data);
	  })
  };

	var client = new BinaryClient('ws://localhost:5555')

	client.on('stream',function(stream,meta){
		var bits = [];

		stream.on('data',function(data){
			bits.push(data);
		});

		stream.on('end',function(){
			console.log('end');
		});
	});


  // $scope.coordQuery();

}; //end controller
//MyCtrl1.$inject = [];


function MyCtrl2() {
}
//MyCtrl2.$inject = [];

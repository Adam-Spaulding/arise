'use strict';

app.controller('BrowseController', function($scope, $routeParams, toaster, Task, Auth, Comment, Offer, uiGmapGoogleMapApi, uiGmapLogger) {
	//uiGmapLogger.currentLevel = uiGmapLogger.LEVELS.debug;
	$scope.searchTask = '';
	$scope.mapPins = [];
	$scope.paths = [];
	$scope.polylines = [];
	// Set up map defaults etc.
	$scope.googleMapInstance = {};
	var lats = [];
	var lngs = [];
	$scope.currentUserArr = [];
	var clusterTypes = ['standard','ugly','beer'];
	var selectedClusterTypes = {
		standard:{
			title: 'Hi I am a Cluster!', gridSize: 60, ignoreHidden: true, minimumClusterSize: 2
		}
	};
	$scope.clusterProps = {
		doClusterRandomMarkers: true,
		currentClusterType: 'standard',
		clusterTypes: clusterTypes,/*
		selectClusterType: selectClusterType,
		selectedClusterTypes: selectedClusterTypes,*/
		clusterOptions: selectedClusterTypes.standard,
	}
	$scope.mapProperties = {
		visible:true,
		stroke:{
			color: '#FF0066',
			weight: 3
		},
		geodesic:false,
		static:true,
		fit:false,
		editable:true,
		draggable:false
	};
	$scope.polylines.push($scope.mapProperties);

	$scope.userProfile = {};
	$scope.currentUserLocation = {};
	$scope.userId = $routeParams.userId;
	$scope.show = false;
	var latitudeLongObj = {
		latitude:'',
		longitude:''
	}


	 async.waterfall([
     function(callback){
		 Task.all.$loaded(function (tasks) {
			 $scope.tasks = tasks;
			 var taskData = angular.copy(tasks);
			 taskData.map(function(d,i){
				 d.latlong = {};
				 if(d.lat){
					 d.latlong['latitude'] = d.lat;
					 d.latlong['longitude'] = d.long;
					 d.idKey = i;
					 $scope.paths.push(d.latlong);
				 }
				 if(d.datetime){
					 d.datetime = (new Date(d.datetime)+'').split('G')[0];
				 }
			 });
			 $scope.mapPins = taskData;
			 $scope.polylines[0]['path'] = ($scope.paths);

			 console.log($scope.polylines);
			 callback(null,'success')
		 }, function (err) {
			 callback('err',null)
		 });
     },
     function(result,callback){
		 var options = {
			 enableHighAccuracy: true,
			 timeout: 1000,
			 maximumAge: 0
		 };

		 function error(err) {
			 callback('err',null)
			 console.warn('ERROR(' + err.code + '): ' + err.message);
		 };

		 navigator.geolocation.getCurrentPosition(function (pos) {
			 var crd = pos.coords;
			 latitudeLongObj.latitude = crd.latitude+'';
			 latitudeLongObj.longitude = crd.longitude+'';
			 console.log('Your current position is:');
			 console.log('Latitude : ' + crd.latitude);
			 console.log('Longitude: ' + crd.longitude);
			 console.log('More or less ' + crd.accuracy + ' meters.');
			 callback(null,'success')
		 }, error, options);
       }
 ], function (err,result) {
		 $scope.currentUserLocation['latlong'] = latitudeLongObj;
		 $scope.currentUserLocation['idKey'] = $scope.mapPins.length;
		 $scope.currentUserLocation['title'] = 'i\'m here';
		 $scope.currentUserLocation['help_type'] = 'Me';
		 $scope.currentUserArr.push($scope.currentUserLocation);
		 /*uiGmapGoogleMapApi.then(function(maps) {
			 //var myBounds = new maps.LatLngBounds();
			 var myBounds;
			 for (var k = 0; k < $scope.paths.length; k++) {
				 lats[k] = $scope.paths[k].latitude;
				 lngs[k] = $scope.paths[k].longitude;
			  }
			 var min_lat = Math.min.apply(Math, lats);
			 var max_lat = Math.max.apply(Math, lats);
			 var min_lng = Math.min.apply(Math, lngs);
			 var max_lng = Math.max.apply(Math, lngs);

			 myBounds = new maps.LatLngBounds(
				 new maps.LatLng(min_lat, min_lng),
				 new maps.LatLng(max_lat, max_lng)
			 );
			 $scope.map.bounds = myBounds;
			 maps.fitBounds($scope.map.bounds);

			 /!*$scope.map.bounds['northeast'] = {};
			 $scope.map.bounds['northeast'].latitude = min_lat;
			 $scope.map.bounds['northeast'].longitude = min_lng;
			 $scope.map.bounds['southwest'] = {};
			 $scope.map.bounds['southwest'].latitude = max_lat;
			 $scope.map.bounds['southwest'].longitude = max_lng;*!/
			 $scope.googleVersion = maps.version;
		 });*/
		 uiGmapGoogleMapApi.then(function(){
			 $scope.fitBounds = function() {
				 var bounds = new google.maps.LatLngBounds();
				 for (var i = 0; i < $scope.paths.length; i++) {
					 bounds.extend(new google.maps.LatLng({lat: $scope.paths[i].latitude, lng: $scope.paths[i].longitude}));
				 }

				 // Set bounds on model.map object.
				 // This causes the map to fit bounds automagically (angular-google-maps functionality?)
				 $scope.map.bounds = {
					 southwest: {
						 latitude: bounds.R.j,
						 longitude: bounds.j.j
					 },
					 northeast: {
						 latitude: bounds.R.R,
						 longitude: bounds.j.R
					 }
				 };

			 };
		 })
		 //$scope.map.center[latitude] = latitudeLongObj.lat
     console.log($scope.currentUserArr)
 });

	$scope.user = Auth.user;
	$scope.signedIn = Auth.signedIn;

	$scope.listMode = true;

	if($routeParams.taskId) {
		var task = Task.getTask($routeParams.taskId).$asObject();
		$scope.listMode = false;
		setSelectedTask(task);
	}
	if($routeParams.userId) {
		//console.log($routeParams.userId);
		 Auth.getProfile($routeParams.userId).$loaded().then(function(x){
			 $scope.userProfile = (x)
		})

	}
/*for mapping*/
	$scope.map = {
		center: { latitude: 43.0766486, longitude: -70.7572347 },
		zoom: 8,
		bounds: {},
		markers: [],
		controls: {
			mapTypeControl: false,
			streetViewControl: false
		},
		events: {
			click: function (map, eventName, originalEventArgs) {
				var e = originalEventArgs[0];
				var lat = e.latLng.lat(),lon = e.latLng.lng();
				var marker = {
					id: Date.now(),
					coords: {
						latitude: lat,
						longitude: lon
					},
					option:{ clickable:true }
				};
				$scope.map.markers.push(marker);
				//console.log($scope.map.markers);
				$scope.$apply();
			},
			infoWindowWithCustomClass: {
				options: {
					boxClass: 'custom-info-window',
					closeBoxDiv: '<div" class="pull-right" style="position: relative; cursor: pointer; margin: -20px -15px;">X</div>',
					disableAutoPan: true
				},
				show: true
			}
		}
	};
	$scope.handleMapPins = function () {
		console.log('kaka')
		$scope.show = true;
	};


	/**/

	function setSelectedTask(task) {
		$scope.selectedTask = task;

		// We check isTaskCreator only if user signedIn
		// so we don't have to check every time normal guests open the task
		if($scope.signedIn()) {

			// Check if the current login user has already made an offer for selected task
			Offer.isOfferred(task.$id).then(function(data) {
				$scope.alreadyOffered = data;
			});

			// Check if the current login user is the creator of selected task
			$scope.isTaskCreator = Task.isCreator;

			// Check if the selectedTask is open
			$scope.isOpen = Task.isOpen;

			// Unblock the Offer button on Offer modal
			// $scope.offer = {close: ''};
			$scope.block = false;

			// Check if the current login user is offer maker (to display Cancel Offer button)
			$scope.isOfferMaker = Offer.isMaker;

			// --------------------------------------------//

			// Check if the current user is assigned fot the selected task
			$scope.isAssignee = Task.isAssignee;

			// Check if the selectedTask is completed
			$scope.isCompleted = Task.isCompleted;

			// Reload current page
			// $window.location.reload();

		}

		// Get list of comments for the selected task
		$scope.comments = Comment.comments(task.$id);

		// Get list of offers for the selected task
		$scope.offers = Offer.offers(task.$id);
	};

	/*img to base64*/
	var handleFileSelect = function(element, cb) {
		var files = element.files;
		var file = files[0];
		if (files && file) {
			var reader = new FileReader();
			reader.addEventListener('load', function () {
				var image = new Image();
				image.height = 100;
				image.title = file.name;
				image.src = this.result;
				cb(this.result);
			}, false);

			reader.readAsDataURL(file);
		}
	};
	// --------------- TASK ---------------

	$scope.cancelTask = function(taskId) {
		Task.cancelTask(taskId).then(function() {
			toaster.pop('success', 'This call for help has been cancelled successfully.');
			$location.path('/browse');
		});
	};

	// --------------------------------------------//

	$scope.completeTask = function(taskId) {
		Task.completeTask(taskId).then(function() {
			toaster.pop('success', 'Congratulation! You have completed this call for help.');
		});
	};

	// --------------- COMMENT ---------------

	$scope.addComment = function() {
		var comment = {
			content: $scope.content,
			name: $scope.user.profile.name,
			gravatar: $scope.user.profile.gravatar,
		};
		var convoImgElement = document.getElementById('convoImg');
		if(convoImgElement.files.length>0){
			handleFileSelect(convoImgElement, function (data) {
				comment.img = data;
				Comment.addComment($scope.selectedTask.$id, comment).then(function() {
					$scope.content = '';
				})
			})
		}else{
			Comment.addComment($scope.selectedTask.$id, comment).then(function() {
				$scope.content = '';
			})
		}

		/*var comment = {
			content: $scope.content,
			name: $scope.user.profile.name,
			gravatar: $scope.user.profile.gravatar
		};

		Comment.addComment($scope.selectedTask.$id, comment).then(function() {
			$scope.content = '';
		});*/
	};

	// --------------- OFFER ---------------

$scope.previewImage = function(that,type){
	var imgId = '';
	var prwImgId = '';
	if(type =='offer'){
		imgId = 'imgupload';
		prwImgId = 'offerimg';
	}else if(type =='post'){
		imgId = 'helpImg'
		prwImgId = 'postimg'
	}else if(type =='post'){
		imgId = 'helpImg'
		prwImgId = 'postimg'
	}
console.log('change occured')
	var imgechge = document.getElementById(imgId);
	handleFileSelect(imgechge, function (data) {
		document.getElementById(prwImgId).src = data;
	})
}
$scope.previewImagePost = function(that,type){
	var imgId = '';
	var prwImgId = '';
	if(type =='offer'){
		imgId = 'imgupload';
		prwImgId = 'offerimg';
	}else if(type =='post'){
		imgId = 'helpImg'
		prwImgId = 'postimg'
	}else if(type =='comment'){
		imgId = 'convoImg'
		prwImgId = 'commentPrwImg'
	}
console.log('change occured');
	var imgechge = document.getElementById(imgId);
	handleFileSelect(imgechge, function (data) {
		document.getElementById(prwImgId).src = data;
	})
}

	$scope.makeOffer = function(element) {
		var offer = {
			total: $scope.total,
			uid: $scope.user.uid,
			name: $scope.user.profile.name,
			gravatar: $scope.user.profile.gravatar
		};
		var imgelement = document.getElementById('imgupload');
		if(imgelement.files.length>0){
			handleFileSelect(imgelement, function (data) {
				document.getElementById('offerimg').src = data;
				offer.img = data;
				Offer.makeOffer($scope.selectedTask.$id, offer).then(function() {
					toaster.pop('success', 'Your offer has been placed.');

					// Mark that the current user has offerred for this task.
					$scope.alreadyOffered = true;

					// Reset offer form
					$scope.total = true;

					// Disable the "Offer Now" button on the modal
					$scope.block = true;
					$('#offModal').modal('hide');
				});
			})
		}else{
			Offer.makeOffer($scope.selectedTask.$id, offer).then(function() {
				toaster.pop('success', 'Your offer has been placed.');

				// Mark that the current user has offerred for this task.
				$scope.alreadyOffered = true;

				// Reset offer form
				$scope.total = true;

				// Disable the "Offer Now" button on the modal
				$scope.block = true;
				$('#offModal').modal('hide');
			});
		}



	};

	$scope.cancelOffer = function(offerId) {
		Offer.cancelOffer($scope.selectedTask.$id, offerId).then(function() {
			toaster.pop('success', 'Your offer has been cancelled.');

			// Mark that the current user has cancelled offer for this task.
			$scope.alreadyOffered = false;

			// Unblock the Offer button on Offer modal
			$scope.block = false;
		});
	};

	// --------------------------------------------//

	$scope.acceptOffer = function(offerId, runnerId) {
		Offer.acceptOffer($scope.selectedTask.$id, offerId, runnerId).then(function() {
			toaster.pop('success', 'Call has been accepted!');

			// Mark that this Task has been assigned
			// $scope.isAssigned = true;

			// Notify assignee
			Offer.notifyRunner($scope.selectedTask.$id, runnerId);
		});
	};

})

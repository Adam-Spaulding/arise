'use strict';

app.controller('BrowseController', function($scope, $routeParams, toaster, Task, Auth, Comment, Offer, NgMap, ProfileService) {
	//uiGmapLogger.currentLevel = uiGmapLogger.LEVELS.debug;
	$scope.searchTask = '';
	$scope.mapPins = [];
	$scope.paths = [];
	$scope.tasks = [];
	//document.getElementById('commentPrwImg').style.display = 'none';
	$scope.polylines = [];
	if(sessionStorage.latLong){
		var sessionedLatLong = JSON.parse(sessionStorage.getItem('latLong'));
	}
	// Set up map defaults etc.
	$scope.googleMapInstance = {};
	$scope.showImg = false;
	$scope.showImgOffer = false;
	$scope.commentImgSrc = '';
	$scope.offerImgSrc = '';
	//document.getElementById('commentPrwImg').style.display = 'none';
	var lats = [];
	var lngs = [];
	var mapx;
	var file;
	$scope.currentUserArr = [];
	if(sessionStorage.latLong){
		var sessionedLatLong = JSON.parse(sessionStorage.latLong)
	}
	var clusterTypes = ['standard','ugly','beer'];
	var selectedClusterTypes = {
		standard:{
			title: 'Click to Zoom', gridSize: 60, ignoreHidden: true, minimumClusterSize: 2
		}
	};
	$scope.clusterProps = {
		doClusterRandomMarkers: true,
		currentClusterType: 'standard',
		clusterTypes: clusterTypes,/*
		selectClusterType: selectClusterType,
		selectedClusterTypes: selectedClusterTypes,*/
		clusterOptions: selectedClusterTypes.standard
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
	/*fb storage*/
	//var storage = firebase.storage();

	$scope.userProfile = {};
	$scope.currentUserLocation = {};
	$scope.userId = $routeParams.userId;
	$scope.show = false;
	/*to get the current user lcoation*/
	var latitudeLongObj = [];

	var options = {
		enableHighAccuracy: true,
		//timeout: 1000,
		maximumAge: 0
	};

	function error(err) {
		console.warn('ERROR(' + err.code + '): ' + err.message);
	};

	navigator.geolocation.getCurrentPosition(function (pos) {
		var crd = pos.coords;
		latitudeLongObj.push(crd.latitude+'');
		latitudeLongObj.push(crd.longitude+'');
		$scope.currentUserLocation['latlong'] = latitudeLongObj;
		$scope.currentUserLocation['idKey'] = $scope.mapPins.length;
		$scope.currentUserLocation['title'] = 'i\'m here';
		$scope.currentUserLocation['help_type'] = 'Me';
		$scope.currentUserArr.push($scope.currentUserLocation);
		sessionStorage.latLong = JSON.stringify(latitudeLongObj)
		console.log('Your current position is:');
		console.log('Latitude : ' + crd.latitude);
		console.log('Longitude: ' + crd.longitude);
		console.log('More or less ' + crd.accuracy + ' meters.');
	}, error, options);
/**/
	Task.all.$loaded(function (tasks) {
		var taskOpen = [];
		$scope.tasks = tasks;
		tasks.map(function (d, i) {
			if(d.status == 'open'){
				$scope.mapPins.push(d)
			}
		})
		//$scope.tasks = tasks;
		/*$scope.dynMarkers = [];

		NgMap.getMap().then(function(map) {
			for (var i = 0; i < $scope.tasks.length; i++) {
				var latLng = new google.maps.LatLng($scope.tasks[i].pos);
				$scope.dynMarkers.push(new google.maps.Marker({position: latLng}));
			}
			$scope.markerClusterer = new MarkerClusterer(map, $scope.dynMarkers, {});
		})*/
	})
	/* async.waterfall([
>>>>>>> Stashed changes
     function(callback){
		 Task.all.$loaded(function (tasks) {
			 var taskOpen = [];
				 $scope.tasks = tasks;
			 var taskData = angular.copy(tasks);
			 taskData.map(function (d, i) {
				 if(d.status == 'open'){
					 taskOpen.push(d)
				 }
			 })
			 taskOpen.map(function(d,i){
				 d.latlong = {};
				 if(d.lat){
					 d.latlong['latitude'] = d.lat;
					 d.latlong['longitude'] = d.long;
					 d.idKey = i;
					 $scope.paths.push(d.latlong);
				 }
				 if(d.status != 'open'){
					 taskData.splice(i,1)
				 }
			 });
			 $scope.mapPins = taskOpen;
			 $scope.polylines[0]['path'] = ($scope.paths);
			 //console.log($scope.polylines);
			 callback(null,'success')
		 }, function (err) {
			 callback('err',null)
		 });
     }
 ], function (err,result) {
     console.log($scope.currentUserArr)
 });*/



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
	NgMap.getMap().then(function(map) {
		$scope.map = map;
	});
	$scope.handleMapPins = function (event, city) {
		console.log(city)
		$scope.selectedCity = city;
		$scope.map.showInfoWindow('myInfoWindow', this);
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
			gravatar: $scope.user.profile.gravatar
		};
		var convoImgElement = document.getElementById('convoImg');
		if(convoImgElement.files.length>0){
			var storageRef = firebase.storage().ref().child($scope.user.uid);
			// Get a reference to store file at photos/<FILENAME>.jpg
			var photoRef = storageRef.child(file.name);
			// Upload file to Firebase Storage
			var uploadTask = photoRef.put(file);
			uploadTask.on('state_changed', null, null, function(snapshot) {
				console.log('success')
				console.log(snapshot)
				// When the image has successfully uploaded, we get its download URL
				var downloadUrl = uploadTask.snapshot.downloadURL;
				comment.img = downloadUrl;
				Comment.addComment($scope.selectedTask.$id, comment).then(function() {
					$scope.content = '';
					document.getElementById('commentPrwImg').src = '';
				})
			});
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

	$scope.previewImage = function (that, type) {
		var imgId = '';
		var prwImgId = '';
		if (type == 'offer') {
			imgId = 'imgupload';
			prwImgId = 'offerimg';
		} else if (type == 'post') {
			imgId = 'helpImg';
			prwImgId = 'postimg';
		} else if (type == 'comment') {
			imgId = 'convoImg';
			prwImgId = 'commentPrwImg';
		}
		console.log('change occured');
		var imgechge = document.getElementById(imgId);
		file = imgechge.files[0];
		handleFileSelect(imgechge, function (data) {
			if (type == 'offer') {
				$scope.showImgOffer = true;
				$scope.offerImgSrc = data;
			} else if (type == 'comment') {
				$scope.showImg = true;
				$scope.commentImgSrc = data;
			}

			//document.getElementById('commentPrwImg').style.display = 'block';
			//document.getElementById(prwImgId).src = data;
		})
	};

	$scope.makeOffer = function(element) {
		var offer = {
			total: $scope.total,
			uid: $scope.user.uid,
			name: $scope.user.profile.name,
			gravatar: $scope.user.profile.gravatar
		};
		var imgelement = document.getElementById('imgupload');
		if(imgelement.files.length>0){
			var storageRef = firebase.storage().ref().child($scope.user.uid);
			// Get a reference to store file at photos/<FILENAME>.jpg
			var photoRef = storageRef.child(file.name);
			// Upload file to Firebase Storage
			var uploadTask = photoRef.put(file);
			uploadTask.on('state_changed', null, null, function(snapshot) {
				console.log('success')
				console.log(snapshot)
				// When the image has successfully uploaded, we get its download URL
				var downloadUrl = uploadTask.snapshot.downloadURL;
				offer.img = downloadUrl;
				Offer.makeOffer($scope.selectedTask.$id, offer).then(function() {
					toaster.pop('success', 'Your offer has been placed.');
					document.getElementById('offerimg').src = '';

					// Mark that the current user has offerred for this task.
					$scope.alreadyOffered = true;

					// Reset offer form
					$scope.total = true;

					// Disable the "Offer Now" button on the modal
					$scope.block = true;
					$('#offModal').modal('hide');
				});
			});
			/*
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
			})*/
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

	//----------------PROFILE-----------------------------------//
	$scope.addInfoToProfile = function (user) {
		console.log(user, $routeParams.userId,$scope.user.auth.uid == $routeParams.userId)
		ProfileService.addUserInfo($routeParams.userId,user).then(function() {
			toaster.pop('success', 'Your call for help has been updated.');
		})
	}


	/*--------------RATING---------------------------------------*/
	$scope.rating = 0;
	$scope.isReadonly = true;
	$scope.rateFunction = function(rating) {
		console.log('Rating selected: ' + rating);
	};
})
	.directive('starRating', function starRating() {
		return {
			restrict: 'EA',
			template:
			'<ul class="star-rating" ng-class="{readonly: readonly}">' +
			'  <li ng-repeat="star in stars" class="star" ng-class="{filled: star.filled}" ng-click="toggle($index)">' +
			'    <i class="fa fa-star"></i>' + // or &#9733
			'  </li>' +
			'</ul>',
			scope: {
				ratingValue: '=ngModel',
				max: '=?', // optional (default is 5)
				onRatingSelect: '&?',
				readonly: '=?'
			},
			link: function(scope, element, attributes) {
				if (scope.max == undefined) {
					scope.max = 5;
				}
				function updateStars() {
					scope.stars = [];
					for (var i = 0; i < scope.max; i++) {
						scope.stars.push({
							filled: i < scope.ratingValue
						});
					}
				};
				scope.toggle = function(index) {
					if (scope.readonly == undefined || scope.readonly === false){
						scope.ratingValue = index + 1;
						scope.onRatingSelect({
							rating: index + 1
						});
					}
				};
				scope.$watch('ratingValue', function(oldValue, newValue) {
					if (newValue) {
						updateStars();
					}
				});
			}
		};
	});

//# sourceMappingURL=browse.js.map

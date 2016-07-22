'use strict';

app.controller('BrowseController', function($scope, $routeParams, toaster, Task, Auth, Comment, Offer) {

	$scope.searchTask = '';
	$scope.mapPins = [];
	Task.all.$loaded(function (tasks) {
		$scope.tasks = tasks;
		var taskData = angular.copy(tasks);
		taskData.map(function(d,i){
			d.latlong = {};
			if(d.lat){
				d.latlong['latitude'] = d.lat;
				d.latlong['longitude'] = d.long;
				d.idKey = i;
			}
			if(d.datetime){
				d.datetime = (new Date(d.datetime)+'').split('G')[0]
			}
		});
		$scope.mapPins = taskData;
	});
	$scope.userProfile = {};
	$scope.userId = $routeParams.userId;
	$scope.show = false;

	$scope.user = Auth.user;
	$scope.signedIn = Auth.signedIn;

	$scope.listMode = true;

	if($routeParams.taskId) {
		var task = Task.getTask($routeParams.taskId).$asObject();
		$scope.listMode = false;
		setSelectedTask(task);
	}
	if($routeParams.userId) {
		console.log($routeParams.userId);
		 Auth.getProfile($routeParams.userId).$loaded().then(function(x){
			 $scope.userProfile = (x)
		})

	}
/*for mapping*/
	$scope.map = {
		center: { latitude: 43.0766486, longitude: -70.7572347 },
		zoom: 8,
		markers: [],
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
				console.log($scope.map.markers);
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

	// --------------- TASK ---------------

	$scope.cancelTask = function(taskId) {
		Task.cancelTask(taskId).then(function() {
			toaster.pop('success', "This call for help has been cancelled successfully.");
			$location.path('/browse');
		});
	};

	// --------------------------------------------//

	$scope.completeTask = function(taskId) {
		Task.completeTask(taskId).then(function() {
			toaster.pop('success', "Congratulation! You have completed this call for help.");
		});
	};

	// --------------- COMMENT ---------------

	$scope.addComment = function() {
		var comment = {
			content: $scope.content,
			name: $scope.user.profile.name,
			gravatar: $scope.user.profile.gravatar
		};

		Comment.addComment($scope.selectedTask.$id, comment).then(function() {
			$scope.content = '';
		});
	};

	// --------------- OFFER ---------------

	$scope.makeOffer = function() {
		var offer = {
			total: $scope.total,
			uid: $scope.user.uid,
			name: $scope.user.profile.name,
			gravatar: $scope.user.profile.gravatar
		};

		Offer.makeOffer($scope.selectedTask.$id, offer).then(function() {
			toaster.pop('success', "Your offer has been placed.");

			// Mark that the current user has offerred for this task.
			$scope.alreadyOffered = true;

			// Reset offer form
			$scope.total = true;

			// Disable the "Offer Now" button on the modal
			$scope.block = true;
			$('#offModal').modal('hide');
		});
	};

	$scope.cancelOffer = function(offerId) {
		Offer.cancelOffer($scope.selectedTask.$id, offerId).then(function() {
			toaster.pop('success', "Your offer has been cancelled.");

			// Mark that the current user has cancelled offer for this task.
			$scope.alreadyOffered = false;

			// Unblock the Offer button on Offer modal
			$scope.block = false;
		});
	};

	// --------------------------------------------//

	$scope.acceptOffer = function(offerId, runnerId) {
		Offer.acceptOffer($scope.selectedTask.$id, offerId, runnerId).then(function() {
			toaster.pop('success', "Call has been accepted!");

			// Mark that this Task has been assigned
			// $scope.isAssigned = true;

			// Notify assignee
			Offer.notifyRunner($scope.selectedTask.$id, runnerId);
		});
	};

});

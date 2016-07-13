'use strict';

app.controller('TaskController', function($scope, $location, toaster, Task, Auth) {

	$scope.createTask = function() {
		$scope.task.status = 'open';
		$scope.task.gravatar = Auth.user.profile.gravatar;
		$scope.task.name = Auth.user.profile.name;
		$scope.task.poster = Auth.user.uid;

		Task.createTask($scope.task).then(function(ref) {
			toaster.pop('success', 'Your call for help has been submitted.');
			$scope.task = {description: '', title: '', help_type: '', image: '', status: 'open', gravatar: '', name: '', poster: ''};
			$location.path('/browse' + ref.key());
			$('#posModal').modal('hide');
		});
	};

	$scope.editTask = function(task) {
		Task.editTask(task).then(function() {
			toaster.pop('success', "Your call for help has been updated.");
			$('#ediModal').modal('hide');
		});
	};

});

'use strict';

app.controller('TaskController', function($scope, $location, toaster, Task, Auth) {

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
	$scope.createTask = function() {
		$scope.task.status = 'open';
		$scope.task.gravatar = Auth.user.profile.gravatar;
		$scope.task.name = Auth.user.profile.name;
		$scope.task.poster = Auth.user.uid;

		var imgelement = document.getElementById('helpImg');
		if(imgelement.files.length>0){
			handleFileSelect(imgelement, function (data) {
				//console.log(data)
				$scope.task.img = data;
				Task.createTask($scope.task).then(function(ref) {
					toaster.pop('success', 'Your call for help has been submitted.');
					$scope.task = {description: '', title: '', help_type: '', image: '', status: 'open', gravatar: '', name: '', poster: ''};
					$location.path('/browse' + ref.key());
					$('#posModal').modal('hide');
				});
			})
		}else{
			Task.createTask($scope.task).then(function(ref) {
				toaster.pop('success', 'Your call for help has been submitted.');
				$scope.task = {description: '', title: '', help_type: '', image: '', status: 'open', gravatar: '', name: '', poster: ''};
				$location.path('/browse' + ref.key());
				$('#posModal').modal('hide');
			});
		}

	};

	$scope.editTask = function(task) {
		Task.editTask(task).then(function() {
			toaster.pop('success', 'Your call for help has been updated.');
			$('#ediModal').modal('hide');
		});
	};

});

//# sourceMappingURL=task.js.map

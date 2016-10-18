'use strict';

app.controller('TaskController', function($scope, $location, toaster, Task, Auth) {

	var file;
	$scope.postImgPrw = false;
	$scope.postImg = '';
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
		//console.log('kaka')
		$scope.task.status = 'open';
		$scope.task.gravatar = Auth.user.profile.gravatar;
		$scope.task.name = Auth.user.profile.name;
		$scope.task.poster = Auth.user.uid;

		var imgelement = document.getElementById('helpImg');
		if(imgelement.files.length>0){
			var storageRef = firebase.storage().ref().child($scope.task.poster);
			// Get a reference to store file at photos/<FILENAME>.jpg
			var photoRef = storageRef.child(file.name);
			// Upload file to Firebase Storage
			var uploadTask = photoRef.put(file);
			uploadTask.on('state_changed', null, null, function(snapshot) {
				console.log('success')
				console.log(snapshot)
				// When the image has successfully uploaded, we get its download URL
				var downloadUrl = uploadTask.snapshot.downloadURL;
				$scope.task.img = downloadUrl;
				Task.createTask($scope.task).then(function(ref) {
					toaster.pop('success', 'Call for help has been submitted.');
					document.getElementById('postimg').src = '';
					$scope.task = {description: '', title: '', help_type: '', image: '', status: 'open', gravatar: '', name: '', poster: ''};
					$location.path('/browse' + ref.key());
					$('#posModal').modal('hide');
				});
			});
		}else{
			Task.createTask($scope.task).then(function(ref) {
				toaster.pop('success', 'Call for help has been submitted.');
				$scope.task = {description: '', title: '', help_type: '', image: '', status: 'open', gravatar: '', name: '', poster: ''};
				$location.path('/browse' + ref.key());
				$('#posModal').modal('hide');
			});
		}

	};

	$scope.previewPostImage = function () {
		var imgechge = document.getElementById('helpImg');
		file = imgechge.files[0];
		handleFileSelect(imgechge, function (data) {
			$scope.postImgPrw = true;
			$scope.postImg = data;
			//document.getElementById('postimg').src = data;
		})
	};

	$scope.editTask = function(task) {
		Task.editTask(task).then(function() {
			toaster.pop('success', 'Call for help has been updated.');
			$('#ediModal').modal('hide');
		});
	};

});

//# sourceMappingURL=task.js.map

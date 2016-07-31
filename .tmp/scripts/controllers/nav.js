'use strict';

app.controller('NavController', function($scope, $location, toaster, Auth) {

	$scope.currentUser = Auth.user;
	$scope.signedIn = Auth.signedIn;

  $scope.logout = function() {
    Auth.logout();
    toaster.pop('success', "Logged out successfully");
    $location.path('/login');
  };
$scope.routeToProfilepage = function () {
	$location.path('/profile');
}
	$scope.status = {
		isopen: false
	};

	$scope.toggled = function(open) {
		$log.log('Dropdown is now: ', open);
	};

	$scope.toggleDropdown = function($event) {
		$event.preventDefault();
		$event.stopPropagation();
		$scope.status.isopen = !$scope.status.isopen;
	};

	$scope.appendToEl = angular.element(document.querySelector('#dropdown-long-content'));

});

//# sourceMappingURL=nav.js.map

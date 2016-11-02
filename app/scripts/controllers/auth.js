app.controller('AuthController', function($scope, $location, toaster, Auth, $cordovaOauth) {
var fbAppId = '980336382079406';
  if(Auth.signedIn()) {
    $location.path('/');
  }

	$scope.register = function(user) {
    Auth.register(user)
      .then(function() {
        toaster.pop('success', 'Registered successfully');
        $location.path('/');
      }, function(err) {
        errMessage(err);
      });
  };

	$scope.login = function(user) {
     Auth.login(user)
      .then(function() {
             console.log(data)
        toaster.pop('success', 'Logged in successfully');
        $location.path('/');
      }, function(err) {
        errMessage(err);
      });
	};

	$scope.changePassword = function(user) {
     Auth.changePassword(user)
      .then(function() {

        // Reset form
        $scope.email = '';
        $scope.oldPass = '';
        $scope.newPass = '';

        toaster.pop('success', 'Password changed successfully');
      }, function(err) {
        errMessage(err);
      });
  };

    $scope.fbSignup = function(){
        if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) && screen.width <= 480){
            $cordovaOauth.facebook(fbAppId, ['email', 'read_stream', 'user_website', 'user_location', 'user_relationships']).then(function(result) {
                //$localStorage.accessToken = result.access_token;
                //$location.path("/profile");
                console.log(result)
                alert(result)
            }, function(error) {
                alert('There was a problem signing in!  See the console for logs');
                console.log(error);
            });
        }else{
            Auth.fbAuth(function() {
                toaster.pop('success', 'Logged in successfully');
                $location.path('/');
            }, function(err) {
                errMessage(err);
            })
            console.log('kaka')
        }
    }
	function errMessage(err) {

    var msg = 'Unknown Error...';

    if(err && err.code) {
      switch (err.code) {
        case 'EMAIL_TAKEN':
          msg = 'This email has been taken'; break;
        case 'INVALID_EMAIL':
          msg = 'Invalid email'; break;
        case 'NETWORK_ERROR':
          msg = 'Network error'; break;
        case 'INVALID_PASSWORD':
          msg = 'Invalid password'; break;
        case 'INVALID_USER':
          msg = 'Invalid user'; break;
      }
    }

    toaster.pop('error', msg);
  };
      function thirdPartyLogin(provider) {
        var deferred = $.Deferred();
        rootRef.authWithOAuthPopup(provider, function (err, user) {
            if (err) {
                deferred.reject(err);
            }
            if (user) {
                deferred.resolve(user);
            }
        });
        return deferred.promise();
    };

});

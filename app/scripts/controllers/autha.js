angular.module('firebase.auth', ['firebase', 'firebase.utils'])
  .factory('Auth', ['$firebaseAuth', 'fbutil', function($firebaseAuth, fbutil) {
    return $firebaseAuth(fbutil.ref());
  }])

  .factory('User', ['Auth', '$firebaseObject', 'fbutil', '$q', function(Auth, $firebaseObject, fbutil, $q) {
    var observerCallbacks = [];

    var dataFactory = {};

    dataFactory.registerObserverCallback = function(callback){
      observerCallbacks.push(callback);
      callback();
    };

    var notifyObservers = function(){
      angular.forEach(observerCallbacks, function(callback){
        callback();
      });
    };

    dataFactory.changeName = function(fname, lname) {
      var rec = fbutil.ref('users/' + dataFactory.uid);
      var promise1 = rec.child('fname').set(fname);
      var promise2 = rec.child('lname').set(lname);

      $q.all([promise1, promise2]).then(function(data){
      	dataFactory.name = fname + ' ' + lname;
        notifyObservers();
      });
    }

    Auth.$onAuth(function(authData) {
      if (authData) {
        console.log(authData);
        var getId = function(uid) {
          return uid.split(':')[1];
        };

        if (authData.facebook) {
          dataFactory.name = authData.facebook.displayName;
          console.log('dataFactory.name ' + dataFactory.name);
          dataFactory.avatar = 'https://graph.facebook.com/' + getId(authData.uid) + '/picture?type=square';
          dataFactory.social = true;
          notifyObservers();
        } else if (authData.google) {
          dataFactory.name = authData.google.displayName;
          dataFactory.avatar = authData.google.profileImageURL;
          dataFactory.social = true;
          notifyObservers();
        } else {
          dataFactory.email = authData.password.email;
          dataFactory.uid = authData.uid;
          var profile = fbutil.ref().child('users').child(authData.uid);

          $firebaseObject(profile).$loaded()
            .then(function(data) {
              dataFactory.name = data.fname + ' ' + data.lname;
              dataFactory.social = false;
              // dataFactory.avatar = 'account-circle.svg';
              notifyObservers();
            })
            .catch(function(error) {
              console.error("Error:", error);
            });
        }
      } else {
        console.log("Logged out");
      }
    });

    return dataFactory;
  }]);

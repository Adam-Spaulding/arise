'use strict';

var app = angular
  .module('ariseApp', [
    'ngAnimate',
    'ngResource',
    'ngRoute',
    'firebase',
    'toaster',
    'angularMoment',
    'ngAnimate',
    'ngMap'
    //'uiGmapgoogle-maps'
  ])
  .constant('FURL', 'https://incandescent-torch-3403.firebaseio.com')
    .config(function() {
      // Initialize Firebase
      var config = {
        apiKey: "AIzaSyA6Trl9aaibXQPAWdQ3VSLWt2bEJL1fFO0",
        authDomain: "incandescent-torch-3403.firebaseapp.com",
        databaseURL: "https://incandescent-torch-3403.firebaseio.com",
        storageBucket: "incandescent-torch-3403.appspot.com",
        messagingSenderId: "479569875105"
      };
      firebase.initializeApp(config);
    })
  .constant('TaskStatus', {
    OPEN: 'open',
    COMPLETED: 'completed',
    CANCELED: 'cancelled',
    ASSIGNED: 'assigned'
  })
  .run(function($rootScope, $location) {
    $rootScope.$on('$routeChangeError', function(event, next, previous, error) {
      // We can catch the error thrown when the $requireAuth promise is rejected
      // and redirect the user back to the login page
      if (error === 'AUTH_REQUIRED') {
        $location.path('/login');
      }
    });
  })/*
    .config(
     function(uiGmapGoogleMapApiProvider) {
       uiGmapGoogleMapApiProvider.configure({
        china: true,
         libraries: 'weather,geometry,visualization'
      })
    })*/
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/dashboard.html',
        controller: 'BrowseController',
        resolve: {
          currentAuth: function(Auth) {
            return Auth.requireAuth();
          }
        }
      })
      .when('/callforhelp', {
        templateUrl: 'views/partials/post.html',
        controller: 'TaskController',
        resolve: {
          currentAuth: function(Auth) {
            return Auth.requireAuth();
          }
        }
      })
      .when('/map', {
        templateUrl: 'views/map.html',
        controller: 'BrowseController'
        // resolve: {
        //   currentAuth: function(Auth) {
        //     return Auth.requireAuth();
        //   }
        // }
      })
      .when('/_/:taskId?', {
        templateUrl: 'views/map.html',
        controller: 'BrowseController',
        resolve: {
          currentAuth: function(Auth) {
            return Auth.requireAuth();
          }
        }
      })
      .when('/profile/:userId?', {
        templateUrl: 'views/profile.html',
        controller: 'BrowseController',
        resolve: {
          currentAuth: function(Auth) {
            return Auth.requireAuth();
          }
        }
      })
      .when('/call/:taskId?', {
        templateUrl: 'views/call.html',
        controller: 'BrowseController',
        resolve: {
          currentAuth: function(Auth) {
            return Auth.requireAuth();
          }
        }
      })
      .when('/register', {
        templateUrl: 'views/register.html',
        controller: 'AuthController'
      })
      .when('/login', {
        templateUrl: 'views/login.html',
        controller: 'AuthController'
      })
      .when('/mycalls', {
        templateUrl: 'views/dashboard.html',
        routeKey: 'mycalls',
        controller: 'BrowseController',
        resolve: {
          currentAuth: function(Auth) {
            return Auth.requireAuth();
          }
        }
      })
      .otherwise({
        redirectTo: '/login'
      });
  });

  app.controller('ctrl', function($scope, $rootScope){
  $rootScope.$on('$routeChangeStart', function(event, currRoute, prevRoute){
  $rootScope.animation = currRoute.animation;
  });
});

//# sourceMappingURL=app.js.map

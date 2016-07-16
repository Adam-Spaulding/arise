'use strict';

var app = angular
  .module('ariseApp', [
    'ngAnimate',
    'ngResource',
    'ngRoute',
    'firebase',
    'toaster',
    'angularMoment',
    'ngMap'
  ])
  .constant('FURL', 'https://arisedev.firebaseio.com')
  .constant('TaskStatus', {
    OPEN: 'open',
    COMPLETED: 'completed',
    CANCELED: 'cancelled',
    ASSIGNED: 'assigned'
  })
  .run(function($rootScope, $location) {
    $rootScope.$on("$routeChangeError", function(event, next, previous, error) {
      // We can catch the error thrown when the $requireAuth promise is rejected
      // and redirect the user back to the login page
      if (error === "AUTH_REQUIRED") {
        $location.path("/login");
      }
    });
  })
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/browse.html',
        controller: 'BrowseController',
        resolve: {
          currentAuth: function(Auth) {
            return Auth.requireAuth();
          }
        }
      })
      .when('/profile', {
        templateUrl: 'views/profile.html',
        controller: 'BrowseController',
        resolve: {
          currentAuth: function(Auth) {
            return Auth.requireAuth();
          }
        }
      })
      .when('/browsedetails/:taskId?', {
        templateUrl: 'views/browsedetails.html',
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
      .when('/pickedupcalls', {
        templateUrl: 'views/pickedupcalls.html',
        routeKey: 'pickedupcalls',
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

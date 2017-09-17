var app = angular.module("app", ['ngRoute']);
app.config(["$routeProvider", "$locationProvider", '$controllerProvider', '$qProvider', function($routeProvider, $locationProvider, $controllerProvider, $qProvider) {
  $routeProvider
  .when('/', {
    templateUrl: 'src/views/home.html'
  })
  .when('/search', {
    templateUrl: 'src/views/search.html'
  })
  .when('/:place', {
    templateUrl: 'src/views/home.html'
  })
  .otherwise({
    redirectTo: '/'
  });
  $locationProvider.html5Mode(true);

  $qProvider.errorOnUnhandledRejections(false);

  // Activate lazy-loading of controllers:
  app._controller = app.controller;
  app.controller = function( name, constructor ) {
    $controllerProvider.register( name, constructor );
    return( this );
  };
}]);

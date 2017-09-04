var app = angular.module("app", ['ngRoute']);
app.config(["$routeProvider", "$sceProvider", "$locationProvider", '$controllerProvider', '$provide', '$compileProvider', '$filterProvider', '$sceDelegateProvider', function($routeProvider, $sceProvider, $locationProvider, $controllerProvider, $provide, $compileProvider, $filterProvider, $sceDelegateProvider) {
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
  $sceProvider.enabled(true);

  $locationProvider.html5Mode(true);

  // Activate lazy-loading of controllers:
  app._controller = app.controller;
  app.controller = function( name, constructor ) {
    $controllerProvider.register( name, constructor );
    return( this );
  };
}]);

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

  // Activate lazy-loading of modules:
  app._controller = app.controller;
  //app._service = app.service;
  //app._factory = app.factory;
  //app._value = app.value;
  //app._directive = app.directive;
  // Provider-based controller.
  app.controller = function( name, constructor ) {
    $controllerProvider.register( name, constructor );
    return( this );
  };
  // Provider-based service.
  /*app.service = function( name, constructor ) {
    $provide.service( name, constructor );
    return( this );
  };*/
  // Provider-based factory.
  /*app.factory = function( name, factory ) {
    $provide.factory( name, factory );
    return( this );
  };*/
  // Provider-based value.
  /*app.value = function( name, value ) {
    $provide.value( name, value );
    return( this );
  };*/
  // Provider-based directive.
  /*app.directive = function( name, factory ) {
    $compileProvider.directive( name, factory );
    return( this );
  };*/
  // Provider-based filter
  /*app.filter = function (name, constructor) {
    $filterProvider.register(name, constructor);
    return( this );
  };*/
}]);

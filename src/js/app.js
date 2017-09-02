var app = angular.module("app", ['ngRoute']);
app.value('domain', !location.host.includes(":") ? location.host.match(/[w]{3}?\.(.*)\..*/)[1] : location.host);

app.config(["$routeProvider", "$sceProvider", "$locationProvider", '$controllerProvider', '$provide', '$compileProvider', '$filterProvider', '$sceDelegateProvider', function($routeProvider, $sceProvider, $locationProvider, $controllerProvider, $provide, $compileProvider, $filterProvider, $sceDelegateProvider) {

  $routeProvider
  .when('/search', {
    templateUrl: '/src/views/search.html'
  })
  .otherwise({
    templateUrl: '/src/views/home.html'
  });
  $sceProvider.enabled(true);

  $locationProvider.html5Mode(true);

  // Activate lazy-loading of modules:
  app._controller = app.controller;
  app._service = app.service;
  app._factory = app.factory;
  app._value = app.value;
  app._directive = app.directive;
  // Provider-based controller.
  app.controller = function( name, constructor ) {
    $controllerProvider.register( name, constructor );
    return( this );
  };
  // Provider-based service.
  app.service = function( name, constructor ) {
    $provide.service( name, constructor );
    return( this );
  };
  // Provider-based factory.
  app.factory = function( name, factory ) {
    $provide.factory( name, factory );
    return( this );
  };
  // Provider-based value.
  app.value = function( name, value ) {
    $provide.value( name, value );
    return( this );
  };
  // Provider-based directive.
  app.directive = function( name, factory ) {
    $compileProvider.directive( name, factory );
    return( this );
  };
  // Provider-based filter
  /*app.filter = function (name, constructor) {
    $filterProvider.register(name, constructor);
    return( this );
  };*/
}]);

app.service('initialJSON', ['$http', 'domain', function ($http, domain) {
  var vm = this;
  var suf = "";
  vm.noNeed = false;
  let url = '/src/js/initialJSON.php'+suf;
  if ("onLine" in navigator && !navigator.onLine) "data:application/json;base64,W10=";
  vm.json = $http.get(url);
  if (/^(([1-9]?\d|1\d\d|2[0-4]\d|25[0-5])(\.(?!$)|(?=$))){4}$/.test(window.location.pathname.split('/')[1])) suf = '?ip='+window.location.pathname.split('/')[1];
  /*if ((/\/([\w%-]+\/){2,3}[\w%-]+\/?/i.test(window.location.pathname)) || (typeof(Storage) !== "undefined" && typeof localStorage.yrString !== "undefined" && localStorage.locationExpiry > Date.now())) {
    vm.noNeed = true;
  }*/
}]);

/*app.service('jqueryLoaded', ['$http', function ($http) {
  var vm = this;
  vm.request = $http.get('https://code.jquery.com/jquery-2.2.3.min.js');
  vm.request.success(function (data) {
    eval(data);
  });
}]);*/

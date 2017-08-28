app.controller('masterCtrl', ['$http', '$window', '$rootScope', '$scope', '$location', '$timeout', '$injector', 'initialJSON', 'version', 'domain', function($http, $window, $rootScope, $scope, $location, $timeout, $injector, initialJSON, version, domain) {
  var vm = this;
  vm.disabled = false;
  var block = false;
  var bs = 'font-family:ubuntu;color:#3c763d;background-color: #dff0d8;padding:3px;font-size:15px;';
  vm.norsk = (navigator.language.indexOf('nb')>-1 || navigator.language.indexOf('nn')>-1 || navigator.language.indexOf('no')>-1 || window.location.search.indexOf('lang=no')>-1)  && !(window.location.search.indexOf('lang=en')>-1);
  vm.loc = "";
  vm.desc = "";
  vm.data = [];
  vm.fail = false;
  vm.weatherDataLoaded = false;
  vm.deviceTurned = true;
  vm.online = "onLine" in navigator && navigator.onLine;
  console.log("homeCtrl-scope:", $scope);

  vm.lazyModulesLoaded = false;
  vm.location = "";
  vm.yrCredit = true;
  vm.recents = {};

  vm.css = "";

  if (typeof(Storage) !== "undefined" && localStorage.hasOwnProperty('recents')) {
    vm.recents = JSON.parse(localStorage.recents);
  }

  vm.ifHome = function () {
    return $location.path() == "/";
  }
  vm.ifSearch = function () {
    return $location.path() == "/search";
  }
  vm.ifAt = function (x) {
    return $location.path() == x;
  }
  vm.goTo = function (x) {
    $location.path(x);
  }
  vm.yrStringProvided = function () {
    return /\/([\w%-]+\/){2,3}[\w%-]+\/?/i.test(window.location.pathname);
  }
  vm.shorten = function (input) {
    if (typeof input == 'string' && input.match(/\s.*/) !== null) {
      return input.replace(/\s.*/, '').replace(/,.*/, '');
    }
    return input;
  }
  vm.toggle = function (day, group) {
    vm.data[day].showFull[group] = !vm.data[day].showFull[group];
  }

  if (typeof(Storage) !== "undefined" && typeof localStorage.lazyModules !== "undefined" && localStorage.lmv == version) {
    eval(localStorage.lazyModules);
    vm.lazyModulesLoaded = true;
  } else {
    $http.get('/static/js/lazyModules.php?d='+Date.now()).success(function (data) {
      eval(data);
      vm.lazyModulesLoaded = true;
      if (typeof(Storage) !== "undefined") {
        localStorage.lazyModules = data;
        localStorage.lmv = version;
      }
    });
  }

  if (navigator.userAgent.indexOf('Speed Insights')==-1 && navigator.onLine) {
    $http.get('/static/js/scripts/analytics.js').success((data)=>eval(data));
  }

  var divs = document.getElementsByClassName('content');
  for (i=0;i<divs.length;i++) {
    divs[i].setAttribute('style', 'display:block');
  }

}]);

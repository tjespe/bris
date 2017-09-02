app.controller('masterCtrl', ['$http', '$window', '$rootScope', '$scope', '$location', '$timeout', '$injector', 'initialJSON', 'version', 'domain', function($http, $window, $rootScope, $scope, $location, $timeout, $injector, initialJSON, version, domain) {
  let vm = this;
  vm.data = [];
  vm.fail = false;
  vm.weatherLoaded = ()=>vm.data.length > 0;
  vm.hideFlipDeviceTip = true;
  vm.online = "onLine" in navigator && navigator.onLine;
  vm.lazyModulesLoaded = false;
  vm.css = "";
  vm.location = "";
  vm.recents = {};

  vm.textData = {};
  vm.availableLangs = ['en','no'];
  vm.lang = navigator.language;

  // Check if language is requested in url
  if((window.location.href).includes("lang=")){
    vm.lang=(window.location.href).replace(/.+lang=/,"");
  }

  // Rewrite Norwegian Bokmål and Norwegian Nynorsk to Norwegian
  vm.lang = (vm.lang == 'nb' || vm.lang == 'nn') ? 'no' : vm.lang;

  // Check against the available languages
  vm.lang = vm.availableLangs.indexOf(vm.lang)>-1 ? vm.lang : 'en';

  // Fetch text data
  $http.get('/static/js/objects/'+vm.lang+'-text.json').then((response)=>{
    vm.textData = response.data;
  }).catch((data, status)=>{
    console.log(data, status);
    confirm('Unable to load textdata, do you want to reload the page?') ? location.reload(true) : null;
  });

  // Load recently fetched weather data from localStorage
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
  vm.shorten = function (input) {
    if (typeof input == 'string' && input.match(/\s.*/) !== null) {
      return input.replace(/\s.*/, '').replace(/,.*/, '');
    }
    return input;
  }
  /*vm.toggle = function (day, group) {
    vm.data[day].showFull[group] = !vm.data[day].showFull[group];
  }*/
  vm.toggle = (i, j)=>{
    if (vm.data[i].data[j].data.length > 0) vm.data[i].data[j].currently_summarized = !vm.data[i].data[j].currently_summarized;
  }

  // Load the rest of the javascript code
  if (typeof(Storage) !== "undefined" && typeof localStorage.lazyModules !== "undefined" && localStorage.lmv == version) { // Load the code from localStorage
    eval(localStorage.lazyModules);
    vm.lazyModulesLoaded = true;
  } else { // Load the code from the server
    $http.get('/static/js/lazyModules.php?d='+Date.now()).success(function (data) {
      eval(data);
      vm.lazyModulesLoaded = true;
      if (typeof(Storage) !== "undefined") {
        localStorage.lazyModules = data;
        localStorage.lmv = version;
      }
    });
  }

  // Fetch Google Analytics code if the client is not a robot
  if (navigator.userAgent.indexOf('Speed Insights')==-1 && navigator.onLine) {
    $http.get('/static/js/scripts/analytics.js').success((data)=>eval(data));
  }

  // Show the hidden divs
  let divs = document.getElementsByClassName('content');
  for (i=0;i<divs.length;i++) {
    divs[i].setAttribute('style', 'display:block');
  }

  // This function loads CSS from a URL and puts it in a <style> element in the HTML code
  function loadCSS (url) {
    if (typeof localStorage[url] !== 'undefined') {
      vm.css += localStorage[url];
    } else {
      $http.get(url).success((data)=>{
        vm.css += data;
        localStorage[url] = data;
      });
    }
  }
  loadCSS("/static/css/ubuntu.php");
  loadCSS("/static/css/glyphicons.min.css");

}]);

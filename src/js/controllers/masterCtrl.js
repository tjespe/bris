app.controller('masterCtrl', ['$http', '$window', '$rootScope', '$scope', '$location', '$timeout', '$injector', 'version', '$httpx', function($http, $window, $rootScope, $scope, $location, $timeout, $injector, version, $httpx) {
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
  vm.domain = location.host;

  vm.width = $window.innerWidth;
  vm.height = $window.innerHeight;

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
  $httpx.get('src/js/objects/'+vm.lang+'-text.json', {lifetime:1000*60*60*24*10}).then(function successCallback(data) {
    vm.textData = data;
  }).catch(function errorCallback(data) {
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
  vm.toggle = (i, j)=>{
    if (vm.data[i].data[j].data.length > 1) vm.data[i].data[j].currently_summarized = !vm.data[i].data[j].currently_summarized;
  }
  vm.ifNoForeground = (data)=>{
    return typeof data.foreground === "undefined" || data.foreground.length < 1;
  }

  // Load the rest of the javascript code
  if (typeof(Storage) !== "undefined" && typeof localStorage.lazyModules !== "undefined" && localStorage.lmv == version) { // Load the code from localStorage
    eval(localStorage.lazyModules);
    vm.lazyModulesLoaded = true;
  } else { // Load the code from the server
    $http.get('min/lazy-modules.min.js?d='+Date.now()).then(function (response) {
      eval(response.data);
      vm.lazyModulesLoaded = true;
      if (typeof(Storage) !== "undefined") {
        localStorage.lazyModules = response.data;
        localStorage.lmv = version;
      }
    });
  }

  // Fetch Google Analytics code if the client is not a robot
  if (navigator.userAgent.indexOf('Speed Insights')==-1 && navigator.onLine) {
    $httpx.get('src/js/scripts/analytics.js', {lifetime: Infinity}).then(function successCallback(data) {eval(data)});
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
      $httpx.get(url, {lifetime:1000*60*60*24*10}).then((data)=>{
        vm.css += data;
        localStorage[url] = data;
      });
    }
  }
  loadCSS("src/css/ubuntu.css");
  loadCSS("src/css/glyphicons.min.css");

}]);

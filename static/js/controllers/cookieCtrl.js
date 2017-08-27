app.controller('cookieCtrl', ['$timeout', '$scope', function ($timeout, $scope) {
  var vm = this;
  vm.elem = document.getElementsByClassName('cookie-box')[0];
  vm.template = "";

  vm.close = function () {
    vm.elem = document.getElementsByClassName('cookie-box')[0];
    try {
      vm.elem.setAttribute('style', 'opacity:0;');
    } catch (e) {console.warn(e);}
    if (typeof(Storage) !== "undefined") {
      localStorage.cookieAccept = "true";
    } else {
      document.cookie = "cookiescriptaccept=visit"
    }
    $timeout(()=>{
      vm.elem.parentNode.removeChild(vm.elem);
    }, 500);
  }

  if ((typeof(Storage) !== "undefined" && localStorage.cookieAccept != "true") && getCookieValue("cookiescriptaccept") != "visit") {
    $timeout(function () {
      vm.elem = document.getElementsByClassName('cookie-box')[0];
      vm.elem.setAttribute('style', 'opacity:1;');
      $timeout(vm.close, 5000);
    }, 2500);
  } else vm.elem.parentNode.removeChild(vm.elem);

  function getCookieValue(a, b) {
    b = document.cookie.match('(^|;)\\s*' + a + '\\s*=\\s*([^;]+)');
    return b ? b.pop() : '';
  }
}]);

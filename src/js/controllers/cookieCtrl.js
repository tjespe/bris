app.controller('cookieCtrl', ['$timeout', '$scope', function ($timeout, $scope) {
  let vm = this;
  vm.closed = false;
  vm.transparent = true;

  vm.close = function () {
    if (typeof(Storage) !== "undefined") localStorage.cookieAccept = "true";
    else document.cookie = "cookieaccept=visit";
    vm.transparent = true;
    $timeout(()=>vm.closed = true, 500);
  }

  if ((typeof(Storage) !== "undefined" && localStorage.cookieAccept != "true") && getCookieValue("cookieaccept") != "visit") {
    $timeout(function () {
      vm.transparent = false;
      $timeout(vm.close, 5000);
    }, 2500);
  } else vm.close();

  function getCookieValue(a, b) {
    b = document.cookie.match('(^|;)\\s*' + a + '\\s*=\\s*([^;]+)');
    return b ? b.pop() : '';
  }
}]);

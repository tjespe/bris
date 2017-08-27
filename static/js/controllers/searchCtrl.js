app.controller('searchController', ['$http', '$scope', '$q', 'domain', function($http, $scope, $q, domain) {
  var vm = this;
  vm.query = "";
  vm.matches = [];
  vm.error = false;

  vm.search = function () {
    $http.get('/static/php/search.php?q='+vm.query).success(function (data) {
      vm.matches = data[1];
    }).error(function (data,status) {
      console.warn("Feil:", data, status);
    });
  }

}]);

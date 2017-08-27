app.controller('searchController', ['$http', '$scope', '$q', 'domain', function($http, $scope, $q, domain) {
  var vm = this;
  var canceler = $q.defer();
  vm.query = "";
  vm.matches = [];
  vm.error = false;
  vm.userSearched = false;

  vm.search = function () {
    //canceler.resolve();
    $http.get('/static/php/search.php?q='+vm.query, {timeout: canceler.promise}).success(function (data) {
      vm.userSearched = true;
      vm.matches = data[1];
      console.log("Yr svarte, respons:", data);
      console.log("vm.matches nå:", vm.matches);
    }).error(function (data,status) {
      console.log("Feil:", data, status);
    });
  }

}]);

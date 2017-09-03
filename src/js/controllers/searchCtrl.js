app.controller('searchController', ['$http', '$scope', '$q', '$sce', function($http, $scope, $q, $sce) {
  var vm = this;
  vm.query = "";
  vm.matches = [];
  vm.error = false;

  vm.search = function () {
    $http.get("https://real-timer-server.tk:2087/place-search.php?input="+vm.query).success((data)=>{
      console.log(data);
      vm.matches = data.predictions;
      for (let i = 0;i < vm.matches.length;i++) {
        // This will produce a correct URL for most countries, if any exceptions are discovered, find the correct URL here: https://raw.githubusercontent.com/divyabiyani/Countries-Flag-API/master/Countries.json
        let country = vm.matches[i].terms[vm.matches[i].terms.length - 1].value;
        if (country == "United States") country = "usa";
        if (country == "Iran") country = "irn";
        if (country == "United Kingdom") country = "gbr";
        if (country == "Germany") country = "deu";
        if (country == "Spain") country = "esp";
        if (country == "Malaysia") country = "mys";
        if (country == "Malta") country = "mlt";
        if (country == "United Arab Emirates") country = "are";
        if (country == "Japan") country = "jpn";
        if (country == "Denmark") country = "dnk";
        if (country == "Philippines") country = "phl";
        vm.matches[i].country = country.substr(0,3).toLowerCase();
      }
    });
  }
}]);

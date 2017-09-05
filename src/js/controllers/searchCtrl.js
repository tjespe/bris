app.controller('searchController', ['$http', '$scope', '$q', '$sce', '$httpx', function($http, $scope, $q, $sce, $httpx) {
  var vm = this;
  vm.query = "";
  vm.matches = [];
  vm.error = false;

  vm.search = function () {
    let get_params = "?input="+encodeURIComponent(vm.query);
    $httpx.get("https://real-timer-server.tk:2087/place-search.php"+get_params, {lifetime: Infinity, alt_urls: "https://script.google.com/macros/s/AKfycby5ASPEN1ESxoUZru80yqRXBNVm4C5MkDcHL5asJs3KADFW1huc/exec"+get_params}).then((data)=>{
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

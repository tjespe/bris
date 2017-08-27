console.log("Lazystuff is loaded");
app.controller("lazyStuff", ['$http', '$scope', '$window', '$location', 'domain', function ($http, $scope, $window, $location, domain) {

  console.log("Executing lazyStuff.js");

  var master = $scope.master;
  var vm = this;
  $scope.master.fail = false;
  $scope.master.data = [];
  $scope.master.weatherDataLoaded = false;
  vm.timezone = -(new Date().getTimezoneOffset()/60);
  vm.zip = 0;
  vm.rawdata = [];
  $scope.master.yrCredit = true;
  initialJSON.noNeed = /\/([\w%-]+\/){2,3}[\w%-]+\/?/i.test(window.location.pathname) || /^(([1-9]?\d|1\d\d|2[0-4]\d|25[0-5])(\.(?!$)|(?=$))){4}$/.test(window.location.pathname);
  vm.dataExist = false;
  vm.recentIndex = 0;
  for (var index in $scope.master.recents) {
    if ($scope.master.recents.hasOwnProperty(index)) {
      if (Date.now()-$scope.master.recents[index].info.savedAt>1800000 && navigator.onLine) {
        delete $scope.master.recents[index];
      }
    }
  }
  if ($scope.master.recents.hasOwnProperty($location.path())) {
    vm.dataExist = true;
    vm.recentIndex = $location.path();
  }

  if (!vm.dataExist) {
    console.log("Didn't find data in recent data, making requests to server...");
    if ((typeof(Storage) === "undefined" || (typeof(Storage) !== "undefined" && localStorage.deviceTurned != "true")) && $scope.view.width <= 515) {
      $scope.master.deviceTurned = false;
    }

    var fra, til, i, exact;
    if ($scope.master.norsk) {
      vm.days = ['Søndag', 'Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag'];
      fra = "fra";
      til = "til";
      i = " i ";
      exact = "din posisjon";
    } else {
      vm.days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      fra = "from";
      til = "to";
      i = ", ";
      exact = "your exact position";
    }

    $scope.master.disabled = false;

    vm.weatherWarning = false;
    vm.yrString = "";

    var wsuf = "";
    if (window.location.search.indexOf('lang=no')>-1) wsuf = '&lang=no';
    if (window.location.search.indexOf('lang=en')>-1) wsuf = '&lang=en';

    function getLocation() {
      if (!/\/([\w%-]+\/){2,3}[\w%-]+\/?/i.test(window.location.pathname) && !/^(([1-9]?\d|1\d\d|2[0-4]\d|25[0-5])(\.(?!$)|(?=$))){4}$/.test(window.location.pathname)) {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(posSuccess, posErr);
        } else {
          console.log("Geolocation is not supported by this browser.");
          manualFetch();
        }
      } else {
        manualFetch();
      }
    }

    function posSuccess(position) {
      if (!/\/([\w%-]+\/){2,3}[\w%-]+\/?/i.test(window.location.pathname) && !/^(([1-9]?\d|1\d\d|2[0-4]\d|25[0-5])(\.(?!$)|(?=$))){4}$/.test(window.location.pathname)) {
        console.log("Position accessed successfully", position);
        $scope.master.location = exact;
        var url = 'https://static.'+domain+'.tk/php/location-weather.php?lat='+position.coords.latitude+'&long='+position.coords.longitude+'&gmt='+vm.timezone+'&d='+Math.round(Date.now()/(1000*60*30));
        $http.get(url).success(function (data) {
          /*$scope.master.data = data.data;
          for (var i = 0; i < $scope.master.data.length; i++) {
            $scope.master.data[i].time = vm.days[$scope.master.data[i].day] +' '+ $scope.master.data[i].hour+'-'+$scope.master.data[i].hourTo;
          }*/
          $scope.master.yrCredit = false;
          Array.prototype.push.apply(vm.rawdata, data.data);
          //weatherLoaded(data.data);
          weatherLoaded();
        }).error(function (data, status) {
          manualFetch();
        });
      } else {
        console.log("Position accessed successfully, but will not be used because yrString is specified in URL");
        manualFetch();
      }
    }

    function posErr(status) {
      console.log('Couldn\'t fetch position, status:',status);
      manualFetch();
    }

    getLocation();

    function manualFetch() {
      if (!initialJSON.noNeed) {
        console.log("noNeed == false", initialJSON.noNeed);
        initialJSON.json.success(function (data) {
          console.log("IP-data:", data.ipData);
          if (data.ipData.status != "fail") {
            vm.zip = data.ipData.zip_code;
            var country = data.ipData.country_name.split(' ').join('_').replace("'", "’").replace('British_Virgin_Islands', 'Jomfruøyene_(Britisk)').replace(',_and', '_og').replace('Sint', 'Saint');
            var region = data.ipData.region_name.split(' ').join('_')
            .replace('_County', '')
            .replace('_Fylke', '')
            .split('_(')[0]
            .replace('Provincie_','')
            .replace("'", "’")
            .replace('oe', 'ö')
            .replace('Qarku_i_Tiranes', 'Tirana')
            .replace('_City', '')
            .replace('Ho_Chi_Minh', 'Hồ_Chí_Minh')
            .replace('Thanh_Pho_Ha_Noi', 'Ha_Nội')
            .replace('Region_du_', '')
            .replace('_Capital_Territory', '')
            .replace('Central_Singapore_Community_Development_Council', 'Annet');
            var city = data.ipData.city.split(' ').join('_').split('_(')[0].replace("'", "’").replace('oe', 'ö');
            if (region.length == 0) region = "Annet";
            $scope.master.location = data.ipData.city;
            if (country === 'Norway') {
              vm.yrString = encodeURIComponent("Norge/postnummer/"+data.ipData.zip_code);
              $scope.master.location = data.ipData.zip_code+" "+data.ipData.city;
              console.log("YR-string:", vm.yrString);
            } else {
              if (data.ipData.city !== data.ipData.regionName && data.ipData.regionName.length>0) {
                $scope.master.location = data.ipData.city+i+data.ipData.regionName;
              }
              vm.yrString = encodeURIComponent(country+"/"+region+"/"+city);
              console.log("YR-string:", vm.yrString);
            }
            fetchWeather();
          } else {
            throwError()
          }
        }).error(function (data, status) {
          throwError();
        });
      } else {
        if (/\/([\w%-]+\/){2,3}[\w%-]+\/?/i.test(window.location.pathname)) {
          vm.yrString = window.location.pathname.replace('/', '')
          if (vm.yrString.split('')[vm.yrString.length - 1] == '/') {
            vm.yrString = vm.yrString.replace(/\/([^\/]*)$/,'$1');
          }
          console.log("noNeed == true", initialJSON.noNeed);
          console.log("YR-string:", vm.yrString);
          var loc = "";
          if (vm.yrString.split('/')[0] === "Norge" || vm.yrString.split('/')[0] === "Norway") {
            if (vm.yrString.split('/').length < 4) {
              vm.yrString += '/'+vm.yrString.split('/')[2]
            }
            if (vm.yrString.split('/')[3] !== vm.yrString.split('/')[2]) {
              loc = vm.yrString.split('/')[3].replace(/_/g, ' ')+i+vm.yrString.split('/')[2].replace(/_/g, ' ');
            } else {
              loc = vm.yrString.split('/')[3].replace(/_/g, ' ');
            }
          } else {
            if (vm.yrString.split('/')[2] !== vm.yrString.split('/')[1]) {
              loc = vm.yrString.split('/')[2].replace(/_/g, ' ')+i+vm.yrString.split('/')[1].replace(/_/g, ' ');
            } else {
              loc = vm.yrString.split('/')[2].replace(/_/g, ' ');
            }
          }
          //$scope.master.location = loc.replace(/%20/g, ' ').replace(/%C3%A6/g, 'æ').replace(/%C3%B8/g, 'ø').replace(/%C3%A5/g, 'å').replace(/%C3%86/g, 'Æ').replace(/%C3%98/g, 'Ø').replace(/%C3%85/g, 'Å');
          $scope.master.location = decodeURIComponent(loc);
        } else {
          vm.yrString = localStorage.yrString;
          $scope.master.location = localStorage.location;
          console.log(localStorage.location);
        }
        console.log("YR-string:", vm.yrString);
        fetchWeather();
      }
    }

    function fetchWeather() {
      var weatherRequest = {
        method: 'GET',
        url: 'https://static.'+domain+'.tk/php/weather.php?yrstring='+vm.yrString+'&d='+Math.floor(Date.now()/(3.6*10e5))+wsuf
      };

      $http(weatherRequest)
      .then(function successCallback(response) {
        console.log("Værdata-request fullført, skriptkjøringstid på serveren:", response.data.log, "Her er responsen:", response);
        if (!response.data.fail) {
          console.log("No error");
          /*$scope.master.data = response.data.data;
          for (var i = 0; i < $scope.master.data.length; i++) {
            $scope.master.data[i].time = vm.days[$scope.master.data[i].day] +' '+ $scope.master.data[i].hour+':00';
          }*/
          if (!initialJSON.noNeed && typeof(Storage) !== "undefined" && vm.zip.split('0').length-1 < 3) {
            //localStorage.yrString = vm.yrString;
            //localStorage.location = $scope.master.location;
            //localStorage.locationExpiry = Date.now() + 1000*60*60*24*4;
          }
          Array.prototype.push.apply(vm.rawdata, response.data.data);
          weatherLoaded();
          fetchMoreWeather();
        } else {
          throwError()
        }
      });
    }

    function fetchMoreWeather() {
      var weatherRequest = {
        method: 'GET',
        url: 'https://static.'+domain+'.tk/php/more-weather.php?yrstring='+vm.yrString+'&d='+Math.floor(Date.now()/(3.6*10e5))+wsuf
      };

      $http(weatherRequest).then(function successCallback(response) {
        console.log("Værdata-request fullført, skriptkjøringstid på serveren:", response.data.log, "Her er responsen:", response);
        var data = response.data.data;
        /*for (var i = 0; i < data.length; i++) {
          data[i].time = vm.days[data[i].day] + ' ' + data[i].hour + '-' + data[i].hourTo;
        }*/
        //Array.prototype.push.apply($scope.master.data, data);
        Array.prototype.push.apply(vm.rawdata, data);
        weatherLoaded();
      });
    }

    function weatherLoaded() {
      var data = vm.rawdata;
      $scope.master.weatherDataLoaded = true;
      //console.log("Starter behandling av data:", data);
      var ndata = {};
      var path = "https://static."+domain+".tk/img/modern-icons/";
      for (var i = 0; i < data.length; i++) {
        var icon = data[i].icon;
        data[i].offset = false;
        data[i].showImg = true;
        if (/^[\d]+$/.test(icon)) {
          data[i].background = "";
          data[i].foreground = path+icon+".png";
        } else if (/^\d+d$/.test(icon)) {
          if (icon == "01d") {
            data[i].background = "";
            data[i].foreground = path+"01db.png";
          } else if (icon == "02d") {
            data[i].background = path+"01db.png";
            data[i].foreground = path+"02f.png";
          } else {
            data[i].background = path+"db.png";
            data[i].foreground = path+icon.substring(0,2)+"f.png";
          }
        } else if (/^\d+m$/.test(icon)) {
          if (icon == "01m") {
            data[i].background = path+"01mb.png";
          } else {
            data[i].background = path+"mb.png";
          }
          data[i].foreground = path+icon.substring(0,2)+"f.png";
        } else if (/^mf\/\d+n\.\d+$/.test(icon)) {
          //console.log("/^mf\/\d+n\.\d+$/.test(data["+i+"].icon) = true");
          var phase = icon.substring(7,9);
          //data[i].background = path+"mfb/"+phase+".png";
          if (!/^mf\/0[12]n\.\d{2}$/.test(icon)) {
            data[i].offset = true;
          }
          data[i].phase = findPhase(phase);
          if (icon.substring(3,5)==="01") {
            data[i].showImg = false;
          } else {
            data[i].foreground = path+icon.substring(3,5)+"f.png";
          }
          //console.log("behandlet data["+i+"]:", data[i]);
        }
        var norge = data[1].hour - data[0].hour == 1 || (data[1].hour == 0 && data[0].hour == 23);
        if (ndata.hasOwnProperty(vm.days[data[i].day]) && data[i].date !== ndata[vm.days[data[i].day]][0].date) {
        //if ((data[i].day === data[0].day && data[i].date !== data[0].date) || (data[i].day === data[24].day && data[i].date !== data[24].date) || (data[i].day === data[47].day && data[i].date !== data[47].date)) {
          if (ndata.hasOwnProperty(vm.days[data[i].day]+" ")) {
            //console.log("ndata[vm.days["+data[i].day+" ]] existed, pushing...");
            //Array.prototype.push.apply(ndata[vm.days[data[i].day]+" "], data[i]);
            ndata[vm.days[data[i].day]+" "].push(data[i]);
            //console.log("ndata[vm.days["+data[i].day+" ]] after pushing:", ndata[vm.days[data[i].day]+" "]);
          } else {
            //console.log("ndata[vm.days["+data[i].day+" ]] didn't exist, creating...");
            ndata[vm.days[data[i].day]+" "] = [data[i]];
          }
        } else if (ndata.hasOwnProperty(vm.days[data[i].day])) {
          //console.log("ndata[vm.days["+data[i].day+"]] existed, pushing...");
          //Array.prototype.push.apply(ndata[vm.days[data[i].day]], data[i]);
          ndata[vm.days[data[i].day]].push(data[i]);
          //console.log("ndata[vm.days["+data[i].day+"]] after pushing:", ndata[vm.days[data[i].day]]);
        } else {
          ndata[vm.days[data[i].day]] = [data[i]];
          //console.log("ndata[vm.days["+data[i].day+"]] didn't exist, creating...");
        }
      }
      //console.log("ndata:", ndata);
      //$scope.master.data = data;
      var nndata = [];
      var i = 0;
      for (var day in ndata) {
        var summaryHours = [[], [], [], []];
        var showSummaries = [false, false, false, false];
        for (var j = 0; j < ndata[day].length; j++) {
          if (ndata[day][j].hourTo > ndata[day][j].hour && ndata[day][j].hourTo<=6) {
            summaryHours[0].push(ndata[day][j]);
            ndata[day][j].summarized = true;
            ndata[day][j].group = 0;
          } else if (ndata[day][j].hourTo > ndata[day][j].hour && ndata[day][j].hour>=6 && ndata[day][j].hourTo<=12) {
            summaryHours[1].push(ndata[day][j]);
            ndata[day][j].summarized = true;
            ndata[day][j].group = 1;
          } else if (ndata[day][j].hourTo > ndata[day][j].hour && ndata[day][j].hour>=12 && ndata[day][j].hourTo<=18) {
            summaryHours[2].push(ndata[day][j]);
            ndata[day][j].summarized = true;
            ndata[day][j].group = 2;
          } else if ((ndata[day][j].hourTo == "00" || ndata[day][j].hourTo > ndata[day][j].hour) && ndata[day][j].hour>=18 && (ndata[day][j].hourTo<=24 || ndata[day][j].hourTo == "00")) {
            summaryHours[3].push(ndata[day][j]);
            ndata[day][j].summarized = true;
            ndata[day][j].group = 3;
          } else {
            ndata[day][j].summarized = false;
            ndata[day][j].group = 0;
          }
        }
        //console.log("summaryHours for "+day+":", summaryHours);
        var summaries = [
          {},
          {},
          {},
          {}
        ];

        for (var key = 0; key < summaryHours.length; key++) {
          if (summaryHours[key].length > 0) {
            //console.log("Making summary no. "+key+" for day "+ndata[day][0].day+". summaryHours:",summaryHours[key]);
            showSummaries[key] = true;
            var totdegs = 0;
            var totprecip = 0;
            var totwind = 0;
            for (var j = 0; j < summaryHours[key].length; j++) {
              totdegs += summaryHours[key][j].degs;
              totprecip = totprecip*1 + summaryHours[key][j].precipitation*1;
              totwind = totwind*1 + summaryHours[key][j].wind*1;
            }
            var avdegs = Math.round(totdegs / summaryHours[key].length);
            var avwind = Math.round(totwind / summaryHours[key].length * 10)/10;
            totprecip = Math.round(totprecip*10)/10;
            summaries[key] = {
              hour: summaryHours[key][0].hour,
              hourTo: summaryHours[key][summaryHours[key].length - 1].hourTo,
              background: summaryHours[key][0].background,
              foreground: summaryHours[key][0].foreground,
              showImg: summaryHours[key][0].showImg,
              icon: summaryHours[key][0].icon,
              degs: avdegs,
              precipitation: totprecip,
              wind: avwind
            };
            if (/^mf\/\d+n\.\d+$/.test(summaryHours[key][0].icon)) {
              summaries[key].phase = summaryHours[key][0].phase;
            }
          }
        }

        nndata[i] = {
          day: day,
          showFull: [false, false, false, false],
          //hourbyhour: ndata[day].length > 4,
          index: i,
          periods: [],
          /*periods: [
            {
              summary: summaries[0],
              data: summaryHours[0]
            },
            {
              summary: summaries[1],
              data: summaryHours[1]
            },
            {
              summary: summaries[2],
              data: summaryHours[2]
            },
            {
              summary: summaries[3],
              data: summaryHours[3]
            }
          ],*/
          data: ndata[day]//,
          //summaries: summaries,
          //showSummaries: showSummaries
        };
        for (var j = 0; j < summaries.length; j++) {
          if (showSummaries[j]) {
            nndata[i].periods.push({
              summary: summaries[j],
              showSummary: true,
              data: summaryHours[j]
            });
          }
        }
        for (var j = 0; j < nndata[i].data.length; j++) {
          if (!nndata[i].data[j].summarized) {
            nndata[i].periods.push({
              showSummary: false,
              data: [nndata[i].data[j]]
            });
          }
        }
        for (var j = 0; j < nndata[i].periods.length; j++) {
          nndata[i].periods[j].group = nndata[i].periods[j].data[0].group;
        }
        //nndata[i].group = nndata[i].periods[0].data[0].group;
        nndata[i].periods.sort(compare);
        i++;
      }
      /*for (var i = 0; i < nndata.length; i++) {
        for (var j = 0; j < nndata[i].data.length; j++) {
          if (!nndata[i].data[j].summarized) {
            nndata[i].periods.push({
              data: nndata[i].data[j]
            });
          }
        }
      }*/
      //console.log("nndata:", nndata);
      //Array.prototype.push.apply($scope.master.data, nndata);
      $scope.master.data = nndata;
      console.log("Værdataen er behandlet, resultat:", $scope.master.data);
      if (initialJSON.noNeed || $scope.master.ifHome()) {
        var i = $location.path();
        $scope.master.recents[i] = {
          data: $scope.master.data,
          info: {
            url: $location.path(),
            location: $scope.master.location,
            savedAt: Date.now()
          }
        }
        if (typeof (Storage) !== "undefined") {
          console.log("Browser supports localStorage, pushing",$scope.master.recents,"to localStorage.recents");
          console.log("delete $scope.master.recents.toJson()",delete $scope.master.recents.toJSON);
          //console.log("Stringified version of master.recents:",JSON.stringify($scope.master.recents));
          localStorage.recents = JSON.stringify($scope.master.recents);
          //console.log("This was saved to localStorage.recents:", localStorage.recents);
          //console.log("Parsed:", JSON.parse(localStorage.recents));
        }
      }
      console.log("Recents:", $scope.master.recents);


      function findPhase (x) {
        if (x<=50) return (-x)*0.5;
        return 25-(x-50)*0.5;
      }
    }
  } else {
    console.log("Data existed locally, setting master.data to master.recents[vm.recentIndex]...");
    $scope.master.location = $scope.master.recents[$location.path()].info.location;
    $scope.master.data = $scope.master.recents[$location.path()].data;
    $scope.master.weatherDataLoaded = true;
  }

  function throwError() {
    console.log("throwError called");
    $scope.master.weatherDataLoaded = true;
    $scope.master.fail = true;
    var suf = "";
    if (/^(([1-9]?\d|1\d\d|2[0-4]\d|25[0-5])(\.(?!$)|(?=$))){4}$/.test(window.location.pathname.split('/')[1])) suf = '&ip='+window.location.pathname.split('/')[1];
    if (/\/(([A-Z])\w+\/){2,3}([A-Z])\w+\/?/i.test(window.location.pathname)) suf = '&ip='+window.location.pathname;
    if (navigator.onLine) {
      $http.get('https://static.'+domain+'.tk/php/report.php?yrstring='+vm.yrString+suf).success(function (data) {
        console.log(data);
      });
    }
  }

  angular.element($window).on('resize', function () {
    $scope.$apply(function(){
      $scope.view.height = window.innerHeight;
      $scope.view.width = window.innerWidth;
      if ($scope.view.width > 515) {
        $scope.master.deviceTurned = true;
        if (typeof(Storage) !== "undefined") {
          localStorage.deviceTurned = true;
        }
      }
    });
  })

  function compare(a,b) {
    if (a.data[0].hour < b.data[0].hour)
    return -1;
    if (a.data[0].hour > b.data[0].hour)
    return 1;
    return 0;
  }

  function jqueryStuff() {
    // Do jqueryStuff here
  }

  if (typeof localStorage.ubuntu !== 'undefined') {
    $scope.master.ubuntu = localStorage.ubuntu;
    $scope.master.ubuntuLoaded = true;
  } else {
    $http.get('https://static.'+domain+'.tk/css/ubuntu.php').success(function (data) {
      $scope.master.ubuntu = data;
      $scope.master.ubuntuLoaded = true;
      localStorage.ubuntu = data;
    });
  }

  $scope.master.mlcLoaded = true;

  $http.get('https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css').success(function (data) {
    $scope.master.bootstrap = data;
    $scope.master.bootstrapLoaded = true;
  });

  /*jqueryLoaded.request.success(function (data) {
  $timeout(jqueryStuff, 50);
});*/

  if (typeof(Storage) !== "undefined") {
    var initial = localStorage.visits || 0;
    localStorage.visits = initial*1 + 1;
  }

  /*$scope.master.time = function (hour, hourTo) {
    if ($scope.master.norsk) {
      return "Kl "+hour+"-"+hourTo;
    } else {
      return hour+"-"+hourTo;
    }
  }*/

}]);

app.controller("lazyStuff", ['$http', '$scope', '$window', '$location', function ($http, $scope, $window, $location) {
  let vm = this;
  console.log("lazyStuff is executings");
  $scope.master.data = [];
  vm.timezone = -(new Date().getTimezoneOffset()/60);
  vm.rawdata = [];

  // Delete outdated weather data
  for (var index in $scope.master.recents) {
    if ($scope.master.recents.hasOwnProperty(index)) {
      if (Date.now()-$scope.master.recents[index].info.savedAt>1800000 && navigator.onLine) {
        delete $scope.master.recents[index];
      }
    }
  }

  if ($scope.master.recents.hasOwnProperty($location.path())) { // Get data from localStorage
    $scope.master.location = $scope.master.recents[$location.path()].info.location;
    $scope.master.data = $scope.master.recents[$location.path()].data;
  } else { // Get data from a server
    // When master.hideFlipDeviceTip is set to false, a tip is shown to the user, telling them to flip their phone to see more weather data
    if ((typeof(Storage) === "undefined" || (typeof(Storage) !== "undefined" && localStorage.hideFlipDeviceTip != "true")) && $scope.view.width <= 515) {
      $scope.master.hideFlipDeviceTip = false;
    }

    console.log("At line 25");
    if ($location.path().length > 3) {
      fetchUsingPlaceName()
    } else {
      if (navigator.geolocation) {
        console.log("Trying to fetch position");
        navigator.geolocation.getCurrentPosition(fetchUsingPosition, fetchUsingApproxPosition);
      } else {
        fetchUsingApproxPosition();
      }
    }

    function fetchUsingPlaceName() {
      alert("Fetching using place name is not implemented yet!");
    }

    function fetchUsingPosition(position) {
      console.log("Position accessed successfully", position);
      $scope.master.location = $scope.master.textData.yourExactPosition;
      let url = '/static/php/location-weather.php?lat='+position.coords.latitude+'&long='+position.coords.longitude+'&gmt='+vm.timezone+'&d='+Math.round(Date.now()/(1000*60*30));
      $http.get(url).success(function (data) {
        Array.prototype.push.apply(vm.rawdata, data.data);
        processData();
      }).error(function (data, status) {
        fetchUsingApproxPosition();
      });
    }

    function fetchUsingApproxPosition() {
      // Try to get approximate location using IP, and then fetch using place name
      alert("Fetching using approximate is not implemented yet!");
    }

    function processData() {
      var data = vm.rawdata;
      var ndata = {};
      var path = "/static/img/modern-icons/";
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
          var phase = icon.substring(7,9);
          if (!/^mf\/0[12]n\.\d{2}$/.test(icon)) {
            data[i].offset = true;
          }
          data[i].phase = findPhase(phase);
          if (icon.substring(3,5)==="01") {
            data[i].showImg = false;
          } else {
            data[i].foreground = path+icon.substring(3,5)+"f.png";
          }
        }
        let weekday_name = $scope.master.textData.weekdays[data[i].day];
        if (ndata.hasOwnProperty(weekday_name) && data[i].date !== ndata[weekday_name][0].date) {
          if (ndata.hasOwnProperty(weekday_name+" ")) {
            ndata[weekday_name+" "].push(data[i]);
          } else {
            ndata[weekday_name+" "] = [data[i]];
          }
        } else if (ndata.hasOwnProperty(weekday_name)) {
            ndata[weekday_name].push(data[i]);
        } else {
            ndata[weekday_name] = [data[i]];
        }
      }
      var processed_data = [];
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
        var summaries = [
          {},
          {},
          {},
          {}
        ];

        for (var key = 0; key < summaryHours.length; key++) {
          if (summaryHours[key].length > 0) {
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

        processed_data[i] = {
          day: day,
          showFull: [false, false, false, false],
          index: i,
          periods: [],
          data: ndata[day]
        };
        for (var j = 0; j < summaries.length; j++) {
          if (showSummaries[j]) {
            processed_data[i].periods.push({
              summary: summaries[j],
              showSummary: true,
              data: summaryHours[j]
            });
          }
        }
        for (var j = 0; j < processed_data[i].data.length; j++) {
          if (!processed_data[i].data[j].summarized) {
            processed_data[i].periods.push({
              showSummary: false,
              data: [processed_data[i].data[j]]
            });
          }
        }
        for (var j = 0; j < processed_data[i].periods.length; j++) {
          processed_data[i].periods[j].group = processed_data[i].periods[j].data[0].group;
        }
        processed_data[i].periods.sort(compare);
        i++;
      }
      $scope.master.data = processed_data;
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
          localStorage.recents = JSON.stringify($scope.master.recents);
        }
      }
      console.log("Recents:", $scope.master.recents);


      function findPhase (x) {
        if (x<=50) return (-x)*0.5;
        return 25-(x-50)*0.5;
      }
    }
  }

  // Adjust background when window is resized
  angular.element($window).on('resize', function () {
    $scope.$apply(function(){
      $scope.view.height = window.innerHeight;
      $scope.view.width = window.innerWidth;
      if ($scope.view.width > 515) {
        $scope.master.hideFlipDeviceTip = true;
        if (typeof(Storage) !== "undefined") {
          localStorage.hideFlipDeviceTip = true;
        }
      }
    });
  })

  // This function is used to sort arrays
  function compare(a,b) {
    if (a.data[0].hour < b.data[0].hour)
    return -1;
    if (a.data[0].hour > b.data[0].hour)
    return 1;
    return 0;
  }

  // This function loads CSS from a URL and puts it in a <style> element in the HTML code
  function loadCSS (url) {
    if (typeof localStorage[url] !== 'undefined') {
      $scope.master.css += localStorage[url];
    } else {
      $http.get(url).success((data)=>{
        $scope.master.css += data;
        localStorage[url] = data;
      });
    }
  }
  loadCSS("/static/css/ubuntu.php");
  loadCSS("/static/css/glyphicons.min.css");

  // Count and save how many times user has visited the website
  if (typeof(Storage) !== "undefined") {
    let visits = localStorage.visits || 0;
    localStorage.visits = Number(visits) + 1;
  }

}]);

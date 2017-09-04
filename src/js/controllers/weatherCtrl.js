app.controller("weatherCtrl", ['$http', '$scope', '$window', '$location', '$routeParams', '$httpx', function ($http, $scope, $window, $location, $routeParams, $httpx) {
  let vm = this;
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
    if ((typeof(Storage) === "undefined" || (typeof(Storage) !== "undefined" && localStorage.hideFlipDeviceTip != "true")) && window.innerWidth <= 515) {
      $scope.master.hideFlipDeviceTip = false;
    }

    if ($location.path().length > 3) {
      fetchUsingPlaceName()
    } else {
      if (navigator.geolocation) {
        $scope.master.location = $scope.master.textData.yourExactPosition;
        navigator.geolocation.getCurrentPosition(fetchUsingPosition, fetchUsingApproxPosition);
      } else {
        fetchUsingApproxPosition();
      }
    }

    function fetchUsingPlaceName() {
      // Get coordinates for place, and fetch weather data using position
      $scope.master.location = $routeParams.place;
      $httpx.get("https://real-timer-server.tk:2087/get-coordinates.php?input="+encodeURIComponent($routeParams.place), {lifetime: Infinity}).then((data)=>{
        fetchUsingPosition({
          coords: {
            latitude: data.results[0].geometry.location.lat,
            longitude: data.results[0].geometry.location.lng
          }
        })
      });
    }

    function fetchUsingPosition(position) {
      let url = 'https://real-timer-server.tk:2087/get-weather.php?lat='+position.coords.latitude+'&long='+position.coords.longitude+'&gmt='+vm.timezone+'&d='+Math.round(Date.now()/(1000*60*30));
      $http.get(url).success(function (data) {
        Array.prototype.push.apply(vm.rawdata, data.data);
        processData();
      }).error(function (data, status) {
        fetchUsingApproxPosition();
      });
    }

    function fetchUsingApproxPosition() {
      // Try to get approximate location using IP
      $scope.master.location = $scope.master.textData.yourApproxPosition;
      $http.get("https://real-timer-server.tk:2087/ip-data.php").success((data)=>{
        fetchUsingPosition({
          coords: {
            latitude: data.lat,
            longitude: data.lon
          }
        });
      });
    }
  }

  // Adjust background when window is resized
  angular.element($window).on('resize', function () {
    $scope.$apply(function(){
      $scope.master.height = window.innerHeight;
      $scope.master.width = window.innerWidth;
      if ($scope.master.width > 515) {
        $scope.master.hideFlipDeviceTip = true;
        if (typeof(Storage) !== "undefined") {
          localStorage.hideFlipDeviceTip = true;
        }
      }
    });
  });

  // This function processes data and changes the structure
  function processData() {
    /* semi_processed_data is an array where the index is the numbered day of the month, and the element contains all data for this date */
    let semi_processed_data = [];
    let imgs_path = "src/img/modern-icons/";
    for (let i = 0; i < vm.rawdata.length; i++) {
      let icon = vm.rawdata[i].icon;
      vm.rawdata[i].offset = false;
      vm.rawdata[i].showImg = true;
      if (/^[\d]+$/.test(icon)) {
        vm.rawdata[i].background = "";
        vm.rawdata[i].foreground = imgs_path+icon+".png";
      } else if (/^\d+d$/.test(icon)) {
        if (icon == "01d") {
          vm.rawdata[i].background = "";
          vm.rawdata[i].foreground = imgs_path+"01db.png";
        } else if (icon == "02d") {
          vm.rawdata[i].background = imgs_path+"01db.png";
          vm.rawdata[i].foreground = imgs_path+"02f.png";
        } else {
          vm.rawdata[i].background = imgs_path+"db.png";
          vm.rawdata[i].foreground = imgs_path+icon.substring(0,2)+"f.png";
        }
      } else if (/^\d+m$/.test(icon)) {
        if (icon == "01m") {
          vm.rawdata[i].background = imgs_path+"01mb.png";
        } else {
          vm.rawdata[i].background = imgs_path+"mb.png";
        }
        vm.rawdata[i].foreground = imgs_path+icon.substring(0,2)+"f.png";
      } else if (/^mf\/\d+n\.\d+$/.test(icon)) {
        var phase = icon.substring(7,9);
        if (!/^mf\/0[12]n\.\d{2}$/.test(icon)) {
          vm.rawdata[i].offset = true;
        }
        vm.rawdata[i].phase = findPhase(phase);
        if (icon.substring(3,5)==="01") {
          vm.rawdata[i].showImg = false;
        } else {
          vm.rawdata[i].foreground = imgs_path+icon.substring(3,5)+"f.png";
        }
      }
      let date = Number(vm.rawdata[i].date);
      if (typeof semi_processed_data[date] === "undefined") semi_processed_data[date] = [];
      semi_processed_data[date].push(vm.rawdata[i]);
    }
    /* processed_data is an array of days ordered chronologically */
    let processed_data = [];
    let date = new Date().getUTCDate();
    let days_this_month = new Date(new Date().getFullYear(), new Date().getUTCMonth(), 0).getDate();
    for (let _i_ = date; _i_ < date+days_this_month; _i_++) {
      let i = _i_ > days_this_month ? _i_ - days_this_month : _i_;
      if (typeof semi_processed_data[i] !== "undefined") {
        let obj = {"data":[]};
        let weekday_num;
        if (semi_processed_data[i].length > 4) {
          // Loop through the hours in the day and add them to their respective periods
          for (let j = 0; j < semi_processed_data[i].length; j++) {
            let hour = Number(semi_processed_data[i][j].hour);
            let period = hour < 6 ? 0 : hour < 12 ? 1 : hour < 18 ? 2 : 3;
            if (typeof obj.data[period] === "undefined") obj.data[period] = {"data":[]};
            obj.data[period].data.push(semi_processed_data[i][j]);
          }
          // Remove undefined elements from array
          obj.data.clean();
          // Loop through the periods and add info such as average weather
          for (let period = 0; period < obj.data.length; period++) {
            let first_child = obj.data[period].data[0];
            let last_child = obj.data[period].data.slice(-1)[0];
            obj.data[period].hour = first_child.hour;
            obj.data[period].hourTo = last_child.hourTo;
            obj.data[period].background = first_child.background;
            obj.data[period].foreground = first_child.foreground;
            obj.data[period].icon = first_child.icon;
            obj.data[period].offset = first_child.offset;
            obj.data[period].phase = first_child.phase;
            // Set summarizeable to true because we have hour by hour forecast for this day
            obj.data[period].summarizeable = true;
            obj.data[period].currently_summarized = true;
            // Calculate average temperature, precipitation and wind
            let temperature_sum = 0;
            let precipitation_sum = 0;
            let wind_sum = 0;
            for (var j = 0; j < obj.data[period].data.length; j++) {
              temperature_sum += Number(obj.data[period].data[j].degs);
              precipitation_sum += Number(obj.data[period].data[j].precipitation);
              wind_sum += Number(obj.data[period].data[j].wind);
            }
            obj.data[period].degs = Math.round(temperature_sum / obj.data[period].data.length);
            obj.data[period].precipitation = Math.round(precipitation_sum * 100)/100;
            obj.data[period].wind = Math.round(wind_sum / obj.data[period].data.length);
          }
          weekday_num = new Date(obj.data[0].data[0].unix * 1000).getDay();
          obj.day = $scope.master.textData.weekdays[weekday_num > 0 ? weekday_num - 1 : 6];
        } else {
          obj.data = semi_processed_data[i];
          for (let period = 0; period < obj.data.length; period++) {
            obj.data[period].data = [];
            // Set summarizeable to false because we do not have hour by hour forecast for this day
            obj.data[period].summarizeable = false;
            obj.data[period].currently_summarized = true;
          };
          weekday_num = new Date(obj.data[0].unix * 1000).getDay();
        }
        obj.day = $scope.master.textData.weekdays[weekday_num > 0 ? weekday_num - 1 : 6];
        processed_data.push(obj);
      }
    }
    $scope.master.data = processed_data;
    // Add data to master.recents object so it does not have to be reloaded
    $scope.master.recents[$location.path()] = {
      data: processed_data,
      info: {
        url: $location.path(),
        location: $scope.master.location,
        savedAt: Date.now()
      }
    }
    if (typeof (Storage) !== "undefined") {
      localStorage.recents = JSON.stringify($scope.master.recents);
    }
  };

  // This function is used to sort arrays
  function compare(a,b) {
    if (a.data[0].hour < b.data[0].hour)
    return -1;
    if (a.data[0].hour > b.data[0].hour)
    return 1;
    return 0;
  }

  // This function finds the moon phase from a code (x)
  function findPhase (x) {
    if (x<=50) return (-x)*0.5;
    return 25-(x-50)*0.5;
  }

  // Count and save how many times user has visited the website
  if (typeof(Storage) !== "undefined") {
    let visits = localStorage.visits || 0;
    localStorage.visits = Number(visits) + 1;
  }

  // This function adds a function to the native array prototype object, which can delete all empty elements
  Array.prototype.clean = function(valute_to_delete) {
    for (let i = 0; i < this.length; i++) {
      if (this[i] == valute_to_delete) {
        this.splice(i, 1);
        i--;
      }
    }
    return this;
  };
}]);

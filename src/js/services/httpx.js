/* This service is an extension of the native AngularJS $http service  *
 *
 * This service provides more functionality, and serves the resource from localStorage if the server is unavailable
 *
 * The `get` method takes normal $http options, but also some more:
 * options.lifetime can be used to specify how many milliseconds the cached resource is valid
 * options.alt_urls can be used to specify alternative urls for the resource
 */
app.service('$httpx', ['$http', '$q', function($http, $q) {
  let vm = angular.extend({}, $http);
  vm.get = (url, options)=>{
    if (typeof options === "undefined") options = {};
    let deferred = $q.defer();
    if (typeof options.alt_urls === "string") options.alt_urls = [options.alt_urls];
    let urls = typeof options.alt_urls === "undefined" ? [url] : (options.alt_urls.push(url) && options.alt_urls);
    let resolved = false;
    let errors = 0;
    if (!("lifetime" in options)) options.lifetime = 0;
    for (let i = 0;i < urls.length;i++) {
      if (typeof Storage !== "undefined" && urls[i] in localStorage && Number(localStorage[urls[i]+"_expiry"]) > Date.now()) {
        deferred.resolve(JSON.parse(localStorage[urls[i]]));
        resolved = true;
      }
      $http.get(urls[i], options).then(function successCallback(response) {
        if (!resolved) deferred.resolve(response.data);
        resolved = true;
        if (typeof Storage !== "undefined" && urls[i] in localStorage && Number(localStorage[urls[i]+"_expiry"]) < Date.now()) {
          delete localStorage[urls[i]];
          delete localStorage[urls[i]+"_expiry"];
        }
        if (typeof Storage !== "undefined") {
          localStorage[urls[i]] = JSON.stringify(response.data);
          localStorage[urls[i]+"_expiry"] = Number(options.lifetime) + Date.now();
        }
      }).then(function errorCallback(response) {
        errors++;
        if (!resolved) {
          if (typeof Storage !== "undefined" && urls[i] in localStorage) {
            deferred.resolve(localStorage[urls[i]]);
            resolved = true;
          } else {
            if (errors === urls.length) deferred.reject("ERROR");
          }
        }
      });
    }
    return deferred.promise;
  };
  return vm;
}]);

app.directive("scroll", ['$window', function ($window) {
  console.log("Executing scroll.js");
  return function(scope) {

    var scrollHandler = function () {
      if ($('#games').length && this.pageYOffset >= $('#games').outerHeight() - 1000) {
        if (scope.cat !== undefined) {
          scope.cat.requestGames(18);
        } else {
          scope.master.requestGames(18);
        }
      }
    };

    angular.element($window).on('scroll', scrollHandler);

    scope.$on('$destroy', function () {
      angular.element($window).off('scroll', scrollHandler);
    });
  };
}]);

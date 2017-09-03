app.directive("paraBack", ['$window', function ($window) {
  return function(scope, element, attrs) {
    let isMobile = window.innerWidth < 720 || (/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream);

    element.css("background-image", "url("+attrs.paraBack+")");
    if (!isMobile) element.css("background-attachment", "fixed");
    let image = new Image();
    image.src = attrs.paraBack;
    image.onload = ()=>{
      if (!isMobile && window.innerWidth>600) element.css("background-size", window.innerWidth+'px');
      else element.css("background-size", window.innerHeight*1.5+'px');
    }

    let scrollHandler = ()=>{
      if (!isMobile && window.innerWidth>600) element.css("background-size", window.innerWidth+'px');
      if (!isMobile) element.css('background-position-y', '-'+Math.floor(this.pageYOffset*0.15)+'px');
    };

    angular.element($window).on('resize', scrollHandler);
    angular.element($window).on('scroll', scrollHandler);

    scope.$on('$destroy', ()=>{
      angular.element($window).off('resize', scrollHandler);
      angular.element($window).off('scroll', scrollHandler);
    });
  };
}]);

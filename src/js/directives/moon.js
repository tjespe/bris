app.directive("moon", [function () {

  return function(scope, element, attrs) {

    var phase = findPhase(Number(attrs.phase));
    var offset = JSON.parse(attrs.offset);
    element.setAttribute('style', 'box-shadow: #ffe599 '+phase+'px 0px inset;');

    function findPhase (x, offset) {
      if (!offset) {
        if (x<=50) return (-x)*0.6;
        return 30-(x-50)*0.6;
      }
      if (x<=50) return (-x)*0.5;
      return 25-(x-50)*0.5;
    }

  };

}]);

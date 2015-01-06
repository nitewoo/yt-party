define([], function (app) {

angular.module('ytFocusMeDirective', []).directive('ytFocusMe', [
  '$timeout',
  '$parse',
function ($timeout, $parse) {
  return {
    restrict: 'A',
    link: function (scope, element, attrs) {
      var model = $parse(attrs.ytFocusMe);
      var unwatch = scope.$watch(model, function (value) {
        if (value === true) {
          $timeout(function () {
            element[0].focus();
            unwatch();
          });
        }
      });
    }
  };
}]);

});
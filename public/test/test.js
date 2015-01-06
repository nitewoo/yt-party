define([], function() {
angular.module('test', [])
.controller('CtrlTest', [
  '$scope',
function ($scope) {
  $scope.t = {};
  $scope.click = function () {
    $scope.t.isOpen = !$scope.t.isOpen;
  }
}]);
});

define([], function () {
angular.module('partyController', []).controller('CtrlParty', [
  '$scope',
  '$stateParams',
  '$location',
  'Party',
function ($scope, $stateParams, $location, Party) {

  $scope.sellers = [{
    name: '果麦',
    menu: [{
      name: '红豆燕麦奶茶'
    }, {
      name: '红豆抹茶拿铁'
    }]
  },{
    name: '麦当劳',
    menu: [{
      name: '麦辣鸡翅'
    }]
  }];

  init();

  $scope.create = function () {
    var title = $scope.e.party.title || $scope.e.party;
    if (title) {
      Party.save({
        title: title
      }).success(function (party) {

      });
    }
  };

  $scope.oneMoreTime = function () {

  };

  $scope.addMember = function (name) {

  };

  $scope.addSeller = function () {

  };

  $scope.getPartyList = function(val) {
    Party.get().success(function(partys){
      $scope.partyList = partys
    });
  };

  function init() {
    if ($stateParams.id) {
      Party.get($stateParams.id).success(function (party) {
        $scope.party = party;
      });
    } else {
      $scope.party = {};
    }

    $scope.e = {
      party:''
    };

    Party.get().success(function(partys){
      $scope.partyList = partys
    });
  }

}]);
});

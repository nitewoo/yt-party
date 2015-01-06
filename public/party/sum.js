define([
  'party/partyService'
], function () {
angular.module('partySum', [
  'partyService'
]).controller('CtrlPartySum', [
    '$scope',
    '$stateParams',
    '$http',
  function ($scope, $stateParams, $http) {
    $scope.party = {
      data: {},
      orderView: {}
    };

    $scope.ifHasOrder = function(item, index){
      return !!(item.total)
    };

    init();
    function init() {
      var id = $stateParams.id;
      if (id) {
        var url = '/api/party/' + id;
        $http.get(url).success(function (party) {
          angular.extend($scope.party.data, party);
          resolveOrderView();
        });
      }
    }

    // 组织各成员的订单视图
    function resolveOrderView() {
      var salers = $scope.party.orderView = {};
      angular.forEach($scope.party.data.members, function (member, index) {
        updateOrderTotal(member.order);
        updateOrderTotal();
      });
    }
    // 更新成员的订单数据
    function updateOrderTotal(order) {
      var salers = $scope.party.orderView;
      angular.forEach(order, function (item, index) {
        var salerId = item.menuitem.saler._id;
        var salerName = item.menuitem.saler.name;
        if (!salers[salerId]) {
          salers[salerId] = {
            name: salerName,
            menu: []
          };
        }
        updateSalerMenu(salers[salerId], item);
      });
    }

    // 更新订单视图中卖家的菜单数据
    function updateSalerMenu(saler, item) {
      var _item = _.find(saler.menu, function (_item, index) {
        return _item.name === item.name;
      });
      if (_item) {
        _item.total = _item.total + item.quantity;
      } else {
        saler.menu.unshift({
          name: item.name,
          menuitem: angular.copy(item.menuitem),
          total: item.quantity
        });
      }
    }

  }]);
});
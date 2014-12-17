define([], function () {
angular.module('partyController', []).controller('CtrlParty', [
  '$scope',
  '$stateParams',
  '$location',
  'Party',
  'Saler',
  'io',
function ($scope, $stateParams, $location, Party, Saler, io) {
  $scope.e = {
    party: ''
  };

  $scope.create = function () {
    var title = $scope.e.party.title || $scope.e.party;
    if (title) {
      Party.create({
        title: title
      }).success(function (party) {
        $location.search({id: party._id});
      });
    }
  };

  $scope.oneMore = function () {
    var id = $scope.e.party._id;
    if (id) {
      Party.oneMore(id).success(function (party) {
        $location.search({id: party._id});
      })
    }
  };

  $scope.handleMemberKeyup = function (event) {
    if (event.keyCode === 13) {
      $scope.addMember($scope.e.memberName);
    }
  };

  $scope.addMember = function (name) {
    if (name) {
      Party.addMember({
        id: $scope.party._id,
        member: {
          name: name.trim()
        }
      }).success(function (party) {
        angular.extend($scope.party, party);
        $scope.e.memberName = '';
      });
    }
  };

  $scope.removeMember = function (member) {
    Party.removeMember({
      id: $scope.party._id,
      member: member
    }).success(function (party) {
      angular.extend($scope.party, party);
    });
  };


  $scope.getMenuitems = function () {
    Saler.getMenuitems($scope.e.salerName).success(function (items) {
    });
  };

  $scope.getPartyList = function (val) {
    Party.get().success(function (partys){
      $scope.partyList = partys
    });
  };

  $scope.onSalerSelect = function (saler) {
    if (!saler.menu) {
      Saler.getMenuitems(saler._id).success(function (items) {
        saler.menu = items;
      });
    }
    $scope.e.saler = '';
  };

  $scope.addToMenu = function (item) {
    Party.addMenuitem({
      id: $scope.party._id,
      item: item
    }).success(function (party) {
      angular.extend($scope.party, party);
    });
  };

  $scope.removeFromMenu = function (item) {
    Party.removeMenuitem({
      id: $scope.party._id,
      item: item.menuitem
    }).success(function (party) {
      angular.extend($scope.party, party);
    });
  };

  $scope.launch = function () {
    Party.launch($scope.party._id).success(function (party) {
      angular.extend($scope.party, party);
      resolveSalersView();
      $scope.e.maintaining = false;
    });
  };

  $scope.toggleMaintain = function () {
    $scope.e.maintaining = !$scope.e.maintaining;
    if (!$scope.e.maintaining) {
      resolveSalersView();
    }
  };

  $scope.handleDefaultAllChange = function () {
    Party.save({
      id: $scope.party._id,
      party: {
        defaultAll: $scope.party.defaultAll
      }
    }).success(function (party) {
      angular.extend($scope.party, party);
    });
  };

  $scope.sign = function (member) {
    var defaultQuantity = ($scope.party.defaultAll && 1) || 0;
    var order = [];
    angular.forEach($scope.party.menu, function (item, index) {
      if (!item.removed) {
        order.push({
          menuitem: item.menuitem._id,
          quantity: defaultQuantity
        });
      }
    });

    Party.signUp({
      id: $scope.party._id,
      memberName: member.name,
      order: order
    }).success(function (party) {
      angular.extend($scope.party, party);
      resolveSalersView();
      unfoldMember(member.name);
    });

    // member.signed = true;
    // console.log(member);
  };

  function unfoldMember(memberName) {
    angular.forEach($scope.party.members, function (member, index) {
      if (member.name === memberName) {
        member.unfolded = true;
        member.folded = false;
      }
    });
  }

  $scope.toggleCollapsed = function (item) {
    item.folded = item.unfolded = !item.unfolded;
    console.log(item.unfolded);
  };

  io.on('add menuitem', function (data) {
    doSth(data);
  })
  function doSth (data) {
    console.log('do sth', data);
  }
  $scope.updateOrder = function (member) {
    io.emit('add menuitem', 1);
    doSth(1);
    Party.updateOrder({
      id: $scope.party._id,
      memberName: member.name,
      order: member.order
    }).success(function (party) {
      angular.extend($scope.party, party);
      resolveSalersView();
    })
  };

  $scope.increase = function (item, member) {
    item.quantityEdit++;
    $scope.handleOrderChange(member);
  };

  $scope.decrease = function (item, member) {
    if (item.quantityEdit) {
      item.quantityEdit--;
    }
    $scope.handleOrderChange(member);
  };

  $scope.setEmpty = function (item, member) {
    item.quantityEdit = 0;
    $scope.handleOrderChange(member);
  };

  $scope.handleOrderChange = function (member) {
    member.changed = false;
    angular.forEach(member.order, function (item, index) {
      if (item.quantity !== item.quantityEdit) {
        member.changed = true;
        return;
      }
    });
  };

  init();

  function init() {
    if ($stateParams.id) {
      Party.get($stateParams.id).success(function (party) {
        $scope.party = party;
        $scope.e.maintaining = !party.launched;
        resolveSalersView();
      });
    } else {
      $scope.party = {};
    }


    Party.get().success(function(partys){
      $scope.partyList = partys
      console.log(partys);
    });

    Saler.get().success(function (salers) {
      $scope.salerList = salers;
    });
  }

  function updateView(party) {
    angular.extend($scope.party, party);
    resolveSalersView();
  }

  function resolveSalersView() {
    var salers = $scope.salersView = {};
    var menuitemMap = $scope.menuitemMap = {};
    angular.forEach($scope.party.menu, function (item, index) {
      var salerId = item.menuitem.saler._id;
      var salerName = item.menuitem.saler.name;
      if (!salers[salerId]) {
        salers[salerId] = {
          name: salerName,
          menu: []
        };
      }
      salers[salerId].menu.push(item);
      menuitemMap[item.menuitem._id] = item;
      item.total = 0;
    });

    updateTotal();
  }

  function updateTotal() {
    var salers = $scope.salersView;
    var menuitemMap = $scope.menuitemMap;
    angular.forEach($scope.party.members, function (member, index) {
      if (!member.removed) {
        angular.forEach(member.order, function (item, index) {
          var menuitemId = item.menuitem._id;
          menuitemMap[menuitemId].total = menuitemMap[menuitemId].total + item.quantity;

          item.quantityEdit = item.quantity;
        });
      }
    });
  }
}]);
});

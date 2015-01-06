define([], function () {
angular.module('partyController', []).controller('CtrlParty', [
  '$scope',
  '$stateParams',
  '$location',
  '$filter',
  '$state',
  'Party',
  'PartyHttp',
  'Saler',
  'io',
function ($scope, $stateParams, $location, $filter, $state, Party, PartyHttp, Saler, io) {

  $scope.party = Party;

  $scope.toggleMaintain = function () {
    if ($scope.party.e.maintaining) {
      Party.resolveOrderView();
    }
    $scope.party.e.maintaining = !$scope.party.e.maintaining;
  };

  $scope.toggleCollapsed = function (item) {
    item.folded = item.unfolded = !item.unfolded;
  };

  init();

  function init() {
    Party.init($stateParams.id);

    PartyHttp.get().success(function(partys){
      $scope.partyList = partys;
    });

    Saler.get().success(function (salers) {
      $scope.salerList = salers;
    });
  }

}])
.controller('CtrlPartyTitle', [
  '$scope',
  '$state',
  'Party',
  '$location',
function ($scope, $state, Party, $location) {
  $scope.goHome = function () {
    $state.go('party.facade', {id: undefined}, { reload: true });
    // $location.search({id: undefined});
  };

  $scope.editTitle = function () {
    $scope.party.e.titleEditing = true;
    $scope.party.e.title = $scope.party.data.title;
    $scope.party.e.titleFocus = true;
  };

  $scope.saveTitle = function () {
    Party.saveTitle().then(function () {
      $scope.party.e.titleEditing = false;
    });
  };
}])
.controller('CtrlPartyCreate', [
  '$scope',
  '$location',
  'Party',
function ($scope, $location, Party) {

  $scope.create = function (isOneMore) {
    Party.create(isOneMore).then(function (result) {
      if (result.partyId) {
        $location.search({id: result.partyId});
      }
    })
  };

}])
.controller('CtrlPartyMaintain', [
  '$scope',
  'Party',
  'Saler',
  'MenuitemMaintainModal',
function ($scope, Party, Saler, MenuitemMaintainModal) {
  $scope.handleMemberKeyup = function (event) {
    if (event.keyCode === 13) {
      Party.addMember($scope.party.e.memberName);
    }
  };

  $scope.addMember = function () {
    Party.addMember($scope.party.e.memberName);
  };

  $scope.onSalerSelect = function (saler) {
    if (!saler.menu) {
      Saler.getMenuitems(saler._id).success(function (items) {
        saler.menu = items;
        $scope.party.salerListView = [saler];
      });
    }
    $scope.party.e.saler = '';
  };

  $scope.removeMember = function (member) {
    Party.removeMember(member);
  };

  $scope.addToMenu = function (item) {
    Party.addToMenu(item);
  };

  $scope.addAllToMenu = function (salerMenu) {
    Party.addAllToMenu(salerMenu);
  };

  $scope.removeFromMenu = function (item) {
    Party.removeFromMenu(item);
  };

  $scope.removeAllFromMenu = function () {
    Party.removeAllFromMenu();
  };

  $scope.launch = function () {
    Party.launch();
  };

  $scope.createMenuitem = function (saler) {
    MenuitemMaintainModal.open({
      saler: saler._id
    }).then(function (retMenuitem) {
      saler.menu.unshift(retMenuitem);
    });
  };

  $scope.maintainMenuitem = function (menuitem) {
    MenuitemMaintainModal.open(menuitem).then(function (retMenuitem) {
      var _menuitem = _.find($scope.party.data.menu, function (_item, index) {
        return _item.menuitem._id === retMenuitem._id;
      });

      angular.extend(menuitem, retMenuitem);
      if (_menuitem && _menuitem.menuitem) {
        angular.extend(_menuitem.menuitem, retMenuitem);
      }
    });
  };

}])
.controller('CtrlPartyGoing', [
  '$scope',
  'Party',
  '$filter',
  'io',
function ($scope, Party, $filter, io) {
  // console.log($scope.e);
  $scope.handleMemberLanchedKeyup = function (event) {
    var membersView = $scope.party.membersView;
    var memberName = $scope.party.e.memberNameLaunched && $scope.party.e.memberNameLaunched.trim() || '';
    if (event.keyCode === 13) {
      if (membersView.length === 1) {
        Party.signUp(membersView[0]);
      } else if (membersView.length === 0){
        Party.addMember(memberName, true);
      }
    } else {
      if (memberName) {
        searchMemberByName(memberName);
      } else {
        Party.resetMembersView();
      }
    }
  };

  $scope.addMemberAndSignUp = function () {
    var memberName = $scope.party.e.memberNameLaunched && $scope.party.e.memberNameLaunched.trim() || '';
    Party.addMember(memberName, true);
  };

  $scope.setOpt = function (group, index) {
    if (group.required) {
      group.selected = [index];
    } else {
      var i = group.selected.indexOf(index);
      if (i > -1) {
        group.selected.splice(i, 1);
      } else {
        if (!group.multiple) {
          group.selected.length = 0;
        }
        group.selected.unshift(index);
      }
    }
  };

  io.on('member.updated', function (party) {
    if (party._id === $scope.party.data._id) {
      Party.updateMember(party);
      Party.updateOrderLog(party);
      // .then(function () {
      //   $scope.$digest();
      // });
      // $scope.$digest();
    }
  });

  io.on('menu.updated', function (party) {
    if ($scope.party.data.launched && !$scope.party.e.maintaining) {
      Party.resolveOrderView();
    }
  });

  $scope.increase = function (item) {
    Party.updateOrder(item, 1);
  };

  $scope.decrease = function (item) {
    Party.updateOrder(item, -1);
  };

  $scope.ifHasOrder = function(item, index){
    return !!(item.total)
  };

  $scope.ifHasQuantity = function(item, index){
    return !!(item.quantity)
  };

  $scope.toggleShowOrderSum = function () {
    $scope.party.e.showOrderSum = !$scope.party.e.showOrderSum;
  };

  $scope.signOff = function () {
    Party.signOff();
  }

  $scope.signUp = function (member) {
    Party.signUp(member);
  };

  function searchMemberByName(memberName) {
    $scope.party.membersView = $filter('searchMember')($scope.party.membersView, memberName);
  }
}])
.controller('CtrlQrCode', [
  '$scope',
  '$state',
function ($scope, $state) {

  $scope.pop = {
    url: $state.href('sum', {id: $scope.party.data._id}, { absolute: true })
  };

  $scope.togglePop = function () {
    $scope.pop.isOpen = !$scope.pop.isOpen;
  };

}])
.filter('searchPartyTitle', ['matcher', function (matcher) {
  return function (partyList, searchText) {
    var ret = [];
    _.forEach(partyList, function (item, index) {
      if (matcher.match(searchText, item.title)) {
        ret.unshift(item);
      }
    });
    return ret;
  };
}])
.filter('searchSaler', ['matcher', function (matcher) {
  return function (salerList, searchText) {
    var ret = [];
    _.forEach(salerList, function (saler, index) {
      if (matcher.match(searchText, saler.name)) {
        ret.unshift(saler);
      }
    });
    return ret;
  };
}])
.filter('searchMenuitem', ['matcher', function (matcher) {
  return function (menu, searchText, showMin) {
    var ret = [];
    for (var i = menu.length - 1; i >= 0; i--) {
      var item = menu[i];
      var menuitemName = (item.menuitem && item.menuitem.name) || item.name;
      // if (item.menuitem.name.indexOf(searchText || '') > -1) {
      if ((!showMin || item.total>=showMin) && matcher.match(searchText, menuitemName)) {
        ret.unshift(item);
      }
    }
    return ret;
  };
}])
.filter('searchPartyMenuBySalerName', ['matcher', function (matcher) {
  return function (menu, searchText) {
    var ret = [];
    for (var i = menu.length - 1; i >= 0; i--) {
      var item = menu[i];
      var salerName = (item.menuitem && item.menuitem.saler.name) || '';
      // if (item.menuitem.name.indexOf(searchText || '') > -1) {
      if (!item.removed && matcher.match(searchText, salerName)) {
        ret.unshift(item);
      }
    }
    return ret;
  };
}])
.filter('searchMember', ['matcher', function (matcher) {
  return function (members, memberName) {
    var ret = [];
    angular.forEach(members, function (member, index) {
      // if (!member.removed && member.name.indexOf(memberName) > -1) {
      if (!member.removed && matcher.match(memberName, member.name)) {
        ret.push(member);
      }
    });
    return ret;
  };
}])
.filter('menuOrdered', [function () {
  return function (menu) {
    var ret = angular.copy(menu);
    angular.forEach(ret, function (item, index, ret) {
      if (item.quantity === 0) {
        ret.splice(index, 1);
      }
    });
    return ret;
  }
}])
.directive('ytMaxHeight', [
  '$window',
  '$document',
  '$position',
function ($window, $document, $position) {
  return {
    restrict: 'A',
    scope: {},
    link: function (scope, element, attrs) {

      var _top = $position.offset(element).top;
      updateHeight();

      angular.element($window).bind('resize', updateHeight);
      angular.element($window).on('scroll', updateHeight);
      // Unbind scroll event handler when directive is removed
      scope.$on('$destroy', function() {
        angular.element($window).unbind('resize', updateHeight);
        angular.element($window).off('scroll', updateHeight);
      });

      function updateHeight() {
        var clientHeight = $window.innerHeight || $document.documentElement.clientHeight;
        var offset = $window.pageYOffset;
        var top = 0;
        if (offset > _top) {
          top = 66;
        } else {
          top = _top;
        }
        var maxHeight = clientHeight - top;
        element.css({
          height: maxHeight + 'px',
          overflowY: 'auto'
        })
      }
    }
  };
}]);
});

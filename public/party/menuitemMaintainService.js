define([], function () {
  angular.module('menuitemMaintainService', [])
  .factory('MenuitemMaintainModal', [
    '$modal',
    '$q',
  function ($modal, $q) {
    var self = {
      open: function (menuitem) {
        var defered = $q.defer();
        var modalInstance = $modal.open({
          templateUrl: 'party/menuitemMaintain.tpl.html',
          controller: 'CtrlMenuitemMaintain',
          backdrop: 'static',
          windowClass: 'menuitem-maintain',
          size: 'lg',
          resolve: {
            opts: function () {
              return {
                menuitem: menuitem
              }
            }
          }
        });

        modalInstance.result.then(function (retMenuitem) {
          defered.resolve(retMenuitem);
        });

        return defered.promise;
      }
    };

    return self;
  }])
  .controller('CtrlMenuitemMaintain', [
    '$scope',
    '$modalInstance',
    'opts',
    'Saler',
  function ($scope, $modalInstance, opts, Saler) {
    $scope.menuitem = angular.copy(opts.menuitem);
    $scope.e = {
      groupName: ''
    };

    $scope.addGroup = function (type) {
      var groupName = $scope.e.groupName.trim();
      if (groupName) {
        var optGroups = $scope.menuitem.optGroups = $scope.menuitem.optGroups || [];
        var group = {
          name: groupName,
          opts: []
        }
        if (type) {
          group[type] = true;
        }
        optGroups.unshift(group);
        $scope.e.groupName = '';
      }
    };

    $scope.removeGroup = function (index) {
      $scope.menuitem.optGroups.splice(index, 1);
    };

    $scope.addOpt = function (group) {
      var optName = group.optName && group.optName.trim();
      if (optName) {
        group.opts.push(optName);
        group.optName = '';
      }
    };

    $scope.handleOptNameKeyup = function (event, group) {
      if (event.keyCode === 13 ) {
        $scope.addOpt(group);
      }
    };

    $scope.removeOpt = function (group, index) {
      group.opts.splice(index, 1);
    };

    $scope.submit = function () {
      var _menuitem = angular.copy($scope.menuitem);
      _menuitem.saler = _menuitem.saler._id || _menuitem.saler;
      _menuitem.optGroups = [];
      _.forEach($scope.menuitem.optGroups, function (group, index) {
        if (group.opts.length && (!group.required || group.opts.length > 1)) {
          _menuitem.optGroups.push(group);
        }
      });
      Saler.saveMenuitem(_menuitem).success(function (menuitem) {
        $modalInstance.close(menuitem);
      });
    };

    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };

  }]);
});

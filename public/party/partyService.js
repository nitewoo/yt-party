 define([], function () {
angular.module('partyService', [])
  .factory('Party', [
    'PartyHttp',
    '$filter',
    '$q',
    'io',
  function (PartyHttp, $filter, $q, io) {
    var partyInstance = {
      // data: {},
      // membersView: [],
      // salersView: {},
      // menuitemMap: {},
      // orderView: {},
      // curMember: null,
      // e: {
      //   party: '',
      //   showMin: -1,
      //   showOrderSum: false,
      //   memberNameLaunched: ''
      // },
      create: function (isOneMore) {
        var deferred = $q.defer();
        if (isOneMore) {
          var id = partyInstance.e.party._id;
          if (id) {
            PartyHttp.oneMore(id).success(function (party) {
              deferred.resolve({partyId: party._id});
            })
          }
        } else {
          var title = partyInstance.e.party.title || partyInstance.e.party;
          if (title) {
            PartyHttp.create({
              title: title
            }).success(function (party) {
              deferred.resolve({partyId: party._id});
            });
          }
        }

        return deferred.promise
      },
      init: function (id) {
        resetParty();
        if (id) {
          PartyHttp.get(id).success(function (party) {
            angular.extend(partyInstance.data, party);
            partyInstance.e.maintaining = !party.launched;
            updateMembers();
            resetMembersView();
            initSalersView();
            resolveOrderView();
            initLog();
            io.emit('party.join', party._id);
          });
        } else {
          partyInstance.inited = true;
        }
      },
      saveTitle: function () {
        var deferred = $q.defer();
        var title = partyInstance.e.title.trim();
        if (title) {
          PartyHttp.save({
            id: partyInstance.data._id,
            party: {
              title: title
            }
          }).success(function (party) {
            partyInstance.data.title = title;
          }).finally(function (party) {
            deferred.resolve();
          });
        } else {
          deferred.resolve();
        }
        return deferred.promise;
      },
      resolveOrderView: resolveOrderView,
      addMember: function (name, andSignUp) {
        var _name = name.trim();
        if (name) {
          PartyHttp.addMember({
            id: partyInstance.data._id,
            member: {
              name: _name
            }
          }).success(function (party) {
            angular.extend(partyInstance.data, party);
            partyInstance.e.memberName = '';
            if (andSignUp) {
              var member = _.find(partyInstance.data.members, function (_member, index) {
                return _member.name === _name;
              });
              partyInstance.signUp(member);
            }
          });
        }
      },
      removeMember: function (member) {
        PartyHttp.removeMember({
          id: partyInstance.data._id,
          member: member
        }).success(function (party) {
          angular.extend(partyInstance.data, party);
        });
      },
      addToMenu: function (item) {
        PartyHttp.addMenuitem({
          id: partyInstance.data._id,
          item: item
        }).success(function (party) {
          angular.extend(partyInstance.data, party);
        });
      },
      addAllToMenu: function (salerMenu) {
        PartyHttp.addSalerMenu({
          id: partyInstance.data._id,
          salerMenu: salerMenu
        }).success(function (party) {
          angular.extend(partyInstance.data, party);
        });
      },
      removeFromMenu: function (item) {
        PartyHttp.removeMenuitem({
          id: partyInstance.data._id,
          item: item.menuitem
        }).success(function (party) {
          angular.extend(partyInstance.data, party);
        });
      },
      removeAllFromMenu: function () {
        var menu = partyInstance.data.menu;
        PartyHttp.removeAllMenuitem({
          id: partyInstance.data._id,
          menu: menu
        }).success(function (party) {
          angular.extend(partyInstance.data, party);
        });
      },
      launch: function () {
        PartyHttp.launch(partyInstance.data._id).success(function (party) {
          angular.extend(partyInstance.data, party);
          resetMembersView();
          initSalersView();
          resolveOrderView();
          initLog();
          partyInstance.e.maintaining = false;
        });
      },
      resetMembersView: resetMembersView,
      signUp: function (member) {
        if (partyInstance.curMember) {
          partyInstance.signOff();
        }
        partyInstance.curMember = member;
        initCurrentMemberSalers();
        partyInstance.e.showOrderSum = false;
      },
      signOff: function () {
        partyInstance.curMember = null;
        partyInstance.e.memberNameLaunched = '';
        resetMembersView();
      },
      updateOrder: function (item, num) {
        PartyHttp.updateOrder({
          id: partyInstance.data._id,
          memberName: partyInstance.curMember.name,
          itemName: concatItemName(item),
          menuitemId: item.menuitem._id,
          number: num
        }).success(function (party) {

        });
      },
      updateMember: function (party) {
        // var deferred = $q.defer();
        updateMembers(party.members);
        updateCurMember();
        // updateMenu(party)
        updateMenuTotal(party);
        updateMenuView(party);
        resolveOrderView();

        // deferred.resolve();
        // return deferred.promise;
      },
      updateOrderLog: function (party) {
        var instanceLog = partyInstance.data.orderLog;
        var newLog = party.orderLog;
        var newLength = newLog.length - instanceLog.length;

        var orderLogView = partyInstance.orderLogView;
        if (newLength > 0) {
          for ( var i = newLength - 1; i >= 0; i--) {
            var log = newLog[i];
            instanceLog.unshift(log);
            orderLogView.unshift(resolveOrderLog(log));
          }
        }
      }
    };

    return partyInstance;

    // 清空当前party
    function resetParty() {
      partyInstance.data = {};
      partyInstance.membersView = [];
      partyInstance.salersView = {};
      partyInstance.menuitemMap = {};
      partyInstance.orderView = {};
      partyInstance.curMember = null;
      partyInstance.orderLogView = [];
      partyInstance.e = {
        party: '',
        showMin: -1,
        showOrderSum: false,
        memberNameLaunched: ''
      };
    }

    // 更新所有成员的数据、状态
    function updateMembers(members) {
      angular.extend(partyInstance.data.members, members);
      angular.forEach(partyInstance.data.members, function (member, index) {
        member.isOrdered = checkOrder(member);
      });
    }
    // 检查成员是否已经点过单
    function checkOrder(member) {
      var isOrdered = false;
      for (var i = member.order.length - 1; i >= 0; i--) {
        if (member.order[i].quantity) {
          isOrdered = true;
          break;
        }
      }
      return isOrdered;
    }
    // 重置成员视图，过滤已删除的成员
    // to-do 后台处理?
    function resetMembersView() {
      partyInstance.membersView = $filter('filter')(partyInstance.data.members, {removed: '!true'});
    }

    function updateCurMember() {
      var curName = partyInstance.curMember && partyInstance.curMember.name;
      if (curName) {
        partyInstance.curMember = _.find(partyInstance.data.members, function (_member, index) {
          return _member.name === curName;
        });
        initCurrentMemberSalers();
      }
    }

    function initCurrentMemberSalers() {
        var curSalerView = partyInstance.curMember.salersView = {};
        angular.forEach(partyInstance.curMember.order, function (item, index) {
          var salerId = item.menuitem.saler._id;
          var salerName = item.menuitem.saler.name;
          if (!curSalerView[salerId]) {
            curSalerView[salerId] = {
              name: salerName,
              menu: []
            };
          }
          curSalerView[salerId].menu.push(item);
          if (item.quantity) {
            partyInstance.curMember.ordered = true;
          }
        });
      }

    // 初始化卖家视图数据
    function initSalersView() {
      var salers = partyInstance.salersView = {};
      var menuitemMap = partyInstance.menuitemMap = {};
      angular.forEach(partyInstance.data.menu, function (item, index) {
        var salerId = item.menuitem.saler._id;
        var salerName = item.menuitem.saler.name;
        if (!salers[salerId]) {
          salers[salerId] = {
            name: salerName,
            menu: []
          };
        }
        var _item = _.find(salers[salerId].menu, function (_item, index) {
          return _item.name === item.name;
        });
        salers[salerId].menu.push(item);
        menuitemMap[item.menuitem._id] = item;
        initMenuitemOpt(item.menuitem);
        item.total = 0;
      });
      updateMenuTotal(partyInstance.data);
    }

    // 初始化菜品的选项组
    function initMenuitemOpt(menuitem) {
      if (menuitem.optGroups && menuitem.optGroups.length) {
        for (var i = menuitem.optGroups.length - 1; i >= 0; i--) {
          var group = menuitem.optGroups[i];
          if (group.required) {
            // group.selectedIndex = group.required ? 0 : -1;
            group.selected = [0];
          } else {
            group.selected = [];
          }
        }
      }
    }

    //
    // function updateMenu(party) {
    //   updateMenuTotal(party);
    //   updateMenuView(party);
    // }

    // 更新点单合计
    function updateMenuTotal(party) {
      angular.forEach(party.members, function (member, index) {
        if (!member.removed) {
          angular.forEach(member.order, function (item, index) {
            var _item = _.find(party.menu, function(one) {
              return one.menuitem._id === item.menuitem._id;
            });
            _item.total = (_item.total || 0) + item.quantity;
          });
        }
      });
    }

    // 更新菜单视图
    function updateMenuView(party) {
      var menuView = partyInstance.data.menu;
      var menu = _.clone(party.menu);
      _.forEach(menu, function (item, index) {
        var _item = _.find(menuView, function(one) {
          one.menuitem._id === item.menuitem._id;
        });
        if (_item) {
          _item.total = item.total,
          _item.removed = item.removed
        }
      });
    }

    // 组织各成员的订单视图
    function resolveOrderView() {
      var salers = partyInstance.orderView = {};
      angular.forEach(partyInstance.data.members, function (member, index) {
        updateOrderTotal(member.order);
      });
    }
    // 更新成员的订单数据
    function updateOrderTotal(order) {
      var salers = partyInstance.orderView;
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
      // var _item = Util.findObj(saler.menu, 'name', item.name).object;
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

    function concatItemName(item) {
      var itemName;
      if (item.name) {
        itemName = item.name;
      } else {
        var menuitem = item.menuitem;
        var opts = [];
        if (menuitem.optGroups && menuitem.optGroups.length) {
          angular.forEach(menuitem.optGroups, function (group, i) {
            angular.forEach(group.selected, function (opt, index) {
              opts.push(menuitem.optGroups[i].opts[opt]);
            });
          });
        }
        opts.sort().unshift(item.menuitem.name)
        itemName = opts.join('_');
      }

      return itemName;
    }

    function initLog() {
      var orderLogView = partyInstance.orderLogView;
      orderLogView.length = 0;
      angular.forEach(partyInstance.data.orderLog, function (log, index) {
        // var quantity = log.orderItem.quantity;
        // var memberName = log.memberName;
        // var itemName = ' 1份 ' + log.orderItem.name;
        // var action = log.action === 'increase' ? '点了' : '减了';
        // if (log.action === 'increase') {
        //   action = '点了';
        //   if (quantity > 1) {
        //     action = '又' + action;
        //   }
        // } else {
        //   action = '减了';
        // }
        // var plusMsg = '';
        // if ( quantity > 2 ) {
        //   plusMsg = '， (⊙_⊙) 这货已经点了 ' + quantity + ' 份了一共';
        // }

        // var msg = memberName + ' ' + action + itemName + plusMsg;
        orderLogView.push(resolveOrderLog(log));
      });
    }

    function resolveOrderLog(log) {
      var quantity = log.orderItem.quantity;
      var memberName = log.memberName;
      var itemName = ' 1份 ' + log.orderItem.name;
      var action = log.action === 'increase' ? '点了' : '减了';
      if (log.action === 'increase') {
        action = '点了';
        if (quantity > 1) {
          action = '又' + action;
        }
      } else {
        action = '减了';
      }
      var plusMsg = '';
      if ( quantity > 2 ) {
        plusMsg = '， (⊙_⊙) 这货已经点了 ' + quantity + ' 份了一共';
      }

      return {
        msg: memberName + ' ' + action + itemName + plusMsg
      };
    }
  }])
  .factory('PartyHttp', [
    '$http',
  function ($http) {
    return {
      get: function (id) {
        var url = '/api/party';
        if (id) {
          url = url + '/' + id
        }
        return $http.get(url);
      },
      save: function (params) {
        var url = '/api/party/' + params.id;
        var data = angular.toJson(params.party)
        return $http.post(url, data);
      },
      create: function (party) {
        var url = '/api/party'
        return $http.post(url, party);
      },
      oneMore: function (id) {
        var url = '/api/party/new/' + id;
        return $http.post(url);
      },
      addMember: function (params) {
        var url = '/api/party/' + params.id +'/addMember';
        var data = angular.toJson(params.member);
        return $http.post(url, data);
      },
      removeMember: function (params) {
        var url = '/api/party/' + params.id +'/removeMember';
        var data = angular.toJson(params.member);
        return $http.post(url, data);
      },
      addMenuitem: function (params) {
        var url = '/api/party/' + params.id +'/addMenuitem';
        var data = angular.toJson(params.item);
        return $http.post(url, data);
      },
      addSalerMenu: function (params) {
        var url = '/api/party/' + params.id +'/addSalerMenu';
        var data = angular.toJson(params.salerMenu);
        return $http.post(url, data);
      },
      removeMenuitem: function (params) {
        var url = '/api/party/' + params.id +'/removeMenuitem';
        var data = angular.toJson(params.item);
        return $http.post(url, data);
      },
      removeAllMenuitem: function (params) {
        var url = '/api/party/' + params.id +'/removeAllMenuitem';
        var data = angular.toJson(params.menu);
        return $http.post(url, data);
      },
      launch: function (id) {
        var url = '/api/party/' + id + '/launch';
        return $http.post(url);
      },
      signUp: function (params) {
        var url = '/api/party/' + params.id + '/' + params.memberName + '/signup';
        var data = angular.toJson(params.order);
        return $http.post(url, data);
      },
      updateOrder: function (params) {
        var url = '/api/party/' + params.id + '/update/' + params.memberName + '/order'
        var data = angular.toJson({
          itemName: params.itemName,
          menuitemId: params.menuitemId,
          number: params.number
        });
        return $http.post(url, data);
      }
    };
  }]);
});

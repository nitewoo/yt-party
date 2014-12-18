define(['searcher'], function(searcher) {
  angular.module('demo', []).controller('CtrlDemo', function ($scope, $stateParams, $location, Party, Saler, matcher) {
    var COLORS = [
      '#e21400', '#91580f', '#f8a700', '#f78b00',
      '#58dc00', '#287b00', '#a8f07a', '#4ae8c4',
      '#3b88eb', '#3824aa', '#a700ff', '#d300e7'
    ];
    // $scope.users = [];
    // _.times(10, function () {
    //   $scope.users.push({
    //     boxColorIndex: 'box-color' + _.random(1, 9)
    //   })
    // })
    var viewPortWidth = document.documentElement.clientWidth;
    var viewPortHeight = document.documentElement.clientHeight;
    if (true) {

    }
    var members;
    Party.get($stateParams.id).success(function (party) {
      // members = party.members;
      $scope.users = party.members;
      _.each($scope.users, function (user) {

        user.boxColorIndex = 'box-color' + hashCode(user.name, 9);
        // user.tokens = getTerm(user.name);
      })
    });

    $scope.filterFn = function (item) {
      if (!$scope.query) return true;
      return matcher.match($scope.query, item.name);
      // if (!$scope.query) return true;
      // var name = item.name;
      // if (!name) return false;
      // var terms = getTerm($scope.query);
      // var flags = [];
      // flags.length = terms.length;
      // for (var i = 0; i < terms.length; i++) {
      //   var term = terms[i];
      //   for (var j = 0; j < item.tokens.length; j++) {
      //     if( item.tokens[j].indexOf(term) === 0) {
      //       flags[i] = true;
      //       break;
      //     }
      //   }
      // }
      // console.log(flags, terms, item.tokens)
      // for (var k = 0; k < flags.length; k++) {
      //   if (!flags[k]) return false;
      // };
      // return true;
      // if (item.tokens.indexOf($scope.query) !== -1) {
      //   return true;
      // }
    };
    var hashCode = function(string,range) {
      var hash = 0;

      if (string.length == 0) return hash;
      for (i = 0, len = string.length; i < len; i++) {
        hash += string.charCodeAt(i);
      }
      if (range) {
        return ( hash % range ) + 1;
      } else {
        return hash;
      }
    };
    var CHINESE_REG = /[\u4E00-\u9FA5]/;
    var ENGLISH_LETTER_REG = /[a-zA-Z]/;
    function getTerm (input) {
      var terms = [];
      // for (var i = 0; i < input.length; i++) {
      var index = 0;
      var cacheIndex = 0;
      while (index < input.length) {
        var ch = input[index];
        if (CHINESE_REG.test(ch)) {
          
          if (cacheIndex !== index) {
            terms.push(input.substring(cacheIndex, index))
          }
          terms.push(dict[ch]);
          // terms.push(ch);
          index = index + 1;
          cacheIndex = index;
        } else if (ENGLISH_LETTER_REG.test(ch)) {
          index = index + 1;
        } else {
          if (cacheIndex !== index) {
            terms.push(input.substring(cacheIndex, index))
          }
          terms.push(ch);
          index = index + 1;
          cacheIndex = index;
        }
      }
      if (cacheIndex !== index) {
        terms.push(input.substring(cacheIndex, index))
      }

      return sanitize(terms);
    }
    // elimate space, and lowercase everything
    function sanitize (terms) {
      var result = [];
      for (var i = 0; i < terms.length; i++) {
        var term = terms[i].trim();
        if (term) {
          result.push(term.toLowerCase())
        }
      }
      return result;
    }
    // $scope.$watch('query', function(newValue, oldValue) {
    //   if (newValue && newValue !== oldValue) {

    //   }
    // })
  })


  .factory('Party', [
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
      removeMenuitem: function (params) {
        var url = '/api/party/' + params.id +'/removeMenuitem';
        var data = angular.toJson(params.item);
        return $http.post(url, data);
      },
      launch: function (id) {
        var url = '/api/party/' + id + '/launch';
        return $http.post(url);
      },
      signUp: function (params) {
        var url = '/api/party/' + params.id + '/sign/' + params.memberName;
        var data = angular.toJson(params.order);
        return $http.post(url, data);
      },
      updateOrder: function (params) {
        var url = '/api/party/' + params.id + '/update/' + params.memberName + '/order'
        var data = angular.toJson(params.order);
        return $http.post(url, data);
      }
    };
  }])
  .factory('Saler', [
    '$http',
  function ($http) {
    return {
      get: function (id) {
        var url = '/api/saler';
        if (id) {
          url = url + '/' + id
        }
        return $http.get(url);
      },
      getMenuitems: function (salerId) {
        var url = '/api/menu/' + salerId;
        return $http.get(url);
      }
    };
  }])
})
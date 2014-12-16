define([], function () {
  angular.module('partyService', []).factory('Party', [
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
  }]);
});

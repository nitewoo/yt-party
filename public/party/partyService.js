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
      save: function (party) {
        return $http.post('/api/party', party);
      }
    };
  }]);
});

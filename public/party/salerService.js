define([], function () {
  angular.module('salerService', []).factory('Saler', [
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
  }]);
});

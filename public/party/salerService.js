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
      },
      saveMenuitem: function (menuitem) {
        var url = '/api/menu';
        if (menuitem._id) {
          url = url + '/' + menuitem._id;
        }
        var data = angular.toJson(menuitem);
        delete data._id;
        return $http.post(url, data);
      }
    };
  }]);
});

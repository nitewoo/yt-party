define(['app'], function (app) {
  app.config([
    '$stateProvider',
    '$urlRouterProvider',
    '$ocLazyLoadProvider',
  function ($stateProvider, $urlRouterProvider, $ocLazyLoadProvider) {
    this.$get = function () {
      // this is a config-time-only provider
      // in a future sample it will expose runtime information to the app
      return {};
    }

    $urlRouterProvider.otherwise('/party');

    $stateProvider.state('party', {
      url: '/party?id', // root route
      views: {
        'body': {
          controller: 'CtrlParty', // This view will use AppCtrl loaded below in the resolve
          templateUrl: 'party/main.tpl.html'
        }
      },
      resolve: { // Any property in resolve should return a promise and is executed before the view is loaded
        loadModule: ['$ocLazyLoad', function($ocLazyLoad) {
          // you can lazy load files for an existing module
          return $ocLazyLoad.load({
            name: 'party',
            files: ['party/core.js']
          });
        }]
      }
    });

    $stateProvider.state('demo', {
      url: '/demo?id', // root route
      views: {
        'body': {
          controller: 'CtrlDemo', // This view will use AppCtrl loaded below in the resolve
          templateUrl: 'demo/demo.tpl.html'
        }
      },
      resolve: { // Any property in resolve should return a promise and is executed before the view is loaded
        loadModule: ['$ocLazyLoad', function($ocLazyLoad) {
          // you can lazy load files for an existing module
          return $ocLazyLoad.load({
            name: 'demo',
            files: ['demo/demo.js']
          });
        }]
      }
    });


  }]);
});
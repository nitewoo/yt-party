require.config({
  baseUrl: '.',
  paths: {
    'angular': 'vendor/angular-1.2.27/angular',
    'ocLazyLoad': 'vendor/ocLazyLoad/dist/ocLazyLoad',
    'angular-ui-router': 'vendor/ui-router/release/angular-ui-router',
    'ui-bootstrap': 'vendor/ui-bootstrap/ui-bootstrap-tpls-0.12.0'
  },
  shim: {
    'angular': {
      exports: 'angular',
    },
    'angular-ui-router': ['angular'],
    'ui-bootstrap': ['angular'],
    'ocLazyLoad': ['angular']
  }
});

// kick start
require(['app', 'routes'], function (app) {
  angular.element(document).ready(function () {
    angular.bootstrap(document.body, [app['name'], function () {
      // for good measure, put ng-app on the html element
      // studiously avoiding jQuery because angularjs.org says we shouldn't
      // use it.  In real life, there are a ton of reasons to use it.
      // karma likes to have ng-app on the html element when using requirejs.
      angular.element(document).find('html').addClass('ng-app');
    }]);
  })

});

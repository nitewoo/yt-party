require.config({
  baseUrl: '.',
  paths: {
    'angular': 'vendor/angular/angular',
    'ocLazyLoad': 'vendor/ocLazyLoad/dist/ocLazyLoad',
    'angular-ui-router': 'vendor/ui-router/release/angular-ui-router',
    'ui-bootstrap': 'vendor/angular-bootstrap/ui-bootstrap-tpls',
    'angular-animate': 'vendor/angular-animate/angular-animate',
    'lodash': 'vendor/lodash/dist/lodash',
    'qrcode': 'vendor/angular-qr/lib/qrcode',
    'angular-qr': 'vendor/angular-qr/src/angular-qr',
  },
  shim: {
    'angular': {
      exports: 'angular',
    },
    'lodash': {
      exports: '_',
    },
    'angular-ui-router': ['angular'],
    'angular-animate': ['angular'],
    'ui-bootstrap': ['angular'],
    'ocLazyLoad': ['angular'],
    'angular-qr': ['angular', 'qrcode']
  }
});

// kick start
require(['app', 'routes', 'searcher'], function (app) {
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

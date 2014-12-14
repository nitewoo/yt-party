define([
  'angular',
  'angular-ui-router',
  'ui-bootstrap',
  'ocLazyLoad'
], function (angular) {
  'use strict';

  var app = angular.module('app', ['ui.router', 'oc.lazyLoad', 'ui.bootstrap']);
  app.config(['$ocLazyLoadProvider', function($ocLazyLoadProvider) {
    $ocLazyLoadProvider.config({
      loadedModules: ['app'],
      jsLoader: requirejs,
      debug: true
    });
  }]);
  app.controller('CtrlApp', [
    '$scope',
  function ($scope) {

  }]);

  return app;
});
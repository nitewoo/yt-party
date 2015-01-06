define([
  'angular',
  'lodash',
  'angular-ui-router',
  'ui-bootstrap',
  'angular-animate',
  'ocLazyLoad'
], function (angular, _) {
  'use strict';
  // Tell the server your username
  // var socket = io();
  //     socket.emit('event', 'test');
  var app = angular.module('app', ['ui.router', 'oc.lazyLoad', 'ui.bootstrap', 'ngAnimate']);
  app.config(['$ocLazyLoadProvider', function($ocLazyLoadProvider) {
    $ocLazyLoadProvider.config({
      loadedModules: ['app'],
      jsLoader: requirejs,
      debug: false
    });
  }]);
  app.controller('CtrlApp', [
    '$scope',
  function ($scope) {

  }]);

  app.service('io', function () {
    return io();
  });

  return app;
});
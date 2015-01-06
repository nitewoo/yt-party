define([
  'party/partyController',
  'party/partyService',
  'party/salerService',
  'party/menuitemMaintainService',
  '_directives/ytFocusMe',
  '_directives/ytScrollfix',
  '_services/matcherService',
  '_services/utilService',
  'angular-qr'
], function () {
  angular.module('party', [
    'partyService',
    'partyController',
    'salerService',
    'menuitemMaintainService',
    'ytFocusMeDirective',
    'ytScrollfixDirective',
    'matcherService',
    'utilService',
    'ja.qr'
  ]);
});
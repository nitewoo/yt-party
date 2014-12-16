define([
  'party/partyController',
  'party/partyService',
  'party/salerService'
], function () {
  angular.module('party', ['partyService', 'partyController', 'salerService']);
});
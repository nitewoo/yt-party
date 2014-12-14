define([
  'party/partyController',
  'party/partyService'
], function () {
  angular.module('party', ['partyService', 'partyController']);
});
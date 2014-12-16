var mongoose = require('mongoose');
var PartySchema = require('../schemas/Party');

var Party = mongoose.model('Party', PartySchema);

module.exports = Party;
var mongoose = require('mongoose');
var PartySchema = require('../schemas/party');

var Party = mongoose.model('Party', PartySchema);

module.exports = Party;
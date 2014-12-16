var mongoose = require('mongoose');
var SalerSchema = require('../schemas/Saler');

var Saler = mongoose.model('Saler', SalerSchema);

module.exports = Saler;
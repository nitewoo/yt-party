var mongoose = require('mongoose');
var MenuitemSchema = require('../schemas/Menuitem');

var Menuitem = mongoose.model('Menuitem', MenuitemSchema);

module.exports = Menuitem;
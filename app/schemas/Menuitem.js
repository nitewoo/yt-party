var mongoose = require('mongoose');

var MenuitemSchema = new mongoose.Schema({
  name: String,
  price: Number,
  saler: { type: mongoose.Schema.Types.ObjectId, ref: 'Saler' }
}, { collection: 'Menuitem' });

MenuitemSchema.statics = {
  fetch: function (cbfn) {
    return (
      this
        .find({})
        .populate('saler')
        .sort('updateAt')
        .exec(cbfn)
    );
  },
  findBySaler: function (salerId, cbfn) {
    // var salerPattern = new RegExp(saler, "ig")
    var _salerId = mongoose.Types.ObjectId(salerId);
    return (
      this
        .find({
          saler: salerId
        })
        .populate('saler')
        .exec(cbfn)
    );
  }
}

module.exports = MenuitemSchema;
var mongoose = require('mongoose');

var SalerSchema = new mongoose.Schema({
  name: String
}, { collection: 'Saler' });

SalerSchema.statics = {
  fetch: function (cbfn) {
    return (
      this
        .find({})
        .sort('updateAt')
        .exec(cbfn)
    );
  },
  findByName: function (name, cbfn) {
    return (
      this
        .findOne({
          name: name
        })
        .exec(cbfn)
    );
  }
}

module.exports = SalerSchema;
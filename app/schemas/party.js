var mongoose = require('mongoose');

var PartySchema = new mongoose.Schema({
  title: String,
  isLaunched: Boolean,
  meta: {
    createAt: {
      type: Date,
      default: Date.now()
    },
    updateAt: {
      type: Date,
      default: Date.now()
    }
  },
  menu: [{
    name: String,
    total: Number
  }],
  member: [{
    name: String,
    cellphone: String,
    isSigned: Boolean
  }]
});

PartySchema.pre('save', function (next) {
  if (this.isNew) {
    this.meta.createAt = this.meta.updateAt = Date.now();
  } else {
    thie.meta.updateAt = Date.now();
  }

  next();
});

PartySchema.statics = {
  fetch: function (cbfn) {
    return (
      this
        .find({})
        .sort('updateAt')
        .exec(cbfn)
    );
  },
  findById: function (id, cbfn) {
    return (
      this
        .findOne({
          _id: id
        })
        .exec(cbfn)
    );
  }
}

module.exports = PartySchema;
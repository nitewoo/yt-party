var mongoose = require('mongoose');
// var Saler = require('../models/Saler');
// var Menuitem = require('../models/Menuitem');

var PartySchema = new mongoose.Schema({
  title: String,
  launched: Boolean,
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
    menuitem: { type: mongoose.Schema.Types.ObjectId, ref: 'Menuitem' },
    removed: Boolean
    // total: { type: Number, default: 0 }
  }],
  defaultAll: Boolean,
  members: [{
    name: String,
    cellphone: String,
    removed: Boolean,
    signed: Boolean,
    order: [{
      menuitem: { type: mongoose.Schema.Types.ObjectId, ref: 'Menuitem' },
      quantity: Number
    }]
  }]
}, { collection: 'Party' });

PartySchema.pre('save', function (next) {
  if (this.isNew) {
    this.meta.createAt = this.meta.updateAt = Date.now();
  } else {
    this.meta.updateAt = Date.now();
  }

  next();
});

PartySchema.statics = {
  fetch: function (cbfn) {
    var Party = this;
    return (
      this
        .find({})
        .populate('menu.menuitem')
        .populate('members.order.menuitem')
        .sort('updateAt')
        .exec(function (err, partys) {
          Party.populate(partys, {path: 'menu.menuitem.saler', model: 'Saler'}, cbfn)
        })
    );
  },
  findById: function (id, cbfn) {
    var Party = this;
    return (
      this
        .findOne({_id: id})
        .populate('menu.menuitem')
        .populate('members.order.menuitem')
        .exec(function (err, party) {
          Party.populate(party, {path: 'menu.menuitem.saler', model: 'Saler'}, cbfn)
        })
    );
  }
}

module.exports = PartySchema;


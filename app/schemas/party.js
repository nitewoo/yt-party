var mongoose = require('mongoose');

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
  menuUpdateAt: {
    type: Date,
    default: Date.now()
  },
  menu: [{
    menuitem: { type: mongoose.Schema.Types.ObjectId, ref: 'Menuitem' },
    removed: Boolean,
    // total: { type: Number, default: 0 }
  }],
  // defaultAll: Boolean,
  members: [{
    name: String,
    // cellphone: String,
    removed: Boolean,
    // signed: Boolean,
    // signAt: {
    //   type: Date,
    //   default: Date.now()
    // },
    order: [{
      name: String,
      menuitem: { type: mongoose.Schema.Types.ObjectId, ref: 'Menuitem' },
      quantity: Number
    }]
  }],
  orderLog: [{
    memberName: String,
    orderItem: {},
    action: {
      type: String,
      default: 'increase',
      enum: ['increase', 'decrease']
    },
    createAt: {
      type: Date,
      default: Date.now()
    }
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
        .sort({'meta.createAt': 'desc'})
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
          party
            .populate([
              {path: 'menu.menuitem.saler', model: 'Saler'},
              {path: 'members.order.menuitem.saler', model: 'Saler'}
            ], cbfn);
        })
    );
  },
  addSalerMenu: function (id, menu, cbfn) {
    var Party = this;
    this.findOne({_id: id}).populate('menu.menuitem').exec(function (err, party) {
      if (err) {
        res.send(err);
      } else {
        for (var i = menu.length - 1; i >= 0; i--) {
          var menuitem = menu[i];
          var index = findMenuitem(menuitem, party.menu);
          if (index > -1) {
            party.menu[index].removed = false;
          } else {
            party.menu.unshift({
              menuitem: mongoose.Types.ObjectId(menuitem._id)
            });
          }
        }

        party.menuUpdateAt = Date.now();
        party.save(function (err, party) {
          party
            .populate('menu.menuitem')
            .populate('members.order.menuitem',
          function (err, party) {
            party
              .populate({path: 'menu.menuitem.saler', model: 'Saler'})
              .populate({path: 'members.order.menuitem.saler', model: 'Saler'}, cbfn);
          });
        });
      }
    })
  },
  addMenuitem: function (params, cbfn) {
    var id = params.id;
    var menuitem = params.menuitem;
    return (
      this.findOne({_id: id}).populate('menu.menuitem').exec(function (err, party) {
        if (err) {
          res.send(err);
        } else {
          var i = findMenuitem(menuitem, party.menu);
          if (i > -1) {
            party.menu[i].removed = false;
          } else {
            party.menu.unshift({
              menuitem: mongoose.Types.ObjectId(menuitem._id)
            });
          }
          party.menuUpdateAt = Date.now();
          party.save(function (err, party) {
            party
              .populate('menu.menuitem')
              .populate('members.order.menuitem',
            function (err, party) {
              party
                .populate({path: 'menu.menuitem.saler', model: 'Saler'})
                .populate({path: 'members.order.menuitem.saler', model: 'Saler'}, cbfn);
            });
          });
        }
      })
    );
  },
  removeMenuitem: function (id, menuitem, cbfn) {
    return (
      this.findOne({_id: id}).populate('menu.menuitem').exec(function (err, party) {
        if (err) {
          res.send(err);
        } else {
          var i = findMenuitem(menuitem, party.menu);
          if (i > -1) {
            party.menu[i].removed = true;
          }
          party.menuUpdateAt = Date.now();
          party.save(function (err, party) {
            party
              .populate('menu.menuitem')
              .populate('members.order.menuitem',
            function (err, party) {
              party.populate({path: 'menu.menuitem.saler members.order.menuitem.saler', model: 'Saler'}, cbfn);
            });
          });
        }
      })
    );
  },
  removeAllMenuitem: function (id, menu, cbfn) {
    this.findOne({_id: id}).populate('menu.menuitem').exec(function (err, party) {
      if (err) {
        res.send(err);
      } else {
        for (var i = menu.length - 1; i >= 0; i--) {
          var menuitem = menu[i].menuitem;
          var index = findMenuitem(menuitem, party.menu);
          if (index > -1) {
            party.menu[index].removed = true;
          }
        }

        party.menuUpdateAt = Date.now();
        party.save(function (err, party) {
          party
            .populate('menu.menuitem')
            .populate('members.order.menuitem',
          function (err, party) {
            party.populate({path: 'menu.menuitem.saler members.order.menuitem.saler', model: 'Saler'}, cbfn);
          });
        });
      }
    })
  }
}

module.exports = PartySchema;

function findMenuitem(item, arr) {
  var index = -1;
  if (!arr) {
    return -1;
  }
  for (var i = arr.length - 1; i >= 0; i--) {
    if (arr[i].menuitem._id && arr[i].menuitem._id.toString() === item._id) {
      index = i;
      break;
    }
  }
  return index;
}



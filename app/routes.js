var Party = require('./models/party');
var Saler = require('./models/saler');
var Menuitem = require('./models/Menuitem');
var _ = require('lodash');
var mongoose = require('mongoose');
// var ObjectId = mongoose.Types.ObjectId;

module.exports = function (app, io) {
  // routes =====
  // get all party
  app.get('/api/party', function (req, res) {
    Party.fetch(function (err, partys) {
      if (err) {
        res.send(err);
      }

      res.json(partys);
    });
  });

  app.get('/api/party/:id', function (req, res) {
    var id = req.params.id;
    Party.findById(id, function (err, party) {
      if (err) {
        res.send(err);
      }
      res.json(party);
    });
  });

  app.post('/api/party/new/:id', function (req, res) {
    var id = req.params.id;
    var oriParty;
    if (id) {
      Party.findById(id, function (err, oriParty) {
        if (err) {
          res.send(err);
        }
        oriParty._id = mongoose.Types.ObjectId();
        oriParty._v = 0;
        _.forEach(oriParty.members, function (member, index) {
          member.order.length = 0;
        });

        Party.create(oriParty, function (err, party) {
          if (err) {
            res.send(err);
          } else {
            res.json(party);
          }
        });
      });
    }
  });


  // create/update party
  app.post('/api/party', function (req, res) {
    var partyObj = req.body;
    var _party = new Party({
      title: partyObj.title
    });
    _party.save(function (err, party) {
      if (err) {
        res.send(err);
      }
      res.json(party);
    });
  });

  app.post('/api/party/:id', function (req, res) {
    var partyObj = req.body;
    var id = req.params.id;
    var _party;

    if (id) {
      Party.findById(id, function (err, party) {
        if (err) {
          res.send(err);
        }
        _party = _.extend(party, partyObj);
        _party.save(function (err, party) {
          if (err) {
            res.send(err);
          }
          res.json(party);
        });
      });
    }
  });

  app.post('/api/party/:id/addMenuitem',function (req, res) {
    var id = req.params.id;
    var menuitem = req.body;
    if (id) {
      Party.addMenuitem({
        id: id,
        menuitem: menuitem
      }, function (err, party) {
        if (err) {
          res.send(err);
        } else {
          res.json(party);
        }
      });
    }
  });

  app.post('/api/party/:id/addSalerMenu',function (req, res) {
    var id = req.params.id;
    var salerMenu = req.body;
    if (id) {
      Party.addSalerMenu(id, salerMenu, function (err, party) {
        if (err) {
          res.send(err);
        } else {
          res.json(party);
        }
      });
    }
  });

  app.post('/api/party/:id/removeMenuitem',function (req, res) {
    var id = req.params.id;
    var menuitem = req.body;
    if (id) {
      Party.removeMenuitem(id, menuitem, function (err, party) {
        if (err) {
          res.send(err);
        } else {
          res.json(party);
        }
      });
    }
  });

  app.post('/api/party/:id/removeAllMenuitem',function (req, res) {
    var id = req.params.id;
    var menu = req.body;
    if (id) {
      Party.removeAllMenuitem(id, menu, function (err, party) {
        if (err) {
          res.send(err);
        } else {
          res.json(party);
        }
      });
    }
  });


  app.post('/api/party/:id/addMember',function (req, res) {
    var id = req.params.id;
    var member = req.body;
    if (id) {
      Party.findById(id, function (err, party) {
        if (err) {
          res.send(err);
        } else {
          var i = findItem(member, party.members, 'name');
          if (i > -1) {
            party.members[i].removed = false;
          } else {
            party.members.unshift(member);
          }
          party.save(function (err, party) {
            if (err) {
              res.send(err);
            } else {
              res.json(party);
            }
          });
        }
      });
    }
  });

  app.post('/api/party/:id/removeMember',function (req, res) {
    var id = req.params.id;
    var member = req.body;
    if (id) {
      Party.findById(id, function (err, party) {
        if (err) {
          res.send(err);
        } else {
          var i = findItem(member, party.members, 'name');
          if (i > -1) {
            party.members[i].removed = true;
          }
          party.save(function (err, party) {
            if (err) {
              res.send(err);
            } else {
              res.json(party);
            }
          });
        }
      });
    }
  });

  app.post('/api/party/:id/launch', function (req, res) {
    var id = req.params.id;
    if (id) {
      Party.findById(id, function (err, party) {
        if (err) {
          res.send(err);
        } else {
          party.launched = true;
          party.save(function (err, party) {
            if (err) {
              res.send(err);
            } else {
              res.json(party);
            }
          });
        }
      });
    }
  });

  app.post('/api/party/:id/update/:memberName/order', function (req, res) {
    var id = req.params.id;
    var memberName = req.params.memberName;
    var itemName = req.body.itemName;
    var menuitemId = req.body.menuitemId;
    var num = req.body.number;
    if (id) {
      Party.findById(id, function (err, party) {
        if (err) {
          res.send(err);
        } else {
          var i = findItem({name: memberName}, party.members, 'name');
          if (i > -1) {
            var member = party.members[i];
            var order = party.members[i].order;
            // var j = findMenuitem(menuitem, order);
            // var j = findItem({name: itemName}, order, 'name');
            // if (j > -1) {
            //   order[j].quantity = order[j].quantity + num;
            //   if (order[j].quantity < 0) {
            //     order[j].quantity = 0;
            //   }
            // } else {
            //   order.unshift({
            //     name: itemName,
            //     menuitem: mongoose.Types.ObjectId(menuitemId),
            //     quantity: num
            //   });
            // }
            var _orderItem = _.find(order, function (_item, index) {
              return _item.name === itemName;
            });
            if (_orderItem) {
              _orderItem.quantity = _orderItem.quantity + num;
              if (_orderItem.quantity < 0) {
                _orderItem.quantity = 0;
              }
            } else {
              _orderItem = {
                name: itemName,
                menuitem: mongoose.Types.ObjectId(menuitemId),
                quantity: num
              };
              order.unshift(_orderItem);
            }

            party.orderLog.unshift({
              memberName: member.name,
              orderItem: _orderItem,
              action: num > 0 ? 'increase' : 'decrease'
            });
          }
          party.save(function (err, party) {
            if (err) {
              res.send(err);
            } else {
              party.populate('members.order.menuitem', function (err, party) {
                if (err) {
                  res.send(err);
                } else {
                  party.populate({path: 'members.order.menuitem.saler', model: 'Saler'}, function (err, party) {
                    if (err) {
                      res.send(err);
                    } else {
                      io.to(party._id).emit('member.updated', party);
                      res.json(party);
                    }
                  })
                }
              });
            }
          });
        }
      });
    }
  });

  app.get('/api/saler', function (req, res) {
    Saler.fetch(function (err, salers) {
      if (err) {
        res.send(err);
      } else {
        res.json(salers);
      }
    })
  });

  app.get('/api/menu/:salerId', function (req, res) {
    var salerId = req.params.salerId;
    Menuitem.findBySaler(salerId, function (err, items) {
      if (err) {
        res.send(err);
      } else {
        res.json(items);
      }
    });
  });

  app.post('/api/menu', function (req, res) {
    var menuitemObj = req.body;
    var _menuitem = new Menuitem({
      name: menuitemObj.name,
      saler: mongoose.Types.ObjectId(menuitemObj.saler),
      price: menuitemObj.price,
      optGroups: menuitemObj.optGroups
    });
    _menuitem.save(function (err, menuitem) {
      if (err) {
        res.send(err);
      }
      res.json(menuitem);
    });
  });

  app.post('/api/menu/:id', function (req, res) {
    var menuitemObj = req.body;
    var id = req.params.id;
    var _menuitem;

    if (id) {
      Menuitem.findById(id, function (err, menuitem) {
        if (err) {
          res.send(err);
        }
        _menuitem = _.extend(menuitem, menuitemObj);
        _menuitem.save(function (err, menuitem) {
          if (err) {
            res.send(err);
          }
          res.json(menuitem);
        });
      });
    }
  });

  app.get('/vendor/*', function (req, res) {
    res.sendfile('/vendor/*');
  });

  app.get('*', function (req, res) {
    res.sendfile('./public/index.html');  // load the single view file
  });
};

function findMenuitem(item, arr) {
  var index = -1;
  if (!arr) {
    return -1;
  }
  for (var i = arr.length - 1; i >= 0; i--) {
    if (arr[i].menuitem._id.toString() === item._id) {
      index = i;
      break;
    }
  }
  return index;
}

function findItem(item, arr, key) {
  var index = -1;
  var _key = key || '_id'
  if (!arr) {
    return index;
  }
  for (var i = arr.length - 1; i >= 0; i--) {
    if (arr[i][_key] && arr[i][_key].toString() === item[_key].toString()) {
      index = i;
      break;
    }
  }
  return index;
}
var Party = require('./models/party');
var Saler = require('./models/saler');
var Menuitem = require('./models/Menuitem');
var _ = require('underscore');
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;

module.exports = function (app) {
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
      Party.findById(id, function (err, party) {
        if (err) {
          res.send(err);
        } else {
          var i = findMenuitem(menuitem, party.menu);
          if (i > -1) {
            party.menu[i].removed = false;
          } else {
            party.menu.unshift({
              menuitem: ObjectId(menuitem._id)
            });
          }
          party.save(function (err, party) {
            Party.findById(party._id, function (err, party) {
              if (err) {
                res.send(err);
              } else {
                res.json(party);
              }
            });
          });
        }
      });
    }
  });

  app.post('/api/party/:id/removeMenuitem',function (req, res) {
    var id = req.params.id;
    var menuitem = req.body;
    if (id) {
      Party.findById(id, function (err, party) {
        if (err) {
          res.send(err);
        } else {
          var i = findMenuitem(menuitem, party.menu);
          console.log(menuitem);
          if (i > -1) {
            party.menu[i].removed = true;
          }
          party.save(function (err, party) {
            Party.findById(party._id, function (err, party) {
              if (err) {
                res.send(err);
              } else {
                res.json(party);
              }
            });
          });
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

  app.post('/api/party/:id/sign/:memberName', function (req, res) {
    var id = req.params.id;
    var memberName = req.params.memberName;
    var order = req.body;
    if (id) {
      Party.findById(id, function (err, party) {
        if (err) {
          res.send(err);
        } else {
          var i = findItem({name: memberName}, party.members, 'name');
          if (i > -1) {
            party.members[i].signed = true;
            party.members[i].order = order;
          }
          party.save(function (err, party) {
            if (err) {
              res.send(err);
            } else {
              party.populate('members.order.menuitem', function (err, party) {
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
    }
  });

  app.post('/api/party/:id/update/:memberName/order', function (req, res) {
    var id = req.params.id;
    var memberName = req.params.memberName;
    var order = req.body.map(function (item) {
      item.menuitem = item.menuitem._id;
      item.quantity = item.quantityEdit;
      return item
    });

    if (id) {
      Party.findById(id, function (err, party) {
        if (err) {
          res.send(err);
        } else {
          var i = findItem({name: memberName}, party.members, 'name');
          if (i > -1) {
            party.members[i].order = order;
          }
          party.save(function (err, party) {
            if (err) {
              res.send(err);
            } else {
              party.populate('members.order.menuitem', function (err, party) {
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
    if (arr[i][_key].toString() === item[_key].toString()) {
      index = i;
      break;
    }
  }
  return index;
}
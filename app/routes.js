var Party = require('./models/party');
var _ = require('underscore');

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

  // create/update party
  app.post('/api/party/', function (req, res) {
    var partyObj = req.body;
    var id = partyObj._id;
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
    } else {
      _party = new Party({
        title: partyObj.title
      });
      _party.save(function (err, party) {
        if (err) {
          res.send(err);
        }
        res.json(party);
      });
    }
  });

  app.post('/api/party/new/:id', function (req, res) {
    var id = req.parms.id;
    var oriParty;
    if (id) {
      Party.findById(id, function (err, party) {
        if (err) {
          res.send(err);
        }
        oriParty = party;

        delete oriParty._id;
        delete oriParty.v;

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

  app.get('/vendor/*', function (req, res) {
    res.sendfile('/vendor/*');
  });

  app.get('*', function (req, res) {
    res.sendfile('./public/index.html');  // load the single view file
  });
};
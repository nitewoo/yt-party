var mongoose = require('mongoose');
var Party = require('../app/models/party');
var Saler = require('../app/models/saler');
var Menuitem = require('../app/models/Menuitem');

var _ = require('underscore');
var ObjectId = mongoose.Types.ObjectId;

var databaseUrl = 'mongodb://localhost/party';
mongoose.connect(databaseUrl);

//clear all salers exist
Saler.find({}, function (err, docs) {
  _.each(docs, function (doc) {
    doc.remove()
  })
});
//clear all menuitem exist
Menuitem.find({}, function (err, docs) {
  _.each(docs, function (doc) {
    doc.remove()
  })
});
//clear all party exist
Party.find({}, function (err, docs) {
  _.each(docs, function (doc) {
    doc.remove()
  })
});

// var salers = [
//   {
//     salerName: 'DQ',
//     menuitems: ['storm', 'desert']
//   }
// ];

var fs = require('fs');
fs.readFile('init_scripts/shops.json', 'utf8', function(err, data){

    if (err) {
        console.log(err)
        return ;
    }
    var salers = JSON.parse(data);
    console.log(salers.length)
    _.each(salers, function (salerItem) {
      var s = new Saler({
        name: salerItem.salerName
      });
      var menuitems = salerItem.menuitems;
      s.save(function (err, saler, numberAffected) {
        if (err) console.log(err)
        var id = saler._id;
        _.each(menuitems, function (menuitem) {
          var menu = new Menuitem({
            name: menuitem,
            saler: ObjectId(id)
          });
          menu.save();
        })
      })
    })
    // mongoose.disconnect();
});

// var saler = new Saler({
//   name: 'DQ'
// });
// saler.save(function (err, saler, numberAffected) {
//   // body...
//   if (err) console.log(err)
//   console.log('saved successfully', saler._id)
// });
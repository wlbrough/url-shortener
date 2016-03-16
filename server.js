var http = require('http');
var path = require('path');
var express = require('express');
var mongo = require('mongodb').MongoClient;
var Hashids = require('hashids');
var hashids = new Hashids();

var router = express();
var server = http.createServer(router);
var db = require('monk')('localhost/local');

var links = db.get('links');

router.get("/", function(req, res) {
  // do something
});

router.get("/new/:full_url", function(req, res) {
  var host = req.get('Host');
  links.insert({ 'fullLink': req.params.full_url }, function(err, doc) {
    if (err) throw err;
    res.json({ 'original_url': req.params.full_url, 'short_url': host + '/' + hashids.encodeHex(doc._id) });
  });
});

router.get("/:stub", function(req, res) {
  var objectId = hashids.decodeHex(req.params.stub);
  links.findById(objectId, function(err, doc) {
    if (err) throw err;
    var link = doc.fullLink;
    res.redirect(link);
  });
});

server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function(){
  var addr = server.address();
  console.log("Server listening at", addr.address + ":" + addr.port);
});

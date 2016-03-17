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

router.get(/^\/new\/(.+)/, function(req, res) {
  var host = req.get('Host');
  var fullUrl = req.params[0];
  if (!fullUrl.match(/[(http(s)?):\/\/(www\.)?a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/)) {
    res.json({ 'error': 'submission is not a vaild url' });
  }
  if (!fullUrl.match(/^https?:\/\//)) {
    fullUrl = "http://" + fullUrl;
  }
  links.insert({ 'fullLink': fullUrl }, function(err, doc) {
    if (err) throw err;
    res.json({ 'original_url': fullUrl, 'short_url': host + '/' + hashids.encodeHex(doc._id) });
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

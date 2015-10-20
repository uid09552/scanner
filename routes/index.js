var express = require('express');
var router = express.Router();
var evilscan = require('evilscan');
var portscanner = require('portscanner');
var async=require('async');
var host = '192.168.178.49/24';

/* GET home page. */
router.get('/', function(req, res, next) {
 // scan();

var range=getRange(host);




console.log('scanner finished');
 // res.render('index', { title: 'Express' });


});

function getRange(ipSubnet)
{
  var Netmask=require('netmask').Netmask;
  var block=new Netmask(ipSubnet);
  var range=new Array();
  block.forEach(function(ip,long,index)
  {
    range.push(ip);
  });

  return range;
}
function scan()
{
  var net = require('net');

// the machine to scan

// starting from port number
  var start = 80;
// to port number
  var end = 444;

  var timeout = 2000;
var Netmask=require('netmask').Netmask;
  var block=new Netmask('192.168.178.47/30');

  block.forEach(function(ip,long,index)
      {
        console.log("starting scanning ip:"+ip);
        // the port scanning loop
        var port = start;
        while (port <= end) {
          (function(port) {
            // console.log('CHECK: ' + port);
            var s = new net.Socket();

            s.setTimeout(timeout, function() { s.destroy(); });
            s.connect(port, ip, function() {
              console.log('OPEN: ' + ip + ":" + port);

            });

            // if any data is written to the client on connection, show it
            s.on('data', function(data) {
              console.log(port +': '+ data);
              s.destroy();
            });

            s.on('error', function(e) {

              console.error('closed port:'+ip + ":" +port);
              s.destroy();
            });
          })(port);

          port++;
        }


      }

  );




}

module.exports = router;

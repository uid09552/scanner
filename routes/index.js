var express = require('express');
var router = express.Router();
var evilscan = require('evilscan');
var portscanner = require('portscanner');
var async=require('async');
var host = '127.0.0.1';
// starting from port number
var start = 80;
// to port number
var end = 444;
var timeout = 2000;


/* GET home page. */
router.get('/', function(req, res, next) {
 // scan();

var range=getRange(host);
async.each(range,function(ip,callback){
  scanSynchronous(ip,function(){
    console.log(ip+ " finished");
    callback();
  });
},function(err){
  if(err){return console.log(err);}
  console.log('all finished');

});

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

function getListFromRange(start,end)
{
  var list = new Array();
  if (start>end)
  {
    return null;
  }
  while (start<=end)
  {
    list.push(start);
    start++;
  }
}

function scanSynchronous(ip,callback)
{
  var portList=getListFromRange(start,end);
  var asynchPortScan=require('async');

  async.each(portList,function(port,callback){
    var s = new net.Socket();
    s.setTimeout(timeout, function() { s.destroy(); });

    s.connect(port, ip, function() {
      console.log('OPEN: ' + ip + ":" + port);
      callback();
    });

    // if any data is written to the client on connection, show it
    s.on('data', function(data) {
      console.log(port +': '+ data);
      s.destroy();
      callback();
    });


    s.on('error', function(e) {

      console.error('closed port:'+ip + ":" +port);
      s.destroy();
      callback();
    });

    callback();

  });

}


module.exports = router;

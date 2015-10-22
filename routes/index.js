var express = require('express');
var router = express.Router();
var evilscan = require('evilscan');
var portscanner = require('portscanner');
var async=require('async');
var host = '192.168.100.0/24';
var url=require('url');
// starting from port number
var start = 2543;
// to port number
var end = 2545;
var timeout = 1000;

router.get('/connect',function(req,res,next){
    var pg=require('pg');
    var queryIP;
    queryIP=req.query.ip;
    var db="ccdb";
    if (req.query.add!=null)
    {
        db=req.query.add;
    }
    var conString="postgres://"+queryIP+":2544/"+db;
    var client = new pg.Client(conString);
    client.connect(function(err) {
        if(err) {
            return console.error('could not connect to postgres 23', err);
        }
        client.query('SELECT NOW() AS "theTime"', function(err, result) {
            if(err) {
                return console.error('error running query', err);
            }
            console.log(result.rows[0].theTime);
            //output: Tue Jan 15 2013 19:12:47 GMT-600 (CST)
            client.end();
        });
    });
    conString="postgres://192.168.100.18:2544/ccdb";
     client = new pg.Client(conString);
    client.connect(function(err) {
        if(err) {
            return console.error('could not connect to postgres 18', err);
        }
        client.query('SELECT NOW() AS "theTime"', function(err, result) {
            if(err) {
                return console.error('error running query', err);
            }
            console.log(result.rows[0].theTime);
            //output: Tue Jan 15 2013 19:12:47 GMT-600 (CST)
            client.end();
        });
    });

    conString="postgres://192.168.100.26:2544/ccdb";
    client = new pg.Client(conString);
    client.connect(function(err) {
        if(err) {
            return console.error('could not connect to postgres 26', err);
        }
        client.query('SELECT NOW() AS "theTime"', function(err, result) {
            if(err) {
                return console.error('error running query', err);
            }
            console.log(result.rows[0].theTime);
            //output: Tue Jan 15 2013 19:12:47 GMT-600 (CST)
            client.end();
        });
    });
});

router.get('/trace',function(req,res,next)
    {
        traceroute = require('traceroute');
        traceroute.trace('google.com', function (err,hops) {
            if (!err) console.log(hops);
            res.end(hops.toString());
        });
    }
)

router.get('/scan',function(req,res,next)
{
    var portRange=getListFromRange(start,end);
    var asyncTasks=[];
    var result=[];
    var host='192.168.100.0/24';
    var ipRange=getRange(host);
    ipRange.forEach(function(ip,indexIP,arrayIP)
        {
            portRange.forEach(function(portElement,index,array){
                console.log("Push IP"+ip+":"+portElement);
                asyncTasks.push(
                    function(callback){
                        portscanner.checkPortStatus(portElement, ip, function(error, status) {
                            // Status is 'open' if currently in use or 'closed' if available
                            if (status != 'closed') {

                                console.log(ip+":"+portElement + status);

                                result.push(ip + ":" + portElement + " Status: " + status);
                            }
                            callback();
                        });
                    }
                );
            });
        }
    );


   async.parallel(asyncTasks,function()
   {
       console.log(result);
        res.end(result.toString());

   })

})
/* GET home page. */
router.get('/', function(req, res, next) {
var range=getRange(host);



async.each(range,function(ip,callback){
  scanSynchronous(ip,function(){
      //console.log(ip+ " finished");
  });
  callback();
},
    function(err){
      if(err){return console.log(err);}
      console.log('Fini');
});

 // res.render('index', { title: 'Express' });
});

function scanFinished()
{
  console.log('all finished');
}

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
  return list;
}

function scanSynchronous(ip,callback)
{
  var portList=getListFromRange(start,end);
  var asynchPortScan=require('async');
  var net=require('net');

  async.each(portList,function(port,callback){
    var s = new net.Socket();

   //console.log('net socket started '+ip+":"+port);
var timeout=4000;
    s.setTimeout(timeout, function() {
     //   console.log('timeout');
        s.destroy();
    });
    var netResponse=false;
    s.connect(port, ip, function() {
      console.log('OPEN: ' + ip + ":" + port);
      netResponse=true;

    });

    // if any data is written to the client on connection, show it
    s.on('data', function(data) {
      console.log(port +': '+ data);
      s.destroy();
      socketAnswer=true;
    });


    s.on('error', function(e) {

    //  console.error('closed port:'+ip + ":" +port);
      netResponse=true;
      s.destroy();

    });

    callback();
  });
  callback();
}


module.exports = router;

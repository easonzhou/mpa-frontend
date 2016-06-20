/*eslint-env node*/
//------------------------------------------------------------------------------
// node.js starter application for Bluemix
//------------------------------------------------------------------------------
    
// This application uses express as its web server
// for more info, see: http://expressjs.com
var express = require('express');

// cfenv provides access to your Cloud Foundry environment
// for more info, see: https://www.npmjs.com/package/cfenv
var cfenv = require('cfenv');
var csv = require("fast-csv");
var multer  =   require('multer');
var fs = require('fs');
var async = require('async');
var http = require('http');
var path = require('path');// create a new express server
var app = express();
// serve the files out of ./public as our main files
app.use(express.static(__dirname + '/public'));

//app.use(express.static(__dirname + '/public', { maxAge: 2592000000,
//    setHeaders: function(res, path) {
//        res.setHeader("Expires", new Date(Date.now() + 2592000000*30).toUTCString());
//    }}));

var compress = require('compression');

app.use(compress());  
// get the app environment from Cloud Foundry
var appEnv = cfenv.getAppEnv();

var imoIds;

/* DB2 setup
var DBConn;
var ibmdb = require("ibm_db")
 , connStr = "DATABASE=MPA;HOSTNAME=10.0.0.17;PORT=50000;PROTOCOL=TCPIP;UID=db2inst1;PWD=IRCS-db2";

ibmdb.open(connStr, function (err, connection) {
    if (err)
    {
        console.log(err);
        return;
    }
    DBConn = connection;

    DBConn.query("SELECT DISTINCT(AIS_IMO) FROM MPA.VMIM_TRACK_LOGS_MIN", function (err1, rows) {

        if (err1) console.log(err1);
        else{
            console.log(rows);
            imoIds = rows;
        }
        //connection.close(function(err2) {
        //    if(err2) console.log(err2);
        //});
    });
});
*/

//var file = "/mnt/tmpfs/MPA.db";
//var exists = fs.existsSync(file);
//var sqlite3 = require("sqlite3").verbose();
//var db = new sqlite3.Database(file);

const maxFileSize = 1 * 1000 * 1000;

var storage =   multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, './uploads');
    },
    filename: function (req, file, callback) {
        callback(null, file.fieldname + '-' + Date.now());
    }
});
var upload = multer({
    storage : storage,
    limit: {
        fields: 1,
        fileSize: maxFileSize,
        files: 1
    }
}).single('mpaData');

var cache = [];

app.post('/api/csv', function(req, res){
    var c = 0;
    var map = {};
    upload(req, res, function(err) {
        if ( err ) {
            return res.end("errors");
        }
        if ( typeof(req.file) == 'undefined' ) {
	    return res.end("Empty file uploaded");
	}

        if (req.file.size > maxFileSize) {
            return res.end("file size too large, please keep the file size under 1MB")
        } else {
            csv
            .fromPath(req.file.path)
            .on("data", function(data){
              if( c > 0 ) {
                typeof(map[data[0]]) === 'undefined' ? map[data[0]] = [] : map[data[0]].push({"id": data[0], "timpStamp": data[1], "latitude": data[2], "longitude": data[3]})
              }else {
                c++;
              }
            })
            .on("end", function(){
                //console.log("done");
                return res.json(map);
            });
        }
    });
});

var map = {"trips": [], "hangout":null, "transponder":null, "speeding":null, "minUnixSeconds": 9000000000, "maxUnixSeconds": 0, "interval": 0 };

function readData() {
    var count = 0;
    async.series([
        function(callback){
            // do some stuff ...
            var stream = fs.createReadStream("data/sample.csv");
            var csvStream = csv()
                .on("data", function(data){
                    var timeStamp = parseInt(data[0]);
                    if (count === 0)
                        map.interval = timeStamp;
                    else if (count === 1)
                        map.interval = timeStamp - map.interval;
                    count++;    
                    if (timeStamp <= map.minUnixSeconds) 
                        map.minUnixSeconds = timeStamp;
                    if (timeStamp >= map.maxUnixSeconds) 
                        map.maxUnixSeconds = timeStamp;
                    map.trips.push({"ts": parseInt(data[0]), "id": data[1], "lat": parseFloat(data[2]), "long": parseFloat(data[3]), "deg": parseFloat(data[4]), "dim": parseFloat(data[5])});
                })
            .on("end", function(){
                callback(null, 'one');
            });

            stream.pipe(csvStream);        
        },
        function(callback){
            // do some more stuff ...
            var stream = fs.createReadStream("data/cohangout.csv");
            var csvStream = csv()
                .on("data", function(data){
                    map.hangout = {"a": data[0], "b": data[1], "startTimeStamp": parseInt(data[2]), "endTimeStamp": parseInt(data[3])};
                })
            .on("end", function(){
                callback(null, 'two');
            });

            stream.pipe(csvStream);        
        },
        function(callback){
            // do some more stuff ...
            var stream = fs.createReadStream("data/transponder.csv");
            var csvStream = csv()
                .on("data", function(data){
                    map.transponder = {"id": data[0], "lineId": data[1], "startTimeStamp": parseInt(data[2]), "endTimeStamp": parseInt(data[3])};
                })
            .on("end", function(){
                callback(null, 'three');
            });

            stream.pipe(csvStream);        
        },
        function(callback){
            // do some more stuff ...
            var stream = fs.createReadStream("data/speeding.csv");
            var csvStream = csv()
                .on("data", function(data){
                    map.speeding = {"id": data[0], "startTimeStamp": parseInt(data[1]), "endTimeStamp": parseInt(data[2])};
                })
            .on("end", function(){
                callback(null, 'four');
            });

            stream.pipe(csvStream);        
        }
    ],
    // optional callback
    function(err, results){
        // results is now equal to ['one', 'two']
    //    res.json(map);
    });
}

// temporary api for read the csv file
app.get('/api/data', function(req, res){
    res.json(map);
});

/*
db.serialize(function() {
    if(!exists) {
        console.log("db file doesn't exist!");
    }else{
	console.log("db file extracted!");
    }

    fs.writeFile('query.log', '' + new Date() + '\n', function(err) {
        if (err) throw err;
    });

    db.all("SELECT DISTINCT(AIS_IMO) FROM logM", function(err, row) {
	if(err)
	     console.log("error in query");
        cache = row;
	console.log(cache.length);

        fs.appendFile('query.log', '' + new Date() + '\n', function(err) {
            if (err) throw err;
        });
    });
});
*/


app.get('/imoids', function(req, res){
    console.log("imoids called");
	console.log(cache);
    res.json(cache);
});


//9186089
app.get('/vesselTrajectory', function(req, res){

    var vesselId = req.query.vesselId;
    DBConn.query("SELECT * FROM MPA.VMIM_TRACK_LOGS_MIN WHERE AIS_IMO = " + vesselId, function (err1, rows) {

        if (err1) console.log(err1);
        else{
            //console.log(rows);
            //imoIds = rows;


        }

    });
});

// start server on the specified port and binding host
app.listen(appEnv.port, '0.0.0.0', function() {

        // print a message when the server starts listening
  console.log("server starting on " + appEnv.url);
  readData();
});

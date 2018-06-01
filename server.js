// 'use strict';
var url = require('url');
var http = require('http');
var fs = require('fs');
var formidable = require("formidable");
var util = require('util');
var moment = require('moment');
var secureRandom = require('secure-random');
var jsonfile = require('jsonfile');
var cmd=require('node-cmd');
var sleep = require('sleep');
var crypto = require('crypto');
const commandLineArgs = require('command-line-args');

const optionDefinitions = [
    // option 'blockchain' set only when fabric blockchain network is contructed in docker
    { name: 'blockchain', alias: 'b', type: Boolean, defaultOption: false},
    { name: 'test', alias: 't', type: String }
]

const cmd_options = commandLineArgs(optionDefinitions);

var Client = require('node-rest-client').Client;
 
var client = new Client();
var subscribeClient = new Client();

var bodyParser = require('body-parser');
const winston = require('winston');
const tsFormat = () => (moment().format("YYYY-MM-DD HH:mm:ss"));
const logger = new (winston.Logger)({
  transports: [
    // colorize the output to the console
    new (winston.transports.Console)({
        timestamp: tsFormat,
        colorize: true 
    })
  ]
});

logger.level = 'debug';


var express = require("express");
var app = express();

var getScript = require("./default-script.js");
// console.log(getScript.script);
var appPort = 1185;

var SDKWebServerAddress = "http://localhost:4000";
var TokenForServer;

var chaincode="lottery";
var channelName="mychannel";
var peers = ["peer0.org1.example.com","peer1.org1.example.com"];

function getChaincodeURL(channelName, chaincode) {
    return "/channels/" + channelName + "/chaincodes/" + chaincode;
}

function start_server(app, port) {
    app.listen(port, function() {
        logger.info('Server is now listening on '+port);
    });
    InitServerToken();
}

// Cross domain issue fixed. Referenced following link.
// http://stackoverflow.com/questions/28515351/xmlhttprequest-cannot-load-http-localhost3000-get
var allowCrossDomain = function(req, res, next) {
        // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);
   next();
}

app.use(allowCrossDomain);
app.use(bodyParser.urlencoded());

// Allow client to use /lib
app.use("/click.js", express.static(__dirname + "/templatemo_485_rainbow/click.js"));
app.use("/lib", express.static(__dirname + "/lib"));
app.use("/style", express.static(__dirname + "/style"));
app.use("/font-awesome-4.5.0", express.static(__dirname + "/templatemo_485_rainbow/font-awesome-4.5.0/"));
app.use("/css", express.static(__dirname + "/templatemo_485_rainbow/css/"));
app.use("/load-awesome", express.static(__dirname + "/load-awesome/css/"));
app.use("/js", express.static(__dirname + "/templatemo_485_rainbow/js/"));
app.use("/img", express.static(__dirname + "/templatemo_485_rainbow/img/"));
app.use("/charts.js", express.static(__dirname + "/templatemo_485_rainbow/charts.js"));
app.use("/charts.css", express.static(__dirname + "/templatemo_485_rainbow/charts.css"));

app.use("/tabulator/*", express.static(__dirname + "/tabulator/*"));
app.use("/tabulator/dist/css/tabulator.min.css", express.static(__dirname + "/tabulator/dist/css/tabulator.min.css"));
app.use("/tabulator/dist/js/tabulator.min.js", express.static(__dirname + "/tabulator/dist/js/tabulator.min.js"));
app.use("/sjcl.js", express.static(__dirname + "/sjcl.js"));
app.use("/swal-forms.js", express.static(__dirname + "/swal-forms.js"));
app.use("/swal-forms.css", express.static(__dirname + "/swal-forms.css"));
app.use("/images", express.static(__dirname + "/images"));

app.get('/', function(req, res){
    response_client_html(res, "templatemo_485_rainbow/index.html");
});

app.get('/all', function(req, res) {
    displayForm(res);
});

app.get('/index.html', function(req, res) {
    response_client_html(res, "templatemo_485_rainbow/index.html");
});

app.get('/elements.html', function(req, res) {
    response_client_html(res, "templatemo_485_rainbow/elements.html");
});

app.get('/subscribe.html', function(req, res) {
    response_client_html(res, "subscribe.html");
});

app.get('/open-lottery.html', function(req, res) {
    response_client_html(res, "open-lottery.html");
});


var UserInfoTable = [];

function GetTokenFromSDKServer(identity, orgName) {
    var token, message, secret;
    logger.info("Request token from SDK Server");
    var allData = {
        "username" : identity,
        "orgName" : orgName
    };

    var args = {
        data: allData,
        headers: { "Content-Type": "application/json" }
    };

    client.post(SDKWebServerAddress + "/users", args, function (data, response) {
        token = data.token;
        message = data.message;
        secret = data.secret;
        logger.info("Token from REST-API", data.token);
        TokenForServer = "Bearer " + data.token;
    });
}

async function InitServerToken() {
    GetTokenFromSDKServer("LotteryServer", "Org1");
}

function GetIdentityHash(participantName) {
    const hash = crypto.createHash('sha256');
    hash.update(participantName);
    return hash.digest('hex');
}

function GetRandomNonceStr(len) {
    var randomarray  = secureRandom.randomUint8Array(len);
    var nonce = "";
    for (var i = 0; i < randomarray.length; i++) {
        nonce += randomarray[i].toString(16);
    }
    return nonce;
}

app.post('/query-by-tx', function(req, res) {

});

// Query Instantiated chaincodes
app.post('/query-by-instantiate-chaincode', function(req, res) {

});

app.post('/query-by-channel', function(req, res) {

});

app.post('/query-by-block-by-number', function(req, res) {

});

app.post('/query-by-chaininfo', function(req, res) {

});

app.post('/subscribe', function(req, res) {
    logger.info("/subscribe")
    // Unpack parameters
    var functionName = req.body.functionName;
    var lotteryName = req.body.lotteryName;
    var participantName = req.body.participantName;
    var eventHash = "" + req.body.eventHash;


    // Get cryptogrphaic info
    var identityHash = "" + GetIdentityHash(participantName);
    var nonce = "" + GetRandomNonceStr(10);

    logger.info("eventHash", eventHash);
    logger.info("lotteryName", lotteryName);
    logger.info("participantName", participantName);
    logger.info("identityHash", identityHash);
    logger.info("nonce", nonce);

    // REST API 호출
    // set content-type header and data as json in args parameter 
    var headerData = {
        "username" : identityHash,
        "orgName" : "Org1",
    };

    var args = {
        data: headerData,
        headers: { "Content-Type": "application/json" }
    };

    var token;
    var message;
    var secret;

    // Get user token
    client.post(SDKWebServerAddress + "/users", args, function (data, response) {
        // parsed response body as js object 
        // console.log(data);
        // raw response 
        // console.log(response);
        token = data.token;
        message = data.message;
        secret = data.secret;
        
        logger.info(token, message, secret);
    });

    // args[1] : Event hash (event identity) from client
    // args[2] : Member name(or identity) from client
    // args[3] : current timestamp from client
    var current_ts = "" + Math.floor(Date.now() / 1000);
    var allData1 = {
        "peers" : ["peer0.org1.example.com","peer1.org1.example.com"],
        "fcn" : "invoke",
        "args" : ["subscribe", eventHash, identityHash, current_ts],
    };

    var args1 = {
        data: allData1,
        headers: { 
            "Authorization" : TokenForServer,
            "Content-Type": "application/json" }
    };

    // Subscribe given user
    // sleep.sleep(1);
    client.post(SDKWebServerAddress + "/channels/mychannel/chaincodes/lottery", args1, function (data, response) {
        // parsed response body as js object 
        console.log("data", data);
        var tx_id = data.tx_id_string_;
        var payload = data.payload_;

        console.log("tx_id", tx_id);
        console.log("payload", payload);
        // raw response 
        // console.log("response", response);
        // token = data.token;
        // message = data.message;
        // secret = data.secret;
        
        // logger.info(token, message, secret);
      
        res.write(identityHash);
        res.end();
    });


        var useridentity = {
            lotteryName_ : lotteryName,
            participantName_ : participantName,
            identityHash_ : identityHash,
            nonce_ : nonce,
            token_ : token
        };

        UserInfoTable.push(useridentity);
        console.log("New user added(" + UserInfoTable.length + ")");
});

app.post('/query-all-events', function(req, res) {
    logger.info("/query-all-events requested")
    QueryAllEvents(req, res);
});


app.post('/register-lottery', function(req, res) {
    processAllFieldsOfTheForm(req, res);
});

app.post('/open', function(req, res) {
    var eventName = req.body.eventName;
    var expectedAnnouncementDate = req.body.expectedAnnouncementDate;
    var numOfWinners = req.body.numOfWinners;
    var numOfMembers = req.body.numOfMembers;
    var targetBlockNumber = req.body.targetBlockNumber;
    var issueDate = req.body.issueDate;
    var dueDate = req.body.dueDate;
    var eventHash = req.body.eventHash;
    var lotteryNote = req.body.lotteryNote;
    // Server side
    var randomKey = "2f2412ae411235123";
    var script = "sample script";

    var allData = {
        "peers" : ["peer0.org1.example.com","peer1.org1.example.com"],
        "fcn" : "invoke",
        "args" : ["create_lottery_event_hash", eventHash, eventName, 
            issueDate, dueDate, expectedAnnouncementDate, targetBlockNumber, numOfMembers, numOfWinners, randomKey, script, lotteryNote],
    };

    var args = {
        data: allData,
        headers: { 
            "Authorization" : TokenForServer,
            "Content-Type": "application/json" }
    };

    // Subscribe given user
    // sleep.sleep(1);
    client.post(SDKWebServerAddress + "/channels/mychannel/chaincodes/lottery", args, function (data, response) {
        console.log("data", data);
        console.log("response", response);
        res.write("호스트 인증토큰(추후 업데이트 예정)");
        res.end();
    });
});

app.post('/validate-token', function(req, res) {
    var hostAuthToken = req.body.hostAuthToken;
    // Validate auth token
    
    res.write("true");
    res.end();

});

app.post('/draw', function(req, res) {
    var eventHash = req.body.eventHash;
    var verifiableRandomKey = req.body.verifiableRandomKey;
    var allData = {
        "peers" : ["peer0.org1.example.com","peer1.org1.example.com"],
        "fcn" : "invoke",
        "args" : ["determine_winner", eventHash, verifiableRandomKey],
    };

    var args = {
        data: allData,
        headers: { 
            "Authorization" : TokenForServer,
            "Content-Type": "application/json" }
    };

    client.post(SDKWebServerAddress + "/channels/mychannel/chaincodes/lottery", args, function (data, response) {
        var tx_id = data.tx_id_string_;
        var payload = data.payload_;
        console.log("transaction id " + tx_id);
        console.log("payload : " + data.payload_);
        res.write(payload);
        res.end();
    });

});


// check the result( = check the winner(s))
app.post('/check', function(req, res) {
    logger.info("/check")
});

app.post('/verify', function(req, res) {
    logger.info("/verify requested");
});

function response_client_html(res, filename) {
    fs.readFile(filename, function (err, data) {
        res.writeHead(200, {
            'Content-Type': 'text/html',
        });
        res.write(data);
        res.end();
    });
    logger.info(filename + " requested");
}

// client enrollment request
app.post('/enrollment', function(req, res) {
    logger.info("/enrollment Requested");
});

app.post('/register-identity', function(req, res) {
    logger.info("/register-identity Requested");
});

app.post('/create-channel', function(req, res) {
    logger.info("/created-channel Requested");
});

app.post('/join-channel', function(req, res) {
    logger.info("/join-channel Requested");
});

app.post('/install-chaincode', function(req, res) {
    logger.info("/install-chaincode Requested");
});

app.post('/instantiate-chaincode', function(req, res) {
    logger.info("/instantiate_chaincode Requested");
});

app.post('/invoke-chaincode', function(req, res) {
    logger.info("/invoke-chaincode Requested");

});

app.post('/query-chaincode', function(req, res) {
    logger.info("/query-chaincode Requested");

    logger.info("response_payloads type: " + typeof response_payloads);


});

app.post('/register-user', function(req, res) {
    logger.info("/register-user Requested");

    res.writeHead(200, {
        'content-type' : 'text/plain'
    });
    res.write("hi");
    res.end();
    
});

var func_numargs_map = new Object();
// including function name itself
func_numargs_map["create_lottery_event"] = 7;
func_numargs_map["query_lottery_event"] = 2;
func_numargs_map["create_target_block"] = 2;
func_numargs_map["query_target_block"] = 2;
func_numargs_map["determine_winner"] = 2;
func_numargs_map["query_winner"] = 2;
func_numargs_map["query_all_lottery"] = 2;

var FunctionType = new Object();
FunctionType["create_lottery_event"] = "invoke";
FunctionType["query_lottery_event"] = "query";
FunctionType["create_target_block"] = "invoke";
FunctionType["query_target_block"] = "query";
FunctionType["determine_winner"] = "invoke";
FunctionType["query_winner"] = "query";
FunctionType["query_all_lottery"] = "query";
const MAX_CC_ARGS = 7;

// References https://nehakadam.github.io/DateTimePicker/
function datetimeToTimestamp(datetime) {
    var timestamp;
    var tmpdt = new Date(datetime);
    timestamp = tmpdt.getTime();
    return timestamp / 1000;
}

app.post('/admin-register', function(req, res) {
    logger.info("/admin-register Requested");
})

function process_invoke_args(req) {
    var obj = req.body;
    // console.log(req.body);
    var function_name = obj.arg0;
    var args = [];
    var numargs = func_numargs_map[function_name];
    var f_type = FunctionType[function_name];
    var invoke_info = {};

    args[0] = obj.arg0;
    args[1] = obj.arg1;
    args[2] = obj.arg2;
    args[3] = obj.arg3;
    args[4] = obj.arg4;
    args[5] = obj.arg5;
    args[6] = obj.arg6;

    for (var i = 0; i < MAX_CC_ARGS - numargs; ++i) {
        args.pop();
    }

    /* console.log(function_name);
    console.log(args);  */
    invoke_info = {
        "args" : args,
        "f_type" : f_type,
    };
    return invoke_info;
}

function displayForm(res) {
    fs.readFile('form.html', function (err, data) {
        res.writeHead(200, {
            'Content-Type': 'text/html',
                'Content-Length': data.length
        });
        res.write(data);
        res.end();
    });
}

// cryptographic random generator
// https://www.npmjs.com/package/secure-random
function get_cryptosecure_num() {

    var randomarray = secureRandom.randomUint8Array(10)
    console.log("Your lucky numbers:");
    var str = "";
    for (var i = 0; i < randomarray.length; i++) {
        console.log(randomarray[i]);
        str += randomarray[i].toString(16);
    }
    console.log(str);
    return str;
}

// get_cryptosecure_num();
function processAllFieldsOfTheForm(req, res) {
    var eventName;
    var datetime; // due date
    var issuedate;
    var announcementdate;
    var futureblock;
    var numOfMembers;
    var numOfWinners;
    var memberList; 
    var randomKey;
    var ManifestHash;
    var args = [];

    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {

        ManifestHash = fields.ManifestHash;
        eventName = fields.EventName;
        datetime = fields.DateTime;
        issuedate = fields.IssueDate;
        announcementdate = fields.AnnouncementDate;
        futureblock = fields.fblock;
        numOfMembers = fields.numOfMembers;
        numOfWinners = fields.numOfWinners;
        randomKey = fields.RandomKey;
        memberList = fields.MemberList;

        console.log(eventName);
        console.log(datetime, datetimeToTimestamp(datetime), typeof datetimeToTimestamp(datetime));
        console.log(issuedate, datetimeToTimestamp(issuedate),typeof datetimeToTimestamp(datetime));
        console.log(announcementdate, datetimeToTimestamp(announcementdate),typeof datetimeToTimestamp(datetime));
        console.log(futureblock);
        console.log(numOfMembers);
        console.log(numOfWinners);
        console.log(randomKey);
        console.log(memberList);
        console.log(ManifestHash);

        // format argument array to be input for chaincode
        args[0] = "create_lottery_event_hash"; // function name of chaincode
        args[1] = ManifestHash;
        args[2] = eventName;
        args[3] = datetimeToTimestamp(issuedate).toString();
        args[4] = datetimeToTimestamp(datetime).toString();
        args[5] = datetimeToTimestamp(announcementdate).toString();
        args[6] = futureblock;
        args[7] = numOfMembers;
        args[8] = numOfWinners;
        args[9] = randomKey;
        // args[9] = memberList;
        args[10] = getScript.script;

        var obj = {
            "ManifestHash" : ManifestHash,
            "EventName" : eventName,
            "IssueDate" : issuedate,
            "DueDateTime" : datetime,
            "AnnouncementDate" : announcementdate,
            "FutureTargetBlock": futureblock,
            "numOfMembers": numOfMembers,
            "numOfWinners": numOfWinners,
            "RandomKey": randomKey,
            // "MemberList": memberList,
            "script": getScript.script,
        }

        console.log(obj);
        var fname = "inputmanifests/" + "lottery-" + ManifestHash + ".json";

        jsonfile.writeFileSync(fname, obj, {spaces:2}, function(err) {
            console.log(err);
        });

        var text = "Manifest " + ManifestHash
        + "<br>\{ <br> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;\"EventName\":&nbsp;" + eventName
        + ",<br> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; \"Status\":&nbsp;" + "1"
        + ",<br> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; \"IssueDate\":&nbsp;" + issuedate
        + ",<br> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; \"DueDate\":&nbsp;" + datetime
        + ",<br> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; \"AnnouncementDate\":&nbsp;" + announcementdate
        + ",<br> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; \"FutureBlock\":&nbsp;" + futureblock
        + ",<br> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; \"numOfMembers\":&nbsp;" + numOfMembers
        + ",<br> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; \"numOfWinners\":&nbsp;"+  numOfWinners
        + ",<br> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; \"randomKey\":&nbsp;" + randomKey
        + ",<br> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; \"MemberList\":&nbsp;" + memberList
        + ",<br> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; \"WinnerList\":&nbsp;" + "UNDEFINED"
        + ",<br> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; \"script\": " + getScript.script
        + "<br>"
        + "\}"

        var downtexts = [
            '<a href="/inputmanifests/lottery-"'
        ];
        res.writeHead(200, {
            'content-type' : 'text/html'
        });
        res.write('<b>Event is being processed in blokchain network. Wait a few seconds</b><br><br>');

        setTimeout(function() {
            LotteryChainInterface.invoke_chaincode(args).then(function() {
                res.write(
                    '<a href="/open-lottery.html"' + '>prev</a><br>'
                    + '<b>Lottery Manifest<br>Congratuation! You just registered lottery event successfully. Lottery event is stored in blockchain network built upon hyperledger/fabric.</b>'
                    + "<b>You can download manifest file and use it later to check result</b><br>"
                    + "<b>This manifest file is temporary. It will be change over time whenever new members joined</b><br>"
                    + '<a download href="/inputmanifests/lottery-' + ManifestHash + '.json"'  + '>download manifest</a>'
                    + '<br><br>'
                    + text
                    + "<br>"
                    + "<br>"
                );
                    
            })
        }, 500);
            
    });

    /* res.end(util.inspect({
            fields: fields,
            files: files
        })); */
}

start_server(app, appPort);

if (cmd_options.blockchain) {
    // well working function
    console.log("e2e_test start");
    setTimeout(e2e_test, 2000);
} else {

} 


function QueryAllEvents(req, res) {
    var headerData = {
        "peers" : ["peer0.org1.example.com","peer1.org1.example.com"],
        "fcn" : "invoke",
        "args":["query_all_lottery_event_hash"]
    };

    var args = {
        data: headerData,
        headers: { 
            "authorization" : TokenForServer,
            "Content-Type": "application/json" 
        
        }
    };

    client.post(SDKWebServerAddress + "/channels/mychannel/chaincodes/lottery", args, function (data, response) {
        // parsed response body as js object 
        // console.log("data = " + data);
        // raw response 
        // console.log("response = " + response);

        var payload = "null";
        var tx_id = "null";
        // console.log(tx_id);
        // console.log(JSON.stringify(data));
        // var s = "";
        // for (var c in payload) {
            // s += String.fromCharCode(c);
        // }

        tx_id = data.tx_id_string_;
        payload = data.payload_;

        console.log(payload);

        res.write(payload);
        res.end();
    });
}


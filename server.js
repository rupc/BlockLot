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
var sjcl = require('sjcl');
var stringify = require("json-stringify-pretty-compact");
var waitUntil = require('wait-until');
var nodemailer = require('nodemailer');
var pdf = require('html-pdf');
var async = require('async');
var subscribe_sem = require('semaphore')(1);
var Queue = require('queue-fifo');

var queue = new Queue();
var postQueue = new Queue();

const execSync = require('child_process').execSync;
const syncClient = require('sync-rest-client');

const commandLineArgs = require('command-line-args');
const optionDefinitions = [
    // option 'blockchain' set only when fabric blockchain network is contructed in docker
    { name: 'blockchain', alias: 'b', type: Boolean, defaultOption: false},
    { name: 'test', alias: 't', type: String }
]

const tokensenderPasswd = "rmadustltjf";

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'blocklot.tokensender@gmail.com',
      // 조합론1234:whgkqfhs1234
    pass: 'whgkqfhstkscor1234'
  }
});

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

var chaincodeName ="lottery";
var channelName ="mychannel";
var peers = ["peer0.org1.example.com",
            "peer1.org1.example.com"];
var connectedPeers = [
        "peer0.org1.example.com",
        "peer1.org1.example.com",
        "peer2.org1.example.com",
        "peer3.org1.example.com",
        "peer4.org1.example.com",
        "peer5.org1.example.com",
        "peer6.org1.example.com",
        ];

var anchorPeer = "peer0.org1.example.com";
var queryPeer = "peer2.org1.example.com";

const kRestTimeout = 60000; // 60s

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
app.use("/click.js", express.static(__dirname + "/web-client/click.js"));
app.use("/admin_click.js", express.static(__dirname + "/web-client/admin_click.js"));
app.use("/lib", express.static(__dirname + "/lib"));
app.use("/style", express.static(__dirname + "/style"));
app.use("/font-awesome-4.5.0", express.static(__dirname + "/web-client/font-awesome-4.5.0/"));
app.use("/css", express.static(__dirname + "/web-client/css/"));
app.use("/load-awesome", express.static(__dirname + "/lib/load-awesome/css/"));
app.use("/js", express.static(__dirname + "/web-client/js/"));
app.use("/img", express.static(__dirname + "/web-client/img/"));
app.use("/charts.js", express.static(__dirname + "/web-client/charts.js"));
app.use("/verification.js", express.static(__dirname + "/web-client/verification.js"));
app.use("/req-gen.js", express.static(__dirname + "/web-client/req-gen.js"));
app.use("/sha256.js", express.static(__dirname + "/web-client/sha256.js"));
app.use("/charts.css", express.static(__dirname + "/web-client/charts.css"));

app.use("/tabulator/*", express.static(__dirname + "/tabulator/*"));
app.use("/tabulator/dist/css/tabulator.min.css", express.static(__dirname + "/lib/tabulator/dist/css/tabulator.min.css"));
app.use("/tabulator/dist/js/tabulator.min.js", express.static(__dirname + "/lib/tabulator/dist/js/tabulator.min.js"));
app.use("/sjcl.js", express.static(__dirname + "/lib/sjcl.js"));
app.use("/swal-forms.js", express.static(__dirname + "/lib/swal-forms.js"));
app.use("/swal-forms.css", express.static(__dirname + "/lib/swal-forms.css"));
app.use("/images", express.static(__dirname + "/images"));
app.use("/report", express.static(__dirname + "/report"));

app.get('/', function(req, res){
    response_client_html(res, "web-client/index.html");
});

app.get('/all', function(req, res) {
    displayForm(res);
});

app.get('/index.html', function(req, res) {
    response_client_html(res, "web-client/index.html");
});

app.get('/elements.html', function(req, res) {
    response_client_html(res, "web-client/elements.html");
});

app.get('/admin.html', function(req, res) {
    response_client_html(res, "web-client/admin_elements.html");
});

app.get('/subscribe.html', function(req, res) {
    response_client_html(res, "subscribe.html");
});

app.get('/open-lottery.html', function(req, res) {
    response_client_html(res, "open-lottery.html");
});

app.get('/query-peers', function(req, res) {
    var requestedPeers= {
        "peers" : connectedPeers,
        "anchorPeer" : anchorPeer,
    };

    var prettyJSON = JSON.stringify(requestedPeers, null, 2);

    res.write(prettyJSON);
    res.end();
});

app.get('/query-channeltx', function(req, res) {
    var channelCreationTx = 
        JSON.parse(execSync('configtxgen -inspectChannelCreateTx ./artifacts/channel/mychannel.tx | python -m json.tool'));
    // logger.debug(channelCreationTx);
    var prettyJSON = JSON.stringify(channelCreationTx, null, 2);
    // var prettyJSON = genesisBlockInfo;

    res.write(prettyJSON);
    res.end();
});

app.get('/query-genesis-block', function(req, res) {
    var genesisBlockInfo = 
        JSON.parse(execSync('configtxgen -inspectBlock ./artifacts/channel/genesis.block | python -m json.tool'));
    // logger.debug(genesisBlockInfo);
    var prettyJSON = JSON.stringify(genesisBlockInfo, null, 2);
    // var prettyJSON = genesisBlockInfo;

    res.write(prettyJSON);
    res.end();
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
        headers: { "Content-Type": "application/json" },
        requestConfig: {
            timeout: 60000, //request timeout in milliseconds
            noDelay: true, //Enable/disable the Nagle algorithm
            keepAlive: true, //Enable/disable keep-alive functionalityidle socket.
            keepAliveDelay: 1000 //and optionally set the initial delay before the first keepalive probe is sent
        },
    };

    var getTokenReq = client.post(SDKWebServerAddress + "/users", args, function (data, response) {
        token = data.token;
        message = data.message;
        secret = data.secret;
        logger.info("Token from REST-API", data.token);
        TokenForServer = "Bearer " + data.token;

        fs.writeFileSync('TOKEN', TokenForServer, 'utf8');

    });

    getTokenReq.on('requestTimeout', function (req) {
        console.log('request has expired');
        getTokenReq.abort();
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

app.post('/authenticate', function(req, res) {
    var authToken = req.body.authToken;
    var participantName = req.body.participantName;
    var winnerListArray = req.body.winnerListArray;

    var sha256 = crypto.createHash('sha256');
    var encryptedIdentity = sha256.update(authToken + participantName).digest('hex');

    var th;
    var found = false;
    for (var i = 0, l = winnerListArray.length; i < l; i++) {
        var v = winnerListArray[i];
        if (v == encryptedIdentity) {
            th = i;
            found = true;
        }
    }

    if (found) {
        var winnerMessage = participantName + " 님께서는" + th + " 순위로 당첨이 되셨습니다"
        res.status(200).send(winnerMessage);
    } else {
        var noFoundMessage = participantName + "님은 당첨자 목록에 없습니다";
        res.status(200).send(noFoundMessage);
    }
    
});

app.post('/verify-peer-response', function(req, res) {
    var eventHash = req.body.eventHash;
    var selectedPeers = req.body.selectedPeers;

    var url = SDKWebServerAddress + "/channels/" + channelName + "/chaincodes/" + chaincodeName +"?peer=";

    var headerData = {
        // "peers" : ["peer0.org1.example.com"],
        "fcn" : "invoke",
        "args":["query_lottery_event_hash", eventHash]
    };

    var args = {
        // data: headerData,
        headers: {
            "authorization" : TokenForServer,
            "Content-Type": "application/json"
        },
        requestConfig: {
            timeout: 60000, //request timeout in milliseconds
            noDelay: true, //Enable/disable the Nagle algorithm
            keepAlive: true, //Enable/disable keep-alive functionalityidle socket.
            keepAliveDelay: 1000 //and optionally set the initial delay before the first keepalive probe is sent
        },
        json:true
    };

    var fcn="invoke";
    var cargs="query_lottery_event_hash\"," + "\"" +eventHash;
    // for (var i = 0; i < 1; ++i) {
    var voting = {
    
    };
    var peersResponses = {};

    for (var i = 0; i < selectedPeers.length; ++i) {
        var requestURL = url + selectedPeers[i] + "&fcn=" + fcn +
            "&args=%5b%22" + cargs + "%22%5d";
        var response = syncClient.get(requestURL, args);
        const hash = crypto.createHash('sha256');
        hash.update(response.body);
        var hashed = hash.digest('hex');

        if (voting[hashed] == undefined) {
            voting[hashed] = 1;
        } else {
            voting[hashed]++;
        }

        peersResponses[selectedPeers[i]] = hashed;

        logger.info(selectedPeers[i], requestURL);
        logger.info(response.body);
    }

    var ResponseObject = {
        "voting" : voting,
        "peersResponses" : peersResponses,
    };
    var prettyJSON = JSON.stringify(ResponseObject, null, 2);

    res.write(prettyJSON);
    res.end();
});

app.post('/query-by-tx', function(req, res) {
    var txid = req.body.txid;
    var url = "/channels/" + channelName + "/transactions/" + txid + "?peer=" + anchorPeer;

    var args = {
        headers: {
            "Authorization" : TokenForServer,
            "Content-Type": "application/json" 
        },

        requestConfig: {
            timeout: 60000, //request timeout in milliseconds
            noDelay: true, //Enable/disable the Nagle algorithm
            keepAlive: true, //Enable/disable keep-alive functionalityidle socket.
            keepAliveDelay: 1000 //and optionally set the initial delay before the first keepalive probe is sent
        },
    };

    client.get(SDKWebServerAddress + url, args, function (data, response) {
        var prettyJSON = JSON.stringify(data, function(k,v){
            if(v instanceof Array)
                return JSON.stringify(v);
            return v;
        }, 2);

        logger.debug(prettyJSON);
        res.write(prettyJSON);
        res.end("");
    });
});

// Query installed chaincodes
app.post('/query-by-chaincodes', function(req, res) {
    var installURL = "/chaincodes/" + "?peer=" + anchorPeer + "&type=installed";
    var instantiatedURL = "/chaincodes/" + "?peer=" + anchorPeer + "&type=instantiated";

    var args = {
        headers: {
            "Authorization" : TokenForServer,
            "Content-Type": "application/json" },

        requestConfig: {
            timeout: 60000, //request timeout in milliseconds
            noDelay: true, //Enable/disable the Nagle algorithm
            keepAlive: true, //Enable/disable keep-alive functionalityidle socket.
            keepAliveDelay: 1000 //and optionally set the initial delay before the first keepalive probe is sent
        },
    };

    var installedJSON = undefined, instantiatedJSON;

    req1 = client.get(SDKWebServerAddress + installURL, args, function (data, response) {
        // var installedJSON = JSON.stringify(data, function(k,v){
            // if(v instanceof Array)
                // return JSON.stringify(v);
            // return v;
        // }, 2);
        installedJSON = data;
        // res.write(installedJSON);
    });

    req1.on('requestTimeout', function (req) {
        console.log('request has expired');
        req1.abort();
        res.write("체인코드 조회 실패");
        res.end("");
    });

    waitUntil(100, 10, function condition() {
        return (installedJSON !== undefined ? true : false);
    }, function done(result) {
        // result is true on success or false if the condition was never met

        var queryByInstantiateChaincodeReq = client.get(SDKWebServerAddress + instantiatedURL, args, function (data, response) {
            // instantiatedJSON = JSON.stringify(data, function(k,v){
            // if(v instanceof Array)
            // return JSON.stringify(v);
            // return v;
            // }, 2);
            instantiatedJSON = data;

            var chaincodes = {
                "installedChaincodes" : installedJSON,
                "instantiatedChaincodes" : instantiatedJSON,
            };

            // while (installedJSON.constructor != Object) {};

            var chaincodesJSON = JSON.stringify(chaincodes, null, 2);

            logger.debug(chaincodesJSON);

            res.write(chaincodesJSON);
            res.end("");
        });

        queryByInstantiateChaincodeReq.on('requestTimeout', function (req) {
            console.log('request has expired');
            queryByInstantiateChaincodeReq.abort();

            res.write("체인코드 조회 실패");
            res.end("");
        });
    });

});

app.post('/create-verification-report', function(req, res) {
    logger.info("create-verification-report");

    var outputhtml = req.body.outputhtml;
    var reportID = req.body.reportID;
    var options = { format: 'Letter' };
    var pdfPath = "/report/" + "veri-report" + (new Date().toString()) + ".pdf";
    var pdfPathFull = __dirname + pdfPath;

    pdf.create(outputhtml, options).toFile(pdfPathFull, function(err, pdfRes) {
        if (err) return console.log(err);
        logger.info(pdfPath);
        res.write(pdfPath);
        res.end();
    });
});

app.post('/query-by-block-by-number', function(req, res) {

});

app.post('/query-by-chaininfo', function(req, res) {
    var channelName = req.body.channelName;
    var url = "/channels/" + channelName + "?peer=" + anchorPeer;

    var args = {
        headers: {
            "Authorization" : TokenForServer,
            "Content-Type": "application/json" 
        },
        requestConfig: {
            timeout: 60000, //request timeout in milliseconds
            noDelay: true, //Enable/disable the Nagle algorithm
            keepAlive: true, //Enable/disable keep-alive functionalityidle socket.
            keepAliveDelay: 1000 //and optionally set the initial delay before the first keepalive probe is sent
        },
    };

    var queryByChaininfoReq = client.get(SDKWebServerAddress + url, args, function (data, response) {
        var prettyJSON = JSON.stringify(data, function(k,v) {
            if(v instanceof Array)
                return JSON.stringify(v);
            return v;
        }, 2);

        console.log(prettyJSON);

        res.write(prettyJSON);
        res.end("");
    });

    queryByChaininfoReq.on('requestTimeout', function (req) {
        console.log('request has expired');
        queryByChaininfoReq.abort();
        res.write("체인정보 조회 실패");
        res.end("");
        return;
    });
});

// https://stackoverflow.com/questions/46155/how-to-validate-an-email-address-in-javascript
function validateEmail(email) {
  var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
}

app.post('/counterfeit', function(req, res) {
    logger.info("/counterfeit")
    var fraudWinners = req.body.fraudWinners;
    var functionName = req.body.functionName;
    var eventHash = req.body.eventHash;
    var lotteryName = req.body.lotteryName;
    logger.debug(eventHash, lotteryName, functionName, fraudWinners);

    var allData = {
        "peers" : ["peer0.org1.example.com","peer1.org1.example.com"],
        "fcn" : "invoke",
        "args" : ["counterfeit", eventHash, fraudWinners],
    };

    var args = {
        data: allData,
        headers: {
            "Authorization" : TokenForServer,
            "Content-Type": "application/json" },
        requestConfig: {
            timeout: 60000, //request timeout in milliseconds
            noDelay: true, //Enable/disable the Nagle algorithm
            keepAlive: true, //Enable/disable keep-alive functionalityidle socket.
            keepAliveDelay: 1000 //and optionally set the initial delay before the first keepalive probe is sent
        },
    };

    // Subscribe given user
    // sleep.sleep(1);
    var counterfeitReq = client.post(SDKWebServerAddress + "/channels/mychannel/chaincodes/lottery", args, function (data, response) {
        console.log("data", data);
        var tx_id = data.tx_id_string_;
        // console.log("response", response);
        // res.write(tx_id);
        res.write("조작 성공");
        res.end();
    });

    // res.write("조작 실패");
    // res.status(408).send("조작 성공!");
})

app.post('/subscribe', function(req, res) {
    logger.info("/subscribe")
    // Unpack parameters
    var functionName = req.body.functionName;
    var lotteryName = req.body.lotteryName;
    var participantName = req.body.participantName;
    var eventHash = "" + req.body.eventHash;


    // logger.debug(req);
    logger.debug("participantName", participantName);
    logger.debug("eventHash", eventHash);
    logger.debug("lotteryName", lotteryName);
    logger.debug("identityHash", identityHash);

    // Get cryptogrphaic info
    var identityHash = "" + GetIdentityHash(participantName);
    var nonce = "" + GetRandomNonceStr(10);

    // REST API 호출
    // set content-type header and data as json in args parameter
    var headerData = {
        "username" : identityHash,
        "orgName" : "Org1",
    };

    var args = {
        data: headerData,
        headers: { "Content-Type": "application/json" },
        requestConfig: {
            timeout: 60000, //request timeout in milliseconds
            noDelay: true, //Enable/disable the Nagle algorithm
            keepAlive: true, //Enable/disable keep-alive functionalityidle socket.
            keepAliveDelay: 1000 //and optionally set the initial delay before the first keepalive probe is sent
        },
    };

    // random init token
    var token = (crypto.randomBytes(32)).toString('hex');
    var message;
    var secret;

    // Get user token
    // var response = syncClient.get(requestURL, args);


    // args[1] : Event hash (event identity) from client
    // args[2] : Member name(or identity) from client
    // args[3] : current timestamp from client

    var subscribeReqBody = {
        participantName: participantName,
        eventHash: eventHash,
        lotteryName: lotteryName,
        res: res,
        nonce: nonce,
        token: token,
    }
    
    console.log("Added", participantName);
    queue.enqueue(subscribeReqBody);
    console.log("q size", queue.size());
});

// subscribeInvoke periodically called to fetch requests from a fifo-queue 
// for batching the requests
function subscribeInvoke(req, next) {
    // console.log("Invoked with", req);
    var current_ts = "" + Math.floor(Date.now() / 1000);
    var allData1 = {
        "peers" : ["peer0.org1.example.com","peer1.org1.example.com"],
        "fcn" : "invoke",
        "args" : ["subscribe", req.eventHash, req.participantName, current_ts],
    };

    var args1 = {
        data: allData1,
        headers: {
            "Authorization" : TokenForServer,
            "Content-Type": "application/json" },
        requestConfig: {
            timeout: 30000, //request timeout in milliseconds
            noDelay: true, //Enable/disable the Nagle algorithm
            keepAlive: true, //Enable/disable keep-alive functionalityidle socket.
            keepAliveDelay: 1000 //and optionally set the initial delay before the first keepalive probe is sent
        },
    };

    // Subscribe given user
    // sleep.sleep(1);
    var subscribeTxReq = client.post(SDKWebServerAddress + "/channels/mychannel/chaincodes/lottery", args1, function (data, response) {
        // parsed response body as js object
        console.log("data", data);
        var tx_id = data.tx_id_string_;
        var payload = data.payload_;
        console.log("error flag", data.flag);
        console.log("error message" ,data.error_message);


        if (typeof payload !== "strings") {
            logger.debug("Typeof payload:", typeof payload);
            payload = "null";
        }
        // logger.debug(typeof payload);
        // logger.debug("tx_id", tx_id);
        // logger.debug("payload", data.payload_);
        // logger.debug("Payload parse", JSON.parse(data.payload_));
        logger.debug("EventName", JSON.parse(data.payload_).EventName);
        logger.debug("EventHash", JSON.parse(data.payload_).EventHash);
        updateLocalCache(cachedLotteries, JSON.parse(data.payload_));
        // raw response
        // console.log("response", response);
        // token = data.token;
        // message = data.message;
        // secret = data.secret;

        // logger.info(token, message, secret);

        // when email entered
        if (validateEmail(req.participantName)) {
            RegisterByEmail(req.participantName, req.lotteryName, req.eventHash, req.token);
        }

        console.log("req.reses length", req.reses.length);
        console.log("req.reses typeof", typeof req.reses);
        var i = 0;
        for (res of req.reses) {
            if (data.flag == 1) {
                res.send(500, {error : data.error_message});
                // res.end();
                continue;
            }

            // res.write(req.tokens[i], " 참여 성공!"); 
            res.write(req.tokens[i] + " 참여 성공!"); 
            console.log(req.tokens[i]);
            ++i;
            res.end();
            // req.res.write(req.token);
            // req.res.end();
        }

        next();
    });

    subscribeTxReq.on('error', function(err) {
        logger.error(err);
        res.status(408).send("응모 실패");
        return;
    });

    subscribeTxReq.on('requestTimeout', function (req) {
        logger.warn('응모 트랜잭션 실패');
        res.status(408).send("응모 실패");
        subscribeTxReq.abort();
        return;
    });


    var useridentity = {
        lotteryName_ : req.lotteryName,
        participantName_ : req.participantName,
        // identityHash_ : identityHash,
        // encryptedIdentity_ : recordedIdentity,
        nonce_ : req.nonce,
        token_ : req.token
    };

    UserInfoTable.push(useridentity);
    console.log("New user added(" + UserInfoTable.length + ")");
};

function checkSubscribeQueue() {
    if (queue.isEmpty()) {
        // console.log("Queue empty");
        return;
    }

    if (!subscribe_sem.available()) {
        // console.log("NOT AVAIL");
        return;
    }

    var qsize = queue.size();
    var differentNumOfLottery = 0;
    var eventHashBag = {};
    var indexMap = {};
    var resMap = {};
    var tokenMap = {};


    // console.log("Process subscribe request batches in order", "queue size", queue.size());
    // for (var i = 0; i < queue.size(); ++i) {
        // queue.dequeue();
    // }

    for (var i = 0; i < qsize; ++i) {
        var popped_item = queue.peek();
        if (typeof eventHashBag[popped_item.eventHash] === "undefined") {
            console.log("New event hash", popped_item.eventHash);
            eventHashBag[popped_item.eventHash] = popped_item.participantName;
            console.log(popped_item.eventHash, " added ", popped_item.participantName);
            resMap[popped_item.eventHash] = new Array(popped_item.res);
            // tokenMap[popped_item.eventHash] = new Array(GetRandomNonceStr(20));
            tokenMap[popped_item.eventHash] = new Array(popped_item.participantName);
            indexMap[differentNumOfLottery] = popped_item.eventHash;
            // Get res
            differentNumOfLottery++;
        } else {
            console.log("Existing event hash", popped_item.eventHash, " added ", popped_item.participantName);
            eventHashBag[popped_item.eventHash] += "," + popped_item.participantName;
            resMap[popped_item.eventHash].push(popped_item.res);
            tokenMap[popped_item.eventHash].push(popped_item.participantName);
            // popped_item.res.write("fuck");
            // popped_item.res.end();
        }
        queue.dequeue();
    }

    console.log("Popping all items in a queue", queue.size());
    // console.log("Batched the following items");
    // for (var e in eventHashBag) {
        // console.log(e);
    // }

    subscribe_sem.take(function(){
        var cnt = 0;

        async.whilst(
            function () {
                if (cnt == differentNumOfLottery) {
                    console.log("Release sema");
                    subscribe_sem.leave();
                }
                console.log("cnt", cnt, "differentNumOfLottery", differentNumOfLottery);
                return cnt < differentNumOfLottery;
            },
            function (next) {
                // next eventHash
                var eventHash = indexMap[cnt];
                var participants = eventHashBag[eventHash];
                var reses = resMap[eventHash];
                var tokens = tokenMap[eventHash];
                // for (res of reses) {
                    // res.write
                // }
                cnt++;
                var sub_tx_req = {
                    eventHash: eventHash,
                    participantName : participants,
                    tokens : tokens,
                    lotteryName : "NA",
                    reses: reses,
                }
                console.log(eventHash, " batched ", participants);

                subscribeInvoke(sub_tx_req, next)
                // next();
            },
            function (err) {
                console.log("error", err);
            });
    });

}

function simulateSubs() {
    const randomIdentity = (crypto.randomBytes(32)).toString('hex');
    console.log("Enqueue random participant", randomIdentity);
    queue.enqueue(randomIdentity);
}

setInterval(checkSubscribeQueue, 2000)
// setInterval(simulateSubs, 1000)

function RegisterByEmail(participantName, lotteryName, eventHash, token) {
    var mailText = "<div>안녕하세요, 본 메일은 BlockLot 추첨 소프트웨어에서 당첨자 인증 토큰을 전달하기 위해 발송되었습니다.</div> \
        <div>당첨될 경우 토큰을 사용하여 당첨자를 인증하기 때문에 잊어버리지 않길 바랍니다.</div>" + 
        "<div>" + lotteryName + "(" + eventHash + ")" + "에 대한 토큰은 다음과 같습니다</div>" +
        "Token: <b><font color='red'>" + token + "</font></b></div>";

    var mailOptions = {
        from: 'blocklot.tokensender@gmail.com',
        to: participantName,
        subject: '[BlockLot] 당첨자 인증 토큰',
        html: mailText
    };


    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }

        transporter.close();
    });

}

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
    var latestBlock = req.body.latestBlock;
    var targetBlockNumber = req.body.targetBlockNumber;
    var targetBlockHash = req.body.targetBlockHash;
    var issueDate = req.body.issueDate;
    var dueDate = req.body.dueDate;
    var lotteryNote = req.body.lotteryNote;
    // Server side
    // Generate 32 bytes random key
    const randomKey = (crypto.randomBytes(32)).toString('hex');
    var script = selectScript(req.body.scriptNum);

    var concatenated = "" + eventName + numOfWinners + targetBlockNumber + expectedAnnouncementDate + issueDate + dueDate + lotteryNote + script + randomKey;
    var sha256 = crypto.createHash('sha256');
    var eventHash = sha256.update(concatenated).digest('hex');

    logger.debug("randomKey: ", randomKey);
    logger.debug("selectedScript: ", script);
    logger.debug("eventHash", eventHash);

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
            "Content-Type": "application/json" },
        requestConfig: {
            timeout: 60000, //request timeout in milliseconds
            noDelay: true, //Enable/disable the Nagle algorithm
            keepAlive: true, //Enable/disable keep-alive functionalityidle socket.
            keepAliveDelay: 1000 //and optionally set the initial delay before the first keepalive probe is sent
        },
    };

    // Subscribe given user
    // sleep.sleep(1);
    var openReq = client.post(SDKWebServerAddress + "/channels/mychannel/chaincodes/lottery", args, function (data, response) {
        console.log("data", data);
        var tx_id = data.tx_id_string_;
        console.log("AFTER OPEN", JSON.parse(data.payload_));
        // refreshRequired = true;
        updateLocalCache(cachedLotteries, JSON.parse(data.payload_));
        // console.log("response", response);
        res.write(tx_id);
        res.end();
    });

    openReq.on('requestTimeout', function (req) {
        logger.warn("행사 등록 실패");
        res.status(408).send("행사 등록 실패");
    });

    openReq.on('error', function (req) {
        logger.warn("행사 등록 실패");
        res.status(408).send("행사 등록 실패");
    });
});

app.post('/validate-token', function(req, res) {
    var hostAuthToken = req.body.hostAuthToken;

    function validateHostAuthToken(token) {
        // TODO 나중에는 DB 쿼리하거나, (오프라인)파일에서 찾거나 하는 식으로 바꿀 예정
        // if (token == "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE1NjU1ODU4ODksInVzZXJuYW1lIjoiTG90dGVyeVNlcnZlciIsIm9yZ05hbWUiOiJPcmcxIiwiaWF0IjoxNTI5NTg1ODg5fQ.bZz_W9h-q6PSc9_rXCuxTnlaD33CZKuj2oE83lZk0GM") return "true";
        if (token == "1234") return "true";
        return "false";
    }
    // Validate auth token
    var verify = validateHostAuthToken(hostAuthToken);

    res.write(verify);
    res.end();

});

app.post('/draw', function(req, res) {
    var eventHash = req.body.eventHash;
    var allData = {
        "peers" : ["peer0.org1.example.com","peer1.org1.example.com"],
        "fcn" : "invoke",
        "args" : ["draw", eventHash],
    };

    logger.debug(allData);

    var args = {
        data: allData,
        headers: {
            "Authorization" : TokenForServer,
            "Content-Type": "application/json" },

        requestConfig: {
            timeout: 60000, //request timeout in milliseconds
            noDelay: true, //Enable/disable the Nagle algorithm
            keepAlive: true, //Enable/disable keep-alive functionalityidle socket.
            keepAliveDelay: 1000 //and optionally set the initial delay before the first keepalive probe is sent
        },
    };

    var drawReq = client.post(SDKWebServerAddress + "/channels/mychannel/chaincodes/lottery", args, function (data, response) {
        var tx_id = data.tx_id_string_;
        var payload = data.payload_;
        console.log("transaction id " + tx_id);
        console.log("payload : " + data.payload_);
        // refreshRequired = true;
        updateLocalCache(cachedLotteries, JSON.parse(data.payload_));
        res.write(payload);
        res.end();
    });

    drawReq.on('requestTimeout', function (req) {
        logger.warn('request has expired');
        // drawReq.abort();

        res.write("추첨 실패");
        res.end("");
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

var cachedLotteries = {};
var refreshRequired = true; // initially true 
var firstLoading = true;

function clone(a) {
   return JSON.parse(JSON.stringify(a));
}

function QueryAllEvents(req, res) {
    if (!refreshRequired || firstLoading || cachedLotteries === null) {
        // logger.debug("cachedLotteries type", typeof cachedLotteries)
        // logger.debug("cachedLotteries contents", cachedLotteries)
        // logger.debug("cachedLotteries ccPayload", cachedLotteries.ccPayload)
        firstLoading = false;
        res.write(JSON.stringify(cachedLotteries));
        res.end();
        return 
    }

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
        },
        json:true,
        requestConfig: {
            timeout: 60000, //request timeout in milliseconds
            noDelay: true, //Enable/disable the Nagle algorithm
            keepAlive: true, //Enable/disable keep-alive functionalityidle socket.
            keepAliveDelay: 1000 //and optionally set the initial delay before the first keepalive probe is sent
        },
    };

    var queryAllEventsReq = client.post(SDKWebServerAddress + "/channels/mychannel/chaincodes/lottery", args, function (data, response) {
        // parsed response body as js object
        // console.log("data = " + data);
        // raw response
        // console.log("response = " + response);

        var ccPayload = "null";

        logger.info(typeof ccPayload);
        logger.info("tx_id", tx_id);

        var tx_id = data.tx_id_string_;
        var ccPayload = data.payload_;

        // logger.debug("tx_id: ", tx_id);
        // logger.debug("ccPayload: ", ccPayload);

        var sdkPayload = {
            anchorPeer: anchorPeer,
            connectedPeers: "",
            chaincodeName: chaincodeName,
        };

        payload = {
            "ccPayload": ccPayload,
            "sdkPayload": sdkPayload,
        };

        // console.log(payload);
        console.log("Cloned recent lotteries");
        cachedLotteries = clone(payload);
        refreshRequired = false;

        console.log(JSON.stringify(payload));
        res.write(JSON.stringify(payload));
        res.end();
    });

    queryAllEventsReq.on('requestTimeout', function (req) {
        console.log('request has expired');
        // queryAllEventsReq.abort();
        res.write("행사 조회 실패");
        res.end();
    });
}

function selectScript() {
    return "sample 1";
}


// updateLocalCache should support a replacement of an old lottery event
// Currently, it only needs to called in query and subscribe, not open and draw
function updateLocalCache(cachedWhole, updatedLottery) {
    var res = cachedLotteries.ccPayload.split("*");
    // console.log("BEFORE splice op. res", res);
    res.splice(0, 1);
    // Remove trailing comma...
    for (var i = 0, l = res.length; i < l; i++) {
        if (res[i][res[i].length - 1] == ',') {
            //res[i] = res[i].substring(0, res[i].length - 2);
            res[i] = res[i].slice(0, -1);
        }
    }
    // console.log("AFTER splice op. res", res);

    for (var i = 0; i < res.length; ++i) {
        var obj = JSON.parse(res[i]);
        if (obj.InputHash == updatedLottery.InputHash) {
            // logger.debug("res[i]", typeof res[i], typeof JSON.parse(res[i]), JSON.parse(res[i]));
            // logger.debug("updatedLottery", typeof updatedLottery, updatedLottery);
            logger.debug("updatedLottery", i, updatedLottery.EventName, updatedLottery.InputHash);
            res[i] = JSON.stringify(updatedLottery);
            break;
        }
    }

    var afterRes ;
    afterRes = "''*" + res.join("*");
    console.log(afterRes);
    cachedLotteries.ccPayload = clone(afterRes);
    // console.log("AFTER replacement and join op. res", afterRes);
}

// Wraps local cache for the client-side parser
function packLocalCache() {
    
}

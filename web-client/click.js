var blockQueryBaseURL = "https://api.blockcypher.com/v1/btc/main/blocks/";
var hostURL = "http://192.168.0.13:1185";
// var hostURL = "http://localhost:1185";
// var hostURL = "http://141.223.121.56:1185";
// 하나의 추첨 행사에 대해 다음과 같은 정보를 획득하기
// Lottery structure. got this when clicking the row
var gLottery;

// 체인정보 구현
function clickChaininfo() {
    var eventHash = gLottery.eventHash;
    var drawTxID = gLottery.drawTxID; // 추첨 트랜잭션 ID
    var drawBlockHeight; // 추첨 트랜잭션이 포함된 블록 번호
    var drawBlockInfo; // 추첨 트랜잭션이 포함된 블록 정보

    var openTxID = gLottery.openTxID; // 행사 등록 트랜잭션 ID
    var openBlockHeight; // 등록 트랜잭션이 포함된 블록 번호
    var openBlockInfo;

    var subscribeTxIDs = gLottery.subscribeTxIDs;
    
    var installedChaincodes;
    var chaincodeName = gLottery.chaincodeName; // 체인코드 이름
    var chaincodeVersion; // 체인코드 버전
    var peers; // 피어 주소 목록
    var anchorPeer = gLottery.anchoPeer;

    var channelName = gLottery.channelName; // 채널 정보
    var txidList; // 관련 트랜잭션 리스트
    var randomKey = gLottery.randomKey;
    var verifiableRandomKey= gLottery.verifiableRandomKey;

    var text = "";

    var openClientIdentity= gLottery.openClientIdentity; // 클라이언트 인증서. 너무 길어서 포함은 아직

    var endorsementPolicy = "";

    var ordererInfo = "Solo";

    text = 
        // "peer list: " + peers + "<br>" + 
        // "txid list: " + txidList + "<br>" + 
        "<ul>" + 
        "<li style='text-align: left;'><b>식별자</b>: <span data-toggle='tooltip' title='행사의 고유 ID를 나타내며, 체인코드 내부에서 검색키로 사용됩니다'>" + eventHash + "</span></li>" + 

        "<li onclick='queryChain()' style='text-align: left;'><b>채널 이름</b>: <span data-toggle='tooltip' title='블록체인이 속한 채널의 이름을 나타냅니다' style='color:DarkBlue; cursor:pointer;'>" + channelName + "</span></li>" + 

        "<li onclick='queryGenesisBlock()' style='text-align: left;'><b>최초 블록 조회</b>: <span data-toggle='tooltip' title='오더링 서비스 노드의 최초 블록(Genesis Block)을 조회합니다.' style='color:DarkBlue; cursor:pointer;'>" + "<i class='fa fa-file-text'; style='font-size:26px;color:DarkBlue'></i>" + "</span></li>" + 

        "<li onclick='queryChannelTx()' style='text-align: left;'><b>채널 생성 트랜잭션</b>: <span data-toggle='tooltip' title='채널 생성 트랜잭션을 조회합니다.' style='color:DarkBlue; cursor:pointer;'>" + "<i class='fa fa-asterisk'; style='font-size:26px;color:DarkBlue'></i>" + "</span></li>" + 

        "<li id='opentxid' onclick='queryOpenTxID()' style='text-align: left;'><b>등록</b>: <span data-toggle='tooltip' title='행사 등록 트랜잭션 ID를 나타냅니다' style='color:DarkBlue; cursor:pointer;'>" + openTxID + "</span></li>" + 

        "<li onclick='queryDrawTxID()' data-toggle='tooltip' title='추첨 트랜잭션 ID를 나타냅니다' style='text-align: left;'><b>추첨</b>: <span style='color:DarkBlue; cursor:pointer;'>" + drawTxID + "</span></li>" + 

        
        "<li style='text-align: left;'><b>응모</b>: " + subscribeTxIDs + "</li>" + 

        "<li onclick='queryPeers()' style='text-align: left;'><b>피어 목록</b>: <span data-toggle='tooltip' title='SDK 서버와 통신하는 블록체인 피어 주소를 나타냅니다' style='color:DarkBlue; cursor:pointer;'>" + "<i class='fa fa-bank'; style='font-size:26px;color:DarkBlue'></i>" + "</span></li>" + 

        "<li onclick='queryInstalledChaincodes()' data-toggle='tooltip' title='설치되거나 초기화된 체인코드를 조회합니다' style='text-align: left;'><b>체인코드 조회</b>: <span style='color:DarkBlue; cursor:pointer;'>" + "<i class='fa fa-list-alt'; style='font-size:26px;color:DarkBlue'></i>" + "</span></li>" + 


        "<li style='text-align: left;'><b>랜덤키</b>: <span data-toggle='tooltip' title='행사 등록시 사용된 랜덤 키를 나타냅니다'>" + randomKey + "</span></li>" + 
        "<li style='text-align: left;'><b>검증키</b>: <span data-toggle='tooltip' title='행사 정보의 불변성을 검증하기 위해 사용됩니다'>" + verifiableRandomKey + "</span></li>" + 
        // "<b>openClientIdentity</b>: " + openClientIdentity + "<br>" + 
        // "drawBlock: " + drawBlockHeight + "<br>" + 
        // "openTxBlock: " + openBlockHeight + "<br>" + 
        // "chaincodeID: " + chaincodeID + "<br>" + 
        // "chaincodeVersion: " + chaincodeVersion + "<br>" + 
        // "endorsementPolicy: " + endorsementPolicy + "<br>" + 
        // "ordererInfo: " + ordererInfo + "<br>" + 
        "</ul>" +
        
        ""
        ;

    swal({
        title: '체인 정보',
        html: text,
        width: 800,
        showCloseButton: true,
        confirmButtonText: '확인',
    });

}

function queryChannelTx() {
    showSpinner();

    $.ajax({
        url: hostURL + "/query-channeltx",
        type: "GET", 
        success: function(responseData) {
            console.log(responseData);
            var prettyJSON = "<pre style='text-align: left;'>" + responseData + "</pre>"
            // console.log(prettyJSON);

            swal({
                title: "채널생성 트랜잭션 조회",
                html: prettyJSON,
                width:800,
            });

            hideSpinner();
        },
        error: function() {
            Swal("Fail");
            hideSpinner();
        }
    });
}
function queryGenesisBlock() {
    showSpinner();

    $.ajax({
        url: hostURL + "/query-genesis-block",
        type: "GET", 
        success: function(responseData) {
            console.log(responseData);
            var prettyJSON = "<pre style='text-align: left;'>" + responseData + "</pre>"
            // console.log(prettyJSON);

            swal({
                title: "최초 블록 조회",
                html: prettyJSON,
                width:1200,
            });

            hideSpinner();
        },
        error: function() {
            Swal("Fail");
            hideSpinner();
        }
    });
}

function queryPeers() {
    showSpinner();

    $.ajax({
        url: hostURL + "/query-peers",
        type: "GET", 
        success: function(responseData) {
            console.log(responseData);
            var prettyJSON = "<pre style='text-align: left;'>" + responseData + "</pre>"
            // console.log(prettyJSON);

            swal({
                title: "피어 조회",
                html: prettyJSON,
                // width:1200,
            });

            hideSpinner();
        },
        error: function() {
            Swal("Fail");
            hideSpinner();
        }
    });

}

function queryInstalledChaincodes() {

    showSpinner();
    var allData = {
        "txid" : gLottery.chaincodeName,
    };

    $.ajax({
        url: hostURL + "/query-by-chaincodes",
        type: "POST", 
        data: allData,
        success: function(responseData) {
            console.log(responseData);
            var prettyJSON = "<pre style='text-align: left;'>" + responseData + "</pre>"
            // console.log(prettyJSON);

            swal({
                title: "체인코드 조회",
                html: prettyJSON,
                // width:1200,
            });

            hideSpinner();
        },
        error: function() {
            Swal("Fail");
            hideSpinner();
        }
    });
}

function queryOpenTxID(obj) {
    console.log("queryOpenTxID", gLottery.openTxID);
    showSpinner();
    var allData = {
        "txid" : gLottery.openTxID,
    };

    $.ajax({
        url: hostURL + "/query-by-tx",
        type: "POST", 
        data: allData,
        success: function(responseData) {
            console.log(responseData);
            var prettyJSON = "<pre style='text-align: left;'>" + syntaxHighlight(responseData) + "</pre>"
            // console.log(prettyJSON);

            swal({
                title: "등록 트랜잭션 조회",
                html: prettyJSON,
                width:1200,
            });

            hideSpinner();
        },
        error: function() {
            Swal("Fail");
            hideSpinner();
        }
    });
}

function queryDrawTxID() {
    console.log("queryDrawTxID", gLottery.drawTxID);
    showSpinner();
    var allData = {
        "txid" : gLottery.openTxID,
    };

    $.ajax({
        url: hostURL + "/query-by-tx",
        type: "POST", 
        data: allData,
        success: function(responseData) {
            console.log(responseData);
            var prettyJSON = "<pre style='text-align: left;'>" + syntaxHighlight(responseData) + "</pre>"
            // console.log(prettyJSON);

            swal({
                title: "추첨 트랜잭션 조회",
                html: prettyJSON,
                width:1200,
            });

            hideSpinner();
        },
        error: function() {
            Swal("Fail");
            hideSpinner();
        }
    });
}

// Query channel information. Channel forms logical blockchain
function queryChain() {
    showSpinner();
    var allData = {
        "channelName" : gLottery.channelName,
    };

    $.ajax({
        url: hostURL + "/query-by-chaininfo",
        type: "POST", 
        data: allData,
        success: function(responseData) {
            console.log(responseData);
            var prettyJSON = "<pre style='text-align: left;'>" + syntaxHighlight(responseData) + "</pre>"
            // console.log(prettyJSON);

            swal({
                title: "채널 상세 조회",
                html: prettyJSON,
                width:1200,
            });

            hideSpinner();
        },
        error: function() {
            Swal("Fail");
            hideSpinner();
        }
    });
}

var gLotteryNote;
function clickLotteryNote() {
    swal({
        title: "추첨 노트",
        text: gLotteryNote,
        confirmButtonText: '확인',
    });
}

var gWinnerList;
function clickWinnerList() {
    // console.log(gWinnerList);
    var outputText = "";
    var winnerListArray = gWinnerList.split(",").filter(function(x) {
        return (x.length > 0) && (x !== (undefined || null || " " || ' ' || '' || ""));
    });

    var numOfWinners = winnerListArray.length;

    for (var i = 0; i < numOfWinners; ++i) {
        outputText += "<font color='red'>" + (i+1) + "</font> " + winnerListArray[i] + "<br>";
    }

    swal({
        title: "당첨자 확인",
        html: outputText,
        width: 400,
        padding: 10,
    });
}

//
// Globally passed pariticpant lists
var gMaxNumOfMembers;
var gPariticipantList;
function clickParticipantinfo() {
    var participantArray = gPariticipantList.split(",").filter(function(x) {
        return (x.length > 0) && (x !== (undefined || null || " " || ' ' || '' || ""));
    });

    participantArray = participantArray.filter(item => item !== '');

    for (var i = 0; i < participantArray.length; ++i) {
        participantArray[i] = participantArray[i].replace(/ /g, '');
        // if (participantArray[i].length )
        console.log(participantArray[i]);
    }

    // var text = "<ol style='height:1630px;width:1500px;display:flex; flex-direction:column; flex-wrap:wrap;'>";
    var text = "<ol>";
    const kMaxNameLen = 14;

    for (var i = 0; i < participantArray.length; ++i) {
        var shortenName;
        if (participantArray[i].length > kMaxNameLen) {
            shortName = participantArray[i].substring(0, kMaxNameLen);
        } else {
            shortName = participantArray[i];
        }
        text += "<li style='text-align: left;'><b>" + shortName + "</b></li>";
    }
    text += "</ol>"
    swal({
        title: '참여자 목록(' + participantArray.length + '/' + gMaxNumOfMembers + ')' ,
        html: text,
        // width: 800,
        // heightì: 800,
        showCloseButton: true,
    });
}

function clickScript() {
    // alert("h2");
    // swal({
            // title: '',
            // text: '',
            // type: 'success',
            // allowOutsideClick: true,
            // html: true
        // },
        // function () {
            // $('#myModal').modal('show');
        // });
}

function searchStringInArray (str, strArray) {
    for (var j=0; j<strArray.length; j++) {
        if (strArray[j].match(str)) return j;
    }
    return -1;
}


function showSpinner() {
    $("#spinner").css("display", "block");
    $("html").css("filter","brightness(50%)");
}

function hideSpinner() {
    $("#spinner").css("display", "none");
    $("html").css("filter","brightness(100%)");
}

function timestampTest() {
    var sampleTs = getCurrentTimestamp();
    console.log(sampleTs);
    var sampleDatetime = timestampToDatetime(sampleTs);
    console.log(sampleDatetime);
    var resampleTs = datetimeToTimestamp(sampleDatetime);
    console.log(resampleTs);
}

function datetimeToTimestamp(datetime) {
    var timestamp;
    var tmpdt = new Date(datetime);
    timestamp = tmpdt.getTime();
    return timestamp / 1000;
};

function getCurrentTimestamp() {
    return Math.floor(Date.now() / 1000);
};

function timestampToDatetime(unixtime) {

    var utcSeconds = unixtime;
    var d = new Date(0); // The 0 there is the key, which sets the date to the epoch
    d.setUTCSeconds(utcSeconds);
    d = formatDatetime(d);

    return d;

    // var dateTime = new Date(unixtime * 1000);
    // var u = dateTime.toISOString().replace('T',' ');
    // u = u.substring(0, u.length - 8);
    // return u;
}

function formatDatetime(datetime) {
    var year = datetime.getFullYear();
    var month = datetime.getMonth() + 1;
    if (month < 10) {
        month = "" + 0 + month;
    }
    var day = datetime.getDate();
    if (day < 10) {
        day = "" + 0 + day;
    }
    var hour = datetime.getHours();
    if (hour < 10) {
        hour = "" + 0 + hour;
    }
    var min = datetime.getMinutes();
    if (min <= 9) min = "" + 0 + min;
    // console.log(year, month, day, hour, min);
    return year + "-" + month + "-" + day + " " + hour + ":" + min;
}

function toHexString(byteArray) {
  return Array.from(byteArray, function(byte) {
    return ('0' + (byte & 0xFF).toString(16)).slice(-2);
  }).join('')
}

// return winner list (array of integers)
// 추첨 행위와 참여자 명단을 분리시킴.
// 순수히 추첨만 이루어짐. 우승자 수, 참가자 수, 우승자 수
var doDetermineWinner = function(randomBits, numOfParticipants, numOfWinners) {
    var winnerList = drawByFisherYatesShuffle(numOfParticipants, numOfWinners, randomBits);
    // var winnerList = drawByIndexHashing(numOfParticipants, numOfWinners, randomBits);

}

// blockcypher API call limits
// https://github.com/blockcypher/php-client/issues/31
// 2000 Requests Per Day
// 200 Requests Per Hour
// 3 Requests Per Second
// 200 WebHooks
// 0 Payment Forwards
// 200 WebHooks/WebSockets Per Hour
// 15 Confidence Lookups Per Hour
$(document).ready(function() {
    $("html").css("height", "100%");
    $("body").css("height", "100%");

    google.charts.load("current", {
        packages: ['corechart']
    });
    google.charts.setOnLoadCallback(drawGoogleChart);

    function drawGoogleChart(draw) {
        $("#chartbtn").click(function() {
            drawChart();
        });

    }

    // var hostURL = "http://141.223.121.56:1185";
    // var hostURL = "http://192.168.0.12:1185";

    $.ajax({
        url: hostURL + "/query-all-events",
        type: "POST", 
        data: "",
        success: function(responseData) {
            var sdkInfo = JSON.parse(responseData).sdkPayload;
            if (typeof JSON.parse(responseData).ccPayload === "undefined") {
                // console.log(responseData);
                console.log("responseData is null!", typeof responseData.ccPayload);
                hideSpinner();
                return;
            }
            console.log(JSON.parse(responseData).ccPayload);
            var res = JSON.parse(responseData).ccPayload.split("*");
            // console.log(responseData);
            // console.log(sdkInfo);
            // console.log(res);
            // var res = responseData.ccPayload.split("@");
            // var numOfPeer = 2
            
            res.splice(0, 1);
            for (var i = 0, l = res.length; i < l; i++) {
                if (res[i][res[i].length - 1] == ',') {
                    //res[i] = res[i].substring(0, res[i].length - 2);
                    res[i] = res[i].slice(0, -1);
                }
            }

            var initTabledata = [ ];
            for (var i = 0; i < res.length; ++i) {
                var obj = JSON.parse(res[i]);
                var tsAnnouncementDate = obj.AnnouncementDate;

                obj.Duedate = timestampToDatetime(obj.Duedate);
                obj.IssueDate = timestampToDatetime(obj.IssueDate);
                obj.AnnouncementDate = timestampToDatetime(obj.AnnouncementDate);
                obj.WinnerList = obj.WinnerList.trim().split(",");
                obj.EventHash = obj.EventHash;


                for (var j = 0; j < obj.WinnerList.length; ++j) {
                    obj.WinnerList[j] = obj.WinnerList[j].trim();
                }

                obj.WinnerList = obj.WinnerList.join(",");

                initTabledata[i] = {
                    id:(i+1),
                    name: obj.EventName,
                    announceDate: obj.AnnouncementDate,
                    tsAnnouncementDate: tsAnnouncementDate,
                    numOfMembers: obj.NumOfMembers, // Maximum members
                    numOfRegistered: obj.NumOfRegistered,
                    numOfWinners: obj.NumOfWinners,
                    subscribe: 1, check: 1, verify:1,

                    status : obj.Status,
                    eventHash : obj.InputHash,
                    targetBlock : obj.FutureBlockHeight,
                    targetBlockHash : obj.TargetBlockHash,
                    issueDate : obj.IssueDate,
                    dueDate : obj.Duedate,
                    randomKey : obj.RandomKey,
                    winnerList : obj.WinnerList,
                    participantList : obj.MemberList,
                    script : obj.Script,
                    lotteryNote : obj.LotteryNote,
                    channelID : obj.ChannelID,
                    openTxID : obj.OpenTxID,
                    drawTxID : obj.DrawTxID,
                    subscribeTxIDs : obj.SubscribeTxID,
                    openClientIdentity : obj.OpenClientIdentity,
                    anchorPeer : obj.AnchorPeer,
                    chaincodeName : obj.ChaincodeName,
                    verifiableRandomKey : obj.VerifiableRandomkey,
                }

                var printQueryInfo = function(obj) {
                    console.log("target block #", obj.FutureBlockHeight);
                    console.log("randomKey", obj.RandomKey);
                    console.log("openTxID", obj.OpenTxID);
                    console.log("drawTxID", obj.DrawTxID);
                    console.log("openClientIdentity", obj.OpenClientIdentity);
                }

                // printQueryInfo();
            }

            // Redraw the table
            $("#allQueryTableReserved").tabulator("setData", initTabledata);
            hideSpinner();
        },
        error: function() {
            Swal("Fail");
            hideSpinner();
        }
    });

    var printIcon = function(cell, formatterParams){ //plain text value
        return "<i class='fa fa-file'  style='font-size:28px;color:BlueViolet '></i>";
    };

    var printCheck = function(cell, formatterParams){ //plain text value
        return "<i class='fa fa-check-square'  style='font-size:28px;color:BlueViolet '></i>";
    };

    var printVerify = function(cell, formatterParams){ //plain text value
        return "<i class='fa fa-check-square-o' style='font-size:28px;color:BlueViolet'></i>" ;
    };

    var printStatistics = function(cell, formatterParams){ //plain text value
        return "<i class='fa fa-bar-chart-o'; style='font-size:28px;color:BlueViolet ' ></i>";
    };
    var printDrawIcon = function(cell, formatterParams){ //plain text value
        return "<i class='fa fa-chain'; style='font-size:28px;color:BlueViolet'></i>";
    };
    var printSubscribeIcon = function(cell, formatterParams){ //plain text value
        return "<i class='fa fa-plus-square'  style='font-size:28px;color:BlueViolet '></i>";
    };


    $("#allQueryTableReserved").tabulator({
        // layout:"fitColumns",
        // width: "1900px",
        layout:"fitDataFill",
        // layout:"fitWidth",
        // tooltips:true,
        addRowPos:"top",
        //                history:true,
        //                pagination:"local",
        //                paginationSize:7,
        movableColumns:true,
        resizableRows:true,
        // responsiveLayout:"collapse", 
        initialSort:[
            {column:"name", dir:"asc"},
        ],
        // rowFormatter:function(row, data) {
            // var element = row.getElement(),
                // data = row.getData(),
                // width = element.outerWidth(),
                // table;

            // clear current row data
            // element.empty();

            // define a table layout structure and set width of row
            // table = $("<table style='width:" + (1000) + "px;'><tr></tr></table>");

            // add image on left of row
            // $("tr", table).append("<td>" + data.name + "</td>");

            // add row data on right hand side
            // $("tr", table).append("<td><div><strong>예정발표일:</strong> " + data.announceDate +
                // "</div><div><strong>참가자 수:</strong> " + data.numOfRegistered + 
                // "</div><div><strong>우승자 수:</strong> " + data.numOfWinners + 
                // "</div><div><strong>참여:</strong> " + data.subscribe + "</div></td>");

            // append newly formatted contents to the row
            // element.append(table);
        // },
        columns:[ // Define Table Columns

            // {formatter:"responsiveCollapse", width:30, minWidth:30, align:"center", resizable:false, headerSort:false},
            {title:"행사 이름", headerSort:false, field:"name", width:"18px"},
            {title:"예정발표일", field:"announceDate", align:"center", sorter:"date", width:"12px"},
            {title:"예정발표일(타임스탬프)", field:"tsAnnounceDate", align:"center", sorter:"date", width:"12px"},
            {title:"참가자 수", headerSort:false, field:"numOfRegistered", align:"center", width:"9px"},
            {title:"우승자 수", headerSort:false, field:"numOfWinners", align:"center", width:"9px"},
            {title:"참여", headerSort:false, field:"subscribe", formatter:printSubscribeIcon, align:"center", width:"4px", 
                cellClick:function(e, cell){
                    var lotteryName = cell.getRow().getData().name;
                    var eventHash = cell.getRow().getData().eventHash;
                    var lotteryName = cell.getRow().getData().name;
                    // Validate by timestamp of announcement date
                    // var ts = cell.getRow().getData().tsAnnouncementDate;
                    // var curr_ts = Math.floor(Date.now() / 1000);
                    // if (curr_ts >= ts) {
                        // Swal({type:"error", title:"참여 기한이 마감되었습니다", 
                            // confirmButtonText: '확인',
                            // cancelButtonText: '취소',
                        // });
                        // return;
                    // }
                    //
                    //
                    //
                    //
                    
                    // console.log(eventHash);
                    // test_subscribe_generator(eventHash);
                    // return;
                    // Validate by status
                    var status = cell.getRow().getData().status;
                    console.log(status);
                    if(status == "CHECKED") {
                        swal({type:"error", title:"이미 추첨되었습니다",
                            confirmButtonText: '확인',
                            cancelButtonText: '취소',
                        });
                        return;
                    }   


                    Swal({
                        // title: '(' + lotteryName + ')' + '\n이름 또는 이메일을 입력하세요',
                        title: '(' + lotteryName + ')' + '\n이름을 입력하세요',
                        // html: "이메일을 입력하면, 이메일로 토큰이 전송됩니다<br>(<b>참여자의 익명성이 보장됩니다</b>)",
                        type: 'question',
                        input: 'text',
                        inputPlaceholder: '이름 혹은 이메일',
                        inputPlaceholder: '이름',
                        showCancelButton: true,
                        confirmButtonText: '응모',
                        cancelButtonText: '취소'
                    }).then((result) => {
                        showSpinner();
                        if (result.value) {
                            // Input validation
                            var functionName = "subscribe";
                            var participantName = result.value;
                            if (participantName.indexOf(',') > -1 || participantName.indexOf('*') > -1) {
                                Swal("이름에 ,* 는 포함될 수 없습니다.")
                                hideSpinner();
                                return;
                            }
                            if (validateEmail(participantName)) {
                                Swal("이메일 인증 기능은 본 데모에서는 지원하지 않습니다.")
                                hideSpinner();
                                return;
                            }
                            // 보내기
                            var allData = {
                                "functionName" : functionName,
                                "participantName" : participantName,
                                "lotteryName" : lotteryName,
                                "eventHash" : eventHash,
                            };

                            $.ajax({
                                url: hostURL + "/subscribe",
                                type: "POST", 
                                data: allData,
                                success: function(responseData) {
                                    if (validateEmail(participantName)) {
                                        Swal('참여 성공', 
                                            '입력하신 이메일로 당첨자 토큰을 전송하였습니다', 
                                            'success');
                                    } else {
                                        Swal(
                                            '참여 성공',
                                            "<b>\"" + participantName + "\" </b>님이 " 
                                            + "<b>\"" + lotteryName + "\"" + ' </b>행사에 등록!'
                                            ,
                                            // + "<br/>인증토큰" + responseData + "<br/><b><font color=\"red\">인증토큰은 당첨자임를 증명하기 위해서 반드시 갖고 있어야 합니다</font><br/>(복사해두세요)</b>",
                                            'success'
                                        ).then(() => {
                                            window.location.reload();
                                        });
                                    }

                                    hideSpinner();
                                },
                                error: function(req, status, error) {
                                    Swal(
                                        '참가자 등록 실패',
                                        req.responseText + "(e.g., duplicate participation)",
                                        'error'
                                    )
                                    console.log(req.responseText);
                                    console.log(status);
                                    console.log(error);
                                    hideSpinner();
                                }
                            })
                            // For more information about handling dismissals please visit
                            // https://sweetalert2.github.io/#handling-dismissals
                        } else {
                            hideSpinner();
                        } 
                    });
                    // alert("Printing row data for: " + cell.getRow().getData().name);
                    // 기존의 subscribe 함수 호출
                }
            },

            {title:"추첨", headerSort:false, field:"draw", formatter:printDrawIcon, align:"center", width:"4px",
                cellClick:function(e, cell) {

                    // 테스트 중에는 굳이 이런 과정 필요 없음
                    // Validate by timestamp of announcement date
                    // var ts = cell.getRow().getData().tsAnnouncementDate;
                    // var curr_ts = getCurrentTimestamp();
                    // if (curr_ts <= ts) {
                        // Swal({type:"error", title:"발표일이 지나야 합니다",
                            // confirmButtonText: '확인',
                            // cancelButtonText: '취소',
                        // });
                        // return;
                    // }

                    // Validate number of participants
                    var kRegistered = cell.getRow().getData().numOfRegistered;
                    if(kRegistered == 0) {
                        swal({type:"error", title:"참가자가 아무도 없습니다",
                            confirmButtonText: '확인',
                            cancelButtonText: '취소',
                        });
                        return;
                    } 

                    // Validate lottery status
                    var status = cell.getRow().getData().status;
                    if(status == "CHECKED") {
                        swal({type:"error", title:"이미 추첨되었습니다",
                            confirmButtonText: '확인',
                            cancelButtonText: '취소',
                        });
                        return;
                    }   

                    // Validate host authentication token
                    Swal({
                        title: '호스트 인증토큰을 입력하세요',
                        type: 'question',
                        input: 'text',
                        showCancelButton: true,
                        confirmButtonText: '추첨',
                        cancelButtonText: '취소',
                        allowOutsideClick: () => !swal.isLoading()
                    }, function (inputValue) {
                        if (inputValue === false) {
                            console.log("Do here everything you want");
                        } else {
                            console.log("no");
                        }
                    }).then((result) => {
                        // When clicked "cancel", result.dismiss returns "cancel"
                        if (result.dismiss == "cancel") {
                            console.log(result, result.dismiss);
                            return;
                        }
                        var hostAuthToken = result.value;
                        var allData = {
                            "hostAuthToken" : hostAuthToken,
                        };

                        $.ajax({
                            url: hostURL + "/validate-token",
                            type: "POST", 
                            data: allData,
                            success: function(responseData) {
                                if (responseData != "true") {
                                    console.log("유효하지 않은 토큰 오류 발생", responseData);
                                    swal('유효하지 않은 토큰입니다','', 'error');
                                    return;
                                }
                                readTargetBlockAndDetermineWinner();
                            }
                        }).fail(function(textStatus, error) {
                            swal('유효하지 않은 토큰입니다','',error);
                        });

                    });

                    // reading target block and select winner using the block
                    var readTargetBlockAndDetermineWinner = function() {
                        // Validate target block
                        var targetBlockNumber = cell.getRow().getData().targetBlock;
                        console.log("targetBlockNumber", targetBlockNumber);
                        $.ajax({
                            url: blockQueryBaseURL + targetBlockNumber,
                            type: "GET", 
                            dataType: 'json',
                            contentType: 'text/plain',
                            crossDomain:true,
                        }).done(function(json) {
                            var blockHash = json.hash;
                            console.log("Target block is published", blockHash);

                            // call chaincode
                            var lotteryName = cell.getRow().getData().name;
                            var eventHash = cell.getRow().getData().eventHash;
                            // var verifiableRandomKey = "undefined";
                            // console.log(verifiableRandomKey);

                            var allData = {
                                "eventHash" : eventHash,
                                // "verifiableRandomKey"  :  verifiableRandomKey,
                            };

                            showSpinner();

                            $.ajax({
                                url: hostURL + "/draw",
                                type: "POST", 
                                data: allData,
                                success: function(responseData) {
                                    var outputText = 
                                        "<b>" +
                                        JSON.parse(responseData).WinnerList +
                                        "</b>"
                                        ;

                                    swal({
                                        title: "("+ lotteryName + ")</br>추첨 완료</br>",
                                        // text: outputText,
                                        html: outputText,
                                        width: 400,
                                        // height: 300,
                                        padding: 10,
                                        backdrop: `
                                    rgba(0,0,123,0.4)
                                    url("/images/draw.gif")
                                    left top
                                    no-repeat
                                  `
                                    }).then(()=> {
                                        var rowIndex = cell.getRow().getIndex();
                                        $("#allQueryTableReserved").tabulator("updateData", [{id:rowIndex, status:"CHECKED", winnerList:responseData}]); //update data
                                        window.location.reload();
                                    });
                                    hideSpinner();


                                },
                                error: function() {
                                    Swal(
                                        '추첨 실패!',
                                        '',
                                        'error'
                                    )
                                    hideSpinner();
                                }
                            });

                        }).fail(function(textStatus, error) {
                            console.log("Error: " + textStatus + " " + error);
                            swal({type:"error", title: "타겟 블록이 생성되지 않았습니다"});
                            hideSpinner();
                        });
                        hideSpinner();

                    };

                }
            },

            {title:"확인", field:"check", formatter:printCheck, align:"center", width:"4px",  headerSort:false, 
                cellClick:function(e, cell) {
                    var lotteryName = cell.getRow().getData().name;
                    var targetBlockNumber = cell.getRow().getData.targetBlock;
                    var announceDate = cell.getRow().getData().announceDate;
                    // Validate appropriate date
                    var ts = cell.getRow().getData().tsAnnouncementDate;
                    var curr_ts = getCurrentTimestamp();
                    // if (curr_ts <= ts) {
                        // Swal({type:"error", title:"발표일이 지나야 합니다",
                            // confirmButtonText: '확인',
                            // cancelButtonText: '취소',
                        // });
                        // return;
                    // }

                    // Validate participants
                    // var kRegistered = cell.getRow().getData().numOfRegistered;
                    // if(kRegistered == 0) {
                        // swal({type:"error", title:"참가자가 아무도 없습니다",
                            // confirmButtonText: '확인',
                            // cancelButtonText: '취소',
                        // });
                        // return;
                    // } 

                    var status = cell.getRow().getData().status;
                    if(status != "CHECKED") {
                        swal({type:"error", title:"아직 추첨 되지 않았습니다",
                            confirmButtonText: '확인',
                            cancelButtonText: '취소',
                        });
                        return;
                    } 

                    var numOfWinners = cell.getRow().getData().numOfWinners;
                    var winnerList = cell.getRow().getData().winnerList;
                    var winnerListArray = winnerList.split(",").filter(function(x) {
                        return (x.length > 0) && (x !== (undefined || null || " " || ' ' || '' || ""));
                    });


                    var outputText = 
                        // '<input id="participantName" placeholder="참여자 등록 이름" style="width:100%;" class="swal2-input">' +
                        // '<input id="authToken" placeholder="인증 토큰" style="float:left; width:100%;" class="swal2-input">' 
                    '<div clicked onclick="showList()" style="cursor:pointer"><font color="DarkBlue"></font></div>'
                    // '<div onclick="showList()" style="cursor:pointer"><font color="DarkBlue">당첨자 명단 확인</font></div>'
                    // + '<div id="showListText" style="display:none;">'

                    for (var i = 0; i < numOfWinners; ++i) {
                        outputText += "<font color=\"red\">" + (i+1) + "</font> " + winnerListArray[i] + "<br>";
                    }
                    outputText += "</div>"


                    swal({
                        title: "(행사명: "+ lotteryName + ")</br>결과 확인</br>",
                        html: outputText,
                        focusConfirm: false,
                        preConfirm: () => {
                            return {
                                participantName : document.getElementById('participantName').value,
                                authToken : document.getElementById('authToken').value,
                            };
                        },
                        // confirmButtonText: '당첨 여부 확인',
                        cancelButtonText: '취소',
                        // text: outputText,
                        width: 400,
                        // height: 300,
                        padding: 10,
                        backdrop: `
                                    rgba(0,0,123,0.4)
                                    url("/images/Congratst.gif")
                                    left top
                                    no-repeat
                                  `,
                        allowOutsideClick: () => !swal.isLoading()
                    }).then((result) => {
                        if (result.value) {
                            var participantName = result.value.participantName;
                            var authToken = result.value.authToken;
                            var allData = {
                                "participantName" : participantName,
                                "authToken" : authToken,
                                "winnerListArray" :  winnerListArray,
                            };

                            $.ajax({
                                url: hostURL + "/authenticate",
                                type: "POST", 
                                data: allData,
                                success: function(responseData) {
                                    swal({
                                        title: "당첨자 인증 결과",
                                        html: responseData,
                                        width:800,
                                    });
                                },
                                error: function() {
                                    Swal("Fail");
                                }
                                // width:1200,
                            });

                        }

                    });

                },
                // 조작 결과 반영(항상 마지막 참여자가 우승하는 꼴)
                cellContext:function(e, cell) {
                    console.log("Right click in Desktop or hold in mobile");
                    var lotteryName = cell.getRow().getData().name;
                    var targetBlockNumber = cell.getRow().getData.targetBlock;
                    var announceDate = cell.getRow().getData().announceDate;
                    // Validate appropriate date
                    var ts = cell.getRow().getData().tsAnnouncementDate;
                    var curr_ts = getCurrentTimestamp();
                    if (curr_ts <= ts) {
                        Swal({type:"error", title:"발표일이 지나야 합니다"});
                        return;
                    }

                    // Validate participants
                    var kRegistered = cell.getRow().getData().numOfRegistered;
                    if(kRegistered == 0) {
                        swal({type:"error", title:"참가자가 아무도 없습니다"});
                        return;
                    } 

                    var status = cell.getRow().getData().status;
                    if(status != "CHECKED") {
                        swal({type:"error", title:"아직 추첨 되지 않았습니다"});
                        return;
                    } 

                    var numOfWinners = cell.getRow().getData().numOfWinners;
                    var winnerList = cell.getRow().getData().winnerList;
                    var participantList = cell.getRow().getData().participantList;

                    var winnerListArray = winnerList.split(",").filter(function(x) {
                        return (x.length > 0) && (x !== (undefined || null || " " || ' ' || '' || ""));
                    });
                    var participantArray = participantList.split(",").filter(function(x) {
                        return (x.length > 0) && (x !== (undefined || null || " " || ' ' || '' || ""));
                    });


                    var outputText = "";

                    // XXX: Set last element as a first-ranked winner
                    winnerListArray[0]= participantArray[participantArray.length - 1];
                    for (var i = 0; i < numOfWinners; ++i) {
                        outputText += "<font color=\"red\">" + (i+1) + "</font> :" + winnerListArray[i] + "\n\n";
                    }

                    swal({
                        title: "("+ lotteryName + ")</br>결과 확인</br>"+  outputText,
                        // text: outputText,
                        width: 400,
                        // height: 300,
                        padding: 10,
                        backdrop: `
                                    rgba(0,0,123,0.4)
                                    url("/images/Congratst.gif")
                                    left top
                                    no-repeat
                                  `
                    });


                }
            },

            {title:"검증", field:"verify",formatter:printVerify, align:"center", width:"4px",headerSort:false, 
                cellClick:function(e, cell){

                    if($('#falseDemo').data('clicked')) {
                        console.log("falsedemo...");
                        return;
                    }

                    var lotteryName = cell.getRow().getData().name;
                    var targetBlock = cell.getRow().getData().targetBlock;
                    var targetBlockHash = cell.getRow().getData().targetBlockHash;
                    var participantList = cell.getRow().getData().participantList;


                    // Validate appropriate date
                    // var ts = cell.getRow().getData().tsAnnouncementDate;
                    // var curr_ts = getCurrentTimestamp();
                    // if (curr_ts <= ts) {
                        // Swal({type:"error", title:"발표일이 지나야 합니다",
                            // confirmButtonText: '확인',
                            // cancelButtonText: '취소',
                        // });
                        // return;
                    // }

                    // Validate participants
                    var kRegistered = cell.getRow().getData().numOfRegistered;
                    if(kRegistered == 0) {
                        swal({type:"error", title:"참가자가 아무도 없습니다",
                            confirmButtonText: '확인',
                            cancelButtonText: '취소',
                        });
                        return;
                    } 

                    var status = cell.getRow().getData().status;
                    if(status != "CHECKED") {
                        swal({type:"error", title:"아직 추첨 되지 않았습니다"});
                        return;
                    } 

                    var numOfWinners = cell.getRow().getData().numOfWinners;
                    var verification = false;
                    var outputhtml =
                        '<div><input type="checkbox" disabled="true" id="randomSourceVrfy" value="randomSource" > \
                        <label for="randomSourceVrfy"><span data-toggle="tooltip" title="' + textRandomSourceVrfy + '">랜덤 소스 검증</span></label></div>' +

                        '<div><input type="checkbox" disabled="true" id="infoVrfy" value="info" > \
                        <label for="infoVrfy"><span data-toggle="tooltip" title="'+ textInfoVrfy +'">행사 정보 무결성 검증</span></label></div>' +

                        '<div><input type="checkbox" id="winnerVrfy" value="winner" checked> \
                        <label for="winnerVrfy"><span data-toggle="tooltip" title="' +textWinnerVrfy +'"><font color="red">당첨자 목록 검증</font></span></label></div>' +

                        '<div><input type="checkbox" disabled="true" id="responseVrfy" value="response" > \
                        <label for="responseVrfy"><span data-toggle="tooltip" title="'+textResponseVrfy+'">응답 값 비교 검증</span></label></div>' +

                        '<div><input type="checkbox" disabled="true" id="statVrfy" value="stat" > \
                        <label for="statVrfy"><span data-toggle="tooltip" title="'+textStatVrfy+'">통계적 검증</span></label></div>'

// <span data-toggle='tooltip' title=''>" + eventHash + "</span>
                    swal({
                        type: 'question',
                        title: '검증 목록',
                        html: outputhtml ,
                        focusConfirm: false,
                        preConfirm: () => {
                            return {
                                randomSourceVrfy : document.getElementById('randomSourceVrfy').checked,
                                infoVrfy : document.getElementById('infoVrfy').checked,
                                winnerVrfy : document.getElementById('winnerVrfy').checked,
                                responseVrfy : document.getElementById('responseVrfy').checked,
                                statVrfy : document.getElementById('statVrfy').checked,
                            };
                        },
                        confirmButtonText: '확인',
                        cancelButtonText: '취소',
                        backdrop: `
                                rgba(0,0,123,0.4)
                                url("/images/verify.gif")
                                left top
                                no-repeat
                              `,
                        allowOutsideClick: () => !swal.isLoading()
                    }).then((result) => {

                        if (result.value) {
                            var randomSourceVrfy = result.value.randomSourceVrfy
                            var infoVrfy = result.value.infoVrfy;
                            var winnerVrfy = result.value.winnerVrfy;
                            var responseVrfy = result.value.responseVrfy;
                            var statVrfy = result.value.statVrfy;

                            var isRandomSourceVrfy;
                            var isInfoVrfy ;
                            var isWinnerVrfy;
                            var isResponseVrfy;
                            var isStatVrfy; 

                            var verifyProgressStep = [];
                            var sweetModal = [];
                            var finalHtmlOutput = "";

                            console.log(randomSourceVrfy, infoVrfy, 
                                winnerVrfy, responseVrfy, statVrfy);

                            // TODO
                            if (randomSourceVrfy) {
                                // vrfyRandomsource();
                                verifyProgressStep.push("랜덤");
                                sweetModal.push({
                                    title: '랜덤 소스 무결성 검증',
                                    text: textRandomSourceVrfy,
                                    backdrop: `
                                    rgba(0,0,123,0.4)
                                    url("/images/BlockChain-Animated-Proof.gif")
                                    left top
                                    no-repeat
                                  `,
                                    preConfirm: () => {
                                        var verifyResult = vrfyRandomSource(targetBlock, 1);
                                        isRandomSourceVrfy = verifyResult.successFlag;

                                        finalHtmlOutput += "<div><b>랜덤 소스 무결성 검증</b></div>";
                                        if (isRandomSourceVrfy == true) {
                                            finalHtmlOutput += "<b><font color='red'>성공</font></b></div>";
                                            console.log("랜덤 소스 무결성 검증 성공!");
                                        } else {
                                            finalHtmlOutput += "<font color='red'>실패</font></div>";
                                            console.log("랜덤 소스 무결성 검증 실패!");
                                        }
                                        // finalHtmlOutput += "<div></div>";
                                        finalHtmlOutput += "<br>";
                                        finalHtmlOutput += verifyResult.outputhtml;
                                        finalHtmlOutput += "<br><br>";
                                    },
                                });
                            }

                            // TODO
                            if (infoVrfy) {
                                // vrfyInfo();
                                verifyProgressStep.push("행사");
                                sweetModal.push({
                                    title: '행사 정보 무결성 검증',
                                    text: textInfoVrfy,
                                    backdrop: `
                                    rgba(0,0,123,0.4)
                                    url("/images/document-integrity.gif")
                                    left top
                                    no-repeat
                                  `,
                                    preConfirm: () => {
                                        // 검증키 사용하여 검증
                                        var lottery = cell.getRow().getData();
                                        var verifyResult = vrfyInfo(lottery);
                                        isInfoVrfy = verifyResult.successFlag;
// var peerResponse = JSON.parse(responseData).peersResponses;

                                        var details = verifyResult.details;
                                        finalHtmlOutput += "<div><b>행사 정보 무결성 검증</b></div>";
                                        if (isInfoVrfy) {
                                            console.log("행사 정보 무결성 검증 성공");
                                            finalHtmlOutput += "<font color='red'><b>성공</b></font></div>";
                                        } else {
                                            console.log("행사 정보 무결성 검증 실패");
                                            finalHtmlOutput += "<font color='red'><b>실패</b></font></div>";
                                        }
                                        // finalHtmlOutput += "<div>행사 세부 사항</div>"
                                        finalHtmlOutput += "<pre style='text-align: left;'>" + details + "</pre>";
                                        finalHtmlOutput += "<div><b>검증키: " + verifyResult.verifiableRandomKey +"</b></div>";
                                        finalHtmlOutput += "<div><b>계산 결과: " + verifyResult.calculatedKey +"</b></div>";
                                        finalHtmlOutput += "<br><br>";
                                    },
                                });
                            }

                            // TODO
                            if (winnerVrfy) {
                                verifyProgressStep.push("당첨");
                                sweetModal.push({
                                    title: '당첨자 명단 검증',
                                    text: textWinnerVrfy,
                                    preConfirm: () => {
                                        // 당첨자 재계산 후 목록 비교
                                        var lottery = cell.getRow().getData();
                                        var verifyResult = vrfyWinner(lottery);
                                        isWinnerVrfy = verifyResult.successFlag;
                                        finalHtmlOutput += "<div><b>당첨자 명단 검증</b></div>";
                                        if (isWinnerVrfy) {
                                            console.log("당첨자 명단 검증 성공");
                                            finalHtmlOutput += "<font color='red'><b>성공</b></font></div>";
                                        } else {
                                            console.log("당첨자 명단 검증 실패");
                                            finalHtmlOutput += "<font color='red'></b>실패</b></font></div>";
                                        }
                                        finalHtmlOutput += "<div>랜덤 소스(타겟 블록의 해시 값), 참가자 수, 당첨자 수, 그리고 추첨 스크립트(Fisher-Yates random shuffling)를 사용하여 당첨자를 계산한 결과는 다음과 같습니다";

                                        finalHtmlOutput += "<div><b>랜덤 소스: " + verifyResult.blockHash + "</b></div>"
                                        finalHtmlOutput += "<div><b>참가자 수: " + verifyResult.numOfParticipants + "</b></div>"
                                        finalHtmlOutput += "<div><b>당첨자 수: " + verifyResult.numOfWinners + "</b></div>"
                                        finalHtmlOutput += "<div><b>기록된 당첨자 명단: " + verifyResult.winnerListArray + "</b></div><br>"
                                        finalHtmlOutput += "<div><b>직접 계산한 결과: " + verifyResult.calculatedWinnerList + "</b></div><br>"
                                        finalHtmlOutput += "<br><br>";
                                    },
                                });
                            }

                            // TODO
                            if (responseVrfy) {
                                verifyProgressStep.push("응답");
                                var eventHash = cell.getRow().getData().eventHash;
                                var queryResult = queryPeersForVrfy();

                                var outputhtml = "";
                                var numOfPeers;
                                var peers;

                                outputhtml += queryResult.outputhtml;
                                numOfPeers = queryResult.numOfPeers;
                                peers = queryResult.peers;


                                sweetModal.push({
                                    title: '응답 값 비교 검증',
                                    // text: textResponseVrfy,
                                    html: textResponseVrfy + outputhtml,
                                    backdrop: `
                                        rgba(0,0,123,0.4)
                                        url("/images/raft_consensus.gif")
                                        left top
                                        no-repeat
                                      `,
                                    preConfirm: () => {
                                        console.log("응답 값 비교 검증");
                                        // console.log("numOfPeers", numOfPeers);
                                        var selectedPeers = [];
                                        for(var i = 0; i < numOfPeers; ++i) {
                                            var checked = document.getElementById(peers[i]).getAttribute("checked");
                                            console.log("Selected?: ", checked);
                                            if (checked) {
                                                selectedPeers.push(peers[i]);
                                                console.log("SelectedPeer: ", peers[i]);
                                            }
                                        }
                                        var allData = {
                                            "eventHash" : eventHash,
                                            "selectedPeers" : selectedPeers,
                                        };

                                        $.ajax({
                                            url: hostURL + "/verify-peer-response",
                                            type: "POST", 
                                            data: allData,
                                            async: false,
                                            success: function(responseData) {
                                                var peerResponse = JSON.parse(responseData).peersResponses;
                                                var voting = JSON.parse(responseData).voting;
                                                console.log(peerResponse);
                                                console.log(voting);
                                                var successFlag = false;
                                                for (var i = 0; i < numOfPeers; ++i) {
                                                    if(voting[peerResponse[selectedPeers[i]]] > (numOfPeers / 2)) {
                                                        successFlag = true;
                                                        break;
                                                    }
                                                }

                                                var prettyJSON 
                                                    = "<div><b>응답 값 검증 결과</b></div>";
                                                if(successFlag) {
                                                    prettyJSON += "<div><font color='red'><b>성공</b></font></div>"
                                                } else {
                                                    prettyJSON += "<div><font color='red'><b>실패</b></font></div>"
                                                }
                                                prettyJSON += 
                                                    "<div>아래의 결과는 연결된 피어들에 주어진 행사 질의를 한 결과의 해시 값을 나타냅니다. voting 필드는 (응답 값, 득표 수)를 나타내며 득표 수가 높을수록 신뢰할만한 정보입니다. 보통 분산 시스템에서는 다수결 투표(majority voting)를 통해 응답 값을 선택합니다. peerResponse 필드는 (피어 이름, 응답 값)을 나타내며, 각 피어가 어떤 응답 값을 주었는지를 나타냅니다.</div><br>" + 
                                                    "<pre style='text-align: left;'>" 
                                                    + responseData + "</pre>"
                                                finalHtmlOutput += prettyJSON;
                                                finalHtmlOutput += "<br><br>";
                                            },
                                            error: function() {
                                                Swal("Fail");
                                            }
                                            // width:1200,
                                        });
                                    },
                                });
                            }

                            // TODO
                            if (statVrfy) {
                                // vrfyStat();
                                // swal.closeModal()
                                // document.getElementById('chartbtn').click();
                                verifyProgressStep.push("통계");

                                sweetModal.push({
                                    title: '추첨 스크립트의 통계적 검증',
                                    text: textStatVrfy,
                                    preConfirm: () => {
                                        console.log("통계");
                                        // numOfTrial += numOfTrial * 10;

                                        var dataStatistics = 
                                            getDataStatistics(randomEngineNoSource, "", sWinners, sParticipants, numOfTrial);
                                        // gStdDev = stdev(dataStatistics);
                                        var n = numOfTrial;
                                        var w = sWinners;
                                        var N = sParticipants;
                                        var p = (w / N);
                                        var q = 1.0 - p;
                                        var m = n * p;
                                        var v = n * p * q;
                                        var s = Math.sqrt(n * p * q);

                                        console.log("n:", n);
                                        console.log("w:", w);
                                        console.log("N:", N);
                                        console.log("p:", p);
                                        console.log("q:", q);
                                        console.log("m:", m);
                                        console.log("v:", v);
                                        console.log("s:", s);
                                        // var sigma
                                        // console.log("분산:", gStdDev.variance);
                                        // console.log("평균:", gStdDev.mean);
                                        // console.log("표준편차:", gStdDev.deviation);
                                        // console.log("표준편차:", Math.sqrt(gStdDev.variance));
                                        var zScores = [];
                                        var successFlag = true;
                                        for (var i = 0; i < sParticipants; ++i) {
                                            // var z = Math.abs(dataStatistics[i] - m) / s;
                                            var z = jStat.zscore(dataStatistics[i], m, s);
                                            var ztest = jStat.ztest(dataStatistics[i], m, s, 2);
                                            zScores.push(z.toFixed(4));

                                            console.log("평균보다 " + (dataStatistics[i] - m) + "만큼 더/덜 당첨");
                                            // console.log("(m0-m)/s=z", dataStatistics[i] - m, z);
                                            console.log("jStat.zscore: ", jStat.zscore(dataStatistics[i], m, s));
                                            // console.log("jStat.test(one-side): ", jStat.ztest(dataStatistics[i], m, s, 1));
                                            console.log("jStat.test(two-side): ", jStat.ztest(dataStatistics[i], m, s, 2));

                                            // console.log("z", i, " : ", z);

                                            if (Math.abs(z) > ztestMax) {
                                                successFlag = false;
                                                break;
                                            }
                                        }

                                        finalHtmlOutput += "<div><b>추첨스크립트의 통계적 검증</b></div>"
                                        if (successFlag) {
                                            finalHtmlOutput += "<div><font color='red'><b>성공</b></font></div>"
                                        } else {
                                            finalHtmlOutput += "<div><font color='red'><b>실패</b></font></div>"
                                        }

                                        finalHtmlOutput += 
                                            "<br>행사에 사용된 추첨 스크립트가 특정 참여자를 유독 많이 당첨시키는지를 검사합니다. 추첨 사건 일어난 횟수 n, 각 참여자가 당첨될 확률 p일때, 추첨 스크립트는 이항 분포를 따릅니다. 통계학에서의 중심 극한 정리(central limit theorem)에 따르면, n이 충분히 크면 모든 확률 분포는 정규 분포를 따릅니다. 따라서 z값 검정 (z-test) 과정을 통해 특정 참여자가 평균보다 얼만큼(k) 더 당첨이 되었는지를 계산하고, 이를 통해 추첨 스크립트의 공평성을 측정합니다. k값은 평균으로부터의 차이의 허용 범위를 나타냅니다. k값이 클수록 z값도 높아집니다. z값이 사전에 정해놓은 최대 수치보다 크면 검증 실패, 작으면 검증 성공으로 구분합니다. 아래 그래프는 시행 횟수(n), 시행 별 당첨될 확률(p)가 주어졌을때의 시행 결과를 나타냅니다. 막대 그래프의 높이가 서로 균등할수록 공평한 추첨으로 간주됩니다. </div>" +
                                            // "<b>" +
                                            "<div>시행 횟수(n) = " + n + "</div>" +
                                            "<div>우승자 수(w) = " + w + "</div>" +
                                            "<div>참여자 수(N) = " + N + "</div>" +
                                            "<div>당첨 확률(p=w/N) = " + p + "</div>" +
                                            "<div>기댓값(m=np) = " + m + "</div>" +
                                            "<div>분산(v=np(1-p)) = " + v + "</div>" +
                                            "<div>표준편차(s=sqrt(np(1-p))) = " + s + "</div>" +
                                            "<div>참여자 별 z-score : [" + zScores + "]</div>" +
                                            "<div>zMax = " + ztestMax + "</div>" +
                                            "<div style='display:block; margin-left:auto; margin-right:auto;width:50%;'class='chart' id='googleChart_div'></div><div id='googleChart'></div>";
                                            // "</b>" +
                                            // "<div>표준편차:" + Math.sqrt(gStdDev.variance) + "</div>" +
                                    },
                                });
                            }


                            swal.mixin({
                                confirmButtonText: '다음',
                                cancelButtonText: '취소',
                                showCancelButton: true,
                                width: 600,
                                progressSteps: verifyProgressStep,
                            }).queue(sweetModal)
                                .then((result) => {
                                if (result.value) {
                                    swal({
                                        title: '검증 결과',
                                        html: finalHtmlOutput,
                                        confirmButtonText: '검증 리포트 다운로드',
                                        cancelButtonText: '확인',
                                        width: 1000,
                                        preConfirm: () => {
                                            console.log("검증 리포트 다운로드");
                                            var allData = {
                                                outputhtml : finalHtmlOutput,
                                                reportID : new Date() + "",
                                            };
                                            $.ajax({
                                                url: hostURL + '/create-verification-report',
                                                type: 'POST',
                                                data: allData,
                                                // async: false,
                                                success: function (filePath) {
                                                    // success callback
                                                    console.log("filePath", filePath);
                                                    var link=document.createElement('a');
                                                    link.href= hostURL + filePath;
                                                    link.target="_blank";
                                                    link.download="veri-report" + new Date() + ".pdf";
                                                    link.click();
                                                },
                                                error: function (jqXHR, textStatus, errorThrown) {
                                                    // error callback
                                                    console.log("error");
                                                }
                                            });
                                        },
                                    });
                                }
                            })
                        }
                    });

                    // return;

                    var vrfyResponse = function(eventHash) {
                        $.ajax({
                            url: hostURL + "/query-peers",
                            type: "GET", 
                            async: false,
                            success: function(responseData) {
                                console.log(responseData);
                                // var prettyJSON = "<pre style='text-align: left;'>" + responseData + "</pre>"
                                // console.log(prettyJSON);
                                var parsedJSON = JSON.parse(responseData);
                                // GetPeers
                                var peers = parsedJSON.peers;

                                // Select subset of peers to get response
                                console.log("numOfPeers: ", peers.length);
                                var numOfPeers = peers.length;
                                var outputhtml = "";
                                for(var i = 0; i < peers.length; ++i) {
                                    outputhtml 
                                        += "<div><input checked='checked' type='checkbox' id='" + peers[i] + "'>" +
                                        "<label for=" + peers[i] + ">&nbsp;" + peers[i] + "</label></div>";
                                }
                                swal({
                                    title: "검증 피어 선택",
                                    html: outputhtml,
                                    focusConfirm: false,
                                    width: 600,
                                    showCancelButton: true,
                                    confirmButtonText: '확인',
                                    showLoaderOnConfirm: true,
                                    preConfirm: () => {
                                        var selectedPeers = [];
                                        for(var i = 0; i < numOfPeers; ++i) {
                                            var checked = document.getElementById(peers[i]).getAttribute("checked");
                                            console.log("Selected?: ", checked);
                                            if (checked) {
                                                selectedPeers.push(peers[i]);
                                                console.log("SelectedPeer: ", peers[i]);
                                            }
                                        }
                                        return {
                                            selectedPeers: selectedPeers,
                                        };
                                    },
                                    allowOutsideClick: () => !swal.isLoading(),

                                }).then((result) => {
                                    if (result.value) {
                                        var selectedPeers = result.value.selectedPeers;
                                        console.log(selectedPeers);
                                        var allData = {
                                            "eventHash" : eventHash,
                                            "selectedPeers" : selectedPeers,
                                        };
                                        $.ajax({
                                            url: hostURL + "/verify-peer-response",
                                            type: "POST", 
                                            data: allData,
                                            async: false,
                                            success: function(responseData) {
                                                var prettyJSON 
                                                    = "<pre style='text-align: left;'>" 
                                                        + responseData + "</pre>"

                                                swal({
                                                    title: "응답 값 검증 결과",
                                                    html: prettyJSON,
                                                    width:800,
                                                });
                                            },
                                            error: function() {
                                                Swal("Fail");
                                            }
                                            // width:1200,
                                        });

                                    }
                                });

                            },
                            error: function() {
                                Swal("Fail");
                            }
                        });
                    };

                    var statVrfy = function() {
                    
                    };

                    var randomSourceVrfy = function() {
                    
                    };

                    var infoVrfy = function() {
                    
                    };

                    return;

                    // Define query block func

                    var queryBlock = function(height) {
                        $.ajax({
                            url: blockQueryBaseURL + height,
                            type: "GET", 
                            dataType: 'json',
                            contentType: 'text/plain',
                            crossDomain:true,
                        }).done(function(json) {
                            var time = json.time;
                            var blockHash = json.hash;
                            console.log(blockHash);
                            var prev_block = json.prev_block;
                            // split participantList into array
                            var participantArray = participantList.split(",").filter(function(x) {
                                return (x.length > 0) && (x !== (undefined || null || " " || ' ' || '' || ""));
                            });

                            participantArray = participantArray.filter(item => item !== '');

                            for (var i = 0; i < participantArray.length; ++i) {
                                participantArray[i] = participantArray[i].replace(/ /g, '');
                                // if (participantArray[i].length )
                                console.log(participantArray[i]);
                            }

                            var parseHexString = function(str) { 
                                var result = [];
                                while (str.length >= 8) { 
                                    result.push(parseInt(str.substring(0, 8), 16));

                                    str = str.substring(8, str.length);
                                }

                                return result;
                            }

                            var randomKey = cell.getRow().getData().randomKey;
                            var randomKeyHex = String(randomKey);
                            // var randomKeyHex = String(randomKey).toString(16);
                            var randomKeyBitArray = sjcl.codec.hex.toBits(randomKeyHex);
                            var hmacOut = new sjcl.misc.hmac(randomKeyBitArray).encrypt(blockHash);
                            var randomBits = sjcl.bitArray.clamp(hmacOut, 32);

                            console.log("blockHash: " + blockHash);
                            console.log("randomKeyHex: " + randomKeyHex);
                            console.log("sjcl.bitArray.bitLength(randomBits): " + sjcl.bitArray.bitLength(randomBits));
                            console.log("randomKeyBitArray: " + randomKeyBitArray);
                            console.log("randomBits: " + randomBits);

                            var numOfParticipants = participantArray.length;

                            // Remove space and null ?
                            // Error 왜 undefined가 생기지?
                            var participantArray = participantList.split(",").filter(function(x) {
                                return (x.length > 0) && (x !== (NaN || undefined || null || " " || ' ' || '' || ""));
                            });


                            // var winnerList = doDetermineWinner(randomKey, numOfParticipants, numOfWinners);
                            var winnerList = doDetermineWinner(blockHash, numOfParticipants, numOfWinners);

                            // Print
                            var firstNchars = 10;
                            // var outputText = "(긴 경우)처음 " + firstNchars + " 글자까지만 표현\n"
                            var outputText = "";
                            for (i = 0; i < numOfWinners; ++i) {
                                outputText += "<font color='red'>" + (i+1) + "</font> " + participantArray[winnerList[i]] + "<br>";
                            }

                            swal({
                                title: "검증 결과",
                                html: outputText,
                                // text: outputText ,
                                width: 400,
                                // height: 300,
                                padding: 10,
                                backdrop: `
                                        rgba(0,0,123,0.4)
                                        url("/images/verify.gif")
                                        left top
                                        no-repeat
                                      `
                            });

                            return json;
                        }).fail(function(textStatus, error) {
                            console.log("Error: " + textStatus + " " + error);
                            swal({type:"error", title: "타겟 블록이 생성되지 않았습니다"});

                        });};
                    // var block = queryBlock(400000);
                    var block = queryBlock(targetBlock);
                }, 
                cellContext:function(e, cell) {
                    console.log("Right click in Desktop or hold in mobile");
                    // swal("Demo for false verification");
                    swal({
                        title: '검증',
                        html:
                        '<input id="verifiedName" placeholder="검증대상" style="width:100%;" class="swal2-input">' +
                        '<input id="verifiedNumber" placeholder="순위" min="1" style="float:left; width:100%;" type="number" class="swal2-input">' ,
                        focusConfirm: false,
                        showCancelButton: true,
                        confirmButtonText: '검증',
                        showLoaderOnConfirm: true,
                        preConfirm: () => {
                            return {
                                verifiedName : document.getElementById('verifiedName').value,
                                verifiedNumber : document.getElementById('verifiedNumber').value,
                            };
                        },
                        allowOutsideClick: () => !swal.isLoading()

                    }).then((result) => {
                        if (result.value) {
                            var verifiedName = result.value.verifiedName;
                            var verifiedNumber = result.value.verifiedNumber;

                            var lotteryName = cell.getRow().getData().name;
                            var targetBlock = cell.getRow().getData().targetBlock;
                            var participantList = cell.getRow().getData().participantList;


                            // Validate appropriate date
                            var ts = cell.getRow().getData().tsAnnouncementDate;
                            var curr_ts = getCurrentTimestamp();
                            if (curr_ts <= ts) {
                                Swal({type:"error", title:"발표일이 지나야 합니다"});
                                return;
                            }

                            // Validate participants
                            var kRegistered = cell.getRow().getData().numOfRegistered;
                            if(kRegistered == 0) {
                                swal({type:"error", title:"참가자가 아무도 없습니다"});
                                return;
                            } 

                            var participantArray = participantList.split(",").filter(function(x) {
                                return (x.length > 0) && (x !== (undefined || null || " " || ' ' || '' || ""));
                            });

                            participantArray = participantArray.filter(item => item !== '');

                            for (var i = 0; i < participantArray.length; ++i) {
                                participantArray[i] = participantArray[i].replace(/ /g, '');
                                // if (participantArray[i].length )
                                console.log(participantArray[i]);
                            }

                            var validateParticipants = searchStringInArray(verifiedName, participantArray);
                            if (validateParticipants == -1) {
                                swal({type:"error", title:"검증 대상이 참가자 목록에 없습니다"});
                                return;
                            
                            }

                            var numOfWinners = cell.getRow().getData().numOfWinners;
                            var verification = false;
                            // Define query block func

                            var queryBlock = function(height) {
                                $.ajax({
                                    url: blockQueryBaseURL + height,
                                    type: "GET", 
                                    dataType: 'json',
                                    contentType: 'text/plain',
                                    crossDomain:true,
                                }).done(function(json) {
                                    var time = json.time;
                                    var blockHash = json.hash;
                                    console.log(blockHash);
                                    var prev_block = json.prev_block;
                                    // split participantList into array

                                    var parseHexString = function(str) { 
                                        var result = [];
                                        while (str.length >= 8) { 
                                            result.push(parseInt(str.substring(0, 8), 16));

                                            str = str.substring(8, str.length);
                                        }

                                        return result;
                                    }

                                    var randomKey = cell.getRow().getData().randomKey;
                                    var randomKeyHex = String(randomKey);
                                    // var randomKeyHex = String(randomKey).toString(16);
                                    var randomKeyBitArray = sjcl.codec.hex.toBits(randomKeyHex);
                                    var hmacOut = new sjcl.misc.hmac(randomKeyBitArray).encrypt(blockHash);
                                    var randomBits = sjcl.bitArray.clamp(hmacOut, 32);

                                    console.log("blockHash: " + blockHash);
                                    console.log("randomKeyHex: " + randomKeyHex);
                                    console.log("sjcl.bitArray.bitLength(randomBits): " + sjcl.bitArray.bitLength(randomBits));
                                    console.log("randomKeyBitArray: " + randomKeyBitArray);
                                    console.log("randomBits: " + randomBits);


                                    // Remove space and null ?
                                    // Error 왜 undefined가 생기지?
                                    var participantArray = participantList.split(",").filter(function(x) {
                                        return (x.length > 0) && (x !== (NaN || undefined || null || " " || ' ' || '' || ""));
                                    });

                                    var numOfParticipants = participantArray.length;

                                    // var winnerList = doDetermineWinner(randomKey, numOfParticipants, numOfWinners);
                                    var winnerList = doDetermineWinner(blockHash, numOfParticipants, numOfWinners);

                                    // Print
                                    // var outputText = "(긴 경우)처음 " + firstNchars + " 글자까지만 표현\n"
                                    var outputText = "";
                                    // for (i = 0; i < numOfWinners; ++i) {
                                        // // outputText += "<font color=\"red\">" + (i+1) + "</font> :" + winnerList[i][0].substring(0, 10) + "\n\n";
                                        // // outputText += "<font color=\"red\">" + (i+1) + "</font> :" + winnerList[i][0] + "\n\n";
                                        // outputText += "<font color=\"red\">" + (i+1) + "</font> :" + participantArray[winnerList[i][0]] + "\n\n";
                                    // }
                                    // verifiedNumber = verifiedNumber -1;
                                    console.log("winnerList[verifiedNumber]", winnerList[verifiedNumber-1][0]);

                                    if (participantArray[winnerList[verifiedNumber-1]] == verifiedName) {
                                        verification = true;
                                        outputText = "" + verifiedName + "(는)은 " + verifiedNumber + " 순위가 맞습니다";
                                    } else {
                                        verification = false;
                                        // 정확한 순위
                                        var correctRank = -1;
                                        // verifiedName으로 정확한 순위를 찾아낼수있나?
                                        // 이름은 이미 점검했으므로 반드시 정확한 랭크가 매겨져야함
                                        for (var i = 0; i < participantArray.length; ++i) {
                                            if (participantArray[winnerList[i]] == verifiedName) correctRank = i+1;
                                        }

                                        if (correctRank > numOfWinners) {
                                            outputText = "" + verifiedName + "(는)은 " + verifiedNumber + " 순위가 아닙니다,<br>" 
                                                + " 당첨자가 아닙니다";
                                        } else {
                                            outputText = "" + verifiedName + "(는)은 " + verifiedNumber + " 순위가 아닙니다,<br>" 
                                                + correctRank + " 순위 입니다";
                                        
                                        }


                                    }


                                    swal({
                                        title: outputText,
                                        // text: outputText ,
                                        width: 400,
                                        // height: 300,
                                        padding: 10,
                                    });

                                    return json;
                                }).fail(function(textStatus, error) {
                                    console.log("Error: " + textStatus + " " + error);
                                    swal({type:"error", title: "타겟 블록이 생성되지 않았습니다"});

                                });};
                            // var block = queryBlock(400000);
                            var block = queryBlock(targetBlock);

                        }
                    });
                },
                cellTapHold:function(e, cell) {
                    // swal("cellTapHold");
                }
            },

            {title:"정보", formatter:printIcon, field:"info", align:"center", width:"4px",headerSort:false, 
                cellClick:function(e, cell) {
                    // Failed at passing argument to onclick event
                    // For remedy this, passing the list globally

                
                    gMaxNumOfMembers = cell.getRow().getData().numOfMembers;
                    gPariticipantList = cell.getRow().getData().participantList;
                    gWinnerList = cell.getRow().getData().winnerList;
                    gLotteryNote = cell.getRow().getData().lotteryNote;

                    gLottery = {
                        drawTxID: cell.getRow().getData().drawTxID,
                        openTxID: cell.getRow().getData().openTxID,
                        subscribeTxIDs: cell.getRow().getData().subscribeTxIDs,
                        channelName: cell.getRow().getData().channelID,
                        openClientIdentity: cell.getRow().getData().openClientIdentity,
                        eventHash: cell.getRow().getData().eventHash,
                        randomKey: cell.getRow().getData().randomKey,
                        verifiableRandomKey: cell.getRow().getData().verifiableRandomKey,
                        anchorPeer: cell.getRow().getData().anchorPeer,
                        chaincodeName: cell.getRow().getData().chaincodeName,
                    };

                    swal({title:'추첨 행사 정보', 
                        html:"<b>행사 이름</b> : " + cell.getRow().getData().name + "</br>" +
                        "<b>등록일</b> : " + cell.getRow().getData().issueDate  + "</br>" +
                        "<b>마감일</b> : " + cell.getRow().getData().dueDate  + "</br>" + 
                        "<b>발표일</b> : " + cell.getRow().getData().announceDate  + "</br>" + 
                        '<b>참여자</b> : <span style="cursor:pointer;"onclick="clickParticipantinfo()"><i class="fa fa-address-book"; style="font-size:26px;color:Blue"></i></span></br>' +
                        '<b>당첨자</b> : <span style="cursor:pointer;"onclick="clickWinnerList()"><i class="material-icons" style="font-size:26px;color:Blue">people</i> </span></br>' +
                        "<b>타겟 블록</b> : <a target='_blank'  href='https://blockchain.info/ko/block-height/" + cell.getRow().getData().targetBlock + "'>" + cell.getRow().getData().targetBlock + "</a></br>" +
                        // "<b>이벤트ID</b>: " + cell.getRow().getData().eventHash + "</br>" +
                        // "<b>랜덤키</b> : " + cell.getRow().getData().randomKey + "</br>"  + 
                        '<b>추첨 노트</b> : <span style="cursor:pointer;"onclick="clickLotteryNote()"><i class="material-icons" style="font-size:26px;color:Blue">content_paste</i> </span></br>' +
                        "<b>체인 정보</b> : <span style='cursor:pointer;'onclick='clickChaininfo()'><i class='fa fa-list-alt'; style='font-size:26px;color:Blue'></i></span>" + 
                        ""
                        ,
                        confirmButtonText: '확인',
                        cancelButtonText: '취소',
                    },
                        
                    );
                }
            },

            {title:"이벤트해시", field:"eventHash", align:"center", width:"12px",headerSort:false },
            {title:"상태", field:"status", align:"center", width:"8px",headerSort:false},
            {title:"타겟 블록", field:"targetBlock", align:"center", width:"8px",headerSort:false},
            {title:"타겟 블록 해시", field:"targetBlockHash", align:"center", width:"8px",headerSort:false},
            {title:"등록일", field:"issueDate", align:"center", width:"8px",headerSort:false},
            {title:"마감일", field:"dueDate", align:"center", width:"8px",headerSort:false},
            {title:"랜덤키", field:"randomKey", align:"center", width:"8px",headerSort:false},
            {title:"검증키", field:"verifiableRandomKey", align:"center", width:"8px",headerSort:false},
            {title:"우승자", field:"winnerList", align:"center", width:"8px",headerSort:false},
            {title:"참여자", field:"participantList", align:"center", width:"8px",headerSort:false},
            {title:"추첨 노트", field:"lotteryNote", align:"center", width:"8px",headerSort:false},
            // {title:"통계", field:"script",formatter:printStatistics, align:"center", width:"4px",headerSort:false,
                // cellClick:function(e, cell){
                    // document.getElementById('chartbtn').click();
                // }
            // },
        ],
    });

    var initTabledata = [
        {id:1, name:"불러오는 중", announceDate:"불러오는 중" }
        // {id:1, name:"sslab 친목", announceDate:"2018/04/27 12:30", numOfWinners: 3, subscribe:1, check:1, verify:1},
        // {id:2, name:"포스텍 세미나", announceDate:"2018/05/10 12:30", numOfWinners: 20, subscribe:1, check:1, verify:1},
        // {id:3, name:"블록체인 세미나", announceDate:"2018/05/12 14:00", numOfWinners: 5, subscribe:1, check:1, verify:1},
        // {id:3, name:"테스트", announceDate:"2018/05/12 14:00", numOfWinners: 5, subscribe:1, check:1, verify:1},
    ];
    // Re-draw the table with new data from server
    $("#allQueryTableReserved").tabulator("setData", initTabledata);
    // $("#allQueryTableReserved").tabulator("responsiveLayout", "collapse");
    showSpinner();
    // Hide unnecesary columns to user
    if (true) {
        $("#allQueryTableReserved").tabulator("hideColumn", "eventHash");
        // $("#allQueryTableReserved").tabulator("hideColumn", "script");
        $("#allQueryTableReserved").tabulator("hideColumn","announceDate");
        $("#allQueryTableReserved").tabulator("hideColumn","tsAnnounceDate");
        $("#allQueryTableReserved").tabulator("hideColumn", "status");
        $("#allQueryTableReserved").tabulator("hideColumn", "targetBlock");
        $("#allQueryTableReserved").tabulator("hideColumn", "targetBlockHash");
        $("#allQueryTableReserved").tabulator("hideColumn","issueDate");
        $("#allQueryTableReserved").tabulator("hideColumn","dueDate");
        $("#allQueryTableReserved").tabulator("hideColumn","verifiableRandomKey");
        $("#allQueryTableReserved").tabulator("hideColumn","winnerList");
        $("#allQueryTableReserved").tabulator("hideColumn","participantList");
        $("#allQueryTableReserved").tabulator("hideColumn","randomKey");
        $("#allQueryTableReserved").tabulator("hideColumn","lotteryNote");
        $("#allQueryTableReserved").tabulator("redraw");
    }

    $("#falseDemo").click(function() {
        $(this).data('clicked', true);
    });


    $( "#openLotteryBtn" ).click(function() {
        // Relace 11th to 'T' to make Swal happy
        var defaultDatetime = (timestampToDatetime(getCurrentTimestamp() + 450)).replace(" ", "T");
        swal({
            title: '추첨 행사 등록',
            html:
            '<input id="eventName" placeholder="행사명" style="width:100%;" class="swal2-input">' +
            '<input id="numOfWinners" placeholder="당첨자 수" min="1" style="float:left; width:100%;" type="number" class="swal2-input">' + 
            '<input id="expectedAnnouncementDate" placeholder="발표일"style="width:100%;" type="datetime-local" value="' + defaultDatetime  + '"class="swal2-input">' +
            '<input id="targetBlockOffset" placeholder="최신 블록 오프셋"style="float:left;width:250;" type="number" min="2"  class="swal2-input">' +
            '<input id="lotteryNote" placeholder="추첨 노트(경품)"  class="swal2-input"style="float:left;width:250;height:400;" type="input">',
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: '등록',
            cancelButtonText: '취소',
            showLoaderOnConfirm: true,
            preConfirm: () => {
                return {
                    eventName : document.getElementById('eventName').value,
                    expectedAnnouncementDate : document.getElementById('expectedAnnouncementDate').value,
                    numOfWinners : document.getElementById('numOfWinners').value,
                    targetBlockOffset : document.getElementById('targetBlockOffset').value, // offset from latest block number
                    lotteryNote : document.getElementById('lotteryNote').value
                };
            },
            allowOutsideClick: () => !swal.isLoading()

        }).then((result) => {
            if (result.value) {
                // 여기서부터 ajax 코드 goes on...
                // convert expectedAnnouncementDate to timestmap
                //

                var openLottery = function() {
                    showSpinner();
                    $.ajax({
                        url: "https://api.blockcypher.com/v1/btc/main",
                        type: "GET", 
                        dataType: 'json',
                        crossDomain:true,
                    }).done(function(json) {
                        const NumOfMaxMembers = 9999;
                        var latestBlock = json.height;
                        console.log("json hash", json.hash);
                        var targetBlockNumber = (Number(result.value.targetBlockOffset) + Number(latestBlock)).toString();
                        var targetBlockHash = null;
                        console.log(json);
                        if (targetBlockNumber == latestBlock) {
                            targetBlockHash = json.hash;
                        }
                        var numOfWinners = result.value.numOfWinners;
                        var numOfMembers = NumOfMaxMembers;
                        var eventName = result.value.eventName;

                        var expectedAnnouncementDate = datetimeToTimestamp(result.value.expectedAnnouncementDate);
                        var issueDate = getCurrentTimestamp();
                        var dueDate = expectedAnnouncementDate;
                        var lotteryNote = result.value.lotteryNote;

                        // TODO Sonner or later, choosing the script would be supported
                        var scriptNum = 1; // Default script

                        // var concatenated = "" + eventName + numOfWinners + targetBlockNumber + expectedAnnouncementDate + issueDate + dueDate + lotteryNote;

                        // var eventHash = sjcl.hash.sha256.hash(concatenated).toString();
                        // Event hash need to be calculated in server side
                        var eventHash = "";

                        console.log("Latest block: " + latestBlock);
                        console.log("Latest hash: " + targetBlockHash);
                        // console.log("eventHash: " + eventHash);

                        var allData = {
                            "eventHash" : eventHash,
                            "issueDate" : issueDate,
                            "dueDate" : dueDate,
                            "expectedAnnouncementDate" : expectedAnnouncementDate,
                            "latestBlock" : latestBlock,
                            "targetBlockNumber" : targetBlockNumber,
                            "targetBlockHash" : targetBlockHash,
                            "numOfMembers" : numOfMembers,
                            "numOfWinners" : numOfWinners,
                            "eventName" : eventName,
                            "lotteryNote" : lotteryNote,
                            "scriptNum" : scriptNum,
                        };

                        $.ajax({
                            url: hostURL + "/open",
                            type: "POST", 
                            data: allData,
                            success: function(responseData) {
                                var outputText = "txid " + responseData;
                                Swal({ 
                                    title: "등록 완료",
                                    confirmButtonText: '확인',
                                    html: outputText,
                                }).then(()=> {
                                    window.location.reload();
                                });
                                hideSpinner();
                                //
                                // Unpack responseData
                                // Table update
                            },
                            error: function() {
                                Swal({ 
                                    title: "등록 실패!",
                                    type: 'error',
                                    confirmButtonText: '확인',
                                });
                                hideSpinner();
                            }
                        })
                    });

                }
                openLottery();
                // swal({
                    // title: JSON.stringify(result)
                // });
            }
        })
    });

} );

function syntaxHighlight(json) {
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
        var cls = 'number';
        if (/^"/.test(match)) {
            if (/:$/.test(match)) {
                cls = 'key';
            } else {
                cls = 'string';
            }
        } else if (/true|false/.test(match)) {
            cls = 'boolean';
        } else if (/null/.test(match)) {
            cls = 'null';
        }
        return '<span class="' + cls + '">' + match + '</span>';
    });
}

// https://stackoverflow.com/questions/46155/how-to-validate-an-email-address-in-javascript
function validateEmail(email) {
  var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
}

function showList() {
    console.log("call me");
    $("#showListText").toggle();
}


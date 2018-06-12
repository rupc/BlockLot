var blockQueryBaseURL = "https://api.blockcypher.com/v1/btc/main/blocks/";
var hostURL = "http://141.223.121.56:1185";
// var hostURL = "http://192.168.0.12:1185";
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
    var openBlockInfo; // 등록 트랜잭션이 포함된 블록의 정보

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

        "<li id='opentxid' onclick='queryOpenTxID()' style='text-align: left;'><b>등록</b>: <span data-toggle='tooltip' title='행사 등록 트랜잭션 ID를 나타냅니다' style='color:DarkBlue; cursor:pointer;'>" + openTxID + "</span></li>" + 

        "<li onclick='queryDrawTxID()' data-toggle='tooltip' title='추첨 트랜잭션 ID를 나타냅니다' style='text-align: left;'><b>추첨</b>: <span style='color:DarkBlue; cursor:pointer;'>" + drawTxID + "</span></li>" + 

        "<li style='text-align: left;'><b>응모</b>: " + subscribeTxIDs + "</li>" + 

        "<li onclick='queryPeers()' style='text-align: left;'><b>피어 확인 </b>: <span data-toggle='tooltip' title='SDK 서버와 통신하는 피어 주소를 나타냅니다' style='color:DarkBlue; cursor:pointer;'>" + "<i class='fa fa-bank'; style='font-size:26px;color:DarkBlue'></i>" + "</span></li>" + 

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
                title: "트랜잭션 조회",
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

// Globally passed pariticpant lists
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
        title: '참여자 목록',
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

// randomBits = blockHash
var doDetermineWinner = function(randomBits, numOfParticipants, numOfWinners) {
    // code from http://stackoverflow.com/questions/5199901/how-to-sort-an-associative-array-by-its-values-in-javascript
    var tuples = [];
    var indexHash = 0;
    var concatenated = "";
    for (var i = 0; i < numOfParticipants; i++) {
        concatenated = randomBits + "" + i;
        // console.log("concatenated" + i + ": " + concatenated);
        indexHash = sjcl.hash.sha256.hash(concatenated);
        indexHash = sjcl.codec.hex.fromBits(indexHash);  
        // indexHash = concatenated;
        
        console.log("hash " + i + ": " + indexHash);
        tuples.push([i, indexHash]);
    }
    console.log(tuples[0]);
    tuples.sort(function(a, b) {
        a = a[1];
        b = b[1];
        return a < b ? -1 : (a > b ? 1 : 0);
        // for (var i = 0; i < 16; i++)
        // {
            // if (a[i] < b[i])
                // return -1;
            // else if (a[i] > b[i])
                // return 1;
        // }

    });
    console.log(tuples);

    return tuples;
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
            var res = JSON.parse(responseData).ccPayload.split("@");
            // console.log(responseData);
            // console.log(sdkInfo);
            // console.log(res);
            // var res = responseData.ccPayload.split("@");
            var numOfPeer = 2
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
                    numOfRegistered: obj.NumOfRegistered,
                    numOfWinners: obj.NumOfWinners,
                    subscribe: 1, check: 1, verify:1,

                    status : obj.Status,
                    eventHash : obj.InputHash,
                    targetBlock : obj.FutureBlockHeight,
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
                    subscribeTxIDs : obj.SubscribeTxIDs,
                    openClientIdentity : obj.OpenClientIdentity,
                    anchorPeer : obj.AnchorPeer,
                    chaincodeName : obj.ChaincodeName,
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

            // Redrwa the table
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
        layout:"fitColumns",
        // layout:"fitWidth",
        // tooltips:true,
        addRowPos:"top",
        //                history:true,
        //                pagination:"local",
        //                paginationSize:7,
        //               movableColumns:true,
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
                    var ts = cell.getRow().getData().tsAnnouncementDate;
                    var curr_ts = Math.floor(Date.now() / 1000);
                    if (curr_ts >= ts) {
                        Swal({type:"error", title:"참여 기한이 마감되었습니다", 
                            confirmButtonText: '확인',
                            cancelButtonText: '취소',
                        });
                        return;
                    }
                    Swal({
                        title: '(' + lotteryName + ')' + '\n이름을 입력하세요',
                        type: 'question',
                        input: 'text',
                        showCancelButton: true,
                        confirmButtonText: '확인',
                        cancelButtonText: '취소'
                    }).then((result) => {
                        showSpinner();
                        if (result.value) {
                            var functionName = "subscribe";
                            var participantName = result.value;
                            if (participantName.indexOf(',') > -1) {
                                Swal("이름에 콤마(,)는 포함될 수 없습니다.")
                                hideSpinner();
                                return;
                            }
                            var lotteryName = cell.getRow().getData().name;
                            var eventHash = cell.getRow().getData().eventHash;
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
                                    Swal(
                                        '참여 성공',
                                        "<b>\"" + participantName + "\" </b>님이 " 
                                        + "<b>\"" + lotteryName + "\"" + ' </b>행사에 등록!'
                                        + "<br/>인증토큰" + responseData + "<br/><b><font color=\"red\">인증토큰은 당첨자임를 증명하기 위해서 반드시 갖고 있어야 합니다</font><br/>(복사해두세요)</b>",
                                        'success'
                                    )

                                    hideSpinner();
                                },
                                error: function() {
                                    Swal(
                                        '참여!',
                                        '참가자 등록 실패',
                                        'error'
                                    )
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
                    // Validate appropriate date
                    var ts = cell.getRow().getData().tsAnnouncementDate;
                    var curr_ts = getCurrentTimestamp();
                    if (curr_ts <= ts) {
                        Swal({type:"error", title:"발표일이 지나야 합니다",
                            confirmButtonText: '확인',
                            cancelButtonText: '취소',
                        });
                        return;
                    }

                    // Validate participants
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
                        confirmButtonText: '확인',
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
                            var verifiableRandomKey = "undefined";
                            console.log(verifiableRandomKey);

                            var allData = {
                                "eventHash" : eventHash,
                                "verifiableRandomKey"  :  verifiableRandomKey,
                            };

                            showSpinner();

                            $.ajax({
                                url: hostURL + "/draw",
                                type: "POST", 
                                data: allData,
                                success: function(responseData) {
                                    var outputText = 
                                        "<b>" +
                                        responseData +
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
                                    });

                                    var rowIndex = cell.getRow().getIndex();
                                    $("#allQueryTableReserved").tabulator("updateData", [{id:rowIndex, status:"CHECKED", winnerList:responseData}]); //update data

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
                    if (curr_ts <= ts) {
                        Swal({type:"error", title:"발표일이 지나야 합니다",
                            confirmButtonText: '확인',
                            cancelButtonText: '취소',
                        });
                        return;
                    }

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


                    var outputText = "";

                    for (var i = 0; i < numOfWinners; ++i) {
                        outputText += "<font color=\"red\">" + (i+1) + "</font> " + winnerListArray[i] + "<br>";
                    }

                    swal({
                        title: "("+ lotteryName + ")</br>결과 확인</br>",
                        html: outputText,
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
                    var participantList = cell.getRow().getData().participantList;


                    // Validate appropriate date
                    var ts = cell.getRow().getData().tsAnnouncementDate;
                    var curr_ts = getCurrentTimestamp();
                    if (curr_ts <= ts) {
                        Swal({type:"error", title:"발표일이 지나야 합니다",
                            confirmButtonText: '확인',
                            cancelButtonText: '취소',
                        });
                        return;
                    }

                    // Validate participants
                    var kRegistered = cell.getRow().getData().numOfRegistered;
                    if(kRegistered == 0) {
                        swal({type:"error", title:"참가자가 아무도 없습니다",
                            confirmButtonText: '확인',
                            cancelButtonText: '취소',
                        });
                        return;
                    } 

                    var numOfWinners = cell.getRow().getData().numOfWinners;
                    var verification = false;


                    swal({
                        type: 'question',
                        title: '검증 목록',
                        html:
                        '<div><input type="checkbox" id="randomSourceVrfy" value="randomSource"> \
                        <label for="randomSourceVrfy">랜덤 소스 검증</label></div>' +

                        '<div><input type="checkbox" id="infoVrfy" value="info"> \
                        <label for="infoVrfy">행사 정보 무결성 검증</label></div>' +

                        '<div><input type="checkbox" id="winnerVrfy" value="winner"> \
                        <label for="winnerVrfy">당첨자 목록 검증</label></div>' +

                        '<div><input type="checkbox" id="responseVrfy" value="response"> \
                        <label for="responseVrfy">응답 값 비교 검증</label></div>' +

                        '<div><input type="checkbox" id="statVrfy" value="stat"> \
                        <label for="statVrfy">통계적 검증</label></div>'
                        ,

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

                            console.log(randomSourceVrfy, infoVrfy, 
                                winnerVrfy, responseVrfy, statVrfy);

                            // TODO
                            if (randomSourceVrfy) {
                                vrfyRandomsource();
                            }

                            // TODO
                            if (infoVrfy) {
                                vrfyInfo();
                            }

                            // TODO
                            if (winnerVrfy) {
                                vrfyWinner();
                            }

                            // TODO
                            if (responseVrfy) {
                                vrfyResponse();
                            }

                            // TODO
                            if (statVrfy) {
                                vrfyStat();
                            }

                        }
                    });

                    return;

                    var vrfyResponse = function() {
                    
                    };

                    var statVrfy = function() {
                    
                    };

                    var randomSourceVrfy = function() {
                    
                    };

                    var infoVrfy = function() {
                    
                    };


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


                            // var tuples = doDetermineWinner(randomKey, numOfParticipants, numOfWinners);
                            var tuples = doDetermineWinner(blockHash, numOfParticipants, numOfWinners);

                            // Print
                            var firstNchars = 10;
                            // var outputText = "(긴 경우)처음 " + firstNchars + " 글자까지만 표현\n"
                            var outputText = "";
                            for (i = 0; i < numOfWinners; ++i) {
                                outputText += "<font color='red'>" + (i+1) + "</font> " + participantArray[tuples[i][0]] + "<br>";
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

                                    // var tuples = doDetermineWinner(randomKey, numOfParticipants, numOfWinners);
                                    var tuples = doDetermineWinner(blockHash, numOfParticipants, numOfWinners);

                                    // Print
                                    // var outputText = "(긴 경우)처음 " + firstNchars + " 글자까지만 표현\n"
                                    var outputText = "";
                                    // for (i = 0; i < numOfWinners; ++i) {
                                        // // outputText += "<font color=\"red\">" + (i+1) + "</font> :" + tuples[i][0].substring(0, 10) + "\n\n";
                                        // // outputText += "<font color=\"red\">" + (i+1) + "</font> :" + tuples[i][0] + "\n\n";
                                        // outputText += "<font color=\"red\">" + (i+1) + "</font> :" + participantArray[tuples[i][0]] + "\n\n";
                                    // }
                                    // verifiedNumber = verifiedNumber -1;
                                    console.log("tuples[verifiedNumber]", tuples[verifiedNumber-1][0]);

                                    if (participantArray[tuples[verifiedNumber-1][0]] == verifiedName) {
                                        verification = true;
                                        outputText = "" + verifiedName + "(는)은 " + verifiedNumber + " 순위가 맞습니다";
                                    } else {
                                        verification = false;
                                        // 정확한 순위
                                        var correctRank = -1;
                                        // verifiedName으로 정확한 순위를 찾아낼수있나?
                                        // 이름은 이미 점검했으므로 반드시 정확한 랭크가 매겨져야함
                                        for (var i = 0; i < participantArray.length; ++i) {
                                            if (participantArray[tuples[i][0]] == verifiedName) correctRank = i+1;
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

                
                    gPariticipantList = cell.getRow().getData().participantList;
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
                        "<b>우승자</b> : " + cell.getRow().getData().winnerList + "</br>" +
                        "<b>추첨 노트</b> : " + cell.getRow().getData().lotteryNote + "</br>" +
                        "<b>타겟 블록</b> : <a target='_blank'  href='https://blockchain.info/ko/block-height/" + cell.getRow().getData().targetBlock + "'>" + cell.getRow().getData().targetBlock + "</a></br>" +
                        // "<b>이벤트ID</b>: " + cell.getRow().getData().eventHash + "</br>" +
                        // "<b>랜덤키</b> : " + cell.getRow().getData().randomKey + "</br>"  + 
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
            {title:"등록일", field:"issueDate", align:"center", width:"8px",headerSort:false},
            {title:"마감일", field:"dueDate", align:"center", width:"8px",headerSort:false},
            {title:"랜덤키", field:"randomKey", align:"center", width:"8px",headerSort:false},
            {title:"검증기", field:"verifiableRandomKey", align:"center", width:"8px",headerSort:false},
            {title:"우승자", field:"winnerList", align:"center", width:"8px",headerSort:false},
            {title:"참여자", field:"participantList", align:"center", width:"8px",headerSort:false},
            {title:"추첨 노트", field:"lotteryNote", align:"center", width:"8px",headerSort:false},
            {title:"통계", field:"script",formatter:printStatistics, align:"center", width:"4px",headerSort:false,
                cellClick:function(e, cell){
                    document.getElementById('chartbtn').click();
                }
            },
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
        $("#allQueryTableReserved").tabulator("hideColumn","tsAnnounceDate");
        $("#allQueryTableReserved").tabulator("hideColumn", "status");
        $("#allQueryTableReserved").tabulator("hideColumn", "targetBlock");
        $("#allQueryTableReserved").tabulator("hideColumn","issueDate");
        $("#allQueryTableReserved").tabulator("hideColumn","dueDate");
        $("#allQueryTableReserved").tabulator("hideColumn","verifiableRandomKey");
        $("#allQueryTableReserved").tabulator("hideColumn","winnerList");
        $("#allQueryTableReserved").tabulator("hideColumn","participantList");
        $("#allQueryTableReserved").tabulator("hideColumn","randomKey");
        $("#allQueryTableReserved").tabulator("hideColumn","lotteryNote");
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

                        var targetBlockNumber = (Number(result.value.targetBlockOffset) + Number(latestBlock)).toString();
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
                        // console.log("eventHash: " + eventHash);

                        var allData = {
                            "eventHash" : eventHash,
                            "issueDate" : issueDate,
                            "dueDate" : dueDate,
                            "expectedAnnouncementDate" : expectedAnnouncementDate,
                            "latestBlock" : latestBlock,
                            "targetBlockNumber" : targetBlockNumber,
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
                                });
                                // Unpack responseData
                                // Table update
                                hideSpinner();
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


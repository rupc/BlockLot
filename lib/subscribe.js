
var hostAddress = "http://localhost:1185"; 
// var hostAddress = "http://141.223.121.143:1185";


var spin_opts = {
    lines: 13 // The number of lines to draw
    , length: 28 // The length of each line
    , width: 14 // The line thickness
    , radius: 42 // The radius of the inner circle
    , scale: 1 // Scales overall size of the spinner
    , corners: 1 // Corner roundness (0..1)
    , color: '#000' // #rgb or #rrggbb or array of colors
    , opacity: 0.25 // Opacity of the lines
    , rotate: 0 // The rotation offset
    , direction: 1 // 1: clockwise, -1: counterclockwise
    , speed: 2 // Rounds per second
    , trail: 60 // Afterglow percentage
    , fps: 20 // Frames per second when using setTimeout() as a fallback for CSS
    , zIndex: 2e9 // The z-index (defaults to 2000000000)
    , className: 'spinner' // The CSS class to assign to the spinner
    , top: '80%' // Top position relative to parent
    , left: '50%' // Left position relative to parent
    , shadow: false // Whether to render a shadow
    , hwaccel: false // Whether to use hardware acceleration
    , position: 'absolute' // Element positioning
};

$.getScript("/node_modules/sweetalert/dist/sweetalert.min.js");

$('document').ready(function(){

// https://datatables.net/examples/api/
    var t = $('#allQueryTable').DataTable({
        bPaginate: false,
        "bFilter": true,
        "scrollX": true,
        //"sDom": 'rt',
        columnDefs: [
            {
                orderable: false,
                className: 'select-checkbox',
                targets:   0
            },
            {
                targets: [ 6,7,8,9,10,11,12,15,16],
                visible:false
            },
            {
                targets: [ 1,2,3,4,5,6,7,8,13,14 ],

                className: "dt-center hover",
                hover:false
            },
            {
                targets: [13],
                "data": null,
                "defaultContent": '<button id="btnCheck">Check</button>'
            },
            {
                targets: [14],
                "data": null,
                "defaultContent": '<button id="btnVerify">Verify</button>'
            }  

        ],
        select: {
            style:    'os',
            selector: 'td:first-child'
        },
        //"searching": true,
        //"columnDefs": [ { "orderable": false, "targets": [1,2,3,4,5,6] } ]
    });

    $('#allQueryTable tbody').on('click', 'button', function () {
        var data = t.row( $(this).parents('tr') ).data();
        // alert(this.id);
        var mhash = data[9];
        var blockNumber = data[6];
        var randomkey = data[10];
        var vkey = data[16];
        var status = data[2];
        console.log("Info about selected lottery event");
        console.log("Status", status);
        console.log("Mhash", mhash);
        console.log("blockNumber", blockNumber);
        console.log("Randomkey", randomkey);
        console.log("Verifiable RandomKey", vkey);

        if (status != "ANNOUNCED" && status != "CHECKED") {
            sweetAlert("Result is not available now! Please check the time");
            return;
        }

        if (this.id == "btnCheck") {
            btnCheckHandler(mhash, blockNumber, randomkey);
        } else if (this.id == "btnVerify") {
            btnVerifyHandler(mhash, blockNumber, randomkey, vkey);
        } else {
            sweetAlert("Error");
        }
    } );

    /* $('#button').click( function () {
        t.row('.selected').remove().draw( false );
    } ); */

    $('#allQueryTable tbody').on( 'click', 'tr', function () {
        console.log("clicked!");
        //alert( Object.keys(t.rows('.selected').data()[0]) +' row(s) selected' );
        console.log("this.id", this.id);
        $(this).toggleClass('selected');
        console.log( t.rows('.selected').data()[0]);
        var selectedRows = t.rows('.selected').data();
        var ManifestDiv = $('#ManifestDiv');
        var text = "";
        console.log("selected rows", selectedRows.length);
        for (var i = 0; i < selectedRows.length; ++i) {

            var eventName = selectedRows[i][1];
            var status = selectedRows[i][2];
            var issueDate = selectedRows[i][3];
            var dueDate = selectedRows[i][4];
            var announcementDate = selectedRows[i][5];
            var futureblock= selectedRows[i][6];
            var numOfMembers = selectedRows[i][7];
            var numOfWinners = selectedRows[i][8];
            var hash = selectedRows[i][9];
            var randomKey = selectedRows[i][10];
            var memberList = selectedRows[i][11];
            var script = selectedRows[i][12];
            var winnerList = selectedRows[i][15];
            var vkey = selectedRows[i][16];

            var formattedWinnerList = winnerList.split(",");
            var wtext = "";
            for (var j = 0; j < formattedWinnerList.length; ++j) {
                wtext += j + "th: " + formattedWinnerList[j];
                if (j != formattedWinnerList.length - 1) {
                    wtext += ",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
                }

            }

            console.log("WinnerList: ", winnerList);

            var formattedMemberList = memberList.split(",");
            console.log(formattedMemberList.length);

            var mtext = "";
            for (var j = 0; j < formattedMemberList.length; ++j) {
                mtext += formattedMemberList[j];

                if (j != formattedMemberList.length - 1) {
                    mtext += ",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
                }
            }
            text +=
                "Manifest " + hash
                + "<br>\{ <br> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;\"EventName\":&nbsp;\"" + eventName
                + "\",<br> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; \"Status\":&nbsp;\"" + status
                + "\",<br> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; \"IssueDate\":&nbsp;\"" + issueDate
                + "\",<br> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; \"DueDate\":&nbsp;\"" + dueDate
                + "\",<br> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; \"AnnouncementDate\":&nbsp;\"" + announcementDate
                + "\",<br> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; \"FutureBlockHeight\":&nbsp;\"" + futureblock
                + "\",<br> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; \"numOfMembers\":&nbsp;\"" + numOfMembers
                + "\",<br> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; \"numOfWinners\":&nbsp;\""+  numOfWinners
                + "\",<br> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; \"randomKey\":&nbsp;\"" + randomKey
                + "\",<br> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; \"MemberList\":&nbsp;\"" + mtext
                + "\",<br> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; \"WinnerList\":&nbsp;\"" + wtext
                + "\",<br> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; \"VerifiableKey\":&nbsp;\"" + vkey
                + "\",<br> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; \"script\":&nbsp;\"" + script
                + "\"<br>"
                + "\}<br><br>";
        }
        ManifestDiv.html(text); 
    })


    $('#SubscribeBtn').click( function () {
        //alert( t.rows('.selected').data() +' row(s) selected' );
        //alert( t.rows('.selected').data()[0]);
        //alert( Object.keys(t.rows('.selected').data()[0]) +' row(s) selected' );
        var txt;
        var selectedRows = t.rows('.selected').data();
        if (selectedRows.length == 0) {
            swal("Oops!", "Nothing to subscribe!. Check all the selected lotteries *REGISTERED* state", "error");
            return;
        }
        var subslists = "";
        for (var i = 0; i < selectedRows.length; ++i) {
            // Validation test 
            // Check the state is "REGISTERED"
            var currState = selectedRows[i][2];
            if (currState != "REGISTERED") {
                console.log("currState", currState);
                swal("Oops!", "Selected lottery is not possible to subscribe(state)", "error");
                return;
            }

            // Check number of members
            // 7: NumOfMembers, 11: MemberList
            var num_of_members = selectedRows[i][7];
            var member_list = selectedRows[i][11];
            var member_list_splited_num = member_list.split(",").length;
            console.log("number_of_members", num_of_members, member_list_splited_num);
            if (num_of_members <= member_list_splited_num) {
                swal("Oops!", "Selected lottery is not possible to subscribe(maximum members)", "error");
                return;
            }
            subslists += selectedRows[i][1] + "<br>";
        }

        swal({
            title: "Are you sure to subscribe selected event(s)?",
            text: subslists,
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes, I do!",
            closeOnConfirm: false,
            html: true
        }, function(){
            swal({
                title: "Your name is ...",
                text: '',
                type: 'input',
                showCancelButton: true,
                closeOnConfirm: true,
                animation: "slide-from-top"
            }, function(inputValue){
                // 0. 인자값 얻기
                // 1. ajax로 섭스크라이브 체인코드를 요청한 후에,
                // 2. 결과값 받고나서, 성공적이면,
                // 3. 매니페스트 다시 업데이트
                // var selectedRows = t.rows('.selected').data();

//                      <th></th>
//                    1  <th>Name</th>
//                    2  <th>Status</th>
//                    3  <th>Issue</th>
//                    4  <th>Due</th>
//                    5  <th>Announce</th>
//                    6  <th>Block</th>
//                    7 <th>Members</th>
//                    8 <th>Winners</th>
//                    9 <th>Hash</th>
//                    10 <th>RandomKey</th>
//                    11 <th>MemberList</th>
//                    12 <th>Script</th>
//                    13 <th>Check</th>
//                    14 <th>Verify</th>
                var memberName = inputValue;
                var allData = {};
                for (var i = 0; i < selectedRows.length; ++i) {
                    var mhash = selectedRows[i][9];
                    var currtimestamp = Math.floor( Date.now() / 1000)
                    var allData = {
                        "function_name" : "subscribe",
                        "mhash" : mhash,
                        "memberName" : memberName,
                        "currtimestamp" : currtimestamp,
                    };
                }
                var target = document.getElementById('allQueryTable');
                var spinner = new Spinner(spin_opts).spin(target);

                $.ajax({
                    url: hostAddress + "/subscribe",
                    type: "POST", 
                    data: allData,
                    success: function(responseData) {
                        console.log(memberName + "\'s sha256 of public key: ", responseData);

                        spinner.stop();
                        swal(memberName + "\'s sha256 of public key",responseData ,"success");
                    },
                    error: function() {
                        console.log("Ajax comm fails");
                        spinner.stop();
                        sweetAlert("Query all events failed")
                    }
                })
                console.log("You wrote", inputValue);
            });

            //            swal("Deleted!",
            //                "Your imaginary file has been deleted.",
            //                "success");
        });

        //var r = confirm("Are you sure to subscribe selected event(s)?");
    //    if (r == true) {
    //        txt = "You pressed OK!";
    //        var YourNameis = prompt("Your name?");

    //        $.ajax({
    //            url: "http://localhost:1185" + "/subscribe",
    //            type: "POST", 
    //            success: function(responseData) {

    //            },

    //            error: function() {
    //                console.log("Ajax comm fails");
    //                spinner.stop();
    //                alert("Query all events failed")
    //            }
    //        })

    //    }
    } );

    $("#SeeBtn").click(function() {
        console.log("request all events");

      var target = document.getElementById('allQueryTable');
      var spinner = new Spinner(spin_opts).spin(target);
        $.ajax({
            url: hostAddress + "/cc-query-all-events",
            type: "POST", 
            success: function(responseData) {
                var res = responseData.split("@");
                //var jobj = JSON.parse("{" + responseData + "}");
                var numOfPeer = 2
                res.splice(0, 1);
                for (var i = 0, l = res.length; i < l; i++) {
                    if (res[i][res[i].length - 1] == ',') {
                        //res[i] = res[i].substring(0, res[i].length - 2);
                        res[i] = res[i].slice(0, -1);
                    }

                }

                console.log(res[0]);
                console.log(res[1] );
                console.log(res[2] );
                console.log(res[3] );
                console.log(res[4] );
//                console.log(res[4] + "}");
                //console.log(res[2]);
                //console.log(res[3]);
                //console.dir(responseData);
                //console.log(typeof responseData);
                console.log("legnth(res): " + res.length);
                // 중복된 이벤트 지우기 위해 먼저 한번 클리어하고 다시 그림
                t.clear().draw();
                var currtimestamp = Math.floor(Date.now() / 1000);
                console.log("currtimestamp : " + currtimestamp);
                for (var i = 0; i < res.length  / numOfPeer; ++i) {
                    var obj = JSON.parse(res[i]);

                    console.log("[DEBUG] Before-Status: ",obj.Status);
                    if (obj.Status == "CHECKED") {
                        obj.Status = "CHECKED";
                    } else if (currtimestamp > obj.IssueDate && currtimestamp < obj.Duedate) {
                        console.log("obj.Duedate : " + obj.Duedate);
                        obj.Status = "REGISTERED";
                    } else if (currtimestamp > obj.Duedate &&
                              currtimestamp < obj.AnnouncementDate) {
                        obj.Status = "DUED";
                    } else if (currtimestamp > obj.AnnouncementDate) {
                        obj.Status = "ANNOUNCED";
                    }

                    console.log("[DEBUG] Status: ",obj.Status);
                    console.log("[DEBUG] AnnouncementDate : " + obj.AnnouncementDate);
                    /* if (obj.Status == 1) {
                        obj.Status = "REGISTERED";
                    } else if (obj.Status == 2) {
                        obj.Status = "DUED";
                    } else if (obj.Status == 3){
                        obj.Status = "ANNOUNCED";
                    } else {
                        obj.Status = "UNKNOWN ERROR";
                    } */

                    obj.Duedate = timestampToDatetime(obj.Duedate);
                    obj.IssueDate = timestampToDatetime(obj.IssueDate);
                    obj.AnnouncementDate = timestampToDatetime(obj.AnnouncementDate);
                    console.log("obj.WinnerList", obj.WinnerList);
                    obj.WinnerList = obj.WinnerList.trim().split(",");
                    for (var j = 0; j < obj.WinnerList.length; ++j) {
                        obj.WinnerList[j] = obj.WinnerList[j].trim();
                    }

                    obj.WinnerList = obj.WinnerList.join(",");
                    console.log("obj.WinnerList", obj.WinnerList);
                    console.log("obj.VerifiableRandomkey", obj.VerifiableRandomkey);
                    t.row.add([
                        "",  /* 0 */
                        obj.EventName,/*  1 */
                        obj.Status, /*  2 */
                        obj.IssueDate, /*  3 */
                        obj.Duedate, /*  4 */
                        obj.AnnouncementDate, /*   5 */
                        obj.FutureBlockHeight, /*   6 */
                        obj.NumOfMembers, /*  7 */
                        obj.NumOfWinners,/*  8 */
                        obj.InputHash,/*  9 */
                        obj.RandomKey, /* 10 */
                        obj.MemberList, /* 11 */
                        obj.Script, /* 12 */
                        "",  /* 13 */
                        "",  /* 14 */
                        obj.WinnerList, /* 15 */
                        obj.VerifiableRandomkey, /* 16 */
                    ]).draw(false)
                }
                //console.log(obj.EventName);
                //console.log(responseData[0].EventName);
                //console.log("response: " + JSON.stringify(responseData));
                spinner.stop();
                // generating table...
            },
            error: function(err) {
                console.log("Ajax comm fails");
                console.log(err);
                spinner.stop();
                sweetAlert("Query all events failed")
            }
        });
    });

    // https://stackoverflow.com/questions/19485353/function-to-convert-timestamp-to-human-date-in-javascript
    function timestampToDatetime(unixtime) {
        var dateTime = new Date(unixtime * 1000);
        var u = dateTime.toISOString().replace('T',' ');
        u = u.substring(0, u.length - 8);
        return u;

        /* return dateTime.toISOString(); // Returns "2013-05-31T11:54:44.000Z" */
        /* var u = new Date(unixtime*1000);

        return u.getUTCFullYear() +
            '-' + ('0' + u.getUTCMonth()).slice(-2) +
            '-' + ('0' + u.getUTCDate()).slice(-2) + 
            ' ' + ('0' + u.getUTCHours()).slice(-2) +
            ':' + ('0' + u.getUTCMinutes()).slice(-2); */
    }

    $("#EnrollmentForm").submit(function(event) {

        /* stop form from submitting normally */
        event.preventDefault();

        /* get the action attribute from the <form action=""> element */
        var $form = $( this ),
            url = $form.attr( 'action' );

        /* Send the data using post with element id name and name2*/
        var posting = $.post( url, {
            CAHostAddress: $('#CAHostAddress').val(),
            EnrollmentID: $('#EnrollmentID').val(),
            EnrollmentSecret: $('#EnrollmentSecret').val()
        } );

        /* Alerts the results */
        posting.done(function( data ) {
            sweetAlert(data);
        });
    });
});

function extractRandomness(blockNumber, randomKeyBitArray, mhash, key, option) {
    var blockBaseURL = "https://api.blockcypher.com/v1/btc/main/blocks/";
    console.log('url: ' + blockBaseURL + blockNumber);
    var target = document.getElementById('allQueryTable');
    var spinner = new Spinner(spin_opts).spin(target);

    // 1st block
    $.ajax(
        {
            type: 'GET',
            dataType: 'json',

            // for testing, use a hardcoded block
            url: blockBaseURL + blockNumber,
            // url: blockBaseURL + '329500',
            crossDomain:true,
            contentType: 'text/plain'
        }).done(function(json1)
            {
                var blockHash1 = json1.hash;
                console.log('blockHash1: ' + blockHash1);
                //console.log('randomKeyBitArray' + randomKeyBitArray);
                //console.log('is there a difference: ' + sjcl.codec.hex.toBits(randomKeyBitArray.toString(16)));
                // hmac의 해쉬 함수로는 디폴트로, sha256 사용됨
                var hmacOut1 = new sjcl.misc.hmac(randomKeyBitArray).encrypt(blockHash1);
                var randomBits1 = sjcl.bitArray.clamp(hmacOut1, 32);
                console.log('hmacOut32First: ' + randomBits1[0].toString(16));
                console.log('typeof hmacOut32First: ' + typeof randomBits1[0]);
                console.log(Object.keys(randomBits1));
                // console.log('hmacOut32Length: ' + sjcl.bitArray.bitLength(randomBits));

                // 2nd block
                $.ajax(
                    {
                        type: 'GET',
                        dataType: 'json',

                        // for testing, use a hardcoded block
                        url: blockBaseURL + (blockNumber - 1),
                        // url: blockBaseURL + '329499',
                        crossDomain:true,
                        contentType: 'text/plain'
                    }).done(function(json2)
                        {
                            var blockHash2 = json2.hash;
                            console.log('blockHash2: ' + blockHash2);
                            var hmacOut2 = new sjcl.misc.hmac(randomKeyBitArray).encrypt(blockHash2);
                            var randomBits2 = sjcl.bitArray.clamp(hmacOut2, 32);
                            console.log('hmacOut32Second: ' + randomBits2.toString(16));

                            // 3rd block
                            $.ajax(
                                {
                                    type: 'GET',
                                    dataType: 'json',

                                    // for testing, use a hardcoded block
                                    url: blockBaseURL + (blockNumber - 2),
                                    // url: blockBaseURL + '329498',
                                    crossDomain:true,
                                    contentType: 'text/plain'
                                }).done(function(json3)
                                    {
                                        var blockHash3 = json3.hash;
                                        console.log('blockHash3: ' + blockHash3);
                                        var hmacOut3 = new sjcl.misc.hmac(randomKeyBitArray).encrypt(blockHash3);
                                        var randomBits3 = sjcl.bitArray.clamp(hmacOut3, 32);
                                        console.log('hmacOut32Third: ' + randomBits3.toString(16));

                                        // 4th block
                                        $.ajax(
                                            {
                                                type: 'GET',
                                                dataType: 'json',

                                                // for testing, use a hardcoded block
                                                url: blockBaseURL + (blockNumber - 3),
                                                // url: blockBaseURL + '329497',
                                                crossDomain:true,
                                                contentType: 'text/plain'
                                            }).done(function(json4)
                                                {
                                                    var blockHash4 = json4.hash;
                                                    console.log('blockHash4: ' + blockHash4);
                                                    var hmacOut4 = new sjcl.misc.hmac(randomKeyBitArray).encrypt(blockHash4);
                                                    var randomBits4 = sjcl.bitArray.clamp(hmacOut4, 32);
                                                    console.log('hmacOut32Fourth: ' + randomBits4.toString(16));

                                                    var extractedRandomBits = sjcl.bitArray.concat(randomBits1, sjcl.bitArray.concat(randomBits2, sjcl.bitArray.concat(randomBits3, randomBits4)));
                                                    extractedRandomBits = extractedRandomBits
                                                    var extractedRandomBitsStr = "";

                                                    for (var i = 0; i < extractedRandomBits.length; ++i) {
                                                        extractedRandomBitsStr += extractedRandomBits[i];
                                                        if (i != extractedRandomBitsStr.length - 1) {
                                                            extractedRandomBitsStr += ",";
                                                        }
                                                    }
                                                    // selectLotteryWinnersDefault(randomBits, numParticipants, numWinners);
                                                    // return randomBits;

                                                    // var randomBits = extractRandomness(blockNumber, randomKeyBitArray);
                                                    console.log("128 random bits: " + extractedRandomBits);
                                                    console.log("128 bits' length: " + sjcl.bitArray.bitLength(extractedRandomBits));
                                                    if (option == "check") {
                                                        console.log("mhash", mhash);
                                                        console.log("VerifiableRandomkey", extractedRandomBits);
                                                        var allData = {
                                                            "function_name" : "check",
                                                            "mhash" : mhash,
                                                            "VerifiableRandomkey" : extractedRandomBitsStr
                                                        };


                                                        $.ajax({
                                                            url: hostAddress + "/check",
                                                            type: "POST", 
                                                            data: allData,
                                                            success: function(responseData) {
                                                                console.log(responseData);
                                                                spinner.stop();
                                                                swal("Winners are ", responseData ,"success");
                                                            },
                                                            error: function() {
                                                                console.log("Ajax comm fails");
                                                                spinner.stop();
                                                                sweetAlert("Check events failed")
                                                            }
                                                        })
                                                    } else if (option == "verify") {
                                                        console.log("OntheFly", typeof extractedRandomBitsStr, extractedRandomBitsStr);
                                                        console.log("Stored", typeof key, key);
                                                        var n = extractedRandomBitsStr.localeCompare(key);
                                                        console.log("localeCompare", n);
                                                        if (n == 0) {
                                                            swal("Consistent Randombit keys","success");
                                                        } else {
                                                            sweetAlert("Inconsistent randombit keys");
                                                        }
                                                        spinner.stop();

                                                    }
                                                    // return extractedRandomBits;
                                                    // while (randomBits === null)
                                                    // {
                                                    // 	setTimeout(function()
                                                    // 	{
                                                    // 		randomBits = extractRandomness(blockNumber, randomKeyBitArray);
                                                    // 	}, 2000);
                                                    // }

                                                }).fail(function(textStatus, error)
                                                    {
                                                        console.log('Error: ' + textStatus + ' ' + error);
                                                        spinner.stop();
                                                        return null;
                                                    });

                                    }).fail(function(textStatus, error)
                                        {
                                            console.log('Error: ' + textStatus + ' ' + error);
                                            spinner.stop();
                                            return null;
                                        });

                        }).fail(function(textStatus, error)
                            {
                                console.log('Error: ' + textStatus + ' ' + error);
                                spinner.stop();
                                return null;
                            });
            }).fail(function(textStatus, error)
                {
                    console.log('Error: ' + textStatus + ' ' + error);
                    spinner.stop();
                    return null;
                });
}

function btnCheckHandler(mhash, blockNumber, randomkey) {
    // Call "check" chaincode
    /* extractRandomness(blockNumber, randomkey, mhash,"" ,"check"); */

    var allData = {
        "function_name" : "check",
        "mhash" : mhash,
    };
    console.log("btnCheckHandler called");
    var target = document.getElementById('allQueryTable');
    var spinner = new Spinner(spin_opts).spin(target);
    $.ajax({
        url: hostAddress + "/check",
        type: "POST", 
        data: allData,
        success: function(responseData) {
            spinner.stop();
            swal("Results are available. Winners are ", responseData, "success");
        },
        error: function() {
            spinner.stop();
            sweetAlert("Check operation fails")
        }
    })

}

function btnVerifyHandler(mhash, blockNumber, randomkey, vkey) {
    console.log("btnVerifyHandler called");
    /* extractRandomness(blockNumber, randomkey, "", vkey, "verify"); */
    var allData = {
        "function_name" : "verify",
        "mhash" : mhash,
    };
    var target = document.getElementById('allQueryTable');
    var spinner = new Spinner(spin_opts).spin(target);
    $.ajax({
        url: hostAddress + "/verify",
        type: "POST", 
        data: allData,
        success: function(responseData) {
            spinner.stop();
            swal("Verify result", responseData, "success");
        },
        error: function() {
            spinner.stop();
            sweetAlert("Verify operation fails")
        }
    })
}

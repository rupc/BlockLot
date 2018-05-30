function update_manifest() {
    var eventName = $('#EventName').val();
    var datetime = $('#DateTime').val();
    var issueDate = $('#IssueDate').val();
    var announcementDate = $('#AnnouncementDate').val();
    var futureblock = $('#fblock').val();
    var numOfMembers = $('#numOfMembers').val();
    var numOfWinners = $('#numOfWinners').val();
    var randomKey = $('#RandomKey').val();
    var memberList = $('#MemberList').val();
    var concat = "" + eventName + datetime + issueDate + announcementDate + futureblock + numOfMembers + numOfWinners + randomKey/*  + memberList; */

    var hashOutputString = get_hash_hex_str(concat);

    var manifest = $('#manifest');

    manifest.html(
        "Manifest " + hashOutputString
        + "<br>\{ <br> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;\"EventName\":&nbsp;" + eventName
        + ",<br> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; \"IssueDate\":&nbsp;" + issueDate
        + ",<br> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; \"DueDate\":&nbsp;" + datetime
        + ",<br> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; \"AnnouncementDate\":&nbsp;" + announcementDate
        + ",<br> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; \"FutureBlock\":&nbsp;" + futureblock
        + ",<br> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; \"numOfMembers\":&nbsp;" + numOfMembers
        + ",<br> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; \"numOfWinners\":&nbsp;"+  numOfWinners
        + ",<br> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; \"randomKey\":&nbsp;" + randomKey
        // + ",<br> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; \"MemberList\":&nbsp;" + memberList
        + ", <br> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;\"script\": default script<br>"
        + "\}"
    );

    $("#manihash").val(hashOutputString);
}

function get_hash_hex_str(concat) {
    var input_hash = sjcl.hash.sha256.hash(concat);
    var hexOfHash = sjcl.codec.hex.fromBits(input_hash);
    var hashOutputString = hexOfHash.toString();
    console.log(hashOutputString);
    return hashOutputString;
}
// References https://nehakadam.github.io/DateTimePicker/
function datetimeToTimestamp(datetime) {
    var timestamp;
    var tmpdt = new Date(datetime);
    timestamp = tmpdt.getTime();
    return timestamp;
}

// References http://stackoverflow.com/questions/9035627/elegant-method-to-generate-array-of-random-dates-within-two-dates
function randomDate(start, end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// References http://stackoverflow.com/questions/10632346/how-to-format-a-date-in-mm-dd-yyyy-hhmmss-format-in-javascript
Number.prototype.padLeft = function(base,chr){
    var  len = (String(base || 10).length - String(this).length)+1;
    return len > 0? new Array(len).join(chr || '0')+this : this;
}

$(document).ready(function() {
    $('#EventName').focusout(update_manifest);
    $('#DateTime').focusout(update_manifest);            
    $('#fblock').focusout(update_manifest);            
    $('#numOfMembers').focusout(update_manifest);
    $('#numOfWinners').focusout(update_manifest);   
    $('#RandomKey').focusout(update_manifest);
    $('#MemberList').focusout(update_manifest);      
    update_manifest();
    

    //var target = document.getElementById('interface');
    //var spinner = new Spinner(opts).spin(target);
    $("#btn_rand").click(function() {
        // alert(get_random_name());
        var num = Math.floor((Math.random() * 30) + 1);
        var win_num = Math.floor((Math.random() * num) + 1);

        while (num == win_num || win_num == 0) {
            num = Math.floor((Math.random() * 30) + 1);
            win_num = Math.floor((Math.random() * num) + 1);
        }

        // Genearte random name strings
        var name_strings = [];
        for (var i = 0; i < num; i++) {
            name_strings.push(get_random_name());
        }

        var cryptorandom = new Uint32Array(4);
        window.crypto.getRandomValues(cryptorandom);
        var crypto_str = "";
        for (var i = 0; i < 4; ++i) {
            crypto_str += cryptorandom[i].toString();
        }
        var random_name = generateName();

        // randomDate(new Date(2012, 0, 1), new Date());
        var issueDate= new Date();
        var randomDueDate = randomDate(new Date(), new Date(2017, 12, 30));
        var randomAnnounceDate = randomDate(randomDueDate, new Date(2017, 12, 30));
        var issueDate 
        var rformat = function (rdate) {
            return [
                rdate.getFullYear(),
                (rdate.getMonth() + 1).padLeft(), 
                rdate.getDate().padLeft()
            ].join('-') + ' ' + 
                [
                    rdate.getHours().padLeft(),
                    rdate.getMinutes().padLeft()
                ].join(':');
        }
        // console.log(rformat());
        $("#EventName").val(random_name);
        $("#IssueDate").val(rformat(issueDate));
        $("#DateTime").val(rformat(randomDueDate));
        $("#AnnouncementDate").val(rformat(randomAnnounceDate));
        $("#numOfMembers").val(num);
        $("#numOfWinners").val(win_num);
        $("#RandomKey").val(crypto_str);
        $("#MemberList").val(name_strings);

        update_manifest();

        // Following assignment is used for "all in one"
        /* var objs = document.getElementsByName("create_lottery_event");
        objs[0].value = random_name;
        objs[1].value = rformat;
        objs[2].value = num;
        objs[3].value = win_num;
        objs[4].value = cryptorandom;
        objs[5].value = name_strings; */
    });

    $("#dtBox").DateTimePicker({
        dateTimeFormat: "yyyy-MM-dd hh:mm",
        formatHumanDate: function(oDate, sMode, sFormat)
        {
            if(sMode === "date")
                return oDate.dayShort + ", " + oDate.dd + " " + oDate.month+ ", " + oDate.yyyy;
            else if(sMode === "time")
                return oDate.HH + ":" + oDate.mm + ":" + oDate.ss;
            else if(sMode === "datetime")
                return oDate.yyyy + ", " + oDate.MM + " " + oDate.dd+ ", " + oDate.HH + ":" + oDate.mm + ":" + oDate.ss;
        }

    });

    // Form input validation check
    /* $("#btn_submit").submit(function(event) {
    }); */
});

function validateForm () {
    var pickedDatetime = datetimeToTimestamp($("#DateTime").val());
    var currentDatetime = new Date().getTime();
    console.log("picked timestamp: " + pickedDatetime);
    console.log("current timestamp: " + currentDatetime);  

    if (pickedDatetime < currentDatetime) {
        alert("Incorrect date/time. Impossible for openning lottery event with past date/time");
        return false;
    }


    if ($("#fblock").val() == '') {
        console.log("future block is empty!");
        alert("Future block is empty!");
        return false;
    }


    var numOfMembers = Number($("#numOfMembers").val());
    var numOfWinners = Number($("#numOfWinners").val());
    var MemberList = $("#MemberList").val();
    var MemberNum = MemberList.split(",").length
    var randomKey = $("#RandomKey").val();

    console.log("num of member: " + numOfMembers);
    console.log("num of winner: " + numOfWinners);
    console.log("member list: " + MemberList);
    console.log("num of MemberList variable: " + MemberNum);
    console.log("randomkey: " + randomKey);

    if (randomKey == '') {
        console.log("randomkey is empty");
        alert("Random Key is empty!");
        return false;
    }

    if (numOfWinners > numOfMembers) {
        alert("Incorrect input. Number of winners cannot exceed members");
        return false;
    }

    if (numOfMembers != MemberNum) {
        alert("Incorrect input. Number of members should match to member list");
        return false;
    }
}

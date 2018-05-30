var latestBlockURL = "https://blockchain.info/latestblock";
var otherURL = "https://blockchain.info/q/getblockcount";
var blockExplorerURL = "http://blockexplorer.com/q/getblockcount";
var blockcypherMainURL = "https://api.blockcypher.com/v1/btc/main";
var blockBaseURL = "https://api.blockcypher.com/v1/btc/main/blocks/";

var previous_datetime = [];

$(document).ready(function() {
    $("#btn_block").click(function() {
        console.log("hi");
        var datetime = $("#DateTime").val();

        if (datetime == '' || datetime == null) {
            console.log("You need to select date/time first");
            return;
        }
        datetime = $("#DateTime").val().split(' ');

        if (previous_datetime != null &&
            previous_datetime[0] === datetime[0] && 
            previous_datetime[1] === datetime[1]) {
            console.log("no need to calcualte...");
            return;
        } else {
            console.log(previous_datetime + " != " + datetime);
            console.log("need to calculate...");
            previous_datetime = datetime;
        }

        var due_date = datetime[0];
        var due_time = datetime[1];
        console.log(datetime);
        console.log(due_date);
        console.log(due_time);


        var block_num = getFutureBlockNum(due_date, due_time);

        /* $.ajax({
            url: _url,
            type: "POST", 
            success: function(responseData) {

            },
            error: function() {
            }
        }); */
        // update_manifest();
    });
});

function getFutureBlockNum(resultsDateVal, resultsTimeVal)
{

    $('#fblock').css("color", "yellow");
    $('#fblock').css("font-weight", "bold");
    $('#fblock').css("background-color", "silver").val("Calculating...");

/* resultsDateVal: 05/31/2017
bitcoinbeacon_create.js:541 resultsTimeVal: 1:00am
bitcoinbeacon_create.js:543 resultsTimeValFixed: 1:00 am */

	console.log("resultsDateVal: " + resultsDateVal);
	console.log("resultsTimeVal: " + resultsTimeVal);
	var resultsTimeValFixed = resultsTimeVal.slice(0, resultsTimeVal.length - 2) + " " + resultsTimeVal.slice(resultsTimeVal.length - 2);
	console.log("resultsTimeValFixed: " + resultsTimeValFixed);

	// get the latest block #
	// $.ajax(
	// {
	// 	type: 'GET',
	// 	dataType: "text",
	// 	url: otherURL,
	// }).done(function(text)
	// {
	// 	//console.log("API: " + json);
	// 	// console.log(data)
	// 	latestblockNum = parseInt(text);
	// 	console.log("latestBlockNum: " + text);
	// 	console.log(blockchainTestURL + latestblockNum);
	$.ajax(
	{
		type: 'GET',
		dataType: 'json',
		url: blockcypherMainURL,
		crossDomain:true,
		contentType: 'text/plain',
	}).done(function(json)
	{
		console.log("latest block: " + json.height);
		console.log("latest block time: " + json.time);
		console.log("parsed time: " + Date.parse(json.time));
		var latestblock = json.height;
		$.ajax(
		{
			dataType: "text",
			url: "https://blockchain.info/q/nextretarget",
		}).done(function(retargetText)
		{
			nextRetargetBlock = parseInt(retargetText);
			console.log("nextRetargetBlock: " + nextRetargetBlock);

			$.ajax(
			{
				type: 'GET',
				dataType: 'json',
				// this URL gets the time of the block 4 cycles ago
				url: blockBaseURL + (nextRetargetBlock - 10080),
				crossDomain:true,
				contentType: 'text/plain',
			}).done(function(oldBlockJSON)
			{
				var oldBlockTime = oldBlockJSON.time;
				// find the difference between the current time and specified time
				//var currentDate = new Date();
				//var currentDateMs = Date.parse(currentDate);
                console.log("DateFormat: " + resultsDateVal + " " + resultsTimeValFixed);
				var futureDateMs = Date.parse(resultsDateVal + " " + resultsTimeValFixed);

                // futureDateMs = futureDateMs - 54000000;
                // futureDateMs -= 39600000
				var currentBlockDate = Math.ceil(Date.parse(json.time));
				var oldBlockDate = Math.ceil(Date.parse(oldBlockTime));

				console.log("currentDateMs: " + currentBlockDate);
				console.log("oldBlockDate: " + oldBlockDate);
				// console.log(Date.parse("October 5 2014 1:35 AM"));
				console.log("futureDateMs:  " + futureDateMs);

				var difference = futureDateMs - currentBlockDate;
				var differenceMinutes = Math.ceil(difference / 60000);
				console.log("difference (ms): " + difference);
				console.log("difference (minutes): " + differenceMinutes);

				if (differenceMinutes < 0) {
					// futureBlockNum.stringVal = futureBlockNumber.toString();
					$('#futureBlockNumDisplay').html("The time provided is in the past! Please select a future time.").css("color", "red");
					return;
				}

				// calculate total time over the past 4 cycles and current cycle
				var totalTimeMinutes = (currentBlockDate - oldBlockDate) / 60000;
				var totalTimeAverage = totalTimeMinutes / (8064 + (json.height + 2016 - nextRetargetBlock));
				console.log(totalTimeAverage);

				/* we will use this total average as our scale parameter
				   the probability should be 0.01, to ensure 99% chance it does not
				   arrive before specified time */

				var differenceBlocks = Math.ceil(differenceMinutes / totalTimeAverage);
				console.log("difference (blocks): " + differenceBlocks);
				console.log("normal cdf: " + jStat.gamma.cdf(differenceMinutes, differenceBlocks, totalTimeAverage));

				var realDifferenceBlocks = differenceBlocks;
				var cdf = 1;
				for (; cdf > 0.01; realDifferenceBlocks++) {
					cdf = jStat.gamma.cdf(differenceMinutes, realDifferenceBlocks, totalTimeAverage);
					console.log("block #: " + realDifferenceBlocks + "new cdf: " + cdf);
				}

				console.log("actual block difference: " + realDifferenceBlocks);
				console.log("prob check: " + cdf);

				var futureBlockNumber = latestblock + realDifferenceBlocks;
				console.log("future block number: " + futureBlockNumber);
				console.log("prob check again: " + jStat.gamma.cdf(differenceMinutes, futureBlockNumber - latestblock, totalTimeAverage));
                futureBlockNum = {};
				futureBlockNum.stringVal = futureBlockNumber.toString();


				// if (futureBlockNumber <= nextRetargetBlock)
				// {
				// 	console.log("futureblock <= retargetblock");
				// }
				// else
				// {
				// 	diff = futureBlockNumber - nextRetargetBlock;
				// 	console.log("total retargets till this time: " + (1 + Math.floor(diff/2016)));
				// }
				// $('#futureBlockNumDisplay').html("Future block: " + futureBlockNumber + "<br> Estimated time till results available: " + new Date(currentBlockDate + 60000 * (realDifferenceBlocks * totalTimeAverage)));

				console.log("futureBlockNumReturned: " + futureBlockNum.stringVal);
				// updateManifests(randomKey);
                $('#fblock').css("background-color", "white");
                $('#fblock').css("color", "black");
                $("#fblock").val(futureBlockNum.stringVal);
                update_manifest();

                return futureBlockNum.stringVal;
			})
		}).fail(function(retargetTextStatus, error)
		{
			console.log("Error: " + retargetTextStatus + " " + error);
		});

	}).fail(function(textStatus, error)
	{
		console.log("Error: " + textStatus + " " + error);
	});
}

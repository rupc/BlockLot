function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function test_subscribe_generator(eventHash) {
    var allData = {
        "functionName" : "subscribe",
        "participantName" : "",
        "lotteryName" : "NA",
        "eventHash" : eventHash,
    };

    var maxConcurrentAjaxCalls = 17
    for (var i = 0; i < maxConcurrentAjaxCalls; ++i) {
        allData.participantName = "참여자" + i + " " + Math.random();
        console.log(allData.participantName);

        $.ajax({
            url: hostURL + "/subscribe",
            type: "POST", 
            data: allData,
            success: function(responseData) {
                console.log(responseData);
            },
            error: function() {
            }
        })
        await sleep(Math.random() * 10)
    }
}

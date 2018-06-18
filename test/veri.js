const crypto = require('crypto');
// const sha256 = crypto.createHash('sha256');
var sha256 = require('./sha256.js');

const hmac = crypto.createHmac('sha256', '134dsaf320jfdskafl3r82fhudiaho7348201hr');


var blockHash = "0000000000000000032484321432143214"
// hmac.update('0000000000000000032484321432143214');
// var verifiableRandomKey = hmac.digest('hex');
// console.log(verifiableRandomKey);
console.log(randomOracle(blockHash));

var winnerList = drawByFisherYatesShuffle(100, 2, blockHash);


for (var i = 0; i < winnerList.length; ++i) {
    console.log(winnerList[i]);
}

function randomOracle(randomSource) {
    var hash = sha256.array(randomSource);
    // var random = new Uint32Array(hash.slice(0, 4))[0];
    // var res = ((hash[1] << 4) | hash[0])
    var res = hash[0] + hash[1] + hash[2] + hash[3];
    // console.log(hash[0]);
    // console.log(hash[1]);
    // console.log(hash[2]);
    // console.log(hash[3]);
    // console.log(res);
    return res;
}

function drawByFisherYatesShuffle(numOfParticipants, numOfWinners, randomSource) {
    var participants = [];
    for (var i = 0; i < numOfParticipants; ++i) {
        participants[i] = i;
    }

    for (var j = participants.length - 1; j > 0; j--) {
        var k = randomOracle("" + j + randomSource + j) % numOfParticipants;
        console.log("rs", k);
        var temp = participants[j];
        participants[j] = participants[k];
        participants[k] = temp;
    }

    var winnerList = [];
    for (var i = 0; i < numOfWinners; ++i) {
        winnerList[i] = participants[i];
    }

    return winnerList;
}


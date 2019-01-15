var textRandomSourceVrfy="추첨에 사용되는 랜덤 소스의 무결성을 검증합니다. 블록체인의 블록들의 전/후 해시 관계를 사용하여, 타겟 블록과 그 전의 블록들의 해시 값에 변화를 검증합니다. 비트코인의 블록 해시는 (version, previousHash, merkle_root, timestamp, bits, nonce) 정보를 사용하여 계산됩니다. 이를 통해 랜덤 소스의 무결성을 검증할 수 있습니다."

var textInfoVrfy="추첨 행사 정보의 무결성을 검증합니다. 행사 등록 당시부터 추첨이 이뤄지기까지의 기록된 정보를 묶어 암호학적 해시 값을 생성하고 이를 추첨 당시에 생성된 해시 값과 비교합니다"

var textWinnerVrfy="사용자는 랜덤 소스, 참가자 명단, 우승자 수, 추첨 스크립트를 사용하여 당첨자를 다시 계산합니다. 그리고 당첨자 명단이 블록체인에 등록된 당첨자 명단과 일치하는지 확인합니다. 이를 통해 체인에 기록된 당첨자 명단이 올바른지 검증할 수 있습니다";

var textResponseVrfy="블록체인 장부를 지니고 있는 다수의 피어로부터 받은 응답 값들을 비교하여 검증합니다. 만약 일부 피어가 해킹당하여 블록체인의 상태가 조작 되었다면, 응답 값의 투표를 통해 가장 큰 표를 얻은 응답 값을 신뢰하는 방식으로 검증합니다. 이는 분산 장부(distributed ledger)의 특성을 활용하여 무결성을 검증하는 방법입니다. 아래는 현재 웹 서버와 연결된 피어 주소 목록입니다. 응답 받을 피어를 선택하세요."

var textStatVrfy="추첨 스크립트가 공평하게 추첨을 수행하는지 검사합니다. 악의적인 추첨 스크립트는 수학의 교묘한 특성을 활용하여 특정 번호를 유독 많이 선택하거나 랜덤 소스에 상관 없이 특정한 수를 선택할 수가 있습니다. 본 검증은 그러한 공격을 탐지하기 위함입니다."

var getBlockByHeight = function (blockHeight) {
    return "https://blockchain.info/ko/block-height/" + blockHeight + "?format=json";
}

// https://bitcoin.stackexchange.com/questions/46021/bitcoin-mining-block-structure/46024#46024
function vrfyRandomSource(targetBlock, num) {
    console.log("targetBlock", targetBlock);
    if (num == 0) {
        return;
    }

    var successFlag;
    // num = num - 1;
    // vrfyRandomSource(targetBlock - 1, num);

    var url = getBlockByHeight(targetBlock);
    var outputhtml = "";

    $.ajax({
        url: url,
        type: "GET", 
        dataType: 'json',
        contentType: 'text/plain',
        async: false,
        // crossDomain:true,
        success: function(responseData) {
            // var ver = parseHexString(changeEndianness((((responseData.blocks[0].ver)) >>> 0).toString(16)));

            var ver = parseHexString(changeEndianness(((responseData.blocks[0].ver) >>> 0).toString(16).lpad("0", 8)));

            var prevBlockHash = (responseData.blocks[0].prev_block);
            prevBlockHash = parseHexString(changeEndianness(prevBlockHash));

            var mrkl_root = responseData.blocks[0].mrkl_root;
            mrkl_root = parseHexString(changeEndianness(mrkl_root));

            var time = parseHexString(changeEndianness(((responseData.blocks[0].time) >>> 0).toString(16)));
            var bits = parseHexString(changeEndianness(((responseData.blocks[0].bits) >>> 0).toString(16)));
            var nonce = parseHexString(changeEndianness(((responseData.blocks[0].nonce) >>> 0).toString(16)));

            console.log("ver", toHexString(ver)); // correct
            console.log("prevBlockHash", toHexString(prevBlockHash));
            console.log("mrkl_root", toHexString(mrkl_root));
            console.log("time", toHexString(time));
            console.log("bits", toHexString(bits));
            console.log("nonce", toHexString(nonce));

            console.log("ver", (ver)); // correct
            console.log("prevBlockHash", (prevBlockHash));
            console.log("mrkl_root", (mrkl_root));
            console.log("time", (time));
            console.log("bits", (bits));
            console.log("nonce", (nonce));

            var blockHeader = 
                toHexString(ver           )     + 
                toHexString(prevBlockHash )    + 
                toHexString(mrkl_root     )    + 
                toHexString(time          )    + 
                toHexString(bits          )    + 
                toHexString(nonce         )    ;
            // var blockHeaderBin = ver + prevBlockHash + mrkl_root + time + bits + nonce;
            var blockHeaderBin = parseHexString(blockHeader);
            // var blockHeaderBin = parseHexString(changeEndianness(blockHeader));
            // var blockHeaderBin = new Uint8Array(numChars / 2);

            // var sample="01000030cd0594ebccfe15b205125165cc3b66986ed5b2a311cd8805000000000000000037022f7a3b9a2b199d53fbf1552be32c141892319966c3ef999d348d74cfb5827f476357a09b0518ae5ae1c1";
            // var blockHeaderBin = parseHexString(sample);

            // convert blockHeaderBin to little endian

            console.log("blockHeader", blockHeader);
            console.log("blockHeaderBin", blockHeaderBin);
            console.log("sha256(blockHeaderBin)", sha256.array(blockHeaderBin));
            console.log("sha256(sha256(blockHeaderBin))", sha256.array(sha256.array(blockHeaderBin)));
            console.log("(hex)sha256(sha256(blockHeaderBin))", toHexString(sha256.array(sha256.array(blockHeaderBin))));
            console.log("littleEndian((hex)sha256(sha256(blockHeaderBin)))", changeEndianness(toHexString(sha256.array(sha256.array(blockHeaderBin)))));
            // console.log("sha256(sha256(blockHeaderBin))", sha256(sha256(blockHeaderBin).array()));
            // console.log(sjcl.hash.sha256.hash(blockHeaderBin));
            // console.log(sjcl.hash.sha256.hash(sjcl.hash.sha256.hash(blockHeaderBin)));

            var bitArray = sjcl.hash.sha256.hash(sjcl.hash.sha256.hash(blockHeaderBin));  
            var digest_sha256 = sjcl.codec.hex.fromBits(bitArray);  

            var myHash = sha256(sha256(blockHeaderBin));

            // console.log(responseData);
            var currentHash = responseData.blocks[0].hash;
            var calculatedHash = changeEndianness(toHexString(sha256.array(sha256.array(blockHeaderBin))));

            console.log("currentHash", currentHash);
            console.log("calculatedHash", calculatedHash);
            outputhtml += "타겟 블록(" + targetBlock+ ")의 해시: <b><font color='BlueViolet'>" + currentHash + "</font></b><br>";
            outputhtml += "타겟 블록의 (ver, prevBlockHash, merkle_root, time, bits, nonce) 필드들로 계산된 해시: " + "(" 
                + toHexString(ver) + ", " + toHexString(prevBlockHash) + ", " 
                + toHexString(mrkl_root) + ", " + toHexString(time) + ", " 
                + toHexString(bits) + ", " + toHexString(nonce) + 
                "): " + "<b><font color='BlueViolet'>" + calculatedHash + "</font></b>";
            if (currentHash == calculatedHash) {
                console.log("Hash-chain integrity done!");
                outputhtml += "<br><b>두 해시가 서로 같습니다</b>";
                successFlag = true;
            } else {
                outputhtml += "<br><b>두 해시가 서로 다릅니다</b>";
                successFlag = false;
            }

            outputhtml += "<br>비트코인의 블록 해시 계산은 앞서 언급한 필드들의 little-endian을 연결하여 만든 블록 헤더(BlockHeader)에 두번의 SHA256 해시 함수를 적용하여 계산됩니다.<br>";
            outputhtml += "즉, <b>BlockHeader =<br>" + blockHeader + "</b><br>";
            outputhtml += "<font color='Blue'><b>SHA256(SHA256(BlockHeader))=" +
                calculatedHash +
                "</b></font>";

            // main work

        },
        error: function() {
            Swal("Fail");
        }
    });

    return {
        successFlag:successFlag,
        outputhtml : outputhtml
    };

}

function vrfyInfo(lottery) {
    var verifiableRandomKey = lottery.verifiableRandomKey;

    var vrfyBag = [];
    var successFlag;
    var outputhtml = "";

    vrfyBag[0] = lottery.name;
    // vrfyBag[1] = lottery.issueDate;
    // vrfyBag[2] = lottery.dueDate;
    // vrfyBag[3] = lottery.announceDate;
    vrfyBag[1] = lottery.numOfMembers;
    vrfyBag[2] = lottery.numOfWinners;
    vrfyBag[3] = lottery.participantList;
    vrfyBag[4] = lottery.randomKey;
    vrfyBag[5] = lottery.eventHash;
    vrfyBag[6] = lottery.targetBlock;
    vrfyBag[7] = lottery.winnerList
    vrfyBag[8] = lottery.script;
    vrfyBag[9] = lottery.lotteryNote;
    vrfyBag[10] = lottery.drawTxID;
    vrfyBag[11] = lottery.channelID;

    var details = JSON.stringify(lottery, null, 2);

    var concatenated = "";
    for (var i = 0; i < vrfyBag.length; ++i) {
        console.log(vrfyBag[i]);
        concatenated += vrfyBag[i];
    }

    var comp = sha256.hex(concatenated);
    console.log("verifiableRandomKey", verifiableRandomKey);
    console.log("calcualtedHash", comp);

    if (verifiableRandomKey == comp) {
        successFlag = true;
    } else {
        successFlag = false;
    }

    outputhtml = "행사 정보 무결성 검증은 행사 등록 당시의 정보와 추첨을 하기까지의 정보들을 사용하여 무결성을 검증합니다. 구체적으로 (행사 이름, 발행일, 마감일, 발표일, 참여자 수, 우승자 수, 참여자 명단, 랜덤 키, 이벤트 식별자, 타겟 블록, 우승자 수, 추첨 스크립트, 추첨 노트, 추첨 트랜잭션 ID, 채널 ID)에 대한 해시 값의 일정 여부를 검증합니다.";

    return {
        successFlag : successFlag,
        calculatedKey : comp,
        verifiableRandomKey : verifiableRandomKey,
        details : details,
    };
}

// 당첨자 검증
function vrfyWinner(lottery) {
    var successFlag = true;

    var numOfParticipants = lottery.numOfRegistered;
    var numOfWinners = lottery.numOfWinners;
    var targetBlock = lottery.targetBlock;
    var winnerListNames = lottery.winnerList;
    var participantList = lottery.participantList;

    console.log("numOfParticipants", numOfParticipants);
    console.log("numOfWinners", numOfWinners);
    console.log("targetBlock", targetBlock);
    console.log("winnerListNames", winnerListNames);
    console.log("participantList", participantList);

    var participantArray = participantList.split(",").filter(function(x) {
        return (x.length > 0) && (x !== (undefined || null || " " || ' ' || '' || ""));
    });

    var winnerListArray = winnerListNames.split(",").filter(function(x) {
        return (x.length > 0) && (x !== (undefined || null || " " || ' ' || '' || ""));
    });

    var url = getBlockByHeight(targetBlock);
    var calculatedWinnerList = [];
    var blockHash;
    var concatWinnerList = "";
    $.ajax({
        url: url,
        type: "GET", 
        dataType: 'json',
        contentType: 'text/plain',
        async: false,
        headers: {
            'Access-Control-Allow-Origin': '*'
        },
        crossDomain:true,
        success: function(responseData) {
            blockHash = responseData.blocks[0].hash;
            // calculated winners
            var winnerList = drawByFisherYatesShuffle(numOfParticipants, numOfWinners, blockHash);
            console.log(blockHash);


            for (var i = 0; i < numOfWinners; ++i) {
                console.log(participantArray[winnerList[i]], " vs ", winnerListArray[i]);
                if (participantArray[winnerList[i]] != winnerListArray[i]) {
                    successFlag = false;
                    break;
                }
                calculatedWinnerList.push(participantArray[winnerList[i]]);
            }

            for (var i = 0; i < winnerList.length; ++i) {
                console.log(winnerList[i], participantArray[winnerList[i]]);
                concatWinnerList += i+1 + ":" + participantArray[winnerList[i]] + ", ";
            }

            // successFlag = true;
        },
        error: function() {
            Swal("Fail");
        }
    });

    return {
        numOfParticipants : numOfParticipants,
        numOfWinners: numOfWinners,
        targetBlock : targetBlock,
        blockHash : blockHash,
        successFlag: successFlag,
        calculatedWinnerList: concatWinnerList,
        // concatWinnerList: concatWinnerList,
        winnerListArray: winnerListArray,
    };
}

function queryPeersForVrfy() {
    var peers;
    var numOfPeers;
    var outputhtml = "";
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
            peers = parsedJSON.peers;

            // Select subset of peers to get response
            numOfPeers = peers.length;
            console.log("numOfPeers: ", peers.length);
            for(var i = 0; i < peers.length; ++i) {
                outputhtml 
                    += "<div><input checked='checked' type='checkbox' id='" + peers[i] + "'>" +
                    "<label for=" + peers[i] + ">&nbsp;" + peers[i] + "</label></div>";
            }
        },
        error: function() {
            Swal("Fail");
        },
    });

    return {
        outputhtml : outputhtml,
        numOfPeers : numOfPeers,
        peers : peers,
    };
}

const changeEndianness = (string) => {
    const result = [];
    let len = string.length - 2;
    while (len >= 0) {
        result.push(string.substr(len, 2));
          len -= 2;
        }
        return result.join('');
}

function parseHexString(str) { 
    var result = [];
    // Ignore any trailing single digit; I don't know what your needs
    // are for this case, so you may want to throw an error or convert
    // the lone digit depending on your needs.
    while (str.length >= 2) { 
        result.push(parseInt(str.substring(0, 2), 16));
        str = str.substring(2, str.length);
    }

    return result;
}

function toHexString(byteArray) {
  return Array.from(byteArray, function(byte) {
    return ('0' + (byte & 0xFF).toString(16)).slice(-2);
  }).join('')
}

function buf2hex(buffer) { // buffer is an ArrayBuffer
  return Array.prototype.map.call(new Uint8Array(buffer), x => ('00' + x.toString(16)).slice(-2)).join('');
}

String.prototype.lpad = function(padString, length) {
    var str = this;
    while (str.length < length)
        str = padString + str;
    return str;
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

function drawbyIndexHashing(numOfParticipants, numOfWinners, randomSource) {
    // code from http://stackoverflow.com/questions/5199901/how-to-sort-an-associative-array-by-its-values-in-javascript
    var tuples = [];
    var indexHash = 0;
    var concatenated = "";
    for (var i = 0; i < numOfParticipants; i++) {
        concatenated = randomSource + "" + i;
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

function randomOracle(randomSource) {
    var hash = sha256.array(randomSource);
    var res = hash[0] + hash[1] + hash[2] + hash[3];
    return res;
}

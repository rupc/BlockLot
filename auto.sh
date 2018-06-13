# TOKEN에 최신 토큰 받아와서 아래에 넣어주기.
# TOKEN="Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE1NjQ3NjkzNTgsInVzZXJuYW1lIjoiTG90dGVyeVNlcnZlciIsIm9yZ05hbWUiOiJPcmcxIiwiaWF0IjoxNTI4NzY5MzU4fQ.uPYpLGQaIWvqJ-SIRm4M38Enn5m4iWhn-WK2p0t_WGA"
TOKEN=$(head TOKEN)
echo $TOKEN
chaincodeName="lottery"
chaincodeVersion="v0"
chaincodeType="golang"
chaincodePath="github.com/lottery_cc"
channelName="mychannel"

peers="[\"peer0.org1.example.com\",
        \"peer1.org1.example.com\",
        \"peer2.org1.example.com\",
        \"peer3.org1.example.com\",
        \"peer4.org1.example.com\",
        \"peer5.org1.example.com\",
        \"peer6.org1.example.com\"
        ]"

function createChannels() {
    curl -s -X POST \
        http://localhost:4000/channels \
        -H "authorization: $TOKEN" \
        -H "content-type: application/json" \
        -d '{
            "channelName":"mychannel",
            "channelConfigPath":"../artifacts/channel/mychannel.tx"
        }'  
}

function joinChannel() {
    reqBody="{
        \"peers\": $peers
    }"
    curl -s -X POST \
        http://localhost:4000/channels/mychannel/peers \
        -H "authorization: $TOKEN" \
        -H "content-type: application/json" \
        -d "$reqBody"
}

function chaincodesInstall() {
    reqBody="{
        \"chaincodeName\":\"$chaincodeName\",
        \"chaincodePath\":\"$chaincodePath\",
        \"chaincodeType\": \"$chaincodeType\",
        \"chaincodeVersion\":\"$chaincodeVersion\",
        \"peers\": $peers
    }"
    curl -s -X POST \
        http://localhost:4000/chaincodes \
        -H "authorization: $TOKEN" \
        -H "content-type: application/json" \
        -d "$reqBody"
}

function chaincodesInstantiate() {
    reqBody="{
        \"chaincodeName\":\"$chaincodeName\",
        \"chaincodeType\": \"$chaincodeType\",
        \"chaincodeVersion\":\"$chaincodeVersion\",
        \"peers\": $peers,
        \"args\":[\"\"]
    }"
    curl -s -X POST \
        http://localhost:4000/channels/mychannel/chaincodes \
        -H "authorization: $TOKEN" \
        -H "content-type: application/json" \
        -d "$reqBody"
}

function chaincodesUpgrade() {
    reqBody="{
        \"chaincodeName\":\"$chaincodeName\",
        \"chaincodeType\": \"$chaincodeType\",
        \"chaincodeVersion\":\"$chaincodeVersion\",
        \"peers\": $peers,
        \"args\":[\"\"]
    }"
    curl -s -X POST \
        http://localhost:4000/channels/mychannel/chaincodes/upgrade \
        -H "authorization: $TOKEN" \
        -H "content-type: application/json" \
        -d "$reqBody"
}

# Query pre-registered lottery
function chaincodeQuery() {
    # fcn="query_lottery_event_hash"
    fcn="invoke"
    # args="[\"query_lottery_event_hash\"]"
    args="query_lottery_event_hash\",\"6b60d2b794832322312lf44d479fd7c634eaf8e3r96e723d5d2224c9222222d1"
    # args="[\"query_lottery_event_hash\",\"6b60d2b794832322312lf44d479fd7c634eaf8e3r96e723d5d2224c9222222d1\"]"
    curl -s -X GET \
        "http://localhost:4000/channels/$channelName/chaincodes/$chaincodeName?peer=peer3.org1.example.com&fcn=$fcn&args=%5B%22"$args"%22%5D" \
        -H "authorization: $TOKEN" \
        -H "content-type: application/json"

}

# createChannels
# joinChannel
# chaincodesInstall
# chaincodesInstantiate
# chaincodesUpgrade
chaincodeQuery

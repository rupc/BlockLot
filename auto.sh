# TOKEN에 최신 토큰 받아와서 아래에 넣어주기.
TOKEN="Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE1Mjg0MjEyNzIsInVzZXJuYW1lIjoiTG90dGVyeVNlcnZlciIsIm9yZ05hbWUiOiJPcmcxIiwiaWF0IjoxNTI4Mzg1MjcyfQ.bvwOukX4nHLkGVFErw_FrwcHYC6CyPxpXsUQf0jE7Bg"


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
    curl -s -X POST \
        http://localhost:4000/channels/mychannel/peers \
        -H "authorization: $TOKEN" \
        -H "content-type: application/json" \
        -d '{
            "peers": ["peer0.org1.example.com","peer1.org1.example.com"]
        }' 
}

function chaincodesInstall() {
    curl -s -X POST \
        http://localhost:4000/chaincodes \
        -H "authorization: $TOKEN" \
        -H "content-type: application/json" \
        -d '{
            "peers": ["peer0.org1.example.com","peer1.org1.example.com"],
            "chaincodeName":"lottery",
            "chaincodePath":"github.com/lottery_cc",
            "chaincodeType": "golang",
            "chaincodeVersion":"v0"
        }'
}

function chaincodesInstantiate() {
    curl -s -X POST \
        http://localhost:4000/channels/mychannel/chaincodes \
        -H "authorization: $TOKEN" \
        -H "content-type: application/json" \
        -d '{
            "peers": ["peer0.org1.example.com","peer1.org1.example.com"],
            "chaincodeName":"lottery",
            "chaincodeVersion":"v0",
            "chaincodeType": "golang",
            "args":[""]
        }'
}

function chaincodesUpgrade() {
    curl -s -X POST \
        http://localhost:4000/channels/mychannel/chaincodes/upgrade \
        -H "authorization: $TOKEN" \
        -H "content-type: application/json" \
        -d '{
            "peers": ["peer0.org1.example.com","peer1.org1.example.com"],
            "chaincodeName":"lottery",
            "chaincodeVersion":"v0",
            "chaincodeType": "golang",
            "args":[""]
        }'
}


createChannels
joinChannel
chaincodesInstall
chaincodesInstantiate
# chaincodesUpgrade


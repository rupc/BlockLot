# TOKEN에 최신 토큰 받아와서 아래에 넣어주기.
TOKEN="Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE1MjcyNjk5OTYsInVzZXJuYW1lIjoiTG90dGVyeVNlcnZlciIsIm9yZ05hbWUiOiJPcmcxIiwiaWF0IjoxNTI3MjMzOTk2fQ.YKPWQHqz8bT7MjFHBBS1E1Lao6LBtbS2btlTbTwWwkw"

curl -s -X POST \
  http://localhost:4000/channels \
  -H "authorization: $TOKEN" \
  -H "content-type: application/json" \
  -d '{
	"channelName":"mychannel",
	"channelConfigPath":"../artifacts/channel/mychannel.tx"
}'  

curl -s -X POST \
  http://localhost:4000/channels/mychannel/peers \
  -H "authorization: $TOKEN" \
  -H "content-type: application/json" \
  -d '{
	"peers": ["peer0.org1.example.com","peer1.org1.example.com"]
}' 


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


curl -s -X POST \
  http://localhost:4000/channels/mychannel/peers \
  -H "authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE1Mjc5ODUxNTksInVzZXJuYW1lIjoiTG90dGVyeVNlcnZlciIsIm9yZ05hbWUiOiJPcmcxIiwiaWF0IjoxNTI3OTQ5MTU5fQ.g3ZUEw3v345VL4KzV4dKlE_dB1zODHfiKT6UYdcYhkM" \
  -H "content-type: application/json" \
  -d '{
	"peers": ["peer2.org1.example.com","peer3.org1.example.com","peer4.org1.example.com","peer5.org1.example.com","peer6.org1.example.com"] 
}'

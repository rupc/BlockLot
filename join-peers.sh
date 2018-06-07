curl -s -X POST \
  http://localhost:4000/channels/mychannel/peers \
  -H "authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE1Mjg0MDg3NDAsInVzZXJuYW1lIjoiTG90dGVyeVNlcnZlciIsIm9yZ05hbWUiOiJPcmcxIiwiaWF0IjoxNTI4MzcyNzQwfQ._YcNUAWaUki_oOgy3jRysezxAW-CeL_r-R_dn35fiII" \
  -H "content-type: application/json" \
  -d '{
	"peers": ["peer2.org1.example.com","peer3.org1.example.com","peer4.org1.example.com","peer5.org1.example.com","peer6.org1.example.com"] 
}'

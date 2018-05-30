package main

import (
    // "strconv"
    "encoding/json"
    "bytes"
    "encoding/gob"
    "fmt"
    // "encoding/json"
    "github.com/hyperledger/fabric/core/chaincode/shim"
    pb "github.com/hyperledger/fabric/protos/peer"
)

func (t *SimpleChaincode) query_all_lottery_event_hash(stub shim.ChaincodeStubInterface, args []string) pb.Response {
    fmt.Println("Invoke - query_all_lottery_event_hash")
    // get num of event
    /* numOfEvents := GetStateInt(stub, "numOfEvents")
    fmt.Printf("Number of Events: %d\n", numOfEvents) */
    keysIter, _ := stub.GetStateByRange("","")
    defer keysIter.Close()

    var keys []string
    // kv := make(map[string]string)
    var values []byte
    var le lottery_event
    for keysIter.HasNext() {
        KV, err := keysIter.Next()
        key := KV.Key
        value := KV.Value
        // key, value, err := keysIter.Next()
        // key, value, err := keysIter.Next()
        if err != nil {
            return shim.Error(err.Error())
        }
        // fmt.Printf("%s\n", value)
        // keys = append(keys, KV.Key)
        // err = json.Unmarshal(KV.Value, &le)
        keys = append(keys, key)
        err = json.Unmarshal(value, &le)
        if le.InputHash != "" {
            values = append(values, '@') // used for split string
            // values = append(values, KV.Value...)
            values = append(values, value...)
        }
    }

    buf := &bytes.Buffer{}
    gob.NewEncoder(buf).Encode(keys)
    bs := buf.Bytes()
    fmt.Printf("%q", bs)
    return shim.Success(values)
    // return shim.Success(bs)
}

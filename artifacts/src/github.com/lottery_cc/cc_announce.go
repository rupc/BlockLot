package main

import (
    "strconv"
    "fmt"
    "encoding/json"
    "github.com/hyperledger/fabric/core/chaincode/shim"
    pb "github.com/hyperledger/fabric/protos/peer"
)

// args: (0:function name, 1:hash, 2:member name, 3:current time(tiemstamp))
func (t *SimpleChaincode) announce_event(stub shim.ChaincodeStubInterface, args []string) pb.Response {
    fmt.Println("Invoke - subscribe")
    const numOfArgs = 4
    if len(args) != numOfArgs {
        return shim.Error("Incorrect number of arguments. Expecting 11 including function name");
    }

    for idx, val := range(args) {
        fmt.Printf("args[%d]: s%\n", idx, val)
    }

    // check if event hash is validate one
    validateHash, _ := stub.GetState(args[1])
    if validateHash == nil {
       return shim.Error("No event has that hash")
    }

    var le lottery_event;
    err := json.Unmarshal(validateHash, &le)
    if err != nil {
        return shim.Error("lottery event Marshaling fails")
    }

    // compare current time and due date
    iCurr, _ := strconv.Atoi(args[3])
    iDue, _ := strconv.Atoi(le.Duedate)

    if iDue <= iCurr {
        return shim.Error("Current time have passed through due date")
    }

    // add member to lottery event
    if le.MemberList == "UNDEFINED" {
        le.MemberList = args[2]
    } else {
        le.MemberList += "," + args[2]
    }
    fmt.Printf("%v\n", le)

    // Update lottery event
    jsonBytes, err := json.Marshal(le)
    if err != nil {
        return shim.Error("lottery event Marshaling fails")
    }

    err = stub.PutState(le.InputHash, jsonBytes)

    return shim.Success(jsonBytes)

}

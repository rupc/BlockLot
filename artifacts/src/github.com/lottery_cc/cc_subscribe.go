package main

import (
	"encoding/json"
	"strconv" // "fmt"
	"strings"

	"github.com/hyperledger/fabric/core/chaincode/shim"
	pb "github.com/hyperledger/fabric/protos/peer"
)

// args: (0:function name, 1:Event hash, 2:member name, 3:current time(tiemstamp))
// Add one member to lottery event specified by manifest hash
func (t *SimpleChaincode) subscribe(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	logger.Info("Invoke - subscribe")
	const numOfArgs = 4
	if len(args) != numOfArgs {
		return shim.Error("Incorrect number of arguments. Expecting 4 including function name")
	}

	for idx, val := range args {
		logger.Info("args[%d]: s%\n", idx, val)
	}

	// check if event hash is validate one
	validateHash, _ := stub.GetState(args[1])
	if validateHash == nil {
		return shim.Error("No event has that hash")
	}

	var le lottery_event
	err := json.Unmarshal(validateHash, &le)
	if err != nil {
		return shim.Error("lottery event Marshaling fails")
	}

	// Check member already registered
	if strings.Contains(args[2], le.MemberList) == true {
		shim.Error("Already registered member")
	}

	// Compare current time and due date
	iCurr, _ := strconv.Atoi(args[3])
	iDue, _ := strconv.Atoi(le.Duedate)
	if iDue <= iCurr {
		logger.Warning("Current time have passed through due date")
		// return shim.Error("Current time have passed through due date")
	}

	// Get the number of current member list
	var currOfMembers int
	if le.MemberList == "UNDEFINED" {
		currOfMembers = 0
	} else {
		currOfMembers = len(strings.Split(",", le.MemberList))
	}

	logger.Info("currOfMembers: %d\n", currOfMembers)
	// Check the number of members exceeds max#
	maxMembers, _ := strconv.Atoi(le.NumOfMembers)
	if !(currOfMembers < maxMembers) {
		return shim.Error("Maximum members registered")
	}

	// Add a member to lottery event and update registered num
	if le.MemberList == "UNDEFINED" {
		le.MemberList = args[2]
	} else {
		// Before adding, check duplicate participation by its provided name
		if CheckDuplica(le.MemberList, args[2]) {
			return shim.Error("Disallow duplicate participation")
		}
		le.MemberList += "," + args[2]
	}

	// Remove redundant double-commas
	strings.Replace(le.MemberList, ",,", "", -1)
	kRegisted := strings.Count(le.MemberList, ",") + 1

	// kRegisted, err := strconv.Atoi(le.NumOfRegistered)
	le.NumOfRegistered = strconv.Itoa(kRegisted)

	logger.Info("NumOfRegistered: %s\n", le.NumOfRegistered)

	subscribeTxID := stub.GetTxID()
	if le.SubscribeTxIDs == "UNDEFINED" {
		le.SubscribeTxIDs = subscribeTxID
	} else {
		le.SubscribeTxIDs += "," + subscribeTxID
	}

	logger.Info("%v\n", le)

	// Update lottery event
	jsonBytes, err := json.Marshal(le)
	if err != nil {
		return shim.Error("lottery event Marshaling fails")
	}
	err = stub.PutState(le.InputHash, jsonBytes)

	return shim.Success(jsonBytes)
}

// On duplica, return true, else return false
func CheckDuplica(mlist, m string) bool {
	members := strings.Split(mlist, ",")
	for _, v := range members {
		if v == m {
			return true
		}
	}
	return false
}

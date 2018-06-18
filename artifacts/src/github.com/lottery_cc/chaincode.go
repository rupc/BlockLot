package main

import (
    // "os"
    // "bufio"
    // "math"
    // "math/big"
    // "crypto/rand"
    // "crypto/hmac"
    // "encoding/binary"
    // "encoding/hex"
    // "bytes"
    "math/rand"
    // "bufio"
    // "os"
    // "net/http"
    "strings"
    // "io/ioutil"
    // "github.com/tidwall/gjson"
    // gostat "github.com/ematvey/gostat"
    // "crypto/md5"
    // "encoding/binary"
    "time"
    // "sort"
    // "sync"
    "strconv"
    "crypto/sha256"
    "fmt"
    "encoding/json"
    "github.com/hyperledger/fabric/core/chaincode/shim"
    pb "github.com/hyperledger/fabric/protos/peer"

    // "github.com/robertkrimen/otto"
)

var logger = shim.NewLogger("LotteryCC")
const (
    REGISTERED = 1
    DUED = 2
    ANNOUNCED = 3
    CHECKED = 4
    MAX_EVENTS  = 10
)

type lottery_event struct {
    Status         string `json:Status`
    EventName       string `json:EventName`
    IssueDate       string `json:IssueDate`
	Duedate         string	`json:"Duedate"`  // UNIX timestamp
	AnnouncementDate string	`json:"AnnouncementDate"`  // UNIX timestamp
	NumOfMembers    string	`json:"NumOfMembers"` // Max number of members
	NumOfWinners    string	`json:"NumOfWinners"`
    NumOfRegistered string `json:"NumOfRegistered"` // Number of registerd members
	MemberList      string	`json:"MemberList"` // Comma seperated member list, Its size should be equal to the NumOfRegistered
    RandomKey       string `json:"RandomKey"` // This is from input, so it's not non-deterministic
    InputHash       string `json:"InputHash"` // built from eventname, duedate, num of members, winners and member list, randomkey from server
    FutureBlockHeight string `json:"FutureBlockHeight"`
    WinnerList      string `json:"WinnerList"` // comma seperated winner list
    Script          string `json:"Script"` // script text for draw()
    VerifiableRandomkey string `json:"VerifiableRandomkey"`
    LotteryNote string `json:"LotteryNote"`
    DrawTxID string `json:"DrawTxID"`
    DrawTxTimestamp string `json:"DrawTxTimestamp"`
    OpenTxID string `json:"OpenTxID"`
    OpenTxTimestamp string `json:"OpenTxTimestamp"`
    SubscribeTxIDs string `json:"SubscribeTxID"` // comma seperated txids
    ChannelID string `json:"ChannelID"`
    OpenClientIdentity string `json:"OpenClientIdentity"` // Client identity who open the lottery
}

func (l lottery_event) GetAllConcats() string {
    var allConCats string = ""
    allConCats = l.EventName +
                // + l.IssueDate
                // + l.Duedate
                // + l.AnnouncementDate
                l.NumOfMembers +
                l.NumOfWinners +
                l.MemberList +
                l.RandomKey +
                l.InputHash +
                l.FutureBlockHeight +
                l.WinnerList +
                l.Script +
                l.LotteryNote +
                l.DrawTxID +
                l.ChannelID
    logger.Debug("eventName", l.EventName)
    logger.Debug("NumOfMembers", l.NumOfMembers)
    logger.Debug("NumOfWinners", l.NumOfWinners)
    logger.Debug("MemberList", l.MemberList)
    logger.Debug("RandomKey", l.RandomKey)
    logger.Debug("InputHash", l.InputHash)
    logger.Debug("targetBlock", l.FutureBlockHeight)
    logger.Debug("winnerList", l.WinnerList)
    logger.Debug("script", l.Script)
    logger.Debug("lotteryNote", l.LotteryNote)
    logger.Debug("drawTxID", l.DrawTxID)
    logger.Debug("channelID", l.ChannelID)

    return allConCats
}

// Do sha256 all concatenated strings
// 바이트 단위인가?
func (l lottery_event) GetVerifiableRandomKeyfromLottery() string {
    var allConCats = l.GetAllConcats()
    h := sha256.New()
    h.Write([]byte(allConCats))
    return fmt.Sprintf("%x", h.Sum(nil))
}

type SimpleChaincode struct {

}

func (t *SimpleChaincode) Invoke(stub shim.ChaincodeStubInterface) pb.Response {
	logger.Info("Blockchain Lottery Chaincode! invoke method###")
	function, args := stub.GetFunctionAndParameters()
	logger.Info("Invoked method is "+args[0])

	if function != "invoke" {
        return shim.Error("Unknown function call: " + function)
    }

	if args[0] == "create_lottery_event" {
		return t.create_lottery_event(stub, args)
	}

    if args[0] == "create_lottery_event_hash" {
        return t.create_lottery_event_hash(stub, args)
    }

    if args[0] == "query_lottery_event_hash" {
        return t.query_lottery_event_hash(stub, args)
    }

	if args[0] == "query_lottery_event" {
		return t.query_lottery_event(stub, args)
	}

	if args[0] == "create_target_block" {
		return t.create_target_block(stub, args)
	}

	if args[0] == "query_target_block" {
		return t.query_target_block(stub, args)
	}

	if args[0] == "draw" {
		return t.draw(stub, args)
	}

	if args[0] == "query_checkif_winner" {
		return t.query_checkif_winner(stub, args)
	}

	if args[0] == "query_winner" {
		return t.query_winner(stub, args)
	}

	if args[0] == "query_all_lottery_event_hash" {
		return t.query_all_lottery_event_hash(stub, args)
	}

	if args[0] == "subscribe" {
		// Creates a complete purchase order from its state
		return t.subscribe(stub, args)
	}

	if args[0] == "close_event" {
		// Creates a complete purchase order from its state
		return t.close_event(stub, args)
	}

	if args[0] == "check" {
		// check is another name of draw
		return t.draw(stub, args)
	}

    if args[0] == "verify" {
        return t.verify_result(stub, args)
    }

    if args[0] == "test_networkaccess" {
        return t.test_networkaccess(stub, args)
    }

    if args[0] == "testRandomnessDifferentKeys" {
        return t.test_randomness(stub, args)
    }

    if args[0] == "testRandomnessDifferentKeys" {
        return t.testRandomnessDifferentKeys(stub, args)
    }

	return shim.Error("Unknown Invoke Method")
}

// create_lottery_event_hash use manifest hash as search key
// arg0: function name
// arg1: manifest hash
// arg2: event name
// arg3: issue date/time, unixtime stamp, not milisecond
// arg4: due date/time, unixtime stamp, not milisecond
// arg5: announcement date/time, unixtime stamp, not milisecond
// arg6: future block number
// arg7: number of members
// arg8: number of winners
// arg9: random key
// arg10: script
// arg11: lotteryNote
// TODO: arg11 would be list of presents 
func (t *SimpleChaincode) create_lottery_event_hash(stub shim.ChaincodeStubInterface, args []string) pb.Response {
    logger.Info("Invoke - create_lottery_event_hash")

    const numOfArgs = 12
    if len(args) != numOfArgs {
        return shim.Error("Incorrect number of arguments. Expecting 11 including function name");
    }

    for idx, val := range(args) {
        logger.Info("args[%d]: s%\n", idx, val)
    }

    already, _ := stub.GetState(args[1])
    if len(already) != 0 {
       return shim.Error("Same manifest hash error, use different manifest hash to register event")
    }

    openTxID := stub.GetTxID()
    chanID := stub.GetChannelID()

    le := lottery_event {
        Status: "REGISTERED",
        InputHash: args[1],
        EventName: args[2],
        IssueDate: args[3],
        Duedate: args[4],
        AnnouncementDate: args[5],
        FutureBlockHeight: args[6],
        NumOfRegistered: "0",
        NumOfMembers: args[7],
        NumOfWinners: args[8],
        RandomKey: args[9],
        MemberList: "UNDEFINED",
        WinnerList: "UNDEFINED",
        Script: args[10],
        LotteryNote: args[11],
        OpenTxID: openTxID,
        ChannelID: chanID,
        DrawTxID: "UNDEFINED",
        SubscribeTxIDs: "UNDEFINED",
    }

    jsonBytes, err := json.Marshal(le)
    if err != nil {
        return shim.Error("lottery event Marshaling fails")
    }

    logger.Info("%v\n", le)

    // Insert a lottery event
    err = stub.PutState(le.InputHash, jsonBytes)

    // Update event count: might be useless
    /* var numOfEvents int
    numOfEventsJsonBytes, _ := stub.GetState("numOfEvents")
    if numOfEventsJsonBytes == nil {
        logger.Info("Event count is 0, first event created\n")
        numOfEvents = 0
    }
    err = json.Unmarshal(numOfEventsJsonBytes, &numOfEvents)
    numOfEvents++;
    numOfEventsJsonBytes, _ = json.Marshal(numOfEvents)
    err = stub.PutState("numOfEvents", numOfEventsJsonBytes)
    logger.Info("Number of lottery event: %d\n", numOfEvents)

    // Add a new event to new list
    var events [MAX_EVENTS]lottery_event // needed to update later to dynamically adjust it
    // events := make([]lottery_event,)
    eventsJsonBytes, _ := stub.GetState("events")
    if eventsJsonBytes == nil {
        logger.Info("Added to event list for the first time")
    }
    err = json.Unmarshal(eventsJsonBytes, &events)
    events[len(events) - 1] = le
    eventsJsonBytes, err = json.Marshal(events)
    err = stub.PutState("events", eventsJsonBytes)
    logger.Info("Added to event list") */


    if err != nil {
        return shim.Error(err.Error())
    }

    return shim.Success(nil)
}

func GetStateInt(stub shim.ChaincodeStubInterface, key string) int {
    var i int
    jsonbytes, err := stub.GetState(key)
    if jsonbytes == nil {
        return -1
    }
    json.Unmarshal(jsonbytes, &i)
    if err != nil {
        return -1
    }
    return i
}

func GetEventListsBytes(stub shim.ChaincodeStubInterface) []byte {
    var events [MAX_EVENTS]lottery_event // needed to update later to dynamically adjust it
    jsonbytes, err := stub.GetState("events")

    json.Unmarshal(jsonbytes, &events)
    logger.Info("%v\n", events)
    if err != nil {
        return nil
    }

    return jsonbytes
}

func (t *SimpleChaincode) query_lottery_event_hash(stub shim.ChaincodeStubInterface, args []string) pb.Response {
    logger.Info("Invoke - query_lottery_event_hash")
    const numOfArgs = 2
    if len(args) != numOfArgs {
        return shim.Error("Incorrect number of arguments. Expecting 2 including function name");
    }
    logger.Info("Given manifest hash(args[1]): " + args[1])
    jsonbytes, err := stub.GetState(args[1])

    logger.Info(jsonbytes);
    if jsonbytes == nil {
        return shim.Error("No event has that name: " + args[1]);
    }
    if err != nil {
        return shim.Error("Unable to get lottery event")
    }
    var le lottery_event
    err = json.Unmarshal(jsonbytes, &le)
    if err != nil {
        return shim.Error("Unmarshaling lottery event fails")
    }

    logger.Info("%v\n", le)
    return shim.Success(jsonbytes)
}

// 7 args: function name, event name, Duedate, # of members, # of winner, comma seperated member list, random key.. but it could be one with long json string
// Input validation check must be done at server or user
func (t *SimpleChaincode) create_lottery_event(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	logger.Info("Invoke - create_lottery_event")
    logger.Info("args[1]:%s\nargs[2]:%s\nargs[3]:%s\nargs[4]:%s\nargs[5]:%s", args[1], args[2], args[3], args[4], args[5], args[6])

    const numOfArgs = 7
    if len(args) != numOfArgs {
        return shim.Error("Incorrect number of arguments. Expecting 7 including function name");
    }

    AlreadyBytes, _ := stub.GetState(args[1])
    if len(AlreadyBytes) != 0 {
       return shim.Error("Already registered event, please set different name for differnet event")
    }

    le := lottery_event {
        EventName: args[1],
        Duedate: args[2],
        NumOfMembers: args[3],
        NumOfWinners: args[4],
        RandomKey: args[5],
        MemberList: args[6],
        InputHash: "UNDEFINED",
        FutureBlockHeight: "UNDEFINED",
        WinnerList: "UNDEFINED",
    }

    var all_concats string
    for i := 1; i < numOfArgs; i++{
        all_concats += args[i];
    }

    // Can't utilize random functions in chaincode itself(ex. cryptographic secure random generator or gamma_func)
    // Because if it does, each peer will have different hash value
    // So, It only depends on inputs provided. Input(server or user) should provide random key
    hash := sha256.New()
    hash.Write([]byte(all_concats))
    index_hash := fmt.Sprintf("%x", hash.Sum(nil))
    le.InputHash = index_hash; // Input hash can be used as key

    jsonBytes, err := json.Marshal(le)
    if err != nil {
        return shim.Error("lottery event Marshaling fails")
    }
    // print processed input
    // logger.Info(string(le))
    logger.Info("%v\n", le)

    err = stub.PutState(le.EventName, jsonBytes);
    // or hash as key, which it is more suitable approach
    // err = stub.PutState(le.InputHash, jsonBytes);

    if err != nil {
        return shim.Error(err.Error())
    }

    return shim.Success([]byte(index_hash))
}

// 1 args : Lottery event hash 
func (t *SimpleChaincode) query_lottery_event(stub shim.ChaincodeStubInterface, args []string) pb.Response {
    logger.Info("Invoke: query_lottery_event")
    logger.Info("args[1] is " + args[1])
    jsonbytes, err := stub.GetState(args[1])

    logger.Info(jsonbytes);
    if jsonbytes == nil {
        return shim.Error("No event has that name: " + args[1]);
    }
    if err != nil {
        return shim.Error("Unable to get lottery event")
    }
    var le lottery_event
    err = json.Unmarshal(jsonbytes, &le)
    if err != nil {
        return shim.Error("Unmarshaling lottery event fails")
    }
    logger.Info("Eventname:%s\nInputHash: %s\n", le.EventName, le.InputHash)
    return shim.Success(jsonbytes)
}

func (t *SimpleChaincode) chaincode_randomized(stub shim.ChaincodeStubInterface, args []string) pb.Response {

    return shim.Success(nil)
}

/**
* @brief 
*
* @param arg1: Input hash: used for getting a lottery event
* @return Future Block Height
*/
func (t *SimpleChaincode) create_target_block(stub shim.ChaincodeStubInterface, args []string) pb.Response {
    logger.Info("chaincode: create_target_block invoked")
    const numOfArgs = 2
    if len(args) != 2 {
        return shim.Error("Incorrect number of arguments. Expecting 2 including function name, Input hash");
    }
    logger.Info("create_target_block: args[1] is " + args[1])

    // Currently search key is the event name for easy development
    var search_key string = args[1]

    jsonbytes, err := stub.GetState(search_key)
    if jsonbytes == nil {
        return shim.Error("No event has that name: " + args[1]);
    }
    if err != nil {
        return shim.Error("Unable to get lottery event from input hash")
    }

    // Get lottery event from inupt hash as a key
    var le lottery_event
    err = json.Unmarshal(jsonbytes, &le)

    if err != nil {
        return shim.Error("Unmarshaling lottery event fails in create_target_block")
    }

    // Actually getting future target block
    le.FutureBlockHeight = do_create_target_block(le)
    logger.Info("FutureBlockHeight: %s\n", le.FutureBlockHeight)

    jsonBytes, err := json.Marshal(le)
    if err != nil {
        return shim.Error("lottery event Marshaling fails")
    }

    err = stub.PutState(le.EventName, jsonBytes);
    // err = stub.PutState(le.search_key, jsonBytes);
    if err != nil {
        return shim.Error(err.Error())
    }

    return shim.Success([]byte(le.FutureBlockHeight))
}

func (t *SimpleChaincode) query_target_block(stub shim.ChaincodeStubInterface, args []string) pb.Response {
    // Currently, arg[1] is event name, it will be hash
    logger.Info("Invoke: query_target_block")
    jsonbytes, err := stub.GetState(args[1])
    if err != nil {
        return shim.Error("Unable to get lottery event")
    }
    var le lottery_event
    err = json.Unmarshal(jsonbytes, &le)
    if err != nil {
        return shim.Error("Unmarshaling lottery event fails")
    }
    logger.Info("Future Target Block height: %s\n", le.FutureBlockHeight)
    return shim.Success([]byte(le.FutureBlockHeight))
}

// draw를 통해서 verifiableRandomkey를 만드는건데, 왜 여기서 verifiableRandomkey를 인수로 받아야 하지?
// args: (0: function_name, 1: Manifest Hash, 2: verifiableRandomkey)
// args2 is 128 random bits array, 4 32-bit value concatenated by commna
func (t *SimpleChaincode) draw(stub shim.ChaincodeStubInterface, args []string) pb.Response {
    logger.Info("ChainCode: draw invoked")
    const numOfArgs = 2
    if len(args) != numOfArgs {
        return shim.Error("Incorrect number of arguments. Expecting 2 including function name, manifest hash");
    }

    logger.Info("args[0]: " + args[0])
    logger.Info("args[1]: " + args[1])

    // Currently, search key is the event name for easy development NO!
    // Search key is manifest hash, not event name
    var eventHash string = args[1]
    // var vkey string = args[2]

    jsonbytes, err := stub.GetState(eventHash)
    if jsonbytes == nil {
        return shim.Error("No event has that name: " + args[1]);
    }

    if err != nil {
        return shim.Error("Unable to get lottery event from search key")
    }

    // Get lottery event from inupt hash as a key
    var le lottery_event
    err = json.Unmarshal(jsonbytes, &le)

    if err != nil {
        return shim.Error("Unmarshaling lottery event fails in draw")
    }

    // Check if the this operation is already done
    if le.Status == "CHECKED" {
        logger.Info("Check operation is not the first time!", "Just returning winner list")
        return shim.Success([]byte(le.WinnerList))
    }

    // Get the actual winner list
    // winnerList, winnerListNames := DoDetermineWinner(le)
    winnerIndexes := DoDetermineWinner(le)
    participantArray := strings.Split(le.MemberList, ",")
    // winnerArray

    // logger.Info("winnerList: %s\n", winnerList)
    // logger.Info("winnerListNames: %s\n", winnerListNames)
    logger.Info("participantArray: ", participantArray)

    var winnerList_names []string

    for i := 0; i < len(winnerIndexes); i++ {
        winnerList_names = append(winnerList_names, participantArray[winnerIndexes[i]])
    }

    var winnerConcat string
    winnerConcat = strings.Join(winnerList_names[:],",")

    // logger.Info("Before asigning WinnerList%v\n", le)
    le.WinnerList = winnerConcat
    logger.Info("WinnerList ", winnerConcat)

    /* logger.Info("Winners: %s\n", winnerConcat) */
    // logger.Info("Winners: %s\n", winnerConcat)
    // Get draw txid
    drawTxID := stub.GetTxID()
    le.DrawTxID = drawTxID

    le.Status = "CHECKED"

    // We will check VerifiableRandomkey is consistent when verifying the result
    le.VerifiableRandomkey = le.GetVerifiableRandomKeyfromLottery();
    logger.Info("VerifiableRandomkey: ", le.VerifiableRandomkey)

    jsonBytes, err := json.Marshal(le)

    if err != nil {
        return shim.Error("lottery event Marshaling fails")
    }

    err = stub.PutState(le.InputHash, jsonBytes);

    if err != nil {
        return shim.Error(err.Error())
    }

    logger.Info("Successfully returned winnerList")

    return shim.Success([]byte(winnerConcat))
}

func (t *SimpleChaincode) verify_result(stub shim.ChaincodeStubInterface, args []string) pb.Response {
    logger.Info("ChainCode: verify_result invoked")
    const numOfArgs = 2
    var res string = "true"
    if len(args) != numOfArgs {
        return shim.Error("Incorrect number of arguments. Expecting 2 including function name, manifest hash");
    }
    logger.Info("args[0]: " + args[0])
    logger.Info("args[1]: " + args[1])

    // Manifest hash
    var search_key string = args[1]

    // Get lottery information using manifest hash
    jsonbytes, err := stub.GetState(search_key)
    if jsonbytes == nil {
        return shim.Error("No event has that name: " + args[1]);
    }

    if err != nil {
        return shim.Error("Unable to get lottery event from search key")
    }

    // Get lottery event from inupt hash as a key
    var le lottery_event
    err = json.Unmarshal(jsonbytes, &le)

    if err != nil {
        return shim.Error("Unmarshaling lottery event fails in draw")
    }

    if le.Status != "CHECKED" {
        return shim.Error("Verifying the result is only possible when the result is available")
    }

    if le.VerifiableRandomkey == (getVerifiableRandomKey(le) + le.GetVerifiableRandomKeyfromLottery()) {
        logger.Info("Verifying successfully")
        res = "success"
    } else {
        logger.Info("Verifying unsuccessfully")
        res = "fail"
    }

    return shim.Success([]byte(res))
}

func (t *SimpleChaincode) query_checkif_winner(stub shim.ChaincodeStubInterface, args []string) pb.Response {

    return shim.Success(nil)

}

func (t *SimpleChaincode) query_winner(stub shim.ChaincodeStubInterface, args []string) pb.Response {
    // Currently, arg[1] is event name, it will be hash
    logger.Info("Invoke: query_winner")
    jsonbytes, err := stub.GetState(args[1])
    if err != nil {
        return shim.Error("Unable to get lottery event")
    }
    var le lottery_event
    err = json.Unmarshal(jsonbytes, &le)
    if err != nil {
        return shim.Error("Unmarshaling lottery event fails")
    }
    logger.Info("Winner(s): %s\n", le.WinnerList)
    return shim.Success([]byte(le.WinnerList))
}

func (t *SimpleChaincode) Query(stub shim.ChaincodeStubInterface) pb.Response {

	return shim.Error("Query has been implemented in invoke")
}

func (t *SimpleChaincode) test_randomness(stub shim.ChaincodeStubInterface, args []string) pb.Response {
    logger.Info("Test randomness")
    s1 := rand.NewSource(time.Now().UnixNano())
    r1 := rand.New(s1)

    sameKey := "samekey"
    arbitaryVal1 := r1.Intn(1000)
    arbitaryVal2 := r1.Intn(1000)

    logger.Info("Generated two random values: %d %d\n", arbitaryVal1, arbitaryVal2)
    logger.Info("Check non-determinism in Hyperledger/Fabric")
    logger.Info("test: Same key with different values")
    stub.PutState(sameKey, []byte(strconv.Itoa(arbitaryVal1)))
    stub.PutState(sameKey, []byte(strconv.Itoa(arbitaryVal2)))

	return shim.Success(nil)
}

func (t *SimpleChaincode) testRandomnessDifferentKeys(stub shim.ChaincodeStubInterface, args []string) pb.Response {
    logger.Info("Test randomness")
    s1 := rand.NewSource(time.Now().UnixNano())
    r1 := rand.New(s1)
    sameValue := []byte{1,2,3,4,5}

    arbitaryKey1 := r1.Intn(1000)
    arbitaryKey2 := r1.Intn(1000)

    logger.Info("Generated two random keys: %d %d\n", arbitaryKey1, arbitaryKey2)
    logger.Info("Check non-determinism in Hyperledger/Fabric")
    logger.Info("test: Differenet key with same values")

    stub.PutState(strconv.Itoa(arbitaryKey1), sameValue)
    stub.PutState(strconv.Itoa(arbitaryKey2), sameValue)

	return shim.Success(nil)
}

// Possible
func (t *SimpleChaincode) test_networkaccess(stub shim.ChaincodeStubInterface, args []string) pb.Response {
    block := get_latest_block()
    jsonBytes, err := json.Marshal(block)

    logger.Info("%s\n", string(jsonBytes))

    if err != nil {
        return shim.Error("Error getting Latest Block")
	}
    return shim.Success(jsonBytes)
}


func main() {
	err := shim.Start(new(SimpleChaincode))
	if err != nil {
		logger.Info("Error starting Chaincode: %s", err)
	}
}

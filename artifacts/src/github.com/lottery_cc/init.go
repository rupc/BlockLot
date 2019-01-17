package main

import (
	"crypto/sha256"
	"encoding/json"
	"fmt"
	"github.com/hyperledger/fabric/core/chaincode/shim" // "math"
	pb "github.com/hyperledger/fabric/protos/peer"
	"math/rand"
	"strconv"
)

var fisheryatesshuffleScript string = `
func drawByFisherYatesShuffle(numOfParticipants int, numOfWinners int, randomSource string) []int {
    var participants = make([]int, numOfParticipants)

    for i := 0; i < numOfParticipants; i++ {
        participants[i] = i
    }

    for j := len(participants) - 1; j > 0; j-- {
        k := randomOracle(strconv.Itoa(j) + randomSource + strconv.Itoa(j)) % uint32(numOfParticipants)
        participants[j], participants[k] = participants[k], participants[j]
    }

    var winnerList = make([]int, numOfWinners)

    for i := 0; i < numOfWinners; i++ {
        winnerList[i] = participants[i]
        logger.Debug("winnerList", winnerList[i])
    }

    return winnerList
}

func randomOracle(randomSource string) uint32 {
    hash := sha256.New()
    hash.Write([]byte(randomSource))
    expectedHash := hash.Sum(nil)

    var random uint32 = uint32(expectedHash[0]) + uint32(expectedHash[1]) + uint32(expectedHash[2]) + uint32(expectedHash[3])
    return random
}`

func (t *SimpleChaincode) Init(stub shim.ChaincodeStubInterface) pb.Response {

	_, args := stub.GetFunctionAndParameters()
	// Read given files and comman concatenated single string
	fakeNames100 := args[0]
	fakeNames200 := args[1]
	fakeNames400 := args[2]
	fakeNames800 := args[3]

	// Initialize launching lottery
	openTxID := stub.GetTxID()
	chanID := stub.GetChannelID()
	creatorBytes, _ := stub.GetCreator()
	openClientIdentity := fmt.Sprintf("%s", creatorBytes)
	// openClientIdentity := ""
	// Inititial data needed for testing

	logger.Info("Channel ID: " + chanID)
	logger.Info("LotteryCC Init called")
	logger.Info("Initial test lottery's openTxID: " + openTxID)
	logger.Info("ClientIdentity: " + openClientIdentity)

	// 샘플 추첨-100,200,400,800 은 오로지 보여주기식 추첨만 테스트
	sampleRegistered := lottery_event{
		Status:              "REGISTERED",
		InputHash:           "6b60d2b794860dc84148f44d479fd7c634eaf8e3396e723d5d2224c98f38f5d1",
		EventName:           "(시연)샘플 추첨-100",
		IssueDate:           "1495701618",
		Duedate:             "1524808800",
		AnnouncementDate:    "1524808800",
		FutureBlockHeight:   "400000",
		NumOfMembers:        "100",
		NumOfWinners:        "10",
		NumOfRegistered:     "100",
		RandomKey:           "241218793433130254621482405472826812551",
		VerifiableRandomkey: "UNDEFINED",
		MemberList:          fakeNames100,
		WinnerList:          "UNDEFINED",
		Script:              fisheryatesshuffleScript,
		LotteryNote:         "(1~5등):커피, (6~10등):물",
		OpenTxID:            openTxID,
		ChannelID:           chanID,
		SubscribeTxIDs:      openTxID,
		OpenClientIdentity:  openClientIdentity,
	}

	sampleRegistered2 := lottery_event{
		Status:              "REGISTERED",
		InputHash:           "6b60d2b7932111113148f44d479fd7c634eaf8e3396e723d5d2224c98f38f5d1",
		EventName:           "(시연)샘플 추첨-200",
		IssueDate:           "1495701618",
		Duedate:             "1524808800",
		AnnouncementDate:    "1524808800",
		FutureBlockHeight:   "400000",
		NumOfMembers:        "200",
		NumOfWinners:        "20",
		NumOfRegistered:     "200",
		RandomKey:           "241218793433130254621482405472826812551",
		VerifiableRandomkey: "UNDEFINED",
		MemberList:          fakeNames200,
		WinnerList:          "UNDEFINED",
		Script:              fisheryatesshuffleScript,
		LotteryNote:         "한국인 이름 200명 추첨 테스트",
		OpenTxID:            openTxID,
		ChannelID:           chanID,
		SubscribeTxIDs:      openTxID,
		OpenClientIdentity:  openClientIdentity,
	}

	sampleRegistered3 := lottery_event{
		Status:              "REGISTERED",
		InputHash:           "6b60d2b7948603c1312lf44d479fd7c634eaf8e3r96e723d5d2224c9222222d1",
		EventName:           "(시연)샘플 추첨-400",
		IssueDate:           "1495701618",
		Duedate:             "1524808800",
		AnnouncementDate:    "1524808800",
		FutureBlockHeight:   "400000",
		NumOfMembers:        "400",
		NumOfWinners:        "30",
		NumOfRegistered:     "400",
		RandomKey:           "241218793433130254621482405472826812551",
		VerifiableRandomkey: "UNDEFINED",
		//http://www.babynamewizard.com/the-top-1000-baby-names-of-2011-united-states-of-america
		MemberList:         fakeNames400,
		WinnerList:         "UNDEFINED",
		Script:             fisheryatesshuffleScript,
		LotteryNote:        "러시아인 이름 400명 추첨 테스트",
		OpenTxID:           openTxID,
		ChannelID:          chanID,
		SubscribeTxIDs:     openTxID,
		OpenClientIdentity: openClientIdentity,
	}

	sampleRegistered4 := lottery_event{
		Status:              "REGISTERED",
		InputHash:           "6b60d2b794832322312lf44d479fd7c634eaf8e3r96e723d5d2224c9222222d1",
		EventName:           "(시연)샘플 추첨-800",
		IssueDate:           "1495701618",
		Duedate:             "1524808800",
		AnnouncementDate:    "1524808800",
		FutureBlockHeight:   "400000",
		NumOfMembers:        "800",
		NumOfWinners:        "40",
		NumOfRegistered:     "800",
		RandomKey:           "241218793433130254621482405472333332551",
		VerifiableRandomkey: "UNDEFINED",
		MemberList:          fakeNames800,
		WinnerList:          "UNDEFINED",
		Script:              fisheryatesshuffleScript,
		LotteryNote:         "중국인 이름 800명 추첨 테스트",
		OpenTxID:            openTxID,
		ChannelID:           chanID,
		SubscribeTxIDs:      openTxID,
		OpenClientIdentity:  openClientIdentity,
	}

	sampleEnded := lottery_event{
		Status:              "REGISTERED",
		InputHash:           "435df910d961f25d051a71e1daeed210cb43c31b4e92bf241a7a044bdebe50a5",
		EventName:           "경진대회 응모 샘플1",
		IssueDate:           "1498601618",
		Duedate:             "1530403200",
		AnnouncementDate:    "1530403200",
		FutureBlockHeight:   "620075",
		NumOfMembers:        "2000",
		NumOfWinners:        "3",
		NumOfRegistered:     "0",
		RandomKey:           "26047126683174221326655007522109018381",
		VerifiableRandomkey: "UNDEFINED",
		MemberList:          "",
		WinnerList:          "UNDEFINED",
		Script:              fisheryatesshuffleScript,
		LotteryNote:         "참가자 응모용 샘플",
		OpenTxID:            openTxID,
		ChannelID:           chanID,
		SubscribeTxIDs:      openTxID,
		OpenClientIdentity:  openClientIdentity,
	}

	sampleCheck := lottery_event{
		Status:              "ANNOUNCED",
		InputHash:           "e284211d3c91622692531bfd860a438d21ee6a04a2f941c970d30b5bab214a30",
		EventName:           "경진대회 추첨 행사",
		IssueDate:           "1497076380", // 2017년 5월 10일 토요일 오후 3:33:00 GMT+09:00
		Duedate:             "1526868000",
		AnnouncementDate:    "1526868000",
		FutureBlockHeight:   "673530",
		NumOfMembers:        "1000",
		NumOfWinners:        "2",
		NumOfRegistered:     "5",
		RandomKey:           "45432542334432543212154312",
		VerifiableRandomkey: "UNDEFINED",
		MemberList: `4E7288FA37135F7B50234654C56CEF500130F0D9C961481CF4440C081C65F1E7,
                    AA97302150FCE811425CD84537028A5AFBE37E3F1362AD45A51D467E17AFDC9C,
                    143AE4AC2E85109A45A873C517D28369AF4D9737F11326EC2CCBD251D3F76040,
                    6FD79214AEE801974E7C3E71130970E12A1E24042C6C0046B5EA6C20A2195321,
                    6116C93BF51548A6E31EAC22088302B789714FE03DC5EC378BCB02479D637C4E`,
		WinnerList:         "UNDEFINED",
		Script:             fisheryatesshuffleScript,
		OpenTxID:           openTxID,
		ChannelID:          chanID,
		SubscribeTxIDs:     openTxID,
		OpenClientIdentity: openClientIdentity,
	}

	jsonBytes, err := json.Marshal(sampleRegistered)
	// err = stub.PutState(sampleRegistered.InputHash, jsonBytes)
	jsonBytes, err = json.Marshal(sampleRegistered2)
	// err = stub.PutState(sampleRegistered2.InputHash, jsonBytes)
	jsonBytes, err = json.Marshal(sampleRegistered3)
	// err = stub.PutState(sampleRegistered3.InputHash, jsonBytes)
	jsonBytes, err = json.Marshal(sampleRegistered4)
	// err = stub.PutState(sampleRegistered4.InputHash, jsonBytes)
	jsonBytes, err = json.Marshal(sampleEnded)
	// err = stub.PutState(sampleEnded.InputHash, jsonBytes)
	jsonBytes, err = json.Marshal(sampleCheck)
	// err = stub.PutState(sampleCheck.InputHash, jsonBytes)

	if err != nil {
		return shim.Error("lottery event Marshaling fails")
	}

	const kNumOfSamples = 0
	var samples [kNumOfSamples]lottery_event
	for i := 0; i < kNumOfSamples; i++ {
		randomInputHash := generateRandomInputHash()
		// randomRandomKey := generateRandomRandomKey()
		// randomNumOfMembers := strconv.FormatUint(uint64(rand.Uint32() % 10000 + 10), 10)
		// randomNumOfWinners := strconv.FormatUint(uint64((math.Ceil((float64(rand.Uint32() % 10000 + 10)) * 0.1))), 10)
		randomTargetBlock := strconv.FormatUint(uint64(rand.Uint32()%528000+1), 10)

		samples[i] = lottery_event{
			Status:              "REGISTERED",
			InputHash:           randomInputHash,
			EventName:           "예비용 샘플 추첨-" + strconv.Itoa(i+1),
			IssueDate:           "1495701618",
			Duedate:             "1524808800",
			AnnouncementDate:    "1524808800",
			FutureBlockHeight:   randomTargetBlock,
			NumOfMembers:        "100",
			NumOfWinners:        "10",
			NumOfRegistered:     "100",
			RandomKey:           "241218793433130254621482405472826812551",
			VerifiableRandomkey: "UNDEFINED",
			MemberList:          fakeNames100,
			WinnerList:          "UNDEFINED",
			Script:              fisheryatesshuffleScript,
			LotteryNote:         "(1~5등):커피, (6~10등):물",
			OpenTxID:            openTxID,
			ChannelID:           chanID,
			SubscribeTxIDs:      openTxID,
			OpenClientIdentity:  openClientIdentity,
			// Status: "REGISTERED",
			// InputHash: randomInputHash,
			// EventName: "테스트 샘플 " + strconv.Itoa(i+1),
			// IssueDate: "1508601618",
			// Duedate: "1530403200",
			// AnnouncementDate: "1530403200",
			// FutureBlockHeight: randomTargetBlock,
			// NumOfMembers: randomNumOfMembers,
			// NumOfWinners: randomNumOfWinners,
			// NumOfRegistered: "0",
			// RandomKey: randomRandomKey,
			// VerifiableRandomkey: "UNDEFINED" ,
			// MemberList: "",
			// WinnerList: "UNDEFINED",
			// Script: fisheryatesshuffleScript,
			// LotteryNote: "경품 목록",
			// OpenTxID: openTxID,
			// ChannelID: chanID,
			// SubscribeTxIDs : openTxID,
			// OpenClientIdentity: openClientIdentity,
		}

		jsonBytes, err = json.Marshal(samples[i])
		err = stub.PutState(samples[i].InputHash, jsonBytes)

		if err != nil {
			return shim.Error("lottery event Marshaling fails")
		}
	}

	/* numOfEvents := make([]byte, 1)
	   numOfEvents[0] = 2
	   err = stub.PutState("numOfEvents", numOfEvents)
	   logger.Info("Number of lottery event: %d\n", numOfEvents) */

	return shim.Success(nil)
}

func generateRandomInputHash() string {
	p := make([]byte, 16)
	rand.Read(p)
	h := sha256.New()
	h.Write(p)

	return fmt.Sprintf("%x", h.Sum(nil))
}

func generateRandomRandomKey() string {
	rand1 := rand.Uint64()
	rand2 := rand.Uint64()

	return strconv.FormatUint(rand1, 10) + strconv.FormatUint(rand2, 10)
}

package main

import (
	"crypto/sha256"
	// "crypto/hmac"
	"fmt"
	"sort"

	// "encoding/binary"
	// "encoding/hex"
	// "time"
	// gjson "./lib/tidwall/gjson"
	"strconv"
	// "strings"
	// "math"
)

// List of draw script
const (
	kFisherYatesShuffle = 1
	kIndexHashing       = 2
)

// This function determins winner list
// Returns winner list, its encrypted version, nonce(might be used for verifiable randomkey)
func DoDetermineWinner(le lottery_event) ([]int, string) {
	var block Block
	var targetBlockHash string
	var numOfParticipants int
	var numOfWinners int

	numOfParticipants, _ = strconv.Atoi(le.NumOfRegistered)
	numOfWinners, _ = strconv.Atoi(le.NumOfWinners)
	fmt.Printf("numOfParticipants:%d, numOfWinners:%d\n", numOfParticipants, numOfWinners)

	// 없으면 그냥 최신(디폴트)
	if le.FutureBlockHeight == "UNDEFINED" {
		fmt.Printf("FutureBlockHeight is UNDEFINED\nGetting latest block...\n")
		block = get_latest_block()
		targetBlockHash = block.hash
	}

	if le.InputHash == "UNDEFINED" {
		panic("InputHash or FutureBlockHeight is missing\n")
	}

	// targetBlockHeight
	targetBlockHeight, _ := strconv.ParseInt(le.FutureBlockHeight, 10, 64)
	block = get_block_by_height(targetBlockHeight)

	targetBlockHash = block.hash
	fmt.Printf("Block Number: %d\n", targetBlockHeight)
	fmt.Printf("Block hash: %s\n", targetBlockHash)

	if block.hash == "" {
		panic("Future block not published\nShutting down program")
	}

	if numOfParticipants == 0 {
		panic("Number of registered member should be greater than zero")
	}

	if numOfWinners > numOfParticipants {
		panic("Number of registered member should be greater than the number of winner")
	}

	// Canlculate winner lists
	// winnerIndexes := drawbyIndexHashing(numOfParticipants, numOfWinners, targetBlockHash)
	winnerIndexes := drawByFisherYatesShuffle(numOfParticipants, numOfWinners, targetBlockHash)

	return winnerIndexes, targetBlockHash
}

func gen_random_bit_array(random_key uint64) string {
	random_bits_str := strconv.FormatUint(random_key, 2)
	return random_bits_str
}

// Use random source +
func drawByIndexHashing(numOfParticipants int, numOfWinners int, randomSource string) []int {
	var winner_list []int
	var winner_listNames string = ""
	var concat string = ""
	var lucky_map map[int]string
	lucky_map = make(map[int]string)

	for idx := 0; idx < numOfParticipants; idx++ {
		concat = randomSource + strconv.Itoa(idx)

		hash := sha256.New()
		hash.Write([]byte(concat))
		index_hash := fmt.Sprintf("%x", hash.Sum(nil))
		fmt.Printf("hash %d: %s\n", idx, concat)

		lucky_map[idx] = index_hash
	}

	// Sort by value. References follwing link
	// http://ispycode.com/GO/Sorting/Sort-map-by-value
	hack := make(map[string]int)
	hackkeys := []string{}

	for key, val := range lucky_map {
		hack[val] = key
		hackkeys = append(hackkeys, val)
	}

	sort.Strings(hackkeys)

	// print winners
	for i := 0; i < numOfWinners; i++ {
		fmt.Printf("%dth: %s\n", hack[hackkeys[i]], hackkeys[i])
		winner_list = append(winner_list, hack[hackkeys[i]])
		winner_listNames += hackkeys[i] + ","
	}

	return winner_list
}

func drawByFisherYatesShuffle(numOfParticipants int, numOfWinners int, randomSource string) []int {
	var participants = make([]int, numOfParticipants)

	for i := 0; i < numOfParticipants; i++ {
		participants[i] = i
	}

	for j := len(participants) - 1; j > 0; j-- {
		k := randomOracle(strconv.Itoa(j)+randomSource+strconv.Itoa(j)) % uint32(numOfParticipants)
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
}

package main

import (
    "crypto/sha256"
    // "crypto/hmac"
    "fmt"
    // "encoding/binary"
    "strconv"
    // "sort"
    // "encoding/hex"
    // "time"
    // gjson "./lib/tidwall/gjson"
    // "strconv"
    // "strings"
    // "math"
)

func drawByFisherYatesShuffle(numOfParticipants int, numOfWinners int, randomSource string) []int {
    var participants = make([]int, numOfParticipants)
    for i := 0; i < numOfParticipants; i++ {
        participants[i] = i
    }

    for j := len(participants) - 1; j > 0; j-- {
        k := randomOracle(strconv.Itoa(j) + randomSource + strconv.Itoa(j)) % uint32(numOfParticipants)

        fmt.Printf("rs %d\n", k)
        participants[j], participants[k] = participants[k], participants[j]
    }

    var winnerList = make([]int, numOfWinners)

    for i := 0; i < numOfWinners; i++ {
        winnerList[i] = participants[i]
        // fmt.Printf("%d\n", winnerList[i])
    }

    return winnerList
}

func randomOracle(randomSource string) uint32 {
    hash := sha256.New()
    hash.Write([]byte(randomSource))
    expectedHash := hash.Sum(nil)
    // return binary.BigEndian.Uint65(expectedHash[0:8])
    var random uint32 = uint32(expectedHash[0]) + uint32(expectedHash[1]) + uint32(expectedHash[2]) + uint32(expectedHash[3])
    // fmt.Printf("%d\n", expectedHash[0])
    // fmt.Printf("%d\n", expectedHash[1])
    // fmt.Printf("%d\n", expectedHash[2])
    // fmt.Printf("%d\n", expectedHash[3])
    // fmt.Printf("%d\n", random)
    return random
}

func main() {
    fmt.Printf("%s\n", "GOGO")
    blockHash := "0000000000000000032484321432143214"
    // randomKey := "134dsaf320jfdskafl3r82fhudiaho7348201hr"

    // mac := hmac.New(sha256.New, []byte(randomKey))
    // mac.Write([]byte(blockHash))
    // expectedMac := mac.Sum(nil)
    // fmt.Printf("%d", randomOracle(blockHash))

    winnerList := drawByFisherYatesShuffle(100, 2, blockHash)
    for i := 0; i < len(winnerList); i++ {
        fmt.Printf("%d\n", winnerList[i])
    }
    // fmt.Println(len(expectedMac))
    // for i := 0; i < len(expectedMac); i++ {
        // fmt.Println(expectedMac[i])
    // }

    // random bits is built from random key
    // random_bits := hex.EncodeToString(sig.Sum(nil))

    // verifiableRandomKey := fmt.Sprintf("%x\n", expectedMac)
    // fmt.Printf("%s\n", verifiableRandomKey)
}


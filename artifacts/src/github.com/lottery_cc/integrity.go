
package main

import (
    "crypto/sha256"
    "crypto/hmac"
    "fmt"
    // "encoding/hex"
    // "time"
    // gjson "./lib/tidwall/gjson"
    "strconv"
    // "strings"
    // "math"
)


// Bind target block and its previous three blocks into hash.
// This value is the verifiable random key(not nonce)
func getVerifiableRandomKey(le lottery_event) string {
    var blocks [4]Block
    var concats string = ""
    FTB, _ := strconv.ParseInt(le.FutureBlockHeight,10,64)
    for i := 0; i < 4; i++ {
        // External network access here!
        blocks[i] = get_block_by_height(FTB - int64(i))
        // print height of 4 blocks
        fmt.Printf("[%d] %s\n", blocks[i].height, blocks[i].hash)
        concats += blocks[i].hash
    }

    mac := hmac.New(sha256.New, []byte(le.RandomKey))
    mac.Write([]byte(concats))
    expectedMAC := mac.Sum(nil)

    fmt.Println("VerifiableRandomKey ", expectedMAC)
    return fmt.Sprintf("%x", expectedMAC)
}

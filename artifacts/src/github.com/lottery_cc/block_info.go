package main

import (
    "strconv"
    "os"
    "net/http"
    "io/ioutil"
    // "./lib/tidwall/gjson"
    // "encoding/json"
    "strings"
    "fmt"
)

type Block struct {
    hash string `json:hash`
    time int64 `json:time`
    block_index int64 `json:block_index`
    height int64 `json:height`
    nonce string `json:nonce`
    prev_block string `json:prev_block`
    // txIndexes string `json:txIndexes`
}

type InputManifest struct {
    datetime string // format: YYYYMMDDhhmmss(X), timestamp(seconds)
    num_members int
    num_winners int
    member_list []string
}

func convert_lottery_to_im (le lottery_event) InputManifest {
    fmt.Printf("Duedate in chaincode: %s\n", le.Duedate)
    var im InputManifest

    im.datetime = le.Duedate
    im.num_members, _ = strconv.Atoi(le.NumOfMembers)
    im.num_winners, _ = strconv.Atoi(le.NumOfWinners)
    im.member_list = strings.Split(le.MemberList, ",")
    return im
}

func print_im(im InputManifest) {
    fmt.Printf("datetime: %s\nnum_members: %d\nnum_winners: %d\n", im.datetime, im.num_members, im.num_winners)

}

func get_latest_block_url() string {
    return "https://blockchain.info/ko/latestblock"
}

func get_block_by_height_url(height int64) string {

    return "https://api.blockcypher.com/v1/btc/main/blocks/" + strconv.FormatInt(height, 10);
}

/*  APIs provided by https://blockchain.info/q
    getdifficulty - Current difficulty target as a decimal number
    getblockcount - Current block height in the longest chain
    latesthash - Hash of the latest block
    bcperblock - Current block reward in BTC
    totalbc - Total Bitcoins in circulation (delayed by up to 1 hour])
    probability - Probability of finding a valid block each hash attempt
    hashestowin - Average number of hash attempts needed to solve a block
    nextretarget - Block height of the next difficulty retarget
    avgtxsize - Average transaction size for the past 1000 blocks. Change the number of blocks by passing an integer as the second argument e.g. avgtxsize/2000
    avgtxvalue - Average transaction value (1000 Default)
    interval - average time between blocks in seconds
    eta - estimated time until the next block (in seconds)
    avgtxnumber - Average number of transactions per block (100 Default) */
// "https://blockchain.info/ko/q/" didn't work
func get_blockchaininfo_url(what string) string {
    return "https://blockchain.info/q/" + what
}

func get_blockchaininfo(what string) string {
    var url string
    url = get_blockchaininfo_url(what)

    resp, err := http.Get(url)

    if err != nil {
        fmt.Fprintf(os.Stderr, "fetch: %v\n", err)
        os.Exit(1)
    }

    b, err := ioutil.ReadAll(resp.Body)
    resp.Body.Close()
    return string(b[:len(b)])
}

func get_latest_block() Block {
    var block Block
    block_url := get_latest_block_url()

    s := get_formatted_json_from_url(block_url)

    block.time = Get(s, "time").Int()
    block.height = Get(s, "height").Int()
    block.block_index = Get(s, "block_index").Int()
    block.hash = Get(s, "hash").String()

    return block
}

func get_formatted_json_from_url(block_url string) string {
    resp, err := http.Get(block_url)

    if err != nil {
        fmt.Fprintf(os.Stderr, "fetch: %v\n", err)
        os.Exit(1)
    }

    b, err := ioutil.ReadAll(resp.Body)
    // fmt.Printf("%s\n", string(b))
    resp.Body.Close()

    return string(b[:len(b)])
}

func get_nextretarget_block() int64 {
    var nextretarget int64
    nextretarget, _ = strconv.ParseInt(get_blockchaininfo("nextretarget"), 10, 64)
    return nextretarget
}
func print_block(block Block) {
    fmt.Printf("height: %d\n", block.height)
    fmt.Printf("time: %d\n", block.time)
    fmt.Printf("index: %d\n", block.block_index)
    fmt.Printf("hash: %s\n", block.hash)
}

func get_block_by_height(height int64) Block {
    var block Block

    block_url := get_block_by_height_url(height)
    fmt.Printf("Request blockURL: %s\n", block_url)
    s := get_formatted_json_from_url(block_url)
    // fmt.Printf("%s\n", s)

    // block = get_block(block_url)
    // block.time = Get(s, "blocks.0.time").Int()
    block.time = Get(s, "time").Int()
    block.height = Get(s, "height").Int()
    // block.block_index = Get(s, "blocks.0.block_index").Int()
    block.hash = Get(s, "hash").String()
    block.nonce = Get(s, "nonce").String()

    fmt.Printf("block.time:%d, block.height:%d, block.hash:%s, block.nonce:%s\n", block.time, block.height, block.hash, block.nonce)

    return block
}


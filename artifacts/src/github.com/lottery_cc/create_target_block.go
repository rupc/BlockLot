package main

import (
    "fmt"
    "time"
    // gjson "./lib/tidwall/gjson"
    "strconv"
    // "strings"
    "math"
)



/**
* @brief Create future target block based on lottery event(due date/time), block production rate(considering past 4 cycles), gamma distribution
*
* @return 
*/

func do_create_target_block(le lottery_event) string {
    var im InputManifest = convert_lottery_to_im(le)
    print_im(im)
    return strconv.FormatInt(gen_future_block_num(im), 10)
}

const cycle = 2016
func gen_future_block_num(input InputManifest) int64 {
    var nextretarget int64
    var latest_block Block
    var old_block Block
    var futureblock_num int64

    latest_block = get_latest_block()

    fmt.Printf("Latest Block\n")
    print_block(latest_block)

    nextretarget = get_nextretarget_block()
    fmt.Printf("Next Regarget #: %d\n", nextretarget)

    /* Why 10080? It's typo. 4 cycle assumed, right? */
    oldblock_num := nextretarget - (cycle * 4)
    old_block = get_block_by_height(oldblock_num)
    fmt.Printf("Old Block\n")
    print_block(old_block)

    /* future date should be from input */
    // var future_date int64, _ = 
    future_date, _ := strconv.ParseInt(input.datetime, 10, 64)
    // future_date = future_date / 1000
    future_date = future_date
    // var future_date int64 = strconv.ParseInt(time.Now().UTC().Unix(), 10, 64) + 10000
    var current_block_date int64 = latest_block.time
    var oldblock_date int64 = old_block.time

    fmt.Printf("future date: %d, %s\n", future_date, time.Unix(future_date, 0).UTC())
    fmt.Printf("latest block date: %d, %s\n", current_block_date, time.Unix(latest_block.time, 0).UTC())
    fmt.Printf("old block date: %d, %s\n", oldblock_date, time.Unix(old_block.time, 0).UTC())

    var difference int64 = future_date - current_block_date
    // 유닉스 타임스탬프는 1970년 1월 1일 이후로 경과된 초(second)를 의미함.  1분을 구하려면 60으로 나눠야 됨. 처음에 6만으로 나누는 것은 millisecond까지 표현할 때의 얘기이고 지금은 초 단위까지만 표현함. 
    var difference_min int64 = int64(math.Ceil(float64(difference / 60))) // minutes
    if difference <= 0 {
        panic("You picked past time. Please pick future time")
    }
    fmt.Printf("difference: %d, min: %d\n", difference, difference_min)

    var cur_old_diff int64
    cur_old_diff = (current_block_date - oldblock_date) / 60
    fmt.Printf("%d -%d = %d\n", current_block_date, oldblock_date, current_block_date - oldblock_date)


    var cur_old_diff_avg float64
    // 4 사이클 + 가장 마지막 사이클로부터의 오프셋 갯수 만큼 블록이 생성될동안 걸린 시간을 분 단위로 표현.
    // 이 값을 통해 한 블록이 생성되는데 걸리는 평균 대기 시간을 구할 수 있음.
    // 활용: 과거의 데이터를 바탕으로 블록 생성 속도(또는 비율)을 계산하고 마감일 이전에 블록을 선택할 수 있도록 함.
    // 즉, 한 블록 생성하는데 걸리는 평균 (대기) 시간(t)
    cur_old_diff_avg = (float64(cur_old_diff) / float64((cycle * 4 + (latest_block.height + 2016 - nextretarget))))


    fmt.Printf("cur_old_diff: %d\n", cur_old_diff)
    fmt.Printf("cur_old_diff_avg: %f\n", cur_old_diff_avg)

    /* Estimated blocks between current time and future time based on current block height and past 4 cycle */
    // 현재 시간에서 마감일 사이에 생성될 블록의 갯수를 예측함
    var diff_blocks int64 = int64(math.Ceil(float64(difference_min) / cur_old_diff_avg))
    fmt.Printf("Estimated Blocks#: %d\n", diff_blocks)

    var num_diff_blocks int64 = int64(math.Ceil(float64(difference_min) / cur_old_diff_avg)) // same as diff_blocks
    // var differenceBlocks = Math.ceil(differenceMinutes / totalTimeAverage);

    var real_diff_blocks int64 = num_diff_blocks
    var cdf float64 = 1

    // gamma_func := gostat.Gamma_CDF(float64(cur_old_diff_avg), float64(difference))
    // difference_min: 현재와 마감일 사이의 시간(총 대기 시간), (k)shape parameter
    // cur_old_diff_avg: 한 블록 생성하는데 걸리는 시간, (Theta)scale parameter
    /* jStat.gamma.cdf( x, shape, scale )

    Returns the value of x in the cdf of the Gamma distribution with the parameters shape (k) and scale (theta). Notice that if using the alpha beta convention, scale = 1/beta.

    This function is checked against R's pgamma function. */
    /* for (; cdf > 0.01; realDifferenceBlocks++) {
        cdf = jStat.gamma.cdf(differenceMinutes, realDifferenceBlocks, totalTimeAverage);
        console.log("block #: " + realDifferenceBlocks + "new cdf: " + cdf);
    } */


    // fmt.Printf("%f\n", gamma_func(float64(real_diff_blocks)))
    fmt.Printf("difference_min: %d\nreal_diff_blocks: %d", difference_min, real_diff_blocks)
    gamma_func := Gamma_CDF(float64(real_diff_blocks), float64(cur_old_diff_avg))
    cdf = gamma_func(float64(difference_min))
    fmt.Printf("Normal cdf: %f\n", cdf)

    for ; cdf > 0.01; real_diff_blocks++ {
        gamma_func := Gamma_CDF(float64(real_diff_blocks), float64(cur_old_diff_avg))
        cdf = gamma_func(float64(difference_min))
        // cdf = gamma_func(float64(real_diff_blocks))
        fmt.Printf("cdf: %f\n", cdf)
    }

    futureblock_num = real_diff_blocks + latest_block.height
    fmt.Printf("\n*********************************\n* Future Block#: %d *\n*********************************\n", futureblock_num)
    /* now := time.Unix(oldblock_time, 0).UTC()
    fmt.Printf("%s\n", now.Format(time.RFC3339))
    fmt.Printf("%s\n", time.Unix(1493533618, 0).UTC()) */
    return futureblock_num
}

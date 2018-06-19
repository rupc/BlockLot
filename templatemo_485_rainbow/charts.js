var sParticipants = 10;
var sWinners = 2;
var numOfTrial = 10000000;
var divideFactor = 4;
var ztestMax = 2.6;

// Random color picker
// https://stackoverflow.com/questions/1484506/random-color-generator
function randomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function randomEngineNoSource(rs, nw, np) {
    var j, x, i;
    var a = [];

    for (i = 0; i < np; ++i) {
        a[i] = i;
    }

    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }

    var b = [];
    for (i = 0; i < nw; ++i) {
        b[i] = a[i];
    }

    return b;
}

//
// randomEngine: 당첨자 추첨 스크립트
// randomSource: 블록해시
// numOfWinners: 당첨자 수
// n: 시행횟수
function getDataStatistics(randomEngine, randomSource, numOfWinners, numOfParticipants, n) {
    var arr = new Array(numOfParticipants).fill(0);
    for (var i = 0; i < n; i++) {
        // get winner array
        var winners = randomEngine(randomSource, numOfWinners, numOfParticipants);
        for (var j = 0; j < winners.length; ++j) {
            arr[winners[j]]++;
        }
    }

    // calculate average
    // calculate stddev
    return arr;
}

var gStdDev;

function drawChart() {
    var dataStatistics = getDataStatistics(randomEngineNoSource, "", sWinners, sParticipants, numOfTrial);
    gStdDev = stdev(dataStatistics);
    console.log("표준편차:", gStdDev);

    var ndata = [['Name', '당첨 횟수', {role: 'style'}]];

    for (var i = 0; i < dataStatistics.length; ++i) {
        console.log(i, dataStatistics[i]);
        ndata.push([i+1, dataStatistics[i], randomColor()]);
    }

    var data = google.visualization.arrayToDataTable(ndata);

    var options = {
        title: "n=" + numOfTrial + ", p=" + (sWinners / sParticipants),

        titleTextStyle: {
            bold:true,
            fontSize:22,
        },
        hAxis: {
            format:'#,###',
            // showTextEvery:1,
            gridlines: { count: sParticipants },
            textStyle : {
                fontSize: 18 // or the number you want
            }
        },
        vAxis: { 
            viewWindowMode:'explicit',
            viewWindow: {
                max:numOfTrial / divideFactor,
                min:0
            },
            textStyle : {
                fontSize: 18 // or the number you want
            }
        },
        bar: {
            groupWidth: '80%'
        },
        height: '300',
        legend: 'none',
        width: '590',
    };

    var chart_div = document.getElementById('googleChart_div');
    // var chart_div = document.getElementById('chart_div');
    var chart = new google.visualization.ColumnChart(chart_div);

    // google.visualization.events.addListener(chart, 'ready', function () {
        // chart_div.innerHTML = '<img src="' + chart.getImageURI() + '">';
        // console.log(chart_div.innerHTML);
    // });

    // chart.draw(data, options);

    // Get chart image rather than raw html...
    if (navigator.userAgent.match(/Trident\/7\./)) {
        google.visualization.events.addListener(chart, 'click', function() {
            chart_div.innerHTML = '<img src="' + chart.getImageURI() + '">';
            console.log(chart_div.innerHTML);
        });
        chart.draw(data, options);
    } else {
        google.visualization.events.addListener(chart, 'select png', function() {
            chart_div.innerHTML = '<img src="' + chart.getImageURI() + '">';
            console.log(chart_div.innerHTML);
        });

        chart.draw(data, options);
        document.getElementById('png').innerHTML = '<a href="' + chart.getImageURI() + '" target="_blank"></a>';
    }
}

var stdev = function(arr) {
    var n = arr.length;
    var sum = 0;

    arr.map(function(data) {
        sum+=data;
    });

    var mean = sum / n;

    var variance = 0.0;
    var v1 = 0.0;
    var v2 = 0.0;

    if (n != 1) {
        for (var i = 0; i<n; i++) {
            v1 = v1 + (arr[i] - mean) * (arr[i] - mean);
            v2 = v2 + (arr[i] - mean);
        }

        v2 = v2 * v2 / n;
        variance = (v1 - v2) / (n-1);
        if (variance < 0) { variance = 0; }
        stddev = Math.sqrt(variance);
    }

    return {
        mean: Math.round(mean*100)/100,
        variance: variance,
        deviation: Math.round(stddev*100)/100
    };
};

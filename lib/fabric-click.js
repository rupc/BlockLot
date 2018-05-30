// http://spin.js.org/
var spin_opts = {
    lines: 13 // The number of lines to draw
    , length: 28 // The length of each line
    , width: 14 // The line thickness
    , radius: 42 // The radius of the inner circle
    , scale: 1 // Scales overall size of the spinner
    , corners: 1 // Corner roundness (0..1)
    , color: '#000' // #rgb or #rrggbb or array of colors
    , opacity: 0.25 // Opacity of the lines
    , rotate: 0 // The rotation offset
    , direction: 1 // 1: clockwise, -1: counterclockwise
    , speed: 1 // Rounds per second
    , trail: 60 // Afterglow percentage
    , fps: 20 // Frames per second when using setTimeout() as a fallback for CSS
    , zIndex: 2e9 // The z-index (defaults to 2000000000)
    , className: 'spinner' // The CSS class to assign to the spinner
    , top: '90%' // Top position relative to parent
    , left: '50%' // Left position relative to parent
    , shadow: false // Whether to render a shadow
    , hwaccel: false // Whether to use hardware acceleration
    , position: 'absolute' // Element positioning
};

function write_to_info(txt) {
    $("#info").text(txt);
}

var bcNetSetup = false;
var chanSetup = false;
var joinPeer = false;
var instCC = false;
var initCC = false;

function process_post_ajax_req(_url, successLog, failLog, spinner, name) {
    $.ajax({
        url: _url,
        type: "POST", 
        success: function(responseData) {
            write_to_info(successLog + "Response: " + responseData);
            spinner.stop();
            active_button(name);
        },
        error: function() {
            write_to_info(failLog);
            spinner.stop();
        }
    });
}

function active_button(name) {
    $('#' + name).css('pointer-events', 'auto');
    $('#' + name).css('filter', 'brightness(100%)');
}
$(document).ready(function() {
    var urlbase = "http://localhost:1185/";
    var target = document.getElementById('interface');
    $("#btn_setup").click(function() {
        var spinner = new Spinner(spin_opts).spin(target);
        var url = get_post_url("start-blockchain");
        bcNetSetup = true;
        write_to_info("Starting Blockchain Network...");
        process_post_ajax_req(url, "Success", "Fails", spinner, "create_channel");
    });

    $("#btn_term").click(function() {
        bcNetSetup = false;
        chanSetup = false;
        joinPeer = false;
        instCC = false;
        initCC = false;
        var spinner = new Spinner(spin_opts).spin(target);
        var url = get_post_url("terminate-blockchain");
        write_to_info("Terminating Blockchain Network on Server...");
        process_post_ajax_req(url, "Success", "Fails", spinner, null);

        $('#create_channel').css('pointer-events', 'none');
        $('#join_channel').css('pointer-events', 'none');
        $('#invoke_chaincode').css('pointer-events', 'none');
        $('#query_chaincode').css('pointer-events', 'none');
        $('#install_chaincode').css('pointer-events', 'none');
        $('#instantiate_chaincode').css('pointer-events', 'none');

        $('#create_channel').css('filter', 'brightness(40%)');
        $('#join_channel').css('filter', 'brightness(40%)');
        $('#invoke_chaincode').css('filter', 'brightness(40%)');
        $('#install_chaincode').css('filter', 'brightness(40%)');
        $('#instantiate_chaincode').css('filter', 'brightness(40%)');
        $('#create_channel').css('filter', 'brightness(40%)');
    });

    $("#create_channel").click(function() {
        var spinner = new Spinner(spin_opts).spin(target);
        console.log("clicked create_channel");
        $("#info").text("Creating Channel...");
        $("#info").css('border-color', '#3F8ABF');
        var url = get_post_url("create-channel");
        console.log(url);
        process_post_ajax_req(url, "Success", "Fails", spinner, "join_channel");
        /* $.ajax({
            url: urlbase + "create-channel",
            type: "POST", 
            success: function(responseData) {
                console.log("response: " + responseData);
                // alert(responseData);
                $("#info").text("A Channel is created successfully: " + responseData);
                chanSetup = true;

                spinner.stop();
                active_button("join_channel");
            },
            error: function() {
                $("#info").text("Channel creation fails");
                console.log("Ajax comm fails");
                spinner.stop();
            }
        }); */
    });

    $("#join_channel").click(function() {
        console.log("clicked join channel");
        $("#info").text("Joinninng Channl...");
        $("#info").css('border-color', '#3F8ABF');

        var spinner = new Spinner(spin_opts).spin(target);
        var url = get_post_url("join-channel");
        process_post_ajax_req(url, "Success", "Fails", spinner, "install_chaincode");
        /* $.ajax({
            url: urlbase + "join-channel",
            type: "POST", 
            success: function(responseData) {
                console.log("response: " + responseData);
                $("#info").text("Joined channel successfully");
                spinner.stop();
                joinPeer = true;
                active_button("install_chaincode");
            },
            error: function() {
                console.log("Ajax comm fails");
                $("#info").text("Joinning channel fails");
                spinner.stop();
            }
        }); */
    });

    $("#install_chaincode").click(function() {
        console.log("clicked install chaincode");

        $("#info").text("Installing chaincode...");
        $("#info").css('border-color', '#3AC162');
        var spinner = new Spinner(spin_opts).spin(target);
        var url = get_post_url("install-chaincode");
        process_post_ajax_req(url, "Success", "Fails", spinner, "instantiate_chaincode");

        /* $.ajax({
            url: urlbase + "install-chaincode",
            type: "POST", 
            success: function(responseData) {
                console.log("response: " + responseData);
                $("#info").text("Installed chaincode successfully");
                spinner.stop();
                instCC = true;
                active_button("instantiate_chaincode");
            },
            error: function() {
                console.log("Ajax comm fails");
                $("#info").text("Installing chaincode fails");
                spinner.stop();
            }
        }); */
    });

    $("#instantiate_chaincode").click(function() {
        console.log("clicked instantiate_chaincode");
        $("#info").text("Instantiating chaincode...");
        $("#info").css('border-color', '#3AC162');
        var spinner = new Spinner(spin_opts).spin(target);
        var url = get_post_url("instantiate-chaincode");
        process_post_ajax_req(url, "Success", "Fails", spinner, "invoke_chaincode");

        /* $.ajax({
            url: urlbase + "instantiate-chaincode",
            type: "POST", 
            success: function(responseData) {
                console.log("response: " + responseData);
                $("#info").text("Instantiated chaincode successfully");
                spinner.stop();
                initCC = true;
                active_button("invoke_chaincode");
                active_button("query_chaincode");
            },
            error: function() {
                console.log("Ajax comm fails");
                $("#info").text("Instantiating chaincode fails");
                spinner.stop();
            }
        }); */
    });


    $("#invoke_chaincode").click(function() {
        console.log("clicked invoked_chaincode");

        $("#info").text("Inovking chaincode with provided arguments...");
        $("#info").css('border-color', '#ED5A5A');
        var spinner = new Spinner(spin_opts).spin(target);

        var url = get_post_url("invoke-chaincode");
        process_post_ajax_req(url, "Success", "Fails", spinner, "query_chaincode");
        /* $.ajax({
            url: urlbase + "invoke-chaincode",
            type: "POST", 
            success: function(responseData) {
                $("#info").text("Invoke result: " + responseData);
                console.log("response: " + responseData);
                spinner.stop();
            },
            error: function() {
                console.log("Ajax comm fails");
                spinner.stop();
            }
        }); */
    });

    $("#query_chaincode").click(function() {
        console.log("clicked query_chaincode");

        $("#info").text("Querying with X..." );
        $("#info").css('border-color', '#3AC162');
        var spinner = new Spinner(spin_opts).spin(target);

        var url = get_post_url("query-chaincode");
        process_post_ajax_req(url, "Success", "Fails", spinner, null);
        /* $.ajax({
            url: urlbase + "query-chaincode",
            type: "POST", 
            success: function(responseData) {
                var str = JSON.stringify(responseData, null, 2);           
                // $("#info").text("" + JSON.stringify(responseData, null, 4) );
                $("#info").text("" + responseData);
                // $("#info").html(str);
                console.log("response: " + responseData);
                spinner.stop();
            },
            error: function() {
                $("#info").text("Query Fails" );
                console.log("Ajax comm fails");
                spinner.stop();
            }
        }); */
    });

    $("#btn_register").click(function() {
        console.log("clicked register user button");
        var spinner = new Spinner(spin_opts).spin(target);
        var objs = document.getElementsByName("txt_reg");
        var register_params =
            "id="+ objs[0].value +
            "&passwd="+ objs[1].value +
            "&affiliation=" + objs[2].value +
            "&role=" + objs[3].value +
            "&revoke=" + objs[4].value;

        var post_url = urlbase + "register-user" + "?" + register_params;
        console.log(post_url);
        $.ajax({
            url:  post_url,
            type: "POST", 
            success: function(responseData) {
                $("#info").text("Registered User...: " + JSON.stringify(responseData) );
                console.log("response: " + responseData);
                spinner.stop();
            },
            error: function() {
                $("#info").text("Query Fails" );
                console.log("Ajax comm fails");
                spinner.stop();
            }
        });

    });

    $("#btn_invoke").click(function() {
        console.log("clicked invoke button in CC interface");
        spin_opts["top"] = '220%';
        var spinner = new Spinner(spin_opts).spin(target);

        // radio button handling, getting function name and its parameter,
        // converting these to url
        $.ajax({
            url: get_post_url("cc-interface"),
            type: "POST",
            data: process_invoke_args("radio_cc_func"),
            success: function(responseData) {
                console.log("Invoked chaincode successfully ");
                console.log(responseData);
                spinner.stop();
            },
            error :function() {
                console.log("Invoke chaincode fails");
                spinner.stop();
            }
        })  
    })
});
function get_post_url(page) {
    return "http://localhost:1185/" + page;
}
function process_invoke_args(input_group) {
    var checked_func = get_cc_func_checked(input_group);
    var args = get_cc_func_args(checked_func);
    var allData = get_ajax_data(args);
    console.log("cc func: " + checked_func + "args: " + args);
    return allData;
}
function transform_to_timestamp(duedate) {
    return new Date(duedate).getTime() / 1000;
}
function get_cc_func_args(ccfun) {
    var args = [];
    var objs = document.getElementsByName(ccfun);
    args[0] = ccfun;
    for (var i = 0, l = objs.length; i < l; i++) {
        args[i+1] = objs[i].value;
        // console.log(v.value);
    }

    // process function-specific 
    if (ccfun == "create_lottery_event") {
        args[2] = transform_to_timestamp(args[2]);
    }

    return args;
}

function get_ajax_data(args) {
    var allData = {
        "arg0" : args[0],
        "arg1" : args[1],
        "arg2" : args[2],
        "arg3" : args[3],
        "arg4" : args[4],
        "arg5" : args[5],
        "arg6" : args[6],
    };
    return allData;
}

// http://zetawiki.com/wiki/HTML_%EB%9D%BC%EB%94%94%EC%98%A4_%EB%B2%84%ED%8A%BC
function get_cc_func_checked(ccname) {
	var obj = document.getElementsByName(ccname);
	var checked_index = -1;
	var checked_value = '';
	for( i=0; i<obj.length; i++ ) {
		if(obj[i].checked) {
			checked_index = i;
			checked_value = obj[i].value;
		}
	}
    // console.log("selected item's index: " + checked_index + "\n" + "item value: " + checked_value);
	// alert( '선택된 항목 인덱스: '+checked_index+'\n선택된 항목 값: '+checked_value );
    return checked_value;
}

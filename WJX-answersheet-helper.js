// WJX answersheet helper!
// ==UserScript==
// @name         WJX answersheet helper
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  WJX answersheet helper
// @author       stargazerZJ
// @match        https://ks.wjx.top/*
// @match        https://www.wjx.cn/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=wjx.top
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Your code here...
    // // import jquery
    // (function import_jquery() {
    //     var script = document.createElement('script');
    //     script.src = 'https://cdn.staticfile.org/jquery/1.11.3/jquery.min.js';
    //     script.type = 'text/javascript';
    //     document.getElementsByTagName('head')[0].appendChild(script);
    // })();

	document.querySelectorAll("textarea").forEach(i=>i.onpaste=null);

    var student_number = '';
    var student_name = '';
    var question_cnt=Math.max($(".div_title_question").length,$(".field-label").length);
    console.log("question count:",question_cnt)
    //fill in student number and name
    $('#q1').val(student_name);
    $('#q2').val(student_number);

    var keymap = {
        65 : 1,
        83 : 2,
        68 : 3,
        70 : 4,
        49 : 1,
        50 : 2,
        51 : 3,
        52 : 4,
        53 : 5,
        54 : 6,
        55 : 7,
        56 : 8,
        57 : 9,
        48 : 10,
        189 : 11,
    }
    var answer_names = {
        1 : 'A',
        2 : 'B',
        3 : 'C',
        4 : 'D',
        5 : 'E',
        6 : 'F',
        7 : 'G',
        8 : 'H',
        9 : 'I',
        10 : 'J',
        11 : 'K',
    }
    var previous_key = 72;
    var next_key = 76;
    var submit_key = 73;

    var problem_shift = 2;
    var problem_id = 1 + problem_shift;



    function my_alert(msg) {
        var my_messagebox = $("#ctl00_ContentPlaceHolder1_JQ1_lblQuestionnaireName");
        if(my_messagebox.length == 0) {
            my_messagebox = $('#htitle');
        }
        my_messagebox.html(msg);
        // left align the alert
        my_messagebox.css("text-align", "left");
    }

    var one_minute_reached = false;
    setTimeout(function() {
        one_minute_reached = true;
        my_alert('1 minute passed.');
    }, 60 * 1000);

    // find the character according to the keycode
    function ord(keycode) {
        return String.fromCharCode(keycode);
    }

    function display_intro() {
        var copyright_msg = 'WJX answersheet helper by StargazerZJ.<br>';
        var acknowledge_msg = 'Thanks for lxy\'s help and Github Copilot.<br>';
        var help_msg =
            'Press ' + ord(previous_key) + ' to go to previous problem.<br>' +
            'Press ' + ord(next_key) + ' to go to next problem.<br>' +
            'Press ' + ord(submit_key) + ' to submit.<br>' +
            'Press ' + 'A,S,D,F' + ' to choose answer ' + 'A,B,C,D' + ' respectively.<br>' +
            'Alternatively, press 1,2,3,4,...,0,- to choose answer A-K respectively.'
        // for(var keyCode in keymap) {
        //     help_msg += 'press ' + ord(keyCode) + ' to answer ' + answer_names[keymap[keyCode]] + '<br>';
        // }

        my_alert(copyright_msg + acknowledge_msg + help_msg);
    }
    display_intro();

    function click_answer(problem, answer) {
        var answer_button = $("a[rel='q" + problem + "_" + answer + "']")
        if(answer_button.length==0){
             answer_button = $("#div"+(problem)+" > div.ui-controlgroup.column1 > div:nth-child("+answer+")");
        }
        console.log("click->  ","#div"+(problem)+" > div.ui-controlgroup.column1 > div:nth-child("+answer+")");
        // $('#q' + problem + '_' + answer)
        // if answer_button exists
        if(answer_button.length > 0) {
            answer_button.click();
            var problem_element = $('#divTitle' + problem);
            my_alert('chose answer ' + answer_names[answer] + ' for problem ' + (problem - problem_shift) + ': ' + problem_element.text());
            // scroll to the problem
            window.scroll(0,$('#div' + problem).offset().top);
            // if the class name of answer_button starts with jqRadio, return true;
            // if it starts with jqCheckbox, return false
            return answer_button.attr('class').indexOf('jqRadio') >= 0;
            // return answer_button.attr('class');
        } else {
            my_alert('no such problem or choice: ' + (problem - problem_shift) + answer_names[answer] + '<br>' +
                'press ' + ord(submit_key) + ' to submit. <br>' +
                'note that if you fill in this form in less than 1 minute, you will need to click the captcha.');
            return false;
        }
    }

    function change_problem_id(delta, log) {
        // remove the highlight frame of the previous problem
        $('#div' + problem_id).css('border', 'none');
        problem_id += delta;
        // highlight this div using a frame
        $('#div' + problem_id).css('border', '2px solid red');
        //if($('#q'+(problem_id)).length>0){
            //$('#q'+(problem_id)).focus();
        //}
        if(log) {
            window.scroll(0,$('#div' + problem_id).offset().top);
            var prompt_msg = 'problem ' + (problem_id - problem_shift) + ': ';
            if($('#divTitle' + problem_id).length > 0) {
                prompt_msg += $('#divTitle' + problem_id).text();
            }
            my_alert(prompt_msg);
        }
    }
    change_problem_id(0, false);

    var key_handler=function(e) {
        // console.log(e.keyCode);
        // when a key is pressed, click the corresponding answer according to the keymap
        if (e.keyCode in keymap) {
            if(click_answer(problem_id, keymap[e.keyCode])) {
                change_problem_id(1, false);
            }
        }
        // when next_key is pressed, increase the problem id by 1
        if (e.keyCode == next_key && problem_id < question_cnt) {
            console.log("NEXT!!!");
            change_problem_id(1, true);
        }
        // when previous_key is pressed, decrease the problem id by 1
        if (e.keyCode == previous_key && problem_id > 1) {
            console.log("PREV!!!");
            change_problem_id(-1, true);
        }
        // when submit_key is pressed, submit the form
        if (e.keyCode == submit_key) {
            $('#submit_button').click();
        }
    }
    document.onkeydown=key_handler;

    //if any textarea is focused, don't listen to keydown, otherwise, listen to keydown
    $('textarea').focus(function() {
        document.onkeydown=null;
    });
    $('textarea').blur(function() {
        document.onkeydown=key_handler;
    });
})();
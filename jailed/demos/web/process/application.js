var scripts = document.getElementsByTagName('script');
var path = scripts[scripts.length-1].src
    .split('/')
    .slice(0, -1)
    .join('/')+'/';


// component shortcuts
var el = {};
var list = [
    'input_row',
    'output_row',
    'input_data',
    'output_data',
    'code',
    'code_wrapper',
    'code_container'
];

for (var i = 0; i < list.length; i++){
    el[list[i]] = document.getElementById(list[i]);
}

// generates random input and puts it into input field
var input;
function regen_input() {
    input = [];
    var len = 10;
    for (var i = 0; i < len; i++) {
        input.push(Math.floor(Math.random()*10));
    }

    el.input_data.innerHTML = stringify(input);
}

// processes the input data using provided code
function process() {
    el.output_data.innerHTML = '<img class="loading" src="loading.gif"/>';
    var code = el.code.textContent;

    var input = el.input_data.textContent;

    var plugin =  new jailed.Plugin(path+'plugin.js');
    var process = function() {
        var displayResult = function(result) {
            if (result.error) {
                el.output_data.innerHTML =
                    '<span class="error">'+result.error + '</span>';
            } else {
                el.output_data.innerHTML = stringify(result.output);
            }
            plugin.disconnect();
        }

        plugin.remote.process(input, code, displayResult);
    }

    plugin.whenConnected(process);
}


// converts an object into a string
function stringify(object) {
    var result;

    if (typeof object == 'undefined') {
        result = 'undefined';
    } else if (object === null) {
        result = 'null';
    } else {
        result = JSON.stringify(object) || object.toString();
    }

    return result;
}



// removes spaces from the end of the strings
function trim_tails(string) {
    var arr = string.split('\n');

    for (var i = 0; i < arr.length; i++) {
        arr[i] = arr[i].replace(/[\s]+$/g, '');
    }

    return arr.join('\n');
}

// fills the processing code textarea with initial content
function fill_code() {
    var code = trim_tails([
        'function(input) {                                 ',
        '    // bubble-sorting the input array             ',
        '                                                  ',
        '    // switches the two elems if needed           ',
        '    // returns true if switched                   ',
        '    function switchEls(idx) {                     ',
        '        var switched = false;                     ',
        '                                                  ',
        '        if (input[idx] < input[idx-1]) {          ',
        '            var tmp = input[idx];                 ',
        '            input[idx] = input[idx-1];            ',
        '            input[idx-1] = tmp;                   ',
        '            switched = true;                      ',
        '        }                                         ',
        '                                                  ',
        '        return switched;                          ',
        '    }                                             ',
        '                                                  ',
        '    var switched;                                 ',
        '    do {                                          ',
        '        switched = false;                         ',
        '        for (var i = 1; i < input.length; i++) {  ',
        '            switched |= switchEls(i);             ',
        '        }                                         ',
        '    } while(switched);                            ',
        '                                                  ',
        '    return input;                                 ',
        '}                                                 ',
        '                                                  ',
        '                                                  '
    ].join('\n'));

    el.code.innerHTML = code;
}


function init_application() {
    el.input_row.onclick = regen_input;
    el.output_row.onclick = process;
    fill_code();
    regen_input();

    // caching
    var plugin =  new jailed.Plugin(path+'plugin.js');
    plugin.whenConnected(function(){plugin.disconnect();});

    el.code.focus();
}


function init_scrolling() {
    // updates mouse highlight indicator
    var lastActive = null;
    var mousedowned = false;
    var update_indicator = function(e) {
        if (!mousedowned) {
            var hover = document.elementFromPoint(e.clientX, e.clientY);
            var active = null;
            switch (hover) {
            case el.code:
            case el.code_wrapper:
                active = 'code';
                break;
            case el.code_container.container:
                active = 'code_container';
                break;
            }

            if (active != lastActive) {
                lastActive = active;
                console.log(lastActive);
            }
        }
    }

    var mousedown = function(e) {
        mousedowned = true;
        update_indicator(e);
    }

    var mouseup = function(e) {
        mousedowned = false;
        update_indicator(e);
    }


    el.code.addEventListener('mouseover', update_indicator, false);
    el.code.addEventListener('mouseout', update_indicator, false);
    el.code_container.addEventListener('mouseover', update_indicator, false);
    el.code_container.addEventListener('mouseout', update_indicator, false);

    window.addEventListener('mousedown', mousedown, false);
    window.addEventListener('mouseup', mouseup, false);
}


function init() {
    init_application();
    init_scrolling();
}

window.addEventListener("load", init, false);


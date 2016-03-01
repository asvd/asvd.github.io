var scripts = document.getElementsByTagName('script');
var path = scripts[scripts.length-1].src
    .split('/')
    .slice(0, -1)
    .join('/')+'/';


// component shortcuts
var el = function(id) {
    return document.getElementById(id);
}


// generates random input and puts it into input field
var input;
function regen_input() {
    input = [];
    var len = 10;
    for (var i = 0; i < len; i++) {
        input.push(Math.floor(Math.random()*10));
    }

    el('input_data').innerHTML = stringify(input);
}

// processes the input data using provided code
function process() {
    el('output_data').innerHTML = '<img class="loading" src="loading.gif"/>';
    var code = el('code').textContent;

    var input = el('input_data').textContent;

    var plugin =  new jailed.Plugin(path+'plugin.js');
    var process = function() {
        var displayResult = function(result) {
            if (result.error) {
                el('output_data').innerHTML =
                    '<span class="error">'+result.error + '</span>';
            } else {
                el('output_data').innerHTML = stringify(result.output);
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


    el('code').innerHTML = code;
}


function init_application() {
    el('input_row').onclick = regen_input;
    el('output_row').onclick = process;
    fill_code();
    regen_input();

    // caching
    var plugin =  new jailed.Plugin(path+'plugin.js');
    plugin.whenConnected(function(){plugin.disconnect();});

    el('code').focus();
}


function init_scrolling() {
    // updates mouse highlight indicator
    var lastActive = null;
    var mousedowned = false;

    var activate = function(key) {
        switch (key) {
        case 'code':
            el('code').style.transition = 'opacity .12s';
            el('code').style.opacity = '1';
            break;
        case 'code_background':
            el('code_background').style.transition = 'opacity .11s';
            el('code_background').style.opacity = '1';
            break;
        }
    }
    
    var deactivate = function(key) {
        switch (key) {
        case 'code':
            el('code').style.transition = 'opacity .2s';
            el('code').style.opacity = '.82';
            break;
        case 'code_background':
            el('code_background').style.transition = 'opacity .25s';
            el('code_background').style.opacity = '.7';
            break;
        }
    }

    var update_indicator = function(e) {
        if (!mousedowned) {
            var hover = document.elementFromPoint(e.clientX, e.clientY);
            var active = null;
            if (el('code').contains(hover)) {
                active = 'code';
            } else if (hover == el('code_container').container) {
                active = 'code_background';
            }

            if (active != lastActive) {
                if (true) {
                    switch (active) {
                    case 'code':
                        activate('code');
                        activate('code_background');
                        break;
                    case 'code_background':
                        deactivate('code');
                        activate('code_background');
                        break;
                    default:
                        deactivate('code');
                        deactivate('code_background');
                        break;
                    }
                } else {
                    deactivate(lastActive);
                    activate(active);
                }
                lastActive = active;
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


    el('code').addEventListener('mouseover', update_indicator, false);
    el('code').addEventListener('mouseout', update_indicator, false);
    el('code_container').addEventListener('mouseover', update_indicator, false);
    el('code_container').addEventListener('mouseout', update_indicator, false);

    window.addEventListener('mousedown', mousedown, false);
    window.addEventListener('mouseup', mouseup, false);

    deactivate('code');
    deactivate('code_background');
}



function init_keypress() {
    var handle_paste = function(e) {
        // inserting content as a plain text
        // (otherwise firefox replaces newlines with <br>
        //  which is not recognized by textContent)
        var sel = window.getSelection();
        var ran = sel.getRangeAt(0);
        ran.deleteContents();
        var pos = ran.startOffset;
        var node = ran.startContainer
        var pastedContent = e.clipboardData.getData('text/plain');
        node.insertData(pos, pastedContent);

        pos += pastedContent.length;
        ran.setStart(node, pos);
        ran.setEnd(node, pos);
        sel.removeAllRanges();
        sel.addRange(ran);
        e.preventDefault();
    }


    var handle_keypress = function(e) {
        if (e.keyCode == 13) {  // Enter
            // firefox places <br/> instead of newline
            // which is not recognized by textContent
            //
            // also adding some padding from the left side
            var sel = window.getSelection();
            var ran = sel.getRangeAt(0);
            if (el('code').contains(ran.startContainer) &&
                el('code').contains(ran.endContainer)
            ) {
                ran.deleteContents();
                var pos = ran.startOffset;
                var node = ran.startContainer

                ran.setStart(el('code'), 0);
                var prevLine = ran.toString().split('\n').pop();
                var spaces = prevLine.substr(0, (prevLine+'.').search(/\S/));
                var data = '\n' + spaces;

                node.insertData(pos, data);

                pos += data.length;


                // putting the selection after the newline
                ran.setStart(node, pos);
                ran.setEnd(node, pos);
                sel.removeAllRanges();
                sel.addRange(ran);

                e.preventDefault();
            }
        }
    }

    el('code').addEventListener('keypress', handle_keypress, false);
    el('code').addEventListener('paste', handle_paste, false);
}


function init() {
    init_application();
    init_scrolling();
    init_keypress();
}

window.addEventListener("load", init, false);


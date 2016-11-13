 
window.addEventListener('keydown', function(e) {
    if (e.keyCode == 20) {
        // capslock held
        var indicator = document.getElementById('caps_indicator');
        indicator.className = 'caps_held';
    }
});

window.addEventListener('keyup', function(e) {
    if (e.keyCode == 20) {
        // capslock released
        var indicator = document.getElementById('caps_indicator');
        indicator.className = 'caps_released';
    }
});


window.addEventListener('load', function() {
    var password = document.getElementById('password');
    var password_result = document.getElementById('password_result');

    var update = function() {
        password_result.innerText = 'value: ' +password.value;
    };

    update();

    password.addEventListener('input', update);

    var common = 'isComposing';

    var control = {
        keypress : [
            common,
            'code',
            'charCode',
            'ctrlKey',
            'shiftKey',
            'key',
            'keyCode',
            'which'
        ],

        keyup : [
            common,
            'code',
            'charCode',
            'ctrlKey',
            'shiftKey',
            'key',
            'keyCode',
            'which'
        ],

        keydown : [
            common,
            'code',
            'charCode',
            'ctrlKey',
            'shiftKey',
            'key',
            'keyCode',
            'which'
        ],

        input : [
            'type'
        ],

        change : [
            'type'
        ]
    }

    document.getElementById('txt').addEventListener('focus', function(e) {
        console.log('FOCUS');
    });

    document.getElementById('txt').addEventListener('blur', function(e) {
        console.log('BULR');
    });

    var show = [
//        'keypress',
//        'keydown',
//        'keyup'
    ];

    for (var i = 0; i < show.length; i++) {
        var name = show[i];
        window.addEventListener(name, function(name) {
            return function(e) {
                if (e.charCode != 20 && e.which != 20) {
                    var result = name + ' FIRED:';
                    for (var i = 0; i < control[name].length; i++) {
                        var key = control[name][i];
                        result += '\n  ' + key + ' : ' + e[key];
                    }
                    result += '\n';

                    console.log(result);

                    result += '\n\n';

                    result = result.replace(/\\n/g, '<br/>');
                    var log = document.getElementById('log');
//                    log.innerText += result;
                    log.scrollTop = log.scrollHeight;
                }
            }
        }(name));
    }


/*
    show = [
        'keydown',
//        'beforeinput',
        'keypress',
        'input',
        'keyup',
        'change'
    ];

    var el = window;

//    el = document.getElementById('txt');

    for (var i = 0; i < show.length; i++) {
        var name = show[i];
        el.addEventListener(name, function(name) {
            return function(e) {
                console.log(name);
            }
        }(name));
    }
*/


});

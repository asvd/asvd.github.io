
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
        password_result.innerText = 'password typed: ' +password.value;
    };

    update();

    password.addEventListener('input', update);

    var control = {
        keydown : [
            'code',
            'charCode',
            'ctrlKey',
            'shiftKey',
            'key',
            'keyCode',
            'which'
        ],

        keyup : [
            'code',
            'charCode',
            'ctrlKey',
            'shiftKey',
            'key',
            'keyCode',
            'which'
        ],

        keypress : [
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

    var show = [
//        'keypress',
        'keydown',
//        'keyup'
    ];

    for (var i = 0; i < show.length; i++) {
        var name = show[i];
        window.addEventListener(name, function(name) {
            return function(e) {
                var result = name + ' FIRED:';
                for (var i = 0; i < control[name].length; i++) {
                    var key = control[name][i];
                    result += '\n  ' + key + ' : ' + e[key];
                }
                result += '\n';
                console.log(result);
            }
        }(name));
    }


});

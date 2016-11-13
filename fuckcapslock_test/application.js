 
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
        password_result.innerText = password.value;
    };

    update();

    password.addEventListener('input', update);

    var control = {
        keypress : [
            'isComposing',
            'code',
            'charCode',
            'ctrlKey',
            'shiftKey',
            'key',
            'keyCode',
            'which'
        ],

        keyup : [
            'isComposing',
            'code',
            'charCode',
            'ctrlKey',
            'shiftKey',
            'key',
            'keyCode',
            'which'
        ],

        keydown : [
            'isComposing',
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
        ],

        blur : [
            'type'
        ],

        focus : [
            'type'
        ]
    }


    // creates an event reflector and subsribes to the event
    var reflect = function(el, name) {
        el.addEventListener(name, function(e) {
        });
    }


    for (var name in control) if (control.hasOwnProperty(name)) {
        reflect(window, name);
    }

    for (name in control) if (control.hasOwnProperty(name)) {
        reflect(document.getElementById('txt'), name);
    }


});

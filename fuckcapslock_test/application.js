 
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
            'type',
            'code',
            'charCode',
            'ctrlKey',
            'shiftKey',
            'key',
            'keyCode',
            'which'
        ],

        keyup : [
            'type',
            'code',
            'charCode',
            'ctrlKey',
            'shiftKey',
            'key',
            'keyCode',
            'which'
        ],

        keydown : [
            'type',
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


    var createEl = function(cls) {
        var node = document.createElement('div');
        node.className = cls;
        return node;
    }


    // creates an event reflector and subsribes to the event
    var reflect = function(el, name) {
        var reflector = createEl('box');
        var header = createEl('boxheader');
        var headertext = document.createTextNode(name + ': 0');
        header.appendChild(headertext);
        reflector.appendChild(header);

        var props = createEl('props');
        var propstext = createEl('');
        props.appendChild(propstext);
        reflector.appendChild(props);


        var parent = document.getElementById(
            el == window ?
                  'window_indicators' :
                  'input_indicators'
        );
        parent.appendChild(reflector);

        var count = 0;
        el.addEventListener(name, function(e) {
            count++;
            headertext.textContent = name + ': ' + count;

            var list = control[name];

            var text = '';
            for (var i = 0; i < list.length; i++) {
                var prop = list[i];
                text += '<span class="propname">' + prop + '</span>: ' + e[prop] + '<br/>';
            }
            propstext.innerHTML = text;


            header.style.transition = 'background-color 0s';
            header.style.backgroundColor = '#334455';
            header.offsetHeight;
            header.style.transition = 'background-color .4s';
            header.style.backgroundColor = '#112233';
        });
    }


    for (var name in control) if (control.hasOwnProperty(name)) {
        reflect(window, name);
    }

    for (name in control) if (control.hasOwnProperty(name)) {
        reflect(document.getElementById('txt'), name);
    }


});

 
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

    var createSpan = function(cls) {
        var node = document.createElement('span');
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

        var lastvals = {};

        var count = 0;
        el.addEventListener(name, function(e) {
            if (e.key != 'CapsLock') {
                count++;
                headertext.textContent = name + ': ' + count;

                while(propstext.firstChild) {
                    propstext.removeChild(propstext.firstChild);
                }

                var list = control[name];

                for (var i = 0; i < list.length; i++) {
                    var prop = list[i];
                    var changed = lastvals[prop] != e[prop];
                    lastvals[prop] = e[prop];
                    var line = createEl('propline');
                    var propname = createSpan('propname');
                    var val = createSpan('propval');
                    propname.innerHTML = prop + ': ';
                    val.innerHTML = e[prop];
                    line.appendChild(propname);
                    line.appendChild(val);
                    propstext.appendChild(line);


                    if (changed) {
                        line.style.transition = 'color 0s';
                        line.style.color = '#99BeE7';
                        line.offsetHeight;
                        line.style.transition = 'color .3s';
                        line.style.color = '#496e87';
                    }
                }


                header.style.transition = 'background-color 0s';
                header.style.backgroundColor = '#223344';
                header.offsetHeight;
                header.style.transition = 'background-color .4s';
                header.style.backgroundColor = '#112233';
            }
        });
    }


    for (var name in control) if (control.hasOwnProperty(name)) {
        reflect(window, name);
    }

    for (name in control) if (control.hasOwnProperty(name)) {
        reflect(document.getElementById('txt'), name);
    }


});

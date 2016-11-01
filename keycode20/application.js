
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

    password.addEventListener('change', function(e) {
        console.log('CHANGE');
    });
});

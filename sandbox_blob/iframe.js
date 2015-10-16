var code = 'self.postMessage({text: "sandbox created"});';
var url = window.URL.createObjectURL(
    new Blob([code], {type: 'text/javascript'})
);

//var url = 'data:application/javascript,'+encodeURIComponent(code);


url = 'worker.js';

var worker = new Worker(url);

// forwarding messages to parent
worker.addEventListener('message', function(m) {
    parent.postMessage(m.data, '*');
});


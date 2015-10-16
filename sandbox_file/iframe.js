var url = 'worker.js';

var worker = new Worker(url);

// forwarding messages to parent
worker.addEventListener('message', function(m) {
    parent.postMessage(m.data, '*');
});


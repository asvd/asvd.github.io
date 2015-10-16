    // determining absolute path of iframe.html
    var scripts = document.getElementsByTagName('script');
    var path =scripts[scripts.length-1].src
        .split('/')
        .slice(0, -1)
        .join('/'); 
    var iframejs = path+'/iframe.js';
    var iframehtml = path+'/iframe.html';



    window.addEventListener("load", function() {
        var iframe = document.createElement('iframe');



        var html = '<script src="'+iframejs+'"></script>';



        var blob = new Blob([html], {type: 'text/html'});
        iframe.src = window.URL.createObjectURL(blob);





//        iframe.src = 'data:text/html;charset=utf-8,' + encodeURI(html);



        iframe.src = iframehtml;



        iframe.sandbox = 'allow-scripts';
        iframe.style.display = 'none';
        document.body.appendChild(iframe);

        window.addEventListener('message', function(e) {
            if (e.origin=='null' && e.source == iframe.contentWindow) {
                document.write(e.data.text);
            }
        });
    }, 0);


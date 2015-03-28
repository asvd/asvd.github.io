
    

var _el = function(id) {
    return document.getElementById(id);
}

function start() {
    document.body.className = 'intence';
    intence.reset();

    _el('loading').style.display = 'none';

    if (intence.enabled) {
        _el('everything').style.display = 'block';

        DlHighlight.HELPERS.highlightByName('code', 'pre');
        init_intro();
        init_dynamic();
        init_river();
        init_earth();
        init_notext();

        init_analytics();
    } else {
        _el('not_supported').style.display = 'block';
    }
}



function init_analytics() {
  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

  ga('create', 'UA-60744255-1', 'auto');
  ga('send', 'pageview');
}


function init_intro() {
    var example_intro = [
        ['example_intro_text1', 'bottom', 0],
        ['example_intro_text2', 'top', .1],
        ['example_intro_text3', 'top', .37],
        ['example_intro_text4', 'bottom', .68],
        ['example_intro_text5', 'bottom', .98]
    ];

    _el('example_intro_arrow_top').style.opacity = 0;
    _el('example_intro_arrow_bottom').style.opacity = 0;
    for (var i = 0; i < example_intro.length; i++) {
        _el(example_intro[i][0]).style.opacity = 0;
    }

    var ex1_scroller = _el("example_intro_area").scroller;

    var ex1_cur_arrow = null;
    var ex1_cur_annotation = null;
    var ex1_show_annotation = function(num) {
        if (ex1_cur_annotation != num)  {
            if (ex1_cur_annotation !== null) {
                _el(example_intro[ex1_cur_annotation][0]).style.opacity = 0;
            }

            _el(example_intro[num][0]).style.opacity = 1;
            ex1_cur_annotation = num;
            
            var arrow = example_intro[num][1];

            if (arrow != ex1_cur_arrow) {
                if (ex1_cur_arrow) {
                    _el("example_intro_arrow_"+ex1_cur_arrow).style.opacity = 0;
                }

                _el("example_intro_arrow_"+arrow).style.opacity = 1;
                ex1_cur_arrow = arrow;
            }
        }

    }

    var ex1_onscroll = function() {
        var height = ex1_scroller.getBoundingClientRect().height;
        var full = ex1_scroller.scrollHeight - height;
        var pos = ex1_scroller.scrollTop;
        var rate = pos / full;

        for (var i = example_intro.length-1; i >= 0 ; i--) {
            if (rate >= example_intro[i][2]) {
                ex1_show_annotation(i);
                if (i > 0) {
                    document.getElementById('scroll_me').style.opacity = 0;
                }
                break;
            }
        }

    }

    ex1_scroller.addEventListener(
        'scroll', ex1_onscroll, false
    );

    ex1_onscroll();
    
}


function init_dynamic() {
    var gIntRoot = _el('goethe_intence');
    var gInt = _el('goethe_intence').scroller;
    var gBar = _el('goethe_bar');

    var points = [];
    var shown = 0;
    var processScroll = function() {
        var height = gInt.getBoundingClientRect().height;
        var full = gInt.scrollHeight - height;
        var pos = gInt.scrollTop;

        if (full-pos < 100 && shown < 4) {
            points[shown++] = pos;
            _el('goethe'+shown+'_intence').style.display = 'block';
            _el('goethe'+shown+'_bar').style.display = 'block';
            if (shown == 4) {
                gIntRoot.removeAttribute('scrollInfiniteSouth');
            }
        } else if (pos < points[shown-1]) {
            _el('goethe'+shown+'_intence').style.display = 'none';
            _el('goethe'+shown+'_bar').style.display = 'none';
            shown--;
            if (shown == 3) {
                gIntRoot.setAttribute('scrollInfiniteSouth', null);
            }
        }
    }

    gInt.addEventListener('scroll', processScroll, false);
}


var init_river = function() {
    var river = _el('river_scroll');
    var river_scroller = _el('river_scroll').scroller;
    var scroll = function(e) {
        if (e.deltaY) {
            river_scroller.scrollLeft += Math.round(e.deltaY/4);
//            river_scroller.scrollLeft += e.deltaY;
            e.preventDefault();
            e.stopPropagation();
        }
    }
    river.addEventListener("wheel", scroll);
}


var init_earth = function() {
    var wheel = function(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    var earth_scroller = _el('earth').scroller;
    earth_scroller.addEventListener("wheel", wheel);
    earth_scroller.addEventListener('scroll', earth_onscroll, false);

    setTimeout( function() {
        earth_scroller.scrollTop = 300;
        earth_scroller.scrollLeft = 1300;
    }, 500);
}


var earth_onscroll = function() {
    var earth = _el('earth');
    var earth_scroller = _el('earth').scroller;
    var earth_inner = _el('earth_inner');

    var width = earth.getBoundingClientRect().width;
    var full = earth_inner.getBoundingClientRect().width;
    var pos = earth_scroller.scrollLeft;
    var lim = 300;
    var offset = 1350;

    if (pos < lim) {
        earth_switch();
        earth_scroller.scrollLeft += offset;
    } else if (full-width-pos < lim) {
        earth_switch();
        earth_scroller.scrollLeft -= offset;
    }

}


var earth_switch = function() {
    var e1 = _el('earth1');
    var e3 = _el('earth3');

    if (e1.style.display == 'block') {
        e1.style.display = 'none';
        e3.style.display = 'block';
    } else {
        e3.style.display = 'none';
        e1.style.display = 'block';
    }
}


function init_notext() {
    var high = _el('notext_high').scroller;
    var low = _el('notext_low').scroller;

    var height = 300;
    var full = 1200;
    var lim = 100;
    var offset = 400;
    var fix_low = function() {
        var pos = low.scrollTop;
        if (pos < lim) {
            low.scrollTop += offset;
        } else if (full-height-pos < lim) {
            low.scrollTop -= offset;
        }
    }

    var fix_high = function() {
        var pos = high.scrollTop;
        if (pos < lim) {
            high.scrollTop += offset;
        } else if (full-height-pos < lim) {
            high.scrollTop -= offset;
        }
    }

    high.addEventListener('scroll', fix_high, false);
    low.addEventListener('scroll', fix_low, false);

    setTimeout( function() {
        high.scrollTop = 400;
    }, 500);
}







var encode = function(str) {
    return str.
        replace(/ /g, '%20').
        replace(/,/g, '%2C').
        replace(/\./g, '%2E').
        replace(/#/g, '%23').
        replace(/:/g, '%3A');
}


var share = function(type) {
    var site = 'http://asvd.github.io/intence/';
    var image = 'http://asvd.github.io/intence/intence_preview.png';
    var name = encode('Intence');
    var tag = encode('#intence');
    var comma = encode(', ');
    var dot = encode('. ');
    var semi = encode(': ');
    var subtitle = encode('a brand new way of scrolling indication');
    var description = encode('You will never wish to see the scrollbar again');
    

    var url = null;

    switch (type) {
    case 'fb':
        url = 'https://www.facebook.com/sharer/sharer.php?u='+site;
        break;
    case 'vk':
        url = 'https://vk.com/share.php?url='+site+'&title='+name + comma + subtitle+'&description='+description+'&image='+image+'&noparse=true';
        break;
    case 'twitter':
        url = 'https://twitter.com/intent/tweet?text='+tag+comma+subtitle+dot+description+semi+'&url='+site+'';
        break;
    case 'pinterest':
        url = 'https://www.pinterest.com/pin/create/button/?url='+site+'&description='+name + comma + subtitle+ dot +description+dot+'&media='+image+'';
        break;
    case 'googleplus':
        url = 'https://plus.google.com/share?url='+site+'';
        break;
    case 'linkedin':
        url = 'https://www.linkedin.com/shareArticle?mini=true&url='+site+'&title='+name + comma + subtitle+'&summary='+description+'&source='+site+'';
        break;
    case 'xing':
        url = 'https://www.xing-share.com/app/user?op=share;sc_p=xing-share;url='+site+'';
        break;
    }

    popup(url);
}

var popup = function(url) {
    var w = 600, h = 400;
    var dualScreenLeft =
        window.screenLeft !== undefined ?
        window.screenLeft : screen.left;
    var dualScreenTop =
        window.screenTop !== undefined ?
        window.screenTop : screen.top;

    var width = window.innerWidth ?
        window.innerWidth :
        document.documentElement.clientWidth ?
        document.documentElement.clientWidth :
        screen.width;
    var height = window.innerHeight ?
        window.innerHeight :
        document.documentElement.clientHeight ?
        document.documentElement.clientHeight :
        screen.height;
            
    var left = ((width / 2) - (w / 2)) + dualScreenLeft;
    var top = ((height / 3) - (h / 3)) + dualScreenTop;

    var newWindow = window.open(
        url, 'Intence',
        'scrollbars=yes, width=' + w + ', height=' + h + ', top=' + top + ', left=' + left
    );

    if (window.focus) {
        newWindow.focus();
    }
}


var orig_start = start;
_start = function() {
    setTimeout(orig_start, 2000);
}

if (document.readyState == "complete") {
    // page has already been loaded
    start();
} else {
    // preserving any existing listener
    var origOnload = window.onload || function(){};

    window.onload = function(){
        start();
    }
}


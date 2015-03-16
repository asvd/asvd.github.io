
    

function start() {
    DlHighlight.HELPERS.highlightByName('code', 'pre');
    init_intro();
    init_dynamic();
    init_river();
    init_river_drag();
    init_earth();
    init_earth_drag();
    
    init_analytics();
}

function init_analytics() {
  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

  ga('create', 'UA-60744255-1', 'auto');
  ga('send', 'pageview');
}

var _el = function(id) {
    return document.getElementById(id);
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

    var ex1_scroller = _el("example_intro_area-scroller");

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
    var gInt = _el('goethe_intence-scroller');
    var gBar = _el('goethe_bar');

    var int_scrolled = false;
    var bar_scrolled = false;

    var int_onscroll = function() {
        if (bar_scrolled) {
            bar_scrolled = false;
        } else {
            int_scrolled = true;
            gBar.scrollTop = gInt.scrollTop;
            processScroll();
        }
    }

    var bar_onscroll = function() {
        if (int_scrolled) {
            int_scrolled = false;
        } else {
            bar_scrolled = true;
            gInt.scrollTop = gBar.scrollTop;
            processScroll();
        }
    }

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

    gInt.addEventListener('scroll', int_onscroll, false);
    gBar.addEventListener('scroll', bar_onscroll, false);
}


var init_river = function() {
    var river = _el('river_scroll');
    var river_scroller = _el('river_scroll-scroller');
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


var init_river_drag = function() {
    var river = _el('river_scroll');
    var river_scroller = _el('river_scroll-scroller');

    var lastPageX;
    var pushed = false;
    var down = function(e) {
        pushed = true;
        lastPageX = e.pageX;

        e.preventDefault();
        e.stopPropagation();
    }
    
    var up = function() {
        if (pushed) {
            pushed = false;
        }
    }

    var move = function(e) {
        if (pushed) {
            river_scroller.scrollLeft -= (e.pageX - lastPageX);
            lastPageX = e.pageX;
        }
    }

    river.addEventListener('mousedown', down, false);
    window.addEventListener('mouseup', up, false);
    window.addEventListener('mousemove', move, false);
}


var init_earth = function() {
    var wheel = function(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    var earth_scroller = _el('earth-scroller');
    earth_scroller.addEventListener("wheel", wheel);
    earth_scroller.addEventListener('scroll', earth_onscroll, false);
    earth_scroller.scrollTop = 300;
    earth_scroller.scrollLeft = 1300;
}


var earth_onscroll = function() {
    var earth = _el('earth');
    var earth_scroller = _el('earth-scroller');
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


var init_earth_drag = function() {
    var earth = _el('earth');
    var earth_scroller = _el('earth-scroller');

    var lastPageX, lastPageY;
    var pushed = false;
    var down = function(e) {
        pushed = true;
        lastPageX = e.pageX;
        lastPageY = e.pageY;

        e.preventDefault();
        e.stopPropagation();
    }
    
    var up = function() {
        if (pushed) {
            pushed = false;
        }
    }

    var move = function(e) {
        if (pushed) {
            earth_scroller.scrollLeft -= (e.pageX - lastPageX);
            earth_scroller.scrollTop -= (e.pageY - lastPageY);
            lastPageX = e.pageX;
            lastPageY = e.pageY;
        }
    }

    earth.addEventListener('mousedown', down, false);
    window.addEventListener('mouseup', up, false);
    window.addEventListener('mousemove', move, false);
}


var share = function(type) {
    var url = null;

    switch (type) {
    case 'fb':
        url = 'https://www.facebook.com/sharer/sharer.php?u=http://asvd.github.io/intence/';
        break;
    case 'vk':
        url = 'https://vk.com/share.php?url=http://asvd.github.io/intence/&title=Intence%2C%20a%20brand%20new%20way%20of%20scrolling%20indication&description=You%20will%20never%20wish%20to%20see%20the%20scrollbar%20again%2E&image=http://asvd.github.io/intence/intence_preview.png&noparse=true';
        break;
    case 'twitter':
        url = 'https://twitter.com/intent/tweet?text=%23intence%2C%20a%20brand%20new%20way%20of%20scrolling%20indication%2E%20You%20will%20never%20wish%20to%20see%20the%20scrollbar%20again%3A&url=http://asvd.github.io/intence/';
        break;
    case 'pinterest':
        url = 'https://www.pinterest.com/pin/create/button/?url=http://asvd.github.io/intence/&description=Intence%2C%20a%20brand%20new%20way%20of%20scrolling%20indication%2E%20You%20will%20never%20wish%20to%20see%20the%20scrollbar%20again%2E&media=http://asvd.github.io/intence/intence_preview.png';
        break;
    case 'googleplus':
        url = 'https://plus.google.com/share?url=http://asvd.github.io/intence/';
        break;
    case 'linkedin':
        url = 'https://www.linkedin.com/shareArticle?mini=true&url=http://asvd.github.io/intence/&title=Intence%2C%20a%20brand%20new%20way%20of%20scrolling%20indication&summary=You%20will%20never%20wish%20to%20see%20the%20scrollbar%20again&source=http://asvd.github.io/intence/';
        break;
    case 'xing':
        url = 'https://www.xing-share.com/app/user?op=share;sc_p=xing-share;url=http://asvd.github.io/intence/';
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


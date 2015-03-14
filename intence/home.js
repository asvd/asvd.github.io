
function start() {
    DlHighlight.HELPERS.highlightByName('code', 'pre');
    init_intro();
    init_dynamic();
    init_river();
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
                gIntRoot.removeAttribute('intenceinfinitesouth');
            }
        } else if (pos < points[shown-1]) {
            _el('goethe'+shown+'_intence').style.display = 'none';
            _el('goethe'+shown+'_bar').style.display = 'none';
            shown--;
            if (shown == 3) {
                gIntRoot.setAttribute('intenceinfinitesouth', null);
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


/**
 * @fileoverview wavelight - high-performance language-agnostic live
 *                           syntax-highlighting library
 *
 * @version 0.0.1
 *
 * @license MIT, see http://github.com/asvd/wavelight
 * @copyright 2015 asvd <heliosframework@gmail.com>
 *
 * Code structure aims at following points in the given priority:
 *  1. performance
 *  2. compressed library size
 *  3. readability
 */


(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['exports'], factory);
    } else if (typeof exports !== 'undefined') {
        factory(exports);
    } else {
        factory((root.wavelight = {}));
    }
}(this, function (exports) {
    // shortcuts for better compression
    var _window    = window;
    var _document  = document;
    var wavelight = 'wavelight';
    var compareDocumentPosition = 'compareDocumentPosition';
    var observerOptions = {
        characterData : 1,
        subtree       : 1,
        childList     : 1
    }

    var reset = function(
        cls,  // element class to highlight, defaults to 'wavelight'
        // locals
        wavelighted,
        i,
        el
    ) {
        wavelighted = _document.getElementsByClassName(cls||wavelight);

        for (i = 0; el = wavelighted[i++];) {
            if (!el[wavelight]) {
                // fixing the el in the closure
                (function(el) {

var

/**
 * True if highlight is currently in progress
 */
highlightRunning,



/**
 * Start and end nodes suspicious for changes in between. The
 * mentioned nodes are certainly properly formatted tokens, everything
 * in-between the nodes is suspicious and should be rechecked.
 *
 * After the end node is reached, the tail might be reformatted.
 */
redrawStart,
redrawEnd,

// keeps mutation observer
observer,


/**
 * Extends the redraw range to include the given point. Just like as
 * with selection borders, the point is determined by anode and offest
 *
 * @param {Object} node must be el, or a (sub)child
 * @param {Object} offset
 */
extendRedrawRange = function(node, offset) {
    // moving to the top until we reach the element
    while (node != el && node.parentNode != el) {
        node = node.parentNode;
        offset = 0;
    }

    if (redrawStart) {
        // existing existing redraw range
        redrawStart =
            // 1 if redrawStart precedes node
            redrawStart[compareDocumentPosition](node) & 4 ?
            redrawStart : node;

        redrawEnd =
            // 1 if redrawEnd follows node
            redrawEnd[compareDocumentPosition](node) & 2 ?
            redrawEnd : node;
    } else {
        // creating new redraw range
        if (node == el) {
            // position between the nodes
            redrawStart = el.childNodes[offset-1] || el.firstChild;
            redrawEnd   = el.childNodes[offset]   || el.lastChild;
        } else {
            redrawStart = node.previousSibling || el.firstChild;
            redrawEnd   = node.nextSibling     || el.lastChild;
        }
    }
},


/**
 * Listens for the changes on the element, initiates the highlighting
 * if not started yet
 */
changeListener = function(a, b) {
    return
    var sel = window.getSelection();
    if (sel.rangeCount) {
        var ran = sel.getRangeAt(0);

        if (
            // element contains selection start and end
            // (.contains() method works wrong at least in IE9)
            el.contains(ran.startContainer) &&
            el.contains(ran.endContainer)
        ) {
            // converting the selection into plain text
            observer.disconnect();

            var content = ran.extractContents();
            var text = '';
            var node = content;
            var pos = 0;
            var out = {n: node, p: pos};

            do {
                text += (out = getChr(out.n, out.p, content)).c;
            } while (out.c);
            ran.insertNode(document.createTextNode(text));

            observer.observe(el, observerOptions);

            if (!highlightRunning) {
                drawToken();
            }
        }
    }
},


/**
 * Recursively runs through DOM starting from the given point, until a
 * single character is extracted. Returns an object containing the
 * character, the new point after that character. Also returns the
 * flags designating if the current selection start or end points are
 * located right before the extracted character
 *
 * @param {Object} node to start burrowing from
 * @param {Number} pos of a sub-element inside that node
 * @param {Object} limitEl not to exceed
 * @param {Object} startNode of the selection
 * @param {Number} startPos of the selection
 * @param {Object} endNode of the selection
 * @param {Number} endPos of the selection
 *
 * @returns {Object} with following fields
 *  .c - newly scanned character
 *  .n - node of the point after the character
 *  .p - position of the point after the character
 *  .S - true if selection start is right before the point
 *  .E - true if selection end is right before the point
 */
getChr = function(
    node, pos, limitEl, startNode, startPos, endNode, endPos
) {
    var chr = '';
    var selStart = 0, selEnd = 0;

    var nodeIsOver = 0;

    while (!chr) {
        selStart |= (startNode == node) && (startPos == pos);
        selEnd   |= (endNode   == node) && (endPos   == pos);

        if (node.length) {
            // text node
            if (pos < node.length) {
                chr = node.textContent[pos];
                pos++;
            } else if (node == (limitEl||el)) {
                // end of content
                break;
            } else {
                nodeIsOver = 1;
            }
        } else {
            // normal node
            if (pos < node.childNodes.length) {
                // switching into the node
                node = node.childNodes[pos];
                pos = 0;
            } else if (node == (limitEl||el)) {
                // end of content
                break;
            } else {
                if (/(br|tr)/i.test(node.nodeName)) {
                    chr = '\n';
                }

                nodeIsOver = 1;
            }
        }

        if (nodeIsOver) {
            nodeIsOver = 0;
            
            if (node.nextSibling) {
                node = node.nextSibling;
                pos = 0;
            } else {
                // going to the end of parent node
                node = node.parentNode;
                pos = node.childNodes.length;
            }
        }
    }

    return {
        c : chr,
        n : node,
        p : pos,
        S : selStart,
        E : selEnd
    };
},


/**
 * Scans the first dirty range, generates a single token and schedules
 * itself, in case there is something dirty still left
 */
drawToken = function() {
    observer.disconnect();

    highlightRunning = 1;


    observer.observe(el, observerOptions);

    // TODO if finished, highlightRunning = 0
};


/**
 * Resets the highlight for the whole element
 *
 * Stored as the element method to be accessible from outside
 */
el[wavelight] = function() {
    redrawStart = redrawEnd = 0;
    if (!highlightRunning) {
        drawToken();
    }
}

el.addEventListener('paste', function(e) {
    var sel = window.getSelection(), ran;
    if (sel.rangeCount) {
        ran = sel.getRangeAt(0);
        extendRedrawRange(ran.startContainer, ran.startOffset);
        extendRedrawRange(ran.endContainer,   ran.endOffset);
    }

    e.preventDefault();
    document.execCommand(
        "insertText",
        0,
        e.clipboardData.getData("text/plain")
    );
});

// subscribing to the node change event
(observer = new MutationObserver(
    changeListener
)).observe(el, observerOptions);

document.addEventListener(
    'selectionchange',
    function() {
    // TODO mark last selected node (for IE)
        console.log('SELECTION');
    }
);


el.addEventListener(
    'drop',
    function(e) {
        e.preventDefault();
        var text = 
    }
);


                })(el);
            }

            // reset highlight for the element
            el[wavelight]();
        }

    }


    if (_document.readyState == 'complete') {
        reset();
    } else {
        _window.addEventListener('load', function(){reset()});
    }

    exports.reset = reset;
}));


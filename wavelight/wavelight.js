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


    var reset = function(
        cls,  // element class to highlight, defaults to 'wavelight'
        // locals
        wavelighted,
        i,
        el
    ) {
        // dynamic set of elements to highlight
        wavelighted = _document.getElementsByClassName(cls||wavelight);

        for (i = 0; el = wavelighted[i++];) {
            // fixing the el in the closure
            (function(el, highlightRunning) {
                // highlighted element state object
                if (!el[wavelight]) {
                    el[wavelight] =  {
/**
 * Ordered list of dirty ranges (without intersections) which should
 * be rehighlighted within the element
 */
l : [],


/**
 * Marks the points around current selection as a dirty range, so that
 * everything within the current selection will be re-highlighted.
 * Merges the dirty range with existing dirty ranges stored in the .l
 * array.
 */
m : function() {
    var sel = _window.getSelection(),
        ran,
        startNode,
        endNode,
        item,
        toBeAdded = 1,
        // keeps merged list, will replace the .l
        newList = [];

    if (// there is a selection
        sel.rangeCount &&
        // element contains selection start and end
        el.contains(startNode = (ran = sel.getRangeAt(0)).startContainer) &&
        el.contains(endNode = ran.endContainer)
    ) {
        // replacing with the subnode preceeding the selection point
        startNode = startNode.childNodes[ran.startOffset-1]||startNode;
        if (startNode.parentNode == el) {
            // taking preivously highlighted token, or the begenning
            startNode = startNode.previousSibling || 0;
        }

        // replacing with the subnode preceeding the selection point 
        endNode   = endNode.childNodes[ran.endOffset-1]||endNode;
        if (endNode.parentNode == el) {
            // taking the following highlighted token, or the end
            endNode = endNode.nextSibling || 0;
        }

        while (item = el[wavelight].l.shift()) {
            if (!toBeAdded ||  // already added, or...
                // ...startNode comes after item[1]
                // (i.e. selection not reached)
                (item[1] && item[1][compareDocumentPosition](startNode) & 4)
            ) {
                newList.push(item);
            } else if (item[0] &&
                       endNode[compareDocumentPosition](item[0]) & 4) {
                // selection fully before the item
                // adding both
                newList.push([startNode, endNode]);
                newList.push(item);
                toBeAdded = 0;
            } else {
                // intersection, merging item and selection
                startNode =
                    !item[0] ?
                     item[0] :
                     item[0][compareDocumentPosition](startNode) & 4 ?
                     item[0] : startNode;

                endNode =
                    !item[1] ?
                     item[1] :
                     item[1][compareDocumentPosition](endNode) & 4 ?
                     endNode : item[1];
            }
        }

        if (toBeAdded) {
            newList.push([startNode, endNode]);
        }

        el[wavelight].l = newList;
    } // else selection outside of container
},


/**
 * Listens for the changes on the element, initiates the highlighting
 * if not started yet
 */
c : function() {
    var highlightRunning = el[wavelight].l.length;

    // updating dirty ranges
    el[wavelight].m();

    if (!highlightRunning) {
        el[wavelight].t();
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
r : function(node, pos, startNode, startPos, endNode, endPos) {
    var chr = '', newNode, newPos;
    var selStart = 0, selEnd = 0;

    var nodeIsOver = false;

    while (!chr) {
        selStart |= (startNode == node) && (startPos == pos);
        selEnd   |= (endNode   == node) && (endPos   == pos);

        if (node.length) {
            // text node
            if (pos < node.length) {
                chr = node.textContent[pos];
                newNode = node;
                newPos = pos++;
            } else {
                nodeIsOver = true;
            }
        } else {
            // normal node
            if (pos < node.childNodes.length) {
                // switching into the node
                node = node.childNodes[pos];
                pos = 0;
            } else if (node == el) {
                // end of content
                break;
            } else if (/(br|tr)/i.test(node.nodeName)) {
                chr = '\n';
                newNode = node;
                newPos = 0;
            } else {
                nodeIsOver = true;
            }
        }

        if (nodeIsOver) {
            if (node.nextSibling) {
                node = node.nextSibling;
                pos = 0;
            } else {
                // going to the end of parent node
                node = node.parentNode;
                pos = node.parentNode.childNodes.length;
            }
        }
    }

    return {
        c : chr,
        n : newNode,
        p : newPos,
        S : selStart,
        E : selEnd
    };
},


/**
 * Scans the first dirty range, generates a single token and schedules
 * itself, in case there is something dirty still left
 */
t : function() {
//    debugger
}

                    };

                    // marks the dirty state before pasting
                    el.addEventListener('paste', el[wavelight].m, 0);

                }

                highlightRunning = el[wavelight].l.length;

                // resetting the list of dirty ranges
                el[wavelight].l = [
                    [0,0]  // means 'everything is dirty'
                ];

                if (!highlightRunning) {
                    el[wavelight].t();
                }  // otherwise already scheduled

                // subscribing to the node change event
                var observer = new MutationObserver(el[wavelight].c);
                observer.observe(el, {
                    characterData : 1,
                    subtree       : 1,
                    childList     : 1
                });
            })(el);
        }
    }


    if (_document.readyState == 'complete') {
        reset();
    } else {
        _window.addEventListener('load', function(){reset()}, 0);
    }

    exports.reset = reset;
}));


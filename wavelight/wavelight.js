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
 *
 * optional params for marking selection as suspicous:
 * @param {Object} startContainer
 * @param {Number} startOffset
 */
m : function(startContainer, startOffset) {
    var sel = _window.getSelection(),
        ran,
        endContainer,
        endOffset,
        item,
        added = 0,
        // keeps merged list, will replace the .l
        newList = [];

    if (startContainer) {
        endContainer = startContainer;
        endOffset = startOffset;
    } else {
        if (sel.rangeCount) {
            // there is a selection
            ran = sel.getRangeAt(0);
            startContainer = ran.startContainer;
            endContainer = ran.endContainer;
            startOffset = ran.startOffset;
            endOffset = ran.endOffset;
        }
    }

    if (// there is a selection
        startContainer &&
        // element contains selection start and end
        el.contains(startContainer) &&
        el.contains(endContainer)
    ) {
        // picking the respective child of el
        startContainer = startContainer.childNodes[ran.startOffset-1]||startContainer;
        if (startContainer == el) {
            // 0 stands for 'the very beginning'
            startContainer = 0;
        } else {
            while (startContainer.parentNode != el) {
                startContainer = startContainer.parentNode;
            }

            startContainer = startContainer.previousSibling || 0;
        }

        // same with end node
        endContainer = endContainer.childNodes[ran.endOffset-1]||endContainer;
        if (endContainer == el) {
            // end of selection in the very beginning
            endContainer = el.childNodes[0];
        }

        // 0 stands for 'until the end'
        endContainer = endContainer.nextSibling || 0;
    
        // replacing with the subnode preceeding the selection point
        while (item = el[wavelight].l.shift()) {
            // if a node was detached, it was somwhere inside
            // current selection
            item[0] = item[0] ? el.contains(item[0]) ? item[0] : startContainer : 0;
            item[1] = item[1] ? el.contains(item[1]) ? item[1] : endContainer : 0;

            if (added ||
                // startContainer comes after item[1]
                // (i.e. selection not reached)
                (item[1] && item[1][compareDocumentPosition](startContainer) & 4)
            ) {
                newList.push(item);
            } else if (item[0] &&
                       endContainer[compareDocumentPosition](item[0]) & 4) {
                // selection fully before the item
                // adding both
                newList.push([startContainer, endContainer]);
                newList.push(item);
                added = 1;
            } else {
                // intersection, merging item and selection
                startContainer =
                    !item[0] ?
                     item[0] :
                     item[0][compareDocumentPosition](startContainer) & 4 ?
                     item[0] : startContainer;

                endContainer =
                    !item[1] ?
                     item[1] :
                     item[1][compareDocumentPosition](endContainer) & 4 ?
                     endContainer : item[1];
            }
        }

        if (!added) {
            newList.push([startContainer, endContainer]);
        }

        el[wavelight].l = newList;

    } // else selection outside of container
},


/**
 * Listens for the changes on the element, initiates the highlighting
 * if not started yet
 */
c : function() {
    // disconnecting the observer
    el[wavelight].o.disconnect();

    var sel = window.getSelection();
    if (sel.rangeCount) {
        var ran = sel.getRangeAt(0);
        if (el.contains(ran.startContainer) &&
            el.contains(ran.endContainer)
        ) {
            var content = ran.extractContents();
            var text = '';
            var node = content;
            var pos = 0;
            var out = {n: node, p: pos};

            do {
                text += (out = el[wavelight].r(out.n, out.p, content)).c;
            } while (out.c);
            ran.insertNode(document.createTextNode(text));
        }
    }


    el[wavelight].o.observe(el, observerOptions);

    return;



    // converting selection into plain text (selection exists upon
    // change only when content was dragged into)
    /*
                    var sel = window.getSelection();
                    if (sel.rangeCount) {
                        var ran = sel.getRangeAt(0);
                        var part = ran.extractContents();
                        document.getElementById('target').appendChild(part);
                    }
    */



    
    
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
r : function(node, pos, limitEl, startNode, startPos, endNode, endPos) {
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
                newPos = ++pos;
            } else if (node == (limitEl||el)) {
                // end of content
                break;
            } else {
                nodeIsOver = true;
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

                    el.addEventListener('mousedown', function(e, s) {
                        if ((s = window.getSelection()).rangeCount) {
                            s = s.getRangeAt(0);
                            if (s.startNode != s.endNode ||
                                s.startOffset != s.endOffset
                            ) {
                                // selection non-epmty, marking as suspicious
                                el[wavelight].m(s.startNode, s.startOffset);
                            }
                        }
                    }, 0);


                    el.addEventListener('paste', function(e) {
                        // marks the dirty state before pasting
                        el[wavelight].m();

                        // force pasting as a plain-text
                        e.preventDefault();
                        document.execCommand(
                            "insertText",
                            0,
                            e.clipboardData.getData("text/plain")
                        );
                    }, 0);

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
                (el[wavelight].o = new MutationObserver(el[wavelight].c)).observe(el, observerOptions);



                
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


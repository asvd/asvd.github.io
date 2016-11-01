/**
 * @fileoverview keycode20 - ignores capslock state
 * @version 0.0.1
 * 
 * @license MIT, see http://github.com/asvd/fuckcapslock
 * @copyright 2015 asvd <heliosframework@gmail.com> 
 */


(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['exports'], factory);
    } else if (typeof exports !== 'undefined') {
        factory(exports);
    } else {
        factory((root.keycode20 = {}));
    }
}(this, function (exports) {
    var printKey = function(key) {
        var sel = window.getSelection();
        if (sel.rangeCount) {
            var ran = sel.getRangeAt(0);

            if (ran.startContainer.firstChild) {
                var child = ran.startContainer.childNodes[ran.startOffset];
                
                var tagname = child.nodeName.toLowerCase();
                var basic_input = 
                        ran.startContainer == ran.endContainer &&
                        ran.startOffset == ran.endOffset &&
                        (tagname == 'input' || tagname == 'textarea');
                if (basic_input) {
                    var value = child.value;
                    var selStart = child.selectionStart;
                    var selEnd = child.selectionEnd;
                    child.value = value.substr(0, selStart) + key + value.substr(selEnd, value.length-selEnd);
                    child.setSelectionRange(selStart+1, selStart+1);

                    var evt = new KeyboardEvent('input');
                    child.dispatchEvent(evt);
                    evt = new KeyboardEvent('change');
                    child.dispatchEvent(evt);
                }
            } // otherwise element has no children

            var editable = false;
            var node = ran.startContainer;

            do {
                if (node.getAttribute &&
                    node.getAttribute('contenteditable')=='true'
                ) {
                    editable = true;
                    break;
                }
                node = node.parentNode;
            } while (node.parentNode);

            var endnode = ran.endContainer;
            if (editable &&
                // editable node contains endnode
                (endnode == node ||
                 endnode.compareDocumentPosition(node) & 8)
            ) {
                // selection fully inside editable area
                ran.deleteContents();
                node = ran.startContainer;
                if (node.firstChild &&
                    ran.startOffset > 0 &&
                    node.childNodes[ran.startOffset-1].length
                ) {
                    // standing right after text node, moving into
                    node = node.childNodes[ran.startOffset-1];
                    ran.setStart(node, node.length);
                    ran.setEnd(node, node.length);
                }

                if (node.length) {
                    // text node, inserting inside element
                    value = node.textContent;
                    var point = ran.startOffset;
                    node.textContent = value.substr(0, point) + key + value.substr(point, value.length-point);
                    ran.setStart(node, point+1);
                    ran.setEnd(node, point+1);
                } else {
                    // between nodes, inserting textnode
                    var textnode = document.createTextNode(key);
                    ran.insertNode(textnode);
                    ran.setStartAfter(textnode);
                    ran.setEndAfter(textnode);
                }
                sel.removeAllRanges();
                sel.addRange(ran);
            }
        }



    }

    var events = ['keypress'];

    for (var i = 0; i < events.length; i++) {
        var event = events[i];
        var handler = function(name) {
            return function(e) {
                var shift = false;
                if (e.shiftKey) {
                    shift = e.shiftKey;
                } else if (e.modifiers) {
                    shift = !!(e.modifiers & 4);
                }

                var capslock = e.key.length == 1 &&
                   ((e.key != e.key.toLowerCase() && !shift) ||
                    (e.key != e.key.toUpperCase() && shift));

                if (capslock) {
                    e.preventDefault();
                    e.stopPropagation(); 
                    e.stopImmediatePropagation(); 

                    var key = e.key[shift ? 'toUpperCase' : 'toLowerCase']();
                    var code = key.charCodeAt(0);


                    var keypressEvent = new KeyboardEvent(name, {
                        bubbles     : e.bubbles,
                        cancelable  : e.cancelable,
                        scoped      : e.scoped,
                        composed    : e.composed,

                        detail      : e.detail,
                        view        : e.view,
                        sourceCapabilites : e.sourceCapabilites,
                        
                        key         : key,
                        code        : code,
                        location    : e.location,
                        ctrlKey     : e.ctlKey,
                        shiftKey    : e.shiftKey,
                        altKey      : e.altKey,
                        metaKey     : e.metaKey,
                        repeat      : e.repeat,
                        isComposing : e.isComposing,
                        charCode    : code,
                        keyCode     : code,
                        which       : code
                    });

                    Object.defineProperty(keypressEvent, 'charCode', {get:function(){return this.charCodeVal;}}); 
                    Object.defineProperty(keypressEvent, 'code', {get:function(){return this.codeVal;}}); 
                    Object.defineProperty(keypressEvent, 'keyCode', {get:function(){return this.charCodeVal;}}); 
                    Object.defineProperty(keypressEvent, 'which', {get:function(){return this.charCodeVal;}}); 
                    keypressEvent.charCodeVal = code;
                    keypressEvent.codeVal = e.code;


                    e.target.dispatchEvent(keypressEvent);

                    printKey(key);
                }


            }
            
        }
        window.addEventListener(event, handler(event), 0);

    }    
    
}));

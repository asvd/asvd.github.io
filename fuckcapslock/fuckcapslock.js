/**
 * @fileoverview fuckcapslock - ignores capslock state
 * @version 0.0.0
 * 
 * @license MIT, see http://github.com/asvd/fuckcapslock
 * @copyright 2015 asvd <heliosframework@gmail.com> 
 */


(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['exports'], factory);
    } else {
        factory();
    }
}(this, function () {
    var printKey = function(key) {
        var sel = window.getSelection();
        if (sel.rangeCount) {
            var ran = sel.getRangeAt(0);

            if (ran.startContainer == ran.endContainer &&
                ran.startOffset == ran.endOffset
            ) {
                var el = null;
                var tagname = ran.startContainer.nodeName.toLowerCase();
                if (tagname == 'input' || tagname == 'textarea') {
                    el = ran.startContainer;
                }

                if (ran.startContainer.firstChild) {
                    var child = ran.startContainer.childNodes[ran.startOffset];
                    tagname = child.nodeName.toLowerCase();
                    
                    if (tagname == 'input' || tagname == 'textarea') {
                        el = child;
                    }
                }

                if (el) {
                    var value = el.value;
                    var selStart = el.selectionStart;
                    var selEnd = el.selectionEnd;
                    el.value = value.substr(0, selStart) + key + value.substr(selEnd, value.length-selEnd);
                    el.setSelectionRange(selStart+1, selStart+1);

                    var evt = new KeyboardEvent('input');
                    el.dispatchEvent(evt);
                    evt = new KeyboardEvent('change');
                    el.dispatchEvent(evt);
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
                (endnode == node ||
                 // editable node contains endnode
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

// TODO handle keydown differently (keycode messes)
    var events = [
        'keypress',
        'keydown',
        'keyup'
    ];

    for (var i = 0; i < events.length; i++) {
        var event = events[i];
        var handler = function(name) {
            return function(e) {
//                if (name=='keydown')debugger
                var shift = false;
                if (e.shiftKey) {
                    shift = e.shiftKey;
                } else if (e.modifiers) {
                    shift = !!(e.modifiers & 4);
                }

                var key = false;
                if (e.key && e.key.length == 1) {
                    key = e.key;
                } else if (e.which) {
                    key = String.fromCharCode(e.which);
                } else if (e.keyCode) {
                    key = String.fromCharCode(e.keyCode);
                }

                var capslock = 
                   ((key != key.toLowerCase() && !shift) ||
                    (key != key.toUpperCase() && shift));

                if (capslock) {
                    if (name != 'keydown') {
                        e.preventDefault();
                    }
                    e.stopPropagation(); 
                    e.stopImmediatePropagation(); 
                    key = key[shift ? 'toUpperCase' : 'toLowerCase']();
                    var code =
                            name == 'keypress' ?
                            key.charCodeAt(0) :
                            key.toUpperCase().charCodeAt(0);


                    var keypressEvent = new KeyboardEvent(name, {
                        bubbles     : e.bubbles,
                        cancelable  : e.cancelable,
                        scoped      : e.scoped,
                        composed    : e.composed,

                        detail      : e.detail,
                        view        : e.view,
                        sourceCapabilites : e.sourceCapabilites,

                        isTrusted : e.isTrusted,
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
                        charCode    : e.charCode,
                        keyCode     : code,
                        which       : code
                    }); 

                    if (name == 'keypress') {
                        Object.defineProperty(keypressEvent, 'charCode', {get:function(){return this.charCodeVal;}}); 
                    }

                    Object.defineProperty(keypressEvent, 'keyCode', {get:function(){return this.charCodeVal;}}); 
                    Object.defineProperty(keypressEvent, 'which', {get:function(){return this.charCodeVal;}}); 
                    Object.defineProperty(keypressEvent, 'code', {get:function(){return this.codeVal;}}); 
                    Object.defineProperty(keypressEvent, 'key', {get:function(){return this.keyVal;}}); 
                    keypressEvent.charCodeVal = code;
                    keypressEvent.codeVal = e.code;
                    keypressEvent.keyVal = key;


                    e.target.dispatchEvent(keypressEvent);

                    if (name == 'keydown') {
                        printKey(key);
                    }
                }


            }
            
        }
        window.addEventListener(event, handler(event), 0);

    }


/*

    var events = [
    ];

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

                var key = false;
                if (e.key && e.key.length == 1) {
                    key = e.key;
                } else if (e.which) {
                    key = String.fromCharCode(e.which);
                } else if (e.keyCode) {
                    key = String.fromCharCode(e.keyCode);
                }

                var capslock = 
                   ((key != key.toLowerCase() && !shift) ||
                    (key != key.toUpperCase() && shift));

                if (capslock) {
//                    e.preventDefault();
                    e.stopPropagation(); 
                    e.stopImmediatePropagation(); 
                    key = key[shift ? 'toUpperCase' : 'toLowerCase']();
                    var code = key.toUpperCase().charCodeAt(0);


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
                        charCode    : e.charCode,
                        keyCode     : code,
                        which       : code
                    });

                    Object.defineProperty(keypressEvent, 'code', {get:function(){return this.codeVal;}}); 
                    Object.defineProperty(keypressEvent, 'keyCode', {get:function(){return this.charCodeVal;}}); 
                    Object.defineProperty(keypressEvent, 'which', {get:function(){return this.charCodeVal;}}); 
                    Object.defineProperty(keypressEvent, 'key', {get:function(){return this.keyVal;}}); 
                    keypressEvent.charCodeVal = code;
                    keypressEvent.codeVal = e.code;
                    keypressEvent.keyVal = key;


                    e.target.dispatchEvent(keypressEvent);

                    printKey(key);
                }


            }
            
        }
        window.addEventListener(event, handler(event), 0);
    }    
*/

    
}));

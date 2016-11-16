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
    var ifInput = function(el) {
        var result = null;
        if (el) {
            var nodename = el.nodeName.toLowerCase();
            result = (nodename == 'input'||nodename == 'textarea') ? el : null;
        }
        return result;
    }

    var printKey = function(key) {
        var basicInputEl = null;

        var sel = window.getSelection();
        if (sel.rangeCount) {
            var ran = sel.getRangeAt(0);

            if (ran.startContainer == ran.endContainer &&
                ran.startOffset == ran.endOffset
            ) {
                // in Chrome input element is the given subchild
                // in FF startContainer points to input element itself
                basicInputEl = 
                    ifInput(ran.startContainer) ||
                    (ran.startContainer.firstChild ? 
                     ifInput(ran.startContainer.childNodes[ran.startOffset]) : null);
            }

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

            if (editable) {
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
        } else {
            // in FF focused inputs are sometimes not reflected in
            // selection
            basicInputEl = ifInput(document.activeElement);
        }

        if (basicInputEl) {
            var value = basicInputEl.value;
            var selStart = basicInputEl.selectionStart;
            var selEnd = basicInputEl.selectionEnd;
            basicInputEl.value = value.substr(0, selStart) + key + value.substr(selEnd, value.length-selEnd);


            // blur and focus will scroll to selection
            // (also suppressing the respective events)
            var suppress = function(e) {
                e.preventDefault();
                e.stopImmediatePropagation(); 
                return false;
            }
            basicInputEl.setSelectionRange(selStart+1, selStart+1);

            window.addEventListener('focus', suppress, true);
            window.addEventListener('blur', suppress, true);

            basicInputEl.blur();
            basicInputEl.focus();

            window.removeEventListener('focus', suppress, true);
            window.removeEventListener('blur', suppress, true);

            basicInputEl.setSelectionRange(selStart+1, selStart+1);

            // not for IE
            // TODO
            try {
                var evt = new KeyboardEvent('input', {
                    bubbles : true
                });
                basicInputEl.dispatchEvent(evt);
                evt = new KeyboardEvent('change', {
                    bubbles : true
                });
                basicInputEl.dispatchEvent(evt);
            } catch(e) {}
        }

    }


    // redefining preventDefault to recognize if it was called for
    // artificially emitted events
    var preventingDefault = false;
    var defaultPrevented = false;
    var preventDefaultOriginal = Event.prototype.preventDefault;
    Event.prototype.preventDefault = function() {
        if (preventingDefault) {
            defaultPrevented = true;
        }

        preventDefaultOriginal.apply(this, arguments);
    }


    var events = [
        'keypress',
        'keydown',
        'keyup'
    ];



    for (var i = 0; i < events.length; i++) {
        var event = events[i];
        var handler = function(name) {
            return function(e) {
                var shift = e.shiftKey;
                var ctrl = e.ctrlKey;

                var key = false;
                if (e.key && e.key.length == 1) {
                    key = e.key;
                } else if (typeof e.which != 'undefined') {
                    key = String.fromCharCode(e.which);
                } else if (typeof e.keyCode != 'undefined') {
                    key = String.fromCharCode(e.keyCode);
                }

                var isLetter = key.toLowerCase() != key.toUpperCase();

                var capslock = 
                        e.getModifierState ?
                        e.getModifierState('CapsLock') :
                   ((key != key.toLowerCase() && !shift) ||
                    (key != key.toUpperCase() && shift));

                if (!ctrl && isLetter && capslock) {
                    key = key[shift ? 'toUpperCase' : 'toLowerCase']();
                    var code =
                            name == 'keypress' ?
                            key.charCodeAt(0) :
                            key.toUpperCase().charCodeAt(0);

                    // can be 0 in FF
                    var keyCode = e.keyCode ? code : e.keyCode;

                    var fixedEvent;
                    try {
                        fixedEvent = new KeyboardEvent(name, {
                            bubbles     : e.bubbles,
                            composed    : e.composed,
                            view        : e.view,
                            key         : key,
                            ctrlKey     : e.ctlKey,
                            shiftKey    : e.shiftKey,
                            altKey      : e.altKey,
                            metaKey     : e.metaKey
                        }); 
                    } catch(e) {
                        var all = [
                            'Ctrl', 'Shift', 'Alt', 'Meta'
                        ];
                        var modifiers = [];
                        for (var i = 0; i < all.length; i++) {
                            if (e[all[i].toLowerCase() + 'Key']) {
                                modifiers.push(all[i]);
                            }
                        }
                        fixedEvent = document.createEvent('KeyboardEvent');

                        fixedEvent.initKeyboardEvent(
                            name,
                            e.bubbles,
                            e.cancelable,
                            window,
                            key,
                            e.location,
                            modifiers.join(' '),
                            e.repeat,
                            e.locale
                        );
                    }
 
 // TODO fix uppercase cyrillic && lower case when suppressed
                    
                    var codeVal = e.code;
                    var keyIdentifier = e.keyIdentifier;

                    if (name == 'keypress') {
                        Object.defineProperty(fixedEvent, 'charCode', {get:function(){return code;}}); 
                    }
                    Object.defineProperty(fixedEvent, 'which', {get:function(){return code;}}); 
                    Object.defineProperty(fixedEvent, 'keyCode', {get:function(){return keyCode;}}); 
                    Object.defineProperty(fixedEvent, 'code', {get:function(){return codeVal;}});

                    Object.defineProperty(fixedEvent, 'keyIdentifier', {get:function(){return keyIdentifier;}}); 

                    preventingDefault = true;
                    e.target.dispatchEvent(fixedEvent);
                    preventingDefault = false;

                    if (name == 'keydown') {
                        if (defaultPrevented) {
                            e.preventDefault();
                        }  // default emits the keypress
                    } else {
                        e.preventDefault();
                        if (name == 'keypress') {
                            if (!defaultPrevented) {
                                // default prints the character
                                printKey(key);
                            }
                        }
                    }

                    defaultPrevented = false;

                    e.stopImmediatePropagation(); 
                }
            }
        }

        window.addEventListener(event, handler(event), true);
    }


    
}));


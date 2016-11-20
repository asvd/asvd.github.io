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

    var printChr = function(chr) {
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
                        node.textContent = value.substr(0, point) + chr + value.substr(point, value.length-point);
                        ran.setStart(node, point+1);
                        ran.setEnd(node, point+1);
                    } else {
                        // between nodes, inserting textnode
                        var textnode = document.createTextNode(chr);
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
            basicInputEl.value = value.substr(0, selStart) + chr + value.substr(selEnd, value.length-selEnd);


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

// TODO blur hides the caret in FF and does not restore it on focus
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

 // TODO fire on blur if flag was triggered at this point
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

                var chr = false;
                if (e.key && e.key.length == 1) {
                    chr = e.key;
                } else if (typeof e.which != 'undefined') {
                    chr = String.fromCharCode(e.which);
                } else if (typeof e.keyCode != 'undefined') {
                    chr = String.fromCharCode(e.keyCode);
                }

                var isLetter = chr.toLowerCase() != chr.toUpperCase();

                var capslock = 
                        e.getModifierState ?
                        e.getModifierState('CapsLock') :
                   ((chr != chr.toLowerCase() && !shift) ||
                    (chr != chr.toUpperCase() && shift));

// TODO ctrl+capital letter event can be different
                if (isLetter && capslock) {
                    chr = chr[shift ? 'toUpperCase' : 'toLowerCase']();
                    var chrcode = chr.charCodeAt(0);

                    // fixed event config
                    var cfg = {
                        bubbles       : e.bubbles,
                        composed      : e.composed,
                        view          : e.view,
                        ctrlKey       : e.ctrlKey,
                        shiftKey      : e.shiftKey,
                        altKey        : e.altKey,
                        metaKey       : e.metaKey,

                        key           : chr,
                        code          : e.code,
                        charCode      : e.charCode,
                        which         : e.which,
                        keyCode       : e.keyCode
                    }

                    if (name == 'keypress') {
                        cfg.charCode  = chrcode;
                        cfg.which     = chrcode;
                        // can be 0 in FF, and should be kept
                        if (e.keyCode != 0) {
                            cfg.keyCode   = chrcode;
                        }
                    }

                    // creating the event
                    var fixedEvent;
                    try {
                        fixedEvent = new KeyboardEvent(name, cfg);
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
                            cfg.bubbles,
                            cfg.cancelable,
                            window,
                            chr,
                            e.location,
                            modifiers.join(' '),
                            e.repeat,
                            e.locale
                        );
                    }


                    for (var cfgKey in cfg) if (cfg.hasOwnProperty(cfgKey)) {
                        var cfgVal = cfg[cfgKey];
                        Object.defineProperty(
                            fixedEvent,
                            cfgKey,
                            { // val should not get into closure
                                get: (function(val){
                                    return function(){return val}
                                })(cfg[cfgKey])
                            }
                        );
                    }

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
                            if (!defaultPrevented && !ctrl) {
                                // default prints the character
                                printChr(chr);
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


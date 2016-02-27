(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['exports'], factory);
    } else if (typeof exports !== 'undefined') {
        factory(exports);
    } else {
        factory((root.microlight = {}));
    }
}(this, function (exports) {
    var _window = window;
    var _document = document;

    /**
     * Recursively calculates the node and a position inside that node
     * to restore the selection
     *
     * @param {Element} node root element
     * @param {Number} pos position offset related to the root element
     *
     * Returned value contains an object with keys p and n: n stands
     * for a subnode where the demanded position is located; p is a
     * position offset inside that elemnt. If n is null, that means
     * that the given pos exceeds the number of characters inside the
     * node and its subnodes. In this case the remaining amount of
     * characters is stored in p.
     */
    var findPos = function(node, pos, result, len) {
        if (len = node.length) {
            // text node
            if (pos >= len) {
                node = 0;
                pos -= len;
            }
        } else {
            // node with subnodes
            node = node.childNodes[0];
            do {
                result = findPos(node, pos);
                pos = result.p;
            } while (
                // if a node found, taking it and quitting the loop
                !(result.n && (node = result.n)) &&
                // otherwise quitting the loop when no subchild left
                (node = node.nextSibling)
            );
        }

        return {n:node, p:pos};
    }


    var reset = function(i, el, microlighted) {
        microlighted = _document.getElementsByClassName('microlight');

        for (i = 0; el = microlighted[i++];) {
            (function(el, cb, lastTextContent) {
                // MutationObserver can already be defined
                // (in case when reset() was invoked again)
                if (!el.ml) {
                    el.ml = (new MutationObserver(cb = function(){
                        var result = '',
                            text = el.textContent,
                            pos=0,
                            j=0,
                            sel = _window.getSelection(),
                            ran, res,
                            colorArr = /(\d*\, \d*\, \d*)(, ([.\d]*))?/g.exec(_window.getComputedStyle(el).color),
                            color = 'rgba('+colorArr[1]+',',
                            alpha = colorArr[3]||1,
                            lastType = 0;

                        if ((lastTextContent||'') != text) {
                            lastTextContent = text;

                            if (sel.rangeCount &&
                                el.contains((ran = sel.getRangeAt(0)).startContainer)
                            ) {
                                ran.setStart(el, 0);
                                pos = ran.toString().length;
                            }

                            // tokenizing the content
                            var token = '';
                            var type = null;

                            var prev2 = '';
                            var prev1 = '';
                            var chr   = 1;
                            var next  = text[0];
                            while (prev2 = prev1,
                                   prev1 = chr
                            ) {
                                chr = next;
                                next=text[++j];

                                // escaping if needed
                                if ((type == 'string1' || type == 'string2' || type == 'regex') &&
                                    prev2 == '\\') {
                                    prev1 = '';
                                }

                                // checking if token should be finalized
                                if (
                                    !type || !chr || {
                                        comment      : chr         == '\n',     //r
                                        multicomment : prev2+prev1 == '*/',     //r
                                        string1      : prev1 == "'" &&
                                                       token.length > 1,
                                        string2      : prev1 == '"' &&
                                                       token.length > 1,
                                        regex        : (prev1 == '/' || prev1 == '\n') &&
                                                       token.length > 1,
                                        word         : !/[$\w]/.test(chr),
                                        brace        : true,                    //r
                                        braceClose   : true,
                                        punctuation  : true                     //r
                                    }[type]
                                ) {
                                    // adding the token if finalized
                                    if (type) {
                                        result += '<span style="' + ({
                                                comment      : 'opacity:.5;text-shadow: 0px 0px 16px '+color + alpha*.5+')',
                                                multicomment : 'opacity:.5;text-shadow: 0px 0px 16px '+color + alpha*.5+')',
                                                string1      : 'opacity:.7;font-style:italic',
                                                string2      : 'opacity:.7;font-style:italic',
                                                regex        : 'text-shadow: 0px 0px 7px '+color + alpha*.8+'), 0px 0px 3px '+color + alpha*.5+')',
                                                word         : /^(abstract|arguments|boolean|break|byte|case|catch|char|class|const|continue|debugger|default|delete|do|double|else|enum|export|extends|false|finally|float|for|function|goto|if|implements|import|in|instanceof|int|interface|let|long|native|new|null|package|private|protected|public|return|short|static|struct|super|switch|this|throw|throws|transient|true|try|typeof|var|void|volatile|while|with|yield)$/.test(token) ?
                                                               'text-shadow: 0px 0px 12px '+color + alpha*.7+'), 0px 0px 3px '+color + alpha*.2+')':
                                                               '',
                                                brace        : 'opacity: .8; text-shadow: 0px 0px 7px '+color + alpha*.45+'), 0px 0px 3px '+color + alpha*.5+')',
                                                braceClose   : 'opacity: .8; text-shadow: 0px 0px 7px '+color + alpha*.45+'), 0px 0px 3px '+color + alpha*.5+')',
                                                punctuation  : 'opacity: .6; text-shadow: 0px 0px 7px '+color + alpha*.3+'), 0px 0px 3px '+color + alpha*.3+')'
                                            }[type]||'') + '">' + token.replace('<', '&lt;').replace('>', '&gt;') + '</span>';
                                        lastType = type;
                                    } else {
                                        result += token;
                                    }

                                    // initializing the new token
                                    type = token = '';
                                    if (chr+next == '//') {
                                        type = 'comment';
                                    } else if (chr+next == '/*') {
                                        type = 'multicomment';
                                    } else if (chr == "'") {
                                        type = 'string1';
                                    } else if (chr == '"') {
                                        type = 'string2';
                                    } else if (chr == '/' && (lastType == 'brace' ||
                                                              lastType == 'punctuation'||
                                                              lastType == 'comment' ||
                                                              lastType == 'multicomment') &&
                                               prev1 != '<'  // special fix for html closing tags
                                    ) {
                                        type = 'regex';
                                    } else if (/[$\w]/.test(chr)) {
                                        type = 'word';
                                    } else if (/[{}\[\(]/.test(chr)) {
                                        type = 'brace';
                                    } else if (/[\]\)]/.test(chr)) {
                                        type = 'braceClose';
                                    } else if (/[\-\+\*\/=<>:;|\.,!&]/.test(chr)) {
                                        type = 'punctuation';
                                    }
                                }

                                token += chr;
                            }


                            el.innerHTML = result;

                            if (pos) {
                                ran = _document.createRange();
                                res = findPos(el, pos);
                                ran.setStart(res.n, res.p);
                                ran.setEnd(res.n, res.p);
                                sel.removeAllRanges();
                                sel.addRange(ran);
                            }
                        }
                    })).observe(el, {
                        characterData : 1,
                        subtree       : 1,
                        childList     : 1
                    });

                    cb();
                }
            })(el);
        }
    }


    if (_document.readyState == 'complete') {
        reset();
    } else {
        _window.addEventListener('load', reset, 0);
    }

    exports.reset = reset;
}));

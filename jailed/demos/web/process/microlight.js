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
                            ran, res;

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

                                // checking if token should be finalized
                                if (!type || !chr || {
                                        comment      : chr         == '\n',
                                        multicomment : prev2+prev1 == '*/',
                                        string1      : prev1 == "'" &&
                                                       prev2 != '\\' &&
                                                       token.length > 1,
                                        string2      : prev1 == '"' &&
                                                       prev2 != '\\' &&
                                                       token.length > 1,
                                        word         : !/[$\w]/.test(chr),
                                        brace        : true
                                    }[type]
                                ) {
                                    // adding the token if finalized
                                    if (type) {
                                        result += '<span style="' + ({
                                                comment      : 'opacity:.5;font-style:italic',
                                                multicomment : 'opacity:.5;font-style:italic',
                                                string1      : 'opacity:.6',
                                                string2      : 'opacity:.6',
                                                word         : /^(abstract|arguments|boolean|break|byte|case|catch|char|class|const|continue|debugger|default|delete|do|double|else|enum|export|extends|false|finally|float|for|function|goto|if|implements|import|in|instanceof|int|interface|let|long|native|new|null|package|private|protected|public|return|short|static|super|switch|this|throw|throws|transient|true|try|typeof|var|void|volatile|while|with|yield)$/.test(token) ?
                                                               'font-weight:bold' :
                                                               '',
                                                brace        : 'font-weight:bold'
                                            }[type]||'') + '">' + token + '</span>';
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
                                    } else if (/[$\w]/.test(chr)) {
                                        type = 'word';
                                    } else if (/[{}\[\]\(\)]/.test(chr)) {
                                        type = 'brace';
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

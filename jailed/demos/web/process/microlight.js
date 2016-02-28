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
                            var type = 0;

                            var prev2 = '';
                            var prev1 = '';
                            var chr   = 1;
                            var next1  = text[0];
                            while (prev2 = prev1,
                                   prev1 = chr
                            ) {
                                chr = next1;
                                next1=text[++j];

                                // escaping if needed
                                if (type < 8 && // string or regex but not comments
                                    prev2 == '\\'
                                ) {
                                    // pervious character will not be
                                    // therefore recognized as a token
                                    // finalize condition
                                    prev1 = '';
                                }

                                // checking if token should be finalized
                                if (!type ||
                                    !chr  || // end of content
                                    [ // finalize condition for every token type
                                        1,                   // 1: operator
                                        1,                   // 2: opening brace
                                        1,                   // 3: closing brace
                                        !/[$\w]/.test(chr),  // 4: word
                                                             // 5: regex
                                        (prev1 == '/' || prev1 == '\n') && token.length > 1,
                                                             // 6: string with "
                                        prev1 == '"' && token.length > 1,
                                                             // 7: string with '
                                        prev1 == "'" && token.length > 1,
                                                             // 8: html comment
                                        text[j-4]+prev2+prev1 == '-->',
                                        prev2+prev1 == '*/', // 9: multiline comment
                                        chr         == '\n'  // 10: single-line comment
                                    ][type-1]
                                ) {
                                    // adding the token if finalized
                                    if (type) {
                                        result += '<span style="' + ([
                                            // 1: opreator
                                            'opacity: .5; text-shadow: 0px 0px 7px '+color + alpha*.25+'), 0px 0px 3px '+color + alpha*.25+')',
                                            // 2: opening brace
                                            'opacity: .8; text-shadow: 0px 0px 7px '+color + alpha*.45+'), 0px 0px 3px '+color + alpha*.5+')',
                                            // 3: closing brace
                                            'opacity: .8; text-shadow: 0px 0px 7px '+color + alpha*.45+'), 0px 0px 3px '+color + alpha*.5+')',
                                            // 4: word
                                            /^(abstract|arguments|boolean|break|byte|case|catch|char|class|const|continue|debugger|default|delete|do|double|else|enum|export|extends|false|finally|float|for|function|goto|if|implements|import|in|instanceof|int|interface|let|long|native|new|null|package|private|protected|public|return|short|static|struct|super|switch|this|throw|throws|transient|true|try|typeof|var|void|volatile|while|with|yield)$/.test(token) ?
//                                                'text-shadow: 0px 0px 10px '+color + alpha*.7+'), 0px 0px 3px '+color + alpha*.3+')':
                                                'text-shadow: 0px 0px 7px '+color + alpha*.7+'), 0px 0px 3px '+color + alpha*.4+')':
                                                '',
                                            // 5: regex
                                            'text-shadow: 0px 0px 7px '+color + alpha*.8+'), 0px 0px 3px '+color + alpha*.5+')',
                                            // 6: string with "
                                            'opacity:.7;font-style:italic',
                                            // 7: string with '
                                            'opacity:.7;font-style:italic',
                                            // 8: html comment
                                            'opacity:.5;text-shadow: 3px 0px 5px '+color + alpha*.3+'), -3px 0px 5px '+color + alpha*.3+');font-style:italic',
                                            // 9: multi-line comment
                                            'opacity:.5;text-shadow: 3px 0px 5px '+color + alpha*.3+'), -3px 0px 5px '+color + alpha*.3+');font-style:italic',
                                            // 10: single-line comment
                                            'opacity:.5;text-shadow: 3px 0px 5px '+color + alpha*.3+'), -3px 0px 5px '+color + alpha*.3+');font-style:italic'

                                            ][type-1]||'') + '">' + token.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</span>';

                                        if (type < 8) { // not a comment
                                            lastType = type;
                                        }
                                    } else {
                                        result += token;
                                    }

                                    // initializing the new token
                                    token = '';
                                    type = 11;

                                    while (![
                                        1,                     // 0: whatever else
                                                               // 1: operator
                                        /[\-\+\*\/=<>:;|\.,!&]/.test(chr),
                                        /[{}\[\(]/.test(chr),  // 2: opening brace
                                        /[\]\)]/.test(chr),    // 3: closing brace
                                        /[$\w]/.test(chr),     // 4: word,
                                        chr == '/' &&          // 5: regex
                                            // previous token was an
                                            // opening brace or an
                                            // operator (otherwise
                                            // division, not a regex)
                                            lastType < 3 &&
                                            // workaround for html
                                            // closing tags
                                            prev1 != '<',
                                        chr == '"',            // 6: string with "
                                        chr == "'",            // 7: string with '
                                                               // 8: html comment
                                        chr+next1+text[j+1]+text[j+2] == '<!--',
                                        chr+next1 == '/*',     // 9: multiline comment
                                        chr+next1 == '//'      // 10: single-line comment
                                    ][--type]);
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

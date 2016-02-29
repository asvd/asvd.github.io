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
    var test = 'test';
    var replace = 'replace';
    var length = 'length';

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
        if (len = node[length]) {
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
                            pxColor = 'px rgba('+colorArr[1]+',',
                            alpha = colorArr[3]||1,
                            lastType = 0;
                            

                        if ((lastTextContent||'') != text) {
                            lastTextContent = text;

                            if (sel.rangeCount &&
                                el.contains((ran = sel.getRangeAt(0)).startContainer)
                            ) {
                                ran.setStart(el, 0);
                                pos = ran.toString()[length];
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
                                        !/[$\w]/[test](chr),  // 4: word
                                                             // 5: regex
                                        (prev1 == '/' || prev1 == '\n') && token[length] > 1,
                                                             // 6: string with "
                                        prev1 == '"' && token[length] > 1,
                                                             // 7: string with '
                                        prev1 == "'" && token[length] > 1,
                                                             // 8: html comment
                                        text[j-4]+prev2+prev1 == '-->',
                                        prev2+prev1 == '*/', // 9: multiline comment
                                        chr         == '\n', // 10: single-line comment
                                        chr         == '\n', // 11: ruby-style comment
                                    ][type-1]
                                ) {
                                    var textShadow = ';text-shadow:';
                                    var opacity = ';opacity:.';
                                    var _0px_0px = ' 0px 0px ';
                                    var _3px_0px_5 = '3px 0px 5';
                                    var keywordStyle = textShadow+_0px_0px+7+pxColor + alpha*.6+'),'+_0px_0px+3+pxColor + alpha*.4+')';
                                    var stringStyle = opacity+7+textShadow+_3px_0px_5+pxColor + alpha*.3+'), -'+_3px_0px_5+pxColor + alpha*.3+')';
                                    var braceStyle = opacity+6+textShadow+_0px_0px+7+pxColor + alpha*.25+'),'+_0px_0px+3+pxColor + alpha*.25+')';

                                    // adding the token if finalized
                                    if (type) {
                                        result += '<span style="' + ([
                                            // 1: opreator
                                            braceStyle,
                                            // 2: opening brace
                                            braceStyle,
                                            // 3: closing brace
                                            braceStyle,
                                            // 4: word
                                            /^(a(bstract|nd|rguments|rray|s(m|sert)?|uto)|bool(ean)?|break|byte|c(ase|atch|har|lass|lone|onst|ontinue)|de(clare|bugger|f(ault)?|l(ete)?)|do|double|e(lif|lse(if)?|nd|num|x(cept|ec|p(licit|ort)|te(nds|rn)))|f(alse|inal(ly)?|loat|or(each)?|riend|rom|unction)|global|goto|i(f|mplements|mport|n(line|clude)?|nstanceof|nt(erface)?|s)|lambda|let|long|module|mutable|n(amespace|ative|ew|il|ot|ull)|operator|or|p(ackage|rivate|rotected|ublic)|r(aise|egister|equire|eturn)|s(elf|hort|izeof|tatic|truct|uper|witch)|t(emplate|hen|his|hrow(s?)|ransient|rue|ry|ype(def|id|name|of))|union|(un)?signed|use|using|var|virtual|void|volatile|when|while|with|xor|yield)$/[test](token) ?
                                                keywordStyle:
                                                ' ',
                                            // 5: regex
                                            stringStyle,
                                            // 6: string with "
                                            stringStyle,
                                            // 7: string with '
                                            stringStyle
                                            // 8: html comment
                                            // 9: multi-line comment
                                            // 10: single-line comment
                                            // 10: ruby-style comment
                                            //      -- all default to comment style
                                            ][type-1]||
                                                // default comment style
                                                'font-style:italic'+opacity+5+textShadow+_3px_0px_5+pxColor + alpha*.3+'), -'+_3px_0px_5+pxColor + alpha*.3+')'
                                            ) + '">' + token[replace](/&/g, '&amp;')[replace](/</g, '&lt;')[replace](/>/g, '&gt;') + '</span>';

                                        if (type < 8) { // not a comment
                                            lastType = type;
                                        }
                                    } else {
                                        result += token;
                                    }

                                    // initializing the new token
                                    token = '';

                                    // going down until matching a
                                    // token type start condition
                                    type = 12;
                                    while (![
                                        1,                     // 0: whatever else
                                                               // 1: operator
                                        /[\-\+\*\/=<>:;|\.,?!&@~]/[test](chr),
                                        /[{}\[\(]/[test](chr), // 2: opening brace
                                        /[\]\)]/[test](chr),   // 3: closing brace
                                        /[$\w]/[test](chr),    // 4: word,
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
                                        chr+next1 == '//',     // 10: single-line comment
                                        chr == '#'             // 11: ruby-style comment
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

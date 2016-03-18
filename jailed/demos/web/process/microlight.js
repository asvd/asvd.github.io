/**
 * @fileoverview microlight - syntax highlightning library
 * @version 0.0.1
 * 
 * @license MIT, see http://github.com/asvd/microlight
 * @copyright 2015 asvd <heliosframework@gmail.com> 
 */


(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['exports'], factory);
    } else if (typeof exports !== 'undefined') {
        factory(exports);
    } else {
        factory((root.microlight = {}));
    }
}(this, function (exports) {
    var _window   = window;
    var _document = document;
    var test      = 'test';
    var replace   = 'replace';
    var length    = 'length';
    var childNodes = 'childNodes';
    var brtr = /(br|tr)/i;
    var mutationObserveOptions = {
        characterData : 1,
        subtree       : 1,
        childList     : 1
    };



    /**
     * Recursively runs through (sub)nodes and performs one of the two
     * actions:
     *
     * - if selNode argument is given, it means that the function
     *   extracts the text content, replacing all <br> and <tr> tags
     *   with the newlines (which are not recognized by the
     *   .textContent property of an element); additionally the
     *   function calculates the selection offset mesaured in number
     *   of symbols in the resulted text; in this case, selNode is the
     *   original element holding the selection, and pos is the offset
     *   inside that element; reuslt contains the .t property with the
     *   resulted text, and .p property with the selection offest
     *   (which is -1 in case when the selection position is outside
     *   of the node);
     *
     * - if selNode argument is not provided, the function restores
     *   the selection position in the generated highlited code
     *   contained in the given node; in this case, pos stands for the
     *   selection position inside the node; the resulted object
     *   contans the .n property, holding the element, where the
     *   selection should be restored, and the .p property standing
     *   for the proper selection position inisde that element; if the
     *   given selection position (pos) is greater than the number of
     *   characters in the given node, this means that the node
     *   holding the selection is not yet reached; in latter case the
     *   .n property of the returned object is 0, and .p is the
     *   remaining number of characters before the selection is
     *   reached.
     *
     * @param {Object} node to run through
     * @param {Numebr} pos
     * @param {Object} selNode
     *
     * @returns {Object} containing .n, .p, and .t properties
     */
    var burrowNodes = function(node, pos, selNode) {
        var resultText = '',
            resultNode = 0,
            resultPos = selNode?-1:pos,
            i = 0, result, len;
        if (len = node[length]) {
            // text node
            resultText = node.textContent;

            if (selNode) {
                if (selNode == node) {
                    resultPos = pos;
                }
            } else if (pos > len) {
                resultPos -= len;
            } else {
                resultNode = node;
            }
        } else {
            if (node[childNodes][length]) {
                // node with subnodes
                for (i = 0; i < node[childNodes][length]; i++) {
                    result = burrowNodes(
                        node[childNodes][i],
                        selNode ? pos : resultPos,
                        selNode
                    );

                    if (selNode) {
                        if (selNode == node && pos == i) {
                            resultPos = resultText[length];
                        }

                        if (result.p+1) { // same as if (result.p >= 0)
                            resultPos = resultText[length] + result.p;
                        }
                    } else {
                        resultPos = result.p;
                        if (result.n) {
                            // node found, takingit and quitting the loop
                            resultNode = result.n;
                            break;
                        }
                    }

                    resultText += result.t;
                }
            } else {
                // node without subnodes
                if (selNode) {
                    if (selNode == node) {
                        // span with no children (happens on FF when removing
                        // the contents)
                        resultPos = 0;
                    }
                } else {
                    // if point not reached, decreasing the pos one symbol,
                    // otherwise stariting the loop with -1
                    resultPos--;

                    // if point not yet reached, resultNode is set to false
                    // (otherwise redefined in inner loop)
                    if (resultNode = !pos) {
                        // point right before the node, resultPos == 0
                        while ((resultNode = node.parentNode)[childNodes][++resultPos] != node);
                    }
                }
            }

            if (brtr[test](node.nodeName)) {
                resultText += '\n';
            }
        }

        return {
            t : resultText,
            n : resultNode,
            p : resultPos
        };
    }


    var reset = function(i, el, microlighted) {
        microlighted = _document.getElementsByClassName('microlight');

        for (i = 0; el = microlighted[i++];) {
            (function(el, cb) {
                // MutationObserver can already be defined
                // (in case when reset() was invoked again)
                if (!el.ml) {
                    (el.ml = new MutationObserver(cb =
function(){

    var result     = '',

        // selection data
        sel        = _window.getSelection(),
        ran, res,

        // style and color templates
        textShadow = ';text-shadow:',
        opacity    = ';opacity:.',
        _0px_0px   = ' 0px 0px ',
        _3px_0px_5 = '3px 0px 5',
        colorArr   = /(\d*\, \d*\, \d*)(, ([.\d]*))?/g.exec(
            _window.getComputedStyle(el).color
        ),
        pxColor    = 'px rgba('+colorArr[1]+',',
        alpha      = colorArr[3]||1,
        token      = '',  // current token

        // current token type:
        //  0: whitespace
        //  1: newline (separate token as <br/> tag)
        //  2: operator or brace                                        
        //  3: closing brace (after which '/' is division not regex)    
        //  4: (key)word                                                
        //  5: regex                                                    
        //  6: string starting with "                                   
        //  7: string starting with '                                   
        //  8: xml comment  <!-- -->                                    
        //  9: multiline comment /* */                                  
        // 10: single-line comment starting with two slashes //         
        // 11: single-line comment starting with a hash #               
        type = 0,
        lastType = 0,

        text,
        j          = 0,        // current character position

        // particular characters from a parsed string of code
        prev2,                 // character before the previous
        prev1,                 // previous character
        chr        = 1,        // current character
        next1,                 // next character

        // should not be false when given to burrowNodes (so that it
        // works in the proper mode of extracting text), but should
        // not also be recognized as any of existing nodes
        selEl = 1,
        selOffset = 0,
        content,
        node; // used when restoring selection

    if (sel.rangeCount) {
        ran = sel.getRangeAt(0);
        selEl = ran.startContainer;
        selOffset = ran.startOffset;
    }

    content = burrowNodes(el, selOffset, selEl);

    text = content.t;
    
    next1 = text[0];

    // tokenizing the content
    while (prev2 = prev1,
           // escaping if needed
           // pervious character will not be
           // therefore recognized as a token
           // finalize condition
           prev1 = type < 8 && prev1 == '\\' ? 1 : chr
    ) {
        chr = next1;
        next1=text[++j];

        // checking if token should be finalized
        if (!chr  || // end of content
            // types 0-1 (whitespace and newline, not
            // highlighted), types 1 - 2 (operators and braces)
            // always consist of a single character
            type < 4 ||
            // types 10-11 (single-line comments) end with a
            // newline
            (type > 9 && chr == '\n') ||
            [ // finalize condition for other token types
                !/[$\w]/[test](chr), // 4: (key)word
                                     // 5: regex
                (prev1 == '/' || prev1 == '\n') && token[length] > 1,
                                     // 6: string with "
                prev1 == '"' && token[length] > 1,
                                     // 7: string with '
                prev1 == "'" && token[length] > 1,
                                     // 8: xml comment
                text[j-4]+prev2+prev1 == '-->',
                prev2+prev1 == '*/'  // 9: multiline comment
            ][type-4]
        ) {
            // appending the token to the result
            if (type) {
                result +=
                    // newline
                    type == 1 ? '<br/>' :
                    // everything else
                    '<span style="' + (
                    // operators and braces
                    type < 4 ?
                        opacity+6+
                        textShadow+_0px_0px+7+pxColor + alpha/4+'),'+
                                   _0px_0px+3+pxColor + alpha/4+')' :
                    // comments
                    type > 7 ?
                        'font-style:italic'+
                        opacity+5+
                        textShadow+_3px_0px_5+pxColor + alpha/3+'),-'+
                                   _3px_0px_5+pxColor + alpha/3+')' :
                    // regex and strings
                    type > 4 ?
                        opacity+7+
                        textShadow+_3px_0px_5+pxColor + alpha/5+'),-'+
                                   _3px_0px_5+pxColor + alpha/5+')' :
                    // type == 4 (key)word
                    /^(a(bstract|lias|nd|rguments|rray|s(m|sert)?|uto)|b(ase|egin|ool(ean)?|reak|yte)|c(ase|atch|har|hecked|lass|lone|ompl|onst|ontinue)|de(bugger|cimal|clare|f(ault|er)?|init|l(egate|ete)?)|do|double|e(cho|ls?if|lse(if)?|nd|nsure|num|vent|x(cept|ec|p(licit|ort)|te(nds|nsion|rn)))|f(allthrough|alse|inal(ly)?|ixed|loat|or(each)?|riend|rom|unc(tion)?)|global|goto|guard|i(f|mp(lements|licit|ort)|n(it|clude(_once)?|line|out|stanceof|t(erface|ernal)?)?|s)|l(ambda|et|ock|ong)|module|mutable|NaN|n(amespace|ative|ext|ew|il|ot|ull)|o(bject|perator|r|ut|verride)|p(ackage|arams|rivate|rotected|rotocol|ublic)|r(aise|e(adonly|do|f|gister|peat|quire(_once)?|scue|strict|try|turn))|s(byte|ealed|elf|hort|igned|izeof|tatic|tring|truct|ubscript|uper|ynchronized|witch)|t(emplate|hen|his|hrows?|ransient|rue|ry|ype(alias|def|id|name|of))|u(n(checked|def(ined)?|ion|less|signed|til)|se|sing)|v(ar|irtual|oid|olatile)|w(char_t|hen|here|hile|ith)|xor|yield)$/[test](token) ?
                    textShadow+_0px_0px+7+pxColor + alpha*.6+'),'+
                               _0px_0px+3+pxColor + alpha*.4+')' :
                    ' '
                ) + '">' + token[replace](/&/g, '&amp;')
                                [replace](/</g, '&lt;')
                                [replace](/>/g, '&gt;') + '</span>';

                if (type < 8) { // not a comment
                    lastType = type;
                }
            } else {
                result += token;
            }

            // initializing a new token
            token = ''

            // going down until matching a
            // token type start condition
            type = 13;
            while (![
                1,                   //  0: whitespace
                chr == '\n',         //  1: newline
                                     //  2: operator or braces
                /[{}\[\(\-\+\*\/=<>:;|\.,?!&@~]/[test](chr),
                /[\]\)]/[test](chr), //  3: closing brace
                /[$\w]/[test](chr),  //  4: word,
                chr == '/' &&        //  5: regex
                    // previous token was an
                    // opening brace or an
                    // operator (otherwise
                    // division, not a regex)
                    lastType < 3 &&
                    // workaround for xml
                    // closing tags
                    prev1 != '<',
                chr == '"',          //  6: string with "
                chr == "'",          //  7: string with '
                                     //  8: xml comment
                chr+next1+text[j+1]+text[j+2] == '<!--',
                chr+next1 == '/*',   //  9: multiline comment
                chr+next1 == '//',   // 10: single-line comment
                chr == '#'           // 11: hash-style comment
            ][--type]);
        }

        token += chr;
    }

    // temporarily disconnecting the observer for changing the dom
    el.ml.disconnect();
    el.innerHTML = result;

    // restoring the selection position
    // same as if (pos >= 0)
    if (content.p+1) {
        sel.removeAllRanges();

        res = burrowNodes(el, content.p);

        node = res.n[childNodes] && res.n[childNodes][res.p];
        if (!res.n[length] && node && brtr[test](node.nodeName)) {
            // between the nodes, next node is <br/>

            // replacing next node with '\n' and putting the
            // selection there (otherwise chorme treats it wrong)
            el.replaceChild(
                (res = {n:_document.createTextNode('\n'), p:0}).n,
                node
            );
        }


        ran.setStart(res.n,res.p);
        ran.setEnd(res.n,res.p);
        sel.addRange(ran);
    }


    el.ml.observe(el, mutationObserveOptions);

}
                )).observe(el, mutationObserveOptions);

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


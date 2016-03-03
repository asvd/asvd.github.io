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
                    el.ml = (new MutationObserver(cb =
function(){
    var result     = '',

        // selection data
        sel        = _window.getSelection(),
        ran, res,
        pos,       // preserved selection position

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
        //  1: operator or brace
        //  2: closing brace (after which '/' is division not regex)
        //  3: (key)word
        //  4: regex
        //  5: string starting with "
        //  6: string starting with '
        //  7: xml comment  <!-- -->
        //  8: multiline comment /* */
        //  9: single-line comment starting with two slashes //
        // 10: single-line comment starting with a hash #
        type = 0,
        lastType,

        text       = el.textContent,
        j          = 0,        // current character position

        // particular characters from a parsed string of code
        prev2,                 // character before the previous
        prev1,                 // previous character
        chr        = 1,        // current character
        next1      = text[0];  // next character

    if ((lastTextContent||token) != text) {
        lastTextContent = text;

        // saving the selection position
        if (sel.rangeCount &&
            el.contains((ran = sel.getRangeAt(0)).startContainer)
        ) {
            ran.setStart(el, 0);
            pos = ran.toString()[length];
        }

        // tokenizing the content
        while (prev2 = prev1,
               // escaping if needed
               // pervious character will not be
               // therefore recognized as a token
               // finalize condition
               prev1 = type < 7 && prev1 == '\\' ? 1 : chr
        ) {
            chr = next1;
            next1=text[++j];

            // checking if token should be finalized
            if (!chr  || // end of content
                // types 0 (whitespace, not highlighted), types 1 - 2
                // (operators and braces) always consist of a single
                // character
                type < 3 ||
                // types 9-10 (single-line comments) end with a
                // newline
                (type > 8 && chr == '\n') ||
                [ // finalize condition for other token types
                    !/[$\w]/[test](chr), // 3: word
                                         // 4: regex
                    (prev1 == '/' || prev1 == '\n') && token[length] > 1,
                                         // 5: string with "
                    prev1 == '"' && token[length] > 1,
                                         // 6: string with '
                    prev1 == "'" && token[length] > 1,
                                         // 7: xml comment
                    text[j-4]+prev2+prev1 == '-->',
                    prev2+prev1 == '*/'  // 8: multiline comment
                ][type-3]
            ) {
                // appending the token to the result
                if (type) {
                    result += '<span style="' + (
                        // operators and braces
                        type < 3 ?
                            opacity+6+
                            textShadow+_0px_0px+7+pxColor + alpha/4+'),'+
                                       _0px_0px+3+pxColor + alpha/4+')' :
                        // comments
                        type > 6 ?
                            'font-style:italic'+
                            opacity+5+
                            textShadow+_3px_0px_5+pxColor + alpha/3+'), -'+
                                       _3px_0px_5+pxColor + alpha/3+')' :
                        // regex and strings
                        type > 3 ?
                            opacity+7+
                            textShadow+_3px_0px_5+pxColor + alpha/5+'), -'+
                                       _3px_0px_5+pxColor + alpha/5+')' :
                        // type == 4 (key)word
                        /^(a(bstract|lias|nd|rguments|rray|s(m|sert)?|uto)|b(ase|egin|ool(ean)?|reak|yte)|c(ase|atch|har|hecked|lass|lone|ompl|onst|ontinue)|de(bugger|cimal|clare|f(ault|er)?|init|l(egate|ete)?)|do|double|e(cho|ls?if|lse(if)?|nd|nsure|num|vent|x(cept|ec|p(licit|ort)|te(nds|nsion|rn)))|f(allthrough|alse|inal(ly)?|ixed|loat|or(each)?|riend|rom|unc(tion)?)|global|goto|guard|i(f|mp(lements|licit|ort)|n(it|clude(_once)?|line|out|stanceof|t(erface|ernal)?)?|s)|l(ambda|et|ock|ong)|module|mutable|NaN|n(amespace|ative|ext|ew|il|ot|ull)|o(bject|perator|r|ut|verride)|p(ackage|arams|rivate|rotected|rotocol|ublic)|r(aise|e(adonly|do|f|gister|peat|quire(_once)?|scue|strict|try|turn))|s(byte|ealed|elf|hort|igned|izeof|tatic|tring|truct|ubscript|uper|ynchronized|witch)|t(emplate|hen|his|hrows?|ransient|rue|ry|ype(alias|def|id|name|of))|u(n(checked|def(ined)?|ion|less|signed|til)|se|sing)|v(ar|irtual|oid|olatile)|w(char_t|hen|here|hile|ith)|xor|yield)$/[test](token) ?
                        textShadow+_0px_0px+7+pxColor + alpha*.6+'),'+
                                   _0px_0px+3+pxColor + alpha*.4+')' :
                        ' '
                    ) + '">' + token[replace](/&/g, '&amp;')
                                    [replace](/</g, '&lt;')
                                    [replace](/>/g, '&gt;') + '</span>';

                    if (type < 7) { // not a comment
                        lastType = type;
                    }
                } else {
                    result += token;
                }

                // initializing a new token

                // going down until matching a
                // token type start condition
                type = 11;
                while (![
                    1,                   //  0: whitespace
                                         //  1: operator or braces
                    /[{}\[\(\-\+\*\/=<>:;|\.,?!&@~]/[test](chr),
                    /[\]\)]/[test](chr), //  2: closing brace
                    /[$\w]/[test](chr),  //  3: word,
                    chr == '/' &&        //  4: regex
                        // previous token was an
                        // opening brace or an
                        // operator (otherwise
                        // division, not a regex)
                        lastType < 3 &&
                        // workaround for xml
                        // closing tags
                        prev1 != '<',
                    chr == '"',          //  5: string with "
                    chr == "'",          //  6: string with '
                                         //  7: xml comment
                    chr+next1+text[j+1]+text[j+2] == '<!--',
                    chr+next1 == '/*',   //  8: multiline comment
                    chr+next1 == '//',   //  9: single-line comment
                    chr == '#'           // 10: hash-style comment
                ][--type])token = '';
            }

            token += chr;
        }

        el.innerHTML = result;

        if (pos) {
            // restoring the selection position
            ran = _document.createRange();
            res = findPos(el, pos)
            ran.setStart(res.n, res.p);
            ran.setEnd(res.n, res.p);
            sel.removeAllRanges();
            sel.addRange(ran);
        }
    }
}
            )).observe(el, {
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


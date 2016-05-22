/**
 * @fileoverview microlight - syntax highlightning library
 * @version 0.0.1
 *
 * @license MIT, see http://github.com/asvd/microlight
 * @copyright 2015 asvd <heliosframework@gmail.com>
 *
 * Code structure aims at minimizing the compressed library size
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
    // aliases for a better compression
    var _window       = window,
        _document     = document,
        appendChild   = 'appendChild',
        test          = 'test',

        el,  // current microlighted element to run through

        // style and color templates
        textShadow = ';text-shadow:',
        opacity    = 'opacity:.',
        _0px_0px   = ' 0px 0px ',
        _3px_0px_5 = '3px 0px 5',
        brace = ')',

        // dynamic set of nodes to highlight
        microlighted = _document.getElementsByClassName('microlight');

    
    var reset = function(i) {
        for (i = 0; el = microlighted[i++];) {
            var text  = el.textContent,
                pos   = 0,       // current position
                next1 = text[0], // next character
                chr,             // current character
                prev1,           // previous character
                prev2,           // the one before the previous
                                 // content of the current token
                token = el.innerHTML = '',
                
                // current token type:
                //  0: anything else (normally whitespace, not highlighted)
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
                // 11: single-line comment starting with hash #
                tokenType = 0,

                // kept to determine between regex and division
                lastTokenType,
                node,

                // calculating the colors for the style templates
                colorArr = /(\d*\, \d*\, \d*)(, ([.\d]*))?/g.exec(
                    _window.getComputedStyle(el).color
                ),
                pxColor  = 'px rgba('+colorArr[chr=1]+',',
                alpha  = colorArr[3]||1,
                multichar;  // flag determining if token is multi-character

            // running through characters and highlighting
            while (prev2 = prev1,
                   // escaping if needed (with except for comments)
                   // pervious character will not be therefore
                   // recognized as a token finalize condition
                   prev1 = tokenType < 8 && prev1 == '\\' ? 1 : chr
            ) {
                chr = next1;
                next1=text[++pos];
                multichar = token.length > 1;

                // checking if current token should be finalized
                if (!chr  || // end of content
                    // whitespaces are merged together
                    (!tokenType && /\S/[test](chr)) ||
                    // types 1-3 (newline, operators and braces)
                    // always consist of a single character
                    (tokenType && tokenType < 4) ||
                    // types 10-11 (single-line comments) end with a
                    // newline
                    (tokenType > 9 && chr == '\n') ||
                    [ // finalize conditions for other token types
                        // 4: (key)word
                        !/[$\w]/[test](chr),
                        // 5: regex
                        (prev1 == '/' || prev1 == '\n') && multichar,
                        // 6: string with "
                        prev1 == '"' && multichar,
                        // 7: string with '
                        prev1 == "'" && multichar,
                        // 8: xml comment
                        text[pos-4]+prev2+prev1 == '-->',
                        // 9: multiline comment
                        prev2+prev1 == '*/'
                    ][tokenType-4]
                ) {
                    // appending the token to the result
                    if (token) {
                        el[appendChild](node = _document.createElement('span'));
                        node[appendChild](_document.createTextNode(token));

                        // remapping token type into style
                        // (some types are highlighted similarly)
                        node.setAttribute('style', [
                            // 0: not formatted
                            '',
                            // 1: punctuation
                            opacity + 6 +
                            textShadow + _0px_0px+7+pxColor + alpha / 4 + '),' +
                                         _0px_0px+3+pxColor + alpha / 4 + brace,
                            // 2: keywords
                            textShadow + _0px_0px+7+pxColor + alpha * .6 + '),' +
                                         _0px_0px+3+pxColor + alpha * .4 + brace,
                            // 3: strings and regexps
                            opacity + 7 +
                            textShadow + _3px_0px_5+pxColor + alpha / 5 + '),-' +
                                         _3px_0px_5+pxColor + alpha / 5 + brace,
                            // 4: comments
                            'font-style:italic;'+
                            opacity + 5 +
                            textShadow + _3px_0px_5+pxColor + alpha / 3 + '),-' +
                                         _3px_0px_5+pxColor + alpha / 3 + brace
                        ][
                            // not formatted
                            tokenType < 2 ? 0 :
                            // punctuation
                            tokenType < 4 ? 1 :
                            // comments
                            tokenType > 7 ? 4 :
                            // regex and strings
                            tokenType > 4 ? 3 :
                            // otherwise tokenType == 4, (key)word
                            /^(a(bstract|lias|nd|rguments|rray|s(m|sert)?|uto)|b(ase|egin|ool(ean)?|reak|yte)|c(ase|atch|har|hecked|lass|lone|ompl|onst|ontinue)|de(bugger|cimal|clare|f(ault|er)?|init|l(egate|ete)?)|do|double|e(cho|ls?if|lse(if)?|nd|nsure|num|vent|x(cept|ec|p(licit|ort)|te(nds|nsion|rn)))|f(allthrough|alse|inal(ly)?|ixed|loat|or(each)?|riend|rom|unc(tion)?)|global|goto|guard|i(f|mp(lements|licit|ort)|n(it|clude(_once)?|line|out|stanceof|t(erface|ernal)?)?|s)|l(ambda|et|ock|ong)|module|mutable|NaN|n(amespace|ative|ext|ew|il|ot|ull)|o(bject|perator|r|ut|verride)|p(ackage|arams|rivate|rotected|rotocol|ublic)|r(aise|e(adonly|do|f|gister|peat|quire(_once)?|scue|strict|try|turn))|s(byte|ealed|elf|hort|igned|izeof|tatic|tring|truct|ubscript|uper|ynchronized|witch)|t(emplate|hen|his|hrows?|ransient|rue|ry|ype(alias|def|id|name|of))|u(n(checked|def(ined)?|ion|less|signed|til)|se|sing)|v(ar|irtual|oid|olatile)|w(char_t|hen|here|hile|ith)|xor|yield)$/[test](token) ? 2 : 0
                        ]);
                    }

                    // saving the previous token type
                    // (skipping whitespaces and newlines)
                    lastTokenType = tokenType > 1 ? tokenType :
                                    lastTokenType;

                    // initializing a new token
                    token = '';

                    // determining the new token type (going down
                    // until matching a token type start condition)
                    tokenType = 13;
                    while (![
                        1,                   //  0: whitespace
                        chr == '\n',         //  1: newline
                                             //  2: operator or braces
                        /[\/{}[(\-+*=<>:;|\\.,?!&@~]/[test](chr),
                        /[\])]/[test](chr),  //  3: closing brace
                        /[$\w]/[test](chr),  //  4: (key)word
                        chr == '/' &&        //  5: regex
                            // previous token was an
                            // opening brace or an
                            // operator (otherwise
                            // division, not a regex)
                            (lastTokenType < 3) &&
                            // workaround for xml
                            // closing tags
                            prev1 != '<',
                        chr == '"',          //  6: string with "
                        chr == "'",          //  7: string with '
                                             //  8: xml comment
                        chr+next1+text[pos+1]+text[pos+2] == '<!--',
                        chr+next1 == '/*',   //  9: multiline comment
                        chr+next1 == '//',   // 10: single-line comment
                        chr == '#'           // 11: hash-style comment
                    ][--tokenType]);
                }

                token += chr;
            }
        }
    }

    exports.reset = reset;

    if (_document.readyState == 'complete') {
        reset();
    } else {
        _window.addEventListener('load', reset, 0);
    }
}));


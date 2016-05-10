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

    // TODO mark position in the node itself as a property
    // (in order to avoid changing the DOM)
    var nullChr = '\0';

    var mutationObserveOptions = {
        characterData : 1,
        subtree       : 1,
        childList     : 1
    };



    /**
     * Recursively runs through (sub)nodes of the given element and
     * performs one of two actions:
     *
     * - if selNode argument is given, the function extracts the text
     *   content, replacing all <br> and <tr> tags with the newlines
     *   (which are not recognized by the .textContent property of an
     *   element). Additionally the function calculates the selection
     *   offset mesaured in number of symbols in the resulted text; in
     *   this case, selNode is the original element holding the
     *   selection, and pos is the offset inside that element
     *   (selNodeEnd and posEnd arguments then have the same meaning,
     *   but are related to the selection end respectively). Reuslt
     *   object contains the .t property with the resulted text, .p
     *   property with the selection start offest (which is -1 in case
     *   when the selection position is outside of the node), and .e
     *   property holding the selection end position in the resulted
     *   text;
     *
     * - if selNode argument is not provided, the function restores
     *   the selection position in the generated highlited code
     *   contained in the given node. In this case, pos stands for the
     *   selection position inside the node, and posEnd is the
     *   selection end position. The resulted object contans the .n
     *   property, holding the element, where the selection should be
     *   restored, and the .p property standing for the proper
     *   selection position inisde that element; if the given
     *   selection position (pos) is greater than the number of
     *   characters in the given node, this means that the node
     *   holding the selection is not yet reached; in latter case the
     *   .n property of the returned object is 0, and .p is the
     *   remaining number of characters before the selection is
     *   reached.
     *
     * @param {Object} node to run through
     * @param {Numebr} pos
     * @param {Object} selNode
     * @param {Numebr} posEnd
     * @param {Object} selNodeEnd
     *
     * @returns {Object} containing .n, .p, and .t properties
     */
    var burrowNodes = function(node, pos, selNode, posEnd, selNodeEnd) {
        var resultText = '',
            resultNode = 0,
            resultNodeEnd = 0,
            resultPos = selNode?-1:pos,
            resultPosEnd = selNode?-1:posEnd,
            resultMarker1 = -1,
            resultMarker2 = -1,
            i = 0, result, len;
        if (len = node[length]) {
            // text node
            if (node.textContent == nullChr) {
                // cahnge marker
                resultMarker1 = 0;
            } else {
                resultText = node.textContent;
            }

            if (selNode) {
                if (selNode == node) {
                    resultPos = pos;
                }

                if (selNodeEnd == node) {
                    resultPosEnd = posEnd;
                }
            } else {
                if (pos > len) {
                    resultPos -= len;
                } else {
                    resultNode = node;
                }

                if (posEnd > len) {
                    resultPosEnd -= len;
                } else {
                    resultNodeEnd = node;
                }
            }
        } else {
            if (node[childNodes][length]) {
                // node with subnodes
                for (i = 0; i < node[childNodes][length]; i++) {
                    result = burrowNodes(
                        node[childNodes][i],
                        selNode ? pos : resultPos,
                        selNode,
                        selNode ? posEnd : resultPosEnd,
                        selNodeEnd
                    );

                    if (selNode) {
                        if (selNode == node && pos == i) {
                            resultPos = resultText[length];
                        }

                        if (result.p+1) { // same as if (result.p >= 0)
                            resultPos = resultText[length] + result.p;
                        }

                        if (selNodeEnd == node && posEnd == i) {
                            resultPosEnd = resultText[length];
                        }

                        if (result.e+1) { // same as if (result.e >= 0)
                            resultPosEnd = resultText[length] + result.e;
                        }

                        if (result.m+1) {
                            if (!(resultMarker2+1)) {
                                resultMarker2 = resultMarker1;
                            } // otherwise first marker already set

                            resultMarker1 = resultText[length] + result.m;
                        }

                        if (result.M+1) {
                            if (!(resultMarker2+1)) {
                                resultMarker2 = resultMarker1;
                            } // otherwise first marker already set

                            resultMarker1 = resultText[length] + result.M;
                        }
                    } else {
                        if (!resultNode) {
                            resultPos = result.p;
                            if (result.n) {
                                // node found
                                resultNode = result.n;
                            }
                        }

                        if (!resultNodeEnd) {
                            resultPosEnd = result.e;
                            if (result.E) {
                                // node found
                                resultNodeEnd = result.E;
                            }
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
                    if (selNodeEnd == node) {
                        // span with no children (happens on FF when removing
                        // the contents)
                        resultPosEnd = 0;
                    }
                } else {
                    // if point not reached, decreasing the pos one symbol,
                    // otherwise stariting the loop with -1
                    resultPos--;
                    resultPosEnd--;

                    // if point not yet reached, resultNode is set to false
                    // (otherwise redefined in inner loop)
                    if (resultNode = !pos) {
                        // point right before the node, resultPos == 0
                        while (node.parentNode[childNodes][++resultPos] != node);
                        // if not <br>, then it's the highlighted
                        // element itself (but with empty content)
                        resultNode = brtr[test](node.nodeName) ? node.parentNode : node;
                    }

                    if (resultNodeEnd = !posEnd) {
                        // point right before the node, resultPos == 0
                        while (node.parentNode[childNodes][++resultPosEnd] != node);
                        // if not <br>, then it's the highlighted
                        // element itself (but with empty content)
                        resultNodeEnd = brtr[test](node.nodeName) ? node.parentNode : node;
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
            E : resultNodeEnd,
            p : resultPos,
            e : resultPosEnd,
            m : resultMarker1,
            M : resultMarker2
        };
    }


    /**
     * Inserts the special markers around the selection, so that the
     * change will be recognized after tokenizing, even despite the
     * content could partially match to what was on that place
     */
    var markSelection = function(ev) {
        // TODO suppress observation in the element property
        if (ev && ev.currentTarget) {
            ev.currentTarget.ml.disconnect();
        }

        var sel = window.getSelection();
        var ran = sel.getRangeAt(0);
        var marker1 = _document.createTextNode(nullChr);
        var marker2 = _document.createTextNode(nullChr);
        ran.insertNode(marker1);
        ran.setStart(ran.endContainer, ran.endOffset);
        ran.insertNode(marker2);
        ran.setStartAfter(marker1);
        ran.setEndBefore(marker2);
        sel.removeAllRanges();
        sel.addRange(ran);

        // TODO suppress observation in the element property
        if (ev && ev.currentTarget) {
            ev.currentTarget.ml.observe(ev.currentTarget, mutationObserveOptions);
        }
    }


    var reset = function(i, el, microlighted) {
        microlighted = _document.getElementsByClassName('microlight');

        for (i = 0; el = microlighted[i++];) {
            (function(el, cb, previouslyFormatted) {
                // MutationObserver can already be defined
                // (in case when reset() was invoked again)
                if (!el.ml) {
                    (el.ml = new MutationObserver(cb =
function(){
    var result     = '',
        // set of formatted types and content
        //
        // each element is an array which will be converted to
        // formatted a node
        //
        // first element is a formatting type (number)
        // second element is a text content of the node
        // third element is boolean which is true when token is marked
        //
        // possible types:
        //  0: newline (represented with <br/>)
        //  1: not formatted
        //  2: punctuation (operators, braces)
        //  3: keywords
        //  4: strings and regexps
        //  5: comments
        formatted = [],
        currentFormattedType,
        lastFormattedEntry,

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
        selNode = 1,
        selOffset = 0,
        selNodeEnd = 1,
        selOffsetEnd = 0,
        content,
        node; // used when restoring selection

    if (sel.rangeCount) {
        markSelection();
        ran = sel.getRangeAt(0);
        selNode = ran.startContainer;
        selOffset = ran.startOffset;
        selNodeEnd = ran.endContainer;
        selOffsetEnd = ran.endOffset;
    }

    // TODO suppress observation in the element property
    // temporarily disconnecting the observer for changing the dom
    el.ml.disconnect();

    content = burrowNodes(
        el, selOffset, selNode, selOffsetEnd, selNodeEnd
    );



    text = content.t;

    next1 = text[0];

    var markedToken;

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
            // types 0-1 (whitespace and newline), types 2-3
            // (operators and braces) always consist of a single
            // character
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
                currentFormattedType =
                    // newline
                    type == 1 ? 0 :
                    // punctuation
                    type < 4  ? 2 :
                    // comments
                    type > 7  ? 5 :
                    // regex and strings
                    type > 4  ? 4 :
                    // otherwise type == 4, (key)word
                    /^(a(bstract|lias|nd|rguments|rray|s(m|sert)?|uto)|b(ase|egin|ool(ean)?|reak|yte)|c(ase|atch|har|hecked|lass|lone|ompl|onst|ontinue)|de(bugger|cimal|clare|f(ault|er)?|init|l(egate|ete)?)|do|double|e(cho|ls?if|lse(if)?|nd|nsure|num|vent|x(cept|ec|p(licit|ort)|te(nds|nsion|rn)))|f(allthrough|alse|inal(ly)?|ixed|loat|or(each)?|riend|rom|unc(tion)?)|global|goto|guard|i(f|mp(lements|licit|ort)|n(it|clude(_once)?|line|out|stanceof|t(erface|ernal)?)?|s)|l(ambda|et|ock|ong)|module|mutable|NaN|n(amespace|ative|ext|ew|il|ot|ull)|o(bject|perator|r|ut|verride)|p(ackage|arams|rivate|rotected|rotocol|ublic)|r(aise|e(adonly|do|f|gister|peat|quire(_once)?|scue|strict|try|turn))|s(byte|ealed|elf|hort|igned|izeof|tatic|tring|truct|ubscript|uper|ynchronized|witch)|t(emplate|hen|his|hrows?|ransient|rue|ry|ype(alias|def|id|name|of))|u(n(checked|def(ined)?|ion|less|signed|til)|se|sing)|v(ar|irtual|oid|olatile)|w(char_t|hen|here|hile|ith)|xor|yield)$/[test](token) ? 3 : 1
                if (type < 8) { // not a comment
                    lastType = type;
                }
            } else {
                // not formatted
                currentFormattedType = 1;
            }

            lastFormattedEntry = formatted[formatted[length]-1]||null;
            // merging similarry formatted tokens to reduce node amount
            if (lastFormattedEntry &&
                // matching type, or a whitespace
                (lastFormattedEntry[0] == currentFormattedType || /^\s$/[test](token)) &&
                lastFormattedEntry[0] &&  // not a newline
                currentFormattedType      // not a newline
            ) {
                lastFormattedEntry[1] += token;
                lastFormattedEntry[2] |= markedToken;
            } else if (token) {
                formatted.push([currentFormattedType, token, markedToken]);
            }


            // initializing a new token
            token = '';
            markedToken = 0;
            if (j-1 == content.m || j-1 == content.M) {
                // change marker
                markedToken = 1;
            }

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
                chr == '/' &&        //  7: regex
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


    var start = 0;
    var endExisting = el.childNodes.length;
    var endSubstituted = formatted.length;
    if (previouslyFormatted) {
        var i = -1;
        var item;
        // TODO move to the main loop
        while ((item = formatted[++i]) &&
               !item[2]  && // not marked for changes
               previouslyFormatted[i] &&
               item[0] == previouslyFormatted[i][0] &&
               item[1] == previouslyFormatted[i][1]
        ) {
            start++;            
        }

        i = 1;
        while (formatted[formatted[length]-i] && // end not yet reached
               previouslyFormatted[previouslyFormatted[length]-i] &&
               !formatted[formatted[length]-i][2] && // not marked for changes
               formatted[formatted[length]-i][0] ==
               previouslyFormatted[previouslyFormatted[length]-i][0] &&
               formatted[formatted[length]-i][1] ==
               previouslyFormatted[previouslyFormatted[length]-i][1]) {
            i++;
            endExisting--;
            endSubstituted--;
        }

    }

    

//    console.log('=====================================');
    


    var childDump = [];
    for (var i = 0; i < el.childNodes.length; i++) {
        if (/(br)/i.test(el.childNodes[i].nodeName)) {
            childDump.push('$');
        } else {
            childDump.push(el.childNodes[i].textContent);
        }
    }
//    console.log(childDump.join('|'));


//    console.log(formatted);




    // taking one node before and after, as those might be modified by typing
    if (start > 0) start--;

    if (endSubstituted < formatted.length - 1) {
        endExisting++;
        endSubstituted++;
    }

    console.log(start + ' - ' + endExisting + ' => ' + start + ' - ' + endSubstituted);


    // removing modified nodes
    for (var i = start; i < endExisting; i++) {
        el.removeChild(el.childNodes[start]);
    }
    var referenceNode = el.childNodes[start];

    // inserting newly formatted nodes
    for (var i = start; i < endSubstituted; i++) {
 // TODO remake nodes creation to cloning
        item = formatted[i];
        if (item[0]) {
            // formatted node
            node = _document.createElement('span');
            node.setAttribute('style',[
                // 1: not formatted
                '',
                // 2: punctuation
                opacity+6+
                        textShadow+_0px_0px+7+pxColor + alpha/4+'),'+
                                   _0px_0px+3+pxColor + alpha/4+')',
                // 3: keywords
                textShadow+_0px_0px+7+pxColor + alpha*.6+'),'+
                               _0px_0px+3+pxColor + alpha*.4+')',
                // 4: strings and regexps
                opacity+7+
                        textShadow+_3px_0px_5+pxColor + alpha/5+'),-'+
                                   _3px_0px_5+pxColor + alpha/5+')',
                // 5: comments
                'font-style:italic'+
                        opacity+5+
                        textShadow+_3px_0px_5+pxColor + alpha/3+'),-'+
                                   _3px_0px_5+pxColor + alpha/3+')'
            ][item[0]-1]);

            node.appendChild(_document.createTextNode(item[1]));
        } else {
            // newline
            node =  _document.createElement('br');
        }

        el.insertBefore(node, referenceNode);
    }
    
    var childDump = [];
    for (var i = 0; i < el.childNodes.length; i++) {
        if (/(br)/i.test(el.childNodes[i].nodeName)) {
            childDump.push('$');
        } else {
            childDump.push(el.childNodes[i].textContent);
        }
    }
//    console.log(childDump.join('|'));



    previouslyFormatted = formatted;


    // restoring the selection position
    // same as if (pos >= 0)
    if (content.p+1) {
        sel.removeAllRanges();

        res = burrowNodes(el, content.p, 0, content.e);

        node = res.n[childNodes] && res.n[childNodes][res.p];
        if (!res.n[length] && node && brtr[test](node.nodeName)) {
            // between the nodes, next node is <br/>

            // replacing next node with '\n' and putting the
            // selection there (otherwise chorme treats it wrong)
            var newnode = _document.createTextNode('\n');
            res.n = newnode;
            res.p = 0;
            el.replaceChild(newnode, node);
        }

        ran.setStart(res.n,res.p);
        ran.setEnd(res.E,res.e);
        sel.addRange(ran);
    }


    // TODO suppress observation in the element property
    el.ml.observe(el, mutationObserveOptions);

}
                )).observe(el, mutationObserveOptions);

                cb();


                el.addEventListener('paste', markSelection, false);

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


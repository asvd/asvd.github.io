/**
 * @fileoverview microlight - syntax highlightning library
 * @version 0.0.1
 *
 * @license MIT, see http://github.com/asvd/microlight
 * @copyright 2015 asvd <heliosframework@gmail.com>
 *
 * Code structure aims at following points in the given priority:
 *  1. performance
 *  2. compressed library size
 *  3. readability
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
    var _window        = window;
    var _document      = document;
    var test           = 'test';
    var length         = 'length';
    var nodeName       = 'nodeName';
    var childNodes     = 'childNodes';
    var parentNode     = 'parentNode';
    var startContainer = 'startContainer';
    var endContainer   = 'endContainer';
    var startOffset    = 'startOffset';
    var endOffset      = 'endOffset';
    var createElement  = 'createElement';
    var spanSample     = _document[createElement]('span');
    var brSample       = _document[createElement]('br');
    var brtr           = /(br|tr)/i;

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
            i = 0, result, len,

            // Reading change markers if present
            // (owerwritten in case of node with subnodes)
            //
            // In order to save some space on conditions:
            // m == 0 means no marker set
            // m > 0 means marker at position m-1
            resultMarker1 = node.m||0,
            resultMarker2 = node.M||0;

            
        if (len = node[length]) {
            // text node

            resultText = node.textContent;

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
                resultMarker1 = node.m == 1 ? 1 : 0;
                resultMarker2 = node.M == 1 ? 1 : 0;

                for (i = 0; i < node[childNodes][length];i++) {
                    result = burrowNodes(
                        node[childNodes][i],
                        selNode ? pos : resultPos,
                        selNode,
                        selNode ? posEnd : resultPosEnd,
                        selNodeEnd
                    );

                    // assigning the first marker from the subnode
                    // (if not yet set)
                    resultMarker1 = resultMarker1 ||
                                    (result.m ?
                                     resultText[length] + result.m :
                                     0);

                    // assigning the second marker from the subnode
                    // (if present)
                    resultMarker2 = result.M ?
                                    resultText[length] + result.M :
                                    resultMarker2;

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

                    // assigning the first marker from between the nodes
                    // (if not yet set)
                    resultMarker1 = resultMarker1 ||
                                    (node.m == i+2 ?
                                     resultText[length]+1 :
                                     0);

                    // assigning the second marker from between the nodes
                    // (if present)
                    resultMarker2 = node.M == i+2 ?
                                    resultText[length] + 1 :
                                    resultMarker2;
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
                        while (node[parentNode][childNodes][++resultPos] != node);
                        // if not <br>, then it's the highlighted
                        // element itself (but with empty content)
                        resultNode = brtr[test](node[nodeName]) ? node[parentNode] : node;
                    }

                    if (resultNodeEnd = !posEnd) {
                        // point right before the node, resultPos == 0
                        while (node[parentNode][childNodes][++resultPosEnd] != node);
                        // if not <br>, then it's the highlighted
                        // element itself (but with empty content)
                        resultNodeEnd = brtr[test](node[nodeName]) ? node[parentNode] : node;
                    }
                }
            }

            if (brtr[test](node[nodeName])) {
                resultText += '\n';
            }
        }

        node.m = node.M = 0;

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
    var markSelection = function() {
        var sel = _window.getSelection();
        var ran = sel.getRangeAt(0);

        var startNode = ran[startContainer];
        var startMarker = Math.min(
            ran[startContainer].m||ran[startOffset]+1,
            ran[startOffset]+1
        );

        var endNode = ran[endContainer];
        var endMarker = Math.max(
            ran[endContainer].M||ran[endOffset]+1,
            ran[endOffset]+1
        );

        if (startMarker>1) {
            // putting marker on node
            startNode.m = startMarker;
        } else {
            // node might be removed upon pasting
            // putting marker on parent
            var parent = startNode[parentNode];
            for (var i = 0; i < parent[childNodes][length]; i++) {
                if (parent[childNodes][i] == startNode) {
                    parent.m = i+1;
                    break;
                }
            }
        }

        if ( // text node
            (endNode[length] && endNode[length] == endMarker-1) ||
            // node with subnodes
            (endNode[childNodes][length] && endNode[childNodes][length] == endMarker-1) ||
            // node without subnodes
            endMarker == 1
        ) {
            // node might be removed upon pasting
            // putting marker on parent
            var parent = endNode[parentNode];
            for (var i = 0; i < parent[childNodes][length]; i++) {
                if (parent[childNodes][i] == endNode) {
                    parent.M = i+2;
                    break;
                }
            }
        } else {
            // putting marker on node
            endNode.M = endMarker;
        }
                
/*        
        ran[startContainer].m = Math.min(
            ran[startContainer].m||ran[startOffset]+1,
            ran[startOffset]+1
        );
        
        ran[endContainer].M = Math.max(
            ran[endContainer].M||ran[endOffset]+1,
            ran[endOffset]+1
        );
 */
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
    var timestamp = (new Date).getTime();
    var
        // set of formatting types and content
        //
        // each element is an array which will be converted to
        // formatted a node
        //
        // first element is a formatting type (number)
        // second element is a text content of the node
        // third element is boolean which is true when token is marked
        //
        // possible formatting types:
        //  0: newline (represented with <br/>)
        //  1: not formatted
        //  2: punctuation (operators, braces)
        //  3: keywords
        //  4: strings and regexps
        //  5: comments
        formatted = [],
        formattingType,
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
        tokenType = 0,

        text,
        pos        = 0,        // current character position

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
        node, // used when restoring selection
        tokenMarked;

    // temporarily disconnecting the observer for changing the dom
    el.ml.disconnect();

    if (sel.rangeCount) {
        markSelection();
        ran = sel.getRangeAt(0);
        selNode      = ran[startContainer];
        selOffset    = ran[startOffset];
        selNodeEnd   = ran[endContainer];
        selOffsetEnd = ran[endOffset];
    }

    content = burrowNodes(
        el, selOffset, selNode, selOffsetEnd, selNodeEnd
    );


    // taking two characters before and one after the marker
    // (neighbouring nodes might be modified by typing)
    content.m = Math.max(content.m-2, 0);
    if (content.M < content.t.length-1) {
        content.M++;
    }


    text = content.t;


    var previouslyFormattedIdx = 0;
    var startSubstituted = 0;
    var endExisting = el[childNodes][length];
    var endSubstituted = 0;

    var tailSearchStarted = 0;
    var tailSearchInterrupted = 0;
    var previousTokenPos;

    while (pos < text[length]) {
        var previousToken = previouslyFormatted[previouslyFormattedIdx]||null;
        var previousText;
        var len;

        if (
            // there is a previously formatted token for this position
            previousToken &&
            // text content matches to what was in the previous token
            (previousText = previousToken[1]) == text.substr(pos, len = previousText[length]) &&
            // and there is no change marker within the upcoming token
            (content.M < pos + 1 || content.m > pos + len + 1)
        ) {
            // copying the token from the previously formatted content
            formatted.push(previousToken);
            
            previouslyFormattedIdx++;
            pos += len;
        } else {
            // no matching previously formatted token found
            // (or a change marker detected)
            // tokenizing the content from here

            // taking one token before
            // (as we might merge the upcoming token into it)
            startSubstituted = Math.max(0, previouslyFormattedIdx-1);


            next1 = text[pos];
            while (prev2 = prev1,
                   // escaping if needed
                   // pervious character will not be
                   // therefore recognized as a token
                   // finalize condition
                   prev1 = tokenType < 8 && prev1 == '\\' ? 1 : chr
            ) {
                chr = next1;
                next1=text[pos+1];

                // checking if token should be finalized
                if (!chr  || // end of content
                    // types 0-1 (whitespace and newline), types 2-3
                    // (operators and braces) always consist of a single
                    // character
                    tokenType < 4 ||
                    // types 10-11 (single-line comments) end with a
                    // newline
                    (tokenType > 9 && chr == '\n') ||
                    [ // finalize condition for other token types
                        !/[$\w]/[test](chr), // 4: (key)word
                                             // 5: regex
                        (prev1 == '/' || prev1 == '\n') && token[length] > 1,
                                             // 6: string with "
                        prev1 == '"' && token[length] > 1,
                                             // 7: string with '
                        prev1 == "'" && token[length] > 1,
                                             // 8: xml comment
                        text[pos-3]+prev2+prev1 == '-->',
                        prev2+prev1 == '*/'  // 9: multiline comment
                    ][tokenType-4]
                ) {
                    // appending the token to the result
                    formattingType =
                        // not formatted
                        !tokenType ? 1 :
                        // newline
                        tokenType == 1 ? 0 :
                        // punctuation
                        tokenType < 4 ? 2 :
                        // comments
                        tokenType > 7 ? 5 :
                        // regex and strings
                        tokenType > 4 ? 4 :
                        // otherwise tokenType == 4, (key)word
                        /^(a(bstract|lias|nd|rguments|rray|s(m|sert)?|uto)|b(ase|egin|ool(ean)?|reak|yte)|c(ase|atch|har|hecked|lass|lone|ompl|onst|ontinue)|de(bugger|cimal|clare|f(ault|er)?|init|l(egate|ete)?)|do|double|e(cho|ls?if|lse(if)?|nd|nsure|num|vent|x(cept|ec|p(licit|ort)|te(nds|nsion|rn)))|f(allthrough|alse|inal(ly)?|ixed|loat|or(each)?|riend|rom|unc(tion)?)|global|goto|guard|i(f|mp(lements|licit|ort)|n(it|clude(_once)?|line|out|stanceof|t(erface|ernal)?)?|s)|l(ambda|et|ock|ong)|module|mutable|NaN|n(amespace|ative|ext|ew|il|ot|ull)|o(bject|perator|r|ut|verride)|p(ackage|arams|rivate|rotected|rotocol|ublic)|r(aise|e(adonly|do|f|gister|peat|quire(_once)?|scue|strict|try|turn))|s(byte|ealed|elf|hort|igned|izeof|tatic|tring|truct|ubscript|uper|ynchronized|witch)|t(emplate|hen|his|hrows?|ransient|rue|ry|ype(alias|def|id|name|of))|u(n(checked|def(ined)?|ion|less|signed|til)|se|sing)|v(ar|irtual|oid|olatile)|w(char_t|hen|here|hile|ith)|xor|yield)$/[test](token) ? 3 : 1
                
                    lastFormattedEntry = formatted[formatted[length]-1]||null;

                    // merging similarry formatted tokens to reduce node amount
                    if (token) {
                        if (// there is a previous entry to merge into
                            lastFormattedEntry &&
                            (// current token has a matching formatting type...
                             formattingType == lastFormattedEntry[0] ||
                             // ...or is a whitespace
                             token == ' ' || /^\s$/[test](token)) &&
                            // both previous and current entries are not newlines
                            lastFormattedEntry[0] && formattingType
                        ) {
                            lastFormattedEntry[1] += token;
                            lastFormattedEntry[2] = tokenType;
                        } else {
                            formatted.push([formattingType, token, tokenType]);
                        }
                    }

                    if (!tailSearchStarted && content.M &&
                        // 'end of change' marker in the very beginning
                        (content.M == 1 ||
                        // 'end of change' marker passed
                        content.M <= pos)
                    ) {
                        tailSearchStarted = 1;

                        // restoring the tail position
                        previousTokenPos = 0;
                        previouslyFormattedIdx = previouslyFormatted[length];

                        for(var i = pos; i < text[length]; i++) {
                            if (!previousTokenPos) {
                                if (!previouslyFormattedIdx) {
                                    // reached the begenning
                                    tailSearchInterrupted = 1;
                                } else {
                                    previouslyFormattedIdx--;
                                    previousTokenPos = previouslyFormatted[previouslyFormattedIdx][1][length];
                                }
                            }

                            previousTokenPos--;
                        }
                    }

                    // checking if we should switch back to cloning tokens
                    if (tailSearchStarted &&
                        !tailSearchInterrupted &&
                        // previous token just finalized as well
                        previousTokenPos == 0 &&
                        // previous token exactly matches the newly evaluated
                        previouslyFormatted[previouslyFormattedIdx-1][0] == formattingType &&
                        previouslyFormatted[previouslyFormattedIdx-1][1] == token &&
                        previouslyFormatted[previouslyFormattedIdx-1][2] == tokenType
                    ) {
                        // switching back to copying from the
                        // previously formatted tokens
                        break;
                    } else {
                        // initializing a new token
                        token = '';
                        tokenMarked = 0;
                        var lastToken = formatted[formatted[length]-1]||null;

                        if (chr == ' ') {
                            tokenType = 0;
                        } else if (chr == '\n') {
                            tokenType = 1;
                        } else if (chr == ']' || chr == ')') {
                            tokenType = 3;
                        } else if ('{}[(-+*=<>:;|\\.,?!&@~'.indexOf(chr) != -1) {
                            // slash checked later, can be a comment or a regex
                            tokenType = 2;
                        } else {
                            // going down until matching a
                            // token type start condition
                            tokenType = 13;
                            while (![
                                1,                   //  0: whitespace
                                chr == '\n',         //  1: newline
                                chr == '/',          //  2: operator or braces
                                                     // (others checked above)
                                chr == ']' || chr == ')', //  3: closing brace
                                /[$\w]/[test](chr),  //  4: word
                                chr == '/' &&        //  7: regex
                                    // previous token was an
                                    // opening brace or an
                                    // operator (otherwise
                                    // division, not a regex)
                                    (!lastToken || lastToken[2] < 3) &&
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
                    }
                }

                token += chr;

                if (tailSearchStarted && !tailSearchInterrupted &&
                    ++previousTokenPos == previouslyFormatted[previouslyFormattedIdx][1][length]) {
                    previousTokenPos = 0;
                    previouslyFormattedIdx++;
                }
                    
                pos++;
            }



            endSubstituted = formatted[length];
            endExisting = Math.min(
                              el[childNodes][length],
                              el[childNodes][length] -
                              previouslyFormatted[length] +
                              previouslyFormattedIdx
                );
        }
    }
    


    console.log(startSubstituted + ' - ' + endExisting + ' => ' + startSubstituted + ' - ' + endSubstituted);


    // removing modified nodes
    for (i = startSubstituted; i < endExisting; i++) {
        el.removeChild(el.childNodes[startSubstituted]);
    }
    var referenceNode = el.childNodes[startSubstituted];

    // inserting newly formatted nodes
    var item;
    for (i = startSubstituted; i < endSubstituted; i++) {
        item = formatted[i];
        if (item[0]) {
            // formatted node
            node = spanSample.cloneNode(0);
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
            node = brSample.cloneNode(0);
        }

        el.insertBefore(node, referenceNode);
    }
    



    previouslyFormatted = formatted;


    // restoring the selection position
    // same as if (pos >= 0)
    if (content.p+1) {
        sel.removeAllRanges();

        res = burrowNodes(el, content.p, 0, content.e);

        node = res.n[childNodes] && res.n[childNodes][res.p];

        if (!res.n[length] && node && brtr[test](node[nodeName])) {
            // between the nodes, next node is <br/>

            // replacing next node with '\n' and putting the
            // selection there (otherwise Chorme treats it wrong)
            res.p = res.e = 0;
            el.replaceChild(
                res.n = res.E = _document.createTextNode('\n'),
                node
            );
        }


        ran.setStart(res.n,res.p);
        ran.setEnd(res.E,res.e);
        sel.addRange(ran);
    }


    // connecting the observer back again
    el.ml.observe(el, mutationObserveOptions);
    console.log((new Date).getTime() - timestamp);
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


/**
 * @fileoverview squeeze - scrolling indication
 * @version 0.1.0
 * 
 * @license MIT, see http://github.com/asvd/squeeze
 * Copyright (c) 2015 asvd <heliosframework@gmail.com> 
 */


(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['exports'], factory);
    } else if (typeof exports !== 'undefined') {
        factory(exports);
    } else {
        factory((root.squeeze = {}));
    }
}(this,
function (exports) {

    var cfg = {
        textureMaxSqueeze : 1000,
        indicatorMaxArea  : .2,
        indicatorGain     : 1/3000,
        animationTime     : 160,
        animationDelay    : 20
    };

    cfg.blocksNumber =
        1+Math.ceil(Math.log(cfg.textureMaxSqueeze)/Math.log(4));

    var UQ = 'squeeze-unique-' + (new Date().getTime());


    /**
     * Checks if the CSS property may have as a value the CSS function
     * with the given parameters
     * 
     * @param {String} name of the property
     * @param {String} func
     * @param {String} params of a function as example
     * 
     * @returns {Boolean}
     */
    var checkCSSProperty = function(name, func, params) {
        var idx, camel = name;
        while ((idx = camel.indexOf('-')) != -1) {
            camel = camel.slice(0, idx) +
                    camel.slice(idx+1, idx+2).toUpperCase() +
                    camel.slice(idx+2);
        }

        var elem = document.createElement('div')
        elem.style.cssText = name + ': ' + func + '('+params+')';
        return camel in document.documentElement.style &&
            elem.style[camel].indexOf(func) != '-1';
    }


    var IS_IE = /*@cc_on!@*/false || !!document.documentMode;
    var IS_FF = typeof InstallTrigger !== 'undefined';

    // what is supported by the browser
    var features = {
        event : !!window.addEventListener,

        canvas : !!document.createElement("canvas").getContext,

        webkitTransform : checkCSSProperty(
            '-webkit-transform', 'rotate', '-180deg'
        ),

        backgroundCanvas : {
            webkit :
              !!document.getCSSCanvasContext &&
              checkCSSProperty(
                  'background', '-webkit-canvas', 'a'
              ),

            mozElement : checkCSSProperty(
                'background', '-moz-element', '#a'
            )
        },

        gradientMask : {
            alphaFilter : checkCSSProperty(
                'filter',
                'progid:DXImageTransform.Microsoft.Alpha',
                'opacity=100,finishOpacity=0,style=1,'+
                    'startX=0,finishX=1,startY=0,finishY=1'
            ),

            webkit : checkCSSProperty(
                '-webkit-mask-image',
                '-webkit-linear-gradient',
                'top, rgba(0,0,0,1), rgba(0,0,0,0) 100%'
            ),

            svgReuse : IS_FF
        }
    };


    // implementations to use according to the available features
    var METHODS = {
        // asynchronous function invocation
        async  : features.event ? 'event' : 'setTimeout',
        // rendering a set of image blocks
        blocks : features.webkitTransform ?  'webkitTransform': 'div',
        // applying a transparency gradient mask
        mask   : null,
        // using a canvas element as a background
        canvas : null
    };


    var SQUEEZE_ENABLED = true;
    if (features.canvas) {
        if (features.gradientMask.webkit) {
            METHODS.mask = 'webkit';
            METHODS.canvas = features.backgroundCanvas.webkit ?
                'webkit' : 'dataURL';
        } else if (features.gradientMask.svgReuse) {
            if (features.backgroundCanvas.mozElement) {
                METHODS.canvas = 'mozElement';
                METHODS.mask = 'svgReuse';
            } else {
                METHODS.blocks = 'svg';
            }
        } else if (features.gradientMask.alphaFilter) {
            METHODS.canvas = 'dataURL';
            METHODS.mask = 'alphaFilter';
            METHODS.blocks = 'DXTransform';
        } else {
            METHODS.blocks = 'svg';
        }
    } else {
        // cannot do anything without canvas
        SQUEEZE_ENABLED = false;
    }

    if (METHODS.blocks == 'svg' && !IS_IE) {
        // svg variant only works reasonably fast in IE
        SQUEEZE_ENABLED = false;
    }


    // browser-dependent implementations
    var impl = {};


    /**
     * Applies gradient mask to the given component
     * 
     * Uses -webkit-mask-image CSS property
     * 
     * @param {Element} elem DOM element to apply mask to
     * @param {String} dir direction of the mask
     */
    var gradientMask_webkit = function(elem, dir) {
        var where = {
            north : 'top',
            east  : 'right',
            south : 'bottom',
            west  : 'left'
        };

        elem.style.WebkitMaskImage =
            '-webkit-linear-gradient('+ where[dir] + ', '+
            'rgba(0,0,0,1), rgba(0,0,0,0) 100%)';
    }


    /**
     * Applies gradient mask to the given component
     * 
     * Uses DXImageTransform.Microsoft.Alpha filter
     * 
     * @param {Element} elem DOM element to apply mask to
     * @param {String} dir direction of the mask
     */
    var gradientMask_alphaFilter = function(elem, dir) {
        var pos = {
            x1 : 0,
            x2 : 0,
            y1 : 0,
            y2 : 0
        };

        var full = {
            north : 'y2',
            east  : 'x1',
            south : 'y1',
            west  : 'x2'
        };

        pos[full[dir]] = '100';

        var filter =
            'progid:DXImageTransform.Microsoft.Alpha('+
                'opacity=100,'+
                'finishOpacity=0,'+
                'style=1,'+ // linear
                'startX=' +pos.x1+','+
                'finishX='+pos.x2+','+
                'startY=' +pos.y1+','+
                'finishY='+pos.y2+''+
            ')';

        elem.style.filter = filter;
    }


    var svgMaskIds = {
        north : null,
        east  : null,
        south : null,
        west  : null
    };


    /**
     * Applies gradient mask to the given component
     * 
     * Uses generated SVG element
     * 
     * @param {Element} elem DOM element to apply mask to
     * @param {String} dir direction of the mask
     */
    var gradientMask_svgReuse = function(elem, dir) {
        if (!svgMaskIds[dir]) {
            svgMaskIds[dir] = genMaskSVG(dir);
        }

        elem.style.mask = 'url(#'+svgMaskIds[dir]+')';
    }


    /**
     * Generates an SVG image containing a gradient mask
     * 
     * @param {String} dir direction of the mask gradient
     * 
     * @return {String} mask id to reuse
     */
    var genMaskSVG = function(dir) {
        var id = 'svg-mask-'+dir+'-'+UQ;
        var maskId = 'mask-'+id;
        var gradientId = 'gradient-'+id;

        var svg = util.genSVGElement('svg');
        var defs = util.genSVGElement('defs', svg);

        var linearGradient = util.genSVGLinearGradient(
            defs, dir, gradientId
        );

        var mask = util.genSVGElement('mask', defs, {
            id               : maskId,
            maskUnits        : 'objectBoundingBox',
            maskContentUnits : 'objectBoundingBox'
        });

        var rect = util.genSVGElement('rect', mask, {
            y      : '0',
            width  : '1',
            height : '1',
            fill   : 'url(#'+gradientId+')'
        });

        util.setStyle(svg, {
            position : 'absolute',
            width    : '0px',
            height   : '0px'
        });

        document.body.appendChild(svg);

        return maskId;
    }


    /**
     * Applies gradient mask to the given component
     * 
     * @param {Element} elem DOM element to apply mask to
     * @param {String} dir direction of the mask
     */
    switch (METHODS.mask) {
    case 'svgReuse':
        impl.gradientMask = gradientMask_svgReuse;
        break;
    case 'webkit':
        impl.gradientMask = gradientMask_webkit;
        break;
    case 'alphaFilter':
        impl.gradientMask = gradientMask_alphaFilter;
        break;
    default:
        impl.gradientMask = null;
        break;
    }


    // Using canvas as a background in different browsers

    /**
     * Sets the content of the given canvas as a background for the
     * given element
     * 
     * Obtains the raw data using toDataURL() method and places it as
     * a background
     * 
     * @param {Element} elem to set background for
     * @param {Element} canvas element to use as a background
     */
    var backgroundCanvas_dataURL = function(elem, canvas) {
        elem.style.backgroundImage =
            'url('+util.getCanvasDataURL(canvas)+')';
    }
    
    

    /**
     * Sets the content of the given canvas as a background for the
     * given element
     * 
     * Uses the global css canvas context along with -webkit-canvas
     * CSS function
     * 
     * @param {Element} elem to set background for
     * @param {Element} canvas element to use as a background
     */
    var canvasCSSCounter = 0;
    var backgroundCanvas_webkit = function(elem, canvas) {
        if (typeof canvas.CSSContextId == 'undefined') {
            var id = 'canvasCSSContext-'+(canvasCSSCounter++)+'-'+UQ;
            var ctx = document.getCSSCanvasContext(
                '2d', id, canvas.width, canvas.height
            );

            ctx.drawImage(canvas, 0,0);
            canvas.CSSContextId = id;
        }

        elem.style.background =
            '-webkit-canvas('+canvas.CSSContextId+')';
    }

    
    /**
     * Sets the content of the given canvas as a background for the
     * given element
     * 
     * Uses the existing canvas along with the -moz-element CSS
     * function
     * 
     * @param {Element} elem to set background for
     * @param {Element} canvas element to use as a background
     */
    var canvasMozElementCounter = 0;
    var backgroundCanvas_mozElement = function(elem, canvas) {
        if (!canvas.getAttribute('id')) {
            var id = 'MozElement-'+(canvasMozElementCounter++)+'-'+UQ;

            canvas.setAttribute('id', id);
            util.setStyle(canvas, {
                position: 'absolute',
                width: '0px',
                height: '0px'
            });
            
            document.body.appendChild(canvas);
        }

        elem.style.background =
            '-moz-element(#'+canvas.getAttribute('id')+')';
    }


    switch (METHODS.canvas) {
    case 'dataURL':
        impl.backgroundCanvas = backgroundCanvas_dataURL;
        break;
    case 'webkit':
        impl.backgroundCanvas = backgroundCanvas_webkit;
        break;
    case 'mozElement':
        impl.backgroundCanvas = backgroundCanvas_mozElement;
        break;
    default:
        impl.backgroundCanvas = null;
        break;
    }



    // Asynchronous function invocation
    
    /**
     * Performs a method asynchronously
     * 
     * setTimeout() version
     * 
     * @param {Function} func method to invoke
     * @param {Object} obj context object
     * @param {Array} args
     */
    var async_setTimeout = function(func, obj, args) {
       setTimeout(function() {
           func.apply(obj||null, args||[]);
       }, 0);
    }

    /**
     * Performs a method asynchronously
     * 
     * Event emission version
     * 
     * @param {Function} func method to invoke
     * @param {Object} obj context object
     * @param {Array} args
     */
    var async_event = function(func, obj, args) {
        asyncs.push([func, obj||window, args]);
        window.postMessage(asyncMsg, '*');
    }
    var asyncs = [];
    var asyncMsg = 'async-' + UQ;
    var invoke = function(event) {
        if (event.source == window &&
             event.data == asyncMsg) {
            if (asyncs.length > 0) {
                var async = asyncs.shift();
                async[0].apply(async[1], async[2]);
            }
        }
    };


    if (METHODS.async == 'event') {
        window.addEventListener('message', invoke, true);
        impl.async = async_event;
    } else {
        impl.async = async_setTimeout;
    }



    var util = {};

    util.dir = ['north','east','south','west'];

    util.isVertical = {
        north : true,
        east  : false,
        south : true,
        west  : false
    };

    util.ccv = {
        north : 'west',
        east  : 'north',
        south : 'east',
        west  : 'south'
    };

    util.sample = {
        div    : document.createElement('div'),
        img    : document.createElement('img'),
        canvas : document.createElement('canvas'),
        object : document.createElement('object')
    };


    /**
     * Checks if the given element has the given class
     * 
     * @param {Element} elem to check against having the class
     * @param {String} cls class name
     * 
     * @returns {Boolean}
     */
    util.hasClass = function(elem, cls) {
        var result = false;
        var list = elem.classList;
        for (var i = 0; i < list.length; i++){
            if (list[i] == cls) {
                result = true;
                break;
            }
        }

        return result;
    }


    /**
     * Applies the style to the element
     * 
     * @param {Element} elem to apply style to
     * @param {Object} style
     */
    util.setStyle = function(elem, style) {
        for (var key in style) {
            if (style.hasOwnProperty(key)) {
                elem.style[key] = style[key];
            }
        }
    }
    
    
    /**
     * Applies the set of attributes to the element
     * 
     * @param {Element} elem to set attributes for
     * @param {Object} attributes
     */
    util.setAttributes = function(elem, attributes) {
        for (var key in attributes) {
            if (attributes.hasOwnProperty(key)) {
                elem.setAttribute(key, attributes[key]);
            }
        }
    }
    
    
    /**
     * Casts the value to the string and adds 'px' to the end
     * 
     * @param {Number} value
     * 
     * @returns {String}
     */
    util.px = function(value) {
        return '' + value + 'px';
    }
    
    
    /**
     * Removes all child nodes from the given element, returns those
     * as an array
     * 
     * @param {Element} elem to remove the child nodes from
     * 
     * @returns {Array} nodes removed from the element
     */
    util.detachChildren = function(elem) {
        var detached = [];
        while (elem.firstChild) {
            detached.push(elem.removeChild(elem.firstChild));
        }

        return detached;
    }


    /**
     * Attaches the given set of nodes to the given element
     * 
     * @param {Element} elem to attach nodes to
     * @param {Array} nodes to attach as children
     */
    util.attachChildren = function(elem, nodes) {
        for (var i = 0; i < nodes.length; i++) {
            elem.appendChild(nodes[i]);
        }
    }

    
    /**
     * Returns a cached copy of dataURL of the canvas, performs
     * caching if needed (assuming the image is never changed)
     * 
     * @param {Element} canvas
     * 
     * @returns {String} dataURL with the canvas image
     */
    util.getCanvasDataURL = function(canvas) {
        if (typeof canvas.squeeze_cached_dataURL == 'undefined') {
            canvas.squeeze_cached_dataURL = canvas.toDataURL();
        }

        return canvas.squeeze_cached_dataURL;
    }


    /**
     * Creates and returns a new canvas element
     * 
     * @param {Number} w width
     * @param {Number} h height
     * 
     * @returns {Element} created canvas element
     */
    util.genCanvas = function(w,h) {
        var canvas = util.sample.canvas.cloneNode(false);
        canvas.width = w;
        canvas.height = h;
        util.setStyle(canvas, {
            width   : util.px(w),
            height  : util.px(h),
            display : 'none'
        });

        return canvas;
    }


    /**
     * Produces a canvas element containing the image of the given img
     * element
     * 
     * @param {Element} img
     * 
     * @returns {Element} canvas
     */
    util.img2canvas = function(img) {
        var canvas = util.genCanvas(
            img.width  || img.naturalWidth,
            img.height || img.naturalHeight
        );

        var ctx = canvas.getContext('2d');
        ctx.drawImage(img,0,0);
        return canvas;
    }


    /**
     * Creates and returns a new SVG element
     * 
     * @param {String} name of the SVG element to create
     * @param {Element} parent element
     * @param {Object} attrs attributes for the new element
     * 
     * @returns {Element} newly created SVG element
     */
    util._svgNS = 'http://www.w3.org/2000/svg';
    util._xlinkNS = 'http://www.w3.org/1999/xlink';
    util.genSVGElement = function(name, parent, attrs) {
        var elem = document.createElementNS(util._svgNS, name);
        if (attrs) {
            for (var key in attrs) {
                if (attrs.hasOwnProperty(key)) {
                    if (key.indexOf('xlink') != -1) {
                        elem.setAttributeNS(
                            util._xlinkNS, key, attrs[key]
                        );
                    } else {
                        elem.setAttribute(key, attrs[key]);
                    }
                }
            }
        }

        if (parent) {
            parent.appendChild(elem);
        }

        return elem;
    }
    
    
    /**
     * Generates (if not generated yet) an SVG element which is
     * intended to store common SVG objects to be later reused along
     * the application
     * 
     * @returns {Element} common svg element
     */
    util._commonSVG = null;
    util.getCommonSVG = function() {
        if (!util._commonSVGDefs) {
            util._commonSVG =
                util.genSVGElement('svg', document.body);
            util.setStyle(util._commonSVG, {
                width    : '0px',
                height   : '0px',
                position : 'absolute',
                display  : 'none'
            });
        }

        return util._commonSVG;
    }
    

    /**
     * Generates (if not generated yet) an SVG element with a <defs>
     * section and returns the <defs> which is intended to store
     * common SVG objects to be later reused along the application
     * 
     * @returns {Element} common defs element
     */
    util._commonSVGDefs = null;
    util.getCommonSVGDefs = function() {
        if (!util._commonSVGDefs) {
            util._commonSVGDefs = util.genSVGElement(
                'defs', util.getCommonSVG()
            );
        }

        return util._commonSVGDefs;
    }


    /**
     * Generates an SVG element containing a linear gradient in the
     * given direction
     * 
     * @param {Element} parent parent element (defs)
     * @param {String} dir gradient direction (north, east, ...)
     * @param {String} id of the gradient to assign
     * 
     * @returns {Element} generated element
     */
    util.genSVGLinearGradient = function(parent, dir, id) {
        var gradientAttr = {
            x1: '0%',
            y1: '0%',
            x2: '0%',
            y2: '0%'
        };

        if (dir) {
            var full = {
                north : 'y2',
                east  : 'x1',
                south : 'y1',
                west  : 'x2'
            };

            gradientAttr[full[dir]] = '100%';
        }

        if (id) {
            gradientAttr.id = id;
        }

        var linearGradient = util.genSVGElement(
            'linearGradient', parent, gradientAttr
        );

        var stop1 = util.genSVGElement('stop', linearGradient, {
            'stop-color': 'white',
            offset: '0%'
        });

        var stop2 = util.genSVGElement('stop', linearGradient, {
            'stop-color': 'black',
            offset: '100%'
        });

        return linearGradient;
    }
    
    
    
    /**
     * @returns {Element} the default canvas image ("ashed pages")
     * used when an image failed to load for some reason
     */
    util._defaultCanvas = null;
    util.getDefaultCanvas = function() {
        if (!util._defaultCanvas) {
            util._defaultCanvas = util._genDefaultCanvas();
        }

        return util._defaultCanvas;
    }
    
    
    /**
     * Generates a default canvas image ("ashed pages") used when a
     * scrolling indication image was not provided by a user, or
     * failed to load for some reason
     * 
     * @returns {Element} canvas element containing the default image
     */
    util._genDefaultCanvas = function() {
        var w = 200, h = 200;
        var canvas = util.genCanvas(w,h);
        var ctx = canvas.getContext('2d');
        var imageData = ctx.createImageData(w,h);
        var D = imageData.data;

        var base = 10;
        var disp = base * .4;

        var row, col, idx, val, rowIntense, intense;
        for (row = 0; row < h; row++) {
            rowIntense = 10 + Math.floor(Math.random() * base);
            for (col = 0; col < w; col++) {
                idx = 4*w*row + 4*col;
                intense = Math.floor(
                    rowIntense - disp + 2*disp*Math.random()
                );

                D[idx++] = intense;      // R
                D[idx++] = intense + 5;  // G
                D[idx++] = intense + 10; // B
                D[idx]   = 255;          // A
            }
        }

        ctx.putImageData(imageData, 0, 0);

        return canvas;
    }


    /**
     * Takes the provided function and returns another which works
     * exactly as the one provided, but which is only invoked if
     * arguments changed (strict comparsion used)
     * 
     * Useful for the methods performing UI update which is normally
     * expenisve
     * 
     * @param {Function} method to convert
     * 
     * @returns {Function} converted method
     */
    util.saverMethod = function(method) {
        var lastArguments = [];
        return function() {
            var i, changed = false;

            if (arguments.length != lastArguments.length) {
                lastArguments = [];
            }

            for (i = 0; i < arguments.length; i++) {
                if (arguments[i] !== lastArguments[i]) {
                    lastArguments[i] = arguments[i];
                    changed = true;
                }
            }

            if (changed) {
                method.apply(this, arguments);
            }
        }
    }
    


    // Whenable pattern
    var wl = {};
    
    /**
     * Whenable event object constructor
     */
    wl.Whenable = function() {
        this._emitted = false;  // event state, emitted or not
        this._listeners = [];
        this._result = [];      // args transfered to the listener
    }

      
    /**
     * Fires the event, issues the listeners
     * 
     * @param ... all given arguments are forwarded to the listeners
     */
    wl.Whenable.prototype.emit = function(){
        if (!this._emitted) {
            this._emitted = true;

            for (var i = 0; i < arguments.length; i++) {
                this._result.push(arguments[i]);
            }

            var listener;
            while (listener = this._listeners.pop()) {
                impl.async(
                    listener[0], listener[1], this._result
                );
            }
        }
    }
      

    /**
     * @returns {Function} whenable subscriber to the event
     */
    wl.Whenable.prototype.getSubscriber = function() {
        var me = this;
        return function(listener, ctx) {
            me._whenEmitted(listener, ctx);
        }
    }

      
    /**
     * Adds another listener to be executed upon the event emission
     * 
     * @param {Function} func listener function to subscribe
     * @param {Object} ctx optional context to call the listener in
     */
    wl.Whenable.prototype._whenEmitted = function(func, ctx){
        if (this._emitted) {
            impl.async(func, ctx, this._result);
        } else {
            this._listeners.push([func, ctx||null]);
        }
    }
      
      
    /**
     * For the given whenable subscribers produces another whenable
     * subscriber which fires when all of the given subscribers fire
     * 
     * @param {Function} when1
     * @param {Function} when2
     * @param ...
     * 
     * @returns {Function}
     */
    wl.whenAll = function() {
        if (arguments.length == 1) {
            return arguments[0];
        } else {
            var whenAll = new wl.Whenable;

            var whenFirst = arguments[0];
            var rest = [].slice.call(arguments,1);
            var whenRest = wl.whenAll.apply(null,rest);
            whenFirst(function(){
                whenRest(function(){
                    whenAll.emit();
                });
            });

            return whenAll.getSubscriber();
        }
    }
    
    
    /**
     * Stores a setter function and reuses it to perform smooth
     * animation on demand
     * 
     * @param {Function} setter updating the value to be animated
     */
    var Animator = function(setter) {
        this._setter = setter;
        this._options = [];
        this._current = 0;
        this._target = null;
        this._delta = null;
        this._animTimeout = null;
    }


    /**
     * Changes the value instantly (the most reasonable strategy
     * selected instead in case when animation is running)
     * 
     * @param {Number} val to set
TODO do we still need options??
     * @param {Object} options forwarded to the setter
     */
    Animator.prototype.jump = function(val, options) {
        this._options = options;

        if (this._animTimeout) {
            var c = this._current,
                t = this._target, // old target
                v = val;          // new target

            if ((t > c && v > t) ||
                (t < c && v < t)) {
                // value beyond the target, speeding up
                this._delta *= (v-c)/(t-c);
                this._target = val;
            } else if ((t > c && v < c) ||
                       (t < c && v > c)) {
                // value in the opposite direction, jumping
                this._clearTimeout();
                this._applyValue(val);
            } else {
                // value prior to the target, same direction
                // simply updating the target
                this._target = val;
            }
        } else {
            this._applyValue(val);
        }
    }
    
    
    /**
     * Changes the value smoothly
     * 
     * @param {Number} val to be finally reached
     * @param {Object} options forwarded to the setter
     */
    Animator.prototype.slide = function(val, options) {
        this._options = options;
        this._target = val;

        if (this._target != this._current) {
            this._delta = (this._target-this._current)*
                cfg.animationDelay/cfg.animationTime;
        }  // otherwise will stop upon the next tick

        if (!this._animTimeout) {
            this._tick();
        }
    }
    
    
    /**
     * Performs a single animation step
     */
    Animator.prototype._tick = function() {
        if (Math.abs(this._target - this._current) <
            Math.abs(this._delta)) {
            if (this._animTimeout) {
                this._clearTimeout();
            }

            this._applyValue(this._target);
        } else {
            var me = this;
            this._animTimeout = setTimeout(
                function(){me._tick();}, cfg.animationDelay
            );

            this._applyValue(this._current+this._delta);
        }
    }
        
    
    /**
     * Applies current animation frame
     * 
     * @param {Number} val to apply
     */
    Animator.prototype._applyValue = function(val) {
        this._current = val;
        this._setter(val, this._options);
    }
    
    
    /**
     * Clears animation timeout
     */
    Animator.prototype._clearTimeout = function() {
        clearTimeout(this._animTimeout);
        this._animTimeout = null;
    }
    
    
     // stores the images along with the squeezed canvas
    var imgCache = {};


    /**
     * Represents a single cached stretchable image
     * 
     * Loads an image, creates a stretched canvas
     */
    var CachedImg = function(url) {
        if (typeof imgCache[url] != 'undefined') {
            return imgCache[url];
        } else {
            imgCache[url] = this;

            this._url = url;
            this._touchTimeout = null;
            this._ready = new wl.Whenable;
            this.whenReady = this._ready.getSubscriber();

            this._sides = {};  // stretched canvases
            this._data = {};

            this._SVGImage = null;
            this._SVGImageId = null;

            this._download();
        }
    }
    
    
    /**
     * Loads the image
     */
    CachedImg.prototype._download = function() {
        if (!this._url) {
            this._init(null);
            this._ready.emit();
        } else {
            this._img = util.sample.img.cloneNode(false);
            this._img.src = this._url;
            this._img.style.display = 'none';

            var me = this;
            this._img.addEventListener('load', function() {
                document.body.removeChild(me._img);
                me._init(me._img);
                me._ready.emit();
            }, false);

            this._img.addEventListener('error', function() {
                document.body.removeChild(me._img);
                me._init(null);
                me._ready.emit();
            }, false);
            
            document.body.appendChild(this._img);
        }
    }
    
    
    /**
     * Creates the cached copy of rotated canvas (if needed), and
     * returns it afterwards
     * 
     * @param {String} dir direction
     */
    CachedImg.prototype.getSide = function(dir) {
        if (typeof this._sides[dir] == 'undefined') {
            this._sides[dir] = this._rotate(this._sides.north, dir);
        }

        return this._sides[dir];
    }
    

    /**
     * Creates (if not done yet) an SVG image element containing the
     * stretched image and stored in the common <defs> element,
     * returns its id
     * 
     * @param {String} id of an SVG element with the stretched image
     */
    var SVGImageCounter = 0;
    CachedImg.prototype.getSVGImageId = function() {
        if (!this._SVGImage) {
            this._SVGImageId ='SVG-Image-'+(SVGImageCounter++)+'-'+UQ;
            var canvas = this._sides.north;
            var url = util.getCanvasDataURL(canvas);
            var defs = util.getCommonSVGDefs();
            this._SVGImage = util.genSVGElement('image', defs, {
                id     : this._SVGImageId,
                x      : '0',
                y      : '0',
                width  : util.px(canvas.width),
                height : util.px(canvas.height),
                preserveAspectRatio : 'none',
                'xlink:href' : url
            });
        }

        return this._SVGImageId;
    }
    
    
    /**
     * Updates image geometry without changing it. Needed for IE,
     * otherwise it will not redraw
     */
    CachedImg.prototype.touchSVGImage = function() {
        if (IS_IE && this._SVGImage) {
            if (this._touchTimeout) {
                clearTimeout(this._touchTimeout);
            }

            var me = this;
            this._touchTimeout = setTimeout(
                function() {
                    me._touch();
                }, 10
            );
        }
    }
    
    CachedImg.prototype._touch = function() {
        this._SVGImage.setAttribute(
            'height', util.px(this._data.stretchedSize)
        );
    }
    

    /**
     * @returns {Object} additional data
     */
    CachedImg.prototype.getData = function() {
        return this._data;
    }
    

    /**
     * After the image is loaded (or failed to load), ininitializes
     * the CachedImg object with its stretched canvas images, and with
     * some additional data later used for animation
     * 
     * @param {Element} image to initalize from, null for load failure
     */
    CachedImg.prototype._init = function(image) {
        var original = this._genImageCanvas(image);
        var stretched = this._stretch(original);
        this._sides.north = stretched.canvas;
        this._data = this._genData(stretched.canvas);
        this._data.points = stretched.points;
        this._data.origSize = original.height;
    }
    

    /**
     * Generates a canvas containing the data from the provided image,
     * or the default data if image failed to load
     * 
     * @param {Element} image to initalize from, null for load failure
     * 
     * @returns {Element} canvas
     */
    CachedImg.prototype._genImageCanvas = function(image) {
        var result;
        if (image) {
            result = util.img2canvas(image);
        } else {
            result = util.getDefaultCanvas();
        }

        return result;
    }

    
    
    /**
     * Stretches the given canvas data and returns the new canvas with
     * the stretched content. The image is stretched in a special way,
     * so that horizontal pixels density is unchanged, but the
     * vertical density is decreased from top to bottom. Pixels on the
     * top edge have the same density as the original image, while the
     * pixels on the bottom edge are 4 times vertically stretched.
     * 
     * The density function
     * 
     *   ro(x) = 45/68*x*x - 24/17*x + 1
     * 
     * results from the following conditions:
     * 
     * 1) ro(0) = 1 (destiny at the top edge equals the orig. image)
     * 2) ro(1) = 1/4 (density at the bottom is 4 times less)
     * 3) ro'(1) = ro2'(0), where:
     *    ro2(x) = 1/4 * ro(x/4), which is a density of the same
     *    image, linearly stretched four times. The last condition
     *    means that the speed of density change for the two images
     *    attached one to another is continuous
     * 
     * @param {Element} canvas containing the original image
     * 
     * @returns {Object} stretched canvas and density points
     */
    CachedImg.prototype._stretch = function(canvas) {
        var w = canvas.width;
        var h = canvas.height;

        // if webkit throws an error for a local image,
        // restart Chrome with --allow-file-access-from-files
        // (otherwise load an image from the same origin)
        var data1 = canvas.getContext('2d').getImageData(0, 0, w, h);
        var h2 = h * 68 / 35;
        var h2floor = Math.floor(h2);

        var stretchedCanvas = util.genCanvas(w, h2floor);
        var ctx2 = stretchedCanvas.getContext('2d');
        var data2 = ctx2.createImageData(w, h2floor);
        var D1 = data1.data;
        var D2 = data2.data;

        var ro;        // current density value
        var y2;        // y, stretched image
        var y1;        // y, original image (calculated, float)
        var y1_floor;  // y, original image (floored)
        var y2_norm;   // y2 / h2 (normalized, 0 <= y2_norm <= 1)
        var y2_norm_2; // y2_norm squared
        var y1_norm;   // calculated normalized y of the orig img

        var rate0;     // ratios of the current pixel,
        var rate1;     // and the one on the next row

        var row = w*4; // imageData row (4 channels)
        var idx1;      // current pixel start idx (original image)
        var idx2;      // current pixel start idx (stretched image)

        var col;       // runs through columns (pixels)
        var ch;        // runs through color channels

        // saves the current coordinate of the stretched image
        // indexed by original coordinate (so that it is possible to
        // restore current position of the stretched image by the
        // coordinate of the original image)
        var points = [];

        var _15_68 = 15/68;
        var _12_17 = 12/17;
        var _45_68 = 45/68;
        var _24_17 = 24/17;

        // generating image
        for (y2 = 0; y2 < h2floor; y2++) {
            y2_norm = y2/h2;
            y2_norm_2 = y2_norm * y2_norm;
            // destiny at the point of y2
            ro = _45_68 * y2_norm_2 - _24_17 * y2_norm + 1;

            // normalized coordinate of the original image
            // calculated as antiderivative of density function
            y1_norm =  _15_68 * y2_norm_2 * y2_norm
                     - _12_17 * y2_norm_2
                     +          y2_norm;

            // current y-coordinate on the original image
            y1 = y1_norm * h2;
            y1_floor = Math.floor(y1);

            points[y1_floor] = y2;
           
            rate0 = Math.min(ro, y1_floor + 1 - y1);
            rate1 = ro - rate0;

            idx1 = row*y1_floor;
            idx2 = row*y2;

            for (col = 0; col < w; col++) {
                for (ch = 0; ch < 4; ch++) {
                    D2[idx2+ch] = Math.round((
                        rate0 *  D1[idx1+ch] +
                        rate1 * (D1[idx1+ch+row]||0)
                    ) / ro);
                }

                idx1 += 4;
                idx2 += 4;
            }
        }

        ctx2.putImageData(data2, 0, 0);

        return {
            canvas: stretchedCanvas,
            points: points
        };
    }
    
    
    /**
     * Generates the canvas rotated in the given direction
     * 
     * @param {Element} north original canvas element
     * @param {String} dir direction to rotate the canvas
     * 
     * @returns {Element} rotated canvas
     */
    CachedImg.prototype._rotate = function(north, dir) {
        var w = north.width;
        var h = north.height;

        var rotated;
        if (util.isVertical[dir]) {
            rotated = util.genCanvas(w, h);
        } else {
            rotated = util.genCanvas(h, w);
        }

        var ctx = rotated.getContext('2d');

        switch (dir) {
        case 'east':
            ctx.rotate(Math.PI/2);
            ctx.drawImage(north, 0, -h);
            break;
        case 'south':
            ctx.rotate(Math.PI);
            ctx.drawImage(north, -w, -h);
            break;
        case 'west':
            ctx.rotate(-Math.PI/2);
            ctx.drawImage(north, -w, 0);
            break;
        }

        return rotated;
    }
    
    
    /**
     * Calculates additional data for the given stretched canvas
     * element later reused for animation
     * 
     * @param {Element} canvas to generate data for
     * 
     * @returns {Object} data
     */
    CachedImg.prototype._genData = function(canvas) {
        var w = canvas.width;
        var h = canvas.height;

        // size of the side layer
        var maxIntensity = 0;
        var curSize = h;
        for (var i = 1; i < cfg.blocksNumber; i++) {
            curSize /= 4;
            maxIntensity += Math.floor(curSize);
        }

        // how many virtual elements do we need to reach 1 px
        var virtualNum = 1 + Math.ceil(Math.log(1/h) / Math.log(1/4));
        
        // total height of all virtual elements altogether
        var virtualSize = 0;
        curSize = h;
        for (i = 1; i < virtualNum; i++) {
            curSize /= 4;
            virtualSize += Math.floor(curSize);
        }
        
        return {
            // size of the stretched image
            stretchedSize : h,
            // texture size along the side
            sideSize      : w,
            // maximal size of the indicator layer
            maxIntensity : maxIntensity,
            // values used during calculations
            virtualPow   : 1-Math.pow(1/4, virtualNum-1),
            virtualSize3 : virtualSize*3
        };
    };
    
    
    /**
     * Represents an element upgraded with the resize event detector
     * 
     * @param {Element} elem to upgarde
     * @param {Boolean} isBody true if element is body
     */
    var Resizable = function(elem, isBody) {
        this._elem = elem;
        this._isBody = isBody;

        var me = this;
        this._handler = function() {
            me.onresize();
        };

        if (this._isBody) {
            window.addEventListener('resize', this._handler, false);
        } else {
            this._detector = util.sample.object.cloneNode(false);
            util.setStyle(this._detector, {
                display       : 'block',
                position      : 'absolute',
                top           : '0px',
                left          : '0px',
                height        : '100%',
                width         : '100%',
                overflow      : 'hidden',
                pointerEvents : 'none',
                zIndex        : -2048
            });

            this._detector.onload = function() {
                this.contentDocument.defaultView.addEventListener(
                    'resize', me._handler, false
                );
            }

            this._detector.type = 'text/html';

            if (IS_IE) {
                this._elem.appendChild(this._detector);
                this._detector.data = 'about:blank';
            } else {
                this._detector.data = 'about:blank';
                this._elem.appendChild(this._detector);
            }
        }
    };


    
    /**
     * Handler for the resize event, to be defined for an instance
     */
    Resizable.prototype.onresize = function(){};
    

    /**
     * Removes the resize detector from the element
     */
    Resizable.prototype.destroy = function() {
        if (this._isBody) {
            window.removeEventListener(
                'resize', this._handler, false
            );
        } else {
            this._elem.removeChild(this._detector);
        }
    }
    

    
    /**
     * Represents a scrollable element shipped with a scrolling
     * indicator on each of four sides
     * 
     * @param {Element} elem to create scrollable indicators for
     */
    var Squeeze = function(elem) {
        this._destroyed = false;
        this._elem = elem;
        this._isBody = (this._elem.nodeName.toLowerCase() == 'body');

        this._cmp = {};  // elements created upon scrollbar removal
        this._sideReady = {}; // info about which sides are initialized
        this._images = {}; // CachedImg instances for each side
        this._indicators = {};  // Indicator instances

        this._totals = {};  // total dimensions for each direction
        this._sizes = {};
        this._addendum = {};  // added to the scroll to prevent jump
        this._lastOrigCoord = {};

        this._hideScrollbars();

        var rect = this._cmp.scroller.getBoundingClientRect();
        var scrollWidth = this._cmp.scroller.scrollWidth;
        var scrollHeight = this._cmp.scroller.scrollHeight;

        var i, dir;
        for (i = 0; i < util.dir.length; i++) {
            dir = util.dir[i];
            this._indicators[dir] = null;
            this._sideReady[dir] = false;
            this._addendum[dir] = 0;
            this._lastOrigCoord[dir] = 0;
            
            this._totals[dir] =
                util.isVertical[dir] ? scrollHeight : scrollWidth;
            this._sizes[dir] =
                util.isVertical[dir] ? rect.height : rect.width;
        }

        this._createResizable();
        this._loadImages();
    }
    

    /**
     * Returns element
     */
    Squeeze.prototype.getElem = function() {
        return this._elem;
    }


    /**
     * Upgrades the element with the set of additional elements one
     * inside another so that the scrollbars are properly hidden, but
     * the container geometry is preserved
     */
    Squeeze.prototype._hideScrollbars = function() {
        var children = util.detachChildren(this._elem);

        var newStyle = {overflow : 'hidden'};
        this._origStyle = {overflow : this._elem.style.overflow};

        // wrapper2 to avoid extra padding for the body element
        var createWrapper2 = false;
        var wrapper2Style = {};
        if (this._isBody) {
            var margins = [
                'margin', 'marginTop', 'marginRight',
                'marginBottom', 'marginLeft'
            ];

            var cs = window.getComputedStyle(this._elem, null);
            var i, m;
            for (i = 0; i < margins.length; i++) {
                m = margins[i];
                wrapper2Style[m] = cs[m];
                this._origStyle[m] = this._elem.style[m];
            }

            newStyle.margin = 0;
            
            createWrapper2 = true;
        }

        util.setStyle(this._elem, newStyle);

        this._cmp.wrapper = util.sample.div.cloneNode(false);
        this._cmp.scroller = util.sample.div.cloneNode(false);
        this._cmp.container = util.sample.div.cloneNode(false);

        util.setStyle(this._cmp.wrapper, {
            position : createWrapper2 ? 'absolute' : 'relative',
            overflow : 'hidden',
            width    : '100%',
            height   : '100%'
        });

        util.setStyle(this._cmp.scroller, {
            position  : 'absolute',
            overflowX : 'scroll',
            overflowY : 'scroll'
        });
        
        var id = this._elem.getAttribute('id');

        if (id) {
            this._cmp.scroller.setAttribute('id', id+'-scroller');
        }

        util.attachChildren(this._cmp.container, children);
        this._cmp.scroller.appendChild(this._cmp.container);

        if (createWrapper2) {
            this._cmp.wrapper2 = util.sample.div.cloneNode(false);

            util.setStyle(this._cmp.wrapper2, {
                position : 'relative',
                overflow : 'hidden',
                width    : '100%',
                height   : '100%'
            });

            util.setStyle(this._cmp.wrapper2, wrapper2Style);
            this._cmp.wrapper2.appendChild(this._cmp.scroller);
            this._cmp.wrapper.appendChild(this._cmp.wrapper2);
        } else {
            this._cmp.wrapper.appendChild(this._cmp.scroller);
        }

        this._elem.appendChild(this._cmp.wrapper);
    }


    /**
     * Removes additional elements created in order to hide the
     * scrollbars thus restoring the element into its original state
     */
    Squeeze.prototype._revealScrollbars = function() {
        var children = util.detachChildren(this._cmp.container);
        util.detachChildren(this._elem);

        for (var prop in this._origStyle) {
            if (this._origStyle.hasOwnProperty(prop)) {
                this._elem.style[prop] = this._origStyle[prop];
            }
        }
        
        util.attachChildren(this._elem, children);
    }
    

    /**
     * Adds Resizable detector on the element
     */
    Squeeze.prototype._createResizable = function() {
        var me = this;
        this._resizable = new Resizable(
            this._cmp.wrapper, this._isBody
        );
        this._resizable.onresize = function() {
            me._setGeometry();
            me._indicate();
        }

        this._setGeometry();
    }


    /**
     * Removes the Resizable
     */
    Squeeze.prototype._destroyResizable = function() {
        this._resizable.destroy();
    }
    
    
    /**
     * Updates the subcomponents geometry according to the element
     * dimensions
     */
    Squeeze.prototype._setGeometry = function() {
        var geom = this._cmp.wrapper.getBoundingClientRect();
        util.setStyle(this._cmp.container, {
            width  : util.px(Math.ceil(geom.width)),
            height : util.px(Math.ceil(geom.height))
        });
    }

    
    /**
     * Destroys the side components
     */
    Squeeze.prototype._destroySides = function() {
        var i, indicator;
        for (i = 0; i < util.dir.length; i++) {
            indicator = this._indicators[util.dir[i]];
            if (indicator) {
                this._indicators[util.dir[i]].destroy();
            }
        }
    }
    

    /**
     * Initiates loading of images corresponding to each side
     */
    Squeeze.prototype._loadImages = function() {
        var me = this;
        var sideInitialized = {};
        var defaultUrl = this._elem.getAttribute('squeezeImg')||'';
        var img, dir, url;
        for (var i = 0; i < util.dir.length; i++) {
            dir = util.dir[i];
            url = this._elem.getAttribute(
                'squeezeimg'+dir
            );

            img = new CachedImg(url||defaultUrl);
            sideInitialized[dir] = new wl.Whenable;
            img.whenReady(
                (function(dir, img){
                     return function() {
                         if (!me._destroyed) {
                             me._indicators[dir] = new Indicator(
                                 dir, me._cmp.wrapper, img
                             );

                             me._sideReady[dir] = true;
                             sideInitialized[dir].emit();
                         }
                     }
                 })(dir, img)
            );

            this._images[dir] = img;
        }
        
        wl.whenAll(
            sideInitialized.north.getSubscriber(),
            sideInitialized.east.getSubscriber(),
            sideInitialized.south.getSubscriber(),
            sideInitialized.west.getSubscriber()
        )(function(){
            me._indicate(true);
        });

        this._cmp.scroller.addEventListener(
            'scroll', function(){me._indicate();}, false
        );
    }
    


    /**
     * Updates the scrolling indicators on each side according to the
     * current scroll state of the element
     * 
     * @param {Boolean} init true to perform initial indicate
     */
    Squeeze.prototype._indicate = function(init) {
        var geom = this._cmp.wrapper.getBoundingClientRect();
        var scrollInfo = this._getScrollInfo();
        var beyond = this._getBeyond(geom, scrollInfo);
        var infinite = this._getInfinite();

        for (var i = 0; i < util.dir.length; i++) {
            var dir = util.dir[i];
            if (this._sideReady[dir]) {
                var indicator = this._indicators[dir];
                var data = this._images[dir].getData();

                var sizesChanged = this._haveSizesChanged(dir, geom);
                var totalsChanged =
                    this._haveTotalsChanged(dir, scrollInfo);

                var origCoord = this._getOrigCoord(
                    dir, beyond, data.origSize,
                    totalsChanged || sizesChanged
                );

                var areaSize =
                    util.isVertical[dir] ? geom.height : geom.width;

                var intensity = this._getIntensity(
                    beyond[dir], infinite[dir],
                    data.maxIntensity, areaSize
                );

                var sideOffset =
                    beyond[util.isVertical[dir] ? 'west':'north'];

                if (dir == 'north' || dir == 'east') {
                    sideOffset = -sideOffset;
                }

                indicator.update(
                    geom.width, geom.height, // area geometry
                    data.points[origCoord],  // scrolling amount
                    sideOffset,              // side offset
                    intensity, totalsChanged, init // intensity
                );
            }
        }
    }
    
    
    /**
     * @returns {Object} the area scrolling information
     */
    Squeeze.prototype._getScrollInfo = function() {
        var scroller = this._cmp.scroller;
        return {
            width  : scroller.scrollWidth,
            height : scroller.scrollHeight,
            top    : scroller.scrollTop,
            left   : scroller.scrollLeft
        };
    }

    
    /**
     * For the scrollable area returns the amount of pixels scrollable
     * beyond each side
     * 
     * For Opera and zoomed page the distances may be non-integer and
     * it might not be possible to scroll to the end, so the method
     * rounds-up the values
     * 
     * @param {Object} geom geometry returned by getBoundingClientRect
     * @param {Object} scroll area scroll information
     * 
     * @returns {Object}
     */
    Squeeze.prototype._getBeyond = function(geom, scroll) {
        return {
            north : this._fixCoord(scroll.top),
            south : this._fixCoord(
                scroll.height - scroll.top - geom.height
            ),
            west  : this._fixCoord(scroll.left),
            east  : this._fixCoord(
                scroll.width - scroll.left - geom.width
            )
        };
    }
    
    
    /**
     * Fixes the geometry coordinate / scrolling amount which might be
     * reported as negative or non-integer on some browsers /
     * zoom-levels
     * 
     * @param {Number} val
     * 
     * @returns {Number} fixed coordinate (integer >=0)
     */
    Squeeze.prototype._fixCoord = function(val) {
        return Math.max(0, Math.floor(val));
    }
    
    
    /**
     * Returns the coordinate of the original (unsqueezed) texture
     * which is synced with the scrolling amount
     * 
     * @param {String} dir direction
     * @param {Object} beyond set of scrolling amounts
     * @param {Number} size (height) of the original texture
     * @param {Boolean} keep true to keep the orig coord and update
     *                       the offset instead
     * 
     * @returns {Number} original coordinate
     */
    Squeeze.prototype._getOrigCoord = function(dir, beyond, size, keep) {
        var origPoint = beyond[dir];

        var result = this._mod(origPoint, size);

        if (keep) {
            var diff = result - this._lastOrigCoord[dir];
            this._addendum[dir] -= diff;
            this._addendum[dir] = this._addendum[dir] % size;
        }

        this._lastOrigCoord[dir] = result;
        result += this._addendum[dir];
        result = this._mod(result, size);

        return result;
    }
    
    
    /**
     * Returns the information about which sides are set as being
     * infinitely scrollable with squeezeInfinite.. attributes
     * 
     * @returns {Object}
     */
    Squeeze.prototype._getInfinite = function() {
        var result = {}, dir, i;
        for (i = 0; i < util.dir.length; i++) {
            dir = util.dir[i];
            result[dir] = this._elem.getAttribute(
                'squeezeinfinite'+dir
            ) !== null;
        }

        return result;
    }
    
    
    
    /**
     * Checks if total size of the area changed in the corresponding
     * dimension. This might happen either due to resize or due to
     * dynamically changed geometry - in both cases the intensity mask
     * is updated, but not the blocks coordinates
     * 
     * @param {String} dir direction
     * @param {Object} geom geometry returned by getBoundingClientRect
     * 
     * @returns {Boolean} true if sizes changed, false otherwise
     */
    Squeeze.prototype._haveSizesChanged = function(dir, geom) {
        var changed = false;

        var newSize = util.isVertical[dir] ? geom.height : geom.width;
        if (this._sizes[dir] != newSize) {
            changed = true;
            this._sizes[dir] = newSize;
        }

        return changed;
    }


    /**
     * Checks if total size of the scrollable distance changed. This
     * might happen either due to resize or due to dynamically changed
     * content - in both cases the intensity mask is updated, but not
     * the blocks coordinates
     * 
     * @param {String} dir direction
     * @param {Object} scroll data of the scroller
     * 
     * @returns {Boolean} true if total dimensions changed
     */
    Squeeze.prototype._haveTotalsChanged = function(dir, scroll) {
        var changed = false;

        var el = this._cmp.scroller;
        var newTotal = util.isVertical[dir] ?
            scroll.height : scroll.width;
        if (this._totals[dir] != newTotal) {
            changed = true;
            this._totals[dir] = newTotal;
        }

        return changed;
    }
    

    /**
     * Returns the division remainder (0 to value-1)
     * 
     * @param {Number} value
     * @param {Number} module
     */
    Squeeze.prototype._mod = function(value, module) {
        value = value % module;
        value += module;
        value = value % module;
        if (value == module) {
            value = 0;
        }

        return value;
    }
    

    /**
     * Returns the size of the blocks container which depends on the
     * scroll amount beyond the border
     * 
     * @param {Number} beyond number of px beyond the border
     * @param {Boolean} infinite true if side is set as infinite
     * @param {Number} maxSize of the container
     * @param {Number} areaSize visible area size
     * 
     * @returns {Number} current size of the container
     */
    Squeeze.prototype._getIntensity = function(
        beyond, infinite, maxSize, areaSize
    ) {
        var intensity =
            infinite ? 1 : 1 - 1 / (beyond*cfg.indicatorGain + 1);
        var max = Math.min(maxSize, cfg.indicatorMaxArea * areaSize);
        var pad = 1;
        var size = pad + Math.ceil(intensity * (max-pad))
        return size;
    }
    
    
    /**
     * Removes the additional indicator elements, thus restores the
     * element in its original state
     */
    Squeeze.prototype.destroy = function() {
        this._destroySides();
        this._destroyResizable();
        this._revealScrollbars();
        this._destroyed = true;
    }
    


    /**
     * Indicator instance represents a scrolling indicator on a single
     * side, which consists of a set of blocks. Indicator manages
     * blocks coordiantes, geometry and related data, and reuses
     * platform-dependent Container object implementation to actually
     * update blocks on the screen.
     * 
     * @param {String} dir indicator direction
     * @param {Element} parent DOM element to create indicator on
     * @param {CachedImg} image to use for indication
     */
    var Indicator = function(dir, parent, image) {
        var geom = parent.getBoundingClientRect();
        this._offsets = [];
        this._offset = 0;
        this._parentWidth = geom.width;
        this._parentHeight = geom.height;
        this._scrollAmount = 0;
        this._shown = 0;
        this._coordinates = [];
        this._sizes = [];
        this._intensity = 0;

        this._image = image;
        this._data = image.getData();
        this._container = new Container(
            dir, parent, image, this._parentWidth, this._parentHeight
        );

        this._setParentGeometry =
            util.saverMethod(this._setParentGeometry);
        this._setScrollAmount =
            util.saverMethod(this._setScrollAmount);
        this._updateIntensity =
            util.saverMethod(this._updateIntensity);
        this._setOffset = util.saverMethod(this._setOffset);

        var me = this;
        this._intensityAnimator = new Animator(function(val) {
            me._updateIntensity(val, me._parentWidth, me._parentHeight);
        });
        
    }
    
    
    /**
     * Destroys the Indicator components created in the constructor
     */
    Indicator.prototype.destroy = function() {
        this._container.destroy();
    }
    
    
    
    /**
     * Updates the indication components according to the new data
     * 
     * @param {Number} width of the whole scrollable area
     * @param {Number} height of the whole scrollable area
     * @param {Number} amount of the scroll on the given side
     * @param {Number} offset scroll amount on the cross-side
     * @param {Number} intensity of the indication (px)
     * @param {Boolean} animate true to slide the intensity mask
     * @param {Boolean} init true to start from 0 intensity
     */
    Indicator.prototype.update = function(
        width, height, amount, offset, intensity, animate, init
    ) {
        this._image.touchSVGImage();

        this._setParentGeometry(width, height);

        this._setScrollAmount(amount);
        this._setOffset(offset);

        if (init) {
            this._intensityAnimator.jump(0);
            this._intensityAnimator.slide(intensity);
        } else if (animate) {
            this._intensityAnimator.slide(intensity);
        } else {
            this._intensityAnimator.jump(intensity);
        }
    }


    /**
     * Updates parent geometry
     * 
     * Converted to a saver method in the constructor for each instance
     * 
     * @param {Number} width
     * @param {Number} height
     */
    Indicator.prototype._setParentGeometry = function(width, height) {
        this._parentWidth = width;
        this._parentHeight = height;
        this._container.updateParentGeometry(width, height);
    }


    /**
     * Updates scroll amount
     * 
     * Converted to a saver method in the constructor for each instance
     * 
     * @param {Number} amount
     */
    Indicator.prototype._setScrollAmount = function(amount) {
        this._scrollAmount = amount;
        this._recalculateCoordinates();
        this._updateBlocks();
    }
    
    
    /**
     * Updates side offset of the indicated texture
     * 
     * Converted to a saver method in the constructor for each instance
     * 
     * @param {Number} offset
     */
    Indicator.prototype._setOffset = function(offset) {
        this._offset = offset;
        this._updateOffset();
    }


    /**
     * Recalculates the geometry of the blocks for the new scrolling
     * amount
     */
    Indicator.prototype._recalculateCoordinates = function() {
        var d = this._data;

        // first block visible area rate
        var F = this._scrollAmount / d.stretchedSize;

        // actual image size of the last visible block
        var size = d.virtualSize3 / (d.virtualPow + 3 * F);
        var realOffset = size * F;
        var total = 0;

        this._sizes = [];
        var firstSize = size;
        for (var i = 0; i < cfg.blocksNumber; i++) {
            this._sizes.unshift(size);
            total += size;
            size /= 4;
        }

        this._coordinates = [];
        var coord = Math.round(
            d.maxIntensity - total + firstSize - realOffset
        );

        for (i = 0; i < cfg.blocksNumber; i++) {
            this._coordinates.push(coord);
            coord += this._sizes[i];
        }
    }
    
    
    /**
     * Actually updates the intensity of the Indicator (gradient mask
     * size and thus the amount of blocks shown), used as the
     * animation frame function for the intensity animator object
     * 
     * @param {Number} intensity (px) size of the gradient mask
     * @param {Number} parentWidth width of the parent container
     * @param {Number} parentHeight height of the parent container
     */
    Indicator.prototype._updateIntensity = function(
        intensity, parentWidth, parentHeight
    ) {
        this._intensity = intensity;
        this._container.updateIntensity(
            intensity, parentWidth, parentHeight
        );
        this._updateBlocks();
    }
    
    
    /**
     * Calculates how many blocks are covered by the given size of the
     * gradient mask
     * 
     * @param {Number} size
     * 
     * @returns {Number} number of blocks covered
     */
    Indicator.prototype._calculateShown = function(size) {
        var shown = cfg.blocksNumber;
        for (var i = 0; i < cfg.blocksNumber; i++) {
            if (this._coordinates[i] > size) {
                shown = i;
                break;
            }
        }

        return shown;
    }
    
    
    /**
     * Actually applies current offset value
     */
    Indicator.prototype._updateOffset = function() {
        for (var i = 0; i < this._shown; i++) {
            if (this._offsets[i] != this._offset) {
                this._offsets[i] = this._offset;
                this._container.updateOffset(
                    i, this._offset,
                    this._parentWidth, this._parentHeight
                );
            }
        }
    }
    
    
    /**
     * Redraws current values of the blocks coordinates when scrolling
     * amount or container geometry changed
     */
    Indicator.prototype._updateBlocks = function() {
        this._updateShown();

        this._container.startBlocksUpdate();
        for (var i = 0; i < this._shown; i++) {
            this._updateBlock(i);
        }
        this._container.endBlocksUpdate();
    }
    
    
    /**
     * Updates the amount of shown / hidden blocks, and redraws newly
     * revealed blocks
     */
    Indicator.prototype._updateShown = function() {
        var i, oldShown = this._shown;
        this._shown = this._calculateShown(this._intensity);

        // redisplaying newly revealed blocks
        if (this._shown > oldShown) {
            for (i = oldShown; i < this._shown; i++) {
                this._updateBlock(i);
                this._container.showBlock(i);
            }
        } else if (this._shown < oldShown) {
            for (i = this._shown; i < oldShown; i++) {
                this._container.hideBlock(i);
            }
        }
    }

    
    /**
     * Updates the geometry and offset for a single block
     * 
     * @param {Number} blockNum number of the block to update
     */
    Indicator.prototype._updateBlock = function(blockNum) {
        this._container.updateBlockGeometry(
            blockNum,
            this._coordinates[blockNum],
            this._sizes[blockNum],
            this._intensity,
            this._parentWidth,
            this._parentHeight
        );

        this._container.updateOffset(
            blockNum, this._offset,
            this._parentWidth, this._parentHeight
        );
    }
    
    
    /**
     * Creates a DOM component enclosing a scroll indicator on a
     * single side. Used by all implementations of Container
     * 
     * @param {String} dir direction to create side for
     * 
     * @returns {Element} created side
     */
    var createSideElement = function(dir) {
        var side = util.sample.div.cloneNode(false);
        var vertical = util.isVertical[dir];

        // north and south are on top
        var zIndex = {
            north : 3,
            east  : 1,
            south : 2,
            west  : 0
        };

        var style = {
            pointerEvents : 'none',
            display  : 'inline',
            position : 'absolute',
            overflow : 'hidden',
            width    : vertical ? '100%' : '0px',
            height   : vertical ? '0px' : '100%',
            top      : '0px',
            left     : '0px',
            zIndex   : zIndex[dir]
        };

        // may not meet the border in some zoom-levels
        // adding 1px to overlap borders for sure
        switch (dir) {
        case 'north':
            style.top = '-1px';
            break;
        case 'east':
        case 'south':
            // updated upon intensity change
            break;
        case 'west':
            style.left = '-1px';
            break;
        }


        util.setStyle(side, style);

        return side;
    }


    /**
     * Updates the side element size to a new value which depends on
     * indication intensity
     * 
     * @param {Element} side to update
     * @param {String} dir direction to create side for
     * @param {Number} intensity (px) size of the gradient mask
     * @param {Number} width of the scrollable area
     * @param {Number} height of the scrollable area
     */
    var updateSideIntensity = function(
        side, dir, intensity, width, height
    ) {
        var style = {};
        if (util.isVertical[dir]) {
            style.height = util.px(intensity);
        } else {
            style.width = util.px(intensity);
        }

        var fullsize = util.isVertical[dir] ? height : width;
        var backcoord = fullsize - intensity;

        // may not meet the border in some zoom-levels
        // adding 1px to overlap borders for sure
        switch (dir) {
        case 'west':
        case 'north':
            break;
        case 'east':
            style.left = util.px(backcoord+1);
            break;
        case 'south':
            style.top = util.px(backcoord+1);
            break;
        }
        
        util.setStyle(side, style);
    }
    
    

    /**
     * Container is a platform-dependent object which updates the
     * blocks of a single Indicator
     * 
     * Cotainer_div creates blocks as DOM elements and uses the images
     * of the rotated canvases
     * 
     * @param {String} dir indicator direction
     * @param {Element} parent DOM element to create indicator on
     * @param {CachedImg} image to use for indication
     * @param {Number} width of the whole scrollable area
     * @param {Number} height of the whole scrollable area
     */
    var Container_div = function(dir, parent, image, width, height) {
        // constants
        this._dir = dir;
        this._isVertical = util.isVertical[dir];
        this._parent = parent;
        this._image = image;
        
        // internals
        this._side = null;
        this._blocks = [];

        this._createSide();
        this._createBlocks();
    }
    
    
    /**
     * Creates the main side component of the indicator enclosing all
     * the blocks
     */
    Container_div.prototype._createSide = function() {
        this._side = createSideElement(this._dir);
        this._parent.appendChild(this._side);
        impl.gradientMask(this._side, this._dir);
    }
    
    
    
    /**
     * Creates blocks components
     */
    Container_div.prototype._createBlocks = function() {
        var canvas = this._image.getSide(this._dir);
        var style = {
            position: 'absolute',
            display : 'none'
        };

        if (this._isVertical) {
            style.width = '100%';
        } else {
            style.height = '100%';
        }

        var block;
        for (var i = 0; i < cfg.blocksNumber; i++) {
            block = util.sample.div.cloneNode(false);
            util.setStyle(block, style);
            impl.backgroundCanvas(block, canvas);
            this._side.appendChild(block);
            this._blocks.push(block);
        }
    }
    
    
    /**
     * Destroys the components created by the Container constructor
     */
    Container_div.prototype.destroy = function() {
        this._parent.removeChild(this._side);
    }

    
    /**
     * Shows the block with the given number
     * 
     * @param {Number} blockNum number of the block to show
     */
    Container_div.prototype.showBlock = function(blockNum) {
        this._blocks[blockNum].style.display = 'block';
    }
    
    
    /**
     * Hides the block with the given number
     * 
     * @param {Number} blockNum number of the block to hide
     */
    Container_div.prototype.hideBlock = function(blockNum) {
        this._blocks[blockNum].style.display = 'none';
    }
    
    
    /**
     * Updates gradient mask amount
     * 
     * @param {Number} intensity (px) size of the gradient mask
     * @param {Number} width of the scrollable area
     * @param {Number} height of the scrollable area
     */
    Container_div.prototype.updateIntensity = function(
        intensity, width, height
    ) {
        updateSideIntensity(
            this._side, this._dir, intensity, width, height
        );
    }


    /**
     * Updates the image side offset for the given block
     * 
     * @param {Number} blockNum number of the block to update offset
     * @param {Number} offset value to set
     * @param {Number} width of the scrollable area
     * @param {Number} height of the scrollable area
     */
    Container_div.prototype.updateOffset = function(
        blockNum, offset, width, height
    ) {
        if (this._dir == 'south' || this._dir == 'west') {
            offset = -offset;
        }

        var position;
        if (this._isVertical) {
            position = util.px(offset) + ' 0px';
        } else {
            position = '0px ' + util.px(offset);
        }

        this._blocks[blockNum].style.backgroundPosition = position;
    }
    
    
    /**
     * Applies all needed changes to reflect the change of the parent
     * geometry change
     * 
     * @param {Number} width of the parent container
     * @param {Number} height of the parent container
     */
    Container_div.prototype.updateParentGeometry = function(width, height) {
        var style = {};
        if (this._isVertical) {
            style.width = util.px(width);
        } else {
            style.height = util.px(height);
        }

        util.setStyle(this._side, style);
    }
   

    /**
     * Updates geometry of a single block
     * 
     * @param {Number} blockNum number of the block to update
     * @param {Number} coordinate of the block
     * @param {Number} size of the block
     * @param {Number} intensity (px) size of the gradient mask
     * @param {Number} parentWidth
     * @param {Number} parentHeight
     */
    Container_div.prototype.updateBlockGeometry = function(
        blockNum, coordinate, size, intensity, parentWidth, parentHeight
    ) {
        if (this._dir == 'south' || this._dir == 'east') {
            coordinate = intensity - size - coordinate;
        }

        var sideSize = this._image.getData().sideSize;

        var style;
        if (this._isVertical) {
            style = {
                top : util.px(coordinate),
                height : util.px(size),
                backgroundSize :
                    util.px(sideSize) + ' ' + util.px(size)
            };
        } else {
            style = {
                left : util.px(coordinate),
                width : util.px(size),
                backgroundSize :
                    util.px(size) + ' ' + util.px(sideSize)
            }
        }

        util.setStyle(this._blocks[blockNum], style);
    }


    Container_div.prototype.startBlocksUpdate = function() {};
    Container_div.prototype.endBlocksUpdate = function() {};

    
    
    



    /**
     * @returns {Element} template of the SVG blocks
     */
    var createSVGTemplate = function() {
        var svg = util.genSVGElement('svg');
        var defs = util.genSVGElement('defs', svg);

        var linearGradient = util.genSVGLinearGradient(
            defs, null, null
        );

        var mask = util.genSVGElement('mask', defs, {
            x      : '0',
            y      : '0',
            width  : '100%',
            height : '100%'
        });

        var rectWidth = '0';
        var rectHeight = '0';

        var maskRect = util.genSVGElement('rect', mask, {
            x      : '0',
            y      : '0',
            width  : '0',
            height : '0'
        });

        var g = util.genSVGElement('g', svg);

        var patterns = [];
        var uses = [];
        var rects = [];

        for (var i = 0; i < cfg.blocksNumber; i++) {
            patterns[i] = util.genSVGElement('pattern', defs, {
                x      : '0',
                y      : '0',
                width  : '0px',
                height : '0px',
                patternUnits : 'userSpaceOnUse'
            });

            uses[i] = util.genSVGElement('use', patterns[i]);

            rects[i] = util.genSVGElement('rect', g, {
                x : '0px',
                y : '0px'
            });
        }

        util.setStyle(svg, {
            position : 'absolute',
            top      : '0px',
            left     : '0px',
            width    : '0px',
            height   : '0px'
        });

        return svg;
    }

    if (METHODS.blocks == 'svg') {
        var svgBlocksTemplate = createSVGTemplate();
    }
    

    
    /**
     * Container is a platform-dependent object which updates the
     * blocks of a single Indicator
     * 
     * Container_svg creates the blocks within a single SVG element
     * reusing the template created above
     * 
     * @param {String} dir indicator direction
     * @param {Element} parent DOM element to create indicator on
     * @param {CachedImg} image to use for indication
     * @param {Number} width of the whole scrollable area
     * @param {Number} height of the whole scrollable area
     */
    var Container_svg = function(dir, parent, image, width, height) {
        // constants
        this._dir = dir;
        this._isVertical = util.isVertical[dir];
        this._parent = parent;
        this._image = image;
        this._blockcount = Container_svg._svgBlockCounter++;

        // internals side
        this._side = null;
        this._svg = null;
        this._maskRect = null;
        this._defs = null;
        this._g = null;

        // internal blocks
        this._patterns = null;
        this._uses = null;
        this._rects = null;

        this._createSide();
        this._createBlocks(width, height);
    }
    
    Container_svg._svgBlockCounter = 0;
    
    
    
    /**
     * Creates the main side component of the indicator enclosing all
     * the blocks
     */
    Container_svg.prototype._createSide = function() {
        this._side = createSideElement(this._dir);
        this._parent.appendChild(this._side);

        var gradientId = 'svg-gradient-'+this._blockcount+'-'+UQ;
        var maskId = 'svg-mask-'+this._blockcount+'-'+UQ;

        var svg = svgBlocksTemplate.cloneNode(true);

        var full = {
            north : 'y2',
            east  : 'x1',
            south : 'y1',
            west  : 'x2'
        };

        var defs = svg.childNodes[0];
        var linearGradient = defs.childNodes[0];
        linearGradient.setAttribute('id', gradientId);
        linearGradient.setAttribute(full[this._dir], '100%');

        var mask = defs.childNodes[1];
        mask.setAttribute('id', maskId);

        var rectWidth  = this._isVertical ? '100%' : 0;
        var rectHeight = this._isVertical ? 0 : '100%';
        
        var maskRect = mask.childNodes[0];
        util.setAttributes(maskRect, {
            width  : rectWidth,
            height : rectHeight,
            style  :'stroke: none; fill: url(#'+gradientId+')'
        });

        var g = svg.childNodes[1];
        g.setAttribute('style', 'mask:url(#'+maskId+');');

        util.setStyle(svg, {
            position: 'absolute',
            top    : '0px',
            left   : '0px',
            width  : util.px(rectWidth),
            height : util.px(rectHeight)
        });
        
        this._side.appendChild(svg);

        this._svg = svg;
        this._defs = defs;
        this._maskRect = maskRect;
        this._g = g;
    }
    
    
    
    /**
     * Creates blocks components
     * 
     * @param {Number} width of the whole scrollable area
     * @param {Number} height of the whole scrollable area
     */
    Container_svg.prototype._createBlocks = function(width, height) {
        var canvas = this._image.getSide(this._dir);
        var geom = this._parent.getBoundingClientRect();
        var blocksetId = 'svg-blockset-'+this._blockcount+'-'+UQ;

        var patternWidth  = this._isVertical ? canvas.width : 0;
        var patternHeight = this._isVertical ? 0 : canvas.height;
        var rectWidth  = this._isVertical ? width : 0;
        var rectHeight = this._isVertical ? 0 : height;

        var imageId = this._image.getSVGImageId();
        this._patterns = [];
        this._uses = [];
        this._rects = [];

        var patternId, useId, rectId;
        for (var i = 0; i < cfg.blocksNumber; i++) {
            patternId = 'pattern-'+i+'-'+blocksetId;
            this._patterns[i] = this._defs.childNodes[i+2];
            util.setAttributes(this._patterns[i], {
                id     : patternId,
                width  : util.px(patternWidth),
                height : util.px(patternHeight)
            });

            useId = 'use-'+i+'-'+blocksetId;
            this._uses[i] = this._patterns[i].childNodes[0];
            this._uses[i].setAttribute('id', useId);
            this._uses[i].setAttributeNS(
                util._xlinkNS, 'xlink:href', '#'+imageId
            );

/*
var rotate = 'rotate(0)';
var translate = 'translate(0,0)';
var data = this._image.getData();
            
switch(this._dir) {
case 'north':
    rotate = 'rotate(90)';
    translate = 'translate(0,0)';
    break;
case 'east':
    rotate = 'rotate(90)';
    translate = 'translate('+data.stretchedSize+',0)';
    break;
case 'south':
    rotate = 'rotate(180)';
    translate =
        'translate('+data.sideSize+','+data.stretchedSize+')';
    break;
case 'west':
    rotate = 'rotate(270)';
    translate = 'translate(0,'+data.sideSize+')';
    break;
}
            
var transform = ['scale(1,1)', translate, rotate].join(' ');
this._uses[i].setAttribute('transform', transform);
*/


            rectId = 'rect-'+i+'-'+blocksetId;
            this._rects[i] = this._g.childNodes[i];
            util.setAttributes(this._rects[i], {
                id     : rectId,
                width  : util.px(rectWidth),
                height : util.px(rectHeight),
                style  : 'fill: url(#' + patternId + ');'
            });
            
            this._uses[i].setAttribute('transform','matrix(1 0 0 1 0 0)');
            
            
        }
    }
    
    
    /**
     * Destroys the components created by the Container constructor
     */
    Container_svg.prototype.destroy = function() {
        this._parent.removeChild(this._side);
    }

    
    /**
     * Shows the block with the given number
     * 
     * @param {Number} blockNum number of the block to show
     */
    Container_svg.prototype.showBlock = function(blockNum) {
        // block size is restored by updateIntensity() method
    }
    
    
    /**
     * Hides the block with the given number
     * 
     * @param {Number} blockNum number of the block to hide
     */
    Container_svg.prototype.hideBlock = function(blockNum) {
        var wh = {};
        if (util.isVertical[this._dir]) {
            wh.height = '0px';
        } else {
            wh.width = '0px';
        }

        util.setAttributes(this._rects[blockNum], wh);
    }
    
    
    /**
     * Updates gradient mask amount
     * 
     * @param {Number} intensity (px) size of the gradient mask
     * @param {Number} width of the scrollable area
     * @param {Number} height of the scrollable area
     */
    Container_svg.prototype.updateIntensity = function(
        intensity, width, height
    ) {
        updateSideIntensity(
            this._side, this._dir, intensity, width, height
        );

        var wh = {};
        if (this._isVertical) {
            wh.height = util.px(intensity);
        } else {
            wh.width = util.px(intensity);
        }

        util.setStyle(this._svg, wh);
        util.setAttributes(this._svg, wh);
        util.setAttributes(this._maskRect, wh);
    }


    /**
     * Updates the image side offset for the given block
     * 
     * @param {Number} blockNum number of the block to update offset
     * @param {Number} offset value to set
     * @param {Number} width of the scrollable area
     * @param {Number} height of the scrollable area
     */
    Container_svg.prototype.updateOffset = function(
        blockNum, offset, width, height
    ) {
        if (this._dir == 'south' || this._dir == 'west') {
            offset = -offset;
        }

        var sideSize = this._image.getData().sideSize;
        var offsetPx = util.px(offset % sideSize);

        var attr = {};
        attr[this._isVertical?'x':'y'] = offsetPx;
        util.setAttributes(this._patterns[blockNum], attr);
    }
    
    
    /**
     * Applies all needed changes to reflect the change of the parent
     * geometry change
     * 
     * @param {Number} width of the parent container
     * @param {Number} height of the parent container
     */
    Container_svg.prototype.updateParentGeometry = function(width, height) {
        var wh = {};
        if (this._isVertical) {
            wh.width = util.px(width);
        } else {
            wh.height = util.px(height);
        }

        util.setStyle(this._side, wh);
        util.setStyle(this._svg, wh);
        util.setAttributes(this._svg, wh);

        for (var i = 0; i < cfg.blocksNumber; i++) {
            util.setAttributes(this._rects[i], wh);
        }
    }
   

    /**
     * Updates geometry of a single block
     * 
     * @param {Number} blockNum number of the block to update
     * @param {Number} coordinate of the block
     * @param {Number} size of the block
     * @param {Number} intensity (px) size of the gradient mask
     * @param {Number} parentWidth
     * @param {Number} parentHeight
     */
    Container_svg.prototype.updateBlockGeometry = function(
        blockNum, coordinate, size, intensity, parentWidth, parentHeight
    ) {
        if (this._dir == 'south' || this._dir == 'east') {
            coordinate = intensity - size - coordinate;
        }

        var scaleSize = size / this._image.getData().stretchedSize;

        var wh;
        if (this._isVertical) {
            wh = {
                y      : util.px(coordinate),
                height : util.px(size)
            };
        } else {
            wh = {
                x     : util.px(coordinate),
                width : util.px(size)
            };
        }


            
        
        var data = this._image.getData();
        var transform = this._uses[blockNum].transform.baseVal.getItem(0);
        var angle = 0;
        var moveX = 0;
        var moveY = 0;

        switch(this._dir) {
        case 'east':
            angle = 90;
            moveX = data.stretchedSize;
            break;
        case 'south':
            angle = 180;
            moveX = data.sideSize;
            moveY = data.stretchedSize;
            break;
        case 'west':
            angle = 270;
            moveY = data.sideSize;
            break;
        }

        var scaleX = 1;
        var scaleY = 1;

        if (this._isVertical) {
            scaleY = scaleSize;
        } else {
            scaleX = scaleSize;
        }

        var matrix = util.getCommonSVG()
            .createSVGMatrix()
            .scaleNonUniform(scaleX, scaleY)
            .translate(moveX, moveY)
            .rotate(angle);

        transform.setMatrix(matrix);
        
        
        util.setAttributes(this._rects[blockNum], wh);
        util.setAttributes(this._patterns[blockNum], wh);


    }


    /**
     * Called by Indicator before and after blocks update
     * 
     * Without hiding the side, IE goes crazy about rendering
     */
    Container_svg.prototype.startBlocksUpdate = function() {
        this._side.style.display = 'none';
    };

    Container_svg.prototype.endBlocksUpdate = function() {
        this._side.style.display = 'block';
    };
    


    /**
     * Container is a platform-dependent object which updates the
     * blocks of a single Indicator
     * 
     * Container_webkitTransform creates the blocks as the separate
     * DOM elements; -webkit-transform CSS function is used to rotate
     * the images
     * 
     * @param {String} dir indicator direction
     * @param {Element} parent DOM element to create indicator on
     * @param {CachedImg} image to use for indication
     * @param {Number} width of the whole scrollable area
     * @param {Number} height of the whole scrollable area
     */
    var Container_webkitTransform = function(dir, parent, image, width, height) {
        // constants
        this._dir = dir;
        this._isVertical = util.isVertical[dir];
        this._parent = parent;
        this._image = image;
        this._canvas = image.getSide('north');

        // internals
        this._side = null;
        this._blocks = [];

        this._createSide();
        this._createBlocks();
    }
    
    
    /**
     * Creates the main side component of the indicator enclosing all
     * the blocks
     */
    Container_webkitTransform.prototype._createSide = function() {
        this._side = createSideElement(this._dir);

        var style = {
            WebkitTransformOrigin :  '0 0'
        };

        // may not meet the border in some zoom-levels
        // adding 1px to overlap borders for sure
        switch (this._dir) {
        case 'north':
            style.top = '-1px';
            break;
        case 'east':
            style.left = '1px';
            break;
        case 'south':
            style.top = '1px';
            break;
        case 'west':
            style.left = '-1px';
            break;
        }

        util.setStyle(this._side, style);
        
        this._parent.appendChild(this._side);
        impl.gradientMask(this._side, 'north');
    }
    
    
    
    /**
     * Creates blocks components
     */
    Container_webkitTransform.prototype._createBlocks = function() {
        var canvas = this._image.getSide('north');
        var style = {
            position: 'absolute',
            width : '100%'
        };

        var block, blocks = [];
        for (var i = 0; i < cfg.blocksNumber; i++) {
            block = util.sample.div.cloneNode(false);
            util.setStyle(block, style);
            impl.backgroundCanvas(block, canvas);
            this._side.appendChild(block);
            this._blocks.push(block);
        }
    }
    
    
    /**
     * Destroys the components created by the Container constructor
     */
    Container_webkitTransform.prototype.destroy = function() {
        this._parent.removeChild(this._side);
    }

    
    /**
     * Shows the block with the given number
     * 
     * @param {Number} blockNum number of the block to show
     */
    Container_webkitTransform.prototype.showBlock = function(blockNum) {
        this._blocks[blockNum].style.display = 'block';
    }
    
    
    /**
     * Hides the block with the given number
     * 
     * @param {Number} blockNum number of the block to hide
     */
    Container_webkitTransform.prototype.hideBlock = function(blockNum) {
        this._blocks[blockNum].style.display = 'none';
    }
    
    
    /**
     * Updates gradient mask amount
     * 
     * @param {Number} intensity (px) size of the gradient mask
     * @param {Number} width of the scrollable area
     * @param {Number} height of the scrollable area
     */
    Container_webkitTransform.prototype.updateIntensity = function(
        intensity, width, height
    ) {
        this._side.style.height = util.px(intensity);
    }


    /**
     * Updates the image side offset for the given block
     * 
     * @param {Number} blockNum number of the block to update offset
     * @param {Number} offset value to set
     * @param {Number} width of the scrollable area
     * @param {Number} height of the scrollable area
     */
    Container_webkitTransform.prototype.updateOffset = function(
        blockNum, offset, width, height
    ) {
        var sideSize = this._image.getData().sideSize;

        switch (this._dir) {
        case 'north':
        case 'east':
            break;
        case 'south':
            offset += width - sideSize;
            break;
        case 'west':
            offset += height - sideSize;
            break;
        }

        this._blocks[blockNum].style.backgroundPosition =
            util.px(offset) + ' 0px';
    }
    
    
    /**
     * Applies all needed changes to reflect the change of the parent
     * geometry change
     * 
     * @param {Number} width of the parent container
     * @param {Number} height of the parent container
     */
    Container_webkitTransform.prototype.updateParentGeometry = function(
        width, height
    ) {
        var rotate = '';
        var translate = '';

        switch(this._dir) {
        case 'north':
            break;
        case 'east':
            rotate = 'rotate(90deg)';
            translate = 'translate('+width+'px,0px)';
            break;
        case 'south':
            rotate = 'rotate(180deg)';
            translate = 'translate('+width+'px,'+height+'px)';
            break;
        case 'west':
            rotate = 'rotate(270deg)';
            translate = 'translate(0px,'+height+'px)';
            break;
        }

        var style = {
            width : util.px(this._isVertical ? width : height),
            WebkitTransform :  [translate, rotate].join(' ')
        }
        
        util.setStyle(this._side, style);
    }
   

    /**
     * Updates geometry of a single block
     * 
     * @param {Number} blockNum number of the block to update
     * @param {Number} coordinate of the block
     * @param {Number} size of the block
     * @param {Number} intensity (px) size of the gradient mask
     * @param {Number} parentWidth
     * @param {Number} parentHeight
     */
    Container_webkitTransform.prototype.updateBlockGeometry = function(
        blockNum, coordinate, size, intensity,
        parentWidth, parentHeight
    ) {
        var sideSize = this._image.getData().sideSize;
        var pad = 2;  // scrolls smoother (than 0) for some reason
        util.setStyle(this._blocks[blockNum], {
            top : util.px(coordinate),
            height: util.px(size+pad),
            backgroundSize:
                util.px(sideSize) + ' ' +
                util.px(size)
        });
    }

    Container_webkitTransform.prototype.startBlocksUpdate = function() {};
    Container_webkitTransform.prototype.endBlocksUpdate = function() {};
    
    
    
    /**
     * Container is a platform-dependent object which updates the
     * blocks of a single Indicator
     * 
     * Container_DXTransform creates the blocks as the separate DOM
     * elements; then uses direct-x transformations to rotate the
     * images
     * 
     * @param {String} dir indicator direction
     * @param {Element} parent DOM element to create indicator on
     * @param {CachedImg} image to use for indication
     * @param {Number} width of the whole scrollable area
     * @param {Number} height of the whole scrollable area
     */
    var Container_DXTransform = function(dir, parent, image, width, height) {
        // constants
        this._dir = dir;
        this._isVertical = util.isVertical[dir];
        this._parent = parent;
        this._image = image;


    }


    /**
     * Creates the main side component of the indicator enclosing all
     * the blocks
     */
    Container_DXTransform.prototype._createSide = function() {
    }
    
    
    
    /**
     * Creates blocks components
     */
    Container_DXTransform.prototype._createBlocks = function() {
    }
    
    
    /**
     * Destroys the components created by the Container constructor
     */
    Container_DXTransform.prototype.destroy = function() {
    }

    
    /**
     * Shows the block with the given number
     * 
     * @param {Number} blockNum number of the block to show
     */
    Container_DXTransform.prototype.showBlock = function(blockNum) {
    }
    
    
    /**
     * Hides the block with the given number
     * 
     * @param {Number} blockNum number of the block to hide
     */
    Container_DXTransform.prototype.hideBlock = function(blockNum) {
    }
    
    
    /**
     * Updates gradient mask amount
     * 
     * @param {Number} intensity (px) size of the gradient mask
     * @param {Number} width of the scrollable area
     * @param {Number} height of the scrollable area
     */
    Container_DXTransform.prototype.updateIntensity = function(
        intensity, width, height
    ) {
    }


    /**
     * Updates the image side offset for the given block
     * 
     * @param {Number} blockNum number of the block to update offset
     * @param {Number} offset value to set
     * @param {Number} width of the scrollable area
     * @param {Number} height of the scrollable area
     */
    Container_DXTransform.prototype.updateOffset = function(
        blockNum, offset, width, height
    ) {
    }
    
    
    /**
     * Applies all needed changes to reflect the change of the parent
     * geometry change
     * 
     * @param {Number} width of the parent container
     * @param {Number} height of the parent container
     */
    Container_DXTransform.prototype.updateParentGeometry = function(
        width, height
    ) {
    }
   

    /**
     * Updates geometry of a single block
     * 
     * @param {Number} blockNum number of the block to update
     * @param {Number} coordinate of the block
     * @param {Number} size of the block
     * @param {Number} intensity (px) size of the gradient mask
     * @param {Number} parentWidth
     * @param {Number} parentHeight
     */
    Container_DXTransform.prototype.updateBlockGeometry = function(
        blockNum, coordinate, size, intensity,
        parentWidth, parentHeight
    ) {
    }

    
    
    
    var Container;
    switch (METHODS.blocks) {
    case 'svg':
        Container = Container_svg;
        break;
    case 'div':
        Container = Container_div;
        break;
    case 'webkitTransform':
        Container = Container_webkitTransform;
        break;
    case 'DXTransform':
        Container = Container_DXTransform;
        break;
    }


    
    




    

    var squeezes = [];
    
    /**
     * Runs through all Squeezes, destroys those with elements which
     * do not have squeeze class anymore
     */
    var destroyUnsqueezed = function() {
        var elem;
        for (var i=0; i < squeezes.length; i++) {
            elem = squeezes[i].getElem();
            if (!util.hasClass(elem, 'squeeze')) {
                squeezes[i].destroy();
                elem.squeeze = null;
                delete elem.squeeze
                squeezes.splice(i,1);
                i--;
            }
        }
    }
    
        
    /**
     * Runs through all elements with squeeze class, creates the
     * Squeeze instance for those which do not have one
     */
    var createSqueezed = function() {
        var elems = document.getElementsByClassName('squeeze');
        for (var i = 0; i < elems.length; i++) {
            if (!elems[i].squeeze) {
                squeezes.push(new Squeeze(elems[i]));
                elems[i].squeeze = true;
            }
        }
    }


    /**
     * Updates the set of scrollable elements featured with the
     * squeeze scroll indicators
     */
    var resqueeze = function() {
        if (SQUEEZE_ENABLED) {
            destroyUnsqueezed();
            createSqueezed();
        }
    }
    

    
    if (document.readyState == "complete") {
        // page has already been loaded
        resqueeze();
    } else {
        // preserving any existing listener
        var origOnload = window.onload || function(){};

        window.onload = function(){
            origOnload();
            resqueeze();
        }
    }


    exports.resqueeze = resqueeze;
    exports.enabled = SQUEEZE_ENABLED;

}));


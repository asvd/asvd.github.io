/**
 * @fileoverview squeeze - scrolling indicaton
 * @version 0.1.0
 * 
 * @license MIT, see http://github.com/asvd/squeeze
 * Copyright (c) 2014 asvd <heliosframework@gmail.com> 
 * 
 */


(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['exports'], factory);
    } else if (typeof exports !== 'undefined') {
        factory(exports);
    } else {
        factory((root.squeeze = {}));
    }
}(
    this,
    function (exports) {

        // squeeze factor at border
        var MAXSQUEEZE = 20;

        // number of steps
        var STEPS = 1+Math.ceil(Math.log(MAXSQUEEZE)/Math.log(4));
//        STEPS = 2;
        
        // space to leave out
        var SPACE = 0;

        var util = {};

        util.dir = ['north','east','south','west'];

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
         * Removes all child nodes from the given element, and returns
         * those as array
         * 
         * @param {Element} elem to remove nodes from
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
         * Attaches to the given element the given set of nodes
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
         * Returns the string with the first letter capitalized
         * 
         * @param {String} str
         * @returns {String}
         */
        util.cap1 = function(str){
            return str.charAt(0).toUpperCase() + str.slice(1);
        }
        
        
        /**
         * Whenable event object constructor
         */
        var Whenable = function() {
            this._emitted = false;  // event state, may be emitted or not
            this._listeners = [];
            this._result = [];      // args to transfer to the listener
        }

          
        /**
         * Fires the event, issues the listeners
         * 
         * @param ... all given arguments are forwarded to the listeners
         */
        Whenable.prototype.emit = function(){
            if (!this._emitted) {
                this._emitted = true;

                for (var i = 0; i < arguments.length; i++) {
                    this._result.push(arguments[i]);
                }

                var listener;
                while(listener = this._listeners.pop()) {
                    this._invoke(listener[0], listener[1], this._result);
                }
            }
        }
          
        
        /**
         * @returns {Function} whenable subscriber to the event
         */
        Whenable.prototype.getSubscriber = function() {
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
        Whenable.prototype._whenEmitted = function(func, ctx){
            func = this._checkListener(func);
            if (this._emitted) {
                this._invoke(func, ctx, this._result);
            } else {
                this._listeners.push([func, ctx||null]);
            }
        }
          
          
        /**
         * Checks if the provided object is suitable for being subscribed
         * to the event (= is a function), throws an exception otherwise
         * 
         * @param {Object} obj to check for being subscribable
         * 
         * @throws {Exception} if object is not suitable for subscription
         * @returns {Object} the provided object if yes
         */
        Whenable.prototype._checkListener = function(listener){
            var type = typeof listener;
            if (type != 'function') {
                var msg =
                    'A function may only be subsribed to the event, '
                    + type
                    + ' was provided instead'
                throw new Error(msg);
            }

            return listener;
        }
          
          
        /**
         * (Asynchronously) invokes the given listener in the context with
         * the arguments
         * 
         * @param {Function} listener to invoke
         * @param {Object} ctx context to invoke the listener in
         * @param {Array} args to provide to the listener
         */
        Whenable.prototype._invoke = function(listener, ctx, args) {
            setTimeout(function() {
                listener.apply(ctx, args);
            },0);
        }
        
        
       
        /**
         * Images cache
         * 
         * Loads and stores the images by the given url, along with
         * the squeezed canvas
         */
        var imgCache = {};


        /**
         * Represents a single cached background image
         * 
         * Loads an image, creates stretched canvas
         */
        var CachedImg = function(url) {
            if (typeof imgCache[url] != 'undefined') {
                return imgCache[url];
            } else {
                imgCache[url] = this;

                this._url = url;
                this._load = new Whenable;
                this._fail = new Whenable;
                this.whenLoaded = this._load.getSubscriber();
                this.whenFailed = this._fail.getSubscriber();

                this._download();
            }

            return this;
        }
        
        
        
        /**
         * Loads an image
         */
        CachedImg.prototype._download = function() {
            this._img = util.sample.img.cloneNode(false);
            this._img.src = this._url;
            this._img.style.display = 'none';
            this._stretched = null;

            var me = this;
            this._img.addEventListener('load', function() {
                document.body.removeChild(me._img);
                me._stretched = me._stretch(me._img);
                me._load.emit();
            });

            this._img.addEventListener('error', function() {
                document.body.removeChild(me._img);
                me._fail.emit();
            });
            
            document.body.appendChild(this._img);
        }
        
        
        /**
         * Returns the object containing the generated stretched
         * images dataURL's, and the resulting dimensions
         */
        CachedImg.prototype.getStretched = function() {
            return this._stretched;
        }
        
        
        /**
         * Produces the stretched version of the given loaded image,
         * returns an object with dataURL strings of the stretched
         * image rotated in each direction.
         * 
         * The image is stretched in a special way, so that horizontal
         * pixels density is unchanged, but the vertical density is
         * decreased from top to bottom, therefore pixels on the top
         * edge have the same density as the original image, while the
         * pixels on the bottom edge are 4 times stretched.
         * 
         * The density function
         * 
         *   ro(x) = 45/68*x*x - 24/17*x + 1
         * 
         * comes from the following conditions:
         * 
         * 1) ro(0) = 1 (destiny at the top edge equals the orig. image)
         * 2) ro(1) = 1/4 (density at the bottom is 4 times less)
         * 3) ro'(1) = ro2'(0), where:
         *    ro2(x) = 1/4 * ro(x/4), which is a density of the same
         *    image, linearly stretched four times. The last condition
         *    means that the speed of density change for the two
         *    images attached one to another is continuous
         * 
         * @param {Element} image dom element containing the image
         * 
         * @returns {Object} dataURL's of the stretched image
         */
        CachedImg.prototype._stretch = function(image) {
            var w = image.width;
            var h = image.height;

            // canvas1 contains the original image
            var canvas1 = this._genCanvas(w,h);
            var ctx1 = canvas1.getContext('2d');
            ctx1.drawImage(image,0,0);

            // if Chrome throws an error for a local image,
            // restart it with --allow-file-access-from-files
            // (otherwise load an image from the same origin)
            var imageData1 = ctx1.getImageData(0,0,w,h);

            // canvas2 contains the stretched image
            var h2 = h * 68 / 35;
            var h2floor = Math.floor(h2);
            var canvas2 = this._genCanvas(w, h2floor);

            var ctx2 = canvas2.getContext('2d');
            var imageData2 = ctx2.createImageData(w, h2floor);

            var D1 = imageData1.data;
            var D2 = imageData2.data;

            // Index of variables:

            var ro;        // current density function value
            var y2;        // y, stretched image
            var y1;        // y, original image (calculated, float)
            var y1_floor;  // y, original image (floored)
            var y2_norm;   // y2 / h2 (normalized, 0 <= y2_norm <= 1)
            var y2_norm_2; // y2_norm squared
            var y1_norm;   // calculated normalized y of the orig img

            var rate0; // ratios of the current pixel,
            var rate1; // and the one on the next row

            var row = w*4; // imageData row (4 channels)
            var idx1;  // current pixel start idx (original image)
            var idx2;  // current pixel start idx (stretched image)
            var c;     // runs through color channels

            // correspondance maps
            var map = {
                // saves the current coordinate of the stretched image
                // indexed by original coordinate (so that we may
                // later figure out where on the stretched image
                // original coordinate could be located)
                point : [],

                // and the current destiny value so that we know how
                // much to squeeze the stretched image in order to
                // restore the original size at the given point
                destiny: []
            };

            var _15_68 = 15/68;
            var _12_17 = 12/17;
            var _45_68 = 45/68;
            var _24_17 = 24/17;

            // generating image
            for (y2 = 0; y2 < h2floor; y2++) {
                // calculating destiny at the point of y2
                y2_norm = y2/h2;
                y2_norm_2 = y2_norm * y2_norm;
                ro = _45_68 * y2_norm_2 - _24_17 * y2_norm + 1;

                // normalized coordinate of the original image
                // calculated as antiderivative of density function
                y1_norm =  _15_68 * y2_norm_2 * y2_norm
                         - _12_17 * y2_norm_2
                         +          y2_norm;

                // current y-coordinate on the original image
                y1 = y1_norm * h2;
                y1_floor = Math.floor(y1);

                map.point[y1_floor] = y2;
                map.destiny[y1_floor] = ro;
               
                rate0 = Math.min(ro, y1_floor + 1 - y1);
                rate1 = ro - rate0;

                idx1 = row*y1_floor;
                idx2 = row*y2;
                for (var col = 0; col < w; col++) {
                    for (c = 0; c < 4; c++) {
                        D2[idx2+c] = Math.round((
                            rate0 *  D1[idx1+c] +
                            rate1 * (D1[idx1+c+row]||0)
                        ) / ro);
                    }

                    idx1 += 4;
                    idx2 += 4;
                }

            }

            ctx2.putImageData(imageData2, 0, 0);

            // rotated images
            var S = this._genCanvas(w, h2floor);
            var ctxS = S.getContext('2d');
            ctxS.rotate(Math.PI);
            ctxS.drawImage(canvas2, -w, -h2floor);

            var E = this._genCanvas(h2floor, w);
            var ctxE = E.getContext('2d');
            ctxE.rotate(Math.PI/2);
            ctxE.drawImage(canvas2, 0, -h2floor);

            var W = this._genCanvas(h2floor, w);
            var ctxW = W.getContext('2d');
            ctxW.rotate(-Math.PI/2);
            ctxW.drawImage(canvas2, -w, 0);

            return {
                north: canvas2.toDataURL(),
                south: S.toDataURL(),
                east: E.toDataURL(),
                west: W.toDataURL(),
                size: h2floor,
                origSize: h,
                sideSize: w,
                map: map
            };
        }
        
        
        /**
         * Creates and returns a canvas element
         * 
         * @param {Number} w width
         * @param {Number} h height
         * 
         * @returns {Element} created canvas element
         */
        CachedImg.prototype._genCanvas = function(w,h) {
            var canvas = util.sample.canvas.cloneNode(false);
            canvas.width = w;
            canvas.height = h;
            util.setStyle(canvas, {
                width   : w,
                height  : h,
                display : 'none'
            });

            return canvas;
        }
        
        
        /**
         * Represents the element upgraded with the resize event
         * detector
         * 
         * @param {Element} elem to upgarde
         */
        var Resizable = function(elem) {
            this._elem = elem;
            this._detector = util.sample.object.cloneNode(false);
            util.setStyle(this._detector, {
                display  : 'block',
                position : 'absolute',
                top      : 0,
                left     : 0,
                height   : '100%',
                width    : '100%',
                overflow : 'hidden',
                pointerEvents : 'none',
                zIndex   : -2048
            });

            var me = this;
            this._detector.onload = function() {
                this.contentDocument.defaultView.addEventListener(
                    'resize', me.onresize
                );
            }

            this._detector.type = 'text/html';
            this._detector.data = 'about:blank';
            this._elem.appendChild(this._detector);
        }

        
        /**
         * Handler for the resize event, to be defined for an instance
         */
        Resizable.prototype.onresize = function() {}
        
        /**
         * Removes the resize detector from the element
         */
        Resizable.prototype.destroy = function() {
            this._elem.removeChild(this._detector);
        }
        

        
        /**
         * Represents a scrollable element shipped with
         * squeeze-indicators
         * 
         * @param {Element} elem to create scrollable indicators for
         */
        var Squeeze = function(elem) {
            this._elem = elem;
            var me = this;

            var children = util.detachChildren(this._elem);

            this._backup = {
                overflow: this._elem.style.overflow || ''
            };

            this._elem.style.overflow = 'hidden';

            this._resizable = new Resizable(elem);
            this._resizable.onresize = function() {
                me._setGeometry();
            }

            this._cmp = {};
            this._cmp.scroller = util.sample.div.cloneNode(false);
            util.setStyle(this._cmp.scroller, {
                position  : 'absolute',
                overflowX : 'scroll',
                overflowY : 'scroll'
            });
            
            this._cmp.container = util.sample.div.cloneNode(false);
            util.attachChildren(this._cmp.container, children);

            this._cmp.scroller.appendChild(this._cmp.container);
            this._elem.appendChild(this._cmp.scroller);

            this._cmp.sides = {};
            this._images = {};
            var url = this._elem.getAttribute('squeezeImg');
            var side, img;
            for (var i = 0; i < util.dir.length; i++) {
                side = util.sample.div.cloneNode(false);
                util.setStyle(side, {
                    display       : 'none',
                    pointerEvents : 'none',
                    position      : 'absolute'
                });

                this._cmp.sides[util.dir[i]] = {
                    main: side,
                    subs: [],
                    ready : false,
                    size: 0
                };

                this._elem.appendChild(side);

                img = new CachedImg(
                    elem.getAttribute(
                        'squeezeImg' + util.cap1(util.dir[i])
                    )||url
                );

                this._images[util.dir[i]] = img;

                img.whenLoaded(
                    (function(dir, img){
                         return function() {
                             me._initSide(dir, img.getStretched());
                         }
                     })(util.dir[i], img)
                );
            }

            this._cmp.scroller.addEventListener(
                'scroll', function(){me._indicate();}
            );

            this._setGeometry();
        }
        
        
        /**
         * Applies the geometry of subcomponents according to the
         * element dimensions
         */
        Squeeze.prototype._setGeometry = function() {
            var geom = this._elem.getBoundingClientRect();
            util.setStyle(this._cmp.container, {
                width  : geom.width,
                height : geom.height
            });
        }
        
        

        /**
         * Initializes the scrolling indicator for the given side with
         * the given CachedImage
         * 
         * @param {String} dir direction to initialize
         * @param {Object} image stretched image data
         */
        Squeeze.prototype._initSide = function(dir, image) {
            /*
            // counting number of actual images
            var num = 1 + Math.ceil(
                Math.log(MINPX/image.size) /
                Math.log(1/4)
            );
             */

            var num = STEPS;


            // size of the side layer
            var size = 0;
            var curSize = image.size;
            for (var i = 1; i < num; i++) {
                curSize /= 4;
                size += Math.floor(curSize);
            }



            // WTF?
            size *= .98



            size += SPACE;

            var side = this._cmp.sides[dir].main;
            side.style.display = 'inline';
//            side.style.backgroundColor = '#ccbbaa';
            side.style.overflow = 'hidden';
            

            switch(dir) {
            case 'north':
                util.setStyle(side, {
                    width: '100%',
                    height: size,
                    top: 0,
                    left: 0
                });
                break;
            case 'east':
                util.setStyle(side, {
                    width: size,
                    height: '100%',
                    top: 0,
                    right: 0
                });
                break;
            case 'south':
                util.setStyle(side, {
                    width: '100%',
                    height: size,
                    bottom: 0,
                    left: 0
                });
                break;
            case 'west':
                util.setStyle(side, {
                    width: size,
                    height: '100%',
                    top: 0,
                    left: 0
                });
                break;
            }
            
            // sub-elements
            var sub;
            for (i = 0; i < num; i++) {
                sub = util.sample.div.cloneNode(false);
                util.setStyle(sub, {
                    position: 'absolute',
                    backgroundImage: 'url('+image[dir]+')'
                });

                switch(dir) {
                case 'north':
                case 'south':
                    sub.style.width = '100%';
                    break;
                case 'west':
                case 'east':
                    sub.style.height = '100%';
                    break;
                }
                
                side.appendChild(sub);
                this._cmp.sides[dir].subs[i] = sub;
            }

            this._cmp.sides[dir].ready = true;
            this._cmp.sides[dir].size = size;

            this._indicate();
        }
        
        
        /**
         * Updates the scrolling indicators on each side according to
         * the current scroll state of the element
         */
        Squeeze.prototype._indicate = function() {
            var geom = this._elem.getBoundingClientRect();
            var el = this._cmp.scroller;

            // amount of pixels beyond the displayed area
            var beyond = {
                north : el.scrollTop,
                south : el.scrollHeight - el.scrollTop - geom.height,
                west  : el.scrollLeft,
                east  : el.scrollWidth - el.scrollLeft - geom.width
            };

            
            // NORTH
            if (this._cmp.sides.north.ready) {
                var image = this._images.north.getStretched();

                // how many steps do we need to reach 1 px
                var MINPX = 1;
                var num = 1 + Math.ceil(
                    Math.log(MINPX/image.size) /
                    Math.log(1/4)
                );

                // counting the total height in normal position
                var bigsize = 0;
                var curSize = image.size;
                for (var i = 1; i < num; i++) {
                    curSize /= 4;
                    bigsize += Math.floor(curSize);
                }

                
                var origCoord = beyond.north % image.origSize;
                
//                var destiny = image.map.destiny[origCoord];
                var offset = image.map.point[origCoord];
                
                
                var subs = this._cmp.sides.north.subs;
                var layerSize = this._cmp.sides.north.size;

                // percentage of visible area of the first entry
                var F = offset / image.size;

                // actual size of the image
                var size = 3*bigsize /
                    (1-Math.pow(1/4, num-1) + 3*F);



                
       /*                
                var offset = image.map.point[origCoord];

                // percentage of visible area of the first entry
                var F = offset / image.size;


                var size = 3*(layerSize-SPACE) /
                    (1-Math.pow(1/4, subs.length-1) + 3*F);

*/

                var realOffset = size * (offset/image.size);


//                var top = Math.round(layerSize - realOffset);
                
                

                var total = 0;
                var sizes = [];
                var firstSize = size;
                for (var i = 0; i < subs.length; i++) {
                    sizes.push(size);
                    total += size;
                    size /= 4;
                }

                    console.log(layerSize + ' ' + total + ' ' + firstSize + ' ' + realOffset );
                var top = Math.round(layerSize - total + firstSize - realOffset);

                for (var i = 0; i < subs.length; i++) {
                    size = sizes[subs.length-1-i]
                    util.setStyle(subs[i], {
                        top : Math.round(top),
                        height: Math.round(size),
                        backgroundSize:  image.sideSize + 'px '+Math.round(size)+'px',
                        backgroundPosition: '-'+beyond.west + 'px 0px'
                    });

                    top += Math.round(size);
                }

                
/*                
                
                for (var i = 0; i < subs.length; i++) {
//                    if (i == 0 || i == 1)
                    util.setStyle(subs[i], {
                        top : top,
                        height: Math.round(size),
                        backgroundSize:  image.sideSize + 'px '+Math.round(size)+'px'
                    });

                    size /= 4;
                    top -= Math.round(size);
                }
*/
                
                /*
                var sizes = [];
                for (var i = 0; i < subs.length; i++) {
                    sizes.push(size);
                    size /= 4;
                }


                var top = -20;
                for (i = 0; i < subs.length; i++) {
                    size = sizes[subs.length-i-1];
                    util.setStyle(subs[i], {
                        top : Math.round(top),
                        height: Math.round(size),
                        backgroundSize:  image.sideSize + 'px '+Math.round(size)+'px'
                    });

                    top += Math.round(size);
                }
                 */

            }


//            debugger;
//            console.log(east);
            
            
            
            
            
            
        }

        
        /**
         * Checks if the indicated element still has the squeeze class
         * 
         * @returns {Boolean} true if element is still indicated
         */
        Squeeze.prototype.hasSqueezeClass = function() {
            return util.hasClass(this._elem, 'squeeze');
        }

        

        /**
         * Removes the additional indicator elements, and restores the
         * element in its original state
         */
        Squeeze.prototype.destroy = function() {
            this._resizable.destroy();
            var children = util.detachChildren(this._cmp.container);
            util.detachChildren(this._elem);
            this._elem.squeeze = null;
            delete this._elem.squeeze;
            this._elem.style.overflow = this._backup.overflow;
            util.attachChildren(this._elem, children);
        }

        



        var squeezes = [];
        
        /**
         * Runs through all Squeezes, destroys those with elements
         * which do not have squeeze class anymore
         */
        var destroyUnsqueezed = function() {
            for (var i=0; i < squeezes.length; i++) {
                if (!squeezes[i].hasSqueezeClass()) {
                    squeezes[i].destroy();
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
                }
            }
        }


        /**
         * Updates the set of scrollable elements featured with the
         * squeeze scroll indicators
         */
        var resqueeze = function() {
            destroyUnsqueezed();
            createSqueezed();

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
      
    }
));


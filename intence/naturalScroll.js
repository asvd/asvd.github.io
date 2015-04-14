/**
 * @fileoverview naturalScroll - scrolls an viewport naturally
 * @version 0.1.0
 * 
 * @license MIT, see http://github.com/asvd/naturalScroll
 * @copyright 2015 asvd <heliosframework@gmail.com> 
 */


(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['exports'], factory);
    } else if (typeof exports !== 'undefined') {
        factory(exports);
    } else {
        factory((root.naturalScroll = {}));
    }
}(this, function (exports) {
    var allAnimations = [
        [],  // vertical scrolling animations, one for an element
        []   // horizontal animations
    ];

    // for better compression
    var scrollTop = 'scrollTop';
    var scrollLeft = 'scrollLeft';

    // returns scrollTop if argument is given, scrollLeft otherwise
    var genScroll = function(top) {
        var prop = top ? scrollTop : scrollLeft;
        var dirAnimations = allAnimations[top?0:1];

        // exported method
        return function(elem, target, time) {
            elem = elem.scroller || elem;  // needed for intence
            time = time || 600;

            var animation, tick, i = 0,
                f0 = elem[prop], f1 = 0, f2 = 0;

            // searching for the element's animation
            for (;i < dirAnimations.length; i++) {
                animation = (dirAnimations[i].e == elem) ?
                    dirAnimations[i] : animation;
            }

            if (animation) {
                f1 = animation.f[animation.n][1];
                f2 = animation.f[animation.n][2];
            } else {
                // generating a new animation

                // animation contains the following data:
                // .e - element on which the animation is performed
                // .f - animation frames
                // .n - current frame number
                // .r - timeout function rendering a single frame
                // .t - starting timestamp
                dirAnimations.push(animation = {e : elem});
            }

            animation.n = 0;
            animation.t = (new Date).getTime();

            // 20 msec is the delay between the frames
            var fnum = animation.l = Math.floor(time/10);
            var fnum2 = fnum * fnum;
            var fnum3 = fnum2 * fnum;
            var f0_target = f0-target;

            // calculating initial frame
            animation.f = [[
                f0,  // first element is the value
                f1,
                f2,

                // these magic formulae came from outer space
                - ( 9 * f2 * fnum2 +
                    (36 * f1 -9 * f2) * fnum -
                    36 * f1 +
                    60 * f0_target
                ) / (fnum3 - fnum),

                6 * ( 6 * f2 * fnum2 +
                      (32 * f1 -6 * f2) * fnum -
                      32 * f1 +
                      60 * f0_target
                ) / fnum / ( fnum3 + 2 * fnum2 - fnum - 2 ),
                    
                - 60 * ( f2 * fnum2 +
                         (6 * f1 - f2) * fnum -
                         6 * f1 +
                         12 * f0_target
                ) / fnum / (
                    fnum2*fnum2  + 5*(fnum3 + fnum2-fnum) - 6 
                )
            ]];

            // generating remaining frames
            while(fnum--) {
                var lastFrame = animation.f[animation.f.length-1];
                var frame = [0,0,0,0,0,lastFrame[5]];

                for (i = 4; i >= 0; i--) {
                    frame[i] = lastFrame[i]+frame[i+1];
                }

                animation.f.push(frame);
            }

            if (!animation.r) {
                var renderer;

                // creating the function for the interval,
                // and invoking it to apply the first frame instantly
                (animation.r = renderer = function() {
                     var timestamp = (new Date).getTime();
                     animation.n = Math.min(
                         Math.floor((timestamp - animation.t)/10),
                         animation.f.length-1
                     );

                     var val = elem[prop] = animation.f[animation.n][0];

                     if (animation.n < animation.f.length-1) {
                         setTimeout(renderer, 10);
                     } else {
                         animation.r = animation.n = 0;
                         animation.f = [[val, 0, 0, 0, 0, 0]];
                     }
                })();

            }  // else animation is already running
        }
    }


    exports[scrollTop] = genScroll(
        exports[scrollLeft] = genScroll()
    );
}));


!function(t,e){"function"==typeof define&&define.amd?define(["exports"],e):e("undefined"!=typeof exports?exports:t.intence={})}(this,function(t){var e={textureMaxSqueeze:1e3,indicatorMaxArea:.12,indicatorGain:1/4500,animationTime:160,animationDelay:20};e.blocksNumber=1+Math.ceil(Math.log(e.textureMaxSqueeze)/Math.log(4));var i="intence-unique-"+(new Date).getTime(),s={div:document.createElement("div"),img:document.createElement("img"),canvas:document.createElement("canvas"),object:document.createElement("object"),style:document.createElement("style")},n=function(t,e,i){for(var n,a=t;-1!=(n=a.indexOf("-"));)a=a.slice(0,n)+a.slice(n+1,n+2).toUpperCase()+a.slice(n+2);var o=s.div.cloneNode(!1),r=t+": "+e;return i&&(r+="("+i+")"),o.style.cssText=r,a in document.documentElement.style&&"-1"!=o.style[a].indexOf(e)},a=navigator.userAgent,o="undefined"!=typeof InstallTrigger,r=!1||!!document.documentMode,h=Object.prototype.toString.call(window.HTMLElement).indexOf("Constructor")>0,l=!!window.chrome,c={classList:!!s.div.classList,event:!!window.addEventListener,canvas:!!s.canvas.getContext,isolation:n("isolation","isolate"),opacity:n("opacity",".5"),transform:n("transform","translate3d","0, 0, 0"),webkitTransform:n("-webkit-transform","rotate","-180deg"),backgroundCanvas:{webkit:!!document.getCSSCanvasContext&&n("background","-webkit-canvas","a"),mozElement:n("background","-moz-element","#a")},gradientMask:{alphaFilter:n("filter","progid:DXImageTransform.Microsoft.Alpha","opacity=100,finishOpacity=0,style=1,startX=0,finishX=1,startY=0,finishY=1"),webkit:n("-webkit-mask-image","-webkit-linear-gradient","top, rgba(0,0,0,1), rgba(0,0,0,0) 100%"),svgReuse:o}},d=r&&c.gradientMask.alphaFilter,u=!0,p={hasClass:c.classList?"classList":"className",async:c.event?"event":"setTimeout",stackingContext:null,blocks:c.webkitTransform?"webkitTransform":"div",mask:null,canvas:null,floatLeft:null};c.canvas?(c.gradientMask.webkit?(p.mask="webkit",p.canvas=c.backgroundCanvas.webkit?"webkit":"dataURL"):c.gradientMask.svgReuse?c.backgroundCanvas.mozElement?(p.canvas="mozElement",p.mask="svgReuse"):p.blocks="svg":c.gradientMask.alphaFilter?(p.canvas="dataURL",p.mask="alphaFilter",p.blocks="div"):p.blocks="svg",c.isolation?p.stackingContext="isolation":d||(c.transform?p.stackingContext="transform":c.opacity&&(p.stackingContext="opacity"))):u=!1,p.floatLeft=o&&+a.match(/Firefox\/(\d+)/)[1]<36?"stylesheet":"direct","svg"!=p.blocks||r||(u=!1),(-1!=a.indexOf("Opera")||o&&+a.match(/Firefox\/(\d+)/)[1]<8||l&&+a.match(/Chrome\/(\d+)/)[1]<15||h&&+a.match(/Version\/(\d+)/)[1]<7)&&(u=!1);var _={},g=function(t,e){var i={north:"top",east:"right",south:"bottom",west:"left"};t.style.WebkitMaskImage="-webkit-linear-gradient("+i[e]+",rgba(0,0,0,1) 0%,rgba(0,0,0,.81) 10%,rgba(0,0,0,.64) 20%,rgba(0,0,0,.49) 30%,rgba(0,0,0,.36) 40%,rgba(0,0,0,.25) 50%,rgba(0,0,0,.16) 60%,rgba(0,0,0,.09) 70%,rgba(0,0,0,.04) 80%,rgba(0,0,0,.01) 90%,rgba(0,0,0,0)  100%)"},m=function(t,e){var i={x1:0,x2:0,y1:0,y2:0},s={north:"y2",east:"x1",south:"y1",west:"x2"};i[s[e]]="100";var n="progid:DXImageTransform.Microsoft.Alpha(opacity=100,finishOpacity=0,style=1,startX="+i.x1+",finishX="+i.x2+",startY="+i.y1+",finishY="+i.y2+")";t.style.filter=n},f={north:null,east:null,south:null,west:null},y=function(t,e){f[e]||(f[e]=v(e)),t.style.mask="url(#"+f[e]+")"},v=function(t){var e="svg-mask-"+t+"-"+i,s="mask-"+e,n="gradient-"+e,a=R.genSVGElement("svg"),o=R.genSVGElement("defs",a);R.genSVGLinearGradient(o,t,n);var r=R.genSVGElement("mask",o,{id:s,maskUnits:"objectBoundingBox",maskContentUnits:"objectBoundingBox"});return R.genSVGElement("rect",r,{y:"0",width:"1",height:"1",fill:"url(#"+n+")"}),R.setStyle(a,{position:"absolute",width:"0px",height:"0px"}),document.body.appendChild(a),s};switch(p.mask){case"svgReuse":_.gradientMask=y;break;case"webkit":_.gradientMask=g;break;case"alphaFilter":_.gradientMask=m}var b=function(t){t.style.isolation="isolate"},k=function(t){t.style.transform="translate3d(0,0,0)"},w=function(t){t.style.opacity=.9999999};switch(p.stackingContext){case"isolation":_.stackingContext=b;break;case"transform":_.stackingContext=k;break;case"opacity":_.stackingContext=w;break;default:_.stackingContext=function(){}}var x=function(t,e){t.style.backgroundImage="url("+R.getCanvasDataURL(e)[0]+")"},S=0,C=function(t,e){if("undefined"==typeof e.CSSContextId){var s="canvasCSSContext-"+S++ +"-"+i,n=document.getCSSCanvasContext("2d",s,e.width,e.height);n.drawImage(e,0,0),e.CSSContextId=s}t.style.background="-webkit-canvas("+e.CSSContextId+")"},V=0,G=function(t,e){if(!e.getAttribute("id")){var s="MozElement-"+V++ +"-"+i;e.setAttribute("id",s),R.setStyle(e,{position:"absolute",width:"0px",height:"0px"}),document.body.appendChild(e)}t.style.background="-moz-element(#"+e.getAttribute("id")+")"};switch(p.canvas){case"dataURL":_.backgroundCanvas=x;break;case"webkit":_.backgroundCanvas=C;break;case"mozElement":_.backgroundCanvas=G}var I=function(t,e,i){setTimeout(function(){t.apply(e||null,i||[])},0)},M=function(t,e,i){E.push([t,e||window,i]),window.postMessage(B,"*")},E=[],B="async-"+i,A=function(t){if(t.source==window&&t.data==B&&E.length>0){var e=E.shift();e[0].apply(e[1],e[2])}};"event"==p.async?(window.addEventListener("message",A,!0),_.async=M):_.async=I;var N=function(t,e){for(var i=!1,s=t.classList,n=0;n<s.length;n++)if(s[n]==e){i=!0;break}return i},z=function(t,e){for(var i=!1,s=t.className.split(" "),n=0;n<s.length;n++)if(s[n]==e){i=!0;break}return i};_.hasClass="classList"==p.hasClass?N:z;var T=function(t){t.style["float"]="left"},D=function(t){t.className=O()},L=null,O=function(){if(!L){var t="float-left-cls-"+i,e=document.getElementsByTagName("head")[0],n=s.style.cloneNode(!1);n.type="text/css",n.innerHTML="."+t+" { float:left; }",e.appendChild(n),L=t}return L};_.floatLeft="stylesheet"==p.floatLeft?D:T;var R={};R.dir=["north","east","south","west"],R.isVertical={north:!0,east:!1,south:!0,west:!1},R.ccv={north:"west",east:"north",south:"east",west:"south"},R.setStyle=function(t,e){for(var i in e)e.hasOwnProperty(i)&&(t.style[i]=e[i])},R.setAttributes=function(t,e){for(var i in e)e.hasOwnProperty(i)&&t.setAttribute(i,e[i])},R.px=function(t){return""+t+"px"},R.detachChildren=function(t){for(var e=[];t.firstChild;)e.push(t.removeChild(t.firstChild));return e},R.attachChildren=function(t,e){for(var i=0;i<e.length;i++)t.appendChild(e[i])},R.getCanvasDataURL=function(t){return"undefined"==typeof t.intence_cached_dataURL&&(t.intence_cached_dataURL=[t.toDataURL()]),t.intence_cached_dataURL},R.genCanvas=function(t,e){var i=s.canvas.cloneNode(!1);return i.width=t,i.height=e,R.setStyle(i,{width:R.px(t),height:R.px(e),display:"none"}),i},R.img2canvas=function(t){var e=R.genCanvas(t.width||t.naturalWidth,t.height||t.naturalHeight),i=e.getContext("2d");return i.drawImage(t,0,0),e},R._svgNS="http://www.w3.org/2000/svg",R._xlinkNS="http://www.w3.org/1999/xlink",R.genSVGElement=function(t,e,i){var s=document.createElementNS(R._svgNS,t);if(i)for(var n in i)i.hasOwnProperty(n)&&(-1!=n.indexOf("xlink")?s.setAttributeNS(R._xlinkNS,n,i[n]):s.setAttribute(n,i[n]));return e&&e.appendChild(s),s},R._commonSVG=null,R.getCommonSVG=function(){return R._commonSVGDefs||(R._commonSVG=R.genSVGElement("svg",document.body),R.setStyle(R._commonSVG,{width:"0px",height:"0px",position:"absolute",display:"none"})),R._commonSVG},R._commonSVGDefs=null,R.getCommonSVGDefs=function(){return R._commonSVGDefs||(R._commonSVGDefs=R.genSVGElement("defs",R.getCommonSVG())),R._commonSVGDefs},R.genSVGLinearGradient=function(t,e,i){var s={x1:"0%",y1:"0%",x2:"0%",y2:"0%"};if(e){var n={north:"y2",east:"x1",south:"y1",west:"x2"};s[n[e]]="100%"}i&&(s.id=i);var a,o,r=R.genSVGElement("linearGradient",t,s);for(a=0;10>=a;a++)o=""+(10-a)*(10-a)+"%",R.genSVGElement("stop",r,{"stop-color":"rgb("+o+","+o+","+o+")",offset:""+10*a+"%"})},R._defaultCanvas=null,R.getDefaultCanvas=function(){return R._defaultCanvas||(R._defaultCanvas=R._genDefaultCanvas()),R._defaultCanvas},R._genDefaultCanvas=function(){var t,e,i,s,n,a=200,o=200,r=R.genCanvas(a,o),h=r.getContext("2d"),l=h.createImageData(a,o),c=l.data,d=10,u=.4*d;for(t=0;o>t;t++)for(s=10+Math.floor(Math.random()*d),e=0;a>e;e++)i=4*a*t+4*e,n=Math.floor(s-u+2*u*Math.random()),c[i++]=n,c[i++]=n+5,c[i++]=n+10,c[i]=255;return h.putImageData(l,0,0),r},R.saverMethod=function(t){var e=[];return function(){var i,s=!1;for(arguments.length!=e.length&&(e=[]),i=0;i<arguments.length;i++)arguments[i]!==e[i]&&(e[i]=arguments[i],s=!0);s&&t.apply(this,arguments)}};var U={};U.Whenable=function(){this._emitted=!1,this._listeners=[],this._result=[]},U.Whenable.prototype.emit=function(){if(!this._emitted){this._emitted=!0;for(var t=0;t<arguments.length;t++)this._result.push(arguments[t]);for(var e;e=this._listeners.pop();)_.async(e[0],e[1],this._result)}},U.Whenable.prototype.getSubscriber=function(){var t=this;return function(e,i){t._whenEmitted(e,i)}},U.Whenable.prototype._whenEmitted=function(t,e){this._emitted?_.async(t,e,this._result):this._listeners.push([t,e||null])},U.whenAll=function(){if(1==arguments.length)return arguments[0];var t=new U.Whenable,e=arguments[0],i=[].slice.call(arguments,1),s=U.whenAll.apply(null,i);return e(function(){s(function(){t.emit()})}),t.getSubscriber()};var W=function(t){this._setter=t,this._current=0,this._target=null,this._delta=null,this._animTimeout=null};W.prototype.jump=function(t){if(this._animTimeout){var e=this._current,i=this._target,s=t;i>e&&s>i||e>i&&i>s?(this._delta*=(s-e)/(i-e),this._target=t):i>e&&e>s||e>i&&s>e?(this._clearTimeout(),this._applyValue(t)):this._target=t}else this._applyValue(t)},W.prototype.slide=function(t){this._target=t,this._target!=this._current&&(this._delta=(this._target-this._current)*e.animationDelay/e.animationTime),this._animTimeout||this._tick()},W.prototype._tick=function(){if(Math.abs(this._target-this._current)<Math.abs(this._delta))this._animTimeout&&this._clearTimeout(),this._applyValue(this._target);else{var t=this;this._animTimeout=setTimeout(function(){t._tick()},e.animationDelay),this._applyValue(this._current+this._delta)}},W.prototype._applyValue=function(t){this._current=t,this._setter(t)},W.prototype._clearTimeout=function(){clearTimeout(this._animTimeout),this._animTimeout=null};var P={},H=function(t){return"undefined"!=typeof P[t]?P[t]:(P[t]=this,this._url=t,this._touchTimeout=null,this._ready=new U.Whenable,this.whenReady=this._ready.getSubscriber(),this._sides={},this._data={},this._SVGImage=null,this._SVGImageId=null,this._download(),void 0)};H.prototype._download=function(){if(this._url){this._img=s.img.cloneNode(!1),this._img.src=this._url,this._img.style.display="none";var t=this;this._img.addEventListener("load",function(){t._img.parentNode.removeChild(t._img),t._init(t._img),t._ready.emit()},!1),this._img.addEventListener("error",function(){t._img.parentNode.removeChild(t._img),t._init(null),t._ready.emit()},!1),document.body.appendChild(this._img)}else this._init(null),this._ready.emit()},H.prototype.getSide=function(t){return"undefined"==typeof this._sides[t]&&(this._sides[t]=this._rotate(this._sides.north,t)),this._sides[t]};var j=0;H.prototype.getSVGImageId=function(){if(!this._SVGImage){this._SVGImageId="SVG-Image-"+j++ +"-"+i;var t=this._sides.north,e=R.getCanvasDataURL(t),s=R.getCommonSVGDefs();this._SVGImage=R.genSVGElement("image",s,{id:this._SVGImageId,x:"0",y:"0",width:R.px(t.width),height:R.px(t.height),preserveAspectRatio:"none"}),this._SVGImage.setAttributeNS(R._xlinkNS,"xlink:href",e[0])}return this._SVGImageId},H.prototype.touchSVGImage=function(){if(r&&this._SVGImage){this._touchTimeout&&clearTimeout(this._touchTimeout);var t=this;this._touchTimeout=setTimeout(function(){t._touch()},10)}},H.prototype._touch=function(){this._SVGImage.setAttribute("height",R.px(this._data.stretchedSize))},H.prototype.getData=function(){return this._data},H.prototype._init=function(t){var e=this._genImageCanvas(t),i=this._stretch(e);this._sides.north=i.canvas,this._data=this._genData(i.canvas),this._data.points=i.points,this._data.origSize=e.height},H.prototype._genImageCanvas=function(t){var e;return e=t?R.img2canvas(t):R.getDefaultCanvas()},H.prototype._stretch=function(t){var e,i,s,n,a,o,r,h,l,c,d,u,p,_=t.width,g=t.height,m=t.getContext("2d").getImageData(0,0,_,g),f=68*g/35,y=Math.floor(f),v=R.genCanvas(_,y),b=v.getContext("2d"),k=b.createImageData(_,y),w=m.data,x=k.data,S=4*_,C=[],V=15/68,G=12/17,I=45/68,M=24/17;for(i=0;y>i;i++)for(a=i/f,o=a*a,e=I*o-M*a+1,r=V*o*a-G*o+a,s=r*f,n=Math.floor(s),C[n]=i,h=Math.min(e,n+1-s),l=e-h,c=S*n,d=S*i,u=0;_>u;u++){for(p=0;4>p;p++)x[d+p]=Math.round((h*w[c+p]+l*(w[c+p+S]||0))/e);c+=4,d+=4}return b.putImageData(k,0,0),{canvas:v,points:C}},H.prototype._rotate=function(t,e){var i,s=t.width,n=t.height;i=R.isVertical[e]?R.genCanvas(s,n):R.genCanvas(n,s);var a=i.getContext("2d");switch(e){case"east":a.rotate(Math.PI/2),a.drawImage(t,0,-n);break;case"south":a.rotate(Math.PI),a.drawImage(t,-s,-n);break;case"west":a.rotate(-Math.PI/2),a.drawImage(t,-s,0)}return i},H.prototype._genData=function(t){for(var i=t.width,s=t.height,n=0,a=s,o=1;o<e.blocksNumber;o++)a/=4,n+=Math.floor(a);var r=1+Math.ceil(Math.log(1/s)/Math.log(.25)),h=0;for(a=s,o=1;r>o;o++)a/=4,h+=Math.floor(a);return{stretchedSize:s,sideSize:i,maxIntensity:n,virtualPow:1-Math.pow(.25,r-1),virtualSize3:3*h}};var F=function(t,e,i){if(this._elem=t,this._isBody=e,this._listener=i,this._isBody)window.addEventListener("resize",this._listener,!1),"complete"==document.readyState?this._listener():window.addEventListener("load",this._listener,!1);else{this._detector=s.object.cloneNode(!1),R.setStyle(this._detector,{display:"block",position:"absolute",top:"0px",left:"0px",height:"100%",width:"100%",overflow:"hidden",pointerEvents:"none",zIndex:-2048});var n=this;this._detector.onload=function(){this.contentDocument.defaultView.addEventListener("resize",n._listener,!1),n._listener()},this._detector.type="text/html",r?(this._elem.appendChild(this._detector),this._detector.data="about:blank"):(this._detector.data="about:blank",this._elem.appendChild(this._detector))}};F.prototype.destroy=function(){this._isBody?window.removeEventListener("resize",this._listener,!1):this._elem.removeChild(this._detector)};var X=function(t){this._destroyed=!1,this._elem=t,this._isBody=this._elem==document.body,this._cmp={},this._sideReady={},this._images={},this._indicators={},this._totals={},this._sizes={},this._addendum={},this._lastOrigCoord={},this._createElemStructure();var e,i,s=this._cmp.scroller.getBoundingClientRect(),n=this._cmp.scroller.scrollWidth,a=this._cmp.scroller.scrollHeight;for(e=0;e<R.dir.length;e++)i=R.dir[e],this._indicators[i]=null,this._sideReady[i]=!1,this._addendum[i]=0,this._lastOrigCoord[i]=0,this._totals[i]=R.isVertical[i]?a:n,this._sizes[i]=R.isVertical[i]?s.height:s.width;this._loadImages()};X.prototype.getElem=function(){return this._elem},X.prototype.getScroller=function(){return this._cmp.scroller},X.prototype._createElemStructure=function(){this._createElements(),this._createResizer(),this._createSides()},X.prototype._createElements=function(){this._cmp.wrapper=s.div.cloneNode(!1),this._cmp.contextor=s.div.cloneNode(!1),this._cmp.scroller=s.div.cloneNode(!1),this._cmp.pusher=s.div.cloneNode(!1),this._cmp.container=s.div.cloneNode(!1);var t={elem:{overflow:"hidden",padding:"0px"},wrapper:{position:"relative",overflow:"hidden",width:"100%",height:"100%"},contextor:{position:"absolute",overflow:"hidden",width:"100%",height:"100%"},scroller:{position:"absolute",overflow:"scroll",zIndex:0},container:{}};if(this._origStyle={overflow:this._elem.style.overflow},this._isBody){var e,i,n=["margin","marginTop","marginRight","marginBottom","marginLeft"],a=window.getComputedStyle(this._elem,null);for(e=0;e<n.length;e++)i=n[e],t.container[i]=a[i],this._origStyle[i]=this._elem.style[i];t.elem.margin=0}R.setStyle(this._elem,t.elem),R.setStyle(this._cmp.wrapper,t.wrapper),R.setStyle(this._cmp.contextor,t.contextor),R.setStyle(this._cmp.scroller,t.scroller),_.floatLeft(this._cmp.pusher),R.setStyle(this._cmp.container,t.container),_.stackingContext(this._cmp.contextor),R.attachChildren(this._cmp.container,R.detachChildren(this._elem)),this._cmp.pusher.appendChild(this._cmp.container),this._cmp.scroller.appendChild(this._cmp.pusher),this._cmp.contextor.appendChild(this._cmp.scroller),this._cmp.wrapper.appendChild(this._cmp.contextor),this._elem.appendChild(this._cmp.wrapper)},X.prototype._createResizer=function(){var t=this,e=function(){t._setGeometry(),t._indicate()};this._resizer=new F(this._cmp.wrapper,this._isBody,e)},X.prototype._createSides=function(){this._sides={};for(var t,e=["west","east","south","north"],i=0;i<e.length;i++)t=e[i],this._sides[t]=q(t),this._cmp.contextor.appendChild(this._sides[t])},X.prototype._restoreElemStructure=function(){this._resizer.destroy();var t=R.detachChildren(this._cmp.container);R.detachChildren(this._elem);for(var e in this._origStyle)this._origStyle.hasOwnProperty(e)&&(this._elem.style[e]=this._origStyle[e]);R.attachChildren(this._elem,t)},X.prototype._setGeometry=function(){var t=this._cmp.wrapper.getBoundingClientRect();R.setStyle(this._cmp.pusher,{width:R.px(Math.ceil(t.width)),height:R.px(Math.ceil(t.height))})},X.prototype._loadImages=function(){for(var t,e,i,s=this,n={},a=this._elem.getAttribute("scrollimg")||"",o=0;o<R.dir.length;o++)e=R.dir[o],i=this._elem.getAttribute("scrollimg"+e),t=new H(i||a),n[e]=new U.Whenable,t.whenReady(function(t,e){return function(){s._destroyed||(s._indicators[t]=new Y(t,s._cmp.contextor,s._sides[t],e),s._sideReady[t]=!0,n[t].emit())}}(e,t)),this._images[e]=t;U.whenAll(n.north.getSubscriber(),n.east.getSubscriber(),n.south.getSubscriber(),n.west.getSubscriber())(function(){s._indicate(!0)}),this._cmp.scroller.addEventListener("scroll",function(){s._indicate()},!1)},X.prototype._indicate=function(t){for(var e=this._cmp.wrapper.getBoundingClientRect(),i=this._getScrollInfo(),s=this._getBeyond(e,i),n=this._getInfinite(),a=0;a<R.dir.length;a++){var o=R.dir[a];if(this._sideReady[o]){var r=this._indicators[o],h=this._images[o].getData(),l=this._haveSizesChanged(o,e),c=this._haveTotalsChanged(o,i),d=this._getOrigCoord(o,s,h.origSize,c||l),u=R.isVertical[o]?e.height:e.width,p=this._getIntensity(s[o],n[o],h.maxIntensity,u),_=s[R.isVertical[o]?"west":"north"];("north"==o||"east"==o)&&(_=-_),r.update(e.width,e.height,h.points[d],_,p,c,t)}}},X.prototype._getScrollInfo=function(){var t=this._cmp.scroller;return{width:t.scrollWidth,height:t.scrollHeight,top:t.scrollTop,left:t.scrollLeft}},X.prototype._getBeyond=function(t,e){return{north:this._fixCoord(e.top),south:this._fixCoord(e.height-e.top-t.height),west:this._fixCoord(e.left),east:this._fixCoord(e.width-e.left-t.width)}},X.prototype._fixCoord=function(t){return Math.max(0,Math.floor(t))},X.prototype._getOrigCoord=function(t,e,i,s){var n=e[t],a=this._mod(n,i);if(s){var o=a-this._lastOrigCoord[t];this._addendum[t]-=o,this._addendum[t]=this._addendum[t]%i}return this._lastOrigCoord[t]=a,a+=this._addendum[t],a=this._mod(a,i)},X.prototype._getInfinite=function(){var t,e,i={};for(e=0;e<R.dir.length;e++)t=R.dir[e],i[t]=null!==this._elem.getAttribute("scrollinfinite"+t);return i},X.prototype._haveSizesChanged=function(t,e){var i=!1,s=R.isVertical[t]?e.height:e.width;return this._sizes[t]!=s&&(i=!0,this._sizes[t]=s),i},X.prototype._haveTotalsChanged=function(t,e){var i=R.isVertical[t]?e.height:e.width,s=!1;return this._totals[t]!=i&&(s=!0,this._totals[t]=i),s},X.prototype._mod=function(t,e){return t%=e,t+=e,t%=e,t==e&&(t=0),t},X.prototype._getIntensity=function(t,i,s,n){var a=i?1:1-1/(t*e.indicatorGain+1),o=Math.min(s,e.indicatorMaxArea*n),r=1,h=r+Math.ceil(a*(o-r));return h},X.prototype.destroy=function(){this._restoreElemStructure(),this._destroyed=!0};var Y=function(t,e,i,s){var n=e.getBoundingClientRect();this._offsets=[],this._offset=0,this._parentWidth=n.width,this._parentHeight=n.height,this._scrollAmount=0,this._shown=0,this._coordinates=[],this._sizes=[],this._intensity=0,this._image=s,this._data=s.getData(),this._container=new et(t,e,i,s,this._parentWidth,this._parentHeight),this._setParentGeometry=R.saverMethod(this._setParentGeometry),this._setScrollAmount=R.saverMethod(this._setScrollAmount),this._updateIntensity=R.saverMethod(this._updateIntensity),this._setOffset=R.saverMethod(this._setOffset);var a=this,o=function(t){a._updateIntensity(t,a._parentWidth,a._parentHeight)};this._intensityAnimator=new W(o)};Y.prototype.update=function(t,e,i,s,n,a,o){this._image.touchSVGImage(),this._setParentGeometry(t,e),this._setScrollAmount(i),this._setOffset(s),o?(this._intensityAnimator.jump(0),this._intensityAnimator.slide(n)):a?this._intensityAnimator.slide(n):this._intensityAnimator.jump(n)},Y.prototype._setParentGeometry=function(t,e){this._parentWidth=t,this._parentHeight=e,this._container.updateParentGeometry(t,e)},Y.prototype._setScrollAmount=function(t){this._scrollAmount=t,this._recalculateCoordinates(),this._updateBlocks()},Y.prototype._setOffset=function(t){this._offset=t,this._updateOffset()},Y.prototype._recalculateCoordinates=function(){var t=this._data,i=this._scrollAmount/t.stretchedSize,s=t.virtualSize3/(t.virtualPow+3*i),n=s*i,a=0;this._sizes=[];for(var o=s,r=0;r<e.blocksNumber;r++)this._sizes.unshift(s),a+=s,s/=4;this._coordinates=[];var h=Math.round(t.maxIntensity-a+o-n);for(r=0;r<e.blocksNumber;r++)this._coordinates.push(h),h+=this._sizes[r]},Y.prototype._updateIntensity=function(t,e,i){this._intensity=t,this._container.updateIntensity(t,e,i),this._updateBlocks()},Y.prototype._calculateShown=function(t){for(var i=e.blocksNumber,s=0;s<e.blocksNumber;s++)if(this._coordinates[s]>t){i=s;break}return i},Y.prototype._updateOffset=function(){for(var t=0;t<this._shown;t++)this._offsets[t]!=this._offset&&(this._offsets[t]=this._offset,this._container.updateOffset(t,this._offset,this._parentWidth,this._parentHeight))},Y.prototype._updateBlocks=function(){this._updateShown(),this._container.startBlocksUpdate();for(var t=0;t<this._shown;t++)this._updateBlock(t);this._container.endBlocksUpdate()},Y.prototype._updateShown=function(){var t,e=this._shown;if(this._shown=this._calculateShown(this._intensity),this._shown>e)for(t=e;t<this._shown;t++)this._updateBlock(t),this._container.showBlock(t);else if(this._shown<e)for(t=this._shown;e>t;t++)this._container.hideBlock(t)},Y.prototype._updateBlock=function(t){this._container.updateBlockGeometry(t,this._coordinates[t],this._sizes[t],this._intensity,this._parentWidth,this._parentHeight),this._container.updateOffset(t,this._offset,this._parentWidth,this._parentHeight)};var q=function(t){var e=s.div.cloneNode(!1),i={pointerEvents:"none",display:"inline",position:"absolute",overflow:"hidden",width:"0px",height:"0px",top:"0px",left:"0px",zIndex:"0"};switch(t){case"north":i.top="-1px";break;case"east":case"south":break;case"west":i.left="-1px"}return R.setStyle(e,i),e},J=function(t,e,i,s,n){var a={};R.isVertical[e]?a.height=R.px(i):a.width=R.px(i);var o=R.isVertical[e]?n:s,r=o-i;switch(e){case"west":case"north":break;case"east":a.left=R.px(r+2);break;case"south":a.top=R.px(r+2)}R.setStyle(t,a)},K=function(t,e,i,s){this._dir=t,this._isVertical=R.isVertical[t],this._parent=e,this._side=i,this._image=s,this._blocks=[],_.gradientMask(this._side,this._dir),this._createBlocks()};K.prototype._createBlocks=function(){var t=this._image.getSide(this._dir),i={position:"absolute",display:"none"};this._isVertical?i.width="100%":i.height="100%";for(var n,a=0;a<e.blocksNumber;a++)n=s.div.cloneNode(!1),R.setStyle(n,i),_.backgroundCanvas(n,t),this._side.appendChild(n),this._blocks.push(n)},K.prototype.showBlock=function(t){this._blocks[t].style.display="block"},K.prototype.hideBlock=function(t){this._blocks[t].style.display="none"},K.prototype.updateIntensity=function(t,e,i){J(this._side,this._dir,t,e,i)},K.prototype.updateOffset=function(t,e){("south"==this._dir||"west"==this._dir)&&(e=-e),e-=1;var i;i=this._isVertical?R.px(e)+" 0px":"0px "+R.px(e),this._blocks[t].style.backgroundPosition=i},K.prototype.updateParentGeometry=function(t,e){var i={};this._isVertical?i.width=R.px(t+2):i.height=R.px(e+2),R.setStyle(this._side,i)},K.prototype.updateBlockGeometry=function(t,e,i,s){("south"==this._dir||"east"==this._dir)&&(e=s-i-e);var n,a=this._image.getData().sideSize;n=this._isVertical?{top:R.px(e),height:R.px(i),backgroundSize:R.px(a)+" "+R.px(i)}:{left:R.px(e),width:R.px(i),backgroundSize:R.px(i)+" "+R.px(a)},R.setStyle(this._blocks[t],n)},K.prototype.startBlocksUpdate=function(){},K.prototype.endBlocksUpdate=function(){};var Q=function(){var t=R.genSVGElement("svg"),i=R.genSVGElement("defs",t);R.genSVGLinearGradient(i,null,null);var s=R.genSVGElement("mask",i,{x:"0",y:"0",width:"100%",height:"100%"});R.genSVGElement("rect",s,{x:"0",y:"0",width:"0",height:"0"});for(var n=R.genSVGElement("g",t),a=[],o=[],r=[],h=0;h<e.blocksNumber;h++)a[h]=R.genSVGElement("pattern",i,{x:"0",y:"0",width:"0px",height:"0px",patternUnits:"userSpaceOnUse"}),o[h]=R.genSVGElement("use",a[h]),r[h]=R.genSVGElement("rect",n,{x:"0px",y:"0px"});return R.setStyle(t,{position:"absolute",top:"0px",left:"0px",width:"0px",height:"0px"}),t};if("svg"==p.blocks)var Z=Q();var $=function(t,e,i,s,n,a){this._dir=t,this._isVertical=R.isVertical[t],this._parent=e,this._side=i,this._image=s,this._blockcount=$._svgBlockCounter++,this._svg=null,this._maskRect=null,this._defs=null,this._g=null,this._patterns=null,this._uses=null,this._rects=null,this._setMask(),this._createBlocks(n,a)};$._svgBlockCounter=0,$.prototype._setMask=function(){var t="svg-gradient-"+this._blockcount+"-"+i,e="svg-mask-"+this._blockcount+"-"+i,s=Z.cloneNode(!0),n={north:"y2",east:"x1",south:"y1",west:"x2"},a=s.childNodes[0],o=a.childNodes[0];o.setAttribute("id",t),o.setAttribute(n[this._dir],"100%");var r=a.childNodes[1];r.setAttribute("id",e);var h=this._isVertical?"100%":0,l=this._isVertical?0:"100%",c=r.childNodes[0];R.setAttributes(c,{width:h,height:l,style:"stroke: none; fill: url(#"+t+")"});var d=s.childNodes[1];d.setAttribute("style","mask:url(#"+e+");"),R.setStyle(s,{position:"absolute",top:"0px",left:"0px",width:R.px(h),height:R.px(l)}),this._side.appendChild(s),this._svg=s,this._defs=a,this._maskRect=c,this._g=d},$.prototype._createBlocks=function(t,s){var n=this._image.getSide(this._dir),a="svg-blockset-"+this._blockcount+"-"+i,o=this._isVertical?n.width:0,r=this._isVertical?0:n.height,h=this._isVertical?t:0,l=this._isVertical?0:s,c=this._image.getSVGImageId();this._patterns=[],this._uses=[],this._rects=[];for(var d,u,p,_=0;_<e.blocksNumber;_++)d="pattern-"+_+"-"+a,this._patterns[_]=this._defs.childNodes[_+2],R.setAttributes(this._patterns[_],{id:d,width:R.px(o),height:R.px(r)}),u="use-"+_+"-"+a,this._uses[_]=this._patterns[_].childNodes[0],this._uses[_].setAttribute("id",u),this._uses[_].setAttributeNS(R._xlinkNS,"xlink:href","#"+c),p="rect-"+_+"-"+a,this._rects[_]=this._g.childNodes[_],R.setAttributes(this._rects[_],{id:p,width:R.px(h),height:R.px(l),style:"fill: url(#"+d+");"}),this._uses[_].setAttribute("transform","matrix(1 0 0 1 0 0)")},$.prototype.showBlock=function(){},$.prototype.hideBlock=function(t){var e={};R.isVertical[this._dir]?e.height="0px":e.width="0px",R.setAttributes(this._rects[t],e)},$.prototype.updateIntensity=function(t,e,i){J(this._side,this._dir,t,e,i);var s={};this._isVertical?s.height=R.px(t):s.width=R.px(t),R.setStyle(this._svg,s),R.setAttributes(this._svg,s),R.setAttributes(this._maskRect,s)},$.prototype.updateOffset=function(t,e){("south"==this._dir||"west"==this._dir)&&(e=-e);var i=this._image.getData().sideSize,s=R.px(e%i),n={};n[this._isVertical?"x":"y"]=s,R.setAttributes(this._patterns[t],n)},$.prototype.updateParentGeometry=function(t,i){var s={};this._isVertical?s.width=R.px(t+2):s.height=R.px(i+2),R.setStyle(this._side,s),R.setStyle(this._svg,s),R.setAttributes(this._svg,s);for(var n=0;n<e.blocksNumber;n++)R.setAttributes(this._rects[n],s)},$.prototype.updateBlockGeometry=function(t,e,i,s){("south"==this._dir||"east"==this._dir)&&(e=s-i-e);var n,a=i/this._image.getData().stretchedSize;n=this._isVertical?{y:R.px(e),height:R.px(i)}:{x:R.px(e),width:R.px(i)},R.setAttributes(this._rects[t],n),R.setAttributes(this._patterns[t],n);var o=this._image.getData(),r=this._uses[t].transform.baseVal.getItem(0),h=0,l=0,c=0;switch(this._dir){case"east":h=90,l=o.stretchedSize;break;case"south":h=180,l=o.sideSize,c=o.stretchedSize;break;case"west":h=270,c=o.sideSize}var d=1,u=1;this._isVertical?u=a:d=a;var p=R.getCommonSVG().createSVGMatrix().scaleNonUniform(d,u).translate(l,c).rotate(h);r.setMatrix(p)},$.prototype.startBlocksUpdate=function(){this._side.style.display="none"},$.prototype.endBlocksUpdate=function(){this._side.style.display="block"};var tt=function(t,e,i,s){this._dir=t,this._isVertical=R.isVertical[t],this._parent=e,this._side=i,this._image=s,this._canvas=s.getSide("north"),this._blocks=[],this._setMask(),this._createBlocks()};tt.prototype._setMask=function(){var t={WebkitTransformOrigin:"0 0"};switch(this._dir){case"north":t.top="-1px",t.left="-1px";break;case"east":t.top="-1px",t.left="1px";break;case"south":t.top="1px",t.left="1px";break;case"west":t.top="-1px",t.left="-1px"}R.setStyle(this._side,t),_.gradientMask(this._side,"north")},tt.prototype._createBlocks=function(){for(var t,i=this._image.getSide("north"),n={position:"absolute",width:"100%"},a=0;a<e.blocksNumber;a++)t=s.div.cloneNode(!1),R.setStyle(t,n),_.backgroundCanvas(t,i),this._side.appendChild(t),this._blocks.push(t)},tt.prototype.showBlock=function(t){this._blocks[t].style.display="block"},tt.prototype.hideBlock=function(t){this._blocks[t].style.display="none"},tt.prototype.updateIntensity=function(t){this._side.style.height=R.px(t)},tt.prototype.updateOffset=function(t,e,i,s){var n=this._image.getData().sideSize;switch(this._dir){case"north":case"east":e-=1;break;case"south":e+=i-n,e+=1;break;case"west":e+=s-n,e+=1}this._blocks[t].style.backgroundPosition=R.px(e)+" 1px"},tt.prototype.updateParentGeometry=function(t,e){var i="",s="";switch(this._dir){case"north":break;case"east":i="rotate(90deg)",s="translate("+t+"px,0px)";break;case"south":i="rotate(180deg)",s="translate("+t+"px,"+e+"px)";break;case"west":i="rotate(270deg)",s="translate(0px,"+e+"px)"}var n={width:R.px((this._isVertical?t:e)+2),WebkitTransform:[s,i].join(" ")};R.setStyle(this._side,n)},tt.prototype.updateBlockGeometry=function(t,e,i){var s=this._image.getData().sideSize,n=2;R.setStyle(this._blocks[t],{top:R.px(e),height:R.px(i+n),backgroundSize:R.px(s)+" "+R.px(i)})},tt.prototype.startBlocksUpdate=function(){},tt.prototype.endBlocksUpdate=function(){};var et;switch(p.blocks){case"svg":et=$;break;case"div":et=K;break;case"webkitTransform":et=tt}var it=[],st=function(){if(u)for(var t,e=0;e<it.length;e++)t=it[e].getElem(),_.hasClass(t,"intence")||(it[e].destroy(),t.intence=null,t.scroller=null,delete t.intence,delete t.scroller,it.splice(e,1),e--)},nt=function(){var t,e,i=document.getElementsByClassName("intence");for(t=0;t<i.length;t++)if(e=i[t],u){if(!e.intence){var s=new X(e);it.push(s),e.intence=!0,e.scroller=s.getScroller()}}else e.scroller=e},at=function(){st(),nt()};"complete"==document.readyState?at():window.addEventListener("load",at,!1),t.reset=at,t.enabled=u});
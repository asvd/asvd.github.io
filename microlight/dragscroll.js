!function(e,n){"function"==typeof define&&define.amd?define(["exports"],n):n("undefined"!=typeof exports?exports:e.dragscroll={})}(this,function(e){var n=window,t=document,o="mousemove",l="mouseup",i="mousedown",c="EventListener",r="add"+c,m="remove"+c,d="container",s=[],f=function(e,c){for(e=0;e<s.length;)c=s[e++],c=c[d]||c,c[m](i,c.md,0),n[m](l,c.mu,0),n[m](o,c.mm,0);for(s=[].slice.call(t.getElementsByClassName("dragscroll")),e=0;e<s.length;)!function(e,c,m,s,f,u){(u=e[d]||e)[r](i,u.md=function(n){e.hasAttribute("nochilddrag")&&t.elementFromPoint(n.pageX,n.pageY)!=u||(s=1,c=n.clientX,m=n.clientY,n.preventDefault())},0),n[r](l,u.mu=function(){s=0},0),n[r](o,u.mm=function(n){s&&((f=e.scroller||e).scrollLeft-=-c+(c=n.clientX),f.scrollTop-=-m+(m=n.clientY))},0)}(s[e++])};"complete"==t.readyState?f():n[r]("load",f,0),e.reset=f});
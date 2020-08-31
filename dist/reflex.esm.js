/*! @ryanmorr/reflex v0.1.0 | https://github.com/ryanmorr/reflex */var n=function(b,c,d,f){var e;c[0]=0;for(var g=1;g<c.length;g++){var i=c[g++],j=c[g]?(c[0]|=i?1:2,d[c[g++]]):c[++g];3===i?f[0]=j:4===i?f[1]=Object.assign(f[1]||{},j):5===i?(f[1]=f[1]||{})[c[++g]]=j:6===i?f[1][c[++g]]+=j+"":i?(e=b.apply(j,n(b,j,d,["",null])),f.push(e),j[0]?c[0]|=2:(c[g-2]=0,c[g]=e)):f.push(j)}return f},t=new Map;function htm(a){var b=t.get(this);return b||(b=new Map,t.set(this,b)),1<(b=n(this,b.get(a)||(b.set(a,b=function(b){for(var c,d,f=1,g="",i="",j=[0],k=function(a){1===f&&(a||(g=g.replace(/^\s*\n\s*|\s*\n\s*$/g,"")))?j.push(0,a,g):3===f&&(a||g)?(j.push(3,a,g),f=2):2===f&&"..."===g&&a?j.push(4,a,0):2===f&&g&&!a?j.push(5,0,!0,g):5<=f&&((g||!a&&5===f)&&(j.push(f,0,g,d),f=6),a&&(j.push(f,a,0,d),f=6)),g=""},m=0;m<b.length;m++){m&&(1===f&&k(),k(m));for(var n=0;n<b[m].length;n++)c=b[m][n],1===f?"<"===c?(k(),j=[j],f=3):g+=c:4===f?"--"===g&&">"===c?(f=1,g=""):g=c+g[0]:i?c===i?i="":g+=c:"\""===c||"'"===c?i=c:">"===c?(k(),f=1):f&&("="===c?(f=5,d=g,g=""):"/"===c&&(5>f||">"===b[m][n+1])?(k(),3===f&&(j=j[0]),f=j,(j=j[0]).push(2,0,f),f=0):" "===c||"\t"===c||"\n"===c||"\r"===c?(k(),f=2):g+=c),3===f&&"!--"===g&&(f=4,j=j[0])}return k(),j}(a)),b),arguments,[])).length?b:b[0]}function unwrapExports(a){return a&&a.__esModule&&Object.prototype.hasOwnProperty.call(a,"default")?a["default"]:a}function createCommonjsModule(a,b){return b={exports:{}},a(b,b.exports),b.exports}var createStore_esm=createCommonjsModule(function(a,b){Object.defineProperty(b,"__esModule",{value:!0}),b["default"]=void 0;b["default"]=function(i){return function(){var j,k=[],a=function(){return j},c=function(){for(var b=arguments.length,c=Array(b),a=0;a<b;a++)c[a]=arguments[a];return j=c[0],k.slice().forEach(function(b){return b.apply(void 0,c)}),j},d=function(c){if(!k.includes(c))return k.push(c),c(j),function(){var a=k.indexOf(c);-1!==a&&k.splice(a,1)}},e=i(a,c,d,k),f=e.apply(void 0,arguments);return f.subscribe||(f.subscribe=d),f}}}),createStore=unwrapExports(createStore_esm);function _defineProperty(a,b,c){return b in a?Object.defineProperty(a,b,{value:c,enumerable:!0,configurable:!0,writable:!0}):a[b]=c,a}function _slicedToArray(a,b){return _arrayWithHoles(a)||_iterableToArrayLimit(a,b)||_unsupportedIterableToArray(a,b)||_nonIterableRest()}function _arrayWithHoles(a){if(Array.isArray(a))return a}function _iterableToArrayLimit(a,b){if("undefined"!=typeof Symbol&&Symbol.iterator in Object(a)){var c=[],d=!0,e=!1,f=void 0;try{for(var g,h=a[Symbol.iterator]();!(d=(g=h.next()).done)&&(c.push(g.value),!(b&&c.length===b));d=!0);}catch(a){e=!0,f=a}finally{try{d||null==h["return"]||h["return"]()}finally{if(e)throw f}}return c}}function _unsupportedIterableToArray(a,b){if(a){if("string"==typeof a)return _arrayLikeToArray(a,b);var c=Object.prototype.toString.call(a).slice(8,-1);return"Object"===c&&a.constructor&&(c=a.constructor.name),"Map"===c||"Set"===c?Array.from(c):"Arguments"===c||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(c)?_arrayLikeToArray(a,b):void 0}}function _arrayLikeToArray(a,b){(null==b||b>a.length)&&(b=a.length);for(var c=0,d=Array(b);c<b;c++)d[c]=a[c];return d}function _nonIterableRest(){throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}function _createForOfIteratorHelper(a){if("undefined"==typeof Symbol||null==a[Symbol.iterator]){if(Array.isArray(a)||(a=_unsupportedIterableToArray(a))){var b=0,c=function(){};return{s:c,n:function(){return b>=a.length?{done:!0}:{done:!1,value:a[b++]}},e:function e(a){throw a},f:c}}throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}var d,e,f=!0,g=!1;return{s:function s(){d=a[Symbol.iterator]()},n:function(){var a=d.next();return f=a.done,a},e:function e(a){g=!0,e=a},f:function f(){try{f||null==d["return"]||d["return"]()}finally{if(g)throw e}}}}/*! @ryanmorr/schedule-render v2.0.1 | https://github.com/ryanmorr/schedule-render */var frame,budget=null,batch=[];function render(){for(frame=null;0<batch.length;)batch.shift().render()}function scheduleRender(c){return new Promise(function(a,b){frame||(frame=requestAnimationFrame(render)),batch.push({render:function(){return a(c())},cancel:b})})}var promise,queue=new Map;function render$1(){var a,b=_createForOfIteratorHelper(queue);try{for(b.s();!(a=b.n()).done;){var c=_slicedToArray(a.value,2),d=c[0],e=c[1];e(),queue["delete"](d)}}catch(a){b.e(a)}finally{b.f()}promise=null}function scheduleFrame(){promise||(promise=scheduleRender(render$1))}function queueRender(a,b,c){scheduleFrame(),queue.set(a,function(){return c(b)})}function tick(){scheduleFrame();for(var a=arguments.length,b=Array(a),c=0;c<a;c++)b[c]=arguments[c];return 0<b.length&&b.forEach(function(a){return promise.then(a)}),promise}function isStore(a){return a&&"function"==typeof a.subscribe}var store=createStore(function(a,b){return function(c){b(c);var d=function(c){return b(c,a()),tick()};return{get:a,set:d,update:function(b){return d(b(a()))}}}}),derived=createStore(function(a,b){return function(){for(var c=!1,d=arguments.length,e=Array(d),f=0;f<d;f++)e[f]=arguments[f];var g=e.pop(),h=[],j=function(){return b(g.apply(void 0,h),a())};return e.forEach(function(a,b){return a.subscribe(function(a){h[b]=a,c&&j()})}),c=!0,j(),{get:a}}}),bindings=new Map;function attach(a,b){if(Array.isArray(a))return a.forEach(function(a){return attach(a,b)});var c=bindings.get(a);c?c.push(b):c=[b],bindings.set(a,c)}function dispose(a){var b=bindings.get(a);b&&(b.forEach(function(a){return a()}),bindings["delete"](a)),a.hasChildNodes()&&Array.from(a.childNodes).forEach(dispose)}var REF=Symbol("ref");function isRef(a){return a&&!0===a[REF]}var ref=createStore(function(a,b){return function(){for(var c,d=arguments.length,e=Array(d),f=0;f<d;f++)e[f]=arguments[f];return b(e),c={},_defineProperty(c,REF,!0),_defineProperty(c,"get",function(b){var c=a();return"number"==typeof b?c[b]:c}),_defineProperty(c,"add",function(){for(var c=this,d=arguments.length,e=Array(d),f=0;f<d;f++)e[f]=arguments[f];e.forEach(function(d){var e=a();if(d.nodeName&&-1===e.indexOf(d)){var f=e.slice();f.push(d),b(f,e,d,1),attach(d,function(){return c.remove(d)})}})}),_defineProperty(c,"remove",function(){for(var c=arguments.length,d=Array(c),e=0;e<c;e++)d[e]=arguments[e];d.forEach(function(c){var d=a(),e=d.indexOf(c);if(-1!==e){var f=d.slice();f.splice(e,1),b(f,d,c,-1)}})}),c}});function uuid(){return Math.random().toString(36).substr(2,9)}var BINDING=Symbol("binding");function bindInput(a,b){var c=b.get();null==c&&(c="",b.set(c));var d=uuid(),e=b.subscribe(function(b){b!==c&&queueRender(d,b,function(b){a.value=c=b})}),f=function(){c=a.value,b.set(c)};a.addEventListener("input",f),a.value=c,attach(a,function(){e(),a.removeEventListener("input",f)})}function bindNumericInput(a,b){var c=b.get();null==c&&(c=0,b.set(c));var d=uuid(),e=b.subscribe(function(b){b!==c&&queueRender(d,b,function(b){a.value=c=b})}),f=function(){c=+a.value,b.set(c)};a.addEventListener("input",f),a.value=c,attach(a,function(){e(),a.removeEventListener("input",f)})}function bindCheckboxAndRadio(a,b){var c=b.get();null==c&&(c=!1,b.set(c));var d=uuid(),e=b.subscribe(function(b){b!==c&&queueRender(d,b,function(b){a.checked=c=b})}),f=function(){c=a.checked,b.set(c)};a.addEventListener("change",f),a.checked=c,attach(a,function(){e(),a.removeEventListener("change",f)})}function bindSelect(a,b){var c=b.get();if(null==c){var d=a.options[a.selectedIndex];c=d?d.value:"",b.set(c)}var e=uuid(),f=function(b){for(var d,e=0;e<a.options.length;e++)if(d=a.options[e],d.value===b)return d.selected=!0,void(c=b)},g=b.subscribe(function(a){a!==c&&queueRender(e,a,f)}),h=function(){var d=a.options[a.selectedIndex];d&&(c=d.value,b.set(c))};a.addEventListener("input",h),f(c),attach(a,function(){g(),a.removeEventListener("input",h)})}function bindSelectMultiple(a,b){var c=!1,d=b.get();null==d&&(d=[],b.set(d));var e=uuid(),f=function(b){for(var c,d=0;d<a.options.length;d++)c=a.options[d],c.selected=~b.indexOf(c.value)},g=b.subscribe(function(a){c&&queueRender(e,a,f)}),h=function(){return b.set(Array.from(a.selectedOptions).map(function(a){return a.value}))};a.addEventListener("input",h),c=!0,f(d),attach(a,function(){g(),a.removeEventListener("input",h)})}function bind(a){var b=function(b,c){var d=b.nodeName.toLowerCase();if("textarea"===d&&"value"===c)return bindInput(b,a);if("select"===d&&"value"===c)return"select-multiple"===b.type?bindSelectMultiple(b,a):bindSelect(b,a);if("input"===d){if(("checkbox"===b.type||"radio"===b.type)&&"checked"===c)return bindCheckboxAndRadio(b,a);if("value"===c)return"number"===b.type||"range"===b.type?bindNumericInput(b,a):bindInput(b,a)}};return b[BINDING]=!0,b}function isBinding(a){return a&&!0===a[BINDING]}var HOOK=Symbol("hook");function isHook(a){return"function"==typeof a&&!0===a[HOOK]}function hook(a){for(var b=arguments.length,c=Array(1<b?b-1:0),d=1;d<b;d++)c[d-1]=arguments[d];var e=function(b,d,e){return a.apply(void 0,[b,d,e].concat(c))};return e[HOOK]=!0,e}var build=htm.bind(createElement),SVG_TAGS=["svg","altGlyph","altGlyphDef","altGlyphItem","animate","animateColor","animateMotion","animateTransform","circle","clipPath","color-profile","cursor","defs","desc","ellipse","feBlend","feColorMatrix","feComponentTransfer","feComposite","feConvolveMatrix","feDiffuseLighting","feDisplacementMap","feDistantLight","feFlood","feFuncA","feFuncB","feFuncG","feFuncR","feGaussianBlur","feImage","feMerge","feMergeNode","feMorphology","feOffset","fePointLight","feSpecularLighting","feSpotLight","feTile","feTurbulence","filter","font","font-face","font-face-format","font-face-name","font-face-src","font-face-uri","foreignObject","g","glyph","glyphRef","hkern","image","line","linearGradient","marker","mask","metadata","missing-glyph","mpath","path","pattern","polygon","polyline","radialGradient","rect","set","stop","switch","symbol","text","textPath","title","tref","tspan","use","view","vkern"];function createClass(a){var b="";if("string"==typeof a)return a;if(Array.isArray(a)&&0<a.length)for(var c,d=0,e=a.length;d<e;d++)""!==(c=createClass(a[d]))&&(b+=(b&&" ")+c);else for(var f in a)a[f]&&(b+=(b&&" ")+f);return b}function arrayToFrag(a){return a.reduce(function(a,b){return null!=b&&a.appendChild(getNode(b)),a},document.createDocumentFragment())}function getNodes(a){return 11===a.nodeType?Array.from(a.childNodes):a}function clearNodes(a,b){Array.isArray(b)?b.forEach(function(b){return a.removeChild(b)}):a.removeChild(b)}function createElement(a,b){b=b||{};for(var c=arguments.length,d=Array(2<c?c-2:0),e=2;e<c;e++)d[e-2]=arguments[e];if("function"==typeof a)return b.children=d,a(b);var f=SVG_TAGS.includes(a),g=f?document.createElementNS("http://www.w3.org/2000/svg",a):document.createElement(a);if(d&&g.appendChild(arrayToFrag(d)),b){for(var h in b){var i=b[h];isHook(i)&&i(g,h,b)}for(var j in b){var k=b[j];isHook(k)||(isBinding(k)?k(g,j):"ref"===j&&isRef(k)?k.add(g):isStore(k)?observeAttribute(g,k,j,f):patchAttribute(g,j,null,k,f))}}return g}function createNode(a){return null==a?document.createTextNode(""):("number"==typeof a&&(a+=""),"string"==typeof a?document.createTextNode(a):Array.isArray(a)?arrayToFrag(a):a)}function getNode(a){return isStore(a)?observeNode(a):createNode(a)}function observeAttribute(a,b,c,d){var e,f=uuid(),g=!0,h=b.subscribe(function(b){g||b===e||null==e&&null==b?(e=b,g=!1):queueRender(f,b,function(b){patchAttribute(a,c,e,b,d),e=b})});attach(a,h),patchAttribute(a,c,null,e,d)}function observeNode(a){var b,c,d=uuid(),e=document.createTextNode(""),f=!0,g=a.subscribe(function(a){f||a===b?(b=a,f=!1):queueRender(d,a,function(a){c=patchNode(c,a,e),b=a,attach(c,g)})}),h=createNode(b);c=getNodes(h),attach(c,g);var i=document.createDocumentFragment();return i.appendChild(h),i.appendChild(e),attach(i,g),i}function patchAttribute(a,b,c,d){var e=!!(4<arguments.length&&void 0!==arguments[4])&&arguments[4];if("class"===b&&(b="className"),("class"===b||"className"===b)&&(d=createClass(d)),"style"!==b)b.startsWith("on")&&("function"==typeof c||"function"==typeof d)?(b=b.slice(2).toLowerCase(),d&&a.addEventListener(b,d),c&&a.removeEventListener(b,c)):!e&&"list"!==b&&"form"!==b&&b in a?a[b]=null==d?"":d:null==d||!1===d?a.removeAttribute(b):a.setAttribute(b,d);else if("string"==typeof d)a.style.cssText=d;else for(var f in Object.assign({},d,c)){var g=null==d||null==d[f]?"":d[f];f.includes("-")?a.style.setProperty(f,g):a.style[f]=g}}function patchNode(a,b,c){if("number"==typeof b&&(b+=""),3===a.nodeType&&"string"==typeof b)return a.data=b,a;var d=c.parentNode,e=createNode(b),f=getNodes(e);return Array.isArray(a)?0===a.length?d.insertBefore(e,c):1===a.length?d.replaceChild(e,a[0]):(clearNodes(d,a),d.insertBefore(e,c)):a.replaceWith(e),f}function html(){var a=build.apply(void 0,arguments);return Array.isArray(a)?arrayToFrag(a):getNode(a)}function longestPositiveIncreasingSubsequence(a,b){for(var c,d=[],e=[],f=-1,g=Array(a.length),h=b,k=a.length;h<k;h++)if(c=a[h],!(0>c)){var m=findGreatestIndexLEQ(d,c);-1!==m&&(g[h]=e[m]),m===f?(f++,d[f]=c,e[f]=h):c<d[m+1]&&(d[m+1]=c,e[m+1]=h)}for(var j=e[f];0<=f;j=g[j],f--)d[f]=j;return d}function findGreatestIndexLEQ(a,b){var c=-1,d=a.length;if(0<d&&a[d-1]<=b)return d-1;for(;1<d-c;){var e=Math.floor((c+d)/2);a[e]>b?d=e:c=e}return c}function removeNode(a,b){a.removeChild(b),dispose(b)}function reconcile(c,d,e,f,g,h){if(0===e.length){if(g!==void 0||h!==void 0){var j,k=g===void 0?c.firstChild:g.nextSibling;for(void 0===h&&(h=null);k!==h;)j=k.nextSibling,removeNode(c,k),k=j}else c.textContent="";return}if(0===d.length){for(var l,m=void 0===h?0:1,n=0,o=e.length;n<o;n++)l=f(e[n],n,e),m?c.insertBefore(l,h):c.appendChild(l);return}var p,q,r=0,s=0,t=!0,u=d.length-1,v=e.length-1,w=g?g.nextSibling:c.firstChild,x=w,y=h?h.previousSibling:c.lastChild;fixes:for(;t;){t=!1;var z=void 0;for(p=d[r],q=e[s];p===q;){if(r++,s++,x=w=w.nextSibling,u<r||v<s)break fixes;p=d[r],q=e[s]}for(p=d[u],q=e[v];p===q;){if(u--,v--,h=y,y=y.previousSibling,u<r||v<s)break fixes;p=d[u],q=e[v]}for(p=d[u],q=e[s];p===q;){if(t=!0,z=y.previousSibling,c.insertBefore(y,x),y=z,s++,u--,u<r||v<s)break fixes;p=d[u],q=e[s]}for(p=d[r],q=e[v];p===q;){if(t=!0,z=w.nextSibling,c.insertBefore(w,h),r++,h=w,w=z,v--,u<r||v<s)break fixes;p=d[r],q=e[v]}}if(v<s){if(r<=u)for(var A;r<=u;)0===u?removeNode(c,y):(A=y.previousSibling,removeNode(c,y),y=A),u--;return}if(u<r){if(s<=v)for(var B,C=h?1:0;s<=v;)B=f(e[s],s,e),C?c.insertBefore(B,h):c.appendChild(B),s++;return}for(var D=Array(v+1-s),E=s;E<=v;E++)D[E]=-1;for(var F=new Map,G=s;G<=v;G++)F.set(e[G],G);for(var H=s+e.length-1-v,I=[],J=r;J<=u;J++)F.has(d[J])?(D[F.get(d[J])]=J,H++):I.push(J);if(0===H){if(g!==void 0||h!==void 0){var K,L=g===void 0?c.firstChild:g.nextSibling;for(void 0===h&&(h=null);L!==h;)K=L.nextSibling,removeNode(c,L),L=K,r++}else c.textContent="";for(var M,N=h?1:0,O=s;O<=v;O++)M=f(e[O],O,e),N?c.insertBefore(M,h):c.appendChild(M);return}for(var P=longestPositiveIncreasingSubsequence(D,s),Q=[],R=w,S=r;S<=u;S++)Q[S]=R,R=R.nextSibling;for(var T,U=0;U<I.length;U++)T=Q[I[U]],removeNode(c,T);for(var V,W=P.length-1,X=v;X>=s;X--)P[W]===X?(h=Q[D[P[W]]],W--):(V=-1===D[X]?f(e[X],X,e):Q[D[X]],c.insertBefore(V,h),h=V)}function each(a,b){var c=!1,d=uuid(),e=document.createDocumentFragment(),f=document.createTextNode(""),g=document.createTextNode("");return e.appendChild(f),e.appendChild(g),a.subscribe(function(a,e){null==a&&(a=[]),null==e&&(e=[]);var h=f.parentNode;c?queueRender(d,a,function(a){return reconcile(h,e,a,b,f,g)}):reconcile(h,e,a,b,f,g)}),c=!0,e}function component(a){return function(b){return a(Object.keys(b).reduce(function(a,c){var d=b[c];return a[c]=isStore(d)?d:store(d),a},{}))}}export{bind,component,derived,dispose,each,hook,html,ref,store,tick};

/*! @ryanmorr/reflex v3.0.0 | https://github.com/ryanmorr/reflex */
/*! @ryanmorr/isotope v3.1.0 | https://github.com/ryanmorr/isotope */
class e{constructor(e){this._value=e,this._subscribers=[]}value(){return this._value}set(e){const t=this.value();if(e!==t)return this._value=e,this._subscribers.slice().forEach((n=>n(e,t))),e}subscribe(e){const t=this._subscribers;if(!t.includes(e))return t.push(e),e(this.value()),()=>{const n=t.indexOf(e);-1!==n&&t.splice(n,1)}}then(e){e(this.value())}toString(){return String(this.value())}valueOf(){return this.value()}toJSON(){return this.value()}}let t=class extends e{update(e){return this.set(e(this.value()))}},n=class extends e{constructor(e,t){super();let n=!1;const r=[],o=()=>super.set(t(...r));e.forEach(((e,t)=>e.subscribe((e=>{r[t]=e,n&&o()})))),n=!0,o()}},r=class extends e{constructor(e,t){super();let n=0,r=!1;const o=[],i=e=>t(...o.concat([e]));e.forEach(((e,t)=>e.subscribe((e=>{if(o[t]=e,r){n++;const e=n;i((t=>{n===e&&super.set(t)}))}})))),r=!0,i((e=>super.set(e)))}};function o(e){return new t(e)}function i(...e){const t=e.pop();return t.length>e.length?new r(e,t):new n(e,t)}n.prototype.set=void 0,r.prototype.set=void 0,class extends e{constructor(e,t){super(e),this._reducer=t}dispatch(e){return super.set(this._reducer(this.value(),e))}}.prototype.set=void 0;var s=function(e,t,n,r){var o;t[0]=0;for(var i=1;i<t.length;i++){var l=t[i++],u=t[i]?(t[0]|=l?1:2,n[t[i++]]):t[++i];3===l?r[0]=u:4===l?r[1]=Object.assign(r[1]||{},u):5===l?(r[1]=r[1]||{})[t[++i]]=u:6===l?r[1][t[++i]]+=u+"":l?(o=e.apply(u,s(e,u,n,["",null])),r.push(o),u[0]?t[0]|=2:(t[i-2]=0,t[i]=o)):r.push(u)}return r},l=new Map;const u=new Map;function c(e,t){if(Array.isArray(e))return e.forEach((e=>c(e,t)));if(11===e.nodeType)return Array.from(e.childNodes).forEach((e=>c(e,t)));let n=u.get(e);n?n.push(t):n=[t],u.set(e,n)}function f(e){const t=u.get(e);t&&(t.forEach((t=>t(e))),u.delete(e)),e.hasChildNodes()&&Array.from(e.childNodes).forEach(f)}let a;const h=new Map,p=window.document.documentElement;function d(e){e.forEach((e=>e.addedNodes.forEach((e=>{if(1===e.nodeType)for(const[t,{root:n,callbacks:r}]of h)if(e===t||e.contains(t)){const e=r.map((e=>e(n))).filter((e=>"function"==typeof e));e.length>0&&g(t,n,e),h.delete(t),0===h.size&&(a.disconnect(),a=null)}}))))}function g(e,t,n){let r=!1;n.forEach((n=>{Array.isArray(t)?t.forEach((e=>{c(e,(()=>{r||(n(t),r=!0)}))})):c(e,n)}))}function y(e,t,n){if(t.children=n,e.length<=1)return e(t);const r=[],o=e(t,(e=>r.push(e)));return r.forEach((e=>function(e,t){null==a&&(a=new MutationObserver(d),a.observe(p,{childList:!0,subtree:!0}));let n,r=e;11===e.nodeType&&(r=Array.from(e.childNodes),e=e.children[0]);const o=h.get(e);o?(n=o.callbacks,n.push(t)):n=[t],h.set(e,{root:r,callbacks:n})}(o,e))),o}
/*! @ryanmorr/schedule-render v3.0.2 | https://github.com/ryanmorr/schedule-render */let m,v;const b=[],x=5;function w(){return performance.now()}function C(){return b.length>0}function A(){v=w();do{C()&&b.shift()()}while(w()-v<x);m=null,C()&&(m=requestAnimationFrame(A))}let S;const E=new Map,N=new Map,k=Promise.resolve();function M(e,t){N.set(e,(()=>N.delete(e)&&t()))}function T(e,t){E.has(e)||(S=function(e){return new Promise((t=>{m||(m=requestAnimationFrame(A)),b.push((()=>t(e())))}))}((()=>{E.get(e)(),E.delete(e),0===E.size&&(S=null,N.size>0&&N.forEach((e=>k.then(e))))}))),E.set(e,t)}function B(){return S||k}function L(){return Math.random().toString(36).substring(2,11)}function O(e){return e&&"function"==typeof e.subscribe}function F(e){return Promise.resolve(e)===e}const _=function(e){var t=l.get(this);return t||(t=new Map,l.set(this,t)),(t=s(this,t.get(e)||(t.set(e,t=function(e){for(var t,n,r=1,o="",i="",s=[0],l=function(e){1===r&&(e||(o=o.replace(/^\s*\n\s*|\s*\n\s*$/g,"")))?s.push(0,e,o):3===r&&(e||o)?(s.push(3,e,o),r=2):2===r&&"..."===o&&e?s.push(4,e,0):2===r&&o&&!e?s.push(5,0,!0,o):r>=5&&((o||!e&&5===r)&&(s.push(r,0,o,n),r=6),e&&(s.push(r,e,0,n),r=6)),o=""},u=0;u<e.length;u++){u&&(1===r&&l(),l(u));for(var c=0;c<e[u].length;c++)t=e[u][c],1===r?"<"===t?(l(),s=[s],r=3):o+=t:4===r?"--"===o&&">"===t?(r=1,o=""):o=t+o[0]:i?t===i?i="":o+=t:'"'===t||"'"===t?i=t:">"===t?(l(),r=1):r&&("="===t?(r=5,n=o,o=""):"/"===t&&(r<5||">"===e[u][c+1])?(l(),3===r&&(s=s[0]),r=s,(s=s[0]).push(2,0,r),r=0):" "===t||"\t"===t||"\n"===t||"\r"===t?(l(),r=2):o+=t),3===r&&"!--"===o&&(r=4,s=s[0])}return l(),s}(e)),t),arguments,[])).length>1?t:t[0]}.bind((function(e,t,...n){if(this[0]=3,t=t||{},"function"==typeof e)return y(e,t,n);const r=G.includes(e),o=r?document.createElementNS("http://www.w3.org/2000/svg",e):document.createElement(e);n&&o.appendChild(q(n,o));return Object.keys(t).forEach((e=>{const n=t[e];n&&n.isBinding?n(o,e):"ref"===e?W(n,o):J(o,e,n,r)})),o})),D=/acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i,G=["svg","altGlyph","altGlyphDef","altGlyphItem","animate","animateColor","animateMotion","animateTransform","circle","clipPath","color-profile","cursor","defs","desc","ellipse","feBlend","feColorMatrix","feComponentTransfer","feComposite","feConvolveMatrix","feDiffuseLighting","feDisplacementMap","feDistantLight","feFlood","feFuncA","feFuncB","feFuncG","feFuncR","feGaussianBlur","feImage","feMerge","feMergeNode","feMorphology","feOffset","fePointLight","feSpecularLighting","feSpotLight","feTile","feTurbulence","filter","font","font-face","font-face-format","font-face-name","font-face-src","font-face-uri","foreignObject","g","glyph","glyphRef","hkern","image","line","linearGradient","marker","mask","metadata","missing-glyph","mpath","path","pattern","polygon","polyline","radialGradient","rect","set","stop","switch","symbol","text","textPath","title","tref","tspan","use","view","vkern"];function P(e){return null!=e&&"boolean"!=typeof e}function I(e){let t="";if("string"==typeof e)return e;if(Array.isArray(e)&&e.length>0)for(let n,r=0,o=e.length;r<o;r++)""!==(n=I(e[r]))&&(t+=(t&&" ")+n);else for(const n in e)e[n]&&(t+=(t&&" ")+n);return t}function j(e){return 11===e.nodeType?Array.from(e.childNodes):e}function z(e,t){Array.isArray(t)?t.forEach((t=>e.removeChild(t))):e.removeChild(t)}function W(e,t){"function"==typeof e?W(e(t),t):O(e)&&(e.update((e=>{if(e){const n=e.slice();return n.push(t),n}return[t]})),c(t,(()=>e.update((e=>{const n=e.slice(),r=e.indexOf(t);return n.splice(r,1),n})))))}function q(e,t){return e.reduce(((e,n)=>{const r=$(n,t);return P(r)&&e.appendChild(r),e}),document.createDocumentFragment())}function R(e,t){return"function"==typeof e?R(e(t),t):P(e)?("number"==typeof e&&(e=String(e)),"string"==typeof e?document.createTextNode(e):Array.isArray(e)?q(e,t):e):null}function $(e,t){return"function"==typeof e?$(e(t),t):O(e)?function(e,t){const n=L(),r=document.createTextNode("");let o,i,s=!0;const l=t=>{if("function"==typeof t)l(t(e));else if(F(t))t.then(l);else{if(null==i&&!P(t))return;T(n,(()=>{i=Q(e,r,i,t),o=t}))}},u=t=>{"function"==typeof t?u(t(e)):s?(o=t,s=!1,F(t)&&t.then(l)):l(t)},f=t.subscribe(u);if(c(r,f),P(o)&&!F(o)){const e=R(o);i=j(e);const t=document.createDocumentFragment();return t.appendChild(e),t.appendChild(r),t}return r}(t,e):F(e)?function(e,t){const n=document.createTextNode("");return t.then((t=>{P(t)&&T(L(),(()=>Q(e,n,null,t)))})),n}(t,e):R(e,t)}function J(e,t,n,r){O(n)?function(e,t,n,r){const o=L();let i,s=!0;const l=t=>{i="value"===n||"selected"===n||"checked"===n?e[n]:i,F(t)?t.then(l):null==i&&null==t||T(o,(()=>{K(e,n,i,t,r),i=t}))},u=t.subscribe((t=>{s?(i=t,s=!1,F(t)?t.then(l):K(e,n,null,t,r)):l(t)}));c(e,u)}(e,n,t,r):F(n)?function(e,t,n,r){t.then((t=>T(L(),(()=>K(e,n,null,t,r)))))}(e,n,t,r):K(e,t,null,n,r)}function H(e,t,n){t.startsWith("--")?e.style.setProperty(t,null==n?"":n):null==n?e.style[t]="":"number"!=typeof n||D.test(t)?e.style[t]=n:e.style[t]=n+"px"}function K(e,t,n,r,o=!1){const i=typeof r;if(t.startsWith("on")&&("function"==typeof n||"function"===i))return t=t.toLowerCase()in e?t.toLowerCase().slice(2):t.slice(2),r&&e.addEventListener(t,r),void(n&&e.removeEventListener(t,n));if("function"===i)return J(e,t,r(e,t),o);if("style"===t)if("string"==typeof r)e.style.cssText=r;else{"string"==typeof n&&(e.style.cssText=n="");for(const t in Object.assign({},r,n))H(e,t,null==r?"":r[t])}else{if(o||"class"!==t||(t="className"),"class"!==t&&"className"!==t||(r=I(r)),!o&&"width"!==t&&"height"!==t&&"href"!==t&&"list"!==t&&"form"!==t&&"tabIndex"!==t&&"download"!==t&&t in e)try{return void(e[t]=null==r?"":r)}catch(e){}null==r||!1===r&&-1==t.indexOf("-")?e.removeAttribute(t):e.setAttribute(t,r)}}function Q(e,t,n,r){if("number"==typeof r&&(r=String(r)),n&&3===n.nodeType&&"string"==typeof r)return n.data=r,n;if(!P(r))return Array.isArray(n)?z(e,n):e.removeChild(n),null;const o=R(r,e),i=j(o);return null==n?(e.insertBefore(o,t),i):(Array.isArray(n)?1===n.length?e.replaceChild(o,n[0]):(z(e,n),e.insertBefore(o,t)):n.replaceWith(o),i)}function U(...e){const t=_(...e);return Array.isArray(t)?q(t):$(t)}function V(...e){const t=L(),n=e.pop();if(e.length>0){let r=!1;const o=[],i=e.map(((e,i)=>e.subscribe((e=>{F(e)?e.then((e=>{o[i]=e,r&&M(t,(()=>n(...o)))})):(o[i]=e,r&&M(t,(()=>n(...o))))}))));return r=!0,()=>i.forEach((e=>e()))}return function(e,t){return N.set(e,t),()=>N.delete(e)}(t,n)}function X(e,t){let n=e.value();return null==n&&(n=t,e.set(n)),n}function Y(e,t){for(let n=0;n<e.options.length;n++){const r=e.options[n];if(r.value===t)return void(r.selected=!0)}}function Z(e,t){for(let n=0;n<e.options.length;n++){const r=e.options[n];r.selected=~t.indexOf(r.value)}}function ee(e,t,n){e.addEventListener(t,n),c(e,(()=>e.removeEventListener(t,n)))}function te(e,t,n=""){let r=X(t,n);const o=L(),i=t.subscribe((t=>{t!==r&&T(o,(()=>{e.value=r=t}))}));e.value=r,c(e,i),ee(e,"input",(()=>{r=e.value,0===n&&(r=Number(r)),t.set(r)}))}function ne(e){const t=(t,n)=>{if(n.startsWith("on"))return ee(t,n.slice(2).toLowerCase(),(t=>e.set(t)));const r=t.nodeName.toLowerCase();if("textarea"===r&&"value"===n)return te(t,e);if("select"===r&&"value"===n)return"select-multiple"===t.type?function(e,t){let n=!1;const r=L(),o=t.subscribe((t=>{n&&T(r,(()=>Z(e,t)))}));n=!0,Z(e,X(t,[])),c(e,o),ee(e,"input",(()=>{t.set(Array.from(e.selectedOptions).map((e=>e.value)))}))}(t,e):function(e,t){const n=e.options[e.selectedIndex];let r=X(t,n?n.value:"");const o=L(),i=t.subscribe((t=>{t!==r&&T(o,(()=>{Y(e,t),r=t}))}));Y(e,r),c(e,i),ee(e,"input",(()=>{const n=e.options[e.selectedIndex];n&&(r=n.value,t.set(r))}))}(t,e);if("input"===r){if(("checkbox"===t.type||"radio"===t.type)&&"checked"===n)return function(e,t){let n=X(t,!1);const r=L(),o=t.subscribe((t=>{t!==n&&T(r,(()=>{e.checked=n=t}))}));e.checked=n,c(e,o),ee(e,"change",(()=>{n=e.checked,t.set(n)}))}(t,e);if("value"===n)return"number"===t.type||"range"===t.type?te(t,e,0):te(t,e)}};return t.isBinding=!0,t}function re(e,t){let n=-1,r=e.length;if(r>0&&e[r-1]<=t)return r-1;for(;r-n>1;){let o=Math.floor((n+r)/2);e[o]>t?r=o:n=o}return n}function oe(e,t,n,r,o,i,s){if(0===n.length){if(void 0!==i||void 0!==s){let t,n=void 0!==i?i.nextSibling:e.firstChild;for(void 0===s&&(s=null);n!==s;)t=n.nextSibling,ie(e,n),n=t}else e.textContent="";return}if(0===t.length){let t,i=void 0!==s?1:0;for(let l=0,u=n.length;l<u;l++)t=o(n[l],l,r),i?e.insertBefore(t,s):e.appendChild(t);return}let l,u,c=0,f=0,a=!0,h=t.length-1,p=n.length-1,d=i?i.nextSibling:e.firstChild,g=d,y=s?s.previousSibling:e.lastChild;e:for(;a;){let r;for(a=!1,l=t[c],u=n[f];l===u;){if(c++,f++,g=d=d.nextSibling,h<c||p<f)break e;l=t[c],u=n[f]}for(l=t[h],u=n[p];l===u;){if(h--,p--,s=y,y=y.previousSibling,h<c||p<f)break e;l=t[h],u=n[p]}for(l=t[h],u=n[f];l===u;){if(a=!0,r=y.previousSibling,e.insertBefore(y,g),y=r,f++,h--,h<c||p<f)break e;l=t[h],u=n[f]}for(l=t[c],u=n[p];l===u;){if(a=!0,r=d.nextSibling,e.insertBefore(d,s),c++,s=d,d=r,p--,h<c||p<f)break e;l=t[c],u=n[p]}}if(p<f){if(c<=h){let t;for(;c<=h;)0===h?ie(e,y):(t=y.previousSibling,ie(e,y),y=t),h--}return}if(h<c){if(f<=p){let t,i=s?1:0;for(;f<=p;)t=o(n[f],f,r),i?e.insertBefore(t,s):e.appendChild(t),f++}return}const m=new Array(p+1-f);for(let e=f;e<=p;e++)m[e]=-1;const v=new Map;for(let e=f;e<=p;e++)v.set(n[e],e);let b=f+n.length-1-p,x=[];for(let e=c;e<=h;e++)v.has(t[e])?(m[v.get(t[e])]=e,b++):x.push(e);if(0===b){if(void 0!==i||void 0!==s){let t,n=void 0!==i?i.nextSibling:e.firstChild;for(void 0===s&&(s=null);n!==s;)t=n.nextSibling,ie(e,n),n=t,c++}else e.textContent="";let t,l=s?1:0;for(let i=f;i<=p;i++)t=o(n[i],i,r),l?e.insertBefore(t,s):e.appendChild(t);return}const w=function(e,t){let n=[],r=[],o=-1,i=new Array(e.length);for(let s=t,l=e.length;s<l;s++){let t=e[s];if(t<0)continue;let l=re(n,t);-1!==l&&(i[s]=r[l]),l===o?(o++,n[o]=t,r[o]=s):t<n[l+1]&&(n[l+1]=t,r[l+1]=s)}for(let e=r[o];o>=0;e=i[e],o--)n[o]=e;return n}(m,f),C=[];let A=d;for(let e=c;e<=h;e++)C[e]=A,A=A.nextSibling;for(let t=0;t<x.length;t++){ie(e,C[x[t]])}let S,E=w.length-1;for(let t=p;t>=f;t--)w[E]===t?(s=C[m[w[E]]],E--):(S=-1===m[t]?o(n[t],t,r):C[m[t]],e.insertBefore(S,s),s=S)}function ie(e,t){e.removeChild(t),f(t)}function se(e,t,n){let r=t.nextSibling;for(;r!==n;)ie(e,r),r=t.nextSibling}function le(e,t,n){let r=!1,o=!1,i=[];const s=L(),l=document.createDocumentFragment(),u=document.createTextNode(""),f=document.createTextNode("");l.appendChild(u),l.appendChild(f);const a=e.subscribe((e=>{const l=u.parentNode,c=null!=(a=e)&&"string"!=typeof a&&"function"==typeof a[Symbol.iterator]?Array.from(e):[];var a;if(n&&0===c.length){if(o)return;r?T(s,(()=>{se(l,u,f),l.insertBefore(n(e),f),o=!0,i=[]})):(l.insertBefore(n(e),f),o=!0,i=[])}else r?T(s,(()=>{o&&se(l,u,f),oe(l,i,c,e,t,u,f),o=!1,i=c})):(oe(l,i,c,e,t,u,f),o=!1,i=c)}));return c(u,a),r=!0,l}export{ne as bind,c as cleanup,i as derived,f as dispose,le as each,V as effect,U as html,o as store,B as tick};

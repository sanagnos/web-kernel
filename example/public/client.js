"use strict";window.client=function(){function t(t,n,e){Array.isArray(t)||(t=[t]);var o=0,s=t.length,r=[],a=function(){n(t[o++],function(t){r[r.length]=t,o>=s?e(r):a()})};a()}function n(n,e){n instanceof Array||(n=[].concat(n)),t(n,function(n,e){t(n[0],n[1],e)},e)}function e(t,n,e){if(-1===t.lastIndexOf(".js")&&(t+=".js"),Array.isArray(n)){for(var o=n.length;o--;)-1===n[o].lastIndexOf(".js")&&(n[o]+=".js");b[t]=e,I[t]=n}else b[t]=n;x[t]=0,window.modules=b}function o(n,e){-1===n.lastIndexOf(".js")&&(n+=".js"),0===x[n]?(x[n]=1,"function"==typeof b[n]?I[n]?t(I[n],o,function(t){delete I[n],b[n]=b[n].apply({},t),e(b[n])}):(b[n]=b[n].call({}),e(b[n])):e(b[n])):1===x[n]?e(b[n]):c(n,function(){o(n,e)})}function s(e,s){if("string"==typeof e)-1===e.lastIndexOf(".js")&&(e+=".js"),o(e,s);else if(Array.isArray(e)){for(var u=e.length;u--;)-1===e[u].lastIndexOf(".js")&&(e[u]+=".js");t(e,o,function(t){s.apply(null,t)})}else{var i=e,f=[];i.css&&(f[f.length]=[i.css,r]),i.html&&(f[f.length]=[i.html,a]),i.js&&(f[f.length]=[i.js,c]),n(f,function(){s&&i.js&&o(i.js,s)})}}function r(t,n,e){e=arguments[arguments.length-1],"function"!=typeof e&&(e=null),n&&"function"!=typeof n||(n=document.body),-1===t.lastIndexOf(".css")&&(t+=".css");var o=document.createElement("link");o.href=t,o.rel="stylesheet",o.type="text/css",o.onload=function(){e&&e()},n.appendChild(o)}function a(t,n,e){e=arguments[arguments.length-1],"function"!=typeof e&&(e=null),n&&"function"!=typeof n||(n=document.body),-1===t.lastIndexOf(".html")&&(t+=".html");var o=new XMLHttpRequest;o.open("GET",t,!0),o.onload=function(){if(4!==o.readyState||200!==o.status)throw new Error("http failed with status: "+o.status+", reason: "+o.statusText);n.insertAdjacentHTML("beforeend",o.responseText),e&&e()},o.send()}function c(t,n,e){e=arguments[arguments.length-1],"function"!=typeof e&&(e=null),n&&"function"!=typeof n||(n=document.body),-1===t.lastIndexOf(".js")&&(t+=".js");var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.onload=function(){e&&e()},o.onerror=function(t){throw new URIError("the script "+t.target.src+" is not accessible.")},n.appendChild(o),o.src=t}function u(t,n,e){arguments.length<3?(e=n,n=""):("string"!=typeof n&&(n=m(n)),n=encodeURIComponent(n));var o=new XMLHttpRequest;o.open("GET",t,!0),o.onload=function(){if(4===o.readyState&&200===o.status)e(o.responseText);else if(1===Math.floor(o.status/4))throw new Error("Request failed with "+o.status)},o.onerror=function(){throw new Error("Request failed with "+o.status)},o.send()}function i(t,n,e){var o=new XMLHttpRequest;o.open("POST",t,!0),o.onreadystatechange=function(){if(4===o.readyState&&200===o.status)return e(o.responseText);if(1===Math.floor(o.status/4))throw new Error("Request failed with "+o.status)},o.setRequestHeader("Content-Type","application/json"),"string"!=typeof n&&(n=m(n)),o.send(n)}function f(){R&&y.close();var t=w.call(arguments),n="function"==typeof t[t.length-1]?t.pop():null;h={},y=new WebSocket(j),y.onopen=function(){R=!0,p("root","auth",t,function(t){d(t),n&&n()})},y.onclose=function(){R=!1},y.onmessage=function(t){if(t.data.length){var n=v(t.data),e=n[0],o=n[1],s=n[2];h[o]&&h[o].apply({done:1===s},e),s&&delete h[o]}}}function l(){R&&y.close()}function p(t,n,e,o){R||connect();var s=performance.now(),r=m([t,n,e,s]);h[s]=o,y.send(r)}function d(t){var n,e;for(n in t)for(e in t[n])t[n][e]=function(t,n){return function(){var e=w.call(arguments),o="function"==typeof e[e.length-1]?e.pop():null;p(t,n,e,o)}}(n,e);return O(window,"proxy",{value:t,configurable:!0}),t}var y,h,g=document.URL.replace("http://",""),g=g.slice(0,g.indexOf("/")),j="ws://"+g,w=Array.prototype.slice,m=JSON.stringify,v=JSON.parse,O=Object.defineProperty,b={},x={},I={},R=!1;return s.appendCSS=r,s.appendHTML=a,s.appendJS=c,{get url(){return j},set url(t){j=t},open:f,close:l,declare:e,invoke:s,get get(){return u},get post(){return i}}}();
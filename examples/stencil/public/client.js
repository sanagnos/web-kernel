"use strict";window.client=function(){function t(t,n,e){t instanceof Array||(t=[t]);var o=0,c=t.length,r=[];if(!c)return e([]);var a=function(){n(t[o++],function(t){r[r.length]=t,o>=c?e(r):a()})};a()}function n(n,e){n instanceof Array||(n=[].concat(n)),t(n,function(n,e){t(n[0],n[1],e)},e)}function e(t,n,e){if(t.match(/.js$/)||(t+=".js"),t.match(/^.\//)||(t=t.match(/^\//)?"."+t:"./"+t),n instanceof Array){for(var o=n.length;o--;)n[o].match(/.js$/)||(n[o]+=".js"),n[o].match(/^.\//)||(n[o]=n[o].match(/^\//)?"."+n[o]:"./"+n[o]);v[t]=e,S[t]=n}else v[t]=n;R[t]=0}function o(n,e){n.match(/.js$/)||(n+=".js"),0===R[n]?(R[n]=1,"function"==typeof v[n]?S[n]?t(S[n],o,function(t){delete S[n],v[n]=v[n].apply({},t),e(v[n])}):(v[n]=v[n].call({}),e(v[n])):e(v[n])):1===R[n]?e(v[n]):s(n,function(){o(n,e)})}function c(e,c){if("string"==typeof e)return e.match(/^.\//)||(e=e.match(/^\//)?"."+e:"./"+e),o(e,c);for(var s,u=e.length,i=[],f=[],l=[];u--;)switch(s=e[u].match(/.*\.(.*)/),s&&"/"!==s[s.length-1][0]?s=s[s.length-1]:(s="js",e[u]+=".js"),e[u].match(/^.\//)||(e[u]=e[u].match(/^\//)?"."+e[u]:"./"+e[u]),s){case"js":i[i.length]=e[u];break;case"css":f[f.length]=e[u];break;case"html":l[l.length]=e[u]}n([[f,r],[l,a]],function(){t(i,o,function(t){c.apply(null,t)})})}function r(t,n,e){e=arguments[arguments.length-1],t.match(/.css$/)||(t+=".css"),"function"!=typeof e&&(e=null),n&&"function"!=typeof n||(n=document.body);var o=document.createElement("link");o.href=t,o.rel="stylesheet",o.type="text/css",o.onload=function(){e&&e()},n.appendChild(o)}function a(t,n,e){e=arguments[arguments.length-1],t.match(/.html$/)||(t+=".html"),"function"!=typeof e&&(e=null),n&&"function"!=typeof n||(n=document.body);var o=new XMLHttpRequest;o.open("GET",t,!0),o.onload=function(){if(4!==o.readyState||200!==o.status)throw new Error("http failed with status: "+o.status+", reason: "+o.statusText);n.insertAdjacentHTML("beforeend",o.responseText),e&&e()},o.send()}function s(t,n,e){e=arguments[arguments.length-1],"function"!=typeof e&&(e=null),n&&"function"!=typeof n||(n=document.body),-1===t.lastIndexOf(".js")&&(t+=".js");var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.onload=function(){e&&e()},o.onerror=function(t){throw new URIError("the script "+t.target.src+" is not accessible.")},n.appendChild(o),o.src=t}function u(t,n,e){arguments.length<3?(e=n,n=""):("string"!=typeof n&&(n=w(n)),n=encodeURIComponent(n));var o=new XMLHttpRequest;o.open("GET",t,!0),o.onload=function(){if(4===o.readyState&&200===o.status)e(o.responseText);else if(1===Math.floor(o.status/4))throw new Error("Request failed with "+o.status)},o.onerror=function(){throw new Error("Request failed with "+o.status)},o.send()}function i(t,n,e){var o=new XMLHttpRequest;o.open("POST",t,!0),o.onreadystatechange=function(){if(4===o.readyState&&200===o.status)return e(o.responseText);if(1===Math.floor(o.status/4))throw new Error("Request failed with "+o.status)},o.setRequestHeader("Content-Type","application/json"),"string"!=typeof n&&(n=w(n)),o.send(n)}function f(){T&&d.close();var t=y.call(arguments),n="function"==typeof t[t.length-1]?t.pop():null;m={},d=new WebSocket(g),d.onopen=function(){T=!0,p("root","auth",t,function(t){h(t),n&&n()})},d.onclose=function(){T=!1},d.onmessage=function(t){if(t.data.length){var n=j(t.data),e=n[0],o=n[1],c=n[2];m[o]&&m[o].apply({done:1===c},e),c&&delete m[o]}}}function l(){T&&d.close()}function p(t,n,e,o){T||connect();var c=performance.now(),r=w([t,n,e,c]);m[c]=o,d.send(r)}function h(t){var n,e;for(n in t)for(e in t[n])t[n][e]=function(t,n){return function(){var e=y.call(arguments),o="function"==typeof e[e.length-1]?e.pop():null;p(t,n,e,o)}}(n,e);return b(window,"proxy",{value:t,configurable:!0}),t}var d,m,g="ws://"+document.URL.match(/\/\/(.*)/)[1],y=Array.prototype.slice,w=JSON.stringify,j=JSON.parse,b=Object.defineProperty,v={},R={},S={},T=!1;return c.appendCSS=r,c.appendHTML=a,c.appendJS=s,{get url(){return g},set url(t){g=t},open:f,close:l,declare:e,invoke:c,get get(){return u},get post(){return i}}}();
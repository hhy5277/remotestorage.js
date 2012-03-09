define("lib/ajax",{ajax:function(a){var b=!1,c;a.timeout&&(c=window.setTimeout(function(){b=!0,a.error("timeout")},a.timeout));var d=new XMLHttpRequest;a.method||(a.method="GET"),a.data||(a.data=null),d.open(a.method,a.url,!0);if(a.headers)for(var e in a.headers)d.setRequestHeader(e,a.headers[e]);d.onreadystatechange=function(){d.readyState==4&&!b&&(c&&window.clearTimeout(c),d.status==200||d.status==201||d.status==204?a.success(d.responseText):a.error(d.status))},d.send(a.data)}}),define("lib/couch",["./ajax"],function(a){function c(a){if(!b){try{b=JSON.parse(localStorage.getItem("_shadowCouchRev"))}catch(c){}b||(b={})}return b[a]}function d(a,c){if(!b)try{b=JSON.parse(localStorage.getItem("_shadowCouchRev"))}catch(d){b={}}b[a]=c,localStorage.setItem("_shadowCouchRev",JSON.stringify(b))}function e(a){var b=0;while(b<a.length&&a[b]=="u")b++;return b<a.length&&a[b]=="_"&&(a="u"+a),a}function f(b,c,d,e,f){var g={url:c,method:b,error:function(a){a==404?f(null,undefined):f(a,null)},success:function(a){f(null,a)},timeout:3e3};e&&(g.headers={Authorization:"Bearer "+e}),g.fields={withCredentials:"true"},b!="GET"&&(g.data=d),a.ajax(g)}function g(a,b,c,g){f("GET",a+e(c),null,b,function(a,b){if(a)g(a,b);else{var e;try{e=JSON.parse(b)}catch(f){}e&&e._rev?(d(c,e._rev),g(null,e.value)):typeof b=="undefined"?g(null,undefined):g("unparsable data from couch")}})}function h(a,b,g,h,i){var j=c(g),k={value:h};j&&(k._rev=j),f("PUT",a+e(g),JSON.stringify(k),b,function(c,j){if(c)c==409?f("GET",a+e(g),null,b,function(c,j){if(c)i("after 409, got a "+c);else{var l;try{l=JSON.parse(j)._rev}catch(m){}l?(k={value:h,_rev:l},d(g,l),f("PUT",a+e(g),JSON.stringify(k),b,function(a,b){a?i("after 409, second attempt got "+a):i(null)})):i("after 409, got unparseable JSON")}}):i(c);else{var k;try{k=JSON.parse(j)}catch(l){}k&&k.rev&&d(g,k.rev),i(null)}})}function i(a,b,g,h){var i=c(g);f("DELETE",a+e(g)+(i?"?rev="+i:""),null,b,function(c,i){c==409?f("GET",a+e(g),null,b,function(c,i){if(c)h("after 409, got a "+c);else{var j;try{j=JSON.parse(i)._rev}catch(k){}j?(d(g,j),f("DELETE",a+e(g)+"?rev="+j,null,b,function(a,b){a?h("after 409, second attempt got "+a):(d(g,undefined),h(null))})):h("after 409, got unparseable JSON")}}):(c||d(g,undefined),h(c))})}var b=null;return{get:g,put:h,"delete":i}}),define("lib/dav",["./ajax"],function(a){function b(a){var b=0;while(b<a.length&&a[b]=="u")b++;return b<a.length&&a[b]=="_"&&(a="u"+a),a}function c(b,c,d,e,f,g){var h={url:c,method:b,error:function(a){a==404?f(null,undefined):f(a,null)},success:function(a){f(null,a)},timeout:3e3};h.headers={Authorization:"Bearer "+e,"Content-Type":"text/plain;charset=UTF-8"},h.fields={withCredentials:"true"},b!="GET"&&(h.data=d),a.ajax(h)}function d(a,d,e,f){c("GET",a+b(e),null,d,f)}function e(a,d,e,f,g){c("PUT",a+b(e),f,d,g)}function f(a,d,e,f){c("DELETE",a+b(e),null,d,f)}return{get:d,put:e,"delete":f}}),define("lib/webfinger",["./ajax"],function(a){function g(f,g,i,j){b=g,c=f;var k=f.split("@");k.length<2?i("That is not a user address. There is no @-sign in it"):k.length>2?i("That is not a user address. There is more than one @-sign in it"):/^[\.0-9A-Za-z]+$/.test(k[0])?/^[\.0-9A-Za-z\-]+$/.test(k[1])?(d=k[0],e=k[1],a.ajax({url:"https://"+e+"/.well-known/host-meta",success:function(a){l(a,i,j)},error:function(a){h(i,j)},timeout:3e3})):i('That is not a user address. There are non-dotalphanumeric symbols after the @-sign: "'+k[1]+'"'):i('That is not a user address. There are non-dotalphanumeric symbols before the @-sign: "'+k[0]+'"')}function h(c,d){b.allowHttpWebfinger?a.ajax({url:"http://"+e+"/.well-known/host-meta",success:function(a){l(a,c,d)},error:function(a){i(c,d)},timeout:3e3}):i(c,d)}function i(d,e){b.allowFakefinger?a.ajax({url:"http://proxy.unhosted.org/lookup?q="+encodeURIComponent("acct:"+c),success:function(a){e(JSON.parse(a))},error:function(a){j(d,e)},timeout:3e3}):j(d,e)}function j(a,b){a(5,'user address "'+c+"\" doesn't seem to have remoteStorage linked to it")}function k(b,d,e){var f=b.split("{uri}");f.length==2?a.ajax({url:f[0]+"acct:"+c+f[1],success:function(a){n(a,d,e)},error:function(a){m(d,e)},timeout:3e3}):errorStr='the template doesn\'t contain "{uri}"'}function l(a,b,c){var d=(new DOMParser).parseFromString(a,"text/xml");if(!d.getElementsByTagName){b("Host-meta is not an XML document, or doesnt have xml mimetype.");return}var e=d.getElementsByTagName("Link");if(e.length==0)try{k(JSON.parse(a).links.lrdd[0].template,b,c)}catch(f){b("JSON parsing failed - "+a)}else{var g=!1,h="none of the Link tags have a lrdd rel-attribute";for(var i=0;i<e.length;i++){for(var j=0;j<e[i].attributes.length;j++){var l=e[i].attributes[j];if(l.name=="rel"&&l.value=="lrdd"){g=!0,h="the first Link tag with a lrdd rel-attribute has no template-attribute";for(var m=0;m<e[i].attributes.length;m++){var n=e[i].attributes[m];if(n.name=="template"){k(n.value,b,c);break}}break}}if(g)break}g||b(h)}}function m(a,b){a('the template doesn\'t contain "{uri}"')}function n(a,b,c){var d=(new DOMParser).parseFromString(a,"text/xml");if(!d.getElementsByTagName){b("Lrdd is not an XML document, or doesnt have xml mimetype.");return}var e=d.getElementsByTagName("Link");if(e.length==0)try{c(JSON.parse(a).links.remoteStorage[0])}catch(f){b("no Link tags found in lrdd")}else{var g=!1,h="none of the Link tags have a remoteStorage rel-attribute";for(var i=0;i<e.length;i++){var j={};for(var k=0;k<e[i].attributes.length;k++){var l=e[i].attributes[k];if(l.name=="rel"&&l.value=="remoteStorage"){g=!0,h="the first Link tag with a dav rel-attribute has no template-attribute";for(var m=0;m<e[i].attributes.length;m++){var n=e[i].attributes[m];n.name=="template"&&(j.template=n.value),n.name=="auth"&&(j.auth=n.value),n.name=="api"&&(j.api=n.value)}break}}if(g){c(j);break}}g||b(h)}}function o(a,b){var c=a.split("{category}");return c.length!=2?"cannot-resolve-template:"+a:c[0]+b+c[1]}var b,c,d,e,f;return{getAttributes:g,resolveTemplate:o}}),define("remoteStorage",["require","./lib/ajax","./lib/couch","./lib/dav","./lib/webfinger"],function(a,b,c,d,e){var f=function(a,b){console.log(b)},g=function(a,b){e.getAttributes(a,{allowHttpWebfinger:!0,allowSingleOriginWebfinger:!1,allowFakefinger:!0},function(a,c){b(a,null)},function(a){b(0,a);var c={}})},h=function(a,b,c){var d=["redirect_uri="+encodeURIComponent(c),"scope="+encodeURIComponent(b.join(",")),"response_type=token","client_id="+encodeURIComponent(c)];return a.auth+(a.auth.indexOf("?")===-1?"?":"&")+d.join("&")},i=function(a,b){b(a==="CouchDB"?c:d)},j=function(a,b,c){var d=e.resolveTemplate(a.template,b);return{get:function(b,e){i(a.api,function(a){a.get(d,c,b,e)})},put:function(b,e,f){i(a.api,function(a){a.put(d,c,b,e,f)})},"delete":function(b,e){i(a.api,function(a){a["delete"](d,c,b,e)})}}},k=function(){var a,b;if(location.hash.length>0){a=location.hash.split("&");for(var c=0;c<a.length;c++){a[c][0]=="#"&&(a[c]=a[c].substring(1));if(a[c].substring(0,"access_token=".length)=="access_token=")return a[c].substring("access_token=".length)}}return null};return{getStorageInfo:g,createOAuthAddress:h,createClient:j,receiveToken:k}})
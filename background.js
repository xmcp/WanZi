chrome.runtime.onInstalled.addListener(
  function(details) {
    if(details.reason==="install") {
      localStorage["black"]=[""];
      window.open(chrome.extension.getURL('options.html'));
    }
  }
);

function push(details) {
  var tabid=details.tabId;
  if(tabid===-1) return;
  chrome.pageAction.show(tabid);
}

function upload_callback(details) {
  push(details);
  //console.debug(details);////////////////////////////////////////////
  for(var now=0;now<details.requestHeaders.length;now++) {
    if(details.requestHeaders[now].name==="Referer") {
      details.requestHeaders[now].value="http://qzone.qq.com";
      return {requestHeaders: details.requestHeaders};
    }
  }
  details.requestHeaders.push({name:"Referer",value:"http://qzone.qq.com"});
  return {requestHeaders: details.requestHeaders};
}

function download_callback(details) {
  function make_filter(url) {return "*://"+url+"/*";}
  //console.debug(details);///////////////////////////////////////////
  var head=details.responseHeaders;
  for(var now=0;now<head.length;now++) {
    if(head.length===2 && head[0].name==="Content-type" && head[0].value==="text/html" &&
       head[1].name==="Connection" && head[1].value==="close") {
      var a=document.createElement("a");
      a.href=details.url;
      var url=make_filter(a.hostname);
      for(var noww=0;noww<blacked.length;noww++)
        if(blacked[noww]===url)
          return;
      if(!confirm("是否将将丸子用于 "+ a.hostname+" ?"))
        return;
      if(localStorage["black"]==="")
        localStorage["black"]=url;
      else
        localStorage["black"]+=","+url;
      rebind();
      chrome.tabs.reload(details.tabId,{bypassCache:true});
    }
  }
}

function bindup() {
  blacked=localStorage["black"].split(",");
  //console.debug(blacked);//////////////////////////////////////////
  if(blacked.length==1 && blacked[0]==="")
    blacked=[];
  if(blacked.length===0) return;
  chrome.webRequest.onBeforeSendHeaders.addListener(
    upload_callback,{urls: blacked},["blocking","requestHeaders"]
  );
}
function rebind() {
  chrome.webRequest.onBeforeSendHeaders.removeListener(
    upload_callback,{urls:blacked},["blocking","requestHeaders"]
  );
  bindup();
}

chrome.webRequest.onCompleted.addListener(
  download_callback,{types: ["main_frame","sub_frame","script"],urls: ["*://*/*"]},["responseHeaders"]
);
bindup();
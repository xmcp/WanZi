chrome.runtime.onInstalled.addListener(
  function(details) {
    if(details.reason==="install") {
      localStorage["collect"]=true;
      localStorage["black"]="*://*.4399.com/*,*://*.qq.com/*";
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
  //console.debug(details);
  var head=details.responseHeaders;
  for(var now=0;now<head.length;now++) {
    if(head[now].name==="Server" && head[now].value==="BWS/1.1") {
      var a=document.createElement("a");
      a.href=details.url;
      var url=make_filter(a.hostname);
      for(var noww=0;noww<blacked.length;noww++)
        if(blacked[noww]===url)
          return;
      if(localStorage["black"]==="")
        localStorage["black"]=url;
      else
        localStorage["black"]+=","+url;
      rebind();
    }
  }
}

function bindreq() {
  blacked=localStorage["black"].split(",");
  if(blacked.length==1 && blacked[0]==="")
    blacked=[];
  chrome.webRequest.onBeforeSendHeaders.addListener(
    upload_callback,{urls: blacked},["blocking","requestHeaders"]
  );
  chrome.webRequest.onCompleted.addListener(
    download_callback,{types: ["main_frame","sub_frame"],urls: ["*://*/*"]},["responseHeaders"]
  );
}

function rebind() {
  chrome.webRequest.onBeforeSendHeaders.removeListener(
    upload_callback,{urls:blacked},["blocking","requestHeaders"]
  );
  bindreq();
}

bindreq();
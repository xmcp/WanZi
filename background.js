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
  setTimeout(function(){chrome.pageAction.show(tabid);},100);
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
  var head=details.responseHeaders;
  if(head.length===2 && head[0].name==="Content-type" && head[0].value==="text/html" &&
     head[1].name==="Connection" && head[1].value==="close") {
    var a=document.createElement("a");
    a.href=details.url;
    var url=make_filter(a.hostname);
    addhost(url,a.hostname,details.tabId);
  }
}

var notifed=Object();
var url_to_tabid=Object();
var alertid=Object();
chrome.notifications.onButtonClicked.addListener(function(uid,btnid) {
  var url=uid.slice(0,uid.indexOf("////"));
  if(btnid===1) {
    notifed[url]=true;
  }
  else {
    for(var noww=0;noww<blacked.length;noww++)
        if(blacked[noww]===url)
          return;
    if(localStorage["black"]==="")
      localStorage["black"]=url;
    else
      localStorage["black"]+=","+url;
    rebind();
    for(var now=0;now<url_to_tabid[url].length;now++)
      chrome.tabs.reload(url_to_tabid[now],{bypassCache:true});
    url_to_tabid[now]=undefined;
  }
});
function newalert(url) {alertid[url]++;}
function addhost(url,displayurl,tabid) {
  if(notifed[url]) return;
  for(var noww=0;noww<blacked.length;noww++)
      if(blacked[noww]===url)
        return;
  if(url_to_tabid[url]===undefined)
    url_to_tabid[url]=[tabid];
  else
    url_to_tabid[url].push(tabid);
  if(alertid[url]===undefined) alertid[url]=0;
  chrome.notifications.create(
    url+'////'+alertid[url].toString(),{
      type:"basic",iconUrl:"icons/alert_icon.png",isClickable:false,
      title:"丸子",message:"您可能需要在 "+displayurl+" 上应用丸子，是否现在应用？",
      buttons:[{title:"立即应用",iconUrl:"icons/ok_btn.png"},{title:"暂时不再提示",iconUrl:"icons/cancel_btn.png"}]
    },function(){}
  );
  chrome.notifications.onClicked.addListener(function(){newalert(url)});
  chrome.notifications.onClosed.addListener(function(){newalert(url)});
  chrome.notifications.onButtonClicked.addListener(function(){newalert(url)});
}

function bindup() {
  blacked=localStorage["black"].split(",");
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
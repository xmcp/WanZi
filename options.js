clearbtn=document.querySelector("#clearbtn");
li=document.querySelector("#li");
addbtn=document.querySelector("#addbtn");
addtxt=document.querySelector("#addtxt");
adpage=document.querySelector("#adpage");
restorecounter=document.querySelector("#restorecounter");
restorebtn=document.querySelector("#restorebtn");

bgpage=chrome.extension.getBackgroundPage();
bl=localStorage["black"].split(',');
if(bl.length===1 && bl[0]==="") bl=[];

function refresh() {
  localStorage["black"]=bl.join(",");
  bgpage.rebind();
  location.reload(true);
}

function clear() {
  window.bl=[];
  refresh();
}
function add() {
  var val=addtxt.value;
  if(val.indexOf("/")!=-1) {
    alert("域名无效");
    return;
  }
  bl.push("*://"+val+"/*");
  refresh();
}
function trytoadd(details) {
  if(details.charCode===13)
    add();
}
function makedel(id) {
  function del() {
    bl.splice(id,1);
    refresh();
  }
  return del;
}

function restore_notif() {
  bgpage.notifed={};
  location.reload(true);
}

clearbtn.addEventListener('click',clear);
addbtn.addEventListener('click',add);
addtxt.addEventListener('keypress',trytoadd);
restorebtn.addEventListener('click',restore_notif);
document.addEventListener('DOMContentLoaded',function() {
  var notifedtotal=0;
  for(var _ in bgpage.notifed) notifedtotal++;
  restorecounter.innerText=notifedtotal;
  if(notifedtotal===0) restorebtn.setAttribute("disabled","disabled");
  if(bl.length===0) {
    var hint=document.createElement("div");
    hint.className="alert alert-info";
    hint.innerHTML='<span class="glyphicon glyphicon-inbox"></span>&nbsp;&nbsp;当您浏览受限网站时丸子会自动生效';
    li.appendChild(hint);
    clearbtn.setAttribute("disabled","disabled");
  }
  else {
    var ul=document.createElement("ul");
    ul.className="list-group";
    for(var now=0;now<bl.length;now++) {
      var sub=document.createElement("li");
      //btn
      var btn=document.createElement("button");
      btn.className="btn btn-link pull-right up7px";
      btn.innerText="删除";
      btn.addEventListener("click",makedel(now));
      sub.appendChild(btn);
      //txt
      var txt=document.createElement("span");
      txt.innerText=bl[now].slice(4,-2);
      sub.appendChild(txt);
      //end
      sub.className="list-group-item";
      ul.appendChild(sub);
    }
    li.appendChild(ul);
  }
  var xhr = new XMLHttpRequest();
  xhr.open("GET","http://s.xmcp.ml/wanzi/ad.html");
  xhr.onload=function() {
    adpage.innerHTML=xhr.response;
  };
  xhr.send();
});

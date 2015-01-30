clearbtn=document.querySelector("#clearbtn");
li=document.querySelector("#li");
addbtn=document.querySelector("#addbtn");
addtxt=document.querySelector("#addtxt");

bgpage=chrome.extension.getBackgroundPage();
bl=localStorage["black"].split(',');
if(bl.length===1 && bl[0]==="") bl=[];

function refresh() {
  localStorage["black"]=bl.join(",");
  bgpage.rebind();
  location.reload(true);
}

function clear() {
  bl=[];
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
function makedel(id) {
  function del() {
    bl.splice(id,1);
    refresh();
  }
  return del;
}

clearbtn.addEventListener('click',clear);
addbtn.addEventListener('click',add);
document.addEventListener('DOMContentLoaded',function() {
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
});
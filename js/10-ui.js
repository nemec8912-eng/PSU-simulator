/* UI */
let sel=null;
const PANEL_OF={};Object.entries(SCH).forEach(([pid,sc])=>(sc.c||[]).forEach(c=>{if(P[c.id]&&!PANEL_OF[c.id])PANEL_OF[c.id]=pid}));
const pickSel=$("pick");
{const o=document.createElement("option");o.value="";o.textContent="Найти деталь…";pickSel.appendChild(o);
 Object.entries(PAN).forEach(([pid,[,,title]])=>{const og=document.createElement("optgroup");og.label=title;Object.keys(P).filter(k=>PANEL_OF[k]===pid).forEach(k=>{const o=document.createElement("option");o.value=k;o.textContent=k+" — "+P[k][0];og.appendChild(o)});pickSel.appendChild(og)})}
pickSel.addEventListener("change",()=>{if(pickSel.value){pick(pickSel.value,true)}});
function pick(id,scroll){
  sel=id;Object.entries(parts).forEach(([k,arr])=>arr.forEach(p=>p.G.classList.toggle("sel",k===id)));pickSel.value=id;renderCard();
  if(scroll){const p=parts[id][0].G.getBoundingClientRect(),b=$("board").getBoundingClientRect();$("board").scrollBy({left:p.left-b.left-b.width/2,top:p.top-b.top-b.height/2,behavior:"smooth"})}
}
function setFail(id,m){
  if(m){delete st.inst[id];delete st.later[id];st.F[id]=m;log(`${id} (${P[id][0]}): ${ML[m].toLowerCase()}.`,true)}else{delete st.F[id];delete st.sec[id];Object.keys(st.casc).forEach(k=>{if(k.startsWith(id))delete st.casc[k]});
    if(id==="F1"){st.fuse=false}log(`${id} заменён исправным.`)}
  if(id==="CY2"&&!m)st.rcd=false;
  renderCard();
}
function renderCard(){
  const body=$("cBody");if(!sel){return}
  const [n,v,role,chk,modes]=P[sel],m=st.F[sel]||(sel==="F1"&&st.fuse?"open":null);
  $("cId").textContent=sel+" · "+(PAN[PANEL_OF[sel]]||[,,""])[2];$("cName").textContent=n;$("cVal").textContent=v;
  const sl=st.slot[sel],hide=game.on&&!game.reveal;
  let h=`<div class="lbl">Зачем нужна</div><p>${role}</p><div class="lbl">Как проверить мультиметром</div><p>${chk}</p>`;
  h+=`<div class="slotbox">${sl==="empty"?`<b>Место пустое.</b> По схеме здесь ${CATN[catOf(sel)]} <span class="mono">${v}</span>. Найдите деталь в каталоге справа и перетащите сюда${matchMedia("(pointer:coarse)").matches?" (или нажмите на неё в каталоге)":" или нажмите на неё в каталоге"}.`:`Сейчас стоит: <span class="mono">${sl?sl.l:v}</span>${sl?"":" (заводская)"} <button type="button" class="rm" id="rmB">Выпаять в корзину</button>`}</div>`;
  if(hide){body.innerHTML=h;const rb=$("rmB");if(rb)rb.addEventListener("click",()=>removePart(sel));return}
  h+=`<div class="modes">`;
  Object.keys(modes).forEach(k=>{h+=`<button type="button" class="brk" data-m="${k}" aria-pressed="${m===k}">${ML[k]}</button>`});
  h+="</div>";
  const ins=st.inst[sel],lat=st.later[sel];
  h+=`<div class="lbl">Комплект замены — выберите деталь</div><div class="kit">`;
  (sel==="F1"||m||ins)&&kitFor(sel).forEach((o,i)=>{h+=`<button type="button" class="kb${ins&&ins.l===o.l?" cur":""}" data-k="${i}">${o.l}</button>`});
  if(!(sel==="F1"||m||ins))h+=`<span class="hint">Деталь исправна. Сначала выведите её из строя кнопкой выше.</span>`;
  h+="</div>";
  if(ins){const good=ins.r==="ok"||ins.r==="ok2";h+=`<div class="verdict ${good?(ins.r==="ok"?"g":"y"):"b"}"><b>${good?(ins.r==="ok"?"Подходит":"Работает, но не лучший выбор"):(ins.r==="later"&&lat?"Пока работает…":"Не подходит")}:</b> ${ins.r==="ok"?ins.why:ins.why}${lat?` <span class="cd">Выйдет из строя примерно через ${Math.max(0,Math.ceil(lat.t))} с работы.</span>`:""}</div>`}
  if(m&&modes[m]){const [why,sym,cause]=modes[m];
    h+=`<div class="fail">${st.sec[sel]?`<p class="sec">Вторичная поломка из-за ${st.sec[sel]}</p>`:""}<div class="lbl">Почему дальше не работает</div><p>${why}</p><div class="lbl">Признаки</div><ul class="sy">${sym.map(s=>`<li>${s}</li>`).join("")}</ul><div class="lbl">Почему выходит из строя</div><p>${cause}</p></div>`}
  else if(sel==="F1"&&st.fuse){h+=`<div class="fail"><div class="lbl">Почему дальше не работает</div><p>${modes.open[0]}</p><div class="lbl">Почему сгорел</div><p>Его сожгло короткое замыкание — смотрите журнал событий. Новый предохранитель ставьте только после замены пробитой детали.</p></div>`}
  body.innerHTML=h;
  body.querySelectorAll("button[data-m]").forEach(b=>b.addEventListener("click",()=>{const k=b.dataset.m;setFail(sel,k?(st.F[sel]===k?null:k):null)}));
  const K=kitFor(sel);body.querySelectorAll("button[data-k]").forEach(b=>b.addEventListener("click",()=>{if(st.slot[sel]==="empty"){st.trash=st.trash.filter(x=>x.id!==sel)}install(sel,K[+b.dataset.k]);renderTrash()}));
  const rb=$("rmB");if(rb)rb.addEventListener("click",()=>removePart(sel));
}
function renderTv(){
  const s=S,scr=$("screen"),led=$("led");
  let txt="выключен",lit=false,flick=false,ledc="",see="";
  if(!s.mains){see=st.rcd?"Выбило УЗО в щитке — в розетке нет напряжения.":"Вилка выдернута из розетки.";}
  else if(st.fuse||s.surge){see=s.surge?"Короткое замыкание! Огромный ток, сейчас сгорит предохранитель.":"Телевизор мёртв: сгорел предохранитель F1. Светодиод не горит, на пульт и кнопку нет реакции.";ledc=""}
  else if(s.sbyMode==="off"||s.a5v<.3&&s.sbyMode!=="hic"){see="Телевизор мёртв: дежурный источник не работает, светодиод не горит.";}
  else if(s.sbyMode==="hic"){ledc="red blinkled";see="Светодиод мигает, в блоке тикает: дежурный источник запускается и уходит в защиту.";}
  else if(s.sbyMode==="low"){see="На A5V только 1,5 В — процессор ТВ не работает, светодиод не горит.";}
  else if(!st.tv){ledc="red";see="Дежурный режим: горит красный светодиод, ТВ ждёт команды с пульта."+(s.v13>5?" Но 13 и 24 В почему-то есть — основная часть не выключается.":"");}
  else if(s.tvRun){txt=st.F.C15==="dry"?"мерцает":"изображение";lit=true;flick=st.F.C15==="dry"||st.F.C13==="dry"||st.F.C14==="dry";see="Телевизор работает: 13 В и 24 В в норме."+(flick?" Но пульсации большие — изображение мерцает, возможны перезагрузки.":"")+(s.bulk>410?" Внимание: на C1 425 В — конденсатор работает на пределе.":"")}
  else{ledc=st.ovp?"red":"red blinkled";
    see=st.ovp?"Телевизор включился и сразу выключился: сработала защита от перенапряжения. Чтобы сбросить, выключите и включите ТВ пультом."
      :(s.vccM<10?"Команда «включить» не дошла до первичной стороны: нет питания VCC-M для PFC и LLC. ТВ остаётся в дежурке.":
       (!s.pfcBoost&&s.bulk<360?"PFC не работает: на C1 около 320 В вместо 390 В. LLC ждёт 365 В и не запускается.":
       (s.v13>0.5&&s.v13<11?"13 В сильно занижено — main board не запускается.":
       (s.v24<1&&s.v13>12?"13 В есть, но 24 В нет: нет подсветки и звука.":"LLC не выдаёт 13 и 24 В — ТВ не включается, щёлкает и возвращается в дежурку."))));}
  scr.className="screen"+(lit?" lit":"")+(flick?" flick":"");scr.innerHTML=`<span>${txt}</span>`;led.className=ledc;
  $("see").textContent=see;
  const row=(n,v,ok)=>`<tr><td>${n}</td><td class="${ok===1?"st-ok":ok===0?"st-bad":"st-mid"}">${v}</td></tr>`;
  $("rd").innerHTML=row("Сеть",s.mains?"230 В ~":"нет",s.mains?1:2)+row("Предохранитель F1",st.fuse?"сгорел":"цел",st.fuse?0:1)+
   row("B+ на C1",Math.round(s.bulk)+" В",s.bulk>380&&s.bulk<400?1:(s.bulk>300?2:0))+row("VCC-S (дежурка)",fmt(s.vccS,1)+" В",s.vccS>14?1:0)+
   row("A5V",fmt(s.a5v,2)+" В",s.a5v>4.75&&s.a5v<5.25?1:0)+row("VCC-M",fmt(s.vccM,1)+" В",s.vccM>10?1:2)+row("+13 В",fmt(s.v13,1)+" В",s.v13>12.4&&s.v13<13.6?1:(s.v13<.5?2:0))+row("+24 В",fmt(s.v24,1)+" В",s.v24>22.8&&s.v24<25.2?1:(s.v24<.5?2:0));
}
function syncBtns(){$("bMains").classList.toggle("on",st.mains);$("bMains").textContent=st.mains?"Вилка в розетке":"Вилка выдернута";$("bTv").classList.toggle("tvon",st.tv);$("bTv").textContent=st.tv?"Пульт: выключить ТВ":"Пульт: включить ТВ"}
$("bMains").addEventListener("click",()=>{st.mains=!st.mains;if(!st.mains){st.ovp=false;st.rcd=false}syncBtns();log(st.mains?"Вилка вставлена в розетку.":"Вилка выдернута.")});
$("bTv").addEventListener("click",()=>{st.tv=!st.tv;if(!st.tv)st.ovp=false;syncBtns();log(st.tv?"Нажата кнопка включения на пульте.":"ТВ переведён в дежурный режим.")});
$("bFixAll").addEventListener("click",()=>{if(game.on){toast("В режиме ремонта чинить нужно самому. Переключитесь в режим «Обучение».");return}st.F={};st.sec={};st.casc={};st.inst={};st.later={};st.slot={};st.trash=[];st.bug=false;st.fuse=false;st.rcd=false;st.ovp=false;log("Все детали заменены исправными.");renderCard();renderTrash()});
$("spd").addEventListener("input",e=>st.speed=e.target.value/100);
let zoom=.82;const W0=1796,H0=1108;
function applyZoom(){svg.style.width=Math.round(W0*zoom)+"px";svg.style.height=Math.round(H0*zoom)+"px"}
$("zIn").addEventListener("click",()=>{zoom=Math.min(1.6,zoom+.12);applyZoom()});
$("zOut").addEventListener("click",()=>{zoom=Math.max(.35,zoom-.12);applyZoom()});
$("zFit").addEventListener("click",()=>{zoom=($("board").clientWidth-4)/W0;applyZoom()});
applyZoom();
log("Блок питания подключён к сети. Работает только дежурный источник 5 В.");
pick("F1");
requestAnimationFrame(frame);

/* repair workshop */
st.slot={};st.trash=[];
const game={on:false,sc:-1,hints:0,done:false,reveal:false,t0:0,moves:0};
const TYPE_OF={};Object.values(SCH).forEach(sc=>(sc.c||[]).forEach(c=>{if(P[c.id]&&!TYPE_OF[c.id])TYPE_OF[c.id]=c.t}));
function catOf(id){if(id.startsWith("IC"))return"IC";if(id.startsWith("PC"))return"OPT";if(id==="F1")return"F";if(id==="TH1")return"TH";if(id==="RV1")return"RV";if(id==="BD1")return"BD";
  return {R:"R",C:"C",CP:"CP",D:"D",DZ:"D",Q:"Q",BJT:"Q",L:"L",CORE:"L"}[TYPE_OF[id]]||"L"}
const CATN={R:"резистор",C:"конденсатор",CP:"электролитический конденсатор",D:"диод",Q:"транзистор",IC:"микросхема",OPT:"оптопара",L:"дроссель / трансформатор",F:"предохранитель",TH:"термистор",RV:"варистор",BD:"диодный мост"};
const CATG={R:"Резисторы",CP:"Электролитические конденсаторы",C:"Плёночные и керамические конденсаторы",D:"Диоды и стабилитроны",Q:"Транзисторы",IC:"Микросхемы",OPT:"Оптопары",L:"Дроссели и трансформаторы",F:"Предохранители",TH:"Термисторы",RV:"Варисторы",BD:"Диодные мосты"};
const CORD=["R","CP","C","D","Q","IC","OPT","L","F","TH","RV","BD"];
const missing=id=>{const m=Object.keys(P[id][4]);return m.includes("open")?"open":m.includes("dry")?"dry":m.includes("dead")?"dead":null};
const CAT=[];
{const seen={};Object.keys(P).forEach(id=>kitFor(id).forEach(o=>{let c=catOf(id);if(/стабилитрон/.test(o.l))c="D";if(/^MOC/.test(o.l))c="OPT";
  const d=(c==="L"&&o.r==="ok")?P[id][0]+" · "+o.l:o.l;const k=c+"|"+o.l;if(!seen[k]){seen[k]=1;CAT.push({c,l:o.l,d})}}));
 CAT.sort((a,b)=>CORD.indexOf(a.c)-CORD.indexOf(b.c)||a.d.localeCompare(b.d,"ru",{numeric:true}))}

/* toast */
const toastEl=document.createElement("div");toastEl.className="toast";toastEl.setAttribute("role","status");document.body.appendChild(toastEl);
let toastT;function toast(m){toastEl.textContent=m;toastEl.classList.add("show");clearTimeout(toastT);toastT=setTimeout(()=>toastEl.classList.remove("show"),3200)}

/* remove / place */
function removePart(id){
  if(st.slot[id]==="empty")return;
  const real=st.F[id]||(id==="F1"&&st.fuse?"open":null),ins=st.inst[id];
  const ph=partPhys(id);st.trash.unshift({id,l:ins?ins.l:P[id][1],c:ph.cat,mode:ph.mode,bad:ins&&ins.r!=="ok"&&ins.r!=="ok2"?"wrong":real,orig:!ins,checked:false});if(ms&&ms.id===id){ms.id=null;drawProbes();renderMeter()}
  delete st.inst[id];delete st.later[id];delete st.sec[id];if(id==="F1"){st.fuse=false;st.bug=false}
  Object.keys(st.casc).forEach(k=>{if(k.startsWith(id))delete st.casc[k]});
  const mm=missing(id);if(mm)st.F[id]=mm;else delete st.F[id];
  st.slot[id]="empty";game.moves++;log(`${id} выпаян и убран в корзину.`);renderTrash();if(sel===id)renderCard();
}
function placeItem(id,it){
  if(st.slot[id]!=="empty"){toast(`Место ${id} занято. Сначала выпаяйте старую деталь — перетащите её в корзину.`);pick(id);return}
  const kit=kitFor(id),f=kit.find(o=>o.l===it.l),need=catOf(id),mm=missing(id);
  const opt=f||(it.c===need?{l:it.l,r:"same",m:mm,why:"Тип детали тот, но номинал или модель не подходят: режим цепи нарушен."}
    :{l:it.l,r:"same",m:mm,why:`Здесь должен стоять ${CATN[need]}, а поставлен ${CATN[it.c]}. Он не может выполнить эту работу — цепь не работает.`});
  st.trash=st.trash.filter(x=>!(x.id===id&&x.orig&&!x.bad&&opt.r==="ok"&&false));
  install(id,Object.assign({c:it.c},opt));game.moves++;pick(id);renderTrash();if(ms&&ms.id===id)renderMeter();
}

/* drag & drop */
let drag=null;const ghost=document.createElement("div");ghost.className="ghost";ghost.hidden=true;document.body.appendChild(ghost);
let hov=null;
function dStart(e,kind,payload,label){drag={kind,payload,label,x:e.clientX,y:e.clientY,moved:false}}
function hoverTarget(t){
  const tr=$("trash");tr.classList.toggle("over",!!(drag&&drag.kind==="part"&&t&&t.closest("#trash")));
  const g=drag&&drag.kind==="item"&&t?t.closest(".pc"):null;
  if(hov&&hov!==g)hov.classList.remove("drop");hov=g;if(g)g.classList.add("drop");
}
addEventListener("pointermove",e=>{if(!drag)return;
  if(!drag.moved&&Math.hypot(e.clientX-drag.x,e.clientY-drag.y)>6){drag.moved=true;ghost.hidden=false;ghost.textContent=drag.label;document.body.classList.add("dragging")}
  if(drag.moved){ghost.style.left=e.clientX+14+"px";ghost.style.top=e.clientY+14+"px";hoverTarget(document.elementFromPoint(e.clientX,e.clientY))}});
addEventListener("pointerup",e=>{if(!drag)return;const d=drag;drag=null;ghost.hidden=true;document.body.classList.remove("dragging");
  const t=document.elementFromPoint(e.clientX,e.clientY);hoverTarget(null);
  if(!d.moved){if(d.kind==="part")pick(d.payload);else catClick(d.payload);return}
  if(d.kind==="part"){if(t&&t.closest("#trash"))removePart(d.payload);else toast("Чтобы выпаять деталь, отпустите её над корзиной.")}
  else{const g=t&&t.closest(".pc");if(g&&g.dataset.id&&P[g.dataset.id])placeItem(g.dataset.id,d.payload);else toast("Отпустите деталь над пустым местом на схеме.")}});
addEventListener("pointercancel",()=>{drag=null;ghost.hidden=true;document.body.classList.remove("dragging");hoverTarget(null)});
function catClick(it){
  if(sel&&st.slot[sel]==="empty")placeItem(sel,it);
  else toast(sel?`Место ${sel} занято. Сначала выпаяйте деталь (перетащите в корзину), потом выбирайте замену.`:"Сначала выберите на схеме пустое место.");
}

/* catalog */
const catF=$("catF"),catQ=$("catQ"),catL=$("catL");
{const o=document.createElement("option");o.value="";o.textContent="Все типы";catF.appendChild(o);CORD.forEach(c=>{const o=document.createElement("option");o.value=c;o.textContent=CATG[c];catF.appendChild(o)})}
function renderCat(){
  const q=catQ.value.trim().toLowerCase(),f=catF.value;let h="",last="";
  CAT.forEach((it,i)=>{if(f&&it.c!==f)return;if(q&&!it.d.toLowerCase().includes(q))return;
    if(it.c!==last){last=it.c;h+=`<li class="cg">${CATG[it.c]}</li>`}
    h+=`<li><button type="button" class="ci" data-i="${i}"><i class="ct ct-${it.c}">${it.c==="OPT"?"PC":it.c}</i>${it.d}</button></li>`});
  catL.innerHTML=h||`<li class="hint">Ничего не найдено</li>`;
  catL.querySelectorAll(".ci").forEach(b=>{const it=CAT[+b.dataset.i];
    b.addEventListener("pointerdown",e=>{if(e.button!==0||e.pointerType==="touch")return;e.preventDefault();dStart(e,"item",it,it.d)});
    b.addEventListener("click",e=>{if(e.detail===0||e.pointerType==="touch"||matchMedia("(pointer:coarse)").matches)catClick(it)})});
}
catQ.addEventListener("input",renderCat);catF.addEventListener("change",renderCat);renderCat();

/* trash */
function renderTrash(){
  const L=$("trashL");
  if(!st.trash.length){L.innerHTML=`<li class="hint">Пусто. Перетащите сюда деталь со схемы.</li>`;return}
  L.innerHTML=st.trash.map((x,i)=>`<li><div><b class="mono">${x.id}</b> <span class="mono dim">${x.l}</span></div>${x.checked?`<div class="res ${x.bad?"b":"g"}">${x.bad==="wrong"?"Это была неподходящая деталь.":x.bad?"Неисправна: "+ML[x.bad].toLowerCase()+". Поломка найдена!":"Исправна — её можно было не выпаивать."}</div>`:""}
    <div class="ta">${ms&&ms.tool!=="hand"?`<button type="button" class="mb" data-mt="${i}">Измерить: ${TOOLS[ms.tool]}</button>`:""}${x.checked?"":`<button type="button" data-c="${i}">Узнать результат</button>`}${x.orig&&!x.bad&&st.slot[x.id]==="empty"?`<button type="button" data-b="${i}">Вернуть на место</button>`:""}</div></li>`).join("");
  L.querySelectorAll("[data-c]").forEach(b=>b.addEventListener("click",()=>{const x=st.trash[+b.dataset.c];x.checked=true;log(`${x.id} проверен мультиметром: ${x.bad==="wrong"?"неподходящая деталь":x.bad?"неисправен ("+ML[x.bad].toLowerCase()+")":"исправен"}.`,!!x.bad);renderTrash()}));
  L.querySelectorAll("[data-mt]").forEach(b=>b.addEventListener("click",()=>measureTrash(+b.dataset.mt)));
  L.querySelectorAll("[data-b]").forEach(b=>b.addEventListener("click",()=>{const x=st.trash[+b.dataset.b];st.trash.splice(+b.dataset.b,1);const ok=kitFor(x.id).find(o=>o.r==="ok");install(x.id,ok);game.moves++;pick(x.id);renderTrash()}));
}

/* scenarios */
const SCEN=[
 {t:"Тикает и мигает светодиод",c:"«Телевизор не включается, внутри что-то тикает, красный светодиод мигает».",F:{C6:"dry"},
  h:["Тиканье и мигание — признак того, что дежурный источник запускается и сразу выключается. Смотрите блок 4.","IC2 стартует, но ему не хватает питания VCC. Проследите цепь питания микросхемы: обмотка → D4 → R12 → C6.","Чаще всего виноват конденсатор питания, который высох. Внешне он может выглядеть целым."],a:"C6 — высох конденсатор питания IC2. Замена: 47 мкФ 50V."},
 {t:"Хлопок, предохранитель чёрный",c:"«Был хлопок, телевизор не подаёт признаков жизни». Предохранитель F1 почернел.",F:{Q1:"short",R5:"open"},fuse:true,
  h:["Чёрный предохранитель — сильное КЗ. Не меняйте F1, пока не найдёте причину: он сгорит снова.","Проверьте мультиметром силовые ключи первичной стороны: Q1, мост BD1, IC2, Q4/Q5. Выпаяйте подозрительный и проверьте в корзине.","Пробитый Q1 часто утаскивает за собой токовый шунт R5 — его тоже проверьте. Потом замените F1."],a:"Пробит Q1, оборван R5, сгорел F1. Нужно заменить все три детали."},
 {t:"Мёртвый, предохранитель цел",c:"«Не работает, светодиод не горит». F1 целый.",F:{TH1:"open"},
  h:["Посмотрите на C1: 0 В при целом предохранителе — разрыв между вилкой и мостом.","Смотрите, докуда доходят точки тока в блоке 1.","Последовательно в цепи сети стоят F1, дроссель LF1 и термистор TH1."],a:"TH1 — термистор оборван."},
 {t:"Светодиод горит, не включается (1)",c:"«Светодиод горит, по пульту щёлкает — и снова дежурка».",F:{R3:"open"},
  h:["Нажмите «включить ТВ» и посмотрите, поднимается ли напряжение на C1 до 390 В.","C1 остаётся на ~320 В — не работает PFC. Есть ли импульсы на затворе Q1?","Импульсы выходят из IC1 (флаг GATE1), но до затвора Q1 не доходят. Что стоит между ними?"],a:"R3 — резистор затвора Q1 оборван."},
 {t:"Светодиод горит, не включается (2)",c:"«Светодиод горит, по пульту щёлкает — и снова дежурка».",F:{R7:"open"},
  h:["PFC не запускается, хотя питание VCC-M на IC1 приходит.","Посмотрите в блоке 5 на напряжение на входе INV микросхемы IC1.","IC1 видит 0 В на входе обратной связи и не запускает PFC. Проверьте делитель R6, R7, R9."],a:"R7 — обрыв в делителе обратной связи PFC."},
 {t:"Включается на секунду и гаснет",c:"«Включается, на мгновение слышен звук, и сразу выключается».",F:{R23:"open"},
  h:["Посмотрите на 13 В в момент включения: оно в норме или выше?","13 В подскакивает до 17 В, срабатывает защита OVP. Значит, не работает обратная связь LLC.","Светодиод оптопары PC2 не горит. Проверьте делитель R23/R24 и TL431 IC5."],a:"R23 — верхний резистор делителя ОС 13 В оборван."},
 {t:"Выключается на ярких сценах",c:"«Работает, но на ярких сценах выключается и включается снова».",F:{C1:"dry"},
  h:["Следите за напряжением B+ на C1, когда ТВ работает.","Под нагрузкой B+ проседает ниже 340 В, и LLC отключается по защите.","Конденсатор, который держит B+, потерял ёмкость."],a:"C1 — высох сглаживающий конденсатор 150 мкФ 450V."},
 {t:"Нет звука и подсветки",c:"«Звука нет, экран тёмный, но если посветить фонариком — изображение видно».",F:{D9:"open"},
  h:["Подсветка и звук питаются от 24 В. Смотрите блок 6.","13 В в норме, а 24 В нет: энергия с обмотки до выхода 24 В не доходит.","Между обмоткой 24-A и выходом стоит только выпрямительный диод."],a:"D9 — оборван выпрямитель 24 В."},
 {t:"Мерцание и перезагрузки",c:"«Изображение мерцает, телевизор иногда сам перезагружается».",F:{C13:"dry",C14:"dry"},
  h:["Ровное ли напряжение 13 В? Посмотрите на цифры в блоке 6.","13 В «гуляет»: пульсации не сглаживаются.","На выходе 13 В два конденсатора — частая жертва высыхания. Проверьте оба."],a:"C13 и C14 высохли — менять оба."},
 {t:"Мёртвый, светодиод не горит, F1 цел",c:"«Не включается, светодиод не горит». На C1 напряжение есть.",F:{IC4:"short"},
  h:["На C1 около 320 В — значит, проблема в дежурке. Работает ли IC2?","IC2 работает, но A5V всего 1,5 В. Кто говорит IC2 «хватит»?","Светодиод PC1 горит всё время — TL431 открыта постоянно. Проверьте IC4 и R14."],a:"IC4 (TL431 дежурки) пробита."},
 {t:"Не реагирует на пульт",c:"«Светодиод горит, но по пульту ничего не происходит — даже щелчка нет».",F:{Q2:"open"},
  h:["Включите ТВ и посмотрите на сигнал PS-ON в блоке 8.","PS-ON приходит, но светодиод оптопары PC3 не загорается.","Светодиод PC3 включается транзистором Q2."],a:"Q2 оборван."},
 {t:"Щелчок и снова дежурка (LLC)",c:"«При включении щёлкает и возвращается в дежурку».",F:{D6:"open"},
  h:["VCC-M есть, PFC работает (C1 = 390 В), но LLC не выдаёт 13 В.","Посмотрите на ключи Q4 и Q5 — открываются ли оба?","Q4 не открывается никогда: у драйвера верхнего ключа нет питания VB."],a:"D6 — оборван диод бутстрепа."},
 {t:"Работает даже в дежурке",c:"«Выключаю с пульта, а блок продолжает шуметь, подсветка светится».",F:{PC3:"short"},
  h:["В дежурном режиме шины VCC-M быть не должно. Есть ли она?","VCC-M есть, хотя PS-ON = 0 и светодиод PC3 не горит.","Фототранзистор оптопары пропускает ток без света."],a:"PC3 — пробит фототранзистор оптопары."},
 {t:"Предохранитель горит при включении",c:"«В дежурке всё нормально. При включении с пульта — хлопок». Новый F1 уже ставили.",F:{D1:"short"},
  h:["Хлопок только при запуске PFC — виновник в силовой части PFC (блок 2).","Когда Q1 открывается, через что может замкнуться C1?","Диод PFC должен запирать C1 от ключа. Если он пробит, C1 замыкается через Q1."],a:"D1 пробит. После его замены поменяйте и F1."},
 {t:"Тикает, 5 В скачет",c:"«Тикает, светодиод мигает, однажды сгорела main board».",F:{R13:"open"},
  h:["Посмотрите на A5V при старте — поднимается ли выше 5 В?","A5V подскакивает до 8–9 В, срабатывает защита. Обратная связь дежурки не работает.","TL431 IC4 не получает напряжение с делителя."],a:"R13 — оборван верхний резистор делителя ОС 5 В."}
];
const scSel=$("scSel");SCEN.forEach((s,i)=>{const o=document.createElement("option");o.value=i;o.textContent=`${i+1}. ${s.t}`;scSel.appendChild(o)});
function setMode(on){
  game.on=on;$("bMode").textContent=on?"Режим: ремонт":"Режим: обучение";$("bMode").classList.toggle("on",on);
  $("repair").hidden=!on;document.body.classList.toggle("game",on);
  if(on&&game.sc<0)startScenario(+scSel.value||0);else{renderCard()}
}
function resetBoard(){st.F={};st.sec={};st.casc={};st.inst={};st.later={};st.slot={};st.trash=[];st.bug=false;st.fuse=false;st.rcd=false;st.ovp=false;st.ovpT=0;st.mains=true;st.tv=false;st.bulk=0;st.a5v=0;st.vccS=0;st.vccM=0;st.v13=0;st.v24=0;st.llcEn=false}
function startScenario(i){
  const sc=SCEN[i];resetBoard();Object.assign(st.F,sc.F);st.fuse=!!sc.fuse;
  Object.assign(game,{sc:i,hints:0,done:false,reveal:false,t0:Date.now(),moves:0});
  logEl.innerHTML="";log(`Задача ${i+1}: ${sc.t}. Блок подключён к сети.`);
  syncBtns();renderGame();renderTrash();pick(sel||"F1");
}
function renderGame(){
  const sc=SCEN[game.sc];if(!sc)return;
  $("scText").textContent=sc.c;
  $("hints").innerHTML=sc.h.slice(0,game.hints).map((x,i)=>`<li><b>Подсказка ${i+1}.</b> ${x}</li>`).join("")+(game.reveal?`<li class="ans"><b>Ответ.</b> ${sc.a}</li>`:"");
  $("hintB").textContent=game.hints<sc.h.length?`Подсказка (${game.hints+1} из ${sc.h.length})`:"Подсказки закончились";$("hintB").disabled=game.hints>=sc.h.length;
  $("ansB").disabled=game.reveal;
  const w=$("win");w.hidden=!game.done;
}
$("bMode").addEventListener("click",()=>setMode(!game.on));
$("scStart").addEventListener("click",()=>startScenario(+scSel.value));
$("hintB").addEventListener("click",()=>{game.hints++;log("Взята подсказка.");renderGame()});
$("ansB").addEventListener("click",()=>{game.reveal=true;log("Показан ответ: "+SCEN[game.sc].a);renderGame();renderCard()});
function checkWin(){
  if(!game.on||game.done||game.sc<0)return;
  const clean=!Object.keys(st.F).length&&!st.fuse&&!Object.keys(st.later).length&&!st.bug&&!Object.values(st.slot).includes("empty")&&Object.values(st.inst).every(o=>o.r==="ok"||o.r==="ok2");
  if(st.tv&&S.tvRun&&clean&&st.mains){game.done=true;const sec=Math.round((Date.now()-game.t0)/1000);
    $("win").innerHTML=`<b>Отремонтировано!</b> Телевизор работает: изображение есть, все напряжения в норме. Время: ${Math.floor(sec/60)}:${String(sec%60).padStart(2,"0")}, действий с деталями: ${game.moves}, подсказок: ${game.hints}${game.reveal?" (с ответом)":""}. <button type="button" id="nextB">Следующая задача</button>`;
    log("Ремонт завершён: ТВ работает.");renderGame();
    $("nextB").addEventListener("click",()=>{const n=(game.sc+1)%SCEN.length;scSel.value=n;startScenario(n)})}
}
renderTrash();

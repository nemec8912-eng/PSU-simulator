/* extras: thermal camera, lamp, lab PSU, sounds, random & chain tasks, score, history, save */

/* ---------- storage helpers ---------- */
const store={get(k,d){try{const v=localStorage.getItem("psu."+k);return v==null?d:JSON.parse(v)}catch(e){return d}},
  set(k,v){try{localStorage.setItem("psu."+k,JSON.stringify(v))}catch(e){}}};

/* ---------- touch: tap = select / measure ---------- */
let lastPT="mouse";
addEventListener("pointerdown",e=>{lastPT=e.pointerType},true);
Object.entries(parts).forEach(([id,arr])=>arr.forEach(p=>{if(p.c.nopart)return;
  p.G.addEventListener("click",()=>{if(lastPT!=="touch")return;if(ms.tool!=="hand")measureAt(id);else pick(id)})}));

/* ---------- thermal camera ---------- */
TOOLS.thermo="Тепловизор";
const heatG=el("g",{class:"heat","aria-hidden":"true"});svg.insertBefore(heatG,probeG);
const heatT=el("g",{class:"heatT","aria-hidden":"true"});svg.insertBefore(heatT,probeG);
let heatSpots=null;
function heatTarget(id){
  const s=S,F=st.F;if(st.slot[id]==="empty")return 25;
  let t={TH1:s.inPath&&(s.sbyOn||s.llcOut)?(s.llcOut?82:38):25,BD1:s.bridgeOn||s.llcOut?(s.llcOut?55:32):25,Q1:s.pfcSw?58:25,D1:s.pfcBoost?52:25,LP1:s.pfcBoost?47:25,R5:s.pfcSw?38:25,
    IC2:s.sbyOn?47:25,R11:s.sbyOn?55:25,T1:s.sbyOn?38:25,D5:s.sbyOn?42:25,Q4:s.llcOut?52:25,Q5:s.llcOut?52:25,T2:s.llcOut?48:25,C11:s.llcOut?40:25,
    D7:s.llcOut?62:25,D9:s.llcOut?50:25,R26:s.v13>5?44:25,IC1:s.pfcIC?35:25,IC3:s.llcRun?37:25,C1:s.llcOut?38:(s.bulk>100?28:25),R2:s.pre?30:25,R1:s.pre?30:25}[id]||25;
  const f=F[id];
  if(s.surge&&f==="short")t=150;
  if(s.surge&&(id==="TH1"))t=Math.max(t,60);
  if(f==="dry"&&(s.sbyOn||s.llcOut))t=Math.max(t,52);
  if(id==="R11"&&is("D3","short")&&s.sbyOn)t=165;
  if(id==="Q1"&&is("R4","open")&&s.pfcSw)t=108;
  if((id==="Q4"||id==="Q5")&&is("C11","short")&&s.llcRun)t=118;
  if(f==="short"&&["D7","D9","C13","C14","C15"].includes(id)&&s.llcRun)t=96;
  if(f==="short"&&["D5","C7","C8"].includes(id)&&s.sbyOn)t=88;
  if(id==="IC2"&&s.sbyMode==="hic")t=Math.max(t,41);
  if(st.later[id]&&s.mains)t=Math.max(t,98);
  if(s.lab&&s.lab.sh.includes(id))t=25+s.lab.i*115;
  if(s.lab&&s.lab.rail==="vccm"&&id==="ZD1"&&st.lab.v>18&&!s.lab.sh.length)t=25+s.lab.i*90;
  if(s.lab&&s.lab.rail==="vccs"&&id==="R12"&&is("D4","short"))t=25+s.lab.i*90;
  return t;
}
setInterval(()=>{if(!S||S.t==null)return;Object.keys(P).forEach(id=>{const a=st.temp[id]??25,b=heatTarget(id);st.temp[id]=a+(b-a)*(b>a?.12:.05)});
  if(ms.tool==="thermo")drawHeat()},100);
function heatColor(t){const st_=[[25,[40,70,190]],[38,[30,170,200]],[50,[60,190,90]],[65,[250,200,40]],[85,[250,120,30]],[110,[225,40,40]],[150,[255,235,235]]];
  if(t<=st_[0][0])return`rgb(${st_[0][1]})`;for(let i=1;i<st_.length;i++)if(t<=st_[i][0]){const [t0,c0]=st_[i-1],[t1,c1]=st_[i],k=(t-t0)/(t1-t0);return`rgb(${c0.map((v,j)=>Math.round(v+(c1[j]-v)*k))})`}
  return"rgb(255,240,240)"}
function computeSpots(){
  const inv=svg.getScreenCTM().inverse(),pt=svg.createSVGPoint();heatSpots=[];
  Object.entries(parts).forEach(([id,arr])=>arr.forEach(p=>{if(p.c.nopart||p.c.t==="CORE")return;const h=p.G.querySelector(".hit");if(!h)return;const r=h.getBoundingClientRect();if(!r.width)return;
    pt.x=r.left+r.width/2;pt.y=r.top+r.height/2;const q=pt.matrixTransform(inv);heatSpots.push({id,x:q.x,y:q.y,r:Math.min(30,Math.max(14,Math.max(r.width,r.height)/svg.getScreenCTM().a/2))})}));
  heatG.innerHTML="";heatT.innerHTML="";
  heatSpots.forEach(s=>{s.c=el("circle",{cx:s.x,cy:s.y,r:s.r},heatG);s.l=el("text",{x:s.x,y:s.y+4,"text-anchor":"middle",class:"htxt"},heatT)});
}
function drawHeat(){if(!heatSpots)computeSpots();heatSpots.forEach(s=>{const t=st.temp[s.id]??25;s.c.style.fill=heatColor(t);s.c.style.opacity=t<30?.35:.8;
  s.l.textContent=t>=38?Math.round(t)+"°":"";})}
function thermoReading(id){const t=Math.round(st.temp[id]??25);
  const n=t<32?"Холодная — деталь не нагружена (или не работает).":t<=70?"Тёплая — нормальный рабочий нагрев.":t<=95?"Горячая — на пределе. Проверьте, не перегружена ли она.":"Перегрев! Деталь пробита, перегружена или по ней идёт ток КЗ.";
  return{v:String(t),u:"°C",n:n+(S.mains||S.lab?"":" Тепловизор видит нагрев только на работающей плате или при подаче тока от ЛБП.")}}
const _measure=measure;
measure=function(){if(ms.tool==="thermo"){if(ms.trash)return{v:"25",u:"°C",n:"Деталь в корзине остыла."};if(!ms.id)return null;return thermoReading(ms.id)}return _measure()};
const _setTool=setTool;
setTool=function(t){_setTool(t);document.body.classList.toggle("thermo",t==="thermo");if(t==="thermo"){heatSpots=null;drawHeat()}else{heatG.innerHTML="";heatT.innerHTML="";heatSpots=null}};
{const b=document.createElement("button");b.type="button";b.dataset.t="thermo";b.setAttribute("aria-pressed","false");b.textContent="Тепловизор";
 $("tools").querySelector(".tbtns").appendChild(b);b.addEventListener("click",()=>setTool("thermo"))}
addEventListener("resize",()=>{heatSpots=null});
["zIn","zOut","zFit"].forEach(i=>$(i).addEventListener("click",()=>{heatSpots=null}));

/* ---------- lamp ---------- */
function lampUi(){const b=$("bLamp");b.classList.toggle("on",st.lamp);b.textContent=st.lamp?"Лампа 100 Вт: включена":"Лампа 100 Вт: нет";$("lampBox").hidden=!st.lamp}
$("bLamp").addEventListener("click",()=>{st.lamp=!st.lamp;lampUi();store.set("lamp",st.lamp);
  log(st.lamp?"Блок включён в сеть через лампу 100 Вт: при КЗ лампа загорится, а предохранитель уцелеет.":"Лампа убрана, блок включён в сеть напрямую.")});
setInterval(()=>{if(!st.lamp)return;const b=S.lampB||0;$("bulb").style.setProperty("--glow",b.toFixed(2));
  $("lampT").textContent=!S.mains?"не горит (нет сети)":b>.8?"горит ярко — КЗ в блоке!":b>.3?"вспыхнула — идёт заряд C1 или большая нагрузка":b>.12?"еле тлеет — блок работает под нагрузкой":"почти не горит — КЗ нет"},120);

/* ---------- lab PSU ---------- */
{const sel=$("labRail");Object.entries(LAB_RAILS).forEach(([k,r])=>{const o=document.createElement("option");o.value=k;o.textContent=r.n;sel.appendChild(o)})}
function labUi(){const L=st.lab;$("labRail").value=L.rail;$("labV").value=L.v;$("labI").value=String(L.lim);
  $("labOn").textContent=L.on?"Выключить ЛБП":"Включить ЛБП";$("labOn").classList.toggle("on",L.on);$("labBox").classList.toggle("live",L.on)}
$("labRail").addEventListener("change",e=>{st.lab.rail=e.target.value;st.lab.v=LAB_RAILS[st.lab.rail].def;labUi()});
$("labV").addEventListener("change",e=>{st.lab.v=Math.max(0,Math.min(30,parseFloat(String(e.target.value).replace(",","."))||0));labUi()});
$("labI").addEventListener("change",e=>{st.lab.lim=parseFloat(e.target.value)});
$("labOn").addEventListener("click",()=>{
  if(!st.lab.on){if(S.mains){toast("Сначала выньте вилку из розетки: ЛБП подключают только к обесточенной плате.");return}
    if(S.bulk>30){toast(`На C1 ещё ${Math.round(S.bulk)} В. Разрядите его (кнопка в окне прибора).`);return}}
  st.lab.on=!st.lab.on;labUi();log(st.lab.on?`ЛБП ${fmt(st.lab.v,1)} В, ограничение ${fmt(st.lab.lim,1)} А подключён к шине ${LAB_RAILS[st.lab.rail].n}.`:"ЛБП отключён.")});
setInterval(()=>{const L=S.lab;$("labVo").textContent=(L?fmt(L.v,2):"0,00")+" В";$("labIo").textContent=(L?fmt(L.i,3):"0,000")+" А";
  const cc=$("labCC");cc.textContent=L?(L.cc?"CC":"CV"):"—";cc.className=L&&L.cc?"cc":"";},150);

/* ---------- sounds ---------- */
let actx=null,soundOn=store.get("sound",true);
function ac(){if(!soundOn)return null;try{if(!actx)actx=new (window.AudioContext||window.webkitAudioContext)();if(actx.state==="suspended")actx.resume();return actx}catch(e){return null}}
addEventListener("pointerdown",()=>{if(soundOn)ac()},{once:true});
function tone(f,d,type="square",vol=.06,at=0){const c=ac();if(!c)return;const o=c.createOscillator(),g=c.createGain(),t=c.currentTime+at;o.type=type;o.frequency.value=f;
  g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g).connect(c.destination);o.start(t);o.stop(t+d+.02)}
function noise(d,vol=.4,lp=1800){const c=ac();if(!c)return;const n=c.sampleRate*d,b=c.createBuffer(1,n,c.sampleRate),a=b.getChannelData(0);for(let i=0;i<n;i++)a[i]=(Math.random()*2-1)*Math.pow(1-i/n,3);
  const s=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain();s.buffer=b;f.type="lowpass";f.frequency.value=lp;g.gain.value=vol;s.connect(f).connect(g).connect(c.destination);s.start()}
const SND={tick:()=>tone(2200,.025,"square",.05),click:()=>{tone(900,.012,"square",.07);tone(600,.015,"square",.05,.03)},
  pop:()=>{noise(.35,.55,2400);tone(70,.25,"sine",.35)},snap:()=>{noise(.06,.5,6000)},beep:()=>tone(2700,.28,"square",.05),
  chime:()=>[523,659,784,1047].forEach((f,i)=>tone(f,.35,"triangle",.07,i*.12)),buzz:()=>tone(110,.4,"sawtooth",.04)};
function soundUi(){$("bSnd").textContent=soundOn?"Звук: вкл":"Звук: выкл";$("bSnd").classList.toggle("on",soundOn)}
$("bSnd").addEventListener("click",()=>{soundOn=!soundOn;store.set("sound",soundOn);soundUi();if(soundOn){ac();SND.click()}});
let prevS={};
setInterval(()=>{const s=S;if(!s||s.t==null)return;
  if(s.surge&&!prevS.surge)SND.pop();
  if(st.fuse&&!prevS.fuse)SND.snap();
  if(s.sbyMode==="hic"&&s.sbyOn&&!prevS.sbyOn)SND.tick();
  if(s.llcRun&&!prevS.llcRun)SND.click();
  if(st.ovp&&!prevS.ovp)SND.click();
  if(s.pson!==prevS.pson&&prevS.t!=null)SND.click();
  if(game.done&&!prevS.done)SND.chime();
  prevS={surge:s.surge,fuse:st.fuse,sbyOn:s.sbyOn,llcRun:s.llcRun,ovp:st.ovp,pson:s.pson,done:game.done,t:s.t};},40);
const _measureAt=measureAt;
measureAt=function(id){_measureAt(id);if(ms.tool==="dmm"&&ms.mode==="beep"){const r=measure();if(r&&r.u==="Ω")SND.beep()}};

/* ---------- chain scenarios ---------- */
SCEN.push(
 {t:"Цепочка: снова хлопок через секунды",chain:1,c:"«Уже меняли микросхему дежурки и предохранитель. Включили — через несколько секунд снова хлопок».",F:{D3:"open",IC2:"short"},fuse:true,
  h:["Хлопок повторяется после замены — значит, есть причина, которая убивает IC2. Одной замены IC2 мало.","Что защищает ключ IC2 от выбросов на стоке? Посмотрите снаббер: D3, R11, C5.","Проверьте D3 в режиме диода или тестером после выпайки."],a:"IC2 пробит, F1 сгорел. Причина — оборван диод снаббера D3. Менять D3, IC2 и F1."},
 {t:"Цепочка: ключ PFC горит повторно",chain:1,c:"«В мастерской поменяли транзистор и предохранитель. ТВ поработал несколько секунд после включения с пульта — и опять всё сгорело».",F:{R4:"open",Q1:"short",R5:"open"},fuse:true,
  h:["Пробит Q1 и сгорел F1, но Q1 сгорает повторно — значит, его убивает что-то в цепи затвора.","Если затвор «висит» без резистора на землю, ключ приоткрывается и перегревается. Тепловизор покажет перегрев Q1 до пробоя.","Проверьте R3, R4 и шунт R5."],a:"Q1 пробит, R5 оборван, F1 сгорел. Причина — обрыв R4 (затвор–исток Q1). Менять Q1, R5, R4 и F1."},
 {t:"Цепочка: LLC сгорает при включении",chain:1,c:"«Дежурка работает. При включении с пульта хлопок. Поменяли верхний транзистор — опять то же».",F:{C11:"short",Q4:"short"},fuse:true,
  h:["Пробит Q4 — но почему он горит снова? Ищите причину в резонансном контуре.","Если резонансный конденсатор пробит, ключи работают без резонанса и перегружаются.","Проверьте C11 мультиметром (Ω) или ESR-метром."],a:"Пробит C11 — из-за этого пробит Q4 и сгорел F1. Менять C11, Q4, F1."},
 {t:"Цепочка: тёмный резистор снаббера",chain:1,c:"«Работает несколько секунд, потом хлопок и тишина». Возле радиатора потемневший резистор.",F:{D3:"short",R11:"open"},
  h:["Потемневший резистор — признак перегрева. Почему он грелся?","R11 рассеивает энергию снаббера. Если диод снаббера пробит, через R11 идёт ток постоянно.","Проверьте D3. После его замены не забудьте R11 — и проверьте IC2."],a:"D3 пробит → R11 перегрелся и оборвался → через ~12 секунд пробьётся IC2. Менять D3 и R11 (и IC2 с F1, если успели сгореть)."},
 {t:"Цепочка: сгорает IC3",chain:1,c:"«Поменяли микросхему LLC — при включении щелчок, и снова не работает».",F:{D6:"short",IC3:"dead"},
  h:["Новая IC3 умирает за долю секунды после старта — её убивает высокое напряжение.","Через какую цепь высокое напряжение со средней точки полумоста может попасть на питание IC3?","Проверьте диод бутстрепа D6 в обе стороны."],a:"D6 пробит — через него B+ попадает на питание IC3. Менять D6 и IC3."},
 {t:"Цепочка: диод PFC",chain:1,c:"«Хлопок при включении с пульта. Поменяли транзистор PFC и предохранитель — хлопок снова».",F:{D1:"open",Q1:"short"},fuse:true,
  h:["Q1 пробивается повторно через 1–2 секунды работы PFC.","Если энергии дросселя некуда уйти, напряжение на стоке Q1 выбрасывает выше 600 В.","Проверьте диод PFC D1 в обе стороны."],a:"D1 оборван — из-за этого пробит Q1 и сгорел F1. Менять D1, Q1, F1."}
);

/* ---------- random tasks ---------- */
const RANDOM_POOL=[["F1","open"],["RV1","short"],["CX1","short"],["LF1","open"],["CX2","short"],["CY1","short"],["CY2","short"],["TH1","open"],["BD1","short"],["BD1","open"],["C2","short"],["LP1","open"],["Q1","short"],["Q1","open"],["R3","open"],["R4","open"],["R5","open"],["D1","short"],["D1","open"],["D2","short"],["C1","short"],["C1","dry"],["IC1","dead"],["C3","dry"],["C3","short"],["C4","short"],["R6","open"],["R6","drift"],["R7","open"],["R9","open"],["IC2","dead"],["IC2","short"],["T1","open"],["R11","open"],["C5","open"],["D3","open"],["D4","open"],["D4","short"],["R12","open"],["C6","dry"],["C6","short"],["C9","short"],["R8","open"],["D5","short"],["D5","open"],["C7","dry"],["C7","short"],["L1","open"],["C8","short"],["R13","open"],["R14","open"],["IC4","open"],["IC4","short"],["R15","open"],["PC1","open"],["PC1","short"],["R16","open"],["R17","open"],["Q2","open"],["Q2","short"],["PC3","open"],["PC3","short"],["R18","open"],["Q3","open"],["Q3","short"],["ZD1","short"],["C16","dry"],["C16","short"],["IC3","dead"],["R21","open"],["C12","dry"],["C12","short"],["Q4","short"],["Q4","open"],["Q5","short"],["Q5","open"],["R19","open"],["R20","open"],["D6","open"],["D6","short"],["C10","open"],["C10","short"],["C11","open"],["C11","short"],["T2","open"],["D7","short"],["D7","open"],["C13","dry"],["C13","short"],["C14","dry"],["C14","short"],["D9","short"],["D9","open"],["C15","dry"],["C15","short"],["R23","open"],["R24","open"],["IC5","open"],["IC5","short"],["R25","open"],["PC2","open"],["PC2","short"],["D3","short"]];
const PANEL_TITLE=id=>(PAN[PANEL_OF[id]]||[,,""])[2].replace(/^\d+ · /,"");
SCEN.push({t:"Случайная поломка (1 деталь)",rand:1,n:1},{t:"Случайная поломка (2 детали)",rand:1,n:2});
function genRandom(sc){
  const pool=RANDOM_POOL.slice(),picked=[];
  while(picked.length<sc.n&&pool.length){const k=pool.splice(Math.floor(Math.random()*pool.length),1)[0];if(picked.some(p=>p[0]===k[0]||PANEL_OF[p[0]]===PANEL_OF[k[0]]))continue;picked.push(k)}
  sc.F={};picked.forEach(([id,m])=>sc.F[id]=m);sc.fuse=false;
  const [id,m]=picked[0],[why,sym]=P[id][4][m];
  const clean=sym.filter(x=>!/\b[A-Z]{1,3}\d/.test(x)&&!/звонится|почернел/.test(x));
  sc.c="«"+(clean.length?clean.slice(0,2).join(", "):"Телевизор не работает")+"».";
  sc.h=[];picked.forEach(([pid,pm],i)=>{const pre=sc.n>1?`Поломка ${i+1}: `:"";const w=P[pid][4][pm][0].split(pid).join("эта деталь");
    sc.h.push(pre+"неисправность на участке «"+PANEL_TITLE(pid)+"».");sc.h.push(pre+w);sc.h.push(pre+"ищите "+CATN[catOf(pid)]+" "+shortV(P[pid][1])+".")});
  if(sc.n>1)sc.h=[sc.h[0],sc.h[3],sc.h[1],sc.h[4],sc.h[2],sc.h[5]];
  sc.a=picked.map(([pid,pm])=>`${pid} (${P[pid][0]}): ${ML[pm].toLowerCase()}`).join("; ")+".";
}
const _startScenario=startScenario;
startScenario=function(i){const sc=SCEN[i];if(sc&&sc.rand)genRandom(sc);_startScenario(i);game.extra=0;game.wrong=0;saveGame()};

/* ---------- select with groups and solved marks ---------- */
function rebuildScSel(){const sel=$("scSel"),cur=sel.value;sel.innerHTML="";const hist=store.get("hist",[]);const solved=new Set(hist.map(h=>h.t));
  const groups=[["Задачи",SCEN.map((s,i)=>[s,i]).filter(([s])=>!s.chain&&!s.rand)],["Цепочки поломок",SCEN.map((s,i)=>[s,i]).filter(([s])=>s.chain)],["Случайные",SCEN.map((s,i)=>[s,i]).filter(([s])=>s.rand)]];
  let n=0;groups.forEach(([g,list])=>{const og=document.createElement("optgroup");og.label=g;list.forEach(([s,i])=>{const o=document.createElement("option");o.value=i;
    o.textContent=(s.rand?"":(++n)+". ")+s.t+(solved.has(s.t)&&!s.rand?"  ✓":"");og.appendChild(o)});sel.appendChild(og)});if(cur)sel.value=cur}
rebuildScSel();

/* ---------- score & history ---------- */
const _removePart=removePart;
removePart=function(id){const real=st.F[id]||(id==="F1"&&st.fuse?"open":null),ins=st.inst[id];if(game.on&&!real&&!ins&&st.slot[id]!=="empty")game.extra=(game.extra||0)+1;_removePart(id);saveGame()};
const _install=install;
install=function(id,opt){if(game.on&&opt.r!=="ok"&&opt.r!=="ok2")game.wrong=(game.wrong||0)+1;_install(id,opt);saveGame()};
function scoreRepair(sec){
  let s=100-12*game.hints-(game.reveal?40:0)-6*(game.extra||0)-8*(game.wrong||0)-2*Math.max(0,Math.floor((sec-180)/60));
  s=Math.max(5,Math.min(100,s));const stars=s>=85?3:s>=60?2:1;const sc=SCEN[game.sc];
  const h=store.get("hist",[]);h.unshift({t:sc.t,rand:!!sc.rand,ans:sc.a,d:Date.now(),sec,score:s,hints:game.hints,rev:game.reveal,extra:game.extra||0,wrong:game.wrong||0});store.set("hist",h.slice(0,100));
  rebuildScSel();renderHist();return{s,stars}}
function renderHist(){const h=store.get("hist",[]),box=$("hist");if(!box)return;
  const fixed=SCEN.filter(s=>!s.rand).length,solved=new Set(h.filter(x=>!x.rand).map(x=>x.t)).size,best=h.length?Math.max(...h.map(x=>x.score)):0,avg=h.length?Math.round(h.reduce((a,x)=>a+x.score,0)/h.length):0;
  $("histSum").textContent=`Мои ремонты: ${h.length} · решено задач ${solved} из ${fixed} · средний счёт ${avg} · лучший ${best}`;
  $("histT").innerHTML=h.length?`<thead><tr><th>Когда</th><th>Задача</th><th>Время</th><th>Подсказки</th><th>Счёт</th></tr></thead><tbody>`+h.slice(0,30).map(x=>`<tr><td>${new Date(x.d).toLocaleString("ru-RU",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"})}</td><td>${x.t}${x.rand?`<div class="dim">${x.ans}</div>`:""}</td><td>${Math.floor(x.sec/60)}:${String(x.sec%60).padStart(2,"0")}</td><td>${x.hints}${x.rev?" + ответ":""}</td><td><b>${x.score}</b> ${"★".repeat(x.score>=85?3:x.score>=60?2:1)}</td></tr>`).join("")+"</tbody>":`<tbody><tr><td class="dim">Пока нет завершённых ремонтов.</td></tr></tbody>`}
$("histClr").addEventListener("click",()=>{if(!$("histClr").dataset.arm){$("histClr").dataset.arm=1;$("histClr").textContent="Точно очистить?";setTimeout(()=>{delete $("histClr").dataset.arm;$("histClr").textContent="Очистить историю"},3000);return}
  store.set("hist",[]);delete $("histClr").dataset.arm;$("histClr").textContent="Очистить историю";renderHist();rebuildScSel()});
renderHist();

/* ---------- save / restore progress ---------- */
function saveGame(){if(!game.on||game.sc<0){store.set("save",null);return}
  const sc=SCEN[game.sc];store.set("save",{sc:game.sc,rand:sc.rand?{F:sc.F,c:sc.c,h:sc.h,a:sc.a}:null,F:st.F,sec:st.sec,slot:st.slot,inst:st.inst,trash:st.trash,later:st.later,casc:st.casc,fuse:st.fuse,
    hints:game.hints,reveal:game.reveal,done:game.done,el:Date.now()-game.t0,moves:game.moves,extra:game.extra||0,wrong:game.wrong||0,tv:st.tv,mains:st.mains})}
setInterval(saveGame,2000);addEventListener("pagehide",saveGame);
$("bMode").addEventListener("click",()=>setTimeout(saveGame,0));
function restoreGame(){const s=store.get("save",null);if(!s||!SCEN[s.sc])return false;
  const sc=SCEN[s.sc];if(sc.rand&&s.rand)Object.assign(sc,s.rand);
  game.sc=s.sc;$("scSel").value=s.sc;setMode(true);resetBoard();
  Object.assign(st,{F:s.F||{},sec:s.sec||{},slot:s.slot||{},inst:s.inst||{},trash:s.trash||[],later:s.later||{},casc:s.casc||{},fuse:!!s.fuse,tv:!!s.tv,mains:s.mains!==false});
  Object.assign(game,{hints:s.hints||0,reveal:!!s.reveal,done:!!s.done,t0:Date.now()-(s.el||0),moves:s.moves||0,extra:s.extra||0,wrong:s.wrong||0});
  logEl.innerHTML="";log(`Продолжаем задачу: ${sc.t}.`);syncBtns();renderGame();renderTrash();pick("F1");return true}

/* ---------- win hook ---------- */
function winHtml(sec){const r=scoreRepair(sec);
  return `<b>Отремонтировано!</b> Телевизор работает: изображение есть, все напряжения в норме.<div class="score"><span class="stars">${"★".repeat(r.stars)}${"☆".repeat(3-r.stars)}</span> <b>${r.s}</b> очков · время ${Math.floor(sec/60)}:${String(sec%60).padStart(2,"0")} · подсказок ${game.hints}${game.reveal?" + ответ":""} · лишних выпаек ${game.extra||0} · неподходящих деталей ${game.wrong||0}</div>`+
    (SCEN[game.sc].rand?`<div class="dim">Были неисправны: ${SCEN[game.sc].a}</div>`:"")+` <button type="button" id="nextB">Следующая задача</button>`}

/* ---------- init ---------- */
st.lamp=store.get("lamp",false);lampUi();labUi();soundUi();
if(!restoreGame()){}
if(matchMedia("(max-width:720px)").matches){zoom=.5;applyZoom()}

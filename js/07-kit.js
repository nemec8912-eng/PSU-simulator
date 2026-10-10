/* replacement kit */
const ELEC=["C1","C3","C6","C7","C8","C12","C13","C14","C15","C16"];
const FAST=["D1","D3","D4","D5","D6","D7","D9"];
const POWR=["R5","R8","R11","R26","R3","R19","R20"];
function ohm(v){const m=v.match(/([\d,]+)\s*(МОм|кОм|Ом)/);if(!m)return null;return parseFloat(m[1].replace(",","."))*({"Ом":1,"кОм":1e3,"МОм":1e6}[m[2]])}
function fohm(x){const u=x>=1e6?["МОм",1e6]:x>=1e3?["кОм",1e3]:["Ом",1];let n=x/u[1];return (n>=10?Math.round(n):Math.round(n*10)/10).toString().replace(".",",")+" "+u[0]}
function hash(s){let h=0;for(const ch of s)h=(h*31+ch.charCodeAt(0))|0;return Math.abs(h)}
function kitFor(id){
  const v=P[id][1],modes=Object.keys(P[id][4]),m0=modes.includes("drift")?"drift":modes[0],o=[];
  const ok=(l)=>o.push({l,r:"ok",why:"Подходит по всем параметрам: схема снова работает."});
  const add=(l,r,m,s,why)=>o.push({l,r,m,s,why});
  if(id==="F1"){ok("T3,15A 250V (с задержкой)");add("F1A 250V (быстрый)","now","open",0,"Быстрый предохранитель на 1 А сгорает от броска тока заряда C1 в момент включения в розетку.");add("10 А («жучок»)","bug",null,0,"Работает, но не защищает: при КЗ первыми выгорят мост и дорожки платы, а не предохранитель.")}
  else if(id==="TH1"){ok("NTC 5D-11 · 5 Ом");add("NTC 0,5 Ом","later","open",1.5,"Слишком малое сопротивление не ограничивает бросок тока: при включении в розетку обрывается сам термистор.");add("PTC (позистор) 5 Ом","later","open",6,"Позистор от нагрева увеличивает сопротивление, а не уменьшает: под нагрузкой он запирает сеть.")}
  else if(id==="RV1"){ok("10D561K (560 В)");add("10D241K (240 В)","now","short",0,"Варистор на 240 В начинает проводить уже на пике сети 325 В — КЗ и сгоревший F1.");add("20D821K (820 В)","ok2",null,0,"Работает, но защищает хуже: пропустит более сильный скачок.")}
  else if(id==="BD1"){ok("GBU8K · 8 А 800 В");add("GBU8B · 8 А 100 В","now","short",0,"Мост на 100 В пробивается от сетевого пика 325 В — КЗ, F1 сгорает.");add("DB107 · 1 А 1000 В","later","open",8,"Мост на 1 А не выдерживает ток при включённом ТВ: перегревается и обрывается.")}
  else if(id[0]==="Q"&&id.length===2&&["Q2","Q3"].includes(id)){ok(v);add(id==="Q2"?"2SA1015 (PNP вместо NPN)":"2N3904 (NPN вместо PNP)","same","open",0,"Транзистор другой структуры не открывается этим сигналом: ТВ так и не включается.")}
  else if(id[0]==="Q"){ok(v);add(v.replace(/\d+N\d+.*·.*/,"IRF640 · 200 В 18 А"),"now","short",0,"Транзистор на 200 В пробивается сразу: на нём 325–390 В.");add(v.split(" ·")[0]+" с другой цоколёвкой (G-S-D)","same","open",0,"Выводы перепутаны — ключ не открывается, схема не работает.")}
  else if(id.startsWith("IC")){
    if(id==="IC4"||id==="IC5"){ok("TL431 · 2,5 В");add("стабилитрон BZX55C2V4","same","open",0,"Обычный стабилитрон не управляется делителем — обратной связи нет.");add("TL432 (другая цоколёвка)","same","short",0,"Выводы катод и опорный перепутаны — светодиод оптопары горит всегда.")}
    else{ok(v);add(id==="IC2"?"ICE3BR4765J (меньшей мощности)":"похожая микросхема с другой распиновкой",id==="IC2"?"later":"same","dead",id==="IC2"?10:0,id==="IC2"?"Микросхема меньшей мощности перегревается под нагрузкой и выходит из строя.":"Распиновка другая — микросхема не запускается.")}}
  else if(id.startsWith("PC")){ok("PC817");add("MOC3021 (оптосимистор)","same","open",0,"Оптосимистор в цепи постоянного тока не работает как фототранзистор — сигнала ОС нет.")}
  else if(id==="ZD1"){ok("стабилитрон 18 В");add("стабилитрон 5,1 В","same","short",0,"Стабилитрон на 5,1 В «сажает» шину VCC-M — микросхемам не хватает питания.")}
  else if(id[0]==="D"){ok(v);
    if(FAST.includes(id))add("1N4007 (обычный, медленный)","later","short",6,"Медленный диод не успевает закрываться на высокой частоте, сильно греется и пробивается.");
    add(id==="D2"?"1N4148 · 0,15 А":"1N5819 · 40 В",id==="D2"?"later":"now",id==="D2"?"open":"short",3,id==="D2"?"Слаботочный диод сгорает от броска тока заряда C1.":"Диод на 40 В пробивается обратным напряжением.")}
  else if(ELEC.includes(id)){const [cap,rest]=v.split(" мкФ");ok(v);
    add(cap+" мкФ "+(id==="C1"?"200V":"6,3V"),"later","short",4,"Напряжение конденсатора ниже рабочего: он нагревается, вздувается и пробивается.");
    add(fmtC(cap/10)+" мкФ"+rest,"same","dry",0,"Ёмкость в 10 раз меньше — работает как высохший.");
    add(cap+" мкФ, 85°C, обычный (не Low ESR)","later","dry",20,"Обычный конденсатор на высокой частоте греется и быстро высыхает.")}
  else if(id[0]==="C"){ok(v);
    if(["CX1","CX2","CY1","CY2","C2","C5","C11"].includes(id))add(v.split(/ X| Y| \d+V| 1kV| 630V| 450V/)[0]+" на 50 В","later","short",3,"Конденсатор на 50 В не выдерживает высокое напряжение и пробивается.");
    add(cdiv(v),"same",modes.includes("open")?"open":modes[0],0,"Ёмкости не хватает — деталь как будто отсутствует.")}
  else if(id[0]==="R"){const x=ohm(v);ok(v);
    if(x){add(fohm(x*10),"same",m0,0,"Номинал в 10 раз больше — режим цепи нарушен, работает как неисправная.");add(fohm(x/10),"same",m0,0,"Номинал в 10 раз меньше — режим цепи нарушен.")}
    if(POWR.includes(id))add(v.split(" ")[0]+" "+v.split(" ")[1]+" · 0,125 Вт","later","open",10,"Маломощный резистор перегревается и обрывается.")}
  else{ok(v);add(id.startsWith("T")?"трансформатор от другой модели":"дроссель с другой индуктивностью",id==="LP1"?"later":"same",id==="LP1"?"open":modes[0],8,id==="LP1"?"Дроссель с меньшей индуктивностью входит в насыщение: ток через Q1 растёт и ключ пробивается.":"Обмотки не подходят — энергия не передаётся как нужно.")}
  if(id==="LP1"){o[1].r="later";o[1].m=null;o[1].tg="Q1";o[1].tm="short";}
  return o.sort((a,b)=>hash(id+a.l)-hash(id+b.l));
}
function cdiv(v){const m=v.match(/([\d,]+)\s*(мкФ|нФ|пФ)/);if(!m)return "в 100 раз меньше";let pf=parseFloat(m[1].replace(",","."))*({"мкФ":1e6,"нФ":1e3,"пФ":1}[m[2]])/100;const u=pf>=1e6?["мкФ",1e6]:pf>=1e3?["нФ",1e3]:["пФ",1];return fmtC(pf/u[1])+" "+u[0]}
function fmtC(x){return (x>=10?Math.round(x):Math.round(x*10)/10).toString().replace(".",",")}
st.inst={};st.later={};st.bug=false;
function install(id,opt){
  delete st.F[id];delete st.sec[id];delete st.later[id];if(id==="F1"){st.fuse=false;st.bug=false}if(id==="CY2")st.rcd=false;
  Object.keys(st.casc).forEach(k=>{if(k.startsWith(id))delete st.casc[k]});
  st.inst[id]=opt;st.slot[id]={l:opt.l,c:opt.c||catOf(id)};
  if((opt.r==="same"||opt.r==="now")&&opt.m)st.F[id]=opt.m;
  if(opt.r==="later")st.later[id]={t:opt.s,m:opt.m,tg:opt.tg||id,tm:opt.tm||opt.m,msg:opt.why};
  if(opt.r==="bug")st.bug=true;
  log(`На место ${id} установлено: ${opt.l}.`+(opt.r==="ok"||opt.r==="ok2"?"":" Посмотрим, что будет…"),opt.r==="now");
  renderCard();
}

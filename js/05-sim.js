/* simulation */
const st={mains:true,tv:false,F:{},sec:{},fuse:false,rcd:false,surge:null,ovp:false,ovpT:0,bulk:0,a5v:0,vccS:0,vccM:0,v13:0,v24:0,llcEn:false,casc:{},t:0,last:performance.now(),speed:1};
let S={};
const is=(i,m)=>st.F[i]===m, okp=i=>!st.F[i];
const logEl=$("log");
function log(msg,red){const li=document.createElement("li");if(red)li.className="r";const d=new Date();li.innerHTML=`<b>${d.toLocaleTimeString("ru-RU")}</b>`;li.append(msg);logEl.prepend(li);while(logEl.children.length>60)logEl.lastChild.remove()}
const CASC=[
 ["D3","open","sby",6,"IC2","short","Без снаббера выбросы на стоке пробили ключ IC2."],
 ["R11","open","sby",12,"IC2","short","C5 зарядился и перестал гасить выбросы — ключ IC2 пробит."],
 ["C5","open","sby",15,"IC2","short","Выбросы на стоке без конденсатора снаббера пробили IC2."],
 ["D3","short","sby",8,"R11","open","Через пробитый D3 R11 перегрелся и оборвался."],
 ["R4","open","pfc",8,"Q1","short","Затвор Q1 «висел», ключ перегрелся и пробился."],
 ["D1","open","pfc",1.5,"Q1","short","Энергии дросселя некуда было уйти — выброс пробил Q1."],
 ["C11","short","llc",3,"Q4","short","Без резонансного конденсатора ключи перегрузились — Q4 пробит."],
 ["D6","short","llc",.5,"IC3","dead","Через пробитый D6 высокое напряжение попало на IC3 — микросхема сгорела."]
];
function surgeStart(cause,nets,now){st.surge={t0:now,cause,nets};log((game.on&&!game.reveal)?"Хлопок! Короткое замыкание на первичной стороне — ток в десятки ампер.":"Короткое замыкание: "+cause+". Ток в десятки ампер!",true)}
function sim(now,dt){
  const sdt=dt*st.speed;st.t+=sdt;const t=st.t,F=st.F;
  const acV=Math.sin(2*Math.PI*t*.45);
  if(st.mains&&!st.rcd&&is("CY2","short")){st.rcd=true;log("Сработало УЗО в щитке: утечка с N на землю через CY2.",true)}
  const mains=st.mains&&!st.rcd;
  const pre=mains&&okp("F1")&&!st.fuse;
  const afterLF=pre&&okp("LF1");
  const inPath=afterLF&&okp("TH1");
  // immediate shorts
  if(!st.surge&&pre){
    let c=null,nets=["ac0","ac1","n0"];
    if(is("RV1","short"))c="пробит варистор RV1";else if(is("CX1","short"))c="пробит CX1";else if(is("CY1","short"))c="L замкнута на землю через CY1";
    else if(afterLF&&is("CX2","short")){c="пробит CX2";nets.push("ac1b","n2")}
    else if(inPath){nets.push("ac1b","ac2","n2");
      if(is("BD1","short"))c="пробит диодный мост BD1";
      else if(is("C2","short")){c="пробит C2";nets.push("rect")}
      else if(is("C1","short")){c="пробит C1";nets.push("rect","d2","bplus","pfcx")}
      else if(is("Q1","short")){c="пробит ключ PFC Q1";nets.push("rect","pfcx","pfcq","hg")}
      else if(is("IC2","short")){c="пробит ключ внутри IC2";nets.push("rect","d2","bplus","sbysw")}
      else if(st.prevPfc&&is("D1","short")){c="Q1 открылся и замкнул C1 через пробитый D1";nets.push("rect","pfcx","pfcq","bplus")}
      else if(st.prevLlc&&(is("Q4","short")||is("Q5","short"))){c="сквозной ток через ключи LLC Q4 и Q5";nets.push("rect","d2","bplus","mid","hg")}}
    if(c)surgeStart(c,nets,now);
  }
  let surge=!!st.surge,surgeNet={};
  if(surge){st.surge.nets.forEach(n=>surgeNet[n]=1);if(now-st.surge.t0>(st.bug?2600:1400)){st.fuse=true;st.surge=null;surge=false;surgeNet={};
    if(st.bug){st.bug=false;if(!st.F.BD1)st.F.BD1="short";st.sec.BD1="F1";log("«Жучок» на 10 А не сгорел вовремя: выгорели мост BD1 и дорожка на плате, только потом оплавился сам «жучок».",true)}
    else log("Сгорел предохранитель F1. Замените его, но только после устранения причины.",true)}}
  const rectOK=inPath&&!st.fuse&&!is("BD1","open")&&!surge;
  const path=okp("D2")||(okp("LP1")&&!is("D1","open"));
  // ---- standby
  const sbyStart=st.bulk>90&&!F.IC2&&okp("T1")&&!is("C9","short")&&okp("R8");
  const vccBad=!okp("D4")||is("C6","dry")||!okp("R12");
  const secShort=is("D5","short")||is("C7","short")||is("C8","short");
  const fbOV=is("IC4","open")||is("R13","open")||is("R15","open")||is("PC1","open")||is("D5","open")||is("L1","open");
  const fbLow=is("IC4","short")||is("R14","open")||is("PC1","short");
  const hicOn=(now/1000%2)<.3;
  const sbyMode=(!sbyStart||is("C6","short"))?"off":((vccBad||secShort||fbOV)?"hic":(fbLow?"low":"run"));
  const sbyOn=sbyMode==="run"||sbyMode==="low"||(sbyMode==="hic"&&hicOn);
  let v5raw=!sbyOn?0:(secShort?.2:(fbOV?(is("D5","open")?0:8.6):(fbLow?1.5:5.02+(is("C7","dry")?.45*Math.sin(t*23):0))));
  const a5vT=(is("L1","open")||is("C8","short"))?0:v5raw;
  st.a5v+=(a5vT-st.a5v)*(1-Math.exp(-dt/(a5vT<st.a5v?.05:.04)));
  st.vccS+=((sbyOn?16:0)-st.vccS)*(1-Math.exp(-dt/.08));
  const mcu=st.a5v>4.5&&st.a5v<6;
  const pson=st.tv&&mcu;
  // ---- power on
  const q2=is("Q2","short")||(pson&&okp("R16")&&!is("Q2","open"));
  const led3=st.a5v>3.5&&okp("R17")&&!is("PC3","open")&&q2;
  const pt3=is("PC3","short")||led3;
  const q3=is("Q3","short")||(pt3&&okp("R18")&&!is("Q3","open"));
  let vccMT=(q3&&st.vccS>10&&!is("ZD1","short")&&!is("C16","short")&&!is("C3","short")&&!is("C12","short"))?15:0;
  if(vccMT&&is("C16","dry")&&(now%1800)>1100)vccMT=0;
  st.vccM+=(vccMT-st.vccM)*(1-Math.exp(-dt/.06));
  // ---- PFC
  const fbv=okp("R6")&&okp("R7")?(okp("R9")?st.bulk/390*2.5*(is("R6","drift")?.92:1):6):0;
  const pfcIC=st.vccM>10&&!is("IC1","dead")&&!is("C4","short")&&okp("R6")&&okp("R7")&&okp("R9")&&!(is("C3","dry")&&(now%3000)>2000);
  const pfcSw=rectOK&&pfcIC&&okp("R3")&&!is("Q1","open")&&okp("R5")&&okp("LP1");
  const pfcBoost=pfcSw&&!is("D1","open")&&!is("D2","short");
  const pfcPh=sq(t*1.3,.5);const pfcPulse=pfcSw?(pfcPh>0?1:-1):0;
  const llcLoad=st.prevLlc?1:0;
  let bT=(!rectOK||!path)?0:(pfcBoost?(is("R6","drift")?425:390):322);
  if(is("C1","dry")&&llcLoad)bT-=60;
  const charging=rectOK&&!pfcBoost&&Math.abs(acV)>.93&&(sbyOn||llcLoad||st.bulk<300);
  if(surge&&(surgeNet.bplus))bT=0;
  st.bulk+=(bT-st.bulk)*(1-Math.exp(-dt/(bT>st.bulk?.35:(llcLoad?.8:(sbyOn?(rectOK?9:1.2):30)))));
  // ---- LLC
  st.llcEn=st.llcEn?st.bulk>340:st.bulk>365;
  const llcIC=st.vccM>10&&!F.IC3&&okp("R21")&&!(is("C12","dry")&&(now%2500)>1500);
  const s13=is("D7","short")||is("C13","short")||is("C14","short"),s24=is("D9","short")||is("C15","short");
  const ocpOn=(now%2000)<260;
  const llcRun=llcIC&&st.llcEn&&!st.ovp&&(!(s13||s24)||ocpOn)&&!surge;
  const llcDrive=okp("R19")&&okp("R20")&&!is("Q4","open")&&!is("Q5","open")&&okp("D6")&&!F.C10&&!is("C11","open")&&okp("T2");
  const llcOut=llcRun&&llcDrive;
  const sw=llcOut?sq(t*.9,.44):0;
  const fb2OV=is("IC5","open")||is("R23","open")||is("R25","open")||is("PC2","open");
  const fb2Low=is("IC5","short")||is("R24","open")||is("PC2","short");
  let v13T=0,v24T=0;
  if(llcOut&&!(s13||s24)){
    if(is("D7","open")){v13T=0;v24T=30}
    else if(fb2OV){v13T=17.2;v24T=31.5}
    else if(fb2Low){v13T=7;v24T=13}
    else{v13T=13+((is("C13","dry")||is("C14","dry"))?.9*Math.sin(t*17):0);v24T=24+(is("C15","dry")?1.8*Math.sin(t*19):0)}
    if(is("D9","open"))v24T=0;
  }
  st.v13+=(v13T-st.v13)*(1-Math.exp(-dt/(v13T<st.v13?.06:.12)));st.v24+=(v24T-st.v24)*(1-Math.exp(-dt/(v24T<st.v24?.06:.12)));
  if(!st.ovp&&(st.v13>15.5||st.v24>28.5)){st.ovpT+=dt;if(st.ovpT>.45){st.ovp=true;st.ovpT=0;log("Сработала защита от перенапряжения (OVP): LLC выключен до следующего включения.",true)}}else if(!st.ovp)st.ovpT=0;
  // cascades
  const runFlags={sby:sbyOn&&sbyMode!=="hic",pfc:pfcSw,llc:llcRun};
  CASC.forEach(([id,m,cond,sec,tg,tm,msg])=>{const k=id+m;if(is(id,m)&&!st.F[tg]&&runFlags[cond]){st.casc[k]=(st.casc[k]||0)+dt;if(st.casc[k]>sec){st.F[tg]=tm;st.sec[tg]=id;log((game.on&&!game.reveal)?"Щелчок и запах гари — похоже, что-то ещё вышло из строя.":"Вторичная поломка: "+msg,true);renderCard()}}});
  Object.entries(st.later).forEach(([id,L])=>{if(!mains)return;L.t-=dt;if(L.t<=0){delete st.later[id];st.F[L.tg]=L.tm;if(L.tg!==id)st.sec[L.tg]=id;log(`${L.tg} вышел из строя: ${L.msg}`,true);renderCard()}});
  st.prevPfc=pfcSw;st.prevLlc=llcOut;
  const acI=surge?6*Math.sign(acV||1):(pfcBoost?1.5*acV:(charging?2.2*Math.sign(acV):0));
  S={t,acV,acI,mains,pre,afterLF,inPath,rectOK,surge,surgeNet,fuse:st.fuse,bulk:st.bulk,sbyMode,sbyOn,a5v:st.a5v,v5raw,vccS:st.vccS,pson,q2,led3,pt3,q3,vccM:st.vccM,
    pfcIC,pfcSw,pfcBoost,pfcPulse,fbv,llcOut,llcRun,sw,v13:st.v13,v24:st.v24,charging,bridgeOn:(charging||pfcBoost)&&rectOK,d2on:charging&&okp("D2"),
    sbyPulse:sbyOn?sq(t*1.6,.42):0,led1:sbyOn&&!fbOV&&sbyMode!=="off",led2:llcOut&&!fb2OV&&st.v13>5,tvRun:pson&&st.v13>12&&st.v13<14.5&&st.v24>21&&st.a5v>4.5};
}
function nets(){
  const s=S,R=s.surgeNet||{};
  const N=(on,k,f)=>({on:!!on,k,f:on?f:0});
  const n={
   ac0:N(s.mains,"ac",s.acI),ac1:N(s.pre,"ac",s.acI),ac1b:N(s.afterLF,"ac",s.acI),ac2:N(s.inPath,"ac",s.acI),n0:N(s.mains,"ac",s.acI),n2:N(s.inPath,"ac",s.acI),pe:N(0,"ac",0),
   rect:N(s.rectOK||R.rect,"hv",R.rect?5:(s.pfcBoost?1.4:(s.charging?2:0))),
   d2:N(s.bulk>20,"hv",R.d2?5:(s.d2on?2:0)),pfcx:N(s.rectOK||R.pfcx,"hv",R.pfcx?5:(s.pfcBoost?1.3:0)),pfcq:N(s.pfcSw||R.pfcq,"hv",R.pfcq?5:(s.pfcPulse>0?1.6:0)),
   bplus:N(s.bulk>20,"hv",R.bplus?5:((s.sbyOn?.5:0)+(s.llcOut?1.6:0))),hg:N(s.bulk>20,"hv",R.hg?5:0),
   gate1:N(s.pfcSw,"pu",s.pfcPulse>0?1.2:0),cs1:N(s.pfcSw,"pu",0),fb1:N(s.bulk>20,"fb",0),zcd:N(s.pfcSw,"pu",s.pfcPulse<0?.8:0),comp:N(s.pfcIC,"fb",0),
   vccm:N(s.vccM>1,"vcc",s.vccM>10?.5:0),vccs:N(s.vccS>1,"vcc",s.vccS>10?.5:0),vccaux:N(s.sbyOn,"vcc",s.sbyPulse<0?1:0),
   sbysw:N(s.sbyOn||R.sbysw,"hv",R.sbysw?5:(s.sbyPulse>0?1.2:0)),snub:N(s.sbyOn,"hv",s.sbyPulse<0?.6:0),
   sbysec:N(s.v5raw>.1,"lv",s.sbyPulse<0?1.2:0),a5vr:N(s.v5raw>.3,"lv",s.v5raw>.3?.9:0),a5v:N(s.a5v>.3,"lv",s.a5v>.3?.8:0),
   fb2:N(s.sbyOn,"fb",s.led1?.6:0),led1:N(s.led1,"fb",.6),fbs:N(0,"fb",0),
   pson:N(s.pson,"fb",.5),led3:N(s.led3,"fb",.6),q3b:N(s.pt3,"fb",.6),
   mid:N(s.llcOut||R.mid,"hv",R.mid?5:s.sw*1.6),gh:N(s.llcOut,"pu",s.sw>0?1.2:0),gl:N(s.llcOut,"pu",s.sw<0?1.2:0),boot:N(s.llcOut,"vcc",s.sw<0?.8:0),rt:N(s.llcRun,"fb",0),fb3:N(s.llcOut,"fb",s.led2?.6:0),
   t2a:N(s.sw>0,"pu",1.4),t2b:N(s.sw<0,"pu",1.4),t2ct:N(s.sw!==0,"pu",1.4),t24:N(s.sw!==0,"pu",1.2),
   v13:N(s.v13>.5,"lv",.4+(s.tvRun?1:0)),v24:N(s.v24>.5,"lv",.3+(s.tvRun?.8:0)),led2:N(s.led2,"fb",.6),cg:N(0,"lv",0)
  };
  Object.keys(R).forEach(k=>{if(n[k])n[k].red=1});
  return n;
}

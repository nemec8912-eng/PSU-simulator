/* measuring instruments */
var TOOLS={hand:"Рука",dmm:"Мультиметр",esr:"ESR-метр",osc:"Осциллограф",tst:"Тестер деталей"};
const DMODES=[["vdc","V⎓"],["vac","V~"],["ohm","Ω"],["beep","•)))"],["diode","▷|"],["cap","⊣⊢"]];
var ms={tool:"hand",mode:"vdc",id:null,pin:0,trash:null};
/* pins: [label,node] — node voltages vs ground (hot ground on primary, cold on secondary, N for mains parts) */
const PINS={
 F1:[["вход (от вилки)","acIn"],["выход","acF"]],RV1:[["L","acF"],["N","nIn"]],CX1:[["L","acF"],["N","nIn"]],
 R1:[["L","acF"],["середина","acHalf"]],R2:[["середина","acHalf"],["N","nIn"]],LF1:[["вход L","acF"],["выход L","acLF"]],
 CX2:[["L","acLF"],["N","nLF"]],CY1:[["L","acLF"],["PE","pe0"]],CY2:[["N","nLF"],["PE","pe0"]],TH1:[["вход","acLF"],["выход","acT"]],
 BD1:[["+","rect"],["−","hg0"],["~ L","acT"],["~ N","nLF"]],C2:[["+","rect"],["−","hg0"]],LP1:[["вход (от моста)","rect"],["выход (сток Q1)","drain1"]],
 D1:[["анод (сток Q1)","drain1"],["катод (B+)","bplus"]],D2:[["анод (мост)","rect"],["катод (B+)","bplus"]],
 Q1:[["сток D","drain1"],["затвор G","q1g"],["исток S","cs1"]],R3:[["от IC1 (OUT)","gate1"],["к затвору Q1","q1g"]],
 R4:[["затвор Q1","q1g"],["земля","hg0"]],R5:[["исток Q1","cs1"],["земля","hg0"]],C1:[["+","bplus"],["−","hg0"]],
 IC1:[["VCC","vccM"],["COMP","comp"],["ZCD","zcdA"],["OUT","gate1"],["CS","cs1"],["INV","fb1"],["GND","hg0"]],
 C3:[["+","vccM"],["−","hg0"]],C4:[["COMP","comp"],["земля","hg0"]],R10:[["вывод ZCD","zcdA"],["обмотка LP1","zcdB"]],
 R6:[["B+","bplus"],["середина","div1"]],R7:[["середина","div1"],["INV","fb1"]],R9:[["INV","fb1"],["земля","hg0"]],
 IC2:[["D (сток)","sdrain"],["VCC","vccS"],["FB","fb2"],["CS","cs2"],["GND","hg0"]],
 T1:[["B+ (первичка)","bplus"],["сток (первичка)","sdrain"],["вторичка","sec5"],["обм. питания","auxAC"]],
 R11:[["B+","bplus"],["снаббер","snub"]],C5:[["B+","bplus"],["снаббер","snub"]],D3:[["анод (сток)","sdrain"],["катод (снаббер)","snub"]],
 R8:[["CS","cs2"],["земля","hg0"]],C9:[["FB","fb2"],["земля","hg0"]],D4:[["анод (обмотка)","auxAC"],["катод","vccAux"]],
 R12:[["от D4","vccAux"],["VCC IC2","vccS"]],C6:[["+","vccS"],["−","hg0"]],D5:[["анод (обмотка)","sec5"],["катод","v5raw"]],
 C7:[["+","v5raw"],["−","cg0"]],L1:[["вход","v5raw"],["выход A5V","a5v"]],C8:[["+","a5v"],["−","cg0"]],
 R13:[["A5V","a5v"],["делитель","div5"]],R14:[["делитель","div5"],["земля","cg0"]],IC4:[["катод","tl1k"],["анод","cg0"],["опорный","div5"]],
 R15:[["A5V","a5v"],["анод LED PC1","led1a"]],PC1:[["анод LED","led1a"],["катод LED","tl1k"],["коллектор (FB IC2)","fb2"],["эмиттер","hg0"]],
 R16:[["PS-ON","pson"],["база Q2","q2b"]],R17:[["A5V","a5v"],["анод LED PC3","l3a"]],Q2:[["коллектор","q2c"],["база","q2b"],["эмиттер","cg0"]],
 PC3:[["анод LED","l3a"],["катод LED","q2c"],["коллектор","q3b2"],["эмиттер","hg0"]],R18:[["база Q3","q3b"],["коллектор PC3","q3b2"]],
 R22:[["эмиттер Q3","vccS"],["база Q3","q3b"]],Q3:[["эмиттер","vccS"],["база","q3b"],["коллектор (VCC-M)","vccM"]],
 ZD1:[["катод","vccM"],["анод","hg0"]],C16:[["+","vccM"],["−","hg0"]],
 IC3:[["VCC","vccM"],["RT","rt"],["FB","fb3"],["HO","ho"],["VB","vb"],["VS","mid"],["LO","lo"],["GND","hg0"]],
 C12:[["+","vccM"],["−","hg0"]],R21:[["RT","rt"],["земля","hg0"]],PC2:[["анод LED","l2a"],["катод LED","tl2k"],["коллектор (FB IC3)","fb3"],["эмиттер","hg0"]],
 R19:[["HO IC3","ho"],["затвор Q4","gHi"]],R20:[["LO IC3","lo"],["затвор Q5","gLo"]],
 Q4:[["сток (B+)","bplus"],["затвор","gHi"],["исток (середина)","mid"]],Q5:[["сток (середина)","mid"],["затвор","gLo"],["исток","hg0"]],
 D6:[["анод (VCC-M)","vccM"],["катод (VB)","vb"]],C10:[["VB","vb"],["VS (середина)","mid"]],C11:[["середина","mid"],["к обмотке T2","crB"]],
 T2:[["первичка","crB"],["вторичка 13 В","t2a"],["обмотка 24 В","t24"]],
 D7:[["анод (обмотка)","t2a"],["катод (+13 В)","v13"]],C13:[["+","v13"],["−","cg0"]],C14:[["+","v13"],["−","cg0"]],R26:[["+13 В","v13"],["земля","cg0"]],
 D9:[["анод (обмотка)","t24"],["катод (+24 В)","v24"]],C15:[["+","v24"],["−","cg0"]],
 R23:[["+13 В","v13"],["делитель","div13"]],R24:[["делитель","div13"],["земля","cg0"]],IC5:[["катод","tl2k"],["анод","cg0"],["опорный","div13"]],
 R25:[["+13 В","v13"],["анод LED PC2","l2a"]]
};
function NODE(k){
  const s=S,b=s.bulk,on=s.llcOut,sb=s.sbyOn;
  switch(k){
   case"hg0":case"cg0":case"pe0":case"nIn":case"nLF":return[0,0];
   case"acIn":return[0,s.mains?230:0];case"acF":return[0,s.pre?230:0];case"acHalf":return[0,s.pre?115:0];
   case"acLF":return[0,s.afterLF?230:0];case"acT":return[0,s.inPath?230:0];
   case"rect":return[s.rectOK?(s.pfcBoost?207:Math.max(0,b-2)):0,s.rectOK?(s.pfcBoost?96:9):0];
   case"drain1":return[s.pfcSw?(s.pfcBoost?207:120):(s.rectOK?Math.max(0,b-2):0),s.pfcSw?185:0];
   case"bplus":return[b,(is("C1","dry")&&on)?28:(on?4:1)];
   case"gate1":{const g=s.pfcIC&&s.rectOK;return[g?6.1:0,g?5.6:0]}case"q1g":return[okp("R3")&&s.pfcSw?6.1:0,okp("R3")&&s.pfcSw?5.6:0];
   case"cs1":return[s.pfcSw&&okp("R5")?.24:0,0];case"comp":return[s.pfcIC?2.4:0,0];
   case"zcdA":return[okp("R10")&&s.pfcSw?.9:0,0];case"zcdB":return[s.pfcSw?1.1:0,s.pfcSw?14:0];
   case"fb1":return[Math.min(s.fbv,6.2),0];
   case"div1":return[okp("R6")?(okp("R7")&&okp("R9")?b*.336*(is("R6","drift")?.92:1):b):0,0];
   case"vccM":return[s.vccM,is("C16","dry")?2.5:0];case"vccS":return[s.vccS,is("C6","dry")?6:.1];
   case"vccAux":return[sb?17.2:(s.sbyMode==="hic"?3:0),0];case"auxAC":return[0,sb?14:0];
   case"sdrain":return[b,sb?120:0];case"snub":return[b>20?b+(sb?(okp("R11")?70:160):0):0,0];
   case"fb2":return[is("C9","short")?0:(sb?(s.led1?1.4:4.3):0),0];case"cs2":return[sb?.22:0,0];
   case"sec5":return[0,sb?5.6:0];case"v5raw":return[s.v5raw,is("C7","dry")?.45:.01];case"a5v":return[s.a5v,is("C7","dry")?.3:.005];
   case"div5":{const a=s.a5v;return[is("R13","open")?0:(is("R14","open")?a:a/2),0]}
   case"led1a":{const a=s.a5v;return[is("R15","open")?0:(s.led1?a-.35:a),0]}
   case"tl1k":return[s.led1?2:(is("R15","open")?0:s.a5v),0];
   case"pson":return[s.pson?3.3:0,0];
   case"q2b":return[(s.pson&&okp("R16"))?(is("Q2","open")?3.3:.68):0,0];
   case"l3a":return[okp("R17")?(s.led3?s.a5v-.5:s.a5v):0,0];case"q2c":return[s.q2?.12:(okp("R17")?s.a5v:0),0];
   case"q3b":return[s.q3?s.vccS-.7:s.vccS,0];case"q3b2":return[s.pt3?.2:s.vccS,0];
   case"mid":return[on?b/2:0,on?b*.5:0];case"crB":return[0,on?150:0];
   case"ho":return[s.llcGate?b/2+6+(b<30?6:0):0,0];case"lo":return[s.llcGate?6:0,0];
   case"gHi":return[(s.llcGate&&okp("R19"))?b/2+6+(b<30?6:0):0,0];case"gLo":return[(s.llcGate&&okp("R20"))?6:0,0];
   case"vb":return[on?b/2+14:(okp("D6")?Math.max(0,s.vccM-.6):0),0];
   case"rt":return[s.llcIC&&okp("R21")?2:0,0];case"fb3":return[on?(s.led2?1:4.5):0,0];
   case"t2a":return[0,on?14.5:0];case"t24":return[0,on&&okp("D9")?26:0];
   case"v13":return[s.v13,(is("C13","dry")||is("C14","dry"))?.9:.03];case"v24":return[s.v24,is("C15","dry")?1.8:.05];
   case"div13":{const v=s.v13;return[is("R23","open")?0:(is("R24","open")?v:v*9.1/48.1),0]}
   case"l2a":return[is("R25","open")?0:(s.led2?s.v13-1:s.v13),0];case"tl2k":return[s.led2?2.2:(is("R25","open")?0:s.v13),0];
  }
  return[0,0];
}
const ACN=new Set(["acIn","acF","acHalf","acLF","acT","auxAC","sec5","crB","t2a","t24"]);
const SECN=new Set(["cg0","v5raw","a5v","div5","led1a","tl1k","pson","q2b","l3a","q2c","v13","v24","div13","l2a","tl2k","sec5","t2a","t24"]);
const MAINSN=new Set(["acIn","acF","acHalf","acLF","acT","nIn","nLF","pe0"]);

/* physical state of the part actually sitting in a slot (or removed) */
function partPhys(id){
  const sl=st.slot[id];if(sl==="empty")return{empty:true,id};
  const ins=st.inst[id];const cat=(sl&&sl.c)||catOf(id),label=sl?sl.l:P[id][1];
  let mode=st.F[id]||(id==="F1"&&st.fuse?"open":null);if(ins&&ins.r==="same")mode=null;
  return{id,cat,label,mode};
}
function capVal(l){const m=l.match(/([\d,]+)\s*(мкФ|нФ|пФ)/);if(!m)return null;return parseFloat(m[1].replace(",","."))*({"мкФ":1,"нФ":1e-3,"пФ":1e-6}[m[2]])}
function fmtCap(u){return u>=1?fmt(u,u>=100?0:1)+" мкФ":u>=1e-3?fmt(u*1e3,u*1e3>=100?0:1)+" нФ":fmt(u*1e6,0)+" пФ"}
function fmtR(x){return x>=1e6?[fmt(x/1e6,2),"МΩ"]:x>=1e3?[fmt(x/1e3,x>=1e5?0:2),"кΩ"]:[fmt(x,x<10?2:1),"Ω"]}
function windR(id){return {T2:.15,T1:1.2,LP1:.12,LF1:.4,L1:.02}[id]??.3}
function diodeVf(l){if(/SR\d|MBR|STPS|1N5819|Шоттки/.test(l))return .21;if(/GBU|DB1|мост/.test(l))return .55;if(/стабилитрон|TL43/.test(l))return .72;if(/1N4148/.test(l))return .62;if(/1N400|1N540/.test(l))return .58;return .51}
/* passive reading of a physical part (power off) */
function passive(p,tool,mode){
  const {cat,label,mode:f}=p,r=(v,u,n)=>({v,u,n:n||""});
  if(tool==="esr"){
    if(!["C","CP"].includes(cat))return r("—","","ESR-метр проверяет только конденсаторы.");
    if(f==="short")return r("0,00","Ω","Короткое замыкание внутри конденсатора.");
    if(f==="open")return r("OL","","Нет контакта с обкладками — конденсатор оборван.");
    const c=capVal(label)||1;let e=cat==="C"?.03:Math.max(.02,Math.min(2.5,22/Math.pow(c,.85)));if(/85°C|обычный/.test(label))e*=6;if(f==="dry")e=8.5;
    return r(fmt(e,2),"Ω",`Ёмкость ≈ ${fmtCap(c*(f==="dry"?.1:.96))}. `+(f==="dry"?"ESR очень большое — конденсатор высох.":(e>1.2&&cat==="CP"?"ESR выше нормы для такого конденсатора.":"ESR в норме.")));
  }
  if(tool==="tst"){
    if(f==="short")return r("КЗ","","Тестер: «Деталь неисправна или КЗ». Сопротивление между выводами около 0.");
    if(f==="open"||f==="dead")return r("??","","Тестер: «Деталь не обнаружена». Выводы не связаны — деталь оборвана.");
    if(cat==="R"){const x=ohm(label);return x?r(...fmtR(x*1.003),"Тестер: резистор."):r("—","","Не распознано.")}
    if(cat==="C"||cat==="CP"){const c=capVal(label)||0;return r(fmtCap(c*(f==="dry"?.1:.97)).split(" ")[0],fmtCap(c).split(" ")[1],"Тестер: конденсатор"+(f==="dry"?", ёмкость сильно ниже номинала.":"."))}
    if(cat==="D")return r(fmt(diodeVf(label),2),"В","Тестер: диод, прямое падение "+fmt(diodeVf(label),2)+" В, обратно не проводит.");
    if(cat==="Q"){if(/цоколёвк/.test(label))return r("N-E","","Тестер: N-MOSFET, но порядок выводов G-S-D не совпадает с платой.");
      if(/PNP|2SA/.test(label))return r("PNP","","Тестер: PNP-транзистор, hFE 180, Uбэ 0,66 В.");if(/NPN|2N3904/.test(label))return r("NPN","","Тестер: NPN-транзистор, hFE 210, Uбэ 0,67 В.");
      if(/200 В|IRF640/.test(label))return r("N-E","","Тестер: N-MOSFET IRF640. Тестер не видит, что он рассчитан только на 200 В — читайте маркировку!");
      return r("N-E","","Тестер: N-MOSFET (обогащённый), Uпор 3,4 В, Cзатв 2,3 нФ, диод S→D 0,48 В. Исправен.")}
    if(cat==="OPT")return /MOC/.test(label)?r("1,2","В","Тестер видит только светодиод 1,2 В. Вместо транзистора внутри симистор."):r("1,1","В","Тестер: светодиод 1,1 В. Транзистор оптопары тестер не проверяет — нужна проверка в схеме.");
    if(cat==="IC")return /TL43/.test(label)?r("0,7","В","Тестер видит диод 0,7 В между анодом и катодом. TL431 полностью проверяется только в схеме."):r("—","","Микросхему тестер не проверит. Проверяйте напряжения на выводах при включённом блоке.");
    if(cat==="L")return r(...fmtR(windR(p.id)),"Тестер: катушка, сопротивление обмотки.");
    if(cat==="F")return r("0,1","Ω","Тестер: проводник 0,1 Ω — предохранитель цел.");
    if(cat==="TH")return r(/0,5/.test(label)?"0,5":"5,0","Ω","Тестер: резистор"+(/PTC/.test(label)?" (это позистор, его сопротивление растёт при нагреве)":"")+".");
    if(cat==="RV")return r("??","","Варистор тестер не распознаёт: при низком напряжении он не проводит.");
    if(cat==="BD")return r("4×Д","","Тестер: 4 диода по 0,55 В — мост исправен.");
    return r("—","","");
  }
  // multimeter
  if(mode==="vdc"||mode==="vac")return null;
  if(mode==="cap"){if(!["C","CP"].includes(cat))return r("—","","Режим ёмкости — только для конденсаторов.");
    if(f==="short")return r("0,00","мкФ","Прибор показывает КЗ: конденсатор пробит.");if(f==="open")return r("0,00","нФ","Ёмкости нет — обрыв.");
    const c=capVal(label)||0;const v=fmtCap(c*(f==="dry"?.1:.96));return r(v.split(" ")[0],v.split(" ")[1],f==="dry"?"Ёмкость в 10 раз ниже номинала — высох.":"Ёмкость в норме (допуск ±20 %).")}
  if(mode==="diode"){
    if(cat==="D"||cat==="BD"||(cat==="IC"&&/TL43/.test(label))||cat==="OPT"){const vf=cat==="OPT"?1.1:diodeVf(label);
      if(f==="short")return r("0,00","В","Писк в обе стороны — пробит.",[["красный → анод","0,00 В"],["красный → катод","0,00 В"]]);
      if(f==="open"||f==="dead")return r("OL","","Не проводит ни в одну сторону — обрыв.",[["красный → анод","OL"],["красный → катод","OL"]]);
      return r(fmt(vf,2),"В","В прямую сторону падение "+fmt(vf,2)+" В, в обратную — OL. Исправен.",[["красный → анод",fmt(vf,2)+" В"],["красный → катод","OL"]]);}
    if(cat==="Q"){const pnp=/PNP|2SA/.test(label),bjt=pnp||/NPN|2N3904/.test(label);
      if(f==="short")return r("0,00","В","Все выводы звонятся между собой — пробит.",[["любая пара","0,00 В"]]);
      if(f==="open")return r("OL","","Переходы не проводят — обрыв.",[["любая пара","OL"]]);
      if(bjt)return r("0,66","В",pnp?"PNP: чёрный на базе, красный на эмиттер/коллектор — по 0,65 В.":"NPN: красный на базе, чёрный на эмиттер/коллектор — по 0,65 В.",[["база–эмиттер","0,66 В"],["база–коллектор","0,64 В"],["коллектор–эмиттер","OL"]]);
      return r("0,48","В","Встроенный диод исток→сток 0,48 В. Остальные пары — OL.",[["исток → сток","0,48 В"],["сток → исток","OL"],["затвор → исток","OL"]]);}
    return r("—","","Режим диода — для диодов, транзисторов и оптопар.")}
  // ohm / beep
  let x=null,note="";
  if(f==="short")x=0.1;else if(f==="open"||f==="dead")x=Infinity;
  else if(cat==="R"){x=ohm(label);if(f==="drift")x*=2.7;note=" На плате значение может быть меньше из-за параллельных цепей."}
  else if(cat==="F")x=.1;else if(cat==="TH")x=/0,5/.test(label)?.5:4.8;else if(cat==="L")x=windR(p.id);
  else if(cat==="C"||cat==="CP"){x=Infinity;note=" Показания сначала растут — конденсатор заряжается от прибора — затем OL."}
  else x=Infinity;
  if(cat==="IC"&&f!=="short"&&!/TL43/.test(label))return r("—","","Сопротивления между выводами микросхемы мало что скажут. Проверяйте напряжения на выводах при включённом блоке.");
  if(mode==="beep"){const b=x<40;return r(b?fmt(x,1):"OL",b?"Ω":"",b?"🔊 Пищит — цепь замкнута.":"Не пищит — цепи нет.")}
  if(x===Infinity)return r("OL","","Бесконечное сопротивление."+note);
  const [v,u]=fmtR(x);return r(v,u,(f==="short"?"Почти 0 — короткое замыкание.":"")+note);
}
function measure(){
  const id=ms.id;if(!id&&!ms.trash)return null;
  const tool=ms.tool,mode=ms.mode;
  if(ms.trash){const x=ms.trash;const p={id:x.id,cat:x.c||catOf(x.id),label:x.l,mode:x.mode};
    if(tool==="osc"||(tool==="dmm"&&(mode==="vdc"||mode==="vac")))return{v:"—",u:"",n:"Деталь выпаяна и лежит в корзине — напряжения на ней нет. Для этого режима нужна деталь на работающей плате.",where:"в корзине"};
    const r=passive(p,tool,mode);return Object.assign(r,{where:"вне платы"});}
  const p=partPhys(id);
  if(p.empty)return{v:"—",u:"",n:"Место пустое — деталь выпаяна.",where:"на плате"};
  if(tool==="tst")return{v:"—",u:"",n:"Тестер деталей работает только с выпаянной деталью. Перетащите её в корзину и измерьте там.",where:"на плате"};
  const pins=PINS[id]||[];
  if(tool==="osc"||mode==="vdc"||mode==="vac"){
    const ac=mode==="vac"&&tool==="dmm";
    const rows=pins.map(([l,n])=>{const [dc,acv]=NODE(n);return[l,ac?(acv>.05?fmt(acv,acv<10?2:0)+" В~":"0,00 В~"):(ACN.has(n)?"0 В (это переменное — V~)":fmt(dc,dc<10?2:(dc<100?1:0))+" В"),n]});
    if(tool==="osc")return{osc:true,rows,where:"на плате",n:"Щуп осциллографа на выводе «"+(pins[ms.pin]||["—"])[0]+"», земля — на "+(SECN.has((pins[ms.pin]||[])[1])?"холодной":"горячей")+" земле."};
    let v="—",u="";
    if(pins.length>=2){const a=NODE(pins[0][1]),b=NODE(pins[1][1]);
      if(ac){let d=Math.abs((a[1]||0)-(b[1]||0));if(MAINSN.has(pins[0][1])&&MAINSN.has(pins[1][1]))d=Math.abs(a[1]-b[1]);if(p.mode==="short")d=0;v=fmt(d,d<10?2:0);u="В~"}
      else{let d=a[0]-b[0];if(p.mode==="short")d=0;v=fmt(d,Math.abs(d)<10?2:(Math.abs(d)<100?1:0));u="В"}}
    const note=(!S.mains&&S.bulk>30?"Вилка выдернута, но C1 всё ещё заряжен! ":"")+"На табло — напряжение между первыми двумя выводами. Ниже — каждый вывод относительно "+(SECN.has((pins[1]||pins[0]||[])[1])?"холодной":"горячей")+" земли.";
    return{v,u,n:note,rows,where:"на плате"};
  }
  // passive modes in circuit: need power off and discharged
  if(S.mains)return{v:"⚠",u:"",n:"Блок под напряжением! Сопротивление, диоды, ёмкость и ESR меряют только на обесточенной плате. Выньте вилку из розетки.",warn:1,where:"на плате"};
  if(S.bulk>30)return{v:"⚠",u:"",n:`На C1 ещё ${Math.round(S.bulk)} В. Сначала разрядите конденсатор — кнопка «Разрядить C1».`,warn:1,where:"на плате"};
  const r=passive(p,tool,mode);return Object.assign(r,{where:"на плате (обесточена)"});
}
/* oscilloscope waveform for a node */
function wave(n){
  const s=S,b=s.bulk,on=s.llcOut,[dc,ac]=NODE(n);
  const sq=(x,k,d)=>((x*k)%1)<d;
  if(["acIn","acF","acHalf","acLF","acT"].includes(n))return{lo:-400,hi:400,u:"В",tb:"5 мс/дел",f:x=>ac*1.414*Math.sin(2*Math.PI*x*2)};
  if(n==="rect")return{lo:0,hi:400,u:"В",tb:"5 мс/дел",f:x=>s.rectOK?(s.pfcBoost?325*Math.abs(Math.sin(2*Math.PI*x*2)):Math.max(dc-9,325*Math.abs(Math.sin(2*Math.PI*x*2)))):0};
  if(n==="drain1")return{lo:0,hi:450,u:"В",tb:"5 мкс/дел",f:x=>s.pfcSw?(sq(x,6,.5)?2:(s.pfcBoost?392:330)):dc};
  if(n==="gate1"||n==="q1g")return{lo:0,hi:15,u:"В",tb:"5 мкс/дел",f:x=>dc>0?(sq(x,6,.5)?12:0):0};
  if(n==="cs1")return{lo:0,hi:.6,u:"В",tb:"5 мкс/дел",f:x=>dc>0&&sq(x,6,.5)?((x*6)%1)*.9:0};
  if(n==="sdrain")return{lo:0,hi:600,u:"В",tb:"5 мкс/дел",f:x=>s.sbyOn?(sq(x,5,.4)?3:b+95+40*Math.exp(-((x*5)%1-.4)*12)*Math.sin(((x*5)%1)*80)):b};
  if(n==="auxAC"||n==="sec5")return{lo:-30,hi:30,u:"В",tb:"5 мкс/дел",f:x=>s.sbyOn?(sq(x,5,.4)?-ac*.8:ac*1.3):0};
  if(n==="mid")return{lo:0,hi:420,u:"В",tb:"5 мкс/дел",f:x=>on?(sq(x,4,.5)?b:0):0};
  if(n==="ho"||n==="gHi")return{lo:0,hi:420,u:"В",tb:"5 мкс/дел",f:x=>dc>0?(sq(x,4,.47)?b+12:0):0};
  if(n==="lo"||n==="gLo")return{lo:0,hi:15,u:"В",tb:"5 мкс/дел",f:x=>dc>0?(!sq(x,4,.53)&&((x*4)%1)>.53?12:0):0};
  if(n==="crB")return{lo:-250,hi:250,u:"В",tb:"5 мкс/дел",f:x=>on?150*Math.sin(2*Math.PI*x*4):0};
  if(n==="t2a"||n==="t24")return{lo:-40,hi:40,u:"В",tb:"5 мкс/дел",f:x=>ac>0?(sq(x,4,.5)?ac*1.1:-ac*1.1):0};
  const rip=ac,top=Math.max(1,dc*1.4+rip*3);
  return{lo:0,hi:top,u:"В",tb:rip>.2?"2 мс/дел":"1 мс/дел",f:x=>dc+rip*Math.sin(2*Math.PI*x*(rip>.2?5:12))};
}
/* probes on the schematic */
const probeG=el("g",{},svg);
function probePts(id){
  const arr=parts[id];if(!arr)return null;const pid=PANEL_OF[id];const [cx,cy]=PAN[pid];const ox=GX+cx*(PW+GX),oy=GY+cy*(PH+GY);
  const c=(arr.find(p=>p.c.a||p.c.d||p.c.pins||p.c.c&&p.c.t!=="CORE")||arr[0]).c;
  let A,B;
  if(c.a){A=c.a;B=c.b}else if(c.d){A=c.s;B=c.d}else if(c.t==="BJT"){A=c.b;B=c.e}else if(c.t==="PT"){A=[c.c[0]+8,c.c[1]-17];B=[c.c[0]+8,c.c[1]+17]}
  else if(c.t==="BR"){A=[c.c[0]+c.r,c.c[1]];B=[c.c[0]-c.r,c.c[1]]}else if(c.pins){A=c.pins[ms.pin%c.pins.length]||c.pins[0];const g=c.pins.find(p=>p[2]==="GND")||c.pins[c.pins.length-1];B=g}
  else return null;
  if(ms.tool==="osc"||(ms.tool==="dmm"&&ms.mode==="vdc"&&c.a&&ms.pin===1)){if(c.a&&ms.pin===1){const t=A;A=B;B=t}}
  return[[A[0]+ox,A[1]+oy],[B[0]+ox,B[1]+oy]];
}
function drawProbes(){
  probeG.innerHTML="";if(!ms.id||ms.tool==="hand"||ms.tool==="tst"||ms.tool==="thermo")return;const pp=probePts(ms.id);if(!pp)return;
  const one=(p,col,dx,lab)=>{const g=el("g",{},probeG);el("circle",{cx:p[0],cy:p[1],r:7,class:"pring",style:`stroke:${col}`},g);
    el("line",{x1:p[0],y1:p[1],x2:p[0]+dx,y2:p[1]-34,style:`stroke:${col};stroke-width:7;stroke-linecap:round`},g);
    el("line",{x1:p[0],y1:p[1],x2:p[0]+dx*.25,y2:p[1]-8.5,style:`stroke:${col};stroke-width:2.2`},g);el("circle",{cx:p[0],cy:p[1],r:3,style:`fill:${col}`},g);
    const t=el("text",{x:p[0]+dx*1.15,y:p[1]-39,"text-anchor":"middle",class:"dyn",style:`fill:${col}`},g);t.textContent=lab};
  one(pp[0],"var(--probe-r)",-18,ms.tool==="osc"?"щуп":"+");
  if(ms.tool!=="osc")one(pp[1],"var(--probe-b)",18,"COM");
}
/* UI */
function setTool(t){ms.tool=t;document.body.classList.toggle("tool-on",t!=="hand");
  document.querySelectorAll("#tools button[data-t]").forEach(b=>b.setAttribute("aria-pressed",b.dataset.t===t));
  $("dmodes").hidden=t!=="dmm";if(t==="hand"){ms.id=null;ms.trash=null}renderMeter();drawProbes();renderTrash()}
function setDMode(m){ms.mode=m;document.querySelectorAll("#dmodes button").forEach(b=>b.setAttribute("aria-pressed",b.dataset.m===m));renderMeter();drawProbes()}
function measureAt(id){ms.id=id;ms.trash=null;ms.pin=0;renderMeter();drawProbes();
  if(game.on)log(`${TOOLS[ms.tool]}${ms.tool==="dmm"?" ("+DMODES.find(d=>d[0]===ms.mode)[1]+")":""}: щупы на ${id}.`)}
function measureTrash(i){ms.trash=st.trash[i];ms.id=null;renderMeter();drawProbes()}
let oscCtx=null;
function renderMeter(){
  const box=$("meter");if(ms.tool==="hand"){box.hidden=true;return}box.hidden=false;
  const r=measure();
  $("mTool").textContent=TOOLS[ms.tool]+(ms.tool==="dmm"?" · "+DMODES.find(d=>d[0]===ms.mode)[1]:"");
  const tgt=ms.trash?ms.trash.id+" (из корзины)":(ms.id?ms.id+" — "+P[ms.id][0]:"");
  $("mTgt").textContent=tgt||"Наведите прибор на деталь на схеме и нажмите";
  const lcd=$("mLcd"),osc=$("mOsc");
  if(!r){lcd.hidden=false;osc.hidden=true;$("mV").textContent="- - -";$("mU").textContent="";$("mN").textContent="";$("mRows").innerHTML="";return}
  if(r.osc){lcd.hidden=true;osc.hidden=false;drawOsc()}else{lcd.hidden=false;osc.hidden=true;$("mV").textContent=r.v;$("mU").textContent=r.u}
  lcd.classList.toggle("warn",!!r.warn);
  $("mN").textContent=r.n||"";
  const rows=r.rows||[];
  $("mRows").innerHTML=rows.map((x,i)=>`<li${(r.osc||ms.mode==="vdc"||ms.mode==="vac")&&i===ms.pin?' class="on"':""}>${r.osc||ms.mode==="vdc"||ms.mode==="vac"?`<button type="button" data-p="${i}">`:"<span>"}<span>${x[0]}</span><b>${x[1]}</b>${r.osc||ms.mode==="vdc"||ms.mode==="vac"?"</button>":"</span>"}</li>`).join("");
  $("mRows").querySelectorAll("[data-p]").forEach(b=>b.addEventListener("click",()=>{ms.pin=+b.dataset.p;renderMeter();drawProbes()}));
}
function drawOsc(){
  const cv=$("oscC"),d=devicePixelRatio||1,w=cv.clientWidth,h=cv.clientHeight;if(!w)return;
  if(cv.width!==Math.round(w*d)){cv.width=Math.round(w*d);cv.height=Math.round(h*d)}
  const g=cv.getContext("2d");g.setTransform(d,0,0,d,0,0);g.clearRect(0,0,w,h);
  g.fillStyle="#0b1a12";g.fillRect(0,0,w,h);g.strokeStyle="#1f4a33";g.lineWidth=1;
  for(let i=1;i<10;i++){g.beginPath();g.moveTo(w*i/10,0);g.lineTo(w*i/10,h);g.stroke()}for(let i=1;i<8;i++){g.beginPath();g.moveTo(0,h*i/8);g.lineTo(w,h*i/8);g.stroke()}
  const pins=PINS[ms.id]||[];const n=(pins[ms.pin]||[])[1];if(!n)return;const W=wave(n),Y=v=>h-6-(h-12)*(v-W.lo)/(W.hi-W.lo);
  if(W.lo<0){g.strokeStyle="#2f6b4c";g.beginPath();g.moveTo(0,Y(0));g.lineTo(w,Y(0));g.stroke()}
  g.strokeStyle="#5df2a0";g.lineWidth=2;g.beginPath();const ph=(performance.now()/4000)%1;
  for(let k=0;k<=w;k++){const v=W.f(k/w+ph*.0);k?g.lineTo(k,Y(v)):g.moveTo(k,Y(v))}g.stroke();
  g.fillStyle="#9ff5c6";g.font="11px "+getComputedStyle(document.documentElement).getPropertyValue("--f-mono");
  g.fillText(`${fmt(W.hi,W.hi<10?1:0)} ${W.u}`,4,12);g.fillText(`${fmt(W.lo,W.lo>-10&&W.lo<10?1:0)} ${W.u}`,4,h-4);g.textAlign="right";g.fillText(W.tb,w-4,12);g.textAlign="left";
}
$("tools").querySelectorAll("button[data-t]").forEach(b=>b.addEventListener("click",()=>setTool(b.dataset.t)));
$("dmodes").querySelectorAll("button").forEach(b=>b.addEventListener("click",()=>setDMode(b.dataset.m)));
$("discharge").addEventListener("click",()=>{if(S.mains){toast("Сначала выньте вилку из розетки.");return}if(S.bulk<5){toast("C1 уже разряжен.");return}
  st.bulk=0;log("C1 разряжен через резистор 10 кОм 5 Вт. Теперь можно мерить сопротивление и диоды.");renderMeter()});
setInterval(()=>{if(ms.tool!=="hand"&&(ms.id||ms.trash))renderMeter()},250);

(function(){
  const D=window.FA23GradientTrenArribaData;
  const W=633,H=783;
  const SCALES={
    tof:{x1:10.5,x2:340.5,value1:2,value2:10,y:252},
    roc:{x1:388,x2:622,value1:100,value2:3000,y:252},
    tailwind:{x1:176,value1:40,x2:340,value2:0,y:773},
    gradient:{x:177,y1:744,value1:0,y2:356,value2:25},
    ftNm:{x:96,y1:744,value1:0,y2:387,value2:1400}
  };
  const lerp=(a,b,t)=>a+(b-a)*t;
  const scaleX=(s,v)=>s.x1+(v-s.value1)*(s.x2-s.x1)/(s.value2-s.value1);
  const valueX=(s,x)=>s.value1+(x-s.x1)*(s.value2-s.value1)/(s.x2-s.x1);
  const valueY=(s,y)=>s.value1+(y-s.y1)*(s.value2-s.value1)/(s.y2-s.y1);
  function yAtX(points,x,tol=4){if(!points||points.length<2)return null;for(let i=0;i<points.length-1;i++){const a=points[i],b=points[i+1],min=Math.min(a.xPixel,b.xPixel)-tol,max=Math.max(a.xPixel,b.xPixel)+tol;if(x>=min&&x<=max&&Math.abs(b.xPixel-a.xPixel)>1e-9){return lerp(a.yPixel,b.yPixel,(x-a.xPixel)/(b.xPixel-a.xPixel));}}return null;}
  function xAtY(points,y,tol=4){if(!points||points.length<2)return null;for(let i=0;i<points.length-1;i++){const a=points[i],b=points[i+1],min=Math.min(a.yPixel,b.yPixel)-tol,max=Math.max(a.yPixel,b.yPixel)+tol;if(y>=min&&y<=max&&Math.abs(b.yPixel-a.yPixel)>1e-9){return lerp(a.xPixel,b.xPixel,(y-a.yPixel)/(b.yPixel-a.yPixel));}}return null;}
  function bracketNumeric(keys,v){const nums=keys.map(Number).sort((a,b)=>a-b);if(v<nums[0]||v>nums[nums.length-1])return null;for(let i=0;i<nums.length-1;i++){if(v>=nums[i]&&v<=nums[i+1]){const lo=nums[i],hi=nums[i+1];return{lo,hi,t:hi===lo?0:(v-lo)/(hi-lo)};}}return{lo:nums[nums.length-1],hi:nums[nums.length-1],t:0};}
  function fail(message){return{valid:false,message};}
  function calculateFA23GradientTrenArriba(input){
    const tof=Number(input.takeoffFactor??input.tof),pa=Number(input.pressureAltitude??input.pa),gw=Number(input.grossWeight??input.gw),tailwind=Number(input.tailwind);
    if(!Number.isFinite(tof)||tof<2||tof>10)return fail('Takeoff Factor fuera de 2–10.');
    if(!Number.isFinite(pa)||pa<0||pa>8000)return fail('Pressure Altitude fuera de 0–8000 ft.');
    if(!Number.isFinite(gw)||gw<10000||gw>20000)return fail('Gross Weight fuera de 10.000–20.000 lb.');
    if(!Number.isFinite(tailwind)||tailwind<0||tailwind>40)return fail('Tailwind fuera de 0–40 kt.');
    const xTOF=scaleX(SCALES.tof,tof),yTOFAxis=SCALES.tof.y;
    const paLevels=Object.keys(D.elements.pressureAltitude).map(key=>({key,value:key==='SL'?0:Number(key)})).filter(x=>Number.isFinite(x.value)).sort((a,b)=>a.value-b.value);
    const paBracket=bracketNumeric(paLevels.map(x=>x.value),pa); if(!paBracket)return fail('Pressure Altitude fuera de las curvas digitalizadas.');
    const lo=paLevels.find(x=>x.value===paBracket.lo).key,hi=paLevels.find(x=>x.value===paBracket.hi).key;
    const yLo=yAtX(D.elements.pressureAltitude[lo],xTOF,4),yHi=yAtX(D.elements.pressureAltitude[hi],xTOF,4);
    if(yLo===null||yHi===null)return fail('El TOF no intersecta las curvas de Pressure Altitude necesarias.');
    const yPA=paBracket.lo===paBracket.hi?yLo:lerp(yLo,yHi,paBracket.t);
    const gwBracket=bracketNumeric(Object.keys(D.elements.grossWeight),gw);if(!gwBracket)return fail('Gross Weight fuera de las curvas digitalizadas.');
    const xGWLo=xAtY(D.elements.grossWeight[String(gwBracket.lo)],yPA,3),xGWHi=xAtY(D.elements.grossWeight[String(gwBracket.hi)],yPA,3);
    if(xGWLo===null||xGWHi===null)return fail('La horizontal de PA no intersecta las curvas de Gross Weight necesarias.');
    const xGW=gwBracket.lo===gwBracket.hi?xGWLo:lerp(xGWLo,xGWHi,gwBracket.t),roc=valueX(SCALES.roc,xGW);
    if(roc<100||roc>3000)return fail('El punto obtenido queda fuera de la escala de Rate of Climb.');
    const yReference=yAtX(D.elements.referenceCurve,xGW,4);if(yReference===null)return fail('El descenso vertical no alcanza la Reference Curve digitalizada.');
    const baselineX=(D.elements.baseline[0].xPixel+D.elements.baseline[1].xPixel)/2;
    const guidelineEntries=Object.keys(D.elements.guidelines).map(Number).sort((a,b)=>a-b).map(n=>({n,line:D.elements.guidelines[String(n)],yBase:yAtX(D.elements.guidelines[String(n)],baselineX,8)})).filter(g=>g.yBase!==null);
    if(guidelineEntries.length<2)return fail('No hay suficientes guidelines digitalizadas para interpolar.');
    let gA=null,gB=null,gT=0;
let guidelineExtrapolated=false;

for(let i=0;i<guidelineEntries.length-1;i++){
  const a=guidelineEntries[i],
        b=guidelineEntries[i+1],
        min=Math.min(a.yBase,b.yBase),
        max=Math.max(a.yBase,b.yBase);

  if(yReference>=min-1e-6&&yReference<=max+1e-6){
    gA=a;
    gB=b;
    gT=(yReference-a.yBase)/(b.yBase-a.yBase);
    break;
  }
}

/* 
   Si el punto queda por debajo de la última guideline,
   continuamos la tendencia usando las guidelines 8 → 9.
*/
if(!gA){

  const first=guidelineEntries[0];
  const last=guidelineEntries[guidelineEntries.length-1];

  // Cerca de la primera guideline
  if(Math.abs(yReference-first.yBase)<1){

    gA=first;
    gB=first;
    gT=0;

  }
  // Cerca de la última guideline
  else if(Math.abs(yReference-last.yBase)<1){

    gA=last;
    gB=last;
    gT=0;

  }
  // Por debajo de la última guideline:
  // extrapolamos siguiendo la tendencia de 8 → 9
  else if(yReference > last.yBase){

    gA=guidelineEntries[guidelineEntries.length-2];
    gB=guidelineEntries[guidelineEntries.length-1];

    gT=(yReference-gA.yBase)/
       (gB.yBase-gA.yBase);

    guidelineExtrapolated=true;

  }
  else{

    return fail(
      'La intersección con la Baseline queda fuera del rango de las guidelines.'
    );

  }
}
    const xTail=scaleX(SCALES.tailwind,tailwind),yA=yAtX(gA.line,xTail,3),yB=yAtX(gB.line,xTail,3);if(yA===null||yB===null)return fail('El Tailwind queda fuera del tramo de las guidelines necesarias.');
    const yTail=gA===gB?yA:lerp(yA,yB,gT),gradient=valueY(SCALES.gradient,yTail),ftNm=valueY(SCALES.ftNm,yTail);
    return {valid:true,inputs:{takeoffFactor:tof,pressureAltitude:pa,grossWeight:gw,tailwind},result:{rateOfClimb:roc,gradientPercent:gradient,gradientFtNm:ftNm},interpolation:{pressureAltitude:{lower:paBracket.lo,upper:paBracket.hi,fraction:paBracket.t},grossWeight:{lower:gwBracket.lo,upper:gwBracket.hi,fraction:gwBracket.t},guideline:{lower:gA.n,upper:gB.n,fraction:gT,extrapolated:guidelineExtrapolated}},path:{tofAxis:{x:xTOF,y:yTOFAxis},tof:{x:xTOF,y:yPA},paLower:{x:xTOF,y:yLo},paUpper:{x:xTOF,y:yHi},gw:{x:xGW,y:yPA},roc:{x:xGW,y:SCALES.roc.y},reference:{x:xGW,y:yReference},baseline:{x:baselineX,y:yReference},guidelineBase:{x:baselineX,y:yReference},guidelineLowerBase:{x:baselineX,y:gA.yBase},guidelineUpperBase:{x:baselineX,y:gB.yBase},guidelineTail:{x:xTail,y:yTail},gradient:{x:SCALES.gradient.x,y:yTail},ftNm:{x:SCALES.ftNm.x,y:yTail}},guideline:{lower:gA.n,upper:gB.n,fraction:gT}};
  }
  window.calculateFA23GradientTrenArriba=calculateFA23GradientTrenArriba;
  window.FA23GradientTrenArribaEngine={calculateFA23GradientTrenArriba};
})();

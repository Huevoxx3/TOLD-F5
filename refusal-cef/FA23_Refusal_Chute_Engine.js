
(function(){
"use strict";
const EPS=0.75;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const lerp=(a,b,t)=>a+(b-a)*t;

function lineY(a,b,x){
  const dx=b.xPixel-a.xPixel;
  return Math.abs(dx)<1e-12 ? (a.yPixel+b.yPixel)/2 :
    a.yPixel+(b.yPixel-a.yPixel)*(x-a.xPixel)/dx;
}
function lineX(a,b,y){
  const dy=b.yPixel-a.yPixel;
  return Math.abs(dy)<1e-12 ? (a.xPixel+b.xPixel)/2 :
    a.xPixel+(b.xPixel-a.xPixel)*(y-a.yPixel)/dy;
}
function yAtX(points,x){
  if(!points || points.length<2)return null;
  const p=[...points].sort((a,b)=>a.xPixel-b.xPixel);
  for(let i=0;i<p.length-1;i++){
    if(x>=p[i].xPixel-EPS && x<=p[i+1].xPixel+EPS)
      return lineY(p[i],p[i+1],x);
  }
  if(x>=p[0].xPixel-EPS*4 && x<p[0].xPixel)return lineY(p[0],p[1],x);
  if(x<=p[p.length-1].xPixel+EPS*4 && x>p[p.length-1].xPixel)
    return lineY(p[p.length-2],p[p.length-1],x);
  return null;
}
function xAtY(points,y){
  if(!points || points.length<2)return null;
  const p=[...points].sort((a,b)=>a.yPixel-b.yPixel);
  for(let i=0;i<p.length-1;i++){
    if(y>=p[i].yPixel-EPS && y<=p[i+1].yPixel+EPS)
      return lineX(p[i],p[i+1],y);
  }
  if(y>=p[0].yPixel-EPS*4 && y<p[0].yPixel)return lineX(p[0],p[1],y);
  if(y<=p[p.length-1].yPixel+EPS*4 && y>p[p.length-1].yPixel)
    return lineX(p[p.length-2],p[p.length-1],y);
  return null;
}
function xScale(points,a,b,v){
  return points[0].xPixel+(v-a)*(points[1].xPixel-points[0].xPixel)/(b-a);
}
function valueScale(points,a,b,x){
  return a+(x-points[0].xPixel)*(b-a)/(points[1].xPixel-points[0].xPixel);
}
function yScale(points,a,b,v){
  return points[0].yPixel+(v-a)*(points[1].yPixel-points[0].yPixel)/(b-a);
}
function bracket(v,values){
  if(v<=values[0])return [values[0],values[0],0];
  if(v>=values.at(-1))return [values.at(-1),values.at(-1),0];
  for(let i=0;i<values.length-1;i++){
    if(v>=values[i] && v<=values[i+1])
      return [values[i],values[i+1],(v-values[i])/(values[i+1]-values[i])];
  }
  return [values[0],values[0],0];
}
function interpolatedGWY(data,gw,x){
  const fam=data.elements.grossWeight;
  const k=Object.keys(fam).map(Number).sort((a,b)=>a-b);
  const [lo,hi,t]=bracket(gw,k);
  const y1=yAtX(fam[String(lo)],x), y2=yAtX(fam[String(hi)],x);
  return y1==null||y2==null?null:lerp(y1,y2,t);
}
function interpolatedCFLX(data,cfl,y){
  const fam=data.elements.rwyCfl;
  const k=Object.keys(fam).map(Number).sort((a,b)=>a-b);
  const [lo,hi,t]=bracket(cfl,k);
  const x1=xAtY(fam[String(lo)],y), x2=xAtY(fam[String(hi)],y);
  return x1==null||x2==null?null:lerp(x1,x2,t);
}
function baselineX(curve,baseline){
  if(!curve || curve.length<2)return null;
  return xAtY(curve,(baseline[0].yPixel+baseline[1].yPixel)/2);
}
function interpolatedRefX(family,baseline,xBase,yTarget){
  const refs=[];
  for(const [key,curve] of Object.entries(family)){
    if(!curve || curve.length<2)continue; // ignore un-digitalized curve
    const x=baselineX(curve,baseline);
    const targetX=xAtY(curve,yTarget);
    if(x!=null)refs.push({key:Number(key),x,targetX});
  }
  refs.sort((a,b)=>a.x-b.x);

  for(let i=0;i<refs.length-1;i++){
    const a=refs[i],b=refs[i+1];
    if(xBase>=a.x-EPS && xBase<=b.x+EPS &&
       a.targetX!=null && b.targetX!=null){
      const t=clamp((xBase-a.x)/(b.x-a.x),0,1);
      return lerp(a.targetX,b.targetX,t);
    }
  }
  const valid=refs.filter(r=>r.targetX!=null);
  if(!valid.length)return null;
  valid.sort((a,b)=>Math.abs(a.x-xBase)-Math.abs(b.x-xBase));
  return valid[0].targetX;
}

function calculate(data,input){
  const tof=Number(input.tof), grossWeight=Number(input.grossWeight);
  const cflFt=Number(input.cflFt), runwayLengthFt=Number(input.runwayLengthFt);
  const rcr=Number(input.rcr);

  if(!Number.isFinite(tof)||tof<1||tof>10)return {valid:false,message:"TOF fuera del rango 1–10."};
  if(!Number.isFinite(grossWeight)||grossWeight<12000||grossWeight>24000)return {valid:false,message:"Gross Weight fuera del rango 12.000–24.000 lb."};
  if(!Number.isFinite(cflFt)||cflFt<4000||cflFt>14000)return {valid:false,message:"CFL fuera del rango 4.000–14.000 ft."};
  if(!Number.isFinite(runwayLengthFt)||runwayLengthFt<4000||runwayLengthFt>14000)return {valid:false,message:"Longitud de pista fuera del rango 4.000–14.000 ft."};
  if(!Number.isFinite(rcr)||rcr<0||rcr>23)return {valid:false,message:"RCR fuera del rango 0–23."};

  const xTOF=xScale(data.elements.tof,1,10,tof);
  const yGW=interpolatedGWY(data,grossWeight,xTOF);
  if(yGW==null)return {valid:false,message:"No se pudo interceptar Gross Weight con el TOF."};

  const xCFL=interpolatedCFLX(data,cflFt,yGW);
  const xRunway=interpolatedCFLX(data,runwayLengthFt,yGW);
  if(xCFL==null)return {valid:false,message:"No se pudo interceptar RWY CFL."};

  // Si la longitud de pista no intercepta la familia superior,
  // la Refusal Speed queda fuera de la escala 90–180 KIAS.
  const refusalBeyond180 = xRunway==null;

  const yR1=yScale(data.elements.rcr1,0,23,rcr);
  let xRef1=null;
  if(!refusalBeyond180){
    xRef1=rcr>=23 ? xRunway :
      interpolatedRefX(data.elements.refusalCurves,data.elements.baseline1,xRunway,yR1);
    if(xRef1==null)return {valid:false,message:"No se pudo interpolar la referencia superior."};
  } else {
    // Marcamos el extremo de 180 KIAS como referencia visual.
    xRef1=data.elements.refusalSpeed[1].xPixel;
  }

  const yR2=yScale(data.elements.rcr2,0,23,rcr);
  const xRef2=rcr>=23 ? xCFL :
    interpolatedRefX(data.elements.cefCurves,data.elements.baseline2,xCFL,yR2);
  if(xRef2==null)return {valid:false,message:"No se pudo interpolar la referencia inferior."};

  const refusalRaw=refusalBeyond180 ? null :
    valueScale(data.elements.refusalSpeed,90,180,xRef1);
  const cefRaw=valueScale(data.elements.criticalEngineFailureSpeed,90,180,xRef2);

  const refusalDisplay=refusalBeyond180 ? ">180" :
    (refusalRaw>180 ? ">180" : refusalRaw<90 ? "<90" : refusalRaw.toFixed(1));
  const cefDisplay=cefRaw>180 ? ">180" : cefRaw<90 ? "<90" : cefRaw.toFixed(1);

  const yTOF=(data.elements.tof[0].yPixel+data.elements.tof[1].yPixel)/2;
  const refusalPath=[];
  if(!refusalBeyond180){
    refusalPath.push({x:xTOF,y:yTOF},{x:xTOF,y:yGW},{x:xRunway,y:yGW});
    if(rcr<23){
      refusalPath.push({x:xRunway,y:yScale(data.elements.rcr1,0,23,rcr)});
      refusalPath.push({x:xRef1,y:yScale(data.elements.rcr1,0,23,rcr)});
    }
    refusalPath.push({x:xRef1,y:(data.elements.refusalSpeed[0].yPixel+data.elements.refusalSpeed[1].yPixel)/2});
  } else {
    // El recorrido llega al borde de 180 KIAS y queda indicado como >180.
    refusalPath.push(
      {x:xTOF,y:yTOF},
      {x:xTOF,y:yGW},
      {x:data.elements.refusalSpeed[1].xPixel,y:yGW},
      {x:data.elements.refusalSpeed[1].xPixel,y:(data.elements.refusalSpeed[0].yPixel+data.elements.refusalSpeed[1].yPixel)/2}
    );
  }

  const cefPath=[
    {x:xTOF,y:yTOF},{x:xTOF,y:yGW},{x:xCFL,y:yGW}
  ];
  if(rcr<23){
    cefPath.push({x:xCFL,y:yScale(data.elements.rcr2,0,23,rcr)});
    cefPath.push({x:xRef2,y:yScale(data.elements.rcr2,0,23,rcr)});
  }
  cefPath.push({x:xRef2,y:(data.elements.criticalEngineFailureSpeed[0].yPixel+data.elements.criticalEngineFailureSpeed[1].yPixel)/2});

  return {
    valid:true,
    inputs:{tof,grossWeight,cflFt,runwayLengthFt,rcr},
    result:{
      refusalSpeed:refusalRaw, criticalEngineFailureSpeed:cefRaw,
      refusalDisplay, cefDisplay,
      refusalOver180:refusalBeyond180 || (refusalRaw!=null && refusalRaw>180),
      cefOver180:cefRaw>180
    },
    points:{tof:{x:xTOF,y:yTOF},grossWeight:{x:xTOF,y:yGW},
      rwyCfl:{x:xCFL,y:yGW},runway:{x:xRunway,y:yGW},
      refusalSpeed:{x:xRef1,y:refusalPath.at(-1).y},
      cefSpeed:{x:xRef2,y:cefPath.at(-1).y}},
    refusalPath,cefPath
  };
}
window.FA23RefusalChute={calculate};
})();

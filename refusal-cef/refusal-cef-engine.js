(function(){
"use strict";
const EPS=0.75;
const lerp=(a,b,t)=>a+(b-a)*t;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));

function lineY(a,b,x){const dx=b.xPixel-a.xPixel;return Math.abs(dx)<1e-12?(a.yPixel+b.yPixel)/2:a.yPixel+(b.yPixel-a.yPixel)*(x-a.xPixel)/dx;}
function lineX(a,b,y){const dy=b.yPixel-a.yPixel;return Math.abs(dy)<1e-12?(a.xPixel+b.xPixel)/2:a.xPixel+(b.xPixel-a.xPixel)*(y-a.yPixel)/dy;}

function yAtXMeta(points,x){
 if(!points||points.length<2)return null;
 const p=[...points].sort((a,b)=>a.xPixel-b.xPixel);
 for(let i=0;i<p.length-1;i++) if(x>=p[i].xPixel-EPS&&x<=p[i+1].xPixel+EPS) return {value:lineY(p[i],p[i+1],x),extrapolated:false};
 if(x<p[0].xPixel) return {value:lineY(p[0],p[1],x),extrapolated:true};
 if(x>p.at(-1).xPixel) return {value:lineY(p.at(-2),p.at(-1),x),extrapolated:true};
 return null;
}
function yAtX(points,x){const r=yAtXMeta(points,x);return r?r.value:null;}
function xAtYMeta(points,y){
 if(!points||points.length<2)return null;
 const p=[...points].sort((a,b)=>a.yPixel-b.yPixel);
 for(let i=0;i<p.length-1;i++) if(y>=p[i].yPixel-EPS&&y<=p[i+1].yPixel+EPS) return {value:lineX(p[i],p[i+1],y),extrapolated:false};
 if(y<p[0].yPixel) return {value:lineX(p[0],p[1],y),extrapolated:true};
 if(y>p.at(-1).yPixel) return {value:lineX(p.at(-2),p.at(-1),y),extrapolated:true};
 return null;
}
function xAtY(points,y){const r=xAtYMeta(points,y);return r?r.value:null;}
function xScale(points,a,b,v){return points[0].xPixel+(v-a)*(points[1].xPixel-points[0].xPixel)/(b-a);}
function valueScale(points,a,b,x){return a+(x-points[0].xPixel)*(b-a)/(points[1].xPixel-points[0].xPixel);}
function yScale(points,a,b,v){return points[0].yPixel+(v-a)*(points[1].yPixel-points[0].yPixel)/(b-a);}
function keys(f){return Object.keys(f).map(Number).sort((a,b)=>a-b);}

function interpolatedGWY(data,gw,x){
 const fam=data.elements.grossWeight,k=keys(fam);
 let lo=k[0],hi=k[0];
 if(gw<=k[0]){lo=hi=k[0];}else if(gw>=k.at(-1)){lo=hi=k.at(-1);}else{for(let i=0;i<k.length-1;i++)if(gw>=k[i]&&gw<=k[i+1]){lo=k[i];hi=k[i+1];break;}}
 const y1=yAtX(fam[String(lo)],x),y2=yAtX(fam[String(hi)],x);
 if(y1==null||y2==null)return null;
 return {value:lo===hi?y1:lerp(y1,y2,(gw-lo)/(hi-lo)),extrapolated:(x<Math.min(...fam[String(lo)].map(p=>p.xPixel))||x>Math.max(...fam[String(lo)].map(p=>p.xPixel)))};
}

function interpolatedCFLX(data,cfl,y){
 const fam=data.elements.rwyCfl,k=keys(fam);
 let lo,hi,t,extrapolated=false;
 if(cfl<k[0]){lo=k[0];hi=k[1];t=(cfl-lo)/(hi-lo);extrapolated=true;}
 else if(cfl>k.at(-1)){lo=k.at(-2);hi=k.at(-1);t=(cfl-lo)/(hi-lo);extrapolated=true;}
 else {for(let i=0;i<k.length-1;i++)if(cfl>=k[i]&&cfl<=k[i+1]){lo=k[i];hi=k[i+1];t=(cfl-lo)/(hi-lo);break;}if(lo===undefined){lo=hi=k[0];t=0;}}
 const a=xAtYMeta(fam[String(lo)],y),b=xAtYMeta(fam[String(hi)],y);
 if(!a||!b)return null;
 return {value:lerp(a.value,b.value,t),extrapolated:extrapolated||a.extrapolated||b.extrapolated};
}

function baselineXMeta(curve,baseline){
 if(!curve||curve.length<2||!baseline||baseline.length<2)return null;
 const r=xAtYMeta(curve,(baseline[0].yPixel+baseline[1].yPixel)/2);
 return r?{x:r.value,extrapolated:r.extrapolated}:null;
}

function interpolatedRefX(family,baseline,xBase,yTarget){
 const refs=[];
 for(const [key,curve] of Object.entries(family)){
  if(!curve||curve.length<2)continue;
  const base=baselineXMeta(curve,baseline),target=xAtYMeta(curve,yTarget);
  if(base&&target)refs.push({key:Number(key),x:base.x,targetX:target.value,extrapolated:base.extrapolated||target.extrapolated});
 }
 refs.sort((a,b)=>a.x-b.x);
 if(!refs.length)return null;
 let a,b,t,extrapolated=false;
 if(refs.length===1){return {value:refs[0].targetX,extrapolated:true};}
 if(xBase<refs[0].x){a=refs[0];b=refs[1];t=(xBase-a.x)/(b.x-a.x);extrapolated=true;}
 else if(xBase>refs.at(-1).x){a=refs.at(-2);b=refs.at(-1);t=(xBase-a.x)/(b.x-a.x);extrapolated=true;}
 else{
  for(let i=0;i<refs.length-1;i++)if(xBase>=refs[i].x-EPS&&xBase<=refs[i+1].x+EPS){a=refs[i];b=refs[i+1];t=(xBase-a.x)/(b.x-a.x);break;}
  if(!a){const valid=refs.filter(r=>r.targetX!=null);valid.sort((u,v)=>Math.abs(u.x-xBase)-Math.abs(v.x-xBase));return {value:valid[0].targetX,extrapolated:true};}
 }
 return {value:lerp(a.targetX,b.targetX,t),extrapolated:extrapolated||a.extrapolated||b.extrapolated};
}

function calculate(data,input){
 const tof=Number(input.tof),grossWeight=Number(input.grossWeight),cflFt=Number(input.cflFt),runwayLengthFt=Number(input.runwayLengthFt),rcr=Number(input.rcr);
 if(!Number.isFinite(tof)||tof<1||tof>10)return {valid:false,message:"TOF fuera del rango 1–10."};
 if(!Number.isFinite(grossWeight)||grossWeight<12000||grossWeight>24000)return {valid:false,message:"Gross Weight fuera del rango 12.000–24.000 lb."};
 if(!Number.isFinite(cflFt))return {valid:false,message:"CFL no disponible."};
 if(!Number.isFinite(runwayLengthFt))return {valid:false,message:"Longitud de pista no disponible."};
 if(!Number.isFinite(rcr)||rcr<0||rcr>23)return {valid:false,message:"RCR fuera del rango 0–23."};

 const xTOF=xScale(data.elements.tof,1,10,tof),gwMeta=interpolatedGWY(data,grossWeight,xTOF);
 if(!gwMeta)return {valid:false,message:"No se pudo interceptar Gross Weight con el TOF."};
 const yGW=gwMeta.value;
 const cflMeta=interpolatedCFLX(data,cflFt,yGW),runwayMeta=interpolatedCFLX(data,runwayLengthFt,yGW);
 if(!cflMeta)return {valid:false,message:"No se pudo interceptar RWY CFL."};
 if(!runwayMeta)return {valid:false,message:"No se pudo interceptar longitud de pista."};
 const xCFL=cflMeta.value,xRunway=runwayMeta.value;

 const yR1=yScale(data.elements.rcr1,0,23,rcr), yR2=yScale(data.elements.rcr2,0,23,rcr);
 let xRef1Meta, refusalBeyond180=false;
 if(rcr>=23)xRef1Meta={value:xRunway,extrapolated:runwayMeta.extrapolated};
 else xRef1Meta=interpolatedRefX(data.elements.refusalCurves,data.elements.baseline1,xRunway,yR1);
 if(!xRef1Meta)return {valid:false,message:"No se pudo interpolar la referencia superior."};
 let xRef2Meta;
 if(rcr>=23)xRef2Meta={value:xCFL,extrapolated:cflMeta.extrapolated};
 else xRef2Meta=interpolatedRefX(data.elements.cefCurves,data.elements.baseline2,xCFL,yR2);
 if(!xRef2Meta)return {valid:false,message:"No se pudo interpolar la referencia inferior."};

 const refusalRaw=valueScale(data.elements.refusalSpeed,90,180,xRef1Meta.value),cefRaw=valueScale(data.elements.criticalEngineFailureSpeed,90,180,xRef2Meta.value);
 const refusalOver180=refusalRaw>180||xRef1Meta.value>data.elements.refusalSpeed[1].xPixel||runwayMeta.extrapolated&&refusalRaw>180;
 const cefOver180=cefRaw>180||xRef2Meta.value>data.elements.criticalEngineFailureSpeed[1].xPixel;
 const refusalExtrapolated=!!xRef1Meta.extrapolated||refusalRaw<90||refusalRaw>180;
 const cefExtrapolated=!!xRef2Meta.extrapolated||cflMeta.extrapolated||cefRaw<90||cefRaw>180;
 const refusalDisplay=refusalOver180?">180":refusalRaw<90?"<90":refusalRaw.toFixed(1);
 const cefDisplay=cefOver180?">180":cefRaw<90?"<90":cefRaw.toFixed(1);
 const yTOF=(data.elements.tof[0].yPixel+data.elements.tof[1].yPixel)/2;
 const refusalY=yAtX(data.elements.refusalSpeed,xRef1Meta.value),cefY=yAtX(data.elements.criticalEngineFailureSpeed,xRef2Meta.value);
 const refusalPath=[{x:xTOF,y:yTOF},{x:xTOF,y:yGW},{x:xRunway,y:yGW}];
 if(refusalOver180) refusalPath.push({x:data.elements.refusalSpeed[1].xPixel,y:yGW},{x:data.elements.refusalSpeed[1].xPixel,y:(data.elements.refusalSpeed[0].yPixel+data.elements.refusalSpeed[1].yPixel)/2});
 else {if(rcr<23){refusalPath.push({x:xRunway,y:yR1},{x:xRef1Meta.value,y:yR1});}refusalPath.push({x:xRef1Meta.value,y:refusalY});}
 const cefPath=[{x:xTOF,y:yTOF},{x:xTOF,y:yGW},{x:xCFL,y:yGW}];
 if(rcr<23){cefPath.push({x:xCFL,y:yR2},{x:xRef2Meta.value,y:yR2});}cefPath.push({x:xRef2Meta.value,y:cefY});
 return {valid:true,inputs:{tof,grossWeight,cflFt,runwayLengthFt,rcr},result:{refusalSpeed:refusalRaw,criticalEngineFailureSpeed:cefRaw,refusalDisplay,cefDisplay,refusalOver180,cefOver180,refusalExtrapolated,cefExtrapolated},points:{tof:{x:xTOF,y:yTOF},grossWeight:{x:xTOF,y:yGW},rwyCfl:{x:xCFL,y:yGW},runway:{x:xRunway,y:yGW},refusalSpeed:{x:xRef1Meta.value,y:refusalY??refusalPath.at(-1).y},cefSpeed:{x:xRef2Meta.value,y:cefY??cefPath.at(-1).y}},refusalPath,cefPath};
}
window.FA23RefusalCEF={calculate};
})();

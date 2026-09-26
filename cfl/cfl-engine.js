/* =========================================================
   FA-23 — CRITICAL FIELD LENGTH — NO DRAG CHUTE
   Motor de producción.

   Entrada:
     takeoffFactor : número
     grossWeight   : lb
     headwind      : kt (0 si no hay componente de frente)
     tailwind      : kt (0 si no hay componente de cola)
     cg            : % MAC
     rcr           : 0–23

   El viento se interpreta automáticamente:
     headwind > 0  -> familia HEADWIND
     tailwind > 0  -> familia TAILWIND
     ambos ~0      -> SIN VIENTO
   ========================================================= */
(function(){
'use strict';
const D=window.FA23_CFL_NDC_DATA;
if(!D){console.error('FA23 CFL NDC: no se encontró DATA');return;}
function lerp(a,b,t){return a+(b-a)*t;}
function clamp(v,a,b){return Math.max(a,Math.min(b,v));}
function scaleY(s,v){return lerp(Number(s.pA.y),Number(s.pB.y),(v-Number(s.a))/(Number(s.b)-Number(s.a)));}
function xAtY(pts,y,tolerance=3){
  for(let i=0;i<pts.length-1;i++){
    const p=pts[i],q=pts[i+1],ymin=Math.min(p.yPixel,q.yPixel),ymax=Math.max(p.yPixel,q.yPixel);
    if(y>=ymin && y<=ymax){const dy=q.yPixel-p.yPixel;if(Math.abs(dy)<1e-9)continue;const t=(y-p.yPixel)/dy;return {x:lerp(p.xPixel,q.xPixel,t),y};}
  }
  for(let i=0;i<pts.length-1;i++){
    const p=pts[i],q=pts[i+1],ymin=Math.min(p.yPixel,q.yPixel),ymax=Math.max(p.yPixel,q.yPixel);
    if(y>=ymin-tolerance && y<=ymax+tolerance){const dy=q.yPixel-p.yPixel;if(Math.abs(dy)<1e-9)continue;const t=(y-p.yPixel)/dy;return {x:lerp(p.xPixel,q.xPixel,t),y,extrapolated:true};}
  }
  return null;
}
function interpPoints(a,b,t){const n=Math.max(a.length,b.length),o=[];for(let i=0;i<n;i++){const p=a[Math.min(i,a.length-1)],q=b[Math.min(i,b.length-1)];o.push({xPixel:lerp(p.xPixel,q.xPixel,t),yPixel:lerp(p.yPixel,q.yPixel,t)});}return o;}
function pointFromGrossWeight(tof,gw){
 const y=scaleY(D.scales.takeoffFactor,tof), keys=Object.keys(D.elements.grossWeight).map(Number).sort((a,b)=>a-b),c=[];
 for(const k of keys){const p=xAtY(D.elements.grossWeight[String(k)],y);if(p)c.push({gw:k,p});}
 if(!c.length)throw new Error('El Takeoff Factor queda fuera de las curvas de Gross Weight.');
 let lo=c[0],hi=c[c.length-1];
 for(let i=0;i<c.length-1;i++)if(gw>=c[i].gw&&gw<=c[i+1].gw){lo=c[i];hi=c[i+1];break;}
 if(gw<=lo.gw)return lo.p;if(gw>=hi.gw)return hi.p;const t=(gw-lo.gw)/(hi.gw-lo.gw);return{x:lerp(lo.p.x,hi.p.x,t),y};
}
function pointFromWind(gwPoint,headwind,tailwind){
 const base1Y=(D.elements.baseline1[0].yPixel+D.elements.baseline1[1].yPixel)/2,base1={x:gwPoint.x,y:base1Y};
 const hw=Math.abs(Number(headwind)||0),tw=Math.abs(Number(tailwind)||0);
 let type='none',wind=0;
 if(hw>0.05){type='headwind';wind=hw;}else if(tw>0.05){type='tailwind';wind=tw;}
 if(type==='none'||wind===0)return{type,wind,base1,start:base1,end:base1,lineA:null,lineB:null};
 const fam=D.elements[type],entries=Object.entries(fam).map(([k,pts])=>({k:Number(k),pts,x0:pts[0].xPixel})).sort((a,b)=>a.x0-b.x0);
 let A=entries[0],B=entries[entries.length-1];for(let i=0;i<entries.length-1;i++){if(base1.x>=entries[i].x0&&base1.x<=entries[i+1].x0){A=entries[i];B=entries[i+1];break;}}
 const den=B.x0-A.x0,t=Math.abs(den)<1e-9?0:(base1.x-A.x0)/den,ip=interpPoints(A.pts,B.pts,clamp(t,0,1)),hit=xAtY(ip,scaleY(D.scales.wind,wind),3);
 if(!hit)throw new Error('La guía de viento no alcanza el nivel solicitado.');
 return{type,wind,base1,start:base1,end:hit,lineA:A.k,lineB:B.k};
}
function pointFromCG(base2Point,cg){
 const base2Y=(D.elements.baseline2[0].yPixel+D.elements.baseline2[1].yPixel)/2,base3Y=(D.elements.baseline3[0].yPixel+D.elements.baseline3[1].yPixel)/2,base2={x:base2Point.x,y:base2Y};
 if(Math.abs(cg-15)<1e-9)return{baseline2:base2,cgPoint:base2,cgBaseline:base2,baseline3:{x:base2.x,y:base3Y},upper:false};
 const upper=cg>15,fam=upper?D.elements.cgUpper:D.elements.cgLower,entries=Object.entries(fam).map(([k,pts])=>({k:Number(k),pts,xBase:pts[pts.length-1].xPixel})).sort((a,b)=>a.xBase-b.xBase);
 let A=entries[0],B=entries[entries.length-1];for(let i=0;i<entries.length-1;i++){if(base2.x>=entries[i].xBase&&base2.x<=entries[i+1].xBase){A=entries[i];B=entries[i+1];break;}}
 const den=B.xBase-A.xBase,t=Math.abs(den)<1e-9?0:(base2.x-A.xBase)/den,ip=interpPoints(A.pts,B.pts,clamp(t,0,1)),yCG=scaleY(D.scales.cg,cg),p0=ip[0],p1=ip[ip.length-1],dy=p1.yPixel-p0.yPixel,dx=p1.xPixel-p0.xPixel,slope=Math.abs(dy)<1e-9?0:dx/dy;
 if(upper){const cgPoint={x:base2.x,y:yCG},cgBaseline={x:cgPoint.x+slope*(base2Y-yCG),y:base2Y};return{baseline2:base2,cgPoint,cgBaseline,baseline3:{x:cgBaseline.x,y:base3Y},upper:true,lineA:A.k,lineB:B.k};}
 const cgPoint={x:base2.x+slope*(yCG-base2Y),y:yCG};return{baseline2:base2,cgPoint,cgBaseline:base2,baseline3:{x:cgPoint.x,y:base3Y},upper:false,lineA:A.k,lineB:B.k};
}
function pointFromRCR(base3,rcr){
 const base3Y=(D.elements.baseline3[0].yPixel+D.elements.baseline3[1].yPixel)/2,baseline={x:base3.x,y:base3Y},yR=scaleY(D.scales.rcr,rcr);
 if(rcr>=23)return{start:baseline,hit:baseline};
 const entries=Object.entries(D.elements.rcrGuidelines).map(([k,pts])=>({k:Number(k),pts,x0:pts[0].xPixel})).sort((a,b)=>a.x0-b.x0);let A=entries[0],B=entries[entries.length-1];
 for(let i=0;i<entries.length-1;i++)if(base3.x>=entries[i].x0&&base3.x<=entries[i+1].x0){A=entries[i];B=entries[i+1];break;}
 const den=B.x0-A.x0,t=Math.abs(den)<1e-9?0:(base3.x-A.x0)/den,ip=interpPoints(A.pts,B.pts,clamp(t,0,1));
 if(rcr<=15){const hit=xAtY(ip,yR,3);if(!hit)throw new Error('La guía RCR no alcanza el nivel solicitado.');return{start:baseline,hit,lineA:A.k,lineB:B.k};}
 const at15=xAtY(ip,scaleY(D.scales.rcr,15),3);if(!at15)throw new Error('La guía RCR 15 no alcanza el recorrido solicitado.');const f=(23-rcr)/8;return{start:baseline,hit:{x:lerp(baseline.x,at15.x,f),y:lerp(baseline.y,at15.y,f)}};
}
function cflFromX(x){return Number(D.scales.criticalFieldLength.a)+(x-D.scales.criticalFieldLength.pA.x)*(Number(D.scales.criticalFieldLength.b)-Number(D.scales.criticalFieldLength.a))/(D.scales.criticalFieldLength.pB.x-D.scales.criticalFieldLength.pA.x);}
function calc(v){
 const tof=Number(v.takeoffFactor),gw=Number(v.grossWeight),cg=Number(v.cg),rcr=Number(v.rcr??23),headwind=Number(v.headwind||0),tailwind=Number(v.tailwind||0);
 if(!Number.isFinite(tof)||tof<3||tof>10)return{valid:false,message:'Takeoff Factor fuera de 3–10.'};
 if(!Number.isFinite(gw)||gw<12000||gw>20000)return{valid:false,message:'Gross Weight fuera de 12.000–20.000 lb.'};
 if(!Number.isFinite(cg)||cg<5||cg>25)return{valid:false,message:'CG fuera de 5–25 % MAC.'};
 if(!Number.isFinite(rcr)||rcr<0||rcr>23)return{valid:false,message:'RCR fuera de 0–23.'};
 const gwPoint=pointFromGrossWeight(tof,gw),windPath=pointFromWind(gwPoint,headwind,tailwind),base2Y=(D.elements.baseline2[0].yPixel+D.elements.baseline2[1].yPixel)/2,base2={x:windPath.end.x,y:base2Y},cgPath=pointFromCG(base2,cg),base3=cgPath.baseline3,rcrPath=pointFromRCR(base3,rcr),cflX=rcrPath.hit.x,cfl=cflFromX(cflX),tofPoint={x:D.scales.takeoffFactor.pA.x,y:scaleY(D.scales.takeoffFactor,tof)};
 return{valid:true,result:{cfl,cflFt:Math.round(cfl*1000)},inputs:{takeoffFactor:tof,grossWeight:gw,headwind,tailwind,windType:windPath.type,wind:windPath.wind,cg,rcr},path:{tof:tofPoint,gw:gwPoint,windBase:windPath.base1,wind:windPath.end,base2,cg:cgPath.cgPoint,cgBaseline:cgPath.cgBaseline,base3,rcr:rcrPath.hit,cfl:{x:cflX,y:D.scales.criticalFieldLength.pA.y}},trace:{cgUpper:cgPath.upper}};
}
window.calculateFA23CFL=calc;
})();

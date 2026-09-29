/* =========================================================
   FA-23 — CRITICAL FIELD LENGTH — WITH DRAG CHUTE
   Motor de cálculo a partir de la digitalización.
   ========================================================= */
(function(){
"use strict";

const D = window.FA23_CFL_DC_DATA;
if(!D){
  console.error("FA23 CFL DC: no se encontró FA23_CFL_DC_DATA");
  return;
}

const EPS = 1e-9;

// Corrección confirmada de calibración TOF para esta carta:
// TOF 3 = X 74, Y 294 / TOF 10 = X 74, Y 16.
// Se fuerza aquí para que el motor siga funcionando aunque el JSON
// conserve la calibración original equivocada.
D.scales.takeoffFactor = {
  ...D.scales.takeoffFactor,
  a: "3",
  b: "10",
  pA: {x:74, y:294},
  pB: {x:74, y:16}
};

function lerp(a,b,t){ return a + (b-a)*t; }

function scaleY(s,v){
  return lerp(Number(s.pA.y), Number(s.pB.y),
    (v-Number(s.a))/(Number(s.b)-Number(s.a)));
}

function scaleX(s,v){
  return lerp(Number(s.pA.x), Number(s.pB.x),
    (v-Number(s.a))/(Number(s.b)-Number(s.a)));
}

/* Intersección con una poligonal. Si el nivel queda apenas fuera
   de la digitalización, se extrapola usando el primer/último tramo. */
function xAtYMeta(points,y){
  if(!points || points.length<2) return null;

  const p = points;

  for(let i=0;i<p.length-1;i++){
    const a=p[i], b=p[i+1];
    const ymin=Math.min(a.yPixel,b.yPixel);
    const ymax=Math.max(a.yPixel,b.yPixel);
    if(y>=ymin-EPS && y<=ymax+EPS){
      const dy=b.yPixel-a.yPixel;
      if(Math.abs(dy)<EPS) continue;
      const t=(y-a.yPixel)/dy;
      return {x:lerp(a.xPixel,b.xPixel,t),extrapolated:false};
    }
  }

  if(y<p[0].yPixel){
    const a=p[0],b=p[1];
    const dy=b.yPixel-a.yPixel;
    if(Math.abs(dy)<EPS) return null;
    return {x:lerp(a.xPixel,b.xPixel,(y-a.yPixel)/dy),extrapolated:true};
  }

  const a=p[p.length-2],b=p[p.length-1];
  const dy=b.yPixel-a.yPixel;
  if(Math.abs(dy)<EPS) return null;
  return {x:lerp(a.xPixel,b.xPixel,(y-a.yPixel)/dy),extrapolated:true};
}

function interpPoints(a,b,t){
  const n=Math.max(a.length,b.length);
  const out=[];
  for(let i=0;i<n;i++){
    const p=a[Math.min(i,a.length-1)];
    const q=b[Math.min(i,b.length-1)];
    out.push({
      xPixel:lerp(p.xPixel,q.xPixel,t),
      yPixel:lerp(p.yPixel,q.yPixel,t)
    });
  }
  return out;
}

function anchorAtY(points,targetY){
  if(!points || points.length<2) return null;
  let best=points[0],bestDist=Math.abs(points[0].yPixel-targetY);
  for(const p of points){
    const d=Math.abs(p.yPixel-targetY);
    if(d<bestDist){best=p;bestDist=d;}
  }
  return {x:best.xPixel,y:best.yPixel};
}

function interpolateFamilyAtX(family, baseX, anchorY){
  const entries=Object.entries(family)
    .filter(([,pts])=>pts && pts.length>=2)
    .map(([key,pts])=>({
      key:Number(key),
      pts,
      anchor:anchorAtY(pts,anchorY)
    }))
    .filter(e=>e.anchor)
    .sort((a,b)=>a.anchor.x-b.anchor.x);

  if(!entries.length) return null;

  if(entries.length===1){
    return {points:entries[0].pts, lineA:entries[0].key,
      lineB:entries[0].key, extrapolated:true};
  }

  let A=entries[0],B=entries[1],extrapolated=false;

  if(baseX<=entries[0].anchor.x){
    A=entries[0];B=entries[1];extrapolated=true;
  }else if(baseX>=entries[entries.length-1].anchor.x){
    A=entries[entries.length-2];B=entries[entries.length-1];
    extrapolated=true;
  }else{
    for(let i=0;i<entries.length-1;i++){
      if(baseX>=entries[i].anchor.x-EPS &&
         baseX<=entries[i+1].anchor.x+EPS){
        A=entries[i];B=entries[i+1];
        break;
      }
    }
  }

  const dx=B.anchor.x-A.anchor.x;
  const t=Math.abs(dx)<EPS ? 0 : (baseX-A.anchor.x)/dx;

  return {
    points:interpPoints(A.pts,B.pts,t),
    lineA:A.key,
    lineB:B.key,
    extrapolated
  };
}

function pointFromGrossWeight(tof,gw){
  const y=scaleY(D.scales.takeoffFactor,tof);
  const fam=D.elements.grossWeight;
  const keys=Object.keys(fam).map(Number).sort((a,b)=>a-b);
  const hits=[];

  for(const k of keys){
    const hit=xAtYMeta(fam[String(k)],y);
    if(hit) hits.push({gw:k,...hit});
  }

  if(!hits.length)
    throw new Error("No se pudo interceptar Gross Weight con el TOF.");

  if(gw<=hits[0].gw){
    return {
      x:hits[0].x,y,extrapolated:hits[0].extrapolated
    };
  }

  if(gw>=hits[hits.length-1].gw){
    const h=hits[hits.length-1];
    return {x:h.x,y,extrapolated:h.extrapolated};
  }

  for(let i=0;i<hits.length-1;i++){
    if(gw>=hits[i].gw && gw<=hits[i+1].gw){
      const A=hits[i],B=hits[i+1];
      const t=(gw-A.gw)/(B.gw-A.gw);
      return {
        x:lerp(A.x,B.x,t),
        y,
        extrapolated:A.extrapolated||B.extrapolated
      };
    }
  }

  return null;
}

function pointFromWind(gwPoint,headwind,tailwind){
  const base1Y=(D.elements.baseline1[0].yPixel+
                D.elements.baseline1[1].yPixel)/2;

  const base1={x:gwPoint.x,y:base1Y};
  const hw=Math.abs(Number(headwind)||0);
  const tw=Math.abs(Number(tailwind)||0);

  let type="none",wind=0;
  if(hw>0.05){type="headwind";wind=hw;}
  else if(tw>0.05){type="tailwind";wind=tw;}

  if(type==="none"){
    return {type,wind,base1,start:base1,end:base1,
      lineA:null,lineB:null,extrapolated:false};
  }

  const fam=D.elements[type];
  const windY=scaleY(D.scales.wind,wind);
  const familyMeta=interpolateFamilyAtX(fam,base1.x,base1Y);

  if(!familyMeta)
    throw new Error("No se pudo interpolar la referencia de viento.");

  const hit=xAtYMeta(familyMeta.points,windY);
  if(!hit)
    throw new Error("La referencia de viento no alcanza el nivel solicitado.");

  return {
    type,wind,base1,
    start:base1,
    end:{x:hit.x,y:windY},
    lineA:familyMeta.lineA,
    lineB:familyMeta.lineB,
    extrapolated:familyMeta.extrapolated||hit.extrapolated
  };
}

function pointFromCG(base2Point,cg){
  const base2Y=(D.elements.baseline2[0].yPixel+
                D.elements.baseline2[1].yPixel)/2;
  const base3Y=(D.elements.baseline3[0].yPixel+
                D.elements.baseline3[1].yPixel)/2;

  const base2={x:base2Point.x,y:base2Y};

  if(Math.abs(cg-15)<1e-9){
    return {
      baseline2:base2,
      cgPoint:base2,
      cgBaseline:base2,
      baseline3:{x:base2.x,y:base3Y},
      upper:false,
      extrapolated:false
    };
  }

  const upper=cg>15;
  const fam=upper ? D.elements.cgUpper : D.elements.cgLower;
  const yCG=scaleY(D.scales.cg,cg);

  const familyMeta=interpolateFamilyAtX(fam,base2.x,base2Y);
  if(!familyMeta)
    throw new Error("No se pudo interpolar la referencia de CG.");

  const hit=xAtYMeta(familyMeta.points,yCG);
  if(!hit)
    throw new Error("La referencia de CG no alcanza el nivel solicitado.");

  const cgPoint={x:hit.x,y:yCG};

  return {
    baseline2:base2,
    cgPoint,
    cgBaseline:base2,
    baseline3:{x:cgPoint.x,y:base3Y},
    upper,
    lineA:familyMeta.lineA,
    lineB:familyMeta.lineB,
    extrapolated:familyMeta.extrapolated||hit.extrapolated
  };
}

function pointFromRCR(base3,rcr){
  const base3Y=(D.elements.baseline3[0].yPixel+
                D.elements.baseline3[1].yPixel)/2;
  const baseline={x:base3.x,y:base3Y};

  if(Math.abs(rcr-23)<1e-9){
    return {
      start:baseline,
      hit:baseline,
      lineA:null,lineB:null,
      extrapolated:false
    };
  }

  const yR=scaleY(D.scales.rcr,rcr);
  const famMeta=interpolateFamilyAtX(
    D.elements.rcrGuidelines,
    base3.x,
    base3Y
  );

  if(!famMeta)
    throw new Error("No se pudo interpolar la referencia de RCR.");

  const hit=xAtYMeta(famMeta.points,yR);
  if(!hit)
    throw new Error("La referencia RCR no alcanza el nivel solicitado.");

  return {
    start:baseline,
    hit:{x:hit.x,y:yR},
    lineA:famMeta.lineA,
    lineB:famMeta.lineB,
    extrapolated:famMeta.extrapolated||hit.extrapolated
  };
}

function cflFromX(x){
  return Number(D.scales.criticalFieldLength.a) +
    (x-D.scales.criticalFieldLength.pA.x) *
    (Number(D.scales.criticalFieldLength.b)-
     Number(D.scales.criticalFieldLength.a)) /
    (D.scales.criticalFieldLength.pB.x-
     D.scales.criticalFieldLength.pA.x);
}

function calc(v){
  const tof=Number(v.takeoffFactor);
  const gw=Number(v.grossWeight);
  const cg=Number(v.cg);
  const rcr=Number(v.rcr ?? 23);
  const headwind=Number(v.headwind||0);
  const tailwind=Number(v.tailwind||0);

  if(!Number.isFinite(tof)||tof<3||tof>10)
    return {valid:false,message:"Takeoff Factor fuera de 3–10."};

  if(!Number.isFinite(gw)||gw<12000||gw>20000)
    return {valid:false,message:"Gross Weight fuera de 12.000–20.000 lb."};

  if(!Number.isFinite(cg)||cg<5||cg>25)
    return {valid:false,message:"CG fuera de 5–25 % MAC."};

  if(!Number.isFinite(rcr)||rcr<0||rcr>23)
    return {valid:false,message:"RCR fuera de 0–23."};

  if(headwind>0.05 && tailwind>0.05)
    return {valid:false,message:"No se puede introducir viento de frente y de cola simultáneamente."};

  const gwPoint=pointFromGrossWeight(tof,gw);
  const windPath=pointFromWind(gwPoint,headwind,tailwind);

  const cgPath=pointFromCG(
    {x:windPath.end.x},
    cg
  );

  const rcrPath=pointFromRCR(cgPath.baseline3,rcr);

  const cflX=rcrPath.hit.x;
  const cfl=cflFromX(cflX);

  const tofPoint={
    x:D.scales.takeoffFactor.pA.x,
    y:scaleY(D.scales.takeoffFactor,tof)
  };

  const extrapolated=
    gwPoint.extrapolated ||
    windPath.extrapolated ||
    cgPath.extrapolated ||
    rcrPath.extrapolated;

  return {
    valid:true,
    result:{
      cfl,
      cflFt:Math.round(cfl*1000),
      extrapolated
    },
    inputs:{
      takeoffFactor:tof,
      grossWeight:gw,
      headwind,
      tailwind,
      windType:windPath.type,
      wind:windPath.wind,
      cg,
      rcr
    },
    path:{
      tof:tofPoint,
      gw:gwPoint,
      windBase:windPath.base1,
      wind:windPath.end,
      base2:cgPath.baseline2,
      cg:cgPath.cgPoint,
      cgBaseline:cgPath.cgBaseline,
      base3:cgPath.baseline3,
      rcr:rcrPath.hit,
      cfl:{x:cflX,y:D.scales.criticalFieldLength.pA.y}
    },
    trace:{
      windLineA:windPath.lineA,
      windLineB:windPath.lineB,
      cgUpper:cgPath.upper,
      cgLineA:cgPath.lineA,
      cgLineB:cgPath.lineB,
      rcrLineA:rcrPath.lineA,
      rcrLineB:rcrPath.lineB
    }
  };
}

window.calculateFA23CFLDC=calc;
})();
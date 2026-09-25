// FA-23 SETOS ENGINE
// Motor de cálculo separado del visor.
// Recorrido: TOF → PA → GW superior → CG → GW inferior → SETOS.
// Interpolación continua. Sin extrapolación.

(function() {
"use strict";

window.FA23_SETOS_DATA = {
  "version": "FA23-SETOS-1",
  "chart": "FA-23 SINGLE ENGINE TAKEOFF SPEED",
  "image": {
    "width": 721,
    "height": 760
  },
  "scales": {
    "takeoffFactor": {
      "name": "Takeoff Factor",
      "a": "3",
      "b": "11",
      "pA": {
        "x": 106.18184312842969,
        "y": 336.8787936162876
      },
      "pB": {
        "x": 432.9697070562876,
        "y": 336.8787936162876
      }
    },
    "setos": {
      "name": "SETOS KIAS",
      "a": "130",
      "b": "230",
      "pA": {
        "x": 24,
        "y": 702
      },
      "pB": {
        "x": 432,
        "y": 702
      }
    }
  },
  "elements": {
    "pressureAltitude": {
      "2000": [
        {
          "n": 1,
          "xPixel": 121.39,
          "yPixel": 319.94
        },
        {
          "n": 2,
          "xPixel": 232.11,
          "yPixel": 176.46
        },
        {
          "n": 3,
          "xPixel": 301.12,
          "yPixel": 108.93
        },
        {
          "n": 4,
          "xPixel": 334.38,
          "yPixel": 93.05
        },
        {
          "n": 5,
          "xPixel": 361.69,
          "yPixel": 93.05
        }
      ],
      "4000": [
        {
          "n": 1,
          "xPixel": 115.43,
          "yPixel": 320.44
        },
        {
          "n": 2,
          "xPixel": 178.98,
          "yPixel": 227.59
        },
        {
          "n": 3,
          "xPixel": 221.68,
          "yPixel": 176.46
        },
        {
          "n": 4,
          "xPixel": 264.38,
          "yPixel": 140.21
        },
        {
          "n": 5,
          "xPixel": 291.69,
          "yPixel": 130.78
        },
        {
          "n": 6,
          "xPixel": 309.56,
          "yPixel": 133.76
        }
      ],
      "6000": [
        {
          "n": 1,
          "xPixel": 106,
          "yPixel": 320.44
        },
        {
          "n": 2,
          "xPixel": 169.05,
          "yPixel": 230.08
        },
        {
          "n": 3,
          "xPixel": 204.8,
          "yPixel": 187.38
        },
        {
          "n": 4,
          "xPixel": 226.65,
          "yPixel": 171.49
        },
        {
          "n": 5,
          "xPixel": 246.51,
          "yPixel": 165.53
        },
        {
          "n": 6,
          "xPixel": 258.92,
          "yPixel": 165.53
        }
      ],
      "8000": [
        {
          "n": 1,
          "xPixel": 106.5,
          "yPixel": 311.5
        },
        {
          "n": 2,
          "xPixel": 142.74,
          "yPixel": 255.89
        },
        {
          "n": 3,
          "xPixel": 162.6,
          "yPixel": 233.05
        },
        {
          "n": 4,
          "xPixel": 187.92,
          "yPixel": 210.22
        },
        {
          "n": 5,
          "xPixel": 207.28,
          "yPixel": 200.78
        },
        {
          "n": 6,
          "xPixel": 217.71,
          "yPixel": 201.28
        }
      ],
      "SL": [
        {
          "n": 1,
          "xPixel": 136.06,
          "yPixel": 320.85
        },
        {
          "n": 2,
          "xPixel": 253.64,
          "yPixel": 160.25
        },
        {
          "n": 3,
          "xPixel": 307.58,
          "yPixel": 100.25
        },
        {
          "n": 4,
          "xPixel": 351.21,
          "yPixel": 66.31
        },
        {
          "n": 5,
          "xPixel": 390.61,
          "yPixel": 49.34
        },
        {
          "n": 6,
          "xPixel": 411.82,
          "yPixel": 49.94
        }
      ]
    },
    "grossWeightTop": {
      "12000": [
        {
          "n": 1,
          "xPixel": 458.32,
          "yPixel": 319.86
        },
        {
          "n": 2,
          "xPixel": 597.95,
          "yPixel": 253.46
        },
        {
          "n": 3,
          "xPixel": 679.88,
          "yPixel": 44.32
        }
      ],
      "13000": [
        {
          "n": 1,
          "xPixel": 458.32,
          "yPixel": 289.45
        },
        {
          "n": 2,
          "xPixel": 597.95,
          "yPixel": 217.46
        },
        {
          "n": 3,
          "xPixel": 666.22,
          "yPixel": 44.94
        }
      ],
      "14000": [
        {
          "n": 1,
          "xPixel": 458.32,
          "yPixel": 259.67
        },
        {
          "n": 2,
          "xPixel": 596.71,
          "yPixel": 182.71
        },
        {
          "n": 3,
          "xPixel": 653.81,
          "yPixel": 44.94
        }
      ],
      "15000": [
        {
          "n": 1,
          "xPixel": 459.56,
          "yPixel": 229.88
        },
        {
          "n": 2,
          "xPixel": 598.58,
          "yPixel": 149.2
        },
        {
          "n": 3,
          "xPixel": 638.92,
          "yPixel": 44.94
        }
      ],
      "16000": [
        {
          "n": 1,
          "xPixel": 458.32,
          "yPixel": 206.91
        },
        {
          "n": 2,
          "xPixel": 598.58,
          "yPixel": 115.06
        },
        {
          "n": 3,
          "xPixel": 624.64,
          "yPixel": 44.94
        }
      ],
      "17000": [
        {
          "n": 1,
          "xPixel": 458.94,
          "yPixel": 174.64
        },
        {
          "n": 2,
          "xPixel": 597.33,
          "yPixel": 81.55
        },
        {
          "n": 3,
          "xPixel": 613.47,
          "yPixel": 44.94
        }
      ],
      "18000": [
        {
          "n": 1,
          "xPixel": 458.32,
          "yPixel": 148.58
        },
        {
          "n": 2,
          "xPixel": 599.2,
          "yPixel": 47.42
        }
      ],
      "19000": [
        {
          "n": 1,
          "xPixel": 458.94,
          "yPixel": 116.31
        },
        {
          "n": 2,
          "xPixel": 556.99,
          "yPixel": 43.07
        }
      ],
      "20000": [
        {
          "n": 1,
          "xPixel": 458.32,
          "yPixel": 87.14
        },
        {
          "n": 2,
          "xPixel": 516.66,
          "yPixel": 42.45
        }
      ],
      "21000": [
        {
          "n": 1,
          "xPixel": 459.56,
          "yPixel": 59.21
        },
        {
          "n": 2,
          "xPixel": 476.32,
          "yPixel": 42.45
        }
      ]
    },
    "cg": {
      "0": [
        {
          "n": 1,
          "xPixel": 680.24,
          "yPixel": 540.52
        },
        {
          "n": 2,
          "xPixel": 541.58,
          "yPixel": 539.55
        },
        {
          "n": 3,
          "xPixel": 538.67,
          "yPixel": 510.45
        },
        {
          "n": 4,
          "xPixel": 508.61,
          "yPixel": 524.03
        }
      ],
      "5": [
        {
          "n": 1,
          "xPixel": 678.3,
          "yPixel": 585.12
        },
        {
          "n": 2,
          "xPixel": 524.12,
          "yPixel": 584.15
        },
        {
          "n": 3,
          "xPixel": 508.61,
          "yPixel": 551.18
        },
        {
          "n": 4,
          "xPixel": 507.64,
          "yPixel": 522.09
        },
        {
          "n": 5,
          "xPixel": 484.36,
          "yPixel": 541.48
        }
      ],
      "10": [
        {
          "n": 1,
          "xPixel": 677.33,
          "yPixel": 624.88
        },
        {
          "n": 2,
          "xPixel": 550.3,
          "yPixel": 623.91
        },
        {
          "n": 3,
          "xPixel": 514.42,
          "yPixel": 599.67
        },
        {
          "n": 4,
          "xPixel": 495.03,
          "yPixel": 574.45
        },
        {
          "n": 5,
          "xPixel": 483.39,
          "yPixel": 542.45
        },
        {
          "n": 6,
          "xPixel": 472.73,
          "yPixel": 552.15
        }
      ],
      "15": [
        {
          "n": 1,
          "xPixel": 676.36,
          "yPixel": 663.67
        },
        {
          "n": 2,
          "xPixel": 596.85,
          "yPixel": 662.7
        },
        {
          "n": 3,
          "xPixel": 544.48,
          "yPixel": 640.39
        },
        {
          "n": 4,
          "xPixel": 512.48,
          "yPixel": 621.97
        },
        {
          "n": 5,
          "xPixel": 494.06,
          "yPixel": 600.64
        },
        {
          "n": 6,
          "xPixel": 482.42,
          "yPixel": 582.21
        },
        {
          "n": 7,
          "xPixel": 475.64,
          "yPixel": 558.94
        },
        {
          "n": 8,
          "xPixel": 473.7,
          "yPixel": 554.09
        },
        {
          "n": 9,
          "xPixel": 466.91,
          "yPixel": 561.85
        }
      ],
      "20": [
        {
          "n": 1,
          "xPixel": 679.27,
          "yPixel": 676.27
        },
        {
          "n": 2,
          "xPixel": 596.85,
          "yPixel": 678.21
        },
        {
          "n": 3,
          "xPixel": 537.7,
          "yPixel": 651.06
        },
        {
          "n": 4,
          "xPixel": 497.94,
          "yPixel": 618.09
        },
        {
          "n": 5,
          "xPixel": 476.61,
          "yPixel": 584.15
        },
        {
          "n": 6,
          "xPixel": 467.88,
          "yPixel": 560.88
        }
      ],
      "25": [
        {
          "n": 1,
          "xPixel": 679.27,
          "yPixel": 685.97
        },
        {
          "n": 2,
          "xPixel": 589.09,
          "yPixel": 685.97
        },
        {
          "n": 3,
          "xPixel": 542.55,
          "yPixel": 670.45
        },
        {
          "n": 4,
          "xPixel": 501.82,
          "yPixel": 641.36
        },
        {
          "n": 5,
          "xPixel": 480.48,
          "yPixel": 618.09
        },
        {
          "n": 6,
          "xPixel": 468.85,
          "yPixel": 593.85
        },
        {
          "n": 7,
          "xPixel": 464,
          "yPixel": 568.64
        }
      ]
    },
    "grossWeightBottom": {
      "12000": [
        {
          "n": 1,
          "xPixel": 45.09,
          "yPixel": 687.91
        },
        {
          "n": 2,
          "xPixel": 225.45,
          "yPixel": 509.48
        }
      ],
      "13000": [
        {
          "n": 1,
          "xPixel": 72.24,
          "yPixel": 684.03
        },
        {
          "n": 2,
          "xPixel": 249.7,
          "yPixel": 509.48
        }
      ],
      "14000": [
        {
          "n": 1,
          "xPixel": 96.48,
          "yPixel": 685
        },
        {
          "n": 2,
          "xPixel": 277.82,
          "yPixel": 509.48
        }
      ],
      "15000": [
        {
          "n": 1,
          "xPixel": 115.88,
          "yPixel": 687.91
        },
        {
          "n": 2,
          "xPixel": 303.03,
          "yPixel": 512.39
        }
      ],
      "16000": [
        {
          "n": 1,
          "xPixel": 137.21,
          "yPixel": 687.91
        },
        {
          "n": 2,
          "xPixel": 328.24,
          "yPixel": 512.39
        }
      ],
      "17000": [
        {
          "n": 1,
          "xPixel": 161.45,
          "yPixel": 689.85
        },
        {
          "n": 2,
          "xPixel": 354.42,
          "yPixel": 511.42
        }
      ],
      "18000": [
        {
          "n": 1,
          "xPixel": 180.85,
          "yPixel": 686.94
        },
        {
          "n": 2,
          "xPixel": 383.52,
          "yPixel": 510.45
        }
      ],
      "19000": [
        {
          "n": 1,
          "xPixel": 198.3,
          "yPixel": 685.97
        },
        {
          "n": 2,
          "xPixel": 407.76,
          "yPixel": 512.39
        }
      ],
      "20000": [
        {
          "n": 1,
          "xPixel": 212.85,
          "yPixel": 687.91
        },
        {
          "n": 2,
          "xPixel": 430.06,
          "yPixel": 513.36
        }
      ],
      "21000": [
        {
          "n": 1,
          "xPixel": 230.3,
          "yPixel": 689.85
        },
        {
          "n": 2,
          "xPixel": 432,
          "yPixel": 530.82
        }
      ]
    }
  },
  "meta": {
    "pressureAltitudeValues": [
      "SL",
      2000,
      4000,
      6000,
      8000
    ],
    "grossWeightValues": [
      12000,
      13000,
      14000,
      15000,
      16000,
      17000,
      18000,
      19000,
      20000,
      21000
    ],
    "cgValues": [
      0,
      5,
      10,
      15,
      20,
      25
    ],
    "notes": "Gross Weight y CG digitalizados como polilíneas. El cálculo posterior deberá interpolar valores intermedios sin extrapolar fuera del rango digitalizado."
  }
};
const D = window.FA23_SETOS_DATA;
function sx(scale,v){
 const a=Number(scale.a),b=Number(scale.b),x1=scale.pA.x,x2=scale.pB.x;
 return x1+(v-a)*(x2-x1)/(b-a);
}
function bracket(values,v){
 const a=values.slice().sort((x,y)=>x-y);
 if(v<a[0] || v>a[a.length-1]) return null;
 if(v===a[a.length-1]) return {lo:v,hi:v,t:0};
 for(let i=0;i<a.length-1;i++) if(v>=a[i] && v<=a[i+1])
   return {lo:a[i],hi:a[i+1],t:(v-a[i])/(a[i+1]-a[i])};
 return null;
}
function yAtX(pts,x){
 for(let i=0;i<pts.length-1;i++){
   const p=pts[i],q=pts[i+1],dx=q.xPixel-p.xPixel;
   if(!dx) continue;
   if(x>=Math.min(p.xPixel,q.xPixel)-1e-7 && x<=Math.max(p.xPixel,q.xPixel)+1e-7){
     const t=(x-p.xPixel)/dx;
     return p.yPixel+t*(q.yPixel-p.yPixel);
   }
 }
 return null;
}
function xAtY(pts,y){
 for(let i=0;i<pts.length-1;i++){
   const p=pts[i],q=pts[i+1],dy=q.yPixel-p.yPixel;
   if(!dy) continue;
   if(y>=Math.min(p.yPixel,q.yPixel)-1e-7 && y<=Math.max(p.yPixel,q.yPixel)+1e-7){
     const t=(y-p.yPixel)/dy;
     return p.xPixel+t*(q.xPixel-p.xPixel);
   }
 }
 return null;
}
function interp(a,b,t){return a+(b-a)*t;}
function fail(message){return {valid:false,message};}

function calc(v){
 const tof=Number(v.tof),pa=Number(v.pa),gw=Number(v.gw),cg=Number(v.cg);
 if(![tof,pa,gw,cg].every(Number.isFinite)) return fail("Todos los campos deben ser numéricos.");
 if(tof<3||tof>11) return fail("TOF fuera del rango digitalizado: 3–11.");
 if(pa<0||pa>8000) return fail("Pressure Altitude fuera del rango: 0–8000 ft.");
 if(gw<12000||gw>21000) return fail("Gross Weight fuera del rango: 12.000–21.000 lb.");
 if(cg<0||cg>25) return fail("CG fuera del rango: 0–25 % MAC.");

 const E=D.elements, pvals=[0,2000,4000,6000,8000], pkeys=["SL","2000","4000","6000","8000"];
 const xTOF=sx(D.scales.takeoffFactor,tof);
 const pb=bracket(pvals,pa); if(!pb) return fail("PA fuera del rango.");
 const yLo=yAtX(E.pressureAltitude[pkeys[pvals.indexOf(pb.lo)]],xTOF);
 const yHi=yAtX(E.pressureAltitude[pkeys[pvals.indexOf(pb.hi)]],xTOF);
 if(yLo===null || yHi===null) return fail("El TOF indicado queda fuera del tramo común disponible de las curvas de PA para esa altitud.");
 const yPA=interp(yLo,yHi,pb.t);

 const gvals=D.meta.grossWeightValues.map(Number);
 const gb=bracket(gvals,gw); if(!gb) return fail("GW fuera del rango.");
 const xGWlo=xAtY(E.grossWeightTop[String(gb.lo)],yPA);
 const xGWhi=xAtY(E.grossWeightTop[String(gb.hi)],yPA);
 if(xGWlo===null || xGWhi===null) return fail("La horizontal desde PA no intercepta las curvas de Gross Weight necesarias para ese GW.");
 const xGW=interp(xGWlo,xGWhi,gb.t);

 const cvals=D.meta.cgValues.map(Number), cb=bracket(cvals,cg); if(!cb) return fail("CG fuera del rango.");
 const yCGlo=yAtX(E.cg[String(cb.lo)],xGW);
 const yCGhi=yAtX(E.cg[String(cb.hi)],xGW);
 if(yCGlo===null || yCGhi===null) return fail("La vertical desde Gross Weight no intercepta las curvas de CG necesarias para ese CG.");
 const yCG=interp(yCGlo,yCGhi,cb.t);

 const xBLo=xAtY(E.grossWeightBottom[String(gb.lo)],yCG);
 const xBHi=xAtY(E.grossWeightBottom[String(gb.hi)],yCG);
 if(xBLo===null || xBHi===null) return fail("La horizontal desde CG no intercepta las curvas inferiores de Gross Weight necesarias para ese GW.");
 const xSET=interp(xBLo,xBHi,gb.t);

 const setos=Number(D.scales.setos.a)+(xSET-D.scales.setos.pA.x)*(Number(D.scales.setos.b)-Number(D.scales.setos.a))/(D.scales.setos.pB.x-D.scales.setos.pA.x);
 if(xSET<D.scales.setos.pA.x-0.01 || xSET>D.scales.setos.pB.x+0.01) return fail("El resultado queda fuera de la escala SETOS digitalizada.");

 return {
   valid:true,
   inputs:{takeoffFactor:tof,pressureAltitude:pa,grossWeight:gw,cg},
   result:{setos},
   interpolation:{
     pressureAltitude:{lower:pb.lo,upper:pb.hi,fraction:pb.t},
     grossWeight:{lower:gb.lo,upper:gb.hi,fraction:gb.t},
     cg:{lower:cb.lo,upper:cb.hi,fraction:cb.t}
   },
   path:{
     tof:{x:xTOF,y:336.88},
     pressureAltitude:{x:xTOF,y:yPA},
     grossWeight:{x:xGW,y:yPA},
     cg:{x:xGW,y:yCG},
     setos:{x:xSET,y:D.scales.setos.pA.y,value:setos},
     bottomGW:{x:xSET,y:yCG}
   }
 };
}


window.calculateFA23SETOS = calc;

})();

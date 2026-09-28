window.calculateFA23Acceleration = function (args) {
    const DATA=window.FA23_ACCELERATION_DATA; if(!DATA)return {valid:false,message:"No se encontraron los datos de digitalización de aceleración."};
    const {takeoffSpeed,takeoffDistanceFt,controlDistanceFt}=args||{}; const S=DATA.scales,C=DATA.elements.referenceCurves;
    const v0=Number(takeoffSpeed),d0=Number(takeoffDistanceFt)/1000,d1=Number(controlDistanceFt)/1000;
    if(![v0,d0,d1].every(Number.isFinite))return {valid:false,message:"Faltan datos válidos para el cálculo de aceleración."};
    if(v0<40||v0>200)return {valid:false,message:"La velocidad inicial debe estar entre 40 y 200 KIAS."};
    if(d0<0||d0>14)return {valid:false,message:"La distancia de despegue debe estar entre 0 y 14.000 ft."};
    if(d1<0||d1>14)return {valid:false,message:"La distancia de control debe estar entre 0 y 14.000 ft."};
    if(d1>d0)return {
    valid:false,
    message:"La distancia de control no puede ser mayor que la distancia de despegue."
};
    function sx(v){let s=S.airspeed,t=(v-s.a)/(s.b-s.a);return s.pA.x+t*(s.pB.x-s.pA.x)}
    function sy(v){let s=S.accelerationDistance,t=(v-s.a)/(s.b-s.a);return s.pA.y+t*(s.pB.y-s.pA.y)}
    function xv(x){let s=S.airspeed,t=(x-s.pA.x)/(s.pB.x-s.pA.x);return s.a+t*(s.b-s.a)}
    function cy(pts,x){pts=pts.slice().sort((a,b)=>a.x-b.x);for(let i=0;i<pts.length-1;i++){let a=pts[i],b=pts[i+1];if(x>=a.x&&x<=b.x){let t=(x-a.x)/(b.x-a.x);return a.y+t*(b.y-a.y)}}return null}
    function guideY(x,f){let lo=Math.max(1,Math.min(7,Math.floor(f))),hi=lo+1,frac=f-lo,y1=cy(C[String(lo)],x),y2=cy(C[String(hi)],x);if(y1==null||y2==null)return null;return y1+frac*(y2-y1)}
    function family(x,y){let a=[];for(let i=1;i<=8;i++){let q=cy(C[String(i)],x);if(q!=null)a.push({i,y:q})}a.sort((m,n)=>m.y-n.y);for(let i=0;i<a.length-1;i++){let p=a[i],q=a[i+1];if(y>=p.y&&y<=q.y)return {lo:p.i,hi:q.i,f:p.i+(y-p.y)/(q.y-p.y)}}let n=a.reduce((p,q)=>Math.abs(q.y-y)<Math.abs(p.y-y)?q:p);return {lo:n.i,hi:n.i,f:n.i}}
    const x0=sx(v0),y0=sy(d0),yt=sy(d1),f=family(x0,y0); if(!f)return {valid:false,message:"El punto inicial queda fuera de las curvas de referencia."};
    const ys=guideY(x0,f.f);if(ys==null)return {valid:false,message:"No se pudo construir la trayectoria de aceleración en el punto inicial."};
    const pts=[];for(let x=S.airspeed.pA.x;x<=S.airspeed.pB.x;x+=2){let y=guideY(x,f.f);if(y!=null)pts.push({x,y:y+(y0-ys)})}
    let hit=null;for(let i=0;i<pts.length-1;i++){let a=pts[i],b=pts[i+1];if((yt-a.y)*(yt-b.y)<=0&&a.y!==b.y){let t=(yt-a.y)/(b.y-a.y);hit={x:a.x+t*(b.x-a.x),y:yt};break}}
    if(!hit)return {valid:false,message:"La distancia de control queda fuera del recorrido representado por la trayectoria."};
    const v1=xv(hit.x);if(!Number.isFinite(v1)||v1<40||v1>200)return {valid:false,message:"La velocidad resultante queda fuera del rango 40–200 KIAS."};
    const axisY=sy(0),axisX=S.accelerationDistance.pA.x;return {valid:true,result:{speed:v1,controlDistanceFt:Number(controlDistanceFt),takeoffDistanceFt:Number(takeoffDistanceFt)},path:{initial:{x:x0,y:y0},guide:pts,control:{x:hit.x,y:yt},speed:{x:hit.x,y:axisY},projections:{initialSpeed:{x:x0,y:axisY},initialDistance:{x:axisX,y:y0},controlDistance:{x:axisX,y:yt}},family:f}};
};

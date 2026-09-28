window.FA23TOGR = (() => {
    const DATA = window.FA23TOGR_DATA;

    function scaleY(s, v) {
        const a = Number(s.a), b = Number(s.b);
        const t = (v - a) / (b - a);
        return s.pA.y + t * (s.pB.y - s.pA.y);
    }

    function scaleX(s, v) {
        const a = Number(s.a), b = Number(s.b);
        const t = (v - a) / (b - a);
        return s.pA.x + t * (s.pB.x - s.pA.x);
    }

    function xAtY(points, y) {
        const pts = points.slice().sort((a, b) => a.yPixel - b.yPixel);
        for (let i = 0; i < pts.length - 1; i++) {
            const a = pts[i], b = pts[i + 1];
            if (
                y >= Math.min(a.yPixel, b.yPixel) - 1e-7 &&
                y <= Math.max(a.yPixel, b.yPixel) + 1e-7 &&
                a.yPixel !== b.yPixel
            ) {
                const t = (y - a.yPixel) / (b.yPixel - a.yPixel);
                return a.xPixel + t * (b.xPixel - a.xPixel);
            }
        }
        return null;
    }

    function pointLineAtY(a, b, y) {
        if (a.yPixel === b.yPixel) return null;
        const t = (y - a.yPixel) / (b.yPixel - a.yPixel);
        return a.xPixel + t * (b.xPixel - a.xPixel);
    }

    function chooseFamilyLine(family, x0) {
        let best = null;
        for (const [key, pts] of Object.entries(DATA.elements[family])) {
            const dist = Math.abs(pts[0].xPixel - x0);
            if (!best || dist < best.dist) {
                best = { key, pts, dist };
            }
        }
        return best;
    }

    function calculate({ takeoffFactor, grossWeight, cg, windType = "calm", wind = 0 }) {
        const tof = Number(takeoffFactor);
        const gw = Number(grossWeight);
        const cgValue = Number(cg);
        const windValue = Number(wind);

        if (!Number.isFinite(tof) || tof < 0 || tof > 10) {
            return { valid: false, message: "TOF debe estar entre 0 y 10." };
        }
        if (!Number.isFinite(gw) || gw < 12000 || gw > 24000) {
            return { valid: false, message: "Gross Weight debe estar entre 12.000 y 24.000 lb." };
        }
        if (!Number.isFinite(cgValue) || cgValue < 5 || cgValue > 25) {
            return { valid: false, message: "CG debe estar entre 5 y 25 % MAC." };
        }
        if (!Number.isFinite(windValue) || windValue < 0 || windValue > 40) {
            return { valid: false, message: "El viento debe estar entre 0 y 40 kt." };
        }

        const tofY = scaleY(DATA.scales.takeoffFactor, tof);
        const gwCurves = DATA.elements.grossWeight;
        const gwVals = Object.keys(gwCurves).map(Number).sort((a, b) => a - b);
        const lo = gwVals.filter(v => v <= gw).pop();
        const hi = gwVals.find(v => v >= gw);

        if (lo === undefined || hi === undefined) {
            return { valid: false, message: "Gross Weight fuera del rango de las curvas digitalizadas." };
        }

        const xLo = xAtY(gwCurves[String(lo)], tofY);
        const xHi = xAtY(gwCurves[String(hi)], tofY);

        if (xLo === null || xHi === null) {
            return { valid: false, message: "El TOF seleccionado no intersecta la curva de Gross Weight solicitada." };
        }

        const xGW = lo === hi
            ? xLo
            : xLo + (gw - lo) / (hi - lo) * (xHi - xLo);

        const yB1 = (
            DATA.elements.baseline1[0].yPixel +
            DATA.elements.baseline1[1].yPixel
        ) / 2;

        let xWind = xGW;
        let windInfo = "Calma: descenso vertical.";
        let windReference = null;

        if (windValue > 0) {
            const family = windType === "headwind" ? "headwind" : "tailwind";
            const selected = chooseFamilyLine(family, xGW);
            if (!selected) {
                return { valid: false, message: "No se pudo seleccionar una referencia de viento." };
            }

            const pts = selected.pts;
            const yWind = scaleY(DATA.scales.wind, windValue);
            const localX = pointLineAtY(pts[0], pts[pts.length - 1], yWind);
            if (localX === null) {
                return { valid: false, message: "No se pudo construir el recorrido de viento con las referencias digitalizadas." };
            }

            const dx = xGW - pts[0].xPixel;
            xWind = localX + dx;
            windReference = selected.key;
            windInfo = (windType === "headwind" ? "Viento de frente" : "Viento de cola") + " · referencia " + selected.key;
        }

        const yWind = scaleY(DATA.scales.wind, windValue);
        const yB3 = (
            DATA.elements.baseline3[0].yPixel +
            DATA.elements.baseline3[1].yPixel
        ) / 2;
        const yCG = scaleY(DATA.scales.cg, cgValue);

        let xCG = xWind;
        let cgInfo = "CG 15 %: coincide con BASELINE 3.";
        let cgReference = null;
        let cgBranch = "15";

        if (Math.abs(cgValue - 15) >= 1e-9) {
            const family = cgValue > 15 ? "cgUpper" : "cgLower";
            const selected = chooseFamilyLine(family, xWind);
            if (!selected) {
                return { valid: false, message: "No se pudo seleccionar una referencia de CG." };
            }

            const pA = selected.pts[0];
            const pB = selected.pts[selected.pts.length - 1];
            const anchor = family === "cgUpper"
                ? (Math.abs(pB.yPixel - yB3) <= Math.abs(pA.yPixel - yB3) ? pB : pA)
                : (Math.abs(pA.yPixel - yB3) <= Math.abs(pB.yPixel - yB3) ? pA : pB);
            const other = anchor === pA ? pB : pA;
            const dy = other.yPixel - anchor.yPixel;
            const dx = other.xPixel - anchor.xPixel;

            if (Math.abs(dy) < 1e-9) {
                return { valid: false, message: "La referencia de CG no tiene pendiente utilizable." };
            }

            const slope = dx / dy;
            xCG = xWind + slope * (yCG - yB3);
            cgReference = selected.key;
            cgBranch = cgValue > 15 ? "upper" : "lower";
            cgInfo = cgValue > 15
                ? "CG > 15 %: sube en diagonal paralela a las referencias superiores · referencia " + selected.key
                : "CG < 15 %: baja en diagonal paralela a las referencias inferiores · referencia " + selected.key;
        }

        const grY = (
            DATA.scales.takeoffGroundRun.pA.y +
            DATA.scales.takeoffGroundRun.pB.y
        ) / 2;
        const x0 = DATA.scales.takeoffGroundRun.pA.x;
        const x14 = DATA.scales.takeoffGroundRun.pB.x;
        const togr = (xCG - x0) / (x14 - x0) * 14;

        if (!Number.isFinite(togr) || togr < 0 || togr > 14) {
            return { valid: false, message: "El recorrido termina fuera de la escala de Takeoff Ground Run." };
        }

        return {
            valid: true,
            result: {
                togr,
                togrFt: Math.round(togr * 1000)
            },
            path: {
                tof: { x: DATA.scales.takeoffFactor.pA.x, y: tofY },
                grossWeight: { x: xGW, y: tofY },
                baseline1: { x: xGW, y: yB1 },
                wind: { x: xWind, y: yWind },
                baseline3: { x: xWind, y: yB3 },
                cg: { x: xCG, y: yCG },
                togr: { x: xCG, y: grY }
            },
            wind: {
                type: windType,
                value: windValue,
                reference: windReference,
                info: windInfo
            },
            cg: {
                value: cgValue,
                branch: cgBranch,
                reference: cgReference,
                info: cgInfo
            },
            trace: [
                `TOF ${tof.toFixed(2)} → horizontal → GW ${gw.toLocaleString("es-ES")} lb.`,
                "GW → vertical → BASELINE 1.",
                windInfo,
                "Viento → vertical → BASELINE 3.",
                cgInfo,
                "CG → vertical → TOGR.",
                `Resultado: ${togr.toFixed(2)} × 1000 ft = ${Math.round(togr * 1000).toLocaleString("es-ES")} ft.`
            ]
        };
    }

    return { calculate };
})();

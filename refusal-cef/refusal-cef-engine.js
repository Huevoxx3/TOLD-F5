/* =========================================================
   FA-23 — REFUSAL SPEED / CRITICAL ENGINE FAILURE SPEED
   Motor geométrico de producción.

   Entradas:
   - tof
   - grossWeight
   - cflFt (CFL ya calculado por la tabla CFL anterior)
   - rcr

   El motor NO recalcula CFL. Utiliza exactamente el CFL recibido.
   ========================================================= */
(function () {
    "use strict";

    const EPS = 0.75;

    function clamp(v, a, b) {
        return Math.max(a, Math.min(b, v));
    }

    function lerp(a, b, t) {
        return a + (b - a) * t;
    }

    function lineY(a, b, x) {
        const dx = b.xPixel - a.xPixel;
        if (Math.abs(dx) < 1e-12) return (a.yPixel + b.yPixel) / 2;
        return a.yPixel + (b.yPixel - a.yPixel) * (x - a.xPixel) / dx;
    }

    function lineX(a, b, y) {
        const dy = b.yPixel - a.yPixel;
        if (Math.abs(dy) < 1e-12) return (a.xPixel + b.xPixel) / 2;
        return a.xPixel + (b.xPixel - a.xPixel) * (y - a.yPixel) / dy;
    }

    function yAtX(points, x) {
        if (!points || points.length < 2) return null;
        const p = [...points].sort((a, b) => a.xPixel - b.xPixel);
        for (let i = 0; i < p.length - 1; i++) {
            if (x >= p[i].xPixel - EPS && x <= p[i + 1].xPixel + EPS) {
                return lineY(p[i], p[i + 1], x);
            }
        }
        if (x >= p[0].xPixel - EPS * 4 && x < p[0].xPixel) {
            return lineY(p[0], p[1], x);
        }
        if (x <= p.at(-1).xPixel + EPS * 4 && x > p.at(-1).xPixel) {
            return lineY(p.at(-2), p.at(-1), x);
        }
        return null;
    }

    function xAtY(points, y) {
        if (!points || points.length < 2) return null;
        const p = [...points].sort((a, b) => a.yPixel - b.yPixel);
        for (let i = 0; i < p.length - 1; i++) {
            if (y >= p[i].yPixel - EPS && y <= p[i + 1].yPixel + EPS) {
                return lineX(p[i], p[i + 1], y);
            }
        }
        if (y >= p[0].yPixel - EPS * 4 && y < p[0].yPixel) {
            return lineX(p[0], p[1], y);
        }
        if (y <= p.at(-1).yPixel + EPS * 4 && y > p.at(-1).yPixel) {
            return lineX(p.at(-2), p.at(-1), y);
        }
        return null;
    }

    function xScale(points, a, b, value) {
        return points[0].xPixel +
            (value - a) * (points[1].xPixel - points[0].xPixel) / (b - a);
    }

    function valueScale(points, a, b, x) {
        return a +
            (x - points[0].xPixel) * (b - a) /
            (points[1].xPixel - points[0].xPixel);
    }

    function yScale(points, a, b, value) {
        return points[0].yPixel +
            (value - a) * (points[1].yPixel - points[0].yPixel) / (b - a);
    }

    function keys(family) {
        return Object.keys(family).map(Number).sort((a, b) => a - b);
    }

    function bracket(value, values) {
        if (value <= values[0]) return [values[0], values[0], 0];
        if (value >= values.at(-1)) return [values.at(-1), values.at(-1), 0];
        for (let i = 0; i < values.length - 1; i++) {
            if (value >= values[i] && value <= values[i + 1]) {
                return [values[i], values[i + 1],
                    (value - values[i]) / (values[i + 1] - values[i])];
            }
        }
        return [values[0], values[0], 0];
    }

    function interpolatedGWY(data, gw, x) {
        const k = keys(data.elements.grossWeight);
        const [lo, hi, t] = bracket(gw, k);
        const y1 = yAtX(data.elements.grossWeight[String(lo)], x);
        const y2 = yAtX(data.elements.grossWeight[String(hi)], x);
        return y1 == null || y2 == null ? null : lerp(y1, y2, t);
    }

    function interpolatedCFLX(data, cfl, y) {
        const k = keys(data.elements.rwyCfl);
        const [lo, hi, t] = bracket(cfl, k);
        const x1 = xAtY(data.elements.rwyCfl[String(lo)], y);
        const x2 = xAtY(data.elements.rwyCfl[String(hi)], y);
        return x1 == null || x2 == null ? null : lerp(x1, x2, t);
    }

    function baselineX(curve, baseline) {
        const y = (baseline[0].yPixel + baseline[1].yPixel) / 2;
        return xAtY(curve, y) ?? curve[0].xPixel;
    }

    function interpolatedRefX(family, baseline, xBase, yTarget) {
        const refs = keys(family)
            .map(k => ({
                k,
                x: baselineX(family[String(k)], baseline),
                targetX: xAtY(family[String(k)], yTarget)
            }))
            .sort((a, b) => a.x - b.x);

        // Caso normal: las dos curvas vecinas llegan al RCR solicitado.
        for (let i = 0; i < refs.length - 1; i++) {
            const a = refs[i];
            const b = refs[i + 1];
            if (xBase >= a.x - EPS && xBase <= b.x + EPS &&
                a.targetX != null && b.targetX != null) {
                const t = clamp((xBase - a.x) / (b.x - a.x), 0, 1);
                return lerp(a.targetX, b.targetX, t);
            }
        }

        // Algunas curvas digitalizadas terminan antes de alcanzar RCR bajos.
        // En ese caso usamos la referencia disponible más próxima al punto de
        // partida. Esto evita que un pequeño hueco de digitalización invalide
        // todo el recorrido.
        const valid = refs.filter(r => r.targetX != null);
        if (!valid.length) return null;

        valid.sort((a, b) =>
            Math.abs(a.x - xBase) - Math.abs(b.x - xBase)
        );

        return valid[0].targetX;
    }

    function calculate(data, input) {
const tof = Number(input.tof);
const grossWeight = Number(input.grossWeight);
const cflFt = Number(input.cflFt);
const runwayLengthFt = Number(input.runwayLengthFt);
const rcr = Number(input.rcr);

        if (!Number.isFinite(tof) || tof < 1 || tof > 10) {
            return { valid: false, message: "TOF fuera del rango 1–10." };
        }
        if (!Number.isFinite(grossWeight) || grossWeight < 12000 || grossWeight > 24000) {
            return { valid: false, message: "Gross Weight fuera del rango 12.000–24.000 lb." };
        }
        if (!Number.isFinite(cflFt) || cflFt < 4000 || cflFt > 14000) {
            return { valid: false, message: "CFL fuera del rango 4.000–14.000 ft." };
        }
        if (!Number.isFinite(runwayLengthFt) || runwayLengthFt < 4000 || runwayLengthFt > 14000) {
    return { valid: false, message: "Longitud de pista fuera del rango 4.000–14.000 ft." };
}
        if (!Number.isFinite(rcr) || rcr < 0 || rcr > 23) {
            return { valid: false, message: "RCR fuera del rango 0–23." };
        }

        const cfl = cflFt;
        const xTOF = xScale(data.elements.tof, 1, 10, tof);
        const yGW = interpolatedGWY(data, grossWeight, xTOF);
        if (yGW == null) return { valid: false, message: "No se pudo interceptar Gross Weight." };

        const xCFL = interpolatedCFLX(data, cfl, yGW);
        if (xCFL == null) return { valid: false, message: "No se pudo interceptar RWY CFL." };

        const xRunway =
    interpolatedCFLX(
        data,
        runwayLengthFt,
        yGW
    );

if (xRunway == null) {
    return {
        valid: false,
        message: "No se pudo interceptar longitud de pista."
    };
}

const yB1 = yAtX(data.elements.baseline1, xRunway);
const yR1 = yScale(data.elements.rcr1, 0, 23, rcr);
        if (yB1 == null) return { valid: false, message: "No se pudo llegar a BASELINE 1." };

        let xRef1 = xRunway;
        if (rcr < 23) {
            xRef1 = interpolatedRefX(
    data.elements.refusalCurves,
    data.elements.baseline1,
    xRunway,
    yR1
);
        }
        if (xRef1 == null) return { valid: false, message: "No se pudo interpolar la referencia superior." };

        const yRS = yAtX(data.elements.refusalSpeed, xRef1);
        const refusal = valueScale(data.elements.refusalSpeed, 90, 180, xRef1);
        if (yRS == null || !Number.isFinite(refusal)) return { valid: false, message: "No se pudo obtener REFUSAL SPEED." };

const yB2 = yAtX(data.elements.baseline2, xCFL);
if (yB2 == null) return { valid: false, message: "No se pudo llegar a BASELINE 2." };

const yR2 = yScale(data.elements.rcr2, 0, 23, rcr);

let xRef2 = xCFL;

if (rcr < 23) {
    xRef2 = interpolatedRefX(
        data.elements.cefCurves,
        data.elements.baseline2,
        xCFL,
        yR2
    );
}

if (xRef2 == null) {
    return {
        valid: false,
        message: "No se pudo interpolar la referencia inferior."
    };
}
        if (xRef2 == null) return { valid: false, message: "No se pudo interpolar la referencia inferior." };

        const yCEF = yAtX(data.elements.criticalEngineFailureSpeed, xRef2);
        const cef = valueScale(data.elements.criticalEngineFailureSpeed, 90, 180, xRef2);
        if (yCEF == null || !Number.isFinite(cef)) return { valid: false, message: "No se pudo obtener CRITICAL ENGINE FAILURE SPEED." };

        const yTOF = (data.elements.tof[0].yPixel + data.elements.tof[1].yPixel) / 2;
const refusalPath = [
    { x: xTOF, y: yTOF },
    { x: xTOF, y: yGW },
    { x: xRunway, y: yGW },
    { x: xRunway, y: yB1 }
];

if (rcr < 23) {
    refusalPath.push({ x: xRef1, y: yR1 });
    refusalPath.push({ x: xRef1, y: yRS });
} else {
    refusalPath.push({ x: xRef1, y: yRS });
}


const cefPath = [
    { x: xTOF, y: yTOF },
    { x: xTOF, y: yGW },
    { x: xCFL, y: yGW },
    { x: xCFL, y: yB2 }
];

if (rcr < 23) {
    cefPath.push({ x: xRef2, y: yR2 });
    cefPath.push({ x: xRef2, y: yCEF });
} else {
    cefPath.push({ x: xRef2, y: yCEF });
}

        return {
            valid: true,
            inputs: { tof, grossWeight, cflFt, rcr },
            result: { refusalSpeed: refusal, criticalEngineFailureSpeed: cef },
            refusalPath,
cefPath,
            points: {
                tof: { x: xTOF, y: yTOF },
                grossWeight: { x: xTOF, y: yGW },
                rwyCfl: { x: xCFL, y: yGW },
                refusalSpeed: { x: xRef1, y: yRS },
                cefSpeed: { x: xRef2, y: yCEF }
            }
        };
    }

    window.FA23RefusalCEF = { calculate };
})();

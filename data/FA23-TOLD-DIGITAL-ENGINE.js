/* =========================================================
   FA23 TOLD DIGITAL ENGINE
   TOF / OCS / TOS / TIRE LIMIT
   Base: calculador de prueba V5 validado
   ========================================================= */

const FA23_DIGITAL_DATA = {"version":"FA23-TOLD-DIGITALIZADOR-1","charts":{"tof":{"scales":{"temp":{"name":"Temperatura °C","a":-40,"b":60,"pA":{"x":23.333335876464844,"y":420.6666564941406},"pB":{"x":23.333335876464844,"y":9.333343505859375}},"tof":{"name":"TOF","a":0,"b":10,"pA":{"x":20,"y":874.0000305175781},"pB":{"x":22.666671752929688,"y":462.0000305175781}}},"elements":{"pressureAltitude":{"2000":[{"n":1,"xPixel":120,"yPixel":12},{"n":2,"xPixel":172,"yPixel":84.67},{"n":3,"xPixel":202,"yPixel":127.33},{"n":4,"xPixel":247.33,"yPixel":204},{"n":5,"xPixel":291.33,"yPixel":284},{"n":6,"xPixel":321.33,"yPixel":341.33},{"n":7,"xPixel":356,"yPixel":424.67}],"4000":[{"n":1,"xPixel":96.67,"yPixel":11.33},{"n":2,"xPixel":139.33,"yPixel":79.33},{"n":3,"xPixel":175.33,"yPixel":140},{"n":4,"xPixel":215.33,"yPixel":218},{"n":5,"xPixel":248,"yPixel":284},{"n":6,"xPixel":274,"yPixel":348.67},{"n":7,"xPixel":300,"yPixel":419.33}],"6000":[{"n":1,"xPixel":71.33,"yPixel":9.33},{"n":2,"xPixel":123.33,"yPixel":96},{"n":3,"xPixel":162,"yPixel":177.33},{"n":4,"xPixel":195.33,"yPixel":256.67},{"n":5,"xPixel":238,"yPixel":370.67},{"n":6,"xPixel":253.33,"yPixel":420}],"8000":[{"n":1,"xPixel":56.67,"yPixel":11.33},{"n":2,"xPixel":99.33,"yPixel":98.67},{"n":3,"xPixel":132,"yPixel":172},{"n":4,"xPixel":161.33,"yPixel":250.67},{"n":5,"xPixel":187.33,"yPixel":323.33},{"n":6,"xPixel":214,"yPixel":420.67}],"SL":[{"n":1,"xPixel":152,"yPixel":10},{"n":2,"xPixel":197.33,"yPixel":64.67},{"n":3,"xPixel":242,"yPixel":130.67},{"n":4,"xPixel":296.67,"yPixel":211.33},{"n":5,"xPixel":334.67,"yPixel":275.33},{"n":6,"xPixel":363.33,"yPixel":330.67},{"n":7,"xPixel":396,"yPixel":400.67}]},"thrust":{"MAX sin ANTI ICE":[{"n":1,"xPixel":22,"yPixel":832.67},{"n":2,"xPixel":394,"yPixel":466}],"MAX con ANTI ICE":[{"n":1,"xPixel":146.67,"yPixel":722},{"n":2,"xPixel":394.67,"yPixel":498}],"MIN sin ANTI ICE":[{"n":1,"xPixel":22.67,"yPixel":861.33},{"n":2,"xPixel":395.33,"yPixel":584}],"MIN con ANTI ICE":[{"n":1,"xPixel":146,"yPixel":782.67},{"n":2,"xPixel":394,"yPixel":616}],"MIL sin ANTI ICE":[{"n":1,"xPixel":20.67,"yPixel":874.67},{"n":2,"xPixel":394.67,"yPixel":630.67}],"MIL con ANTI ICE":[{"n":1,"xPixel":146,"yPixel":805.33},{"n":2,"xPixel":393.33,"yPixel":662}]}},"activeScale":"tof","family":"thrust","curve":"MIL con ANTI ICE","mode":null,"zoom":1},"ocs":{"scales":{"gw":{"name":"Gross Weight · 1000 lb","a":12,"b":24,"pA":{"x":10.16668701171875,"y":202.66665649414062},"pB":{"x":498.166748046875,"y":201.33334350585938}},"ocs":{"name":"OCS · KIAS","a":140,"b":260,"pA":{"x":10.8333740234375,"y":204.00003051757812},"pB":{"x":10.16668701171875,"y":10.000030517578125}}},"elements":{"cg":{"0":[{"n":1,"xPixel":11.5,"yPixel":147.33},{"n":2,"xPixel":110.17,"yPixel":118.67},{"n":3,"xPixel":194.17,"yPixel":100},{"n":4,"xPixel":288.83,"yPixel":78},{"n":5,"xPixel":377.5,"yPixel":56.67},{"n":6,"xPixel":458.83,"yPixel":38.67},{"n":7,"xPixel":496.17,"yPixel":31.33}],"5":[{"n":1,"xPixel":13.5,"yPixel":165.33},{"n":2,"xPixel":117.5,"yPixel":136},{"n":3,"xPixel":207.5,"yPixel":114},{"n":4,"xPixel":286.83,"yPixel":96},{"n":5,"xPixel":365.5,"yPixel":79.33},{"n":6,"xPixel":428.83,"yPixel":67.33},{"n":7,"xPixel":495.5,"yPixel":55.33}],"10":[{"n":1,"xPixel":12.83,"yPixel":173.33},{"n":2,"xPixel":112.83,"yPixel":146.67},{"n":3,"xPixel":197.5,"yPixel":122.67},{"n":4,"xPixel":274.17,"yPixel":107.33},{"n":5,"xPixel":355.5,"yPixel":90},{"n":6,"xPixel":423.5,"yPixel":75.33},{"n":7,"xPixel":498.17,"yPixel":60.67}],"15":[{"n":1,"xPixel":12.83,"yPixel":178},{"n":2,"xPixel":134.83,"yPixel":143.33},{"n":3,"xPixel":213.5,"yPixel":126.67},{"n":4,"xPixel":284.17,"yPixel":110},{"n":5,"xPixel":348.83,"yPixel":98},{"n":6,"xPixel":427.5,"yPixel":81.33},{"n":7,"xPixel":493.5,"yPixel":71.33}],"20":[{"n":1,"xPixel":14.17,"yPixel":182},{"n":2,"xPixel":96.83,"yPixel":160},{"n":3,"xPixel":189.5,"yPixel":138.67},{"n":4,"xPixel":268.83,"yPixel":121.33},{"n":5,"xPixel":341.5,"yPixel":106},{"n":6,"xPixel":406.83,"yPixel":93.33},{"n":7,"xPixel":492.83,"yPixel":76.67}],"25":[{"n":1,"xPixel":13.5,"yPixel":186},{"n":2,"xPixel":111.5,"yPixel":160.67},{"n":3,"xPixel":189.5,"yPixel":143.33},{"n":4,"xPixel":272.83,"yPixel":125.33},{"n":5,"xPixel":342.83,"yPixel":112},{"n":6,"xPixel":416.17,"yPixel":98.67},{"n":7,"xPixel":494.83,"yPixel":84.67}]}},"activeScale":"ocs","family":"cg","curve":"25","mode":null,"zoom":1},"tos":{"scales":{"gw":{"name":"Gross Weight · 1000 lb","a":12,"b":24,"pA":{"x":13.166664123535156,"y":234.3333740234375},"pB":{"x":497.1667022705078,"y":234.3333740234375}},"tos":{"name":"Takeoff Speed · KIAS","a":120,"b":260,"pA":{"x":13.833328247070312,"y":233},"pB":{"x":11.833328247070312,"y":9}}},"elements":{"cg":{"0":[{"n":1,"xPixel":12.5,"yPixel":151.67},{"n":2,"xPixel":126.5,"yPixel":119.67},{"n":3,"xPixel":238.5,"yPixel":93},{"n":4,"xPixel":358.5,"yPixel":65.67},{"n":5,"xPixel":496.5,"yPixel":34.33}],"5":[{"n":1,"xPixel":13.83,"yPixel":167.67},{"n":2,"xPixel":119.17,"yPixel":139.67},{"n":3,"xPixel":234.5,"yPixel":113},{"n":4,"xPixel":340.5,"yPixel":89.67},{"n":5,"xPixel":444.5,"yPixel":68.33},{"n":6,"xPixel":495.83,"yPixel":59}],"10":[{"n":1,"xPixel":13.83,"yPixel":185},{"n":2,"xPixel":122.5,"yPixel":156.33},{"n":3,"xPixel":231.83,"yPixel":131.67},{"n":4,"xPixel":327.17,"yPixel":113},{"n":5,"xPixel":404.5,"yPixel":99},{"n":6,"xPixel":496.5,"yPixel":79.67}],"15":[{"n":1,"xPixel":14.5,"yPixel":199},{"n":2,"xPixel":117.17,"yPixel":173.67},{"n":3,"xPixel":225.17,"yPixel":150.33},{"n":4,"xPixel":330.5,"yPixel":131},{"n":5,"xPixel":427.17,"yPixel":115},{"n":6,"xPixel":495.83,"yPixel":102.33}],"20":[{"n":1,"xPixel":13.83,"yPixel":203.67},{"n":2,"xPixel":117.83,"yPixel":179},{"n":3,"xPixel":212.5,"yPixel":159},{"n":4,"xPixel":312.5,"yPixel":140.33},{"n":5,"xPixel":416.5,"yPixel":122.33},{"n":6,"xPixel":493.83,"yPixel":109.67}],"25":[{"n":1,"xPixel":11.83,"yPixel":209.67},{"n":2,"xPixel":117.17,"yPixel":183.67},{"n":3,"xPixel":238.5,"yPixel":157.67},{"n":4,"xPixel":327.83,"yPixel":143.67},{"n":5,"xPixel":418.5,"yPixel":127.67},{"n":6,"xPixel":496.5,"yPixel":115}]}},"activeScale":"tos","family":"cg","curve":"25","mode":null,"zoom":1},"tire":{"scales":{"temp":{"name":"Temperatura °C","a":-40,"b":60,"pA":{"x":14.8333740234375,"y":143},"pB":{"x":418.166748046875,"y":141.66668701171875}},"speed":{"name":"Tire Limit Speed · KIAS","a":160,"b":240,"pA":{"x":14.8333740234375,"y":143},"pB":{"x":12.8333740234375,"y":12.333343505859375}}},"elements":{"pressureAltitude":{"2000":[{"n":1,"xPixel":14.17,"yPixel":26.33},{"n":2,"xPixel":94.83,"yPixel":42.33},{"n":3,"xPixel":174.17,"yPixel":55.67},{"n":4,"xPixel":258.17,"yPixel":67},{"n":5,"xPixel":337.5,"yPixel":78.33},{"n":6,"xPixel":415.5,"yPixel":88.33}],"4000":[{"n":1,"xPixel":14.83,"yPixel":39},{"n":2,"xPixel":98.83,"yPixel":55.67},{"n":3,"xPixel":178.83,"yPixel":68.33},{"n":4,"xPixel":266.83,"yPixel":80.33},{"n":5,"xPixel":338.17,"yPixel":91.67},{"n":6,"xPixel":416.83,"yPixel":99.67}],"6000":[{"n":1,"xPixel":14.17,"yPixel":52.33},{"n":2,"xPixel":112.83,"yPixel":69},{"n":3,"xPixel":196.83,"yPixel":82.33},{"n":4,"xPixel":275.5,"yPixel":94.33},{"n":5,"xPixel":348.83,"yPixel":103},{"n":6,"xPixel":417.5,"yPixel":111.67}],"8000":[{"n":1,"xPixel":15.5,"yPixel":65},{"n":2,"xPixel":103.5,"yPixel":81.67},{"n":3,"xPixel":188.83,"yPixel":93},{"n":4,"xPixel":262.17,"yPixel":103},{"n":5,"xPixel":335.5,"yPixel":111.67},{"n":6,"xPixel":416.83,"yPixel":122.33}],"SL":[{"n":1,"xPixel":14.17,"yPixel":11.67},{"n":2,"xPixel":94.83,"yPixel":29.67},{"n":3,"xPixel":180.17,"yPixel":43},{"n":4,"xPixel":260.17,"yPixel":54.33},{"n":5,"xPixel":335.5,"yPixel":66.33},{"n":6,"xPixel":417.5,"yPixel":77}]}},"activeScale":"speed","family":"pressureAltitude","curve":"8000","mode":null,"zoom":1}}};

window.FA23Digital = (() => {

    const C = FA23_DIGITAL_DATA.charts;

    function clamp(v, a, b) {
        return Math.max(a, Math.min(b, v));
    }

    function lerp(a, b, t) {
        return a + (b - a) * t;
    }

    function scaleValue(scale, value) {
        const t = (value - scale.a) / (scale.b - scale.a);
        return {
            x: lerp(scale.pA.x, scale.pB.x, t),
            y: lerp(scale.pA.y, scale.pB.y, t)
        };
    }

    function valueFromY(scale, y) {
        const t = (y - scale.pA.y) / (scale.pB.y - scale.pA.y);
        return scale.a + t * (scale.b - scale.a);
    }

    function curveYAtX(points, x) {
        if (!points || points.length === 0) return NaN;

        for (let i = 0; i < points.length - 1; i++) {
            const a = points[i];
            const b = points[i + 1];

            if (
                (a.xPixel <= x && x <= b.xPixel) ||
                (b.xPixel <= x && x <= a.xPixel)
            ) {
                const dx = b.xPixel - a.xPixel;

                if (Math.abs(dx) < 1e-9) return a.yPixel;

                const t = (x - a.xPixel) / dx;
                return lerp(a.yPixel, b.yPixel, t);
            }
        }

        return points.reduce(
            (best, p) =>
                Math.abs(p.xPixel - x) <
                Math.abs(best.xPixel - x) ? p : best,
            points[0]
        ).yPixel;
    }

    function curveXAtY(points, y) {
        if (!points || points.length === 0) return NaN;

        for (let i = 0; i < points.length - 1; i++) {
            const a = points[i];
            const b = points[i + 1];

            if (
                (a.yPixel <= y && y <= b.yPixel) ||
                (b.yPixel <= y && y <= a.yPixel)
            ) {
                const dy = b.yPixel - a.yPixel;

                if (Math.abs(dy) < 1e-9) return a.xPixel;

                const t = (y - a.yPixel) / dy;
                return lerp(a.xPixel, b.xPixel, t);
            }
        }

        return points.reduce(
            (best, p) =>
                Math.abs(p.yPixel - y) <
                Math.abs(best.yPixel - y) ? p : best,
            points[0]
        ).xPixel;
    }

    function pressureInterpolatedX(chart, temperature, pressureAltitude) {
        const yTemp = scaleValue(
            chart.scales.temp,
            clamp(temperature, -40, 60)
        ).y;

        const levels = [0, 2000, 4000, 6000, 8000];
        const keys = ["SL", "2000", "4000", "6000", "8000"];
        const pa = clamp(pressureAltitude, 0, 8000);

        let lo = 0;
        let hi = 1;

        for (let i = 0; i < levels.length - 1; i++) {
            if (pa >= levels[i] && pa <= levels[i + 1]) {
                lo = i;
                hi = i + 1;
                break;
            }
        }

        const x1 = curveXAtY(
            chart.elements.pressureAltitude[keys[lo]],
            yTemp
        );

        const x2 = curveXAtY(
            chart.elements.pressureAltitude[keys[hi]],
            yTemp
        );

        const t =
            (pa - levels[lo]) /
            (levels[hi] - levels[lo] || 1);

        return lerp(x1, x2, t);
    }

    function calculateTakeoffFactor(
        temperature,
        pressureAltitude,
        thrust,
        antiIce
    ) {
        const chart = C.tof;

        const x = pressureInterpolatedX(
            chart,
            temperature,
            pressureAltitude
        );

const thrustKey = {
    MAX: "MAX",
    MIN_AB: "MIN",
    MIL: "MIL"
}[thrust];

const key =
    thrustKey +
    " " +
    (antiIce === "ON" ? "con" : "sin") +
    " ANTI ICE";

        const line = chart.elements.thrust[key];

        if (!line) {
            return {
                valid: false,
                factor: null,
                reason: "Combinación de empuje / anti-ice no disponible."
            };
        }

        const y = curveYAtX(line, x);
        const factor = valueFromY(chart.scales.tof, y);

        if (!Number.isFinite(factor)) {
            return {
                valid: false,
                factor: null,
                reason: "No se pudo interpolar el Takeoff Factor."
            };
        }

        return {
            valid: true,
            factor: factor
        };
    }

    function calculateCGSpeed(chart, speedScale, grossWeightLb, cg) {
        const gw = clamp(
            Number(grossWeightLb) / 1000,
            12,
            24
        );

        const cgv = clamp(
            Number(cg),
            0,
            25
        );

        const x = scaleValue(
            chart.scales.gw,
            gw
        ).x;

        const levels = [0, 5, 10, 15, 20, 25];

        let lo = 0;
        let hi = 1;

        for (let i = 0; i < levels.length - 1; i++) {
            if (cgv >= levels[i] && cgv <= levels[i + 1]) {
                lo = i;
                hi = i + 1;
                break;
            }
        }

        const y1 = curveYAtX(
            chart.elements.cg[String(levels[lo])],
            x
        );

        const y2 = curveYAtX(
            chart.elements.cg[String(levels[hi])],
            x
        );

        const t =
            (cgv - levels[lo]) /
            (levels[hi] - levels[lo] || 1);

        const y = lerp(y1, y2, t);
        const speed = valueFromY(speedScale, y);

        return Number.isFinite(speed)
            ? { valid: true, speed: speed }
            : { valid: false, speed: null };
    }

    function calculateObstacleClearanceSpeed(grossWeightLb, cg) {
        return calculateCGSpeed(
            C.ocs,
            C.ocs.scales.ocs,
            grossWeightLb,
            cg
        );
    }

    function calculateTakeoffSpeed(grossWeightLb, cg) {
        return calculateCGSpeed(
            C.tos,
            C.tos.scales.tos,
            grossWeightLb,
            cg
        );
    }

    function calculateTireLimitSpeed(
        temperature,
        pressureAltitude
    ) {
        const chart = C.tire;

        const x = scaleValue(
            chart.scales.temp,
            clamp(temperature, -40, 60)
        ).x;

        const levels = [0, 2000, 4000, 6000, 8000];
        const keys = ["SL", "2000", "4000", "6000", "8000"];
        const pa = clamp(pressureAltitude, 0, 8000);

        let lo = 0;
        let hi = 1;

        for (let i = 0; i < levels.length - 1; i++) {
            if (pa >= levels[i] && pa <= levels[i + 1]) {
                lo = i;
                hi = i + 1;
                break;
            }
        }

        const y1 = curveYAtX(
            chart.elements.pressureAltitude[keys[lo]],
            x
        );

        const y2 = curveYAtX(
            chart.elements.pressureAltitude[keys[hi]],
            x
        );

        const t =
            (pa - levels[lo]) /
            (levels[hi] - levels[lo] || 1);

        const y = lerp(y1, y2, t);
        const speed = valueFromY(
            chart.scales.speed,
            y
        );

        return Number.isFinite(speed)
            ? { valid: true, speed: speed }
            : { valid: false, speed: null };
    }

    return {
        calculateTakeoffFactor,
        calculateObstacleClearanceSpeed,
        calculateTakeoffSpeed,
        calculateTireLimitSpeed
    };

})();
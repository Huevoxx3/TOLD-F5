/* =========================================================
   FA23 GRADIENTE — MOTOR DE CÁLCULO
   Acepta valores continuos dentro del dominio digitalizado.
   No extrapola fuera de las curvas.
   ========================================================= */

(function () {
  "use strict";

  const DATA = () => window.FA23_GRADIENT_DATA;

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function clamp(v, a, b) {
    return Math.max(a, Math.min(b, v));
  }

  function near(a, b, tol = 1e-9) {
    return Math.abs(a - b) <= tol;
  }

  function sortedNumericKeys(obj) {
    return Object.keys(obj)
      .map(k => k === "SL" ? 0 : Number(k))
      .filter(Number.isFinite)
      .sort((a, b) => a - b);
  }

  function scaleValueToX(scale, value) {
    const a = Number(scale.a), b = Number(scale.b);
    const xA = scale.pA.x, xB = scale.pB.x;
    if (value < Math.min(a, b) - 1e-9 || value > Math.max(a, b) + 1e-9) return null;
    return lerp(xA, xB, (value - a) / (b - a));
  }

  function scaleValueToY(scale, value) {
    const a = Number(scale.a), b = Number(scale.b);
    const yA = scale.pA.y, yB = scale.pB.y;
    if (value < Math.min(a, b) - 1e-9 || value > Math.max(a, b) + 1e-9) return null;
    return lerp(yA, yB, (value - a) / (b - a));
  }

  function scaleXToValue(scale, x) {
    const xA = scale.pA.x, xB = scale.pB.x;
    return Number(scale.a) + (x - xA) * (Number(scale.b) - Number(scale.a)) / (xB - xA);
  }

  function scaleYToValue(scale, y) {
    const yA = scale.pA.y, yB = scale.pB.y;
    return Number(scale.a) + (y - yA) * (Number(scale.b) - Number(scale.a)) / (yB - yA);
  }

  // Interpolación sobre una polilínea, buscando Y para un X.
  function yAtX(points, x, tolerance = 0.75) {
    const p = points.map(q => ({ x: q.xPixel, y: q.yPixel }));
    for (let i = 0; i < p.length - 1; i++) {
      const a = p[i], b = p[i + 1];
      const minX = Math.min(a.x, b.x), maxX = Math.max(a.x, b.x);
      if (x >= minX - tolerance && x <= maxX + tolerance) {
        if (Math.abs(b.x - a.x) < 1e-12) return a.y;
        const t = clamp((x - a.x) / (b.x - a.x), 0, 1);
        return lerp(a.y, b.y, t);
      }
    }
    return null;
  }

  // Interpolación sobre una polilínea, buscando X para un Y.
  function xAtY(points, y, tolerance = 0.75) {
    const p = points.map(q => ({ x: q.xPixel, y: q.yPixel }));
    for (let i = 0; i < p.length - 1; i++) {
      const a = p[i], b = p[i + 1];
      const minY = Math.min(a.y, b.y), maxY = Math.max(a.y, b.y);
      if (y >= minY - tolerance && y <= maxY + tolerance) {
        if (Math.abs(b.y - a.y) < 1e-12) return a.x;
        const t = clamp((y - a.y) / (b.y - a.y), 0, 1);
        return lerp(a.x, b.x, t);
      }
    }
    return null;
  }

  function bracket(values, target) {
    if (target < values[0] || target > values[values.length - 1]) return null;
    if (near(target, values[0])) return { lo: values[0], hi: values[0], t: 0 };
    if (near(target, values[values.length - 1])) {
      const v = values[values.length - 1];
      return { lo: v, hi: v, t: 0 };
    }
    for (let i = 0; i < values.length - 1; i++) {
      const lo = values[i], hi = values[i + 1];
      if (target >= lo && target <= hi) {
        return { lo, hi, t: (target - lo) / (hi - lo) };
      }
    }
    return null;
  }

  function fail(message, details = {}) {
    return { valid: false, message, details };
  }

  function calculateGradient(input) {
    const D = DATA();
    if (!D) return fail("No se cargaron los datos FA-23.");

    const tof = Number(input.takeoffFactor);
    const pa = Number(input.pressureAltitude);
    const gw = Number(input.grossWeight);
    const tailwind = Number(input.tailwind);

    if (![tof, pa, gw, tailwind].every(Number.isFinite)) {
      return fail("Todos los valores deben ser numéricos.");
    }

    const tofScale = D.scales.takeoffFactor;
    const rocScale = D.scales.rateOfClimb;
    const gradScale = D.scales.gradientPercent;
    const tailScale = D.scales.tailwind;
    const ftNmScale = D.scales.gradientFtNm;

    if (tof < Number(tofScale.a) || tof > Number(tofScale.b))
      return fail(`Takeoff Factor fuera de rango: ${tofScale.a}–${tofScale.b}.`);

    if (pa < 0 || pa > 8000)
      return fail("Pressure Altitude fuera del rango digitalizado: 0–8000 ft.");

    if (gw < 10000 || gw > 19000)
      return fail("Gross Weight fuera del rango digitalizado: 10.000–19.000 lb.");

    if (tailwind < 0 || tailwind > 40)
      return fail("Tailwind fuera del rango de la escala: 0–40 kt.");

    const xTOF = scaleValueToX(tofScale, tof);
    if (xTOF === null) return fail("No se pudo ubicar el Takeoff Factor.");

    // -----------------------------------------------------
    // 1. PRESSURE ALTITUDE
    // -----------------------------------------------------
    const paKeys = sortedNumericKeys(D.elements.pressureAltitude).map(v => v === 0 ? "SL" : String(v));
    const paNumeric = paKeys.map(k => k === "SL" ? 0 : Number(k));
    const paBracket = bracket(paNumeric, pa);
    if (!paBracket) return fail("Pressure Altitude no está cubierta por las curvas digitalizadas.");

    const curveKey = v => v === 0 ? "SL" : String(v);
    const curveLo = D.elements.pressureAltitude[curveKey(paBracket.lo)];
    const curveHi = D.elements.pressureAltitude[curveKey(paBracket.hi)];

    const yLo = yAtX(curveLo, xTOF, 1.25);
    const yHi = yAtX(curveHi, xTOF, 1.25);

    if (yLo === null || yHi === null) {
      return fail(
        `TOF ${tof.toFixed(2)} queda fuera del tramo digitalizado para la PA solicitada.`,
        { pressureAltitude: pa, takeoffFactor: tof }
      );
    }

    const yPA = paBracket.lo === paBracket.hi ? yLo : lerp(yLo, yHi, paBracket.t);
    const paInterpolation = {
      lower: paBracket.lo,
      upper: paBracket.hi,
      fraction: paBracket.t
    };

    // -----------------------------------------------------
    // 2. GROSS WEIGHT
    // -----------------------------------------------------
    const gwKeys = sortedNumericKeys(D.elements.grossWeight);
    const gwBracket = bracket(gwKeys, gw);
    if (!gwBracket) return fail("Gross Weight no está cubierto por las curvas digitalizadas.");

    function xOnWeightCurve(weight) {
      return xAtY(D.elements.grossWeight[String(weight)], yPA, 1.25);
    }

    const xGWLo = xOnWeightCurve(gwBracket.lo);
    const xGWHi = xOnWeightCurve(gwBracket.hi);

    if (xGWLo === null || xGWHi === null) {
      return fail(
        `La horizontal de PA no intersecta las curvas de peso necesarias para ${gw.toFixed(0)} lb.`,
        { pressureAltitude: pa, takeoffFactor: tof, grossWeight: gw }
      );
    }

    const xGW = gwBracket.lo === gwBracket.hi
      ? xGWLo
      : lerp(xGWLo, xGWHi, gwBracket.t);

    // -----------------------------------------------------
    // 3. RATE OF CLIMB
    // -----------------------------------------------------
    const roc = scaleXToValue(rocScale, xGW);
    if (roc < Number(rocScale.a) - 1 || roc > Number(rocScale.b) + 1) {
      return fail("El punto obtenido queda fuera de la escala de Rate of Climb.");
    }

    // -----------------------------------------------------
    // 4. REFERENCE CURVE
    // -----------------------------------------------------
    let yReference = yAtX(D.elements.referenceCurve, xGW, 3.0);
    if (yReference === null) {
      return fail("El descenso vertical no alcanza la Reference Curve digitalizada.");
    }

    // -----------------------------------------------------
    // 5. BASELINE
    // -----------------------------------------------------
    const baseline = D.elements.baseline;
    const baselineX = (baseline[0].xPixel + baseline[1].xPixel) / 2;
    const baselinePoint = { x: baselineX, y: yReference };

    // -----------------------------------------------------
    // 6. GUIDELINE MÁS PRÓXIMA EN BASELINE
    // -----------------------------------------------------
    let selectedGuideline = null;
    let selectedGuidelineY = null;
    let bestDistance = Infinity;

    for (const key of Object.keys(D.elements.guidelines)) {
      const line = D.elements.guidelines[key];
      const y = yAtX(line, baselineX, 6.0);
      if (y === null) continue;
      const dist = Math.abs(y - yReference);
      if (dist < bestDistance) {
        bestDistance = dist;
        selectedGuideline = Number(key);
        selectedGuidelineY = y;
      }
    }

    if (selectedGuideline === null) {
      return fail("No se pudo seleccionar una guideline válida en la baseline.");
    }

    // -----------------------------------------------------
    // 7. TAILWIND
    // -----------------------------------------------------
    const xTail = scaleValueToX(tailScale, tailwind);
    if (xTail === null) return fail("No se pudo ubicar el Tailwind.");

    const guideline = D.elements.guidelines[String(selectedGuideline)];
    const yGuidelineAtTail = yAtX(guideline, xTail, 2.0);
    if (yGuidelineAtTail === null) {
      return fail("El valor de Tailwind queda fuera del tramo de la guideline seleccionada.");
    }

    // -----------------------------------------------------
    // 8. GRADIENT %
    // -----------------------------------------------------
    const gradientPercent = scaleYToValue(gradScale, yGuidelineAtTail);
    const gradientFtNm = scaleYToValue(ftNmScale, yGuidelineAtTail);

    return {
      valid: true,
      inputs: { takeoffFactor: tof, pressureAltitude: pa, grossWeight: gw, tailwind },
      result: {
        rateOfClimb: roc,
        gradientPercent,
        gradientFtNm
      },
      interpolation: {
        pressureAltitude: paInterpolation,
        grossWeight: {
          lower: gwBracket.lo,
          upper: gwBracket.hi,
          fraction: gwBracket.t
        }
      },
      path: {
        takeoffFactor: { x: xTOF, y: yPA },
        pressureAltitude: {
          lower: { x: xTOF, y: yLo },
          upper: { x: xTOF, y: yHi },
          result: { x: xTOF, y: yPA }
        },
        grossWeight: {
          result: { x: xGW, y: yPA },
          lower: { x: xGWLo, y: yPA },
          upper: { x: xGWHi, y: yPA }
        },
        rateOfClimb: { x: xGW, y: yPA, value: roc },
        referenceCurve: { x: xGW, y: yReference },
        baseline: baselinePoint,
        guideline: {
          number: selectedGuideline,
          atBaseline: { x: baselineX, y: selectedGuidelineY },
          atTailwind: { x: xTail, y: yGuidelineAtTail }
        },
        tailwind: { x: xTail, y: yGuidelineAtTail, value: tailwind },
        gradientPercent: { x: scaleValueToX(gradScale, gradientPercent), y: yGuidelineAtTail, value: gradientPercent },
        gradientFtNm: { x: scaleValueToX(ftNmScale, gradientFtNm), y: yGuidelineAtTail, value: gradientFtNm }
      }
    };
  }

  window.calculateFA23Gradient = calculateGradient;
})();

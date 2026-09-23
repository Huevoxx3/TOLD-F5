/*
=========================================================
FA2-2 — TAKEOFF SPEED
=========================================================

Motor de interpolación para la carta FA2-2.

La carta utiliza:

    X = Gross Weight (1000 lb)

    Y = Takeoff Speed (KIAS)

    Curvas:
        CG 0%
        CG 5%
        CG 10%
        CG 15%
        CG 20%
        CG 25%

IMPORTANTE:

Los puntos de las curvas deben proceder de una
digitalización/lectura validada de la carta.

NO completar valores a ojo para uso operacional.
=========================================================
*/


// =====================================================
// DATOS DE LA CARTA
// =====================================================

const FA22_TAKEOFF_SPEED = {

    // CG 0 % MAC
    0: [
        { weight: 12, speed: 170 },
        { weight: 14, speed: 183 },
        { weight: 16, speed: 195 },
        { weight: 18, speed: 207 },
        { weight: 20, speed: 219 },
        { weight: 22, speed: 231 },
        { weight: 24, speed: 243 }
    ],

    // CG 5 % MAC
    5: [
        { weight: 12, speed: 160 },
        { weight: 14, speed: 173 },
        { weight: 16, speed: 185 },
        { weight: 18, speed: 197 },
        { weight: 20, speed: 208 },
        { weight: 22, speed: 219 },
        { weight: 24, speed: 230 }
    ],

    // CG 10 % MAC
    10: [
        { weight: 12, speed: 150 },
        { weight: 14, speed: 163 },
        { weight: 16, speed: 175 },
        { weight: 18, speed: 186 },
        { weight: 20, speed: 197 },
        { weight: 22, speed: 208 },
        { weight: 24, speed: 218 }
    ],

    // CG 15 % MAC
    15: [
        { weight: 12, speed: 143 },
        { weight: 14, speed: 154 },
        { weight: 16, speed: 165 },
        { weight: 18, speed: 176 },
        { weight: 20, speed: 186 },
        { weight: 22, speed: 196 },
        { weight: 24, speed: 205 }
    ],

    // CG 20 % MAC
    20: [
        { weight: 12, speed: 138 },
        { weight: 14, speed: 149 },
        { weight: 16, speed: 159 },
        { weight: 18, speed: 169 },
        { weight: 20, speed: 179 },
        { weight: 22, speed: 188 },
        { weight: 24, speed: 197 }
    ],

    // CG 25 % MAC
    25: [
        { weight: 12, speed: 135 },
        { weight: 14, speed: 146 },
        { weight: 16, speed: 156 },
        { weight: 18, speed: 166 },
        { weight: 20, speed: 176 },
        { weight: 22, speed: 185 },
        { weight: 24, speed: 194 }
    ]

};

// =====================================================
// FA2-2 — OBSTACLE CLEARANCE SPEED
// =====================================================

const FA22_OBSTACLE_CLEARANCE_SPEED = {

    0: [
        { weight: 12, speed: 176 },
        { weight: 14, speed: 185 },
        { weight: 16, speed: 200 },
        { weight: 18, speed: 211 },
        { weight: 20, speed: 223 },
        { weight: 22, speed: 235 },
        { weight: 24, speed: 247 }
    ],

    5: [
        { weight: 12, speed: 166 },
        { weight: 14, speed: 176 },
        { weight: 16, speed: 193 },
        { weight: 18, speed: 203 },
        { weight: 20, speed: 214 },
        { weight: 22, speed: 225 },
        { weight: 24, speed: 236 }
    ],

    10: [
        { weight: 12, speed: 159 },
        { weight: 14, speed: 171 },
        { weight: 16, speed: 185 },
        { weight: 18, speed: 197 },
        { weight: 20, speed: 208 },
        { weight: 22, speed: 219 },
        { weight: 24, speed: 228 }
    ],

    15: [
        { weight: 12, speed: 154 },
        { weight: 14, speed: 165 },
        { weight: 16, speed: 179 },
        { weight: 18, speed: 190 },
        { weight: 20, speed: 200 },
        { weight: 22, speed: 211 },
        { weight: 24, speed: 220 }
    ],

    20: [
        { weight: 12, speed: 151 },
        { weight: 14, speed: 161 },
        { weight: 16, speed: 173 },
        { weight: 18, speed: 184 },
        { weight: 20, speed: 194 },
        { weight: 22, speed: 204 },
        { weight: 24, speed: 213 }
    ],

    25: [
        { weight: 12, speed: 148 },
        { weight: 14, speed: 157 },
        { weight: 16, speed: 168 },
        { weight: 18, speed: 179 },
        { weight: 20, speed: 188 },
        { weight: 22, speed: 198 },
        { weight: 24, speed: 207 }
    ]

};


// =====================================================
// CALCULAR OBSTACLE CLEARANCE SPEED
// =====================================================

function calculateObstacleClearanceSpeed(
    grossWeight,
    cg
) {

    if (
        grossWeight < 12 ||
        grossWeight > 24
    ) {

        return {
            valid: false,
            reason: "Peso fuera del rango de FA2-2."
        };

    }


    if (
        cg < 0 ||
        cg > 25
    ) {

        return {
            valid: false,
            reason: "CG fuera del rango de FA2-2."
        };

    }


    // CG exacto
    if (
        FA22_OBSTACLE_CLEARANCE_SPEED[cg]
    ) {

        const speed =
            speedFromObstacleCurve(
                cg,
                grossWeight
            );

        if (speed !== null) {

            return {
                valid: true,
                speed: speed,
                method:
                    `Curva CG ${cg}% MAC`
            };

        }

    }


    // Buscar curvas de CG inferior y superior

    const availableCG =
        [0, 5, 10, 15, 20, 25];

    let lowerCG = null;
    let upperCG = null;


    for (
        let i = 0;
        i < availableCG.length - 1;
        i++
    ) {

        const low =
            availableCG[i];

        const high =
            availableCG[i + 1];


        if (
            cg >= low &&
            cg <= high
        ) {

            lowerCG = low;
            upperCG = high;

            break;

        }

    }


    if (
        lowerCG === null ||
        upperCG === null
    ) {

        return {
            valid: false,
            reason:
                "No fue posible determinar las curvas de CG."
        };

    }


    const lowerSpeed =
        speedFromObstacleCurve(
            lowerCG,
            grossWeight
        );

    const upperSpeed =
        speedFromObstacleCurve(
            upperCG,
            grossWeight
        );


    if (
        lowerSpeed === null ||
        upperSpeed === null
    ) {

        return {
            valid: false,
            reason:
                "Faltan puntos de Obstacle Clearance Speed."
        };

    }


    return {

        valid: true,

        speed:
            linearInterpolation(
                lowerCG,
                lowerSpeed,
                upperCG,
                upperSpeed,
                cg
            ),

        method:
            `Interpolación CG ${lowerCG}% → ${upperCG}%`

    };

}


// =====================================================
// VELOCIDAD DESDE CURVA DE OBSTACLE CLEARANCE
// =====================================================

function speedFromObstacleCurve(
    curve,
    grossWeight
) {

    const points =
        FA22_OBSTACLE_CLEARANCE_SPEED[curve];


    const pair =
        findInterpolationPoints(
            points,
            grossWeight
        );


    if (!pair) {

        return null;

    }


    return linearInterpolation(

        pair.p1.weight,
        pair.p1.speed,

        pair.p2.weight,
        pair.p2.speed,

        grossWeight

    );

}

// =====================================================
// FA2-2 — TIRE LIMIT SPEED
// =====================================================

const FA22_TIRE_LIMIT_SPEED = {

    0: [
        { temperature: -40, speed: 238 },
        { temperature: -20, speed: 228 },
        { temperature: 0, speed: 219 },
        { temperature: 20, speed: 215 },
        { temperature: 40, speed: 207 },
        { temperature: 60, speed: 200 }
    ],

    2000: [
        { temperature: -40, speed: 231 },
        { temperature: -20, speed: 221 },
        { temperature: 0, speed: 213 },
        { temperature: 20, speed: 208 },
        { temperature: 40, speed: 201 },
        { temperature: 60, speed: 194 }
    ],

    4000: [
        { temperature: -40, speed: 224 },
        { temperature: -20, speed: 214 },
        { temperature: 0, speed: 207 },
        { temperature: 20, speed: 201 },
        { temperature: 40, speed: 194 },
        { temperature: 60, speed: 187 }
    ],

    6000: [
        { temperature: -40, speed: 216 },
        { temperature: -20, speed: 207 },
        { temperature: 0, speed: 200 },
        { temperature: 20, speed: 194 },
        { temperature: 40, speed: 187 },
        { temperature: 60, speed: 180 }
    ],

    8000: [
        { temperature: -40, speed: 208 },
        { temperature: -20, speed: 200 },
        { temperature: 0, speed: 193 },
        { temperature: 20, speed: 187 },
        { temperature: 40, speed: 180 },
        { temperature: 60, speed: 173 }
    ]

};


// =====================================================
// CALCULAR TIRE LIMIT SPEED
// =====================================================

function calculateTireLimitSpeed(
    temperature,
    pressureAltitude
) {

    if (
        pressureAltitude < 0 ||
        pressureAltitude > 8000
    ) {

        return {
            valid: false,
            reason:
                "Altitud de presión fuera del rango de la carta."
        };

    }


    if (
        temperature < -40 ||
        temperature > 60
    ) {

        return {
            valid: false,
            reason:
                "Temperatura fuera del rango de la carta."
        };

    }


    const availableAltitudes =
        [0, 2000, 4000, 6000, 8000];


    let lowerAltitude = null;
    let upperAltitude = null;


    for (
        let i = 0;
        i < availableAltitudes.length - 1;
        i++
    ) {

        const low =
            availableAltitudes[i];

        const high =
            availableAltitudes[i + 1];


        if (
            pressureAltitude >= low &&
            pressureAltitude <= high
        ) {

            lowerAltitude = low;
            upperAltitude = high;

            break;

        }

    }


    // =================================================
    // VELOCIDAD EN LA CURVA INFERIOR
    // =================================================

    const lowerSpeed =
        speedFromTireCurve(
            lowerAltitude,
            temperature
        );


    // =================================================
    // VELOCIDAD EN LA CURVA SUPERIOR
    // =================================================

    const upperSpeed =
        speedFromTireCurve(
            upperAltitude,
            temperature
        );


    if (
        lowerSpeed === null ||
        upperSpeed === null
    ) {

        return {
            valid: false,
            reason:
                "No fue posible interpolar Tire Limit Speed."
        };

    }


    // =================================================
    // INTERPOLACIÓN DE ALTITUD
    // =================================================

    const speed =
        linearInterpolation(
            lowerAltitude,
            lowerSpeed,
            upperAltitude,
            upperSpeed,
            pressureAltitude
        );


    return {

        valid: true,

        speed: speed,

        method:
            `Interpolación PA ${lowerAltitude}–${upperAltitude} ft`

    };

}


// =====================================================
// VELOCIDAD DESDE CURVA DE TIRE LIMIT
// =====================================================

function speedFromTireCurve(
    pressureAltitude,
    temperature
) {

    const points =
        FA22_TIRE_LIMIT_SPEED[
            pressureAltitude
        ];


    if (
        !points ||
        points.length < 2
    ) {

        return null;

    }


    const pair =
        findInterpolationPointsTemperature(
            points,
            temperature
        );


    if (!pair) {

        return null;

    }


    return linearInterpolation(

        pair.p1.temperature,
        pair.p1.speed,

        pair.p2.temperature,
        pair.p2.speed,

        temperature

    );

}


// =====================================================
// BUSCAR PUNTOS DE TEMPERATURA
// =====================================================

function findInterpolationPointsTemperature(
    points,
    temperature
) {

    if (
        temperature < points[0].temperature ||
        temperature >
        points[points.length - 1].temperature
    ) {

        return null;

    }


    for (
        let i = 0;
        i < points.length - 1;
        i++
    ) {

        const p1 = points[i];
        const p2 = points[i + 1];


        if (
            temperature >= p1.temperature &&
            temperature <= p2.temperature
        ) {

            return {
                p1,
                p2
            };

        }

    }


    return null;

}

// =====================================================
// CARGAR DATOS DIGITALIZADOS DESDE EL DIGITALIZADOR
// ======================================================

function loadFA22TakeoffData(curves) {

    Object.keys(FA22_TAKEOFF_SPEED).forEach(function (cg) {

        FA22_TAKEOFF_SPEED[cg].length = 0;

        if (curves[cg]) {

            curves[cg].forEach(function (point) {

                FA22_TAKEOFF_SPEED[cg].push({

                    weight: Number(point.weight),

                    speed: Number(point.speed)

                });

            });

        }

    });

}



// =====================================================
// INTERPOLACIÓN LINEAL
// =====================================================

function linearInterpolation(
    x1,
    y1,
    x2,
    y2,
    x
) {

    if (x2 === x1) {

        return y1;

    }


    return (

        y1
        +
        (
            (x - x1)
            /
            (x2 - x1)
        )
        *
        (y2 - y1)

    );

}



// =====================================================
// BUSCAR DOS PUNTOS
// =====================================================

function findInterpolationPoints(
    points,
    weight
) {

    if (!points || points.length < 2) {

        return null;

    }


    /*
    Peso inferior al primer punto
    */

    if (weight < points[0].weight) {

        return null;

    }


    /*
    Peso superior al último punto
    */

    if (
        weight >
        points[points.length - 1].weight
    ) {

        return null;

    }


    for (
        let i = 0;
        i < points.length - 1;
        i++
    ) {

        const p1 = points[i];

        const p2 = points[i + 1];


        if (
            weight >= p1.weight &&
            weight <= p2.weight
        ) {

            return {

                p1,
                p2

            };

        }

    }


    return null;

}



// =====================================================
// VELOCIDAD PARA UNA CURVA DE CG
// =====================================================

function speedFromCurve(
    curve,
    grossWeight
) {

    const points =
        FA22_TAKEOFF_SPEED[curve];


    const pair =
        findInterpolationPoints(
            points,
            grossWeight
        );


    if (!pair) {

        return null;

    }


    return linearInterpolation(

        pair.p1.weight,
        pair.p1.speed,

        pair.p2.weight,
        pair.p2.speed,

        grossWeight

    );

}



// =====================================================
// INTERPOLACIÓN ENTRE DOS CURVAS DE CG
// =====================================================

function interpolateCG(
    cg1,
    speed1,
    cg2,
    speed2,
    cg
) {

    return linearInterpolation(

        cg1,
        speed1,

        cg2,
        speed2,

        cg

    );

}



// =====================================================
// TAKEOFF SPEED
// =====================================================

function calculateTakeoffSpeed(
    grossWeight,
    cg
) {

    /*
    -----------------------------------------------------
    LIMITACIONES DE LA CARTA
    -----------------------------------------------------

    Gross Weight:

        12,000 — 24,000 lb

    CG:

        0 — 25 % MAC

    -----------------------------------------------------
    */


if (
    grossWeight < 12 ||
    grossWeight > 24
) {

        return {

            valid: false,

            reason:
                "Peso fuera del rango de FA2-2."

        };

    }


    if (
        cg < 0 ||
        cg > 25
    ) {

        return {

            valid: false,

            reason:
                "CG fuera del rango de FA2-2."

        };

    }



    /*
    -----------------------------------------------------
    SI EL CG COINCIDE EXACTAMENTE CON UNA CURVA
    -----------------------------------------------------
    */

    if (
        FA22_TAKEOFF_SPEED[cg] &&
        FA22_TAKEOFF_SPEED[cg].length >= 2
    ) {

        const speed =
            speedFromCurve(
                cg,
                grossWeight
            );


        if (speed !== null) {

            return {

                valid: true,

                speed: speed,

                method:
                    `Curva CG ${cg}% MAC`

            };

        }

    }



    /*
    -----------------------------------------------------
    BUSCAR CURVAS SUPERIOR E INFERIOR
    -----------------------------------------------------
    */

    const availableCG =
        [0, 5, 10, 15, 20, 25];


    let lowerCG = null;
    let upperCG = null;


    for (
        let i = 0;
        i < availableCG.length - 1;
        i++
    ) {

        const low =
            availableCG[i];

        const high =
            availableCG[i + 1];


        if (
            cg >= low &&
            cg <= high
        ) {

            lowerCG = low;

            upperCG = high;

            break;

        }

    }


    if (
        lowerCG === null ||
        upperCG === null
    ) {

        return {

            valid: false,

            reason:
                "No fue posible determinar las curvas de CG."

        };

    }



    const lowerSpeed =
        speedFromCurve(
            lowerCG,
            grossWeight
        );


    const upperSpeed =
        speedFromCurve(
            upperCG,
            grossWeight
        );


    if (
        lowerSpeed === null ||
        upperSpeed === null
    ) {

        return {

            valid: false,

            reason:
                "Faltan puntos digitalizados de la carta."

        };

    }



    const result =
        interpolateCG(

            lowerCG,
            lowerSpeed,

            upperCG,
            upperSpeed,

            cg

        );



    return {

        valid: true,

        speed: result,

        method:
            `Interpolación CG ${lowerCG}% → ${upperCG}%`

    };

}



// =====================================================
// AFT STICK SPEED
// =====================================================

function calculateAftStickSpeed(
    takeoffSpeed
) {

    if (
        takeoffSpeed === null ||
        takeoffSpeed === undefined
    ) {

        return null;

    }


    /*
    La nota de FA2-2 indica:

        AFT STICK SPEED IS 5 KNOTS
        LESS THAN TAKEOFF SPEED.
    */

    return takeoffSpeed - 5;

}

// =====================================================
// FA2-3 — TAKEOFF FACTOR
// =====================================================
//
// Datos relevados de la carta FA2-3.
//
// Entradas:
//   Temperature (°C)
//   Pressure Altitude (ft)
//   Thrust: MAX / MIN_AB / MIL
//   Anti-Ice: OFF / ON
//
// Salida:
//   Takeoff Factor
//
// T2 NO se utiliza.
// =====================================================

const FA23_TAKEOFF_FACTOR = {

    // -------------------------------------------------
    // 0 FT
    // -------------------------------------------------

    0: {

        20: {
            MAX_OFF: 7.1,
            MAX_ON: 6.5,
            MIN_AB_OFF: 4.9,
            MIN_AB_ON: 4.3,
            MIL_OFF: 4.0,
            MIL_ON: 3.5
        },

        40: {
            MAX_OFF: 5.6,
            MAX_ON: 5.2,
            MIN_AB_OFF: 3.8,
            MIN_AB_ON: 3.4,
            MIL_OFF: 3.1,
            MIL_ON: 2.6
        }

    },

    // -------------------------------------------------
    // 2000 FT
    // -------------------------------------------------

2000: {

    20: {
        MAX_OFF: 5.4,
        MAX_ON: 5.5,
        MIN_AB_OFF: 4.1,
        MIN_AB_ON: 3.7,
        MIL_OFF: 3.4,
        MIL_ON: 2.9
    },

    30: {
        MAX_OFF: 5.4,
        MIL_OFF: 3.0
    },

    40: {
        MAX_OFF: 4.7,
        MAX_ON: 4.4,
        MIN_AB_OFF: 3.2,
        MIN_AB_ON: 2.8,
        MIL_OFF: 2.5,
        MIL_ON: 2.2
    }

},

    // -------------------------------------------------
    // 4000 FT
    // -------------------------------------------------

    4000: {

        20: {
            MAX_OFF: 5.0,
            MAX_ON: 4.6,
            MIN_AB_OFF: 3.7,
            MIN_AB_ON: 3.0,
            MIL_OFF: 2.6,
            MIL_ON: 2.3
        },

        40: {
            MAX_OFF: 4.0,
            MAX_ON: 3.7,
            MIN_AB_OFF: 2.6,
            MIN_AB_ON: 2.3,
            MIL_OFF: 2.0,
            MIL_ON: 1.8
        }

    }

};


// =====================================================
// OBTENER CLAVE DE THRUST / ANTI-ICE
// =====================================================

function getFA23ConditionKey(thrust, antiIce) {

    const prefix = {

        MAX: "MAX",
        MIN_AB: "MIN_AB",
        MIL: "MIL"

    }[thrust];

    if (!prefix) {
        return null;
    }

    return `${prefix}_${antiIce === "ON" ? "ON" : "OFF"}`;

}


// =====================================================
// INTERPOLACIÓN DE TEMPERATURA
// =====================================================

function interpolateFA23Temperature(
    data,
    temperature,
    conditionKey
) {

    const temperatures =
        Object.keys(data)
            .map(Number)
            .filter(t =>
                data[t] &&
                data[t][conditionKey] !== undefined
            )
            .sort((a, b) => a - b);

    if (temperatures.length === 0) {
        return null;
    }

    // Si existe el valor exacto, usarlo directamente
    if (
        data[temperature] &&
        data[temperature][conditionKey] !== undefined
    ) {
        return data[temperature][conditionKey];
    }

    // Para interpolar necesitamos dos puntos válidos
    if (temperatures.length < 2) {
        return null;
    }

    let lower = null;
    let upper = null;

    for (
        let i = 0;
        i < temperatures.length - 1;
        i++
    ) {

        const t1 = temperatures[i];
        const t2 = temperatures[i + 1];

        if (
            temperature > t1 &&
            temperature < t2
        ) {

            lower = t1;
            upper = t2;

            break;
        }
    }

    if (
        lower === null ||
        upper === null
    ) {
        return null;
    }

    const y1 =
        data[lower][conditionKey];

    const y2 =
        data[upper][conditionKey];

    return linearInterpolation(
        lower,
        y1,
        upper,
        y2,
        temperature
    );
}


// =====================================================
// TAKEOFF FACTOR
// =====================================================

function calculateTakeoffFactor(
    temperature,
    pressureAltitude,
    thrust,
    antiIce
) {

    const conditionKey =
        getFA23ConditionKey(
            thrust,
            antiIce
        );

    if (!conditionKey) {

        return {
            valid: false,
            reason: "Configuración de thrust no válida."
        };

    }

    const altitudes =
        Object.keys(FA23_TAKEOFF_FACTOR)
            .map(Number)
            .sort((a, b) => a - b);

    let lowerPA = null;
    let upperPA = null;

    for (
        let i = 0;
        i < altitudes.length - 1;
        i++
    ) {

        const pa1 = altitudes[i];
        const pa2 = altitudes[i + 1];

        if (
            pressureAltitude >= pa1 &&
            pressureAltitude <= pa2
        ) {

            lowerPA = pa1;
            upperPA = pa2;

            break;

        }

    }

    if (
        lowerPA === null ||
        upperPA === null
    ) {

        return {
            valid: false,
            reason:
                "Presión-altitud fuera del rango relevado de FA2-3."
        };

    }

    const lowerFactor =
        interpolateFA23Temperature(
            FA23_TAKEOFF_FACTOR[lowerPA],
            temperature,
            conditionKey
        );

    const upperFactor =
        interpolateFA23Temperature(
            FA23_TAKEOFF_FACTOR[upperPA],
            temperature,
            conditionKey
        );

    if (
        lowerFactor === null ||
        upperFactor === null
    ) {

        return {
            valid: false,
            reason:
                "Temperatura fuera del rango relevado de FA2-3."
        };

    }

    const factor =
        linearInterpolation(
            lowerPA,
            lowerFactor,
            upperPA,
            upperFactor,
            pressureAltitude
        );

    return {

        valid: true,

        factor: factor,

        method:
            `FA2-3 ${conditionKey} / interpolación PA y temperatura`

    };

}
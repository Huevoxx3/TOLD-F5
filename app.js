/*
=========================================================
TOLD CALCULATOR
FA2-2 — TAKEOFF SPEED

VERSION:
    0.1

OBJETIVO:
    Implementar y validar el ejemplo de FA2-2
    antes de digitalizar completamente las curvas.

IMPORTANTE:
    Los resultados de performance no deben utilizarse
    para una operación real hasta que las curvas hayan
    sido digitalizadas, verificadas y validadas contra
    la documentación aprobada.
=========================================================
*/


// =====================================================
// BASE DE AERÓDROMOS
// =====================================================

const aerodromes = {

    badajoz: {

        name: "Badajoz / Talavera La Real",
        elevationFt: 608,

        runways: {

            "13": {
                heading: 127,
                lengthFt: 9357
            },

            "31": {
                heading: 307,
                lengthFt: 9357
            }

        }

    },

    moron: {

        name: "Morón",
        elevationFt: 285,

        runways: {

            "02": {
                heading: 21,
                lengthFt: 11798
            },

            "20": {
                heading: 201,
                lengthFt: 11798
            }

        }

    },

    beja: {

        name: "Beja",
        elevationFt: 636,

        runways: {

            "01L": {
                heading: 7,
                lengthFt: 11319
            },

            "19R": {
                heading: 187,
                lengthFt: 11319
            }

        }

    },

    valladolid: {

        name: "Valladolid / Villanubla",
        elevationFt: 2775,

        runways: {

            "05": {
                heading: 46,
                lengthFt: 9859
            },

            "23": {
                heading: 226,
                lengthFt: 9859
            },

            "14": {
                heading: 145,
                lengthFt: 2976
            },

            "32": {
                heading: 325,
                lengthFt: 2976
            }

        }

    },

    sevilla: {

        name: "Sevilla",
        elevationFt: 111,

        runways: {

            "09": {
                heading: 91,
                lengthFt: 11037
            },

            "27": {
                heading: 271,
                lengthFt: 11037
            }

        }

    },

    rota: {

        name: "Rota",
        elevationFt: 86,

        runways: {

            "10": {
                heading: 98,
                lengthFt: 12106
            },

            "28": {
                heading: 278,
                lengthFt: 12106
            }

        }

    },

    torrejon: {

        name: "Torrejón",
        elevationFt: 2026,

        runways: {

            "04": {
                heading: 44,
                lengthFt: 12001
            },

            "22": {
                heading: 224,
                lengthFt: 12001
            }

        }

    },

    getafe: {

        name: "Getafe",
        elevationFt: 2032,

        runways: {

            "04": {
                heading: 45,
                lengthFt: 8127
            },

            "22": {
                heading: 225,
                lengthFt: 8127
            }

        }

    },

    zaragoza: {

        name: "Zaragoza",
        elevationFt: 862,

        runways: {

            "12L": {
                heading: 120,
                lengthFt: 9941
            },

            "30R": {
                heading: 300,
                lengthFt: 9941
            },

            "12R": {
                heading: 120,
                lengthFt: 12198
            },

            "30L": {
                heading: 300,
                lengthFt: 12198
            }

        }

    },

    san_javier: {

        name: "San Javier",
        elevationFt: 29,

        runways: {

            "04R": {
                heading: 45,
                lengthFt: 7612
            },

            "22L": {
                heading: 225,
                lengthFt: 7612
            },

            "04L": {
                heading: 45,
                lengthFt: 5174
            },

            "22R": {
                heading: 225,
                lengthFt: 5174
            }

        }

    },

    salamanca: {

        name: "Salamanca / Matacán",
        elevationFt: 2595,

        runways: {

            "03": {
                heading: 28,
                lengthFt: 8245
            },

            "21": {
                heading: 208,
                lengthFt: 8245
            },

            "07": {
                heading: 74,
                lengthFt: 6115
            },

            "25": {
                heading: 254,
                lengthFt: 6115
            }

        }

    },

    albacete: {

        name: "Albacete",
        elevationFt: 2301,

        runways: {

            "09": {
                heading: 88,
                lengthFt: 8858
            },

            "27": {
                heading: 268,
                lengthFt: 8858
            }

        }

    }

};

// =====================================================
// CARGAR AERÓDROMOS EN EL SELECT
// =====================================================

const aerodromeSelect = $("aerodrome");

Object.entries(aerodromes).forEach(
    ([key, aerodrome]) => {

        const option =
            document.createElement("option");

        option.value = key;
        option.textContent =
            aerodrome.name;

        aerodromeSelect.appendChild(option);

    }
);


// =====================================================
// CARGAR PISTAS SEGÚN AERÓDROMO
// =====================================================

const runwaySelect = $("runway");

aerodromeSelect.addEventListener(
    "change",
    function () {

        const aerodrome =
            aerodromes[
                aerodromeSelect.value
            ];

        runwaySelect.innerHTML = "";

        if (!aerodrome) {
            return;
        }

        Object.entries(
            aerodrome.runways
        ).forEach(
            ([key, runway]) => {

                const option =
                    document.createElement("option");

                option.value = key;

                option.textContent =
                    `${key} — ${runway.heading}°`;

                runwaySelect.appendChild(
                    option
                );

            }
        );
        calculate();
    }
);

// =====================================================
// RECALCULAR AL CAMBIAR DE PISTA
// =====================================================

runwaySelect.addEventListener(
    "change",
    function () {

        calculate();

    }
);

// =====================================================
// SELECCIÓN INICIAL
// =====================================================

aerodromeSelect.value = "badajoz";

aerodromeSelect.dispatchEvent(
    new Event("change")
);

// =====================================================
// ATAJO PARA ELEMENTOS HTML
// =====================================================

function $(id) {

    return document.getElementById(id);

}



// =====================================================
// NORMALIZAR RUMBO
// =====================================================

function normalizeHeading(degrees) {

    return (
        (Number(degrees) % 360) + 360
    ) % 360;

}



// =====================================================
// DIFERENCIA ANGULAR
// =====================================================

function angularDifference(
    windDirection,
    runwayHeading
) {

    let difference =
        normalizeHeading(windDirection)
        -
        normalizeHeading(runwayHeading);


    if (difference > 180) {

        difference -= 360;

    }


    if (difference < -180) {

        difference += 360;

    }


    return difference;

}



// =====================================================
// COMPONENTES DE VIENTO
// =====================================================

function windComponents(
    windDirection,
    windSpeed,
    runwayHeading
) {

    const difference =
        angularDifference(
            windDirection,
            runwayHeading
        );


    const radians =
        difference *
        Math.PI /
        180;


    const headwind =
        windSpeed *
        Math.cos(radians);


    const crosswind =
        Math.abs(
            windSpeed *
            Math.sin(radians)
        );


    return {

        headwind: headwind,

        tailwind:
            Math.max(0, -headwind),

        crosswind:
            crosswind

    };

}



// =====================================================
// ALTITUD DE PRESIÓN
// =====================================================

function pressureAltitude(
    elevationFt,
    qnhHpa
) {

    /*
    Estimación inicial.

    Más adelante verificaremos exactamente el
    procedimiento que queremos utilizar para el TOLD.
    */

    return (

        elevationFt
        +
        (1013.25 - Number(qnhHpa))
        * 27

    );

}



// =====================================================
// COMPROBAR SI COINCIDE CON EL EJEMPLO DEL MANUAL
// =====================================================

function isManualSampleCase(data) {

    const tolerance = 1;


    return (

        Math.abs(
            data.grossWeight - 16000
        ) < tolerance

        &&

        Math.abs(
            data.cg - 10
        ) < tolerance

        &&

        Math.abs(
            data.temperature - 20
        ) < tolerance

        &&

        Math.abs(
            data.pressureAltitude - 0
        ) < tolerance

        &&

        Math.abs(
            data.headwind - 10
        ) < tolerance

    );

}



// =====================================================
// FA2-2
// =====================================================

function calculateFA22(data) {

    /*
    -----------------------------------------------------
    CASO VALIDADO DEL MANUAL
    -----------------------------------------------------

    16,000 lb
    CG 10% MAC
    20 °C
    Pressure altitude = Sea Level
    Headwind = 10 kt

    Resultado del ejemplo:

    Obstacle Clearance = 185 KIAS
    Takeoff Speed       = 175 KIAS
    Aft Stick Speed     = 170 KIAS
    -----------------------------------------------------
    */


    if (isManualSampleCase(data)) {

        return {

            valid: true,

            source:
                "FA2-2 — ejemplo del manual",

            obstacleClearanceSpeed:
                185,

            takeoffSpeed:
                175,

            aftStickSpeed:
                170,

            /*
            Este valor todavía no se obtiene
            automáticamente de la curva de
            Tire Limit.
            */

            tireLimitSpeed:
                null

        };

    }



    /*
    -----------------------------------------------------
    RESTO DE CASOS
    -----------------------------------------------------

    Todavía no devolvemos una cifra.

    Esto es intencional.

    Primero digitalizamos las curvas de FA2-2.
    -----------------------------------------------------
    */


    return {

        valid: false,

        source:
            "FA2-2 — curva pendiente de digitalización",

        obstacleClearanceSpeed:
            null,

        takeoffSpeed:
            null,

        aftStickSpeed:
            null,

        tireLimitSpeed:
            null

    };

}



// =====================================================
// MOSTRAR RESULTADOS FA2-2
// =====================================================

function displayFA22(result) {


    if (!result.valid) {

        $("obstacleSpeed").textContent =
            "PENDIENTE";

        $("takeoffSpeed").textContent =
            "PENDIENTE";

        $("aftStickSpeed").textContent =
            "PENDIENTE";

        $("tireSpeed").textContent =
            "PENDIENTE";

        return;

    }



    $("obstacleSpeed").textContent =
        `${result.obstacleClearanceSpeed} KIAS`;


    $("takeoffSpeed").textContent =
        `${result.takeoffSpeed} KIAS`;


    $("aftStickSpeed").textContent =
        `${result.aftStickSpeed} KIAS`;


    $("tireSpeed").textContent =

        result.tireLimitSpeed !== null

            ? `${result.tireLimitSpeed} KIAS`

            : "PENDIENTE";

}



// =====================================================
// CALCULO PRINCIPAL
// =====================================================

function calculate() {


    // -------------------------------------------------
    // AERÓDROMO
    // -------------------------------------------------

    const aerodrome =
        aerodromes[
            $("aerodrome").value
        ];



    // -------------------------------------------------
    // PISTA
    // -------------------------------------------------

    const runway =
        aerodrome.runways[
            $("runway").value
        ];



    // -------------------------------------------------
    // DATOS DE ENTRADA
    // -------------------------------------------------

    const temperature =
        Number(
            $("temperature").value
        );


    const qnh =
        Number(
            $("qnh").value
        );


    const windDirection =
        Number(
            $("windDirection").value
        );


    const windSpeed =
        Number(
            $("windSpeed").value
        );


    const grossWeight =
        Number(
            $("grossWeight").value
        );


    const cg =
        Number(
            $("cg").value
        );



    // -------------------------------------------------
    // ALTITUD DE PRESIÓN
    // -------------------------------------------------

    const pa =
        pressureAltitude(
            aerodrome.elevationFt,
            qnh
        );



    // -------------------------------------------------
    // COMPONENTES DE VIENTO
    // -------------------------------------------------

    const wind =
        windComponents(
            windDirection,
            windSpeed,
            runway.heading
        );



    // -------------------------------------------------
    // MOSTRAR CONDICIONES
    // -------------------------------------------------

    $("elevation").textContent =

        `${aerodrome.elevationFt.toLocaleString()} ft`;


    $("runwayLength").textContent =

        runway.lengthFt

            ? `${runway.lengthFt.toLocaleString()} ft`

            : "Pendiente de cargar";


    $("pressureAltitude").textContent =

        `${Math.round(pa).toLocaleString()} ft`;


    $("headwind").textContent =

        `${Math.max(
            0,
            wind.headwind
        ).toFixed(1)} kt`;


    $("tailwind").textContent =

        `${wind.tailwind.toFixed(1)} kt`;


    $("crosswind").textContent =

        `${wind.crosswind.toFixed(1)} kt`;



    // -------------------------------------------------
    // OBJETO DE DATOS PARA PERFORMANCE
    // -------------------------------------------------

    const performanceData = {

        temperature:

            temperature,

        qnh:

            qnh,

        pressureAltitude:

            pa,

        windDirection:

            windDirection,

        windSpeed:

            windSpeed,

        headwind:

            wind.headwind,

        crosswind:

            wind.crosswind,

        grossWeight:

            grossWeight,

        cg:

            cg

    };

// =================================================
// FA2-3 — TAKEOFF FACTOR
// =================================================

const thrust =
    $("thrust")
        ? $("thrust").value
        : "MAX";

const antiIce =
    $("antiIce")
        ? $("antiIce").value
        : "OFF";

const takeoffFactorResult =
    calculateTakeoffFactor(
        temperature,
        pa,
        thrust,
        antiIce
    );

console.log(
    "FA2-3 Takeoff Factor:",
    takeoffFactorResult
);

// Mostrar FA2-3 en pantalla

if (takeoffFactorResult.valid) {

    $("takeoffFactor").textContent =
        takeoffFactorResult.factor.toFixed(1);

} else {

    $("takeoffFactor").textContent =
        "PENDIENTE";

}

// =================================================
// FA23 — GRADIENTE DE ASCENSO
// =================================================

if (
    takeoffFactorResult.valid &&
    typeof window.calculateFA23Gradient === "function"
) {

    const gradientResult =
        window.calculateFA23Gradient({

            takeoffFactor:
                takeoffFactorResult.factor,

            pressureAltitude:
                pa,

            grossWeight:
                grossWeight,

            tailwind:
                Math.max(
                    0,
                    wind.tailwind
                )

        });


    if (gradientResult.valid) {

        $("gradientRateOfClimb").textContent =
            gradientResult.result.rateOfClimb.toFixed(0);


        $("gradientPercent").textContent =
            gradientResult.result.gradientPercent.toFixed(2);


        $("gradientFtNm").textContent =
            gradientResult.result.gradientFtNm.toFixed(0);

    } else {

        $("gradientRateOfClimb").textContent =
            "PENDIENTE";


        $("gradientPercent").textContent =
            "PENDIENTE";


        $("gradientFtNm").textContent =
            "PENDIENTE";

    }

} else {

    $("gradientRateOfClimb").textContent =
        "PENDIENTE";


    $("gradientPercent").textContent =
        "PENDIENTE";


    $("gradientFtNm").textContent =
        "PENDIENTE";

}

    // -------------------------------------------------
    // CALCULAR FA2-2
    // -------------------------------------------------

// =================================================
// FA2-2 — TAKEOFF SPEED
// =================================================

const takeoffResult =
calculateTakeoffSpeed(
    grossWeight / 1000,
    cg
);


if (takeoffResult.valid) {

    const takeoffSpeed =
        takeoffResult.speed;


    const aftStickSpeed =
        calculateAftStickSpeed(
            takeoffSpeed
        );


$("takeoffSpeed").textContent =
    `${takeoffSpeed.toFixed(0)} KIAS`;


$("aftStickSpeed").textContent =
    `${aftStickSpeed.toFixed(0)} KIAS`;


const obstacleResult =
    calculateObstacleClearanceSpeed(
        grossWeight / 1000,
        cg
    );

$("obstacleSpeed").textContent =
    obstacleResult.valid
        ? `${Math.round(obstacleResult.speed)} KIAS`
        : "PENDIENTE";


const tireResult =
    calculateTireLimitSpeed(
        temperature,
        pa
    );

if (tireResult.valid) {

    const correctedTireSpeed =
        tireResult.speed +
        Math.max(0, wind.headwind);

    $("tireSpeed").textContent =
        `${Math.round(correctedTireSpeed)} KIAS`;

} else {

    $("tireSpeed").textContent =
        "PENDIENTE";

}

}

else {

    $("takeoffSpeed").textContent =
        "PENDIENTE";


    $("aftStickSpeed").textContent =
        "PENDIENTE";


    $("obstacleSpeed").textContent =
        "PENDIENTE";


    $("tireSpeed").textContent =
        "PENDIENTE";

}

// =================================================
// FA2-3 — VER RECORRIDO
// =================================================

const gradientButton = $("viewGradientBtn");

if (gradientButton) {

    gradientButton.onclick = function () {

        // Verificar que el Takeoff Factor sea válido
        if (!takeoffFactorResult.valid) {

            alert(
                "No se puede abrir el recorrido de gradiente porque el Takeoff Factor está pendiente."
            );

            return;
        }

        // Datos actuales del cálculo
        const tof =
            takeoffFactorResult.factor;

        const gradientPA =
            pa;

        const gradientGW =
            grossWeight;

        const gradientTailwind =
            Math.max(
                0,
                wind.tailwind
            );

        // Construir URL para el módulo de gradiente
        const url =
            "gradient/gradient-view.html" +
            `?tof=${encodeURIComponent(tof)}` +
            `&pa=${encodeURIComponent(gradientPA)}` +
            `&gw=${encodeURIComponent(gradientGW)}` +
            `&tailwind=${encodeURIComponent(gradientTailwind)}`;

        // Abrir el recorrido
        window.open(
            url,
            "_blank"
        );
    };
}

// -------------------------------------------------
// MENSAJE DE ESTADO
// -------------------------------------------------



$("status").className =
    "status info";
}

// =====================================================
// BOTÓN CALCULAR
// =====================================================

$("calculateBtn")
    .addEventListener(
        "click",
        calculate
    );



// =====================================================
// MOSTRAR / OCULTAR TRAZABILIDAD
// =====================================================

$("showCalcBtn")
    .addEventListener(
        "click",
        function () {

            $("calculationPanel")
                .classList
                .toggle("hidden");

        }
    );



// =====================================================
// ARRANQUE
// =====================================================

calculate();

// =====================================================
// DIGITALIZADOR FA2-2
// =====================================================



// =====================================================
// MOSTRAR TABLA
// =====================================================

function renderDigitalTable() {


    const tbody =
        $("digitalTableBody");


    tbody.innerHTML = "";



    digitalPoints.forEach(
        (point, index) => {


            const row =
                document.createElement(
                    "tr"
                );


            row.innerHTML = `

                <td>
                    ${point.cg} % MAC
                </td>

                <td>
                    ${point.weight.toLocaleString()} lb
                </td>

                <td>
                    ${point.speed} KIAS
                </td>

                <td>

                    <button
                        class="delete-point"
                        data-index="${index}"
                    >
                        ✕
                    </button>

                </td>

            `;


            tbody.appendChild(row);

        }
    );



    // ---------------------------------------------
    // BOTONES BORRAR
    // ---------------------------------------------

    document
        .querySelectorAll(".delete-point")
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    function () {

                        const index =
                            Number(
                                this.dataset.index
                            );


                        digitalPoints.splice(
                            index,
                            1
                        );


                        renderDigitalTable();

                        generateDigitalCode();

                    }
                );

            }
        );

}



// =====================================================
// GENERAR CÓDIGO
// =====================================================

function generateDigitalCode() {


    if (
        digitalPoints.length === 0
    ) {

        $("digitalCode").textContent =
            "No hay puntos cargados.";

        return;

    }



    const curves = {

        0: [],
        5: [],
        10: [],
        15: [],
        20: [],
        25: []

    };



    digitalPoints.forEach(
        point => {

            curves[point.cg].push({

                weight:
                    point.weight / 1000,

                speed:
                    point.speed

            });

        }
    );

updateCurveStatus(curves);

    // Cargar los datos directamente en fa22.js
if (typeof loadFA22TakeoffData === "function") {

    loadFA22TakeoffData(curves);

}



    Object.keys(curves).forEach(
        cg => {

            curves[cg].sort(
                (a, b) =>
                    a.weight - b.weight
            );

        }
    );



    let output =
`const FA22_TAKEOFF_SPEED = {

`;



    [0, 5, 10, 15, 20, 25]
        .forEach(
            cg => {

                output +=
`    ${cg}: [`;



                if (
                    curves[cg].length
                ) {

                    output += "\n";


                    curves[cg].forEach(
                        point => {

                            output +=
`        { weight: ${point.weight}, speed: ${point.speed} },\n`;

                        }
                    );


                    output +=
`    `;

                }


                output +=
`],\n\n`;

            }
        );



    output +=
`};`;



    $("digitalCode").textContent =
        output;

}

// ======================================================
// ESTADO DE LAS CURVAS
// ======================================================

function updateCurveStatus(curves) {

    const items =
        document.querySelectorAll(".curve-status-item");


    items.forEach(function (item) {

        const cg =
            Number(item.dataset.cg);

        const countElement =
            item.querySelector(".curve-count");

        const points =
            curves[cg] || [];


        // Cantidad de puntos

        countElement.textContent =
            points.length === 1
                ? "1 punto"
                : `${points.length} puntos`;


        // Información adicional si existen puntos

        if (points.length > 0) {

            const weights =
                points.map(
                    point => point.weight
                );

            const minWeight =
                Math.min(...weights);

            const maxWeight =
                Math.max(...weights);

            countElement.textContent =
                `${points.length} puntos · ` +
                `${minWeight}–${maxWeight} klb`;

        }

    });

}

// =====================================================
// BORRAR TODOS LOS PUNTOS
// =====================================================

$("clearPointsBtn")
    .addEventListener(
        "click",
        function () {


            if (
                digitalPoints.length === 0
            ) {

                return;

            }


            const confirmDelete =
                confirm(
                    "¿Borrar todos los puntos digitalizados?"
                );


            if (
                !confirmDelete
            ) {

                return;

            }


            digitalPoints.length = 0;


            renderDigitalTable();

            generateDigitalCode();

        }
    );



// =====================================================
// COPIAR CÓDIGO
// =====================================================
const copyDataBtn = $("copyDataBtn");

if (copyDataBtn) {


$("copyDataBtn")
    .addEventListener(
        "click",
        async function () {


            const code =
                $("digitalCode")
                    .textContent;


            if (
                !code ||
                code ===
                "No hay puntos cargados."
            ) {

                return;

            }


            try {

                await navigator
                    .clipboard
                    .writeText(code);


                this.textContent =
                    "COPIADO";


                setTimeout(
                    () => {

                        this.textContent =
                            "COPIAR";

                    },
                    1500
                );


            }

            catch (error) {

                alert(
                    "No se pudo copiar automáticamente."
                );

            }

        }
    );
}
    // ======================================================
// DIGITALIZADOR FA2-2
// ======================================================

const digitalPoints = [];

const addPointBtn = document.getElementById("addPointBtn");
const clearPointsBtn = document.getElementById("clearPointsBtn");

console.log("Digitalizador FA2-2 iniciado.");

// ======================================================
// AGREGAR PUNTO
// ======================================================

if (addPointBtn) {

    addPointBtn.addEventListener("click", function () {

        console.log("CLICK AGREGAR PUNTO");

        const cg = Number(
            document.getElementById("digitalCg").value
        );

        const weight = Number(
            document.getElementById("digitalWeight").value
        );

        const speed = Number(
            document.getElementById("digitalSpeed").value
        );

        console.log("Datos:", {
            cg: cg,
            weight: weight,
            speed: speed
        });


        // -----------------------------
        // VALIDACIONES
        // -----------------------------

        if (!weight) {

            alert("Introduzca el peso bruto.");

            return;
        }

        if (!speed) {

            alert("Introduzca la Takeoff Speed.");

            return;
        }

        if (weight < 12000 || weight > 24000) {

            alert(
                "El peso debe estar entre 12.000 y 24.000 lb."
            );

            return;
        }

        if (speed < 120 || speed > 260) {

            alert(
                "La Takeoff Speed debe estar entre 120 y 260 KIAS."
            );

            return;
        }


        // -----------------------------
        // COMPROBAR DUPLICADO
        // -----------------------------

        const existe = digitalPoints.some(function (punto) {

            return (
                punto.cg === cg &&
                punto.weight === weight
            );

        });

        if (existe) {

            alert(
                "Ya existe un punto para ese CG y ese peso."
            );

            return;
        }


        // -----------------------------
        // AGREGAR PUNTO
        // -----------------------------

        digitalPoints.push({

            cg: cg,

            weight: weight,

            speed: speed

        });


        // -----------------------------
        // ORDENAR
        // -----------------------------

        digitalPoints.sort(function (a, b) {

            if (a.cg !== b.cg) {

                return a.cg - b.cg;

            }

            return a.weight - b.weight;

        });


console.log(
    "Punto agregado:",
    digitalPoints
);

actualizarTablaDigital();

generateDigitalCode();

        // ======================================================
// GENERAR DATOS PARA FA22.JS
// ======================================================

    });

}


// ======================================================
// BORRAR TODOS LOS PUNTOS
// ======================================================

if (clearPointsBtn) {

    clearPointsBtn.addEventListener(
        "click",
        function () {

digitalPoints.length = 0;

actualizarTablaDigital();

generateDigitalCode();

        }
    );

}


// ======================================================
// ACTUALIZAR TABLA
// ======================================================

function actualizarTablaDigital() {

    const tbody =
        document.getElementById("digitalTableBody");


    if (!tbody) {

        console.error(
            "ERROR: no existe digitalTableBody"
        );

        return;
    }


    tbody.innerHTML = "";


    // -----------------------------
    // SIN PUNTOS
    // -----------------------------

    if (digitalPoints.length === 0) {

        const fila =
            document.createElement("tr");

        fila.innerHTML = `
            <td colspan="4">
                No hay puntos digitalizados.
            </td>
        `;

        tbody.appendChild(fila);

        return;
    }


    // -----------------------------
    // MOSTRAR PUNTOS
    // -----------------------------

    digitalPoints.forEach(
        function (punto, index) {

            const fila =
                document.createElement("tr");

            fila.innerHTML = `

                <td>
                    ${punto.cg} % MAC
                </td>

                <td>
                    ${punto.weight.toLocaleString()} lb
                </td>

                <td>
                    ${punto.speed} KIAS
                </td>

                <td>

                    <button
                        type="button"
                        class="delete-point"
                        data-index="${index}">
                        ✕
                    </button>

                </td>

            `;

            tbody.appendChild(fila);

        }
    );


    // -----------------------------
    // ELIMINAR PUNTO
    // -----------------------------

    tbody
        .querySelectorAll(".delete-point")
        .forEach(function (boton) {

            boton.addEventListener(
                "click",
                function () {

                    const index =
                        Number(
                            this.dataset.index
                        );

                    digitalPoints.splice(
                        index,
                        1
                    );

                    actualizarTablaDigital();

                }
            );

        });

}


// ======================================================
// INICIALIZAR TABLA
// ======================================================

actualizarTablaDigital();

// ======================================================
// CARGA MASIVA DE PUNTOS FA2-2
// ======================================================

const loadBatchBtn =
    document.getElementById("loadBatchBtn");

const clearBatchBtn =
    document.getElementById("clearBatchBtn");


// ======================================================
// BOTÓN: CARGAR PUNTOS
// ======================================================

if (loadBatchBtn) {

    loadBatchBtn.addEventListener(
        "click",
        function () {

            const textarea =
                document.getElementById("batchPoints");

            if (!textarea) {

                alert(
                    "No se encontró el cuadro de carga."
                );

                return;
            }


            const texto =
                textarea.value.trim();


            if (!texto) {

                alert(
                    "No hay puntos para cargar."
                );

                return;
            }


            const lineas =
                texto.split(/\r?\n/);


            let agregados = 0;
            let duplicados = 0;
            let errores = [];


            // ==========================================
            // PROCESAR CADA LÍNEA
            // ==========================================

            lineas.forEach(
                function (linea, numeroLinea) {

                    linea = linea.trim();


                    // Ignorar líneas vacías

                    if (!linea) {
                        return;
                    }


                    // ----------------------------------
                    // FORMATO
                    // CG, PESO, VELOCIDAD
                    // ----------------------------------

                    const partes =
                        linea.split(",");


                    if (partes.length !== 3) {

                        errores.push(
                            `Línea ${numeroLinea + 1}: ` +
                            `debe tener CG, peso y velocidad.`
                        );

                        return;
                    }


                    const cg =
                        Number(
                            partes[0].trim()
                        );


                    const weight =
                        Number(
                            partes[1].trim()
                        );


                    const speed =
                        Number(
                            partes[2].trim()
                        );


                    // ----------------------------------
                    // VALIDAR CG
                    // ----------------------------------

                    const cgValidos = [
                        0,
                        5,
                        10,
                        15,
                        20,
                        25
                    ];


                    if (!cgValidos.includes(cg)) {

                        errores.push(
                            `Línea ${numeroLinea + 1}: ` +
                            `CG inválido (${cg}).`
                        );

                        return;
                    }


                    // ----------------------------------
                    // VALIDAR PESO
                    // ----------------------------------

                    if (
                        !Number.isFinite(weight) ||
                        weight < 12000 ||
                        weight > 24000
                    ) {

                        errores.push(
                            `Línea ${numeroLinea + 1}: ` +
                            `peso inválido (${weight}).`
                        );

                        return;
                    }


                    // ----------------------------------
                    // VALIDAR VELOCIDAD
                    // ----------------------------------

                    if (
                        !Number.isFinite(speed) ||
                        speed < 120 ||
                        speed > 260
                    ) {

                        errores.push(
                            `Línea ${numeroLinea + 1}: ` +
                            `Takeoff Speed inválida (${speed}).`
                        );

                        return;
                    }


                    // ----------------------------------
                    // COMPROBAR DUPLICADO
                    // ----------------------------------

                    const existe =
                        digitalPoints.some(
                            function (point) {

                                return (
                                    point.cg === cg &&
                                    point.weight === weight
                                );

                            }
                        );


                    if (existe) {

                        duplicados++;

                        return;
                    }


                    // ----------------------------------
                    // AGREGAR PUNTO
                    // ----------------------------------

                    digitalPoints.push({

                        cg: cg,

                        weight: weight,

                        speed: speed

                    });


                    agregados++;

                }
            );


            // ==========================================
            // ORDENAR
            // ==========================================

            digitalPoints.sort(
                function (a, b) {

                    if (a.cg !== b.cg) {

                        return a.cg - b.cg;

                    }

                    return a.weight - b.weight;

                }
            );


            // ==========================================
            // ACTUALIZAR TODO
            // ==========================================

            renderDigitalTable();

            generateDigitalCode();


            // ==========================================
            // INFORME
            // ==========================================

            let mensaje =
                `Puntos agregados: ${agregados}\n` +
                `Duplicados ignorados: ${duplicados}`;


            if (errores.length > 0) {

                mensaje +=
                    "\n\nErrores:\n" +
                    errores.join("\n");

            }


            alert(mensaje);

        }
    );

}


// ======================================================
// BOTÓN: LIMPIAR CUADRO
// ======================================================

if (clearBatchBtn) {

    clearBatchBtn.addEventListener(
        "click",
        function () {

            const textarea =
                document.getElementById("batchPoints");


            if (textarea) {

                textarea.value = "";

            }

        }
    );

}
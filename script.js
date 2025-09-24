// ==================== VARIABLES GLOBALES ====================
let displayValue = "0";
let memory = 0;
let angleMode = "deg"; // deg | rad | grad
let operation = null;
let firstOperand = null;
let errorLog = [];
let csvValues = [];

// ==================== DISPLAY ====================
function updateDisplay() {
    document.getElementById("display").textContent = displayValue;
}

function updateInfo(message) {
    document.getElementById("info-display").textContent = message;
}

function rellenar_info(resultado) {
    const infoElement = document.getElementById("info");
    if (resultado < 100) {
        infoElement.textContent = "Info: El resultado es menor que 100";
    } else if (resultado >= 100 && resultado <= 200) {
        infoElement.textContent = "Info: El resultado está entre 100 y 200";
    } else {
        infoElement.textContent = "Info: El resultado es superior a 200";
    }
}

// ==================== FUNCIONES DE ENTRADA ====================
function appendNumber(number) {
    if (displayValue === "0") {
        displayValue = number;
    } else {
        displayValue += number;
    }
    updateDisplay();
}

function appendDecimal() {
    if (!displayValue.includes(".")) {
        displayValue += ".";
    }
    updateDisplay();
}

function clearAll() {
    displayValue = "0";
    operation = null;
    firstOperand = null;
    updateDisplay();
    updateInfo("Calculadora lista");
}

function clearEntry() {
    displayValue = "0";
    updateDisplay();
}

function deleteLastChar() {
    displayValue = displayValue.slice(0, -1) || "0";
    updateDisplay();
}

function toggleSign() {
    displayValue = (parseFloat(displayValue) * -1).toString();
    updateDisplay();
}

// ==================== OPERACIONES ====================
function setOperation(op) {
    firstOperand = parseFloat(displayValue);
    operation = op;
    displayValue = "0";
    updateDisplay();
}

function calculate() {
    if (operation === null || firstOperand === null) return;
    const secondOperand = parseFloat(displayValue);
    try {
        switch (operation) {
            case "+": displayValue = (firstOperand + secondOperand).toString(); break;
            case "-": displayValue = (firstOperand - secondOperand).toString(); break;
            case "×": displayValue = (firstOperand * secondOperand).toString(); break;
            case "÷":
                if (secondOperand === 0) throw new Error("División por cero");
                displayValue = (firstOperand / secondOperand).toString();
                break;
            case "^": displayValue = Math.pow(firstOperand, secondOperand).toString(); break;
        }
        updateInfo(`${firstOperand} ${operation} ${secondOperand} =`);
        rellenar_info(parseFloat(displayValue));
        operation = null;
        firstOperand = null;
        updateDisplay();
    } catch (error) {
        displayValue = "Error";
        updateDisplay();
        updateInfo(error.message);
        errorLog.push(error.message);
    }
}

// ==================== OPERACIONES UNITARIAS ====================
function mod() {
    const value = parseFloat(displayValue);
    if (value < 0) {
        displayValue = (-value).toString();
    } else {
        displayValue = value.toString();
    }
    updateDisplay();
    rellenar_info(parseFloat(displayValue));
}

function fact() {
    try {
        const value = parseFloat(displayValue);
        if (value < 0 || !Number.isInteger(value)) {
            throw new Error("Factorial solo para enteros positivos");
        }
        const result = factorial(value);
        displayValue = result.toString();
        updateDisplay();
        rellenar_info(result);
    } catch (error) {
        displayValue = "Error";
        updateDisplay();
        updateInfo(error.message);
        errorLog.push(error.message);
    }
}

function eq() {
    calculate();
}

// ==================== FUNCIONES AVANZADAS ====================
function calculateFunction(func) {
    try {
        let value = parseFloat(displayValue);
        switch (func) {
            case "sin": value = Math.sin(toRadians(value)).toString(); break;
            case "cos": value = Math.cos(toRadians(value)).toString(); break;
            case "tan": value = Math.tan(toRadians(value)).toString(); break;
            case "log": value = Math.log10(value).toString(); break;
            case "ln": value = Math.log(value).toString(); break;
            case "sqrt": value = Math.sqrt(value).toString(); break;
            case "square": value = Math.pow(value, 2).toString(); break;
            case "cube": value = Math.pow(value, 3).toString(); break;
            case "reciprocal": value = (1 / value).toString(); break;
            case "factorial": value = factorial(value).toString(); break;
            case "power":
                firstOperand = value;
                operation = "^";
                displayValue = "0";
                updateDisplay();
                return;
            case "exp": value = Math.exp(value).toString(); break;
        }
        displayValue = value;
        updateDisplay();
        rellenar_info(parseFloat(value));
    } catch (error) {
        displayValue = "Error";
        updateDisplay();
        updateInfo(error.message);
        errorLog.push(error.message);
    }
}

function factorial(n) {
    if (n < 0) throw new Error("Factorial inválido");
    if (n === 0 || n === 1) return 1;
    return n * factorial(n - 1);
}

function toRadians(value) {
    switch (angleMode) {
        case "deg": return value * Math.PI / 180;
        case "rad": return value;
        case "grad": return value * Math.PI / 200;
    }
}

function setAngleMode(mode) {
    // If mode parameter is provided, use it, otherwise cycle through modes
    if (!mode) {
        // Cycle through modes: deg -> rad -> grad -> deg
        switch (angleMode) {
            case "deg": angleMode = "rad"; break;
            case "rad": angleMode = "grad"; break;
            case "grad": angleMode = "deg"; break;
            default: angleMode = "deg";
        }
    } else {
        angleMode = mode;
    }
    
    // Remove active class from all angle mode indicators  
    document.getElementById("deg-indicator").classList.remove("active");
    document.getElementById("rad-indicator").classList.remove("active");
    document.getElementById("grad-indicator").classList.remove("active");
    // Add active class to the selected mode
    document.getElementById(angleMode + "-indicator").classList.add("active");
    updateInfo(`Modo cambiado a ${angleMode.toUpperCase()}`);
}

function inputPi() {
    displayValue = Math.PI.toString();
    updateDisplay();
}

// ==================== PARENTHESES ====================
function openParenthesis() {
    // Simple implementation: append "(" to display
    if (displayValue === "0") {
        displayValue = "(";
    } else {
        displayValue += "(";
    }
    updateDisplay();
}

function closeParenthesis() {
    // Simple implementation: append ")" to display
    displayValue += ")";
    updateDisplay();
}

// ==================== MEMORIA ====================
function memoryClear() {
    memory = 0;
    document.getElementById("m-indicator").classList.remove("active");
}

function memoryRecall() {
    displayValue = memory.toString();
    updateDisplay();
}

function memoryAdd() {
    memory += parseFloat(displayValue);
    document.getElementById("m-indicator").classList.add("active");
}

function memorySubtract() {
    memory -= parseFloat(displayValue);
    document.getElementById("m-indicator").classList.add("active");
}

// ==================== CSV ====================
function toggleCSVInput() {
    const container = document.getElementById("csv-container");
    if (container.style.display === "none") {
        container.style.display = "block";
        document.getElementById("csv-input").focus();
    } else {
        container.style.display = "none";
    }
}

function processCSVInput() {
    const input = document.getElementById("csv-input").value;
    csvValues = input.split(",").map(val => parseFloat(val.trim())).filter(val => !isNaN(val));
    updateInfo(`CSV cargado: ${csvValues.length} valores`);
}

function calculateCSVMean() {
    if (csvValues.length === 0) {
        updateInfo("No hay valores CSV");
        return;
    }
    const mean = csvValues.reduce((a, b) => a + b, 0) / csvValues.length;
    displayValue = mean.toString();
    updateDisplay();
    updateInfo(`Media calculada (${csvValues.length} valores)`);
}

function removeCSVElement() {
    csvValues.pop();
    updateInfo(`Valor quitado. Restan ${csvValues.length}`);
}

function clearCSV() {
    csvValues = [];
    updateInfo("CSV limpiado");
}

function sumatorio() {
    if (csvValues.length === 0) {
        updateInfo("No hay valores CSV para sumar");
        return;
    }
    const sum = csvValues.reduce((a, b) => a + b, 0);
    displayValue = sum.toString();
    updateDisplay();
    rellenar_info(sum);
    updateInfo(`Sumatorio de ${csvValues.length} valores`);
}

function ordenar() {
    if (csvValues.length === 0) {
        updateInfo("No hay valores CSV para ordenar");
        return;
    }
    csvValues.sort((a, b) => a - b);
    displayValue = csvValues.join(", ");
    updateDisplay();
    updateInfo("Valores ordenados ascendentemente");
}

function revertir() {
    if (csvValues.length === 0) {
        updateInfo("No hay valores CSV para revertir");
        return;
    }
    csvValues.reverse();
    displayValue = csvValues.join(", ");
    updateDisplay();
    updateInfo("Orden de valores invertido");
}

function quitar() {
    if (csvValues.length === 0) {
        updateInfo("No hay valores CSV para quitar");
        return;
    }
    csvValues.pop();
    updateInfo(`Valor quitado. Restan ${csvValues.length}`);
    if (csvValues.length > 0) {
        displayValue = csvValues.join(", ");
        updateDisplay();
    } else {
        displayValue = "0";
        updateDisplay();
    }
}

// ==================== VALIDACIÓN ====================
function validar() {
    const input = displayValue;
    
    // Test if it's a valid number (integer or decimal, positive or negative)
    if (!isNaN(input) && input.trim() !== "") {
        updateInfo("Entrada válida: número");
        return true;
    }
    
    // Test if it's a valid CSV list
    const csvPattern = /^-?\d+(\.\d+)?(\s*,\s*-?\d+(\.\d+)?)*$/;
    if (csvPattern.test(input)) {
        updateInfo("Entrada válida: lista CSV");
        return true;
    }
    
    // Invalid input
    updateInfo("Error: Entrada inválida");
    return false;
}

function downloadErrorLog() {
    const blob = new Blob([errorLog.join("\n")], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "error_log.txt";
    a.click();
}

// ==================== TECLADO ====================
function handleKeyboard(event) {
    const key = event.key;
    const csvContainer = document.getElementById('csv-container');
    const csvInput = document.getElementById('csv-input');
    const isCSVModeActive = csvContainer && csvContainer.style.display === 'block';

    // ✅ Si está en modo CSV y el foco está en el input, no interceptar
    if (isCSVModeActive && document.activeElement === csvInput) {
        return; 
    }

    event.preventDefault(); // bloquea solo si NO está en CSV input

    if (!isNaN(key)) {
        appendNumber(key);
    } else if (key === ".") {
        appendDecimal();
    } else if (["+", "-", "*", "/"].includes(key)) {
        const op = key === "*" ? "×" : key === "/" ? "÷" : key;
        setOperation(op);
    } else if (key === "Enter") {
        if (isCSVModeActive) {
            processCSVInput();
        } else {
            calculate();
        }
    } else if (key === "Backspace") {
        deleteLastChar();
    } else if (key === "Escape") {
        if (isCSVModeActive) {
            toggleCSVInput();
        } else {
            clearAll();
        }
    }
}

// ==================== EVENTOS ====================
document.addEventListener("DOMContentLoaded", () => {
    updateDisplay();
    document.addEventListener("keydown", handleKeyboard);
});

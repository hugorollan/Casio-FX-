// Calculator state variables
let display;
let infoDisplay;
let currentInput = '0';
let operator = null;
let previousInput = null;
let waitingForNewOperand = false;
let angleMode = 'deg'; // deg, rad, grad
let memory = 0;
let hasMemory = false;
let errorLog = [];
let csvValues = [];

// Initialize calculator
document.addEventListener('DOMContentLoaded', function() {
    display = document.getElementById('display');
    infoDisplay = document.getElementById('info-display');
    updateDisplay();
    updateAngleModeIndicator();
    updateMemoryIndicator();
    showInfo('Calculadora lista');
    
    // Add keyboard support
    document.addEventListener('keydown', handleKeyboard);
});

// Display functions
function updateDisplay() {
    if (currentInput.length > 12) {
        display.textContent = parseFloat(currentInput).toExponential(6);
    } else {
        display.textContent = currentInput;
    }
}

function showInfo(message) {
    if (infoDisplay) {
        infoDisplay.textContent = message;
    }
}

function logError(error, context = '') {
    const errorEntry = {
        timestamp: new Date().toISOString(),
        error: error,
        context: context,
        input: currentInput,
        operator: operator
    };
    errorLog.push(errorEntry);
    console.log('Error logged:', errorEntry);
}

function downloadErrorLog() {
    if (errorLog.length === 0) {
        showInfo('No hay errores registrados');
        return;
    }
    
    const logContent = errorLog.map(entry => 
        `${entry.timestamp}: ${entry.error} (Context: ${entry.context}, Input: ${entry.input}, Operator: ${entry.operator})`
    ).join('\n');
    
    const blob = new Blob([logContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'calculator_errors.log';
    a.click();
    URL.revokeObjectURL(url);
    showInfo('Log de errores descargado');
}

function updateAngleModeIndicator() {
    document.getElementById('deg-indicator').classList.remove('active');
    document.getElementById('rad-indicator').classList.remove('active');
    document.getElementById('grad-indicator').classList.remove('active');
    
    document.getElementById(angleMode + '-indicator').classList.add('active');
}

function updateMemoryIndicator() {
    const indicator = document.getElementById('m-indicator');
    if (hasMemory) {
        indicator.classList.add('active');
    } else {
        indicator.classList.remove('active');
    }
}

// Number input functions
function appendNumber(num) {
    if (waitingForNewOperand) {
        currentInput = num;
        waitingForNewOperand = false;
    } else {
        currentInput = currentInput === '0' ? num : currentInput + num;
    }
    updateDisplay();
    showInfo('Ingresando número...');
}

function appendDecimal() {
    if (waitingForNewOperand) {
        currentInput = '0.';
        waitingForNewOperand = false;
    } else if (currentInput.indexOf('.') === -1) {
        currentInput += '.';
    }
    updateDisplay();
}

// Basic operations
function setOperation(nextOperator) {
    const inputValue = parseFloat(currentInput);
    
    if (isNaN(inputValue)) {
        showError('Error: Valor de entrada no válido');
        logError('Valor de entrada no válido', 'setOperation');
        return;
    }

    if (previousInput === null) {
        previousInput = inputValue;
    } else if (operator) {
        const currentValue = previousInput || 0;
        const newValue = performCalculation(currentValue, inputValue, operator);

        currentInput = String(newValue);
        previousInput = newValue;
        updateDisplay();
    }

    waitingForNewOperand = true;
    operator = nextOperator;
    showInfo(`Operación ${nextOperator} seleccionada`);
}

function calculate() {
    const inputValue = parseFloat(currentInput);
    
    if (isNaN(inputValue)) {
        showError('Error: Valor de entrada no válido');
        logError('Valor de entrada no válido', 'calculate');
        return;
    }

    if (previousInput !== null && operator) {
        const newValue = performCalculation(previousInput, inputValue, operator);
        currentInput = String(newValue);
        previousInput = null;
        operator = null;
        waitingForNewOperand = true;
        updateDisplay();
    } else {
        showInfo('Cálculo completado');
    }
}

function performCalculation(firstOperand, secondOperand, operator) {
    let result;
    switch (operator) {
        case '+':
            result = firstOperand + secondOperand;
            if (result >= 100 && result <= 200) {
                showInfo(`Operación: Suma. Resultado entre 100 y 200`);
            } else {
                showInfo(`Operación: Suma completada`);
            }
            return result;
        case '-':
            result = firstOperand - secondOperand;
            showInfo(`Operación: Resta completada`);
            return result;
        case '×':
            result = firstOperand * secondOperand;
            showInfo(`Operación: Multiplicación completada`);
            return result;
        case '÷':
            if (secondOperand === 0) {
                showError('Error: División por cero no permitida');
                logError('División por cero', 'performCalculation');
                return 0;
            }
            result = firstOperand / secondOperand;
            showInfo(`Operación: División completada`);
            return result;
        case '^':
            result = Math.pow(firstOperand, secondOperand);
            showInfo(`Operación: Potencia (${firstOperand}^${secondOperand}) completada`);
            return result;
        default:
            return secondOperand;
    }
}

// Scientific functions
function calculateFunction(func) {
    const inputValue = parseFloat(currentInput);
    
    // Validate input
    if (isNaN(inputValue)) {
        showError('Error: Entrada no válida - debe ser un número');
        logError('Entrada no válida', `calculateFunction(${func})`);
        return;
    }
    
    let result;

    try {
        switch (func) {
            case 'sin':
                result = Math.sin(toRadians(inputValue));
                showInfo(`Función: Seno de ${inputValue}° calculado`);
                break;
            case 'cos':
                result = Math.cos(toRadians(inputValue));
                showInfo(`Función: Coseno de ${inputValue}° calculado`);
                break;
            case 'tan':
                result = Math.tan(toRadians(inputValue));
                showInfo(`Función: Tangente de ${inputValue}° calculada`);
                break;
            case 'log':
                if (inputValue <= 0) {
                    throw new Error('Error: Logaritmo requiere número positivo');
                }
                result = Math.log10(inputValue);
                showInfo(`Función: Logaritmo base 10 calculado`);
                break;
            case 'ln':
                if (inputValue <= 0) {
                    throw new Error('Error: Logaritmo natural requiere número positivo');
                }
                result = Math.log(inputValue);
                showInfo(`Función: Logaritmo natural calculado`);
                break;
            case 'sqrt':
                if (inputValue < 0) {
                    showInfo(`Raíz cuadrada: Número negativo detectado`);
                    throw new Error('Error: Raíz cuadrada de número negativo no permitida');
                } else {
                    showInfo(`Raíz cuadrada: Número positivo procesado`);
                }
                result = Math.sqrt(inputValue);
                break;
            case 'square':
                result = inputValue * inputValue;
                showInfo(`Función: Cuadrado (${inputValue}²) calculado`);
                break;
            case 'cube':
                result = inputValue * inputValue * inputValue;
                showInfo(`Función: Cubo (${inputValue}³) calculado`);
                break;
            case 'reciprocal':
                if (inputValue === 0) {
                    throw new Error('Error: División por cero no permitida');
                }
                result = 1 / inputValue;
                showInfo(`Función: Recíproco (1/${inputValue}) calculado`);
                break;
            case 'factorial':
                if (inputValue < 0 || inputValue % 1 !== 0) {
                    throw new Error('Error: Factorial requiere número entero no negativo');
                }
                if (inputValue > 170) {
                    throw new Error('Error: Número demasiado grande para factorial');
                }
                result = factorial(inputValue);
                showInfo(`Función: Factorial (${inputValue}!) calculado`);
                break;
            case 'exp':
                result = Math.exp(inputValue);
                showInfo(`Función: Exponencial (e^${inputValue}) calculada`);
                break;
            case 'power':
                // This will be handled differently as it requires two operands
                setOperation('^');
                showInfo('Ingrese el exponente y presione =');
                return;
            default:
                return;
        }

        currentInput = formatResult(result);
        waitingForNewOperand = true;
        updateDisplay();
    } catch (error) {
        showError(error.message);
        logError(error.message, `calculateFunction(${func})`);
    }
}

// Utility functions
function toRadians(degrees) {
    switch (angleMode) {
        case 'rad':
            return degrees;
        case 'grad':
            return degrees * Math.PI / 200;
        default: // deg
            return degrees * Math.PI / 180;
    }
}

function factorial(n) {
    if (n > 170) throw new Error('Overflow');
    if (n === 0 || n === 1) return 1;
    let result = 1;
    for (let i = 2; i <= n; i++) {
        result *= i;
    }
    return result;
}

function formatResult(result) {
    if (isNaN(result) || !isFinite(result)) {
        throw new Error('Math error');
    }
    
    // Round to avoid floating point precision issues
    result = Math.round(result * 1e10) / 1e10;
    
    // Convert to string and handle scientific notation for large/small numbers
    if (Math.abs(result) >= 1e10 || (Math.abs(result) < 1e-6 && result !== 0)) {
        return result.toExponential(6);
    }
    
    return result.toString();
}

// Memory functions
function memoryClear() {
    memory = 0;
    hasMemory = false;
    updateMemoryIndicator();
}

function memoryRecall() {
    currentInput = memory.toString();
    waitingForNewOperand = true;
    updateDisplay();
}

function memoryAdd() {
    memory += parseFloat(currentInput);
    hasMemory = true;
    updateMemoryIndicator();
}

function memorySubtract() {
    memory -= parseFloat(currentInput);
    hasMemory = true;
    updateMemoryIndicator();
}

// Clear functions
function clearAll() {
    currentInput = '0';
    operator = null;
    previousInput = null;
    waitingForNewOperand = false;
    updateDisplay();
    showInfo('Calculadora reiniciada');
}

function clearEntry() {
    currentInput = '0';
    updateDisplay();
    showInfo('Entrada limpiada');
}

function deleteLastChar() {
    if (currentInput.length > 1) {
        currentInput = currentInput.slice(0, -1);
    } else {
        currentInput = '0';
    }
    updateDisplay();
    showInfo('Último carácter eliminado');
}

// Other functions
function toggleSign() {
    if (currentInput !== '0') {
        currentInput = currentInput.startsWith('-') 
            ? currentInput.slice(1) 
            : '-' + currentInput;
        updateDisplay();
        showInfo('Signo cambiado');
    }
}

function setAngleMode(mode) {
    const modes = ['deg', 'rad', 'grad'];
    const currentIndex = modes.indexOf(angleMode);
    angleMode = modes[(currentIndex + 1) % modes.length];
    updateAngleModeIndicator();
    showInfo(`Modo de ángulo: ${angleMode.toUpperCase()}`);
}

function inputPi() {
    currentInput = Math.PI.toString();
    waitingForNewOperand = true;
    updateDisplay();
    showInfo('Constante π ingresada');
}

function openParenthesis() {
    // Simplified parenthesis handling
    if (currentInput === '0' || waitingForNewOperand) {
        currentInput = '(';
        waitingForNewOperand = false;
    } else {
        currentInput += '(';
    }
    updateDisplay();
}

function closeParenthesis() {
    currentInput += ')';
    updateDisplay();
}

function showError(message) {
    display.textContent = message;
    display.classList.add('error');
    currentInput = '0';
    operator = null;
    previousInput = null;
    waitingForNewOperand = true;
    
    setTimeout(() => {
        display.classList.remove('error');
        updateDisplay();
    }, 2000);
}

// CSV Operations
function toggleCSVInput() {
    const csvContainer = document.getElementById('csv-container');
    if (csvContainer.style.display === 'none') {
        csvContainer.style.display = 'block';
        showInfo('Modo CSV activado - Ingrese valores separados por comas');
    } else {
        csvContainer.style.display = 'none';
        showInfo('Modo CSV desactivado');
    }
}

function processCSVInput() {
    const csvInput = document.getElementById('csv-input');
    const input = csvInput.value.trim();
    
    if (!input) {
        showError('Error: Lista CSV vacía');
        logError('Lista CSV vacía', 'processCSVInput');
        return;
    }
    
    try {
        const values = input.split(',').map(val => {
            const num = parseFloat(val.trim());
            if (isNaN(num)) {
                throw new Error(`Error: "${val.trim()}" no es un número válido`);
            }
            return num;
        });
        
        if (values.length === 0) {
            throw new Error('Error: Lista CSV incompleta');
        }
        
        csvValues = values;
        showInfo(`Lista de valores procesada: ${values.length} elementos`);
        csvInput.value = '';
        document.getElementById('csv-container').style.display = 'none';
        
    } catch (error) {
        showError(error.message);
        logError(error.message, 'processCSVInput');
    }
}

function calculateCSVMean() {
    if (csvValues.length === 0) {
        showError('Error: No hay valores CSV para procesar');
        logError('No hay valores CSV', 'calculateCSVMean');
        return;
    }
    
    const sum = csvValues.reduce((acc, val) => acc + val, 0);
    const mean = sum / csvValues.length;
    
    currentInput = formatResult(mean);
    waitingForNewOperand = true;
    updateDisplay();
    showInfo(`Media calculada de ${csvValues.length} valores: ${mean.toFixed(4)}`);
}

function removeCSVElement() {
    if (csvValues.length === 0) {
        showError('Error: No hay valores CSV para eliminar');
        logError('No hay valores CSV para eliminar', 'removeCSVElement');
        return;
    }
    
    const elementToRemove = parseFloat(currentInput);
    if (isNaN(elementToRemove)) {
        showError('Error: Ingrese un número válido para eliminar');
        logError('Número inválido para eliminar', 'removeCSVElement');
        return;
    }
    
    const index = csvValues.indexOf(elementToRemove);
    if (index === -1) {
        showError(`Error: Elemento ${elementToRemove} no encontrado en la lista`);
        logError(`Elemento ${elementToRemove} no encontrado`, 'removeCSVElement');
        return;
    }
    
    csvValues.splice(index, 1);
    showInfo(`Elemento ${elementToRemove} eliminado. Quedan ${csvValues.length} valores`);
}

function clearCSV() {
    csvValues = [];
    showInfo('Lista CSV limpiada');
}

// Keyboard support
function handleKeyboard(event) {
    const key = event.key;
    const csvContainer = document.getElementById('csv-container');
    const csvInput = document.getElementById('csv-input');
    
    // Check if CSV mode is active (container is visible)
    const isCSVModeActive = csvContainer && csvContainer.style.display === 'block';
    
    // If CSV mode is active and the CSV input field is not focused, focus it and let it handle the input
    if (isCSVModeActive && document.activeElement !== csvInput) {
        // For numbers, decimal point, comma, and Backspace in CSV mode, focus the CSV input and let it handle the input naturally
        if ((key >= '0' && key <= '9') || key === '.' || key === ',' || key === 'Backspace') {
            csvInput.focus();
            // Don't prevent default for these keys so they go to the CSV input field
            return;
        }
    }
    
    event.preventDefault();
    
    // Handle keyboard shortcuts that work in both modes
    if (key === 'Enter') {
        if (isCSVModeActive && document.activeElement === csvInput) {
            processCSVInput();
        } else {
            calculate();
        }
    } else if (key === 'Escape') {
        if (isCSVModeActive) {
            toggleCSVInput(); // Close CSV mode
        } else {
            clearAll();
        }
    } else if (key === 'c') {
        toggleCSVInput();
    } else if (key === 'm') {
        calculateCSVMean();
    }
    
    // Only handle calculator input if CSV mode is not active
    if (!isCSVModeActive) {
        if (key >= '0' && key <= '9') {
            appendNumber(key);
        } else if (key === '.') {
            appendDecimal();
        } else if (key === '+') {
            setOperation('+');
        } else if (key === '-') {
            setOperation('-');
        } else if (key === '*') {
            setOperation('×');
        } else if (key === '/') {
            setOperation('÷');
        } else if (key === '^') {
            setOperation('^');
        } else if (key === '=') {
            calculate();
        } else if (key === 'Backspace') {
            deleteLastChar();
        } else if (key === 'Delete') {
            clearEntry();
        } else if (key === 's') {
            calculateFunction('sqrt');
        } else if (key === 'l') {
            calculateFunction('log');
        } else if (key === 'n') {
            calculateFunction('ln');
        } else if (key === 'p') {
            inputPi();
        }
    }
}
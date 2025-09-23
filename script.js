// Calculator state variables
let display;
let currentInput = '0';
let operator = null;
let previousInput = null;
let waitingForNewOperand = false;
let angleMode = 'deg'; // deg, rad, grad
let memory = 0;
let hasMemory = false;

// Initialize calculator
document.addEventListener('DOMContentLoaded', function() {
    display = document.getElementById('display');
    updateDisplay();
    updateAngleModeIndicator();
    updateMemoryIndicator();
    
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

function rellenar_info(result) {
    const infoElement = document.getElementById('info');
    const numResult = parseFloat(result);
    
    if (isNaN(numResult)) {
        infoElement.textContent = "Info sobre el número";
        return;
    }
    
    if (numResult < 100) {
        infoElement.textContent = "Info: El resultado es menor que 100";
    } else if (numResult >= 100 && numResult <= 200) {
        infoElement.textContent = "Info: El resultado está entre 100 y 200";
    } else {
        infoElement.textContent = "Info: El resultado es superior a 200";
    }
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
}

function calculate() {
    const inputValue = parseFloat(currentInput);

    if (previousInput !== null && operator) {
        const newValue = performCalculation(previousInput, inputValue, operator);
        currentInput = String(newValue);
        previousInput = null;
        operator = null;
        waitingForNewOperand = true;
        updateDisplay();
        rellenar_info(newValue);
    }
}

function eq() {
    calculate();
}

function performCalculation(firstOperand, secondOperand, operator) {
    switch (operator) {
        case '+':
            return firstOperand + secondOperand;
        case '-':
            return firstOperand - secondOperand;
        case '×':
            return firstOperand * secondOperand;
        case '÷':
            if (secondOperand === 0) {
                showError('Error');
                return 0;
            }
            return firstOperand / secondOperand;
        default:
            return secondOperand;
    }
}

// Scientific functions
function calculateFunction(func) {
    const inputValue = parseFloat(currentInput);
    let result;

    try {
        switch (func) {
            case 'sin':
                result = Math.sin(toRadians(inputValue));
                break;
            case 'cos':
                result = Math.cos(toRadians(inputValue));
                break;
            case 'tan':
                result = Math.tan(toRadians(inputValue));
                break;
            case 'log':
                if (inputValue <= 0) throw new Error('Domain error');
                result = Math.log10(inputValue);
                break;
            case 'ln':
                if (inputValue <= 0) throw new Error('Domain error');
                result = Math.log(inputValue);
                break;
            case 'sqrt':
                if (inputValue < 0) throw new Error('Domain error');
                result = Math.sqrt(inputValue);
                break;
            case 'square':
                result = inputValue * inputValue;
                break;
            case 'cube':
                result = inputValue * inputValue * inputValue;
                break;
            case 'reciprocal':
                if (inputValue === 0) throw new Error('Division by zero');
                result = 1 / inputValue;
                break;
            case 'factorial':
                if (inputValue < 0 || inputValue % 1 !== 0) throw new Error('Domain error');
                result = factorial(inputValue);
                break;
            case 'exp':
                result = Math.exp(inputValue);
                break;
            case 'power':
                // This will be handled differently as it requires two operands
                setOperation('^');
                return;
            default:
                return;
        }

        currentInput = formatResult(result);
        waitingForNewOperand = true;
        updateDisplay();
        rellenar_info(result);
    } catch (error) {
        showError('Error');
    }
}

// Unary operations
function mod() {
    const inputValue = parseFloat(currentInput);
    let result;
    
    try {
        if (isNaN(inputValue)) {
            throw new Error('Invalid input');
        }
        
        result = inputValue < 0 ? -inputValue : inputValue;
        currentInput = formatResult(result);
        waitingForNewOperand = true;
        updateDisplay();
        rellenar_info(result);
    } catch (error) {
        showError('Error');
    }
}

function fact() {
    const inputValue = parseFloat(currentInput);
    let result;
    
    try {
        if (isNaN(inputValue) || inputValue < 0 || inputValue % 1 !== 0) {
            throw new Error('Domain error');
        }
        
        result = factorial(inputValue);
        currentInput = formatResult(result);
        waitingForNewOperand = true;
        updateDisplay();
        rellenar_info(result);
    } catch (error) {
        showError('Error');
    }
}

// CSV Operations
function sumatorio() {
    try {
        const values = validarCSV(currentInput);
        const sum = values.reduce((acc, val) => acc + val, 0);
        currentInput = formatResult(sum);
        waitingForNewOperand = true;
        updateDisplay();
        rellenar_info(sum);
    } catch (error) {
        showError('Error CSV');
    }
}

function ordenar() {
    try {
        const values = validarCSV(currentInput);
        const sorted = values.sort((a, b) => a - b);
        currentInput = sorted.join(',');
        waitingForNewOperand = true;
        updateDisplay();
        const infoElement = document.getElementById('info');
        infoElement.textContent = "Info: Lista ordenada";
    } catch (error) {
        showError('Error CSV');
    }
}

function revertir() {
    try {
        const values = validarCSV(currentInput);
        const reversed = values.reverse();
        currentInput = reversed.join(',');
        waitingForNewOperand = true;
        updateDisplay();
        const infoElement = document.getElementById('info');
        infoElement.textContent = "Info: Lista revertida";
    } catch (error) {
        showError('Error CSV');
    }
}

function quitar() {
    try {
        const values = validarCSV(currentInput);
        if (values.length === 0) {
            throw new Error('Lista vacía');
        }
        values.pop();
        currentInput = values.length > 0 ? values.join(',') : '0';
        waitingForNewOperand = true;
        updateDisplay();
        const infoElement = document.getElementById('info');
        infoElement.textContent = "Info: Elemento eliminado";
    } catch (error) {
        showError('Error CSV');
    }
}

// Validation functions
function validar(input) {
    if (!input || input.trim() === '') {
        throw new Error('Entrada vacía');
    }
    
    // Check if it's a CSV list
    if (input.includes(',')) {
        return validarCSV(input);
    }
    
    // Check if it's a valid number (integer or decimal, positive or negative)
    const num = parseFloat(input);
    if (isNaN(num)) {
        throw new Error('Número inválido');
    }
    
    return num;
}

function validarCSV(input) {
    if (!input || input.trim() === '') {
        throw new Error('Lista CSV vacía');
    }
    
    const values = input.split(',').map(val => val.trim());
    const numbers = [];
    
    for (const val of values) {
        if (val === '') {
            throw new Error('Lista CSV incompleta');
        }
        const num = parseFloat(val);
        if (isNaN(num)) {
            throw new Error('Valor no numérico en CSV');
        }
        numbers.push(num);
    }
    
    if (numbers.length === 0) {
        throw new Error('Lista CSV vacía');
    }
    
    return numbers;
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
}

function clearEntry() {
    currentInput = '0';
    updateDisplay();
}

function deleteLastChar() {
    if (currentInput.length > 1) {
        currentInput = currentInput.slice(0, -1);
    } else {
        currentInput = '0';
    }
    updateDisplay();
}

// Other functions
function toggleSign() {
    if (currentInput !== '0') {
        currentInput = currentInput.startsWith('-') 
            ? currentInput.slice(1) 
            : '-' + currentInput;
        updateDisplay();
    }
}

function setAngleMode(mode) {
    const modes = ['deg', 'rad', 'grad'];
    const currentIndex = modes.indexOf(angleMode);
    angleMode = modes[(currentIndex + 1) % modes.length];
    updateAngleModeIndicator();
}

function inputPi() {
    currentInput = Math.PI.toString();
    waitingForNewOperand = true;
    updateDisplay();
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

// Keyboard support
function handleKeyboard(event) {
    const key = event.key;
    
    event.preventDefault();
    
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
    } else if (key === 'Enter' || key === '=') {
        calculate();
    } else if (key === 'Escape') {
        clearAll();
    } else if (key === 'Backspace') {
        deleteLastChar();
    } else if (key === 'Delete') {
        clearEntry();
    }
}
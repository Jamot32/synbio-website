// standard curve

let dataPoints = [];
let regressionData = null;

document.addEventListener('DOMContentLoaded', function() {
    initializeStandardCurve();
});

function initializeStandardCurve() {
    // interpolation listeners
    const interpolationInputs = ['known-x', 'known-y'];
    interpolationInputs.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('input', function() {
                if (regressionData) {
                    performInterpolation();
                }
            });
        }
    });
    
    // initialize canvas
    initializeCanvas();
}

// add new data point !!
function addDataPoint() {
    const xInput = document.getElementById('x-coordinate');
    const yInput = document.getElementById('y-coordinate');
    
    const xValue = parseFloat(xInput.value);
    const yValue = parseFloat(yInput.value);
    
    // validate
    if (isNaN(xValue) || isNaN(yValue)) {
        alert('Please enter valid numeric values');
        return;
    }
    
    // duplicate x check
    if (dataPoints.some(point => Math.abs(point.x - xValue) < 1e-10)) {
        alert('X value already exists. Each X value must be unique.');
        return;
    }
    
    // add point
    const newPoint = { x: xValue, y: yValue };
    dataPoints.push(newPoint);
    
    xInput.value = '';
    yInput.value = '';
    
    updateDataPointsList();
    
    // auto-calculate if we have enough points
    if (dataPoints.length >= 2) {
        calculateCurve();
    }
}

/**
 * remove data point
 * @param {number} index - index of point to remove
 */
function removeDataPoint(index) {
    dataPoints.splice(index, 1);
    updateDataPointsList();
    
    // recalculate if we still have enough points
    if (dataPoints.length >= 2) {
        calculateCurve();
    } else {
        // clear if insufficient points
        clearResults();
    }
}

// update datapoint list
function updateDataPointsList() {
    const listElement = document.getElementById('coordinate-list');
    
    if (dataPoints.length === 0) {
        listElement.innerHTML = '<div style="text-align: center; color: #6c757d; font-style: italic;">No data points added yet</div>';
        return;
    }
    
    let html = '';
    dataPoints.forEach((point, index) => {
        html += `
            <div class="coordinate-item">
                <span>X: ${formatNumber(point.x, 3)}, Y: ${formatNumber(point.y, 3)}</span>
                <button class="remove-btn" onclick="removeDataPoint(${index})">Remove</button>
            </div>
        `;
    });
    
    listElement.innerHTML = html;
}


function calculateCurve() {
    // validate min data points
    if (dataPoints.length < 2) {
        alert('At least 2 data points are required for linear regression');
        return;
    }
    
    regressionData = calculateLinearRegression(dataPoints);

    updateStatsDisplay(regressionData);
    updateEquationDisplay(regressionData);
    drawGraph(dataPoints, regressionData);

    enableInterpolation();
    
    // show results
    const resultElement = document.getElementById('curve-result');
    if (resultElement) {
        resultElement.classList.add('show');
    }
}

/**
 * do lin reg calc
 * @param {Array} points - array of {x, y} objects
 * @returns {Object} regression results (slope, intercept, r-sq)
 */
function calculateLinearRegression(points) {
    const n = points.length;
    
    // sums
    const sumX = points.reduce((sum, p) => sum + p.x, 0);
    const sumY = points.reduce((sum, p) => sum + p.y, 0);
    const sumXY = points.reduce((sum, p) => sum + (p.x * p.y), 0);
    const sumXX = points.reduce((sum, p) => sum + (p.x * p.x), 0);
    const sumYY = points.reduce((sum, p) => sum + (p.y * p.y), 0);
    
    // slope (m) and intercept (b)
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    // r-squared
    const yMean = sumY / n;
    const ssTotal = points.reduce((sum, p) => sum + Math.pow(p.y - yMean, 2), 0);
    const ssResidual = points.reduce((sum, p) => {
        const predicted = slope * p.x + intercept;
        return sum + Math.pow(p.y - predicted, 2);
    }, 0);
    
    const rSquared = ssTotal !== 0 ? 1 - (ssResidual / ssTotal) : 1;
    
    // correlation coefficient
    const correlation = Math.sqrt(Math.abs(rSquared)) * (slope >= 0 ? 1 : -1);
    
    return {
        slope: slope,
        intercept: intercept,
        rSquared: rSquared,
        correlation: correlation,
        n: n,
        equation: `y = ${formatNumber(slope, 4)}x + ${formatNumber(intercept, 4)}`
    };
}

/**
 * update stats display
 * @param {Object} regression - regression results
 */
function updateStatsDisplay(regression) {
    const rSquaredEl = document.getElementById('r-squared');
    const slopeEl = document.getElementById('slope');
    const interceptEl = document.getElementById('intercept');
    
    if (rSquaredEl) rSquaredEl.textContent = formatNumber(regression.rSquared, 4);
    if (slopeEl) slopeEl.textContent = formatNumber(regression.slope, 4);
    if (interceptEl) interceptEl.textContent = formatNumber(regression.intercept, 4);
}

/**
 * update equation display
 * @param {Object} regression - regression results
 */
function updateEquationDisplay(regression) {
    const equationElement = document.getElementById('equation-display');
    if (!equationElement) return;
    
    const slopeStr = formatNumber(regression.slope, 4);
    const interceptStr = formatNumber(Math.abs(regression.intercept), 4);
    const interceptSign = regression.intercept >= 0 ? '+' : '-';
    
    equationElement.innerHTML = `y = ${slopeStr}x ${interceptSign} ${interceptStr}
        <div style="font-size: 14px; margin-top: 5px; color: #6c757d;">
            R² = ${formatNumber(regression.rSquared, 4)} (n = ${regression.n})
        </div>`;
}

/**
 * scatter plot and regression line on canvas
 * @param {Array} points - data points to plot
 * @param {Object} regression - regression results
 */
function drawGraph(points, regression) {
    const canvas = document.getElementById('curve-canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    // clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // plot area
    const margin = 60;
    const plotWidth = canvas.width - 2 * margin;
    const plotHeight = canvas.height - 2 * margin;
    
    // data ranges
    const xMin = Math.min(...points.map(p => p.x));
    const xMax = Math.max(...points.map(p => p.x));
    const yMin = Math.min(...points.map(p => p.y));
    const yMax = Math.max(...points.map(p => p.y));
    
    // padding
    const xRange = xMax - xMin;
    const yRange = yMax - yMin;
    const xPadding = xRange * 0.1;
    const yPadding = yRange * 0.1;
    
    const plotXMin = xMin - xPadding;
    const plotXMax = xMax + xPadding;
    const plotYMin = yMin - yPadding;
    const plotYMax = yMax + yPadding;
    
    // data coordinates to canvas coordinates
    const dataToCanvasX = (x) => margin + ((x - plotXMin) / (plotXMax - plotXMin)) * plotWidth;
    const dataToCanvasY = (y) => margin + ((plotYMax - y) / (plotYMax - plotYMin)) * plotHeight;
    
    drawAxes(ctx, margin, plotWidth, plotHeight, plotXMin, plotXMax, plotYMin, plotYMax);
    drawRegressionLine(ctx, regression, plotXMin, plotXMax, dataToCanvasX, dataToCanvasY);
    drawDataPoints(ctx, points, dataToCanvasX, dataToCanvasY);
    drawLegend(ctx, canvas.width, regression);
}

// initialize canvas
function initializeCanvas() {
    const canvas = document.getElementById('curve-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        
        ctx.fillStyle = '#6c757d';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Add data points to generate curve', canvas.width/2, canvas.height/2);
    }
}
// coordinate axes//
function drawAxes(ctx, margin, plotWidth, plotHeight, xMin, xMax, yMin, yMax) {
    ctx.strokeStyle = '#2c3e50';
    ctx.lineWidth = 2;
    
    ctx.beginPath();
    ctx.moveTo(margin, margin);
    ctx.lineTo(margin, margin + plotHeight);
    ctx.lineTo(margin + plotWidth, margin + plotHeight);
    ctx.stroke();
    
    // labels and tick marks
    ctx.fillStyle = '#2c3e50';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    
    // x-axis
    const xTicks = 5;
    for (let i = 0; i <= xTicks; i++) {
        const x = xMin + (xMax - xMin) * i / xTicks;
        const canvasX = margin + (i / xTicks) * plotWidth;

        //tick
        ctx.beginPath();
        ctx.moveTo(canvasX, margin + plotHeight);
        ctx.lineTo(canvasX, margin + plotHeight + 5);
        ctx.stroke();
        //label
        ctx.fillText(formatNumber(x, 2), canvasX, margin + plotHeight + 20);
    }
    
    // y-axis
    ctx.textAlign = 'right';
    const yTicks = 5;
    for (let i = 0; i <= yTicks; i++) {
        const y = yMin + (yMax - yMin) * i / yTicks;
        const canvasY = margin + plotHeight - (i / yTicks) * plotHeight;
        
        // ticks
        ctx.beginPath();
        ctx.moveTo(margin - 5, canvasY);
        ctx.lineTo(margin, canvasY);
        ctx.stroke();
        
        // labels
        ctx.fillText(formatNumber(y, 2), margin - 10, canvasY + 4);
    }
    
    // axis titles
    ctx.textAlign = 'center';
    ctx.font = '14px Arial';
    ctx.fillText('Concentration', margin + plotWidth/2, margin + plotHeight + 50);
    
    ctx.save();
    ctx.translate(20, margin + plotHeight/2);
    ctx.rotate(-Math.PI/2);
    ctx.fillText('Absorbance', 0, 0);
    ctx.restore();
}


function drawRegressionLine(ctx, regression, xMin, xMax, dataToCanvasX, dataToCanvasY) {
    ctx.strokeStyle = '#dc3545';
    ctx.lineWidth = 2;
    
    const y1 = regression.slope * xMin + regression.intercept;
    const y2 = regression.slope * xMax + regression.intercept;
    
    ctx.beginPath();
    ctx.moveTo(dataToCanvasX(xMin), dataToCanvasY(y1));
    ctx.lineTo(dataToCanvasX(xMax), dataToCanvasY(y2));
    ctx.stroke();
}

function drawDataPoints(ctx, points, dataToCanvasX, dataToCanvasY) {
    ctx.fillStyle = '#2c3e50';
    
    points.forEach(point => {
        ctx.beginPath();
        ctx.arc(dataToCanvasX(point.x), dataToCanvasY(point.y), 5, 0, 2 * Math.PI);
        ctx.fill();
        
        // point outline
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
    });
}

function drawLegend(ctx, canvasWidth, regression) {
    const legendX = canvasWidth - 200;
    const legendY = 30;
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fillRect(legendX - 10, legendY - 10, 190, 60);
    ctx.strokeStyle = '#dee2e6';
    ctx.lineWidth = 1;
    ctx.strokeRect(legendX - 10, legendY - 10, 190, 60);
    
    ctx.fillStyle = '#2c3e50';
    ctx.font = '12px Arial';
    ctx.textAlign = 'left';
    
    ctx.fillText(`R² = ${formatNumber(regression.rSquared, 4)}`, legendX, legendY + 15);
    ctx.fillText(`Slope = ${formatNumber(regression.slope, 4)}`, legendX, legendY + 30);
    ctx.fillText(`n = ${regression.n}`, legendX, legendY + 45);
}


function enableInterpolation() {
    const interpolationSection = document.querySelector('.interpolation-section');
    if (interpolationSection) {
        interpolationSection.style.opacity = '1';
        interpolationSection.style.pointerEvents = 'auto';
    }
    
    // if values are present
    performInterpolation();
}

function performInterpolation() {
    if (!regressionData) return;
    
    const knownXInput = document.getElementById('known-x');
    const knownYInput = document.getElementById('known-y');
    const resultElement = document.getElementById('interpolation-result');
    
    if (!knownXInput || !knownYInput || !resultElement) return;
    
    const knownX = parseFloat(knownXInput.value);
    const knownY = parseFloat(knownYInput.value);
    
    let result = '';
    
    // y from x
    if (!isNaN(knownX)) {
        const calculatedY = regressionData.slope * knownX + regressionData.intercept;
        result += `<div><strong>When concentration = ${formatNumber(knownX, 3)}:</strong><br>`;
        result += `Predicted absorbance = <span style="color: #28a745; font-weight: 600;">${formatNumber(calculatedY, 4)}</span></div>`;
    }
    
    // x from y
    if (!isNaN(knownY)) {
        const calculatedX = (knownY - regressionData.intercept) / regressionData.slope;
        if (result) result += '<br>';
        result += `<div><strong>When absorbance = ${formatNumber(knownY, 3)}:</strong><br>`;
        result += `Calculated concentration = <span style="color: #007bff; font-weight: 600;">${formatNumber(calculatedX, 4)}</span></div>`;
    }
    
    if (!result) {
        result = '<div style="color: #6c757d; font-style: italic;">Enter a known value to calculate the unknown</div>';
    }
    
    resultElement.innerHTML = result;
}


function clearResults() {
    regressionData = null;
    
    // clear stats
    const rSquaredEl = document.getElementById('r-squared');
    const slopeEl = document.getElementById('slope');
    const interceptEl = document.getElementById('intercept');
    
    if (rSquaredEl) rSquaredEl.textContent = '--';
    if (slopeEl) slopeEl.textContent = '--';
    if (interceptEl) interceptEl.textContent = '--';
    
    // clear equation
    const equationEl = document.getElementById('equation-display');
    if (equationEl) equationEl.textContent = 'Add data points to generate equation';
    
    // clear interpolation
    const interpolationEl = document.getElementById('interpolation-result');
    if (interpolationEl) interpolationEl.innerHTML = '';
    
    // disable interpolation section
    const interpolationSection = document.querySelector('.interpolation-section');
    if (interpolationSection) {
        interpolationSection.style.opacity = '0.6';
        interpolationSection.style.pointerEvents = 'none';
    }
    
    // clear canvas
    initializeCanvas();

    const resultElement = document.getElementById('curve-result');
    if (resultElement) {
        resultElement.classList.remove('show');
    }
}


/**
 * Format numbers for display
 * @param {number} num - Number to format
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted number
 */
function formatNumber(num, decimals) {
    if (isNaN(num)) return '--';
    return Number(num).toFixed(decimals);
}

// Add resize handler for canvas
window.addEventListener('resize', function() {
    if (regressionData && dataPoints.length > 0) {
        drawGraph(dataPoints, regressionData);
    }
});

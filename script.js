document.addEventListener('DOMContentLoaded', function () {
    // initialize all calculators
    updateCompoundSelectors();
    updateSavedCompoundsList();
    setupCompoundSelectHandlers();
    setupSequenceCalculatorTabs();
    setupGibsonInputHandlers();

    // setup tab switching for each calculator card
    setupMolarityCalculatorTabs();
    setupSequenceCalculatorTabs();
    setupGibsonCalculatorTabs();
    setupStandardCurveTabs();
    setupPCRCalculatorTabs();
    setupRestrictionEnzymeTabs();
});

// MOL CALC TAB SWITCH
function setupMolarityCalculatorTabs() {
    const molarityCard = document.querySelector('.calculator-card:nth-child(1)');
    if (!molarityCard) return;

    molarityCard.querySelectorAll('.calc-option').forEach(option => {
        option.addEventListener('click', function () {
            molarityCard.querySelectorAll('.calc-option').forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');
            molarityCard.querySelectorAll('[id$="-calc"]').forEach(calc => calc.style.display = 'none');

            // show the selected calc 
            const type = this.dataset.type;
            const targetCalc = document.getElementById(type + '-calc');
            if (targetCalc) {
                targetCalc.style.display = 'block';
            }

            // hide results
            document.getElementById('molarity-result').classList.remove('show');
        });
    });
}

// SEQUENCE CALC TAB SWITCHING
function setupSequenceCalculatorTabs() {
    const sequenceCard = document.querySelector('.calculator-card:nth-child(2)');
    if (!sequenceCard) return;

    sequenceCard.querySelectorAll('.calc-option[data-card="sequence"]').forEach(option => {
        option.addEventListener('click', function () {
            sequenceCard.querySelectorAll('.calc-option[data-card="sequence"]').forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');

            sequenceCard.querySelectorAll('[id$="-calc"]').forEach(calc => calc.style.display = 'none');

            const type = this.dataset.type;
            const targetCalc = document.getElementById(type + '-calc');
            if (targetCalc) {
                targetCalc.style.display = 'block';
            }

            document.getElementById('sequence-result').classList.remove('show');
        });
    });
}

// GIBSON TAB SWITCHING
function setupGibsonCalculatorTabs() {
    const gibsonCard = document.querySelector('.calculator-card:nth-child(3)');
    if (!gibsonCard) return;

    gibsonCard.querySelectorAll('.calc-option').forEach(option => {
        option.addEventListener('click', function () {
            gibsonCard.querySelectorAll('.calc-option').forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');

            gibsonCard.querySelectorAll('[id$="-calc"]').forEach(calc => calc.style.display = 'none');

            const type = this.dataset.type;
            const targetCalc = document.getElementById(type + '-calc');
            if (targetCalc) {
                targetCalc.style.display = 'block';
            }

            document.getElementById('gibson-result').classList.remove('show');
        });
    });
}

// STANDARD CURVE TAB SWITCHING
function setupStandardCurveTabs() {
    const standardCurveCard = document.querySelector('.calculator-card:nth-child(4)');
    if (!standardCurveCard) return;

    standardCurveCard.querySelectorAll('.calc-option').forEach(option => {
        option.addEventListener('click', function () {
            standardCurveCard.querySelectorAll('.calc-option').forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');

            standardCurveCard.querySelectorAll('[id$="-calc"]').forEach(calc => calc.style.display = 'none');

            const type = this.dataset.type;
            const targetCalc = document.getElementById(type + '-calc');
            if (targetCalc) {
                targetCalc.style.display = 'block';
            }

            // hide results
            document.getElementById('curve-result').classList.remove('show');
        });
    });
}

// PCR TAB SWITCHING
function setupPCRCalculatorTabs() {
    const pcrCard = document.querySelector('.calculator-card:nth-child(6)');
    if (!pcrCard) return;

    pcrCard.querySelectorAll('.calc-option').forEach(option => {
        option.addEventListener('click', function () {
            pcrCard.querySelectorAll('.calc-option').forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');

            pcrCard.querySelectorAll('[id$="-calc"]').forEach(calc => calc.style.display = 'none');

            const type = this.dataset.type;
            const targetCalc = document.getElementById(type + '-calc');
            if (targetCalc) {
                targetCalc.style.display = 'block';
            }

            const resultElement = document.getElementById('pcr-result');
            if (resultElement) {
                resultElement.classList.remove('show');
            }
        });
    });
}

// RESTRICTION ENZYME TAB SWITCHING
function setupRestrictionEnzymeTabs() {
    const enzymeCard = document.querySelector('.calculator-card:nth-child(7)');
    if (!enzymeCard) return;

    enzymeCard.querySelectorAll('.calc-option').forEach(option => {
        option.addEventListener('click', function () {
            enzymeCard.querySelectorAll('.calc-option').forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');

            enzymeCard.querySelectorAll('[id$="-calc"]').forEach(calc => calc.style.display = 'none');

            const type = this.dataset.type;
            const targetCalc = document.getElementById(type + '-calc');
            if (targetCalc) {
                targetCalc.style.display = 'block';
            }
        });
    });
}
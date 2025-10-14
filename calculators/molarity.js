// molarity



//saved compounds
let savedCompounds = [
    { name: 'NaCl', mw: 58.44 },
    { name: 'Glucose', mw: 180.16 },
    { name: 'EDTA', mw: 372.24 },
    { name: 'Tris-HCl', mw: 157.6 },
    { name: 'KCl', mw: 74.55 },
    { name: 'CaCl₂', mw: 110.98 },
];

let soluteCounter = 0;

document.addEventListener('DOMContentLoaded', function () {
    updateCompoundSelectors();
    updateSavedCompoundsList();
    setupCompoundSelectHandlers();
});

function setupCompoundSelectHandlers() {
    // autofill molecular weight section
    const compoundSelect = document.getElementById('compound-select');
    const compoundSelectMass = document.getElementById('compound-select-mass');

    if (compoundSelect) {
        compoundSelect.addEventListener('change', function () {
            const selectedCompound = savedCompounds.find(c => c.name === this.value);
            const mwInput = document.getElementById('molecular-weight');
            if (selectedCompound && mwInput) {
                mwInput.value = selectedCompound.mw;
                console.log('Auto-filled MW:', selectedCompound.mw);
            } else {
                if (mwInput) mwInput.value = '';
            }
        });
    }

    if (compoundSelectMass) {
        compoundSelectMass.addEventListener('change', function () {
            const selectedCompound = savedCompounds.find(c => c.name === this.value);
            const mwInput = document.getElementById('molecular-weight-mass');
            if (selectedCompound && mwInput) {
                mwInput.value = selectedCompound.mw;
                console.log('Auto-filled MW (mass calc):', selectedCompound.mw);
            } else {
                if (mwInput) mwInput.value = '';
            }
        });
    }
}


function updateCompoundSelectors() {
    const selectors = ['compound-select', 'compound-select-mass'];
    selectors.forEach(selectorId => {
        const selector = document.getElementById(selectorId);
        if (!selector) return;

        const currentValue = selector.value;
        selector.innerHTML = '<option value="">Select compound or enter manually</option>';

        savedCompounds.forEach(compound => {
            const option = document.createElement('option');
            option.value = compound.name;
            option.textContent = `${compound.name} (${compound.mw} g/mol)`;
            selector.appendChild(option);
        });

        if (currentValue && savedCompounds.some(c => c.name === currentValue)) {
            selector.value = currentValue;
        }
    });

    // multi-solute selectors
    document.querySelectorAll('.solute-compound-select').forEach(selector => {
        const currentValue = selector.value;
        selector.innerHTML = '<option value="">Select compound</option>';
        savedCompounds.forEach(compound => {
            const option = document.createElement('option');
            option.value = compound.name;
            option.textContent = `${compound.name} (${compound.mw} g/mol)`;
            selector.appendChild(option);
        });

        if (currentValue && savedCompounds.some(c => c.name === currentValue)) {
            selector.value = currentValue;
        }
    });

    // Re-setup event handlers after updating selectors
    setupCompoundSelectHandlers();
}

function addSolute() {
    soluteCounter++;
    const soluteList = document.getElementById('solute-list');
    const soluteDiv = document.createElement('div');
    soluteDiv.className = 'solute-item';
    soluteDiv.dataset.soluteId = soluteCounter;

    soluteDiv.innerHTML = `
                <div class="solute-header">
                    <span class="solute-number">Solute ${soluteCounter}</span>
                    <button type="button" class="remove-solute" onclick="removeSolute(${soluteCounter})">Remove</button>
                </div>
                <div class="input-group">
                    <label>Compound</label>
                    <select class="solute-compound-select" data-solute="${soluteCounter}">
                        <option value="">Select compound</option>
                    </select>
                </div>
                <div class="solute-inputs">
                    <div class="input-group">
                        <label>Desired Molarity (M)</label>
                        <input type="number" class="solute-molarity" step="any" placeholder="e.g., 0.1">
                    </div>
                    <div class="input-group">
                        <label>MW (g/mol)</label>
                        <input type="number" class="solute-mw" step="any" placeholder="Auto-filled">
                    </div>
                </div>
            `;

    soluteList.appendChild(soluteDiv);
    updateCompoundSelectors();

    // compound selection in multi-solute
    const newSelect = soluteDiv.querySelector('.solute-compound-select');
    const newMwInput = soluteDiv.querySelector('.solute-mw');
    newSelect.addEventListener('change', function () {
        const selectedCompound = savedCompounds.find(c => c.name === this.value);
        if (selectedCompound) {
            newMwInput.value = selectedCompound.mw;
        } else {
            newMwInput.value = '';
        }
    });
}

function removeSolute(soluteId) {
    const soluteDiv = document.querySelector(`[data-solute-id="${soluteId}"]`);
    if (soluteDiv) {
        soluteDiv.remove();
    }
}

function updateSavedCompoundsList() {
    const container = document.getElementById('saved-compounds');
    if (savedCompounds.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #6c757d; padding: 20px;">No saved compounds yet</p>';
        return;
    }

    container.innerHTML = '';
    savedCompounds.forEach((compound, index) => {
        const item = document.createElement('div');
        item.className = 'compound-item';
        item.innerHTML = `
                    <span><strong>${compound.name}</strong> - ${compound.mw} g/mol</span>
                    <button class="delete-btn" onclick="deleteCompound(${index})">Delete</button>
                `;
        container.appendChild(item);
    });
}

function openModal() {
    document.getElementById('compoundModal').style.display = 'block';
}

function closeModal() {
    document.getElementById('compoundModal').style.display = 'none';
    document.getElementById('new-compound-name').value = '';
    document.getElementById('new-molecular-weight').value = '';
}

function addCompound() {
    const name = document.getElementById('new-compound-name').value.trim();
    const mw = parseFloat(document.getElementById('new-molecular-weight').value);

    if (!name || isNaN(mw) || mw <= 0) {
        alert('Please enter a valid compound name and molecular weight.');
        return;
    }

    if (savedCompounds.some(c => c.name.toLowerCase() === name.toLowerCase())) {
        alert('This compound already exists in your list.');
        return;
    }

    savedCompounds.push({ name, mw });
    updateCompoundSelectors();
    updateSavedCompoundsList();

    document.getElementById('new-compound-name').value = '';
    document.getElementById('new-molecular-weight').value = '';
}

function deleteCompound(index) {
    if (confirm('Are you sure you want to delete this compound?')) {
        savedCompounds.splice(index, 1);
        updateCompoundSelectors();
        updateSavedCompoundsList();
    }
}
//close modal
window.onclick = function (event) {
    const modal = document.getElementById('compoundModal');
    if (event.target == modal) {
        closeModal();
    }
}

function calculate() {
    const activeCalc = document.querySelector('.calc-option.active');
    const activeType = activeCalc.dataset.type;

    switch (activeType) {
        case 'molarity-from-mass':
            calculateMolarityFromMass();
            break;
        case 'mass-from-molarity':
            calculateMassFromMolarity();
            break;
        case 'multi-solute':
            calculateMultiSolute();
            break;
        case 'dilution':
            calculateDilution();
            break;
    }
}

function calculateMultiSolute() {
    const totalVolume = parseFloat(document.getElementById('total-volume').value);

    if (isNaN(totalVolume) || totalVolume <= 0) {
        alert('Please enter a valid total volume.');
        return;
    }

    const solutes = [];
    const soluteItems = document.querySelectorAll('.solute-item');

    if (soluteItems.length === 0) {
        alert('Please add at least one solute.');
        return;
    }

    for (let item of soluteItems) {
        const compound = item.querySelector('.solute-compound-select').value;
        const molarity = parseFloat(item.querySelector('.solute-molarity').value);
        const mw = parseFloat(item.querySelector('.solute-mw').value);

        if (isNaN(molarity) || isNaN(mw) || molarity <= 0 || mw <= 0) {
            alert('Please fill in valid molarity and molecular weight for all solutes.');
            return;
        }

        const mass = molarity * mw * totalVolume;
        solutes.push({
            compound: compound || 'Unknown compound',
            molarity,
            mw,
            mass
        });
    }

    let output = `<strong>Recipe for ${totalVolume} L solution:</strong><br><br>`;
    let totalMass = 0;

    solutes.forEach((solute, index) => {
        output += `<div class="solute-result">`;
        output += `<strong>${solute.compound}</strong><br>`;
        output += `Mass needed: <strong>${solute.mass.toFixed(4)} g</strong><br>`;
        output += `Final concentration: ${solute.molarity} M<br>`;
        output += `MW: ${solute.mw} g/mol`;
        output += `</div>`;
        totalMass += solute.mass;
    });

    output += `<br><strong>Total mass of all solutes: ${totalMass.toFixed(4)} g</strong>`;

    let formula = `For each solute: mass (g) = M × MW (g/mol) × volume (L)<br><br>`;
    solutes.forEach((solute, index) => {
        formula += `${solute.compound}: ${solute.molarity} × ${solute.mw} × ${totalVolume} = ${solute.mass.toFixed(4)} g<br>`;
    });

    displayResult(output, formula);
}

function calculateMolarityFromMass() {
    const mass = parseFloat(document.getElementById('mass').value);
    const molecularWeight = parseFloat(document.getElementById('molecular-weight').value);
    const volume = parseFloat(document.getElementById('volume-mass').value);
    const compoundName = document.getElementById('compound-select').value;

    if (isNaN(mass) || isNaN(molecularWeight) || isNaN(volume) || mass <= 0 || molecularWeight <= 0 || volume <= 0) {
        alert('Please enter valid positive numbers for all fields.');
        return;
    }

    // m = mass(g) / (mw(g/mol) × v(L))
    const molarity = mass / (molecularWeight * volume);

    const compoundText = compoundName ? ` of ${compoundName}` : '';
    displayResult(
        `<strong>Molarity: ${molarity.toFixed(4)} M</strong><br>
                <em>${mass} g${compoundText} (MW: ${molecularWeight} g/mol) in ${volume} L solution</em>`,
        `M = mass (g) / [MW (g/mol) × volume (L)]<br>
                M = ${mass} / [${molecularWeight} × ${volume}] = ${molarity.toFixed(4)} M`
    );
}

function calculateMassFromMolarity() {
    const molarity = parseFloat(document.getElementById('molarity-mass').value);
    const molecularWeight = parseFloat(document.getElementById('molecular-weight-mass').value);
    const volume = parseFloat(document.getElementById('volume-molarity').value);
    const compoundName = document.getElementById('compound-select-mass').value;

    if (isNaN(molarity) || isNaN(molecularWeight) || isNaN(volume) || molarity <= 0 || molecularWeight <= 0 || volume <= 0) {
        alert('Please enter valid positive numbers for all fields.');
        return;
    }

    // mass(g) = m × mw(g/mol) × v(L)
    const mass = molarity * molecularWeight * volume;

    const compoundText = compoundName ? ` of ${compoundName}` : '';
    displayResult(
        `<strong>Mass required: ${mass.toFixed(4)} g</strong><br>
                <em>To make ${volume} L of ${molarity} M solution${compoundText}</em>`,
        `mass (g) = M × MW (g/mol) × volume (L)<br>
                mass = ${molarity} × ${molecularWeight} × ${volume} = ${mass.toFixed(4)} g`
    );
}

function calculateDilution() {
    const c1 = parseFloat(document.getElementById('c1').value);
    const v1 = parseFloat(document.getElementById('v1').value);
    const c2 = parseFloat(document.getElementById('c2').value);
    const v2 = parseFloat(document.getElementById('v2').value);

    let result = '';
    let formula = '';

    // determine which value to calculate (length filled)
    const emptyFields = [c1, v1, c2, v2].filter(val => isNaN(val)).length;

    if (emptyFields !== 1) {
        alert('Please fill in exactly 3 fields and leave 1 field empty to calculate.');
        return;
    }

    if (isNaN(v1)) {
        // v1 (volume of stock needed)
        const calcV1 = (c2 * v2) / c1;
        result = `<strong>Volume of stock needed (V₁): ${calcV1.toFixed(3)} mL</strong><br>`;
        result += `Add ${calcV1.toFixed(3)} mL of ${c1} M stock to ${(v2 - calcV1).toFixed(3)} mL solvent`;
        formula = `C₁V₁ = C₂V₂<br>V₁ = (C₂ × V₂) / C₁ = (${c2} × ${v2}) / ${c1} = ${calcV1.toFixed(3)} mL`;
    } else if (isNaN(v2)) {
        // v2 (final volume)
        const calcV2 = (c1 * v1) / c2;
        result = `<strong>Final Volume (V₂): ${calcV2.toFixed(3)} mL</strong><br>`;
        result += `Dilute ${v1} mL of stock to ${calcV2.toFixed(3)} mL total volume`;
        formula = `C₁V₁ = C₂V₂<br>V₂ = (C₁ × V₁) / C₂ = (${c1} × ${v1}) / ${c2} = ${calcV2.toFixed(3)} mL`;
    } else if (isNaN(c1)) {
        // c1 (initial concentration)
        const calcC1 = (c2 * v2) / v1;
        result = `<strong>Required Stock Concentration (C₁): ${calcC1.toFixed(4)} M</strong>`;
        formula = `C₁V₁ = C₂V₂<br>C₁ = (C₂ × V₂) / V₁ = (${c2} × ${v2}) / ${v1} = ${calcC1.toFixed(4)} M`;
    } else if (isNaN(c2)) {
        // c2 (final concentration)
        const calcC2 = (c1 * v1) / v2;
        result = `<strong>Final Concentration (C₂): ${calcC2.toFixed(4)} M</strong>`;
        formula = `C₁V₁ = C₂V₂<br>C₂ = (C₁ × V₁) / V₂ = (${c1} × ${v1}) / ${v2} = ${calcC2.toFixed(4)} M`;
    }

    displayResult(result, formula);
}

function displayResult(output, formula) {
    document.getElementById('molarity-output').innerHTML = output;
    document.getElementById('molarity-formula').innerHTML = formula;
    document.getElementById('molarity-result').classList.add('show');
}

// clear results when input changes
document.querySelectorAll('input').forEach(input => {
    input.addEventListener('input', function () {
        const resultElements = ['molarity-result', 'sequence-result', 'gibson-result', 'pcr-result', 'curve-result'];
        resultElements.forEach(id => {
            const element = document.getElementById(id);
            if (element) element.classList.remove('show');
        });
    });
});

// gibson



let gibsonFragmentCounter = 0;

function calculateMolarConcentration(ngPerUl, basePairs) {
    // ng/μL to nM: (ng/μL × 1,000,000) / (660 × bp)
    return (ngPerUl * 1000000) / (660 * basePairs);
}

function calculateVolumeNeeded(targetNmoles, concentrationNM) {
    // volume (μL) = target (nmol) / concentration (nM) × 1000
    return (targetNmoles / concentrationNM) * 1000;
}

function calculateGibsonOptimalRatios(vectorLength, fragmentLengths, ratio = 3) {
    const vectorMolarMass = vectorLength * 660; // g/mol
    const results = {
        vector: { ratio: 1, molarMass: vectorMolarMass },
        fragments: []
    };

    fragmentLengths.forEach((length, index) => {
        const fragmentMolarMass = length * 660;
        results.fragments.push({
            index: index,
            ratio: ratio,
            molarMass: fragmentMolarMass,
            length: length
        });
    });

    return results;
}

function calculateGCContent(dnaSequence) {
    const cleanDNA = dnaSequence.replace(/\s/g, '').toUpperCase();
    const gcCount = (cleanDNA.match(/[GC]/g) || []).length;
    return (gcCount / cleanDNA.length * 100);
}

function calculateOverlapTm(sequence) {
    // simplified tm calculation for short sequences
    const cleanSeq = sequence.replace(/\s/g, '').toUpperCase();
    if (cleanSeq.length === 0) return 0;

    const gc = (cleanSeq.match(/[GC]/g) || []).length;
    const at = (cleanSeq.match(/[AT]/g) || []).length;

    // basic tm formula for short oligonucleotides
    if (cleanSeq.length < 14) {
        return (at * 2) + (gc * 4);
    } else {
        return 64.9 + 41 * (gc - 16.4) / cleanSeq.length;
    }
}

function validateGibsonInputs(vectorLength, vectorConc, fragments) {
    const warnings = [];
    const errors = [];

    // vector validation
    if (vectorLength < 100 || vectorLength > 50000) {
        warnings.push('Vector length outside typical range (100-50,000 bp)');
    }
    if (vectorConc < 5) {
        warnings.push('Vector concentration is quite low (< 5 ng/μL)');
    }

    // fragment validation
    fragments.forEach((frag, index) => {
        if (frag.length < 50) {
            warnings.push(`Fragment ${index + 1} is very short (< 50 bp)`);
        }
        if (frag.length > 20000) {
            warnings.push(`Fragment ${index + 1} is very long (> 20 kb) - may need special conditions`);
        }
        if (frag.concentration < 5) {
            warnings.push(`Fragment ${index + 1} concentration is low (< 5 ng/μL)`);
        }
    });

    return { warnings, errors };
}

// fragment management functions
function addGibsonFragment() {
    gibsonFragmentCounter++;
    const fragmentList = document.getElementById('gibson-fragment-list');
    const fragmentDiv = document.createElement('div');
    fragmentDiv.className = 'fragment-item';
    fragmentDiv.dataset.fragmentId = gibsonFragmentCounter;

    fragmentDiv.innerHTML = `
        <div class="fragment-header">
            <span class="fragment-number">Fragment ${gibsonFragmentCounter}</span>
            <button type="button" class="remove-fragment" onclick="removeGibsonFragment(${gibsonFragmentCounter})">Remove</button>
        </div>
        <div class="fragment-inputs">
            <div class="input-group">
                <label>Fragment Name</label>
                <input type="text" class="fragment-name" placeholder="e.g., GFP insert">
            </div>
            <div class="input-group">
                <label>Length (bp)</label>
                <input type="number" class="fragment-length" step="any" placeholder="e.g., 720" min="1">
            </div>
            <div class="input-group">
                <label>Concentration (ng/μL)</label>
                <input type="number" class="fragment-concentration" step="any" placeholder="e.g., 25" min="0.1">
            </div>
        </div>
    `;

    fragmentList.appendChild(fragmentDiv);
}

function removeGibsonFragment(fragmentId) {
    const fragmentDiv = document.querySelector(`[data-fragment-id="${fragmentId}"]`);
    if (fragmentDiv) {
        fragmentDiv.remove();
    }
}

// main gibson calc
function calculateGibson() {
    const activeCalc = document.querySelector('.calc-option.active');
    const activeType = activeCalc.dataset.type;

    switch (activeType) {
        case 'gibson-basic':
            calculateBasicGibson();
            break;
        case 'gibson-overlap':
            calculateOverlapAnalysis();
            break;
        case 'gibson-protocol':
            generateGibsonProtocol();
            break;
    }
}

function calculateBasicGibson() {
    // get vector inputs
    const vectorName = document.getElementById('vector-name').value.trim() || 'Vector';
    const vectorLength = parseFloat(document.getElementById('vector-length').value);
    const vectorConc = parseFloat(document.getElementById('vector-concentration').value);
    const reactionVolume = parseFloat(document.getElementById('reaction-volume').value);
    const insertVectorRatio = parseFloat(document.getElementById('insert-vector-ratio').value);

    // validate vector inputs
    if (isNaN(vectorLength) || isNaN(vectorConc) || vectorLength <= 0 || vectorConc <= 0) {
        alert('Please enter valid vector length and concentration.');
        return;
    }

    // get fragment inputs
    const fragmentItems = document.querySelectorAll('.fragment-item');
    const fragments = [];

    if (fragmentItems.length === 0) {
        alert('Please add at least one fragment.');
        return;
    }

    for (let item of fragmentItems) {
        const name = item.querySelector('.fragment-name').value.trim() || 'Fragment';
        const length = parseFloat(item.querySelector('.fragment-length').value);
        const concentration = parseFloat(item.querySelector('.fragment-concentration').value);

        if (isNaN(length) || isNaN(concentration) || length <= 0 || concentration <= 0) {
            alert('Please fill in valid length and concentration for all fragments.');
            return;
        }

        fragments.push({ name, length, concentration });
    }

    // validate
    const validation = validateGibsonInputs(vectorLength, vectorConc, fragments);

    // calc molar concentrations
    const vectorNM = calculateMolarConcentration(vectorConc, vectorLength);
    const targetVectorNmoles = 0.05; // 0.05 pmol vector
    const vectorVolume = calculateVolumeNeeded(targetVectorNmoles, vectorNM);

    let output = `<strong>Gibson Assembly Recipe (${reactionVolume} μL reaction):</strong><br><br>`;

    // vector calc
    output += `<div class="gibson-result-item">`;
    output += `<strong>${vectorName}</strong> (${vectorLength} bp)<br>`;
    output += `Add: <strong>${Math.min(vectorVolume, reactionVolume * 0.5).toFixed(2)} μL</strong><br>`;
    output += `Final amount: ${targetVectorNmoles.toFixed(3)} pmol<br>`;
    output += `Concentration: ${vectorNM.toFixed(2)} nM`;
    output += `</div>`;

    let totalVolume = Math.min(vectorVolume, reactionVolume * 0.5);

    // fragment calc
    fragments.forEach((fragment, index) => {
        const fragmentNM = calculateMolarConcentration(fragment.concentration, fragment.length);
        const targetFragmentNmoles = targetVectorNmoles * insertVectorRatio;
        const fragmentVolume = calculateVolumeNeeded(targetFragmentNmoles, fragmentNM);
        const actualVolume = Math.min(fragmentVolume, reactionVolume * 0.3);

        output += `<div class="gibson-result-item">`;
        output += `<strong>${fragment.name}</strong> (${fragment.length} bp)<br>`;
        output += `Add: <strong>${actualVolume.toFixed(2)} μL</strong><br>`;
        output += `Ratio: ${insertVectorRatio}:1 (insert:vector)<br>`;
        output += `Final amount: ${(targetFragmentNmoles * actualVolume / fragmentVolume).toFixed(3)} pmol<br>`;
        output += `Concentration: ${fragmentNM.toFixed(2)} nM`;
        output += `</div>`;

        totalVolume += actualVolume;
    });

    // assembly mix calc
    const assemblyMixVolume = reactionVolume * 0.5;
    totalVolume += assemblyMixVolume;
    const waterVolume = Math.max(0, reactionVolume - totalVolume);

    output += `<div class="gibson-result-item">`;
    output += `<strong>NEBuilder HiFi DNA Assembly Mix</strong><br>`;
    output += `Add: <strong>${assemblyMixVolume.toFixed(2)} μL</strong><br>`;
    output += `</div>`;

    if (waterVolume > 0) {
        output += `<div class="gibson-result-item">`;
        output += `<strong>Nuclease-free Water</strong><br>`;
        output += `Add: <strong>${waterVolume.toFixed(2)} μL</strong><br>`;
        output += `</div>`;
    }

    output += `<br><strong>Total Volume: ${reactionVolume} μL</strong>`;

    // add warning
    if (validation.warnings.length > 0) {
        output += `<div class="warning-box">`;
        output += `<strong>⚠️ Warnings:</strong><br>`;
        validation.warnings.forEach(warning => {
            output += `• ${warning}<br>`;
        });
        output += `</div>`;
    }

    // formula explanation
    let formula = `Calculations:<br><br>`;
    formula += `Molar concentration (nM) = (ng/μL × 1,000,000) / (660 × bp)<br>`;
    formula += `Vector: ${vectorConc} ng/μL → ${vectorNM.toFixed(2)} nM<br><br>`;
    formula += `Volume needed (μL) = (target pmol / concentration nM) × 1000<br>`;
    formula += `Target ratio: ${insertVectorRatio}:1 (insert:vector)<br>`;
    formula += `Assembly mix: 50% of total reaction volume`;

    displayGibsonResult(output, formula);
}

function calculateOverlapAnalysis() {
    const overlapSeq = document.getElementById('overlap-sequence').value.trim().toUpperCase();

    if (!overlapSeq) {
        alert('Please enter an overlap sequence.');
        return;
    }

    // validate DNA sequence
    if (!/^[ATCG\s]*$/.test(overlapSeq)) {
        alert('Invalid DNA sequence. Only A, T, C, G characters allowed.');
        return;
    }

    const cleanSeq = overlapSeq.replace(/\s/g, '');
    const length = cleanSeq.length;
    const gcContent = calculateGCContent(cleanSeq);
    const tm = calculateOverlapTm(cleanSeq);

    let status = '';
    let statusClass = '';

    if (length < 15) {
        status = 'Too Short - Risk of poor assembly';
        statusClass = 'error-indicator';
    } else if (length > 40) {
        status = 'Too Long - May reduce efficiency';
        statusClass = 'warning-indicator';
    } else {
        status = 'Optimal Length';
        statusClass = 'success-indicator';
    }

    let output = `<div class="overlap-stats">`;
    output += `<div class="overlap-stat">`;
    output += `<div class="overlap-value">${length}</div>`;
    output += `<div class="overlap-label">Length (bp)</div>`;
    output += `</div>`;
    output += `<div class="overlap-stat">`;
    output += `<div class="overlap-value">${gcContent.toFixed(1)}%</div>`;
    output += `<div class="overlap-label">GC Content</div>`;
    output += `</div>`;
    output += `<div class="overlap-stat">`;
    output += `<div class="overlap-value">${tm.toFixed(1)}°C</div>`;
    output += `<div class="overlap-label">Est. Tm</div>`;
    output += `</div>`;
    output += `</div>`;

    output += `<div class="${statusClass}"><strong>Status:</strong> ${status}</div><br>`;

    output += `<strong>Recommendations:</strong><br>`;
    output += `• Optimal overlap length: 15-40 bp<br>`;
    output += `• GC content: 40-60% preferred<br>`;
    output += `• Avoid secondary structures<br>`;
    output += `• Check for primer-dimer formation<br>`;

    document.getElementById('gibson-output').innerHTML = output;
    document.getElementById('gibson-result').classList.add('show');
}

function generateGibsonProtocol() {
    const assemblyKit = document.getElementById('assembly-kit').value;
    const incubationTime = document.getElementById('incubation-time').value;

    let protocol = '';

    if (assemblyKit === 'nebuilder') {
        protocol = `NEBuilder HiFi DNA Assembly Protocol:

1. PREPARATION:
   • Thaw NEBuilder HiFi DNA Assembly Master Mix on ice
   • Prepare all DNA components (vector and fragments)
   • Keep all components on ice

2. REACTION SETUP:
   • Add calculated volumes of vector and fragments
   • Add equal volume of NEBuilder HiFi Assembly Master Mix
   • Add water to final volume if needed
   • Mix gently by pipetting

3. INCUBATION:
   • Incubate at 50°C for ${incubationTime} minutes
   • For difficult assemblies: extend to 120 minutes

4. TRANSFORMATION:
   • Use 2-5 μL for transformation
   • Transform into competent E. coli cells
   • Plate on selective media

5. TROUBLESHOOTING TIPS:
   • Use 2-6:1 molar ratio (insert:vector)
   • Keep total DNA amount 0.02-0.5 pmoles
   • Ensure 15-40 bp overlaps between fragments
   • Verify fragment concentrations`;
    } else {
        protocol = `Homemade Gibson Assembly Protocol:

1. GIBSON MASTER MIX (5X):
   • 320 μL 1.25 M Tris-HCl pH 7.5
   • 32 μL 1 M MgCl2
   • 2 μL 100 mM dGTP, dATP, dTTP, dCTP each
   • 80 μL 1 M DTT
   • 20 μL 50 mM NAD+
   • 160 μL PEG-8000 (50% w/v)
   • 4 μL T5 exonuclease (1 U/μL)
   • 20 μL Phusion DNA polymerase (2 U/μL)
   • 160 μL Taq DNA ligase (40 U/μL)
   • Add water to 1000 μL total

2. REACTION SETUP:
   • Mix DNA components as calculated
   • Add equal volume of Gibson Master Mix
   • Final reaction volume: typically 10-20 μL

3. INCUBATION:
   • 50°C for ${incubationTime} minutes

4. TRANSFORMATION:
   • Use 2-5 μL for transformation
   • Transform immediately or store at -20°C`;
    }

    document.getElementById('protocol-output').innerHTML = protocol;

    const output = `<button class="copy-protocol-btn" onclick="copyToClipboard(\`${protocol}\`)">Copy Protocol</button>`;

    displayGibsonResult(output, '');
}

function displayGibsonResult(output, formula) {
    document.getElementById('gibson-output').innerHTML = output;
    document.getElementById('gibson-formula').innerHTML = formula;
    document.getElementById('gibson-result').classList.add('show');
}

// clear results when inputs change
function setupGibsonInputHandlers() {
    document.querySelectorAll('#gibson-basic-calc input, #gibson-overlap-calc textarea, #gibson-protocol-calc select').forEach(input => {
        input.addEventListener('input', function () {
            document.getElementById('gibson-result').classList.remove('show');
        });
    });
}


document.addEventListener('DOMContentLoaded', function () {
    // code
    setupGibsonInputHandlers();
});
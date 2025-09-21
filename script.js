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

        document.addEventListener('DOMContentLoaded', function() {
            updateCompoundSelectors();
            updateSavedCompoundsList();
            setupCompoundSelectHandlers();
        });

        function setupCompoundSelectHandlers() {
            // autofill molecular weight section
            const compoundSelect = document.getElementById('compound-select');
            const compoundSelectMass = document.getElementById('compound-select-mass');
            
            if (compoundSelect) {
                compoundSelect.addEventListener('change', function() {
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
                compoundSelectMass.addEventListener('change', function() {
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

        // switch calc
        document.querySelectorAll('.calc-option').forEach(option => {
            option.addEventListener('click', function() {
                // remove active class
                document.querySelectorAll('.calc-option').forEach(opt => opt.classList.remove('active'));
                
                // add active class to clicked option
                this.classList.add('active');
                
                // show/hide calculators
                const type = this.dataset.type;
                document.querySelectorAll('[id$="-calc"]').forEach(calc => calc.style.display = 'none');
                const targetCalc = document.getElementById(type + '-calc');
                if (targetCalc) {
                    targetCalc.style.display = 'block';
                }
                
                document.getElementById('result').classList.remove('show');
            });
        });

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
            newSelect.addEventListener('change', function() {
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
        window.onclick = function(event) {
            const modal = document.getElementById('compoundModal');
            if (event.target == modal) {
                closeModal();
            }
        }

        function calculate() {
            const activeCalc = document.querySelector('.calc-option.active');
            const activeType = activeCalc.dataset.type;
            
            switch(activeType) {
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
            document.getElementById('output').innerHTML = output;
            document.getElementById('formula').innerHTML = formula;
            document.getElementById('result').classList.add('show');
        }

        // clear results when input changes
        document.querySelectorAll('input').forEach(input => {
            input.addEventListener('input', function() {
                document.getElementById('result').classList.remove('show');
            });
        });














// protein






const geneticCode = {
    'TTT': 'F', 'TTC': 'F', 'TTA': 'L', 'TTG': 'L',
    'TCT': 'S', 'TCC': 'S', 'TCA': 'S', 'TCG': 'S',
    'TAT': 'Y', 'TAC': 'Y', 'TAA': '*', 'TAG': '*',
    'TGT': 'C', 'TGC': 'C', 'TGA': '*', 'TGG': 'W',
    'CTT': 'L', 'CTC': 'L', 'CTA': 'L', 'CTG': 'L',
    'CCT': 'P', 'CCC': 'P', 'CCA': 'P', 'CCG': 'P',
    'CAT': 'H', 'CAC': 'H', 'CAA': 'Q', 'CAG': 'Q',
    'CGT': 'R', 'CGC': 'R', 'CGA': 'R', 'CGG': 'R',
    'ATT': 'I', 'ATC': 'I', 'ATA': 'I', 'ATG': 'M',
    'ACT': 'T', 'ACC': 'T', 'ACA': 'T', 'ACG': 'T',
    'AAT': 'N', 'AAC': 'N', 'AAA': 'K', 'AAG': 'K',
    'AGT': 'S', 'AGC': 'S', 'AGA': 'R', 'AGG': 'R',
    'GTT': 'V', 'GTC': 'V', 'GTA': 'V', 'GTG': 'V',
    'GCT': 'A', 'GCC': 'A', 'GCA': 'A', 'GCG': 'A',
    'GAT': 'D', 'GAC': 'D', 'GAA': 'E', 'GAG': 'E',
    'GGT': 'G', 'GGC': 'G', 'GGA': 'G', 'GGG': 'G'
};

// mw
const aminoAcidWeights = {
    'A': 71.08, 'R': 156.19, 'N': 114.10, 'D': 115.09,
    'C': 103.14, 'Q': 128.13, 'E': 129.12, 'G': 57.05,
    'H': 137.14, 'I': 113.16, 'L': 113.16, 'K': 128.17,
    'M': 131.19, 'F': 147.18, 'P': 97.12, 'S': 87.08,
    'T': 101.11, 'W': 186.21, 'Y': 163.18, 'V': 99.13
};

// reverse translate
const backTranslationTable = {
    'A': ['GCT'], 'R': ['CGT'], 'N': ['AAT'], 'D': ['GAT'],
    'C': ['TGT'], 'Q': ['CAG'], 'E': ['GAG'], 'G': ['GGT'],
    'H': ['CAT'], 'I': ['ATT'], 'L': ['CTG'], 'K': ['AAG'],
    'M': ['ATG'], 'F': ['TTT'], 'P': ['CCG'], 'S': ['AGT'],
    'T': ['ACT'], 'W': ['TGG'], 'Y': ['TAT'], 'V': ['GTG']
};

// domcontentloaded function
function setupSequenceCalculatorTabs() {
    // switch tab
    document.querySelectorAll('.calc-option[data-card="sequence"]').forEach(option => {
        option.addEventListener('click', function() {
            // remove active class
            document.querySelectorAll('.calc-option[data-card="sequence"]').forEach(opt => opt.classList.remove('active'));
            
            // add active class to clicked
            this.classList.add('active');
            

            const type = this.dataset.type;
            if (targetCalc) {
                targetCalc.style.display = 'block';
            }
            
            document.getElementById('sequence-result').classList.remove('show');
        });
    });
}

// dna/protein conversion
function translateDNA(dnaSequence, frame = 1) {
    // validation of sequence
    const cleanDNA = dnaSequence.replace(/\s/g, '').toUpperCase();
    if (!/^[ATCG]*$/.test(cleanDNA)) {
        throw new Error('Invalid DNA sequence. Only A, T, C, G allowed.');
    }
    
    const startIndex = frame - 1;
    let protein = '';
    
    for (let i = startIndex; i < cleanDNA.length - 2; i += 3) {
        const codon = cleanDNA.slice(i, i + 3);
        if (codon.length === 3) {
            const aminoAcid = geneticCode[codon] || 'X';
            protein += aminoAcid;
            if (aminoAcid === '*') break;
        }
    }
    
    return protein;
}

function backTranslate(proteinSequence) {
    const cleanProtein = proteinSequence.replace(/\s/g, '').toUpperCase();
    if (!/^[ACDEFGHIKLMNPQRSTVWY]*$/.test(cleanProtein)) {
        throw new Error('Invalid protein sequence. Only standard amino acid codes allowed.');
    }
    
    let dnaSequence = '';
    for (let aa of cleanProtein) {
        if (backTranslationTable[aa]) {
            dnaSequence += backTranslationTable[aa][0];
        } else {
            throw new Error(`Unknown amino acid: ${aa}`);
        }
    }
    
    return dnaSequence;
}

function calculateMolecularWeight(proteinSequence) {
    const cleanProtein = proteinSequence.replace(/[*\s]/g, '').toUpperCase();
    let totalWeight = 18.015; // water
    
    for (let aa of cleanProtein) {
        if (aminoAcidWeights[aa]) {
            totalWeight += aminoAcidWeights[aa];
        }
    }
    
    // subtract water for each peptide bond
    totalWeight -= (cleanProtein.length - 1) * 18.015;
    
    return totalWeight;
}

function calculateGCContent(dnaSequence) {
    const cleanDNA = dnaSequence.replace(/\s/g, '').toUpperCase();
    const gcCount = (cleanDNA.match(/[GC]/g) || []).length;
    return (gcCount / cleanDNA.length * 100);
}

function reverseComplement(dnaSequence) {
    const complement = {
        'A': 'T', 'T': 'A', 'C': 'G', 'G': 'C'
    };
    
    return dnaSequence
        .replace(/\s/g, '')
        .toUpperCase()
        .split('')
        .reverse()
        .map(base => complement[base] || base)
        .join('');
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        console.log('Copied to clipboard');
    });
}

function calculateSequence() {
    const activeCalc = document.querySelector('.calc-option[data-card="sequence"].active');
    const activeType = activeCalc.dataset.type;
    
    try {
        if (activeType === 'dna-to-protein') {
            calculateDNAToProtein();
        } else if (activeType === 'protein-to-dna') {
            calculateProteinToDNA();
        }
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

function calculateDNAToProtein() {
    const dnaInput = document.getElementById('dna-sequence').value.trim();
    const frame = parseInt(document.getElementById('reading-frame').value);
    
    if (!dnaInput) {
        alert('Please enter a DNA sequence.');
        return;
    }
    
    const proteinSequence = translateDNA(dnaInput, frame);
    const cleanDNA = dnaInput.replace(/\s/g, '').toUpperCase();
    const cleanProtein = proteinSequence.replace(/\*/g, '');
    
    const molecularWeight = calculateMolecularWeight(cleanProtein);
    const gcContent = calculateGCContent(cleanDNA);
    const reverseComp = reverseComplement(cleanDNA);
    
    let output = `
        <div class="stats-grid">
            <div class="stat-item">
                <div class="stat-value">${cleanProtein.length}</div>
                <div class="stat-label">Amino Acids</div>
            </div>
            <div class="stat-item">
                <div class="stat-value">${molecularWeight.toFixed(2)}</div>
                <div class="stat-label">MW (Da)</div>
            </div>
            <div class="stat-item">
                <div class="stat-value">${gcContent.toFixed(1)}%</div>
                <div class="stat-label">GC Content</div>
            </div>
            <div class="stat-item">
                <div class="stat-value">${cleanDNA.length}</div>
                <div class="stat-label">DNA Length</div>
            </div>
        </div>
        
        <strong>Protein Sequence:</strong>
        <div class="sequence-output">${proteinSequence}</div>
        <button class="copy-btn" onclick="copyToClipboard('${cleanProtein}')">Copy Protein</button>
        
        <strong>Reverse Complement:</strong>
        <div class="sequence-output">${reverseComp}</div>
        <button class="copy-btn" onclick="copyToClipboard('${reverseComp}')">Copy Reverse Complement</button>
    `;
    
    displaySequenceResult(output);
}

function calculateProteinToDNA() {
    const proteinInput = document.getElementById('protein-sequence').value.trim();
    
    if (!proteinInput) {
        alert('Please enter a protein sequence.');
        return;
    }
    
    const dnaSequence = backTranslate(proteinInput);
    const cleanProtein = proteinInput.replace(/\s/g, '').toUpperCase();
    const molecularWeight = calculateMolecularWeight(cleanProtein);
    const gcContent = calculateGCContent(dnaSequence);
    const reverseComp = reverseComplement(dnaSequence);
    
    let output = `
        <div class="stats-grid">
            <div class="stat-item">
                <div class="stat-value">${cleanProtein.length}</div>
                <div class="stat-label">Amino Acids</div>
            </div>
            <div class="stat-item">
                <div class="stat-value">${molecularWeight.toFixed(2)}</div>
                <div class="stat-label">MW (Da)</div>
            </div>
            <div class="stat-item">
                <div class="stat-value">${gcContent.toFixed(1)}%</div>
                <div class="stat-label">GC Content</div>
            </div>
            <div class="stat-item">
                <div class="stat-value">${dnaSequence.length}</div>
                <div class="stat-label">DNA Length</div>
            </div>
        </div>
        
        <strong>DNA Sequence:</strong>
        <div class="sequence-output">${dnaSequence}</div>
        <button class="copy-btn" onclick="copyToClipboard('${dnaSequence}')">Copy DNA</button>
        
        <strong>Reverse Complement:</strong>
        <div class="sequence-output">${reverseComp}</div>
        <button class="copy-btn" onclick="copyToClipboard('${reverseComp}')">Copy Reverse Complement</button>
    `;
    
    displaySequenceResult(output);
}

function displaySequenceResult(output) {
    document.getElementById('sequence-output').innerHTML = output;
    document.getElementById('sequence-result').classList.add('show');
}























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
    
    switch(activeType) {
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
        input.addEventListener('input', function() {
            document.getElementById('gibson-result').classList.remove('show');
        });
    });
}


document.addEventListener('DOMContentLoaded', function() {
    updateCompoundSelectors();
    updateSavedCompoundsList();
    setupCompoundSelectHandlers();
    setupGibsonInputHandlers();
    setupCalculatorTabs(); // <-- Add this
    setupSequenceCalculatorTabs(); // <-- Add this
});

// ...existing code...

function setupCalculatorTabs() {
    // For each calculator card, set up tab switching
    document.querySelectorAll('.calculator-card').forEach(card => {
        const options = card.querySelectorAll('.calc-option');
        options.forEach(option => {
            option.addEventListener('click', function() {
                // Remove active from all tabs in this card
                options.forEach(opt => opt.classList.remove('active'));
                this.classList.add('active');

                // Hide all calculators in this card
                card.querySelectorAll('[id$="-calc"]').forEach(calc => calc.style.display = 'none');
                // Show the selected calculator
                const type = this.dataset.type;
                const targetCalc = card.querySelector(`#${type}-calc`);
                if (targetCalc) targetCalc.style.display = 'block';

                // Hide result in this card
                const result = card.querySelector('.result');
                if (result) result.classList.remove('show');
            });
        });
    });
}

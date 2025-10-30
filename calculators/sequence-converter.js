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
        option.addEventListener('click', function () {
            // remove active class
            document.querySelectorAll('.calc-option[data-card="sequence"]').forEach(opt => opt.classList.remove('active'));

            // add active class to clicked
            this.classList.add('active');


            const type = this.dataset.type;

            // hide sections
            document.getElementById('dna-to-protein-calc').style.display = 'none';
            document.getElementById('protein-to-dna-calc').style.display = 'none';

            // show selected section
            if (type === 'dna-to-protein') {
                document.getElementById('dna-to-protein-calc').style.display = 'block';
            } else if (type === 'protein-to-dna') {
                document.getElementById('protein-to-dna-calc').style.display = 'block';
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

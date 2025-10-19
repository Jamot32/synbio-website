// enzymes

let enzymeDatabase = null;
let currentResults = [];
document.addEventListener('DOMContentLoaded', function() {
    enzymeDatabase = initializeEnzymeDatabase();
});

/**
 * initialize / load data
 * @returns {Object} 
 */
function initializeEnzymeDatabase() {
    const enzymeData = [
        // common 6-cutters
        { name: "EcoRI", site: "GAATTC", cut_pos: 1, overhang: "5prime", recognition_length: 6, common: true },
        { name: "BamHI", site: "GGATCC", cut_pos: 1, overhang: "5prime", recognition_length: 6, common: true },
        { name: "HindIII", site: "AAGCTT", cut_pos: 1, overhang: "5prime", recognition_length: 6, common: true },
        { name: "XhoI", site: "CTCGAG", cut_pos: 1, overhang: "5prime", recognition_length: 6, common: true },
        { name: "SalI", site: "GTCGAC", cut_pos: 1, overhang: "5prime", recognition_length: 6, common: true },
        { name: "XbaI", site: "TCTAGA", cut_pos: 1, overhang: "5prime", recognition_length: 6, common: true },
        { name: "SpeI", site: "ACTAGT", cut_pos: 1, overhang: "5prime", recognition_length: 6, common: true },
        { name: "KpnI", site: "GGTACC", cut_pos: 1, overhang: "5prime", recognition_length: 6, common: true },
        { name: "SacI", site: "GAGCTC", cut_pos: 1, overhang: "5prime", recognition_length: 6, common: true },
        { name: "PstI", site: "CTGCAG", cut_pos: 5, overhang: "3prime", recognition_length: 6, common: true },
        { name: "BglII", site: "AGATCT", cut_pos: 1, overhang: "5prime", recognition_length: 6, common: true },
        { name: "NdeI", site: "CATATG", cut_pos: 2, overhang: "5prime", recognition_length: 6, common: true },
        { name: "NcoI", site: "CCATGG", cut_pos: 1, overhang: "5prime", recognition_length: 6, common: true },
        { name: "NheI", site: "GCTAGC", cut_pos: 1, overhang: "5prime", recognition_length: 6, common: true },
        { name: "ClaI", site: "ATCGAT", cut_pos: 2, overhang: "5prime", recognition_length: 6, common: true },
        { name: "SphI", site: "GCATGC", cut_pos: 1, overhang: "5prime", recognition_length: 6, common: true },
        { name: "ApaI", site: "GGGCCC", cut_pos: 1, overhang: "5prime", recognition_length: 6, common: true },
        { name: "XmaI", site: "CCCGGG", cut_pos: 1, overhang: "5prime", recognition_length: 6, common: true },
        
        // blunt cutters
        { name: "EcoRV", site: "GATATC", cut_pos: 3, overhang: "blunt", recognition_length: 6, common: true },
        { name: "SmaI", site: "CCCGGG", cut_pos: 3, overhang: "blunt", recognition_length: 6, common: true },
        { name: "AluI", site: "AGCT", cut_pos: 2, overhang: "blunt", recognition_length: 4, common: true },
        { name: "RsaI", site: "GTAC", cut_pos: 2, overhang: "blunt", recognition_length: 4, common: true },
        { name: "HaeIII", site: "GGCC", cut_pos: 2, overhang: "blunt", recognition_length: 4, common: true },
        { name: "HpaI", site: "GTTAAC", cut_pos: 3, overhang: "blunt", recognition_length: 6, common: false },
        { name: "StuI", site: "AGGCCT", cut_pos: 3, overhang: "blunt", recognition_length: 6, common: false },
        
        // 4-cutters (frequent cutters)
        { name: "MspI", site: "CCGG", cut_pos: 1, overhang: "5prime", recognition_length: 4, common: true },
        { name: "HpaII", site: "CCGG", cut_pos: 1, overhang: "5prime", recognition_length: 4, common: true, notes: "Blocked by CpG methylation" },
        { name: "TaqI", site: "TCGA", cut_pos: 1, overhang: "5prime", recognition_length: 4, common: true },
        { name: "MboI", site: "GATC", cut_pos: 0, overhang: "5prime", recognition_length: 4, common: true },
        { name: "Sau3AI", site: "GATC", cut_pos: 0, overhang: "5prime", recognition_length: 4, common: true },
        { name: "DpnI", site: "GATC", cut_pos: 0, overhang: "5prime", recognition_length: 4, common: true, notes: "Requires Dam methylation" },
        
        // 8-cutters (rare cutters)
        { name: "NotI", site: "GCGGCCGC", cut_pos: 2, overhang: "5prime", recognition_length: 8, common: true },
        { name: "PacI", site: "TTAATTAA", cut_pos: 2, overhang: "5prime", recognition_length: 8, common: false },
        { name: "AsiSI", site: "GCGATCGC", cut_pos: 2, overhang: "5prime", recognition_length: 8, common: false },
        { name: "SfiI", site: "GGCCNNNNNGGCC", cut_pos: 8, overhang: "5prime", recognition_length: 13, common: false, notes: "N = any base" },
        { name: "SgrAI", site: "CRCCGGYG", cut_pos: 2, overhang: "5prime", recognition_length: 8, common: false, notes: "R = A or G, Y = C or T" },
        
        // other
        { name: "HinfI", site: "GANTC", cut_pos: 1, overhang: "5prime", recognition_length: 5, common: true, notes: "N = any base" },
        { name: "BstEII", site: "GGTNACC", cut_pos: 1, overhang: "5prime", recognition_length: 7, common: false, notes: "N = any base" }
    ];
    
    // lookup map
    const enzymeMap = new Map();
    enzymeData.forEach(enzyme => enzymeMap.set(enzyme.name, enzyme));
    
    return {
        enzymes: enzymeData,
        enzymeMap: enzymeMap,
        getCommonEnzymes: () => enzymeData.filter(e => e.common),
        getEnzymesByLength: (length) => enzymeData.filter(e => e.recognition_length === length),
        getEnzymesByOverhang: (overhang) => enzymeData.filter(e => e.overhang === overhang)
    };
}


function findRestrictionSites() {
    const sequence = document.getElementById('dna-sequence-enzyme').value.trim().toUpperCase();
    
    if (!sequence) {
        showErrorMessage('Please enter a DNA sequence');
        return;
    }
    if (!validateDNASequence(sequence)) {
        showErrorMessage('Invalid DNA sequence. Use only A, T, G, C, N characters.');
        return;
    }
    
    if (sequence.length < 4) {
        showErrorMessage('Sequence must be at least 4 base pairs long');
        return;
    }
    
    // filter settings
    const filters = {
        cutFrequency: document.getElementById('cut-frequency').value,
        siteLength: document.getElementById('site-length').value,
        overhangType: document.getElementById('overhang-type').value,
        commonOnly: document.getElementById('common-only').value === 'true'
    };
    
    if (!enzymeDatabase) {
        enzymeDatabase = initializeEnzymeDatabase();
    }
    
    const allResults = searchAllEnzymes(sequence, enzymeDatabase.enzymes, filters);
    const sortedResults = sortEnzymeResults(allResults, 'name');
    
    updateSequenceDisplay(sequence, sortedResults);
    updateResultsTable(sortedResults);
    showAnalysisSummary(sequence, sortedResults);
    
    // show results
    document.getElementById('enzyme-result').classList.add('show');
}

/**
 * search all enzymes
 * @param {string} sequence - DNA sequence
 * @param {Array} enzymes - array of enzymes
 * @param {Object} filters - filter criteria
 * @returns {Array} - position objects
 */
function searchAllEnzymes(sequence, enzymes, filters) {
    const results = [];
    
   // search each enzyme
    enzymes.forEach(enzyme => {
        const positions = searchSequenceForSite(sequence, enzyme);
        
        const result = {
            enzyme: enzyme,
            positions: positions,
            cutCount: positions.length,
            fragmentSizes: positions.length > 0 ? calculateFragmentSizes(sequence.length, positions.map(p => p.position)) : []
        };
        
        results.push(result);
    });
    
    // apply filters if any
    return filters ? applyFilters(results, filters) : results;
}

/**
 * search for specific enzyme recognition sites
 * @param {string} sequence - DNA sequence
 * @param {Object} enzymeData - eenzyme object
 * @returns {Array} - position objects
 */
function searchSequenceForSite(sequence, enzymeData) {
    const positions = [];
    const site = enzymeData.site.toUpperCase();
    const seqUpper = sequence.toUpperCase();
    
    // ambiguous to regex
    const regexPattern = expandAmbiguousSequence(site);
    
    // forward
    const forwardMatches = findPatternMatches(seqUpper, regexPattern, 'forward');
    positions.push(...forwardMatches);
    
    // reverse comp
    const reverseSeq = reverseComplement(seqUpper);
    const reverseMatches = findPatternMatches(reverseSeq, regexPattern, 'reverse');
    
    // reverse back to original
    reverseMatches.forEach(match => {
        const originalPos = sequence.length - match.position - site.length + 1;
        positions.push({
            position: originalPos,
            strand: 'reverse',
            sequence: match.sequence
        });
    });
    
    // remove duplicates (same position on both strands) + sort
    const uniquePositions = removeDuplicatePositions(positions);
    return uniquePositions.sort((a, b) => a.position - b.position);
}

/**
 * find pattern matches using regex
 * @param {string} sequence - sequence to search
 * @param {string} pattern - regex pattern
 * @param {string} strand - for or rev
 * @returns {Array} 
 */
function findPatternMatches(sequence, pattern, strand) {
    const matches = [];
    const regex = new RegExp(pattern, 'gi');
    let match;
    
    while ((match = regex.exec(sequence)) !== null) {
        matches.push({
            position: match.index + 1, 
            strand: strand,
            sequence: match[0]
        });
        
        // reset regex for overlap
        regex.lastIndex = match.index + 1;
    }
    
    return matches;
}

/**
 * remove duplicate positions 
 * @param {Array} positions - array of position objects
 * @returns {Array} - deduplicated positions
 */
function removeDuplicatePositions(positions) {
    const seen = new Set();
    return positions.filter(pos => {
        const key = pos.position;
        if (seen.has(key)) {
            return false;
        }
        seen.add(key);
        return true;
    });
}

/**
 * apply user-selected filters
 * @param {Array} results - complete results array
 * @param {Object} filters - filter settings
 * @returns {Array} - filter results
 */
function applyFilters(results, filters) {
    return results.filter(result => {
        const enzyme = result.enzyme;
        const cutCount = result.cutCount;
        
        // cut ferquency
        if (filters.cutFrequency && filters.cutFrequency !== 'all') {
            switch (filters.cutFrequency) {
                case 'single':
                    if (cutCount !== 1) return false;
                    break;
                case 'multiple':
                    if (cutCount <= 1) return false;
                    break;
                case 'none':
                    if (cutCount !== 0) return false;
                    break;
            }
        }
        
        // recognition site length
        if (filters.siteLength && filters.siteLength !== 'all') {
            const targetLength = parseInt(filters.siteLength);
            if (enzyme.recognition_length !== targetLength) return false;
        }
        
        // overhang type
        if (filters.overhangType && filters.overhangType !== 'all') {
            if (enzyme.overhang !== filters.overhangType) return false;
        }
        
        // common enzymes
        if (filters.commonOnly === true && !enzyme.common) {
            return false;
        }
        
        return true;
    });
}

/**
 * highlighted cut sites in sequence display
 * @param {string} sequence - original sequence
 * @param {Array} cutSites - array of cut site objects with positions and enzyme info
 * @returns {string} - html string with highlights
 */
function generateSequenceDisplay(sequence, cutSites) {
    if (!cutSites || cutSites.length === 0) {
        return formatSequenceWithLineBreaks(sequence);
    }
    
    // array of all cut positions + enzyme info
    const cutPositions = [];
    cutSites.forEach(result => {
        if (result.cutCount > 0) {
            result.positions.forEach(pos => {
                cutPositions.push({
                    start: pos.position - 1, // 0-based
                    end: pos.position - 1 + result.enzyme.recognition_length,
                    enzyme: result.enzyme,
                    strand: pos.strand,
                    sequence: pos.sequence
                });
            });
        }
    });
    
    // start position
    cutPositions.sort((a, b) => a.start - b.start);
    
    // html
    let html = '';
    let lastIndex = 0;
    
    cutPositions.forEach(cut => {
        // unhighlighted sequence before this cut
        html += sequence.slice(lastIndex, cut.start);
        
        // highlighted cut site w/ tooltip
        const cutSequence = sequence.slice(cut.start, cut.end);
        const tooltip = `${cut.enzyme.name} (${cut.strand} strand) - ${getOverhangDisplayText(cut.enzyme.overhang)}`;
        
        html += `<span class="cut-site" data-tooltip="${tooltip}" title="${tooltip}">${cutSequence}</span>`;
        
        lastIndex = cut.end;
    });
    
    // add remaining sequence
    html += sequence.slice(lastIndex);
    
    return formatSequenceWithLineBreaks(html, true);
}

/**
 * format sequence with line breaks
 * @param {string} sequence - sequence
 * @param {boolean} hasHTML - whether sequence contains html tags
 * @returns {string} - formatted sequence
 */
function formatSequenceWithLineBreaks(sequence, hasHTML = false) {
    const lineLength = 60;
    let result = '';
    let charCount = 0;
    let i = 0;
    
    if (hasHTML) {
        // Handle HTML tags without breaking them
        while (i < sequence.length) {
            if (sequence[i] === '<') {
                // Find end of tag
                const tagEnd = sequence.indexOf('>', i);
                result += sequence.slice(i, tagEnd + 1);
                i = tagEnd + 1;
            } else {
                result += sequence[i];
                charCount++;
                i++;
                
                // Add line break every lineLength actual characters
                if (charCount % lineLength === 0) {
                    result += '\n';
                }
            }
        }
    } else {
        // Simple line breaking for plain text
        for (i = 0; i < sequence.length; i += lineLength) {
            result += sequence.slice(i, i + lineLength);
            if (i + lineLength < sequence.length) {
                result += '\n';
            }
        }
    }
    
    return result;
}

/**
 * create HTML table rows for enzyme results
 * @param {Array} enzymeResults - filtered enzyme results
 * @returns {string} html table rows
 */
function createResultsTable(enzymeResults) {
    if (!enzymeResults || enzymeResults.length === 0) {
        return '<tr><td colspan="5" style="text-align: center; color: #6c757d; font-style: italic;">No restriction sites found</td></tr>';
    }
    
    // filter for cutting enzymes
    const cuttingResults = enzymeResults.filter(result => result.cutCount > 0);
    
    if (cuttingResults.length === 0) {
        return '<tr><td colspan="5" style="text-align: center; color: #6c757d; font-style: italic;">No cutting enzymes found with current filters</td></tr>';
    }
    
    let html = '';
    cuttingResults.forEach(result => {
        const enzyme = result.enzyme;
        const positions = result.positions.map(p => p.position).join(', ');
        const overhangText = getOverhangDisplayText(enzyme.overhang);
        
        html += `
            <tr>
                <td>
                    <strong>${enzyme.name}</strong>
                    ${enzyme.notes ? `<br><small style="color: #6c757d; font-style: italic;">${enzyme.notes}</small>` : ''}
                </td>
                <td>
                    <span class="recognition-site">${enzyme.site}</span>
                    <br><small style="color: #6c757d;">${enzyme.recognition_length} bp</small>
                </td>
                <td><span class="cut-count">${result.cutCount}</span></td>
                <td style="font-family: 'Courier New', monospace; font-size: 12px; max-width: 200px; word-wrap: break-word;">
                    ${positions}
                </td>
                <td>${overhangText}</td>
            </tr>
        `;
    });
    
    return html;
}

/**
 * calculate fragment sizes after digestion
 * @param {number} sequenceLength - total length
 * @param {Array} cutPositions - array of cut positions (1-based)
 * @returns {Array} - array of fragment sizes sorted largest to smallest
 */
function calculateFragmentSizes(sequenceLength, cutPositions) {
    if (!cutPositions || cutPositions.length === 0) {
        return [sequenceLength];
    }
    
    // sort positions
    const sortedPositions = [...cutPositions].sort((a, b) => a - b);
    const fragments = [];
    
    // first fragment: from start to first cut
    fragments.push(sortedPositions[0] - 1);
    
    // middle fragments: between cons. cuts
    for (let i = 1; i < sortedPositions.length; i++) {
        fragments.push(sortedPositions[i] - sortedPositions[i-1]);
    }
    
    // last fragment: from last cut to end
    fragments.push(sequenceLength - sortedPositions[sortedPositions.length - 1] + 1);
    
    // filter out zero-length fragments, sort by size
    return fragments.filter(size => size > 0).sort((a, b) => b - a);
}

/**
 * sort enzyme results
 * @param {Array} results - results array to sort
 * @param {string} sortBy - sort criterion
 * @returns {Array} - sorted results array
 */
function sortEnzymeResults(results, sortBy) {
    const sortedResults = [...results];
    
    switch (sortBy) {
        case 'name':
            return sortedResults.sort((a, b) => a.enzyme.name.localeCompare(b.enzyme.name));
            
        case 'cutCount':
            return sortedResults.sort((a, b) => b.cutCount - a.cutCount);
            
        case 'siteLength':
            return sortedResults.sort((a, b) => a.enzyme.recognition_length - b.enzyme.recognition_length);
            
        case 'position':
            return sortedResults.sort((a, b) => {
                const aFirstPos = a.positions.length > 0 ? a.positions[0].position : Infinity;
                const bFirstPos = b.positions.length > 0 ? b.positions[0].position : Infinity;
                return aFirstPos - bFirstPos;
            });
            
        default:
            return sortedResults;
    }
}

// update highlighted sequence display
function updateSequenceDisplay(sequence, results) {
    const displayElement = document.getElementById('marked-sequence');
    const htmlSequence = generateSequenceDisplay(sequence, results);
    displayElement.innerHTML = htmlSequence;
}

// update results table
function updateResultsTable(results) {
    const tbody = document.getElementById('enzyme-results');
    tbody.innerHTML = createResultsTable(results);
}

// show analysis summary
function showAnalysisSummary(sequence, results) {
    const cuttingEnzymes = results.filter(r => r.cutCount > 0);
    const totalCuts = cuttingEnzymes.reduce((sum, r) => sum + r.cutCount, 0);
    const avgCutFreq = sequence.length > 0 ? (totalCuts / sequence.length * 1000).toFixed(1) : 0;
    
    const summaryHtml = `
        <div style="background: #e8f4f8; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
            <h4 style="margin-bottom: 10px; color: #2c3e50;">Analysis Summary</h4>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 10px;">
                <div>
                    <div style="font-size: 1.2em; font-weight: 600; color: #2c3e50;">${sequence.length}</div>
                    <div style="font-size: 0.9em; color: #6c757d;">Base pairs</div>
                </div>
                <div>
                    <div style="font-size: 1.2em; font-weight: 600; color: #2c3e50;">${cuttingEnzymes.length}</div>
                    <div style="font-size: 0.9em; color: #6c757d;">Cutting enzymes</div>
                </div>
                <div>
                    <div style="font-size: 1.2em; font-weight: 600; color: #2c3e50;">${totalCuts}</div>
                    <div style="font-size: 0.9em; color: #6c757d;">Total cuts</div>
                </div>
                <div>
                    <div style="font-size: 1.2em; font-weight: 600; color: #2c3e50;">${avgCutFreq}</div>
                    <div style="font-size: 0.9em; color: #6c757d;">Cuts per kb</div>
                </div>
            </div>
        </div>
    `;
    
    const resultDiv = document.getElementById('enzyme-result');
    resultDiv.innerHTML = summaryHtml;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Validate DNA sequence contains only valid characters
 */
function validateDNASequence(sequence) {
    return /^[ATCGN]+$/i.test(sequence);
}

/**
 * Show error message to user
 */
function showErrorMessage(message) {
    alert(message);
}

/**
 * Get display text for overhang types
 */
function getOverhangDisplayText(overhangType) {
    const overhangMap = {
        '5prime': "5' overhang",
        '3prime': "3' overhang",
        'blunt': 'Blunt ends'
    };
    return overhangMap[overhangType] || overhangType;
}

/**
 * Expand ambiguous nucleotides to regex patterns
 */
function expandAmbiguousSequence(sequence) {
    const ambiguousMap = {
        'N': '[ATCG]',
        'R': '[AG]', 'Y': '[CT]',
        'S': '[GC]', 'W': '[AT]',
        'K': '[GT]', 'M': '[AC]',
        'B': '[CGT]', 'D': '[AGT]',
        'H': '[ACT]', 'V': '[ACG]'
    };
    
    let pattern = sequence.toUpperCase();
    for (const [ambiguous, replacement] of Object.entries(ambiguousMap)) {
        pattern = pattern.replace(new RegExp(ambiguous, 'g'), replacement);
    }
    
    return pattern;
}

/**
 * Generate reverse complement of DNA sequence
 */
function reverseComplement(sequence) {
    const complementMap = {
        'A': 'T', 'T': 'A', 'G': 'C', 'C': 'G',
        'N': 'N', 'R': 'Y', 'Y': 'R', 'S': 'S',
        'W': 'W', 'K': 'M', 'M': 'K',
        'B': 'V', 'D': 'H', 'H': 'D', 'V': 'B'
    };
    
    return sequence.toUpperCase()
        .split('')
        .reverse()
        .map(base => complementMap[base] || base)
        .join('');
}
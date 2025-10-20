// pcr calculator





function calculateMeltingTemp(sequence) {
    const cleanSeq = sequence.replace(/\s/g, '').toUpperCase();
    const length = cleanSeq.length;
    
    if (length < 14) {
        // short sequences: Tm = 4(G+C) + 2(A+T)
        const gcCount = (cleanSeq.match(/[GC]/g) || []).length;
        const atCount = (cleanSeq.match(/[AT]/g) || []).length;
        return 4 * gcCount + 2 * atCount;
    } else {
        // long sequences: Tm = 64.9 + 41 × (G+C-16.4) / length
        const gcCount = (cleanSeq.match(/[GC]/g) || []).length;
        return 64.9 + 41 * (gcCount - 16.4) / length;
    }
}

function calculateGCContent(sequence) {
    const cleanSeq = sequence.replace(/\s/g, '').toUpperCase();
    const gcCount = (cleanSeq.match(/[GC]/g) || []).length;
    return (gcCount / cleanSeq.length) * 100;
}

function reverseComplement(sequence) {
    const complement = {
        'A': 'T', 'T': 'A', 'C': 'G', 'G': 'C', 'N': 'N'
    };
    
    return sequence
        .replace(/\s/g, '')
        .toUpperCase()
        .split('')
        .reverse()
        .map(base => complement[base] || base)
        .join('');
}

function validateDNASequence(sequence) {
    const cleanSeq = sequence.replace(/\s/g, '').toUpperCase();
    return /^[ATCGN]*$/.test(cleanSeq);
}

function findOptimalPrimers(targetSequence, settings) {
    const cleanSeq = targetSequence.replace(/\s/g, '').toUpperCase();
    
    const lengthRange = settings.primerLength.split('-').map(Number);
    const minLength = lengthRange[0];
    const maxLength = lengthRange[1];
    const targetTm = settings.targetTm;
    const gcRange = settings.gcContent.split('-').map(Number);
    const minGC = gcRange[0];
    const maxGC = gcRange[1];
    
    // if tm is blank just ignore
    const useTmConstraint = targetTm && targetTm > 0;
    const tmTolerance = 5; // +/- 5 degrees celsius tolerance
    
    let bestForward = null;
    let bestReverse = null;
    let minTmDiff = Infinity;
    
    // 5' forward
    for (let len = minLength; len <= maxLength; len++) {
        const candidate = cleanSeq.substring(0, len);
        const tm = calculateMeltingTemp(candidate);
        const gc = calculateGCContent(candidate);
        
        if (gc >= minGC && gc <= maxGC) {
            const tmValid = !useTmConstraint || Math.abs(tm - targetTm) <= tmTolerance;
            
            if (tmValid) {
                if (!bestForward) {
                    bestForward = {
                        sequence: candidate,
                        tm: tm,
                        gc: gc,
                        length: len
                    };
                } else if (useTmConstraint) {
                    if (Math.abs(tm - targetTm) < Math.abs(bestForward.tm - targetTm)) {
                        bestForward = {
                            sequence: candidate,
                            tm: tm,
                            gc: gc,
                            length: len
                        };
                    }
                } else {
                    // if no tm prefer middle of length
                    const targetLength = (minLength + maxLength) / 2;
                    if (Math.abs(len - targetLength) < Math.abs(bestForward.length - targetLength)) {
                        bestForward = {
                            sequence: candidate,
                            tm: tm,
                            gc: gc,
                            length: len
                        };
                    }
                }
            }
        }
    }
    
    // 3' rev
    for (let len = minLength; len <= maxLength; len++) {
        const candidate = cleanSeq.substring(cleanSeq.length - len);
        const revComp = reverseComplement(candidate);
        const tm = calculateMeltingTemp(revComp);
        const gc = calculateGCContent(revComp);
        
        if (gc >= minGC && gc <= maxGC) {
            const tmValid = !useTmConstraint || Math.abs(tm - targetTm) <= tmTolerance;
            
            if (tmValid) {
                if (bestForward) {
                    const tmDiff = Math.abs(tm - bestForward.tm);
                    
                    if (!bestReverse) {
                        minTmDiff = tmDiff;
                        bestReverse = {
                            sequence: revComp,
                            originalRegion: candidate,
                            tm: tm,
                            gc: gc,
                            length: len
                        };
                    } else if (useTmConstraint) {
    // whether tm is there or not there minimize diff w/ forward primer
                        if (tmDiff < minTmDiff) {
                            minTmDiff = tmDiff;
                            bestReverse = {
                                sequence: revComp,
                                originalRegion: candidate,
                                tm: tm,
                                gc: gc,
                                length: len
                            };
                        }
                    } else {
                        if (tmDiff < minTmDiff) {
                            minTmDiff = tmDiff;
                            bestReverse = {
                                sequence: revComp,
                                originalRegion: candidate,
                                tm: tm,
                                gc: gc,
                                length: len
                            };
                        }
                    }
                } else {
                    bestReverse = {
                        sequence: revComp,
                        originalRegion: candidate,
                        tm: tm,
                        gc: gc,
                        length: len
                    };
                }
            }
        }
    }
    
    return {
        forward: bestForward,
        reverse: bestReverse
    };
}

function highlightPrimerRegions(sequence, forwardPrimer, reversePrimer) {
    const cleanSeq = sequence.replace(/\s/g, '').toUpperCase();
    let highlighted = '';
    
    const forwardLen = forwardPrimer.length;
    const reverseLen = reversePrimer.originalRegion.length;
    const reverseStart = cleanSeq.length - reverseLen;
    
    highlighted += `<span style="background-color: #FFD700; padding: 2px 4px; border-radius: 3px; font-weight: 600;">${cleanSeq.substring(0, forwardLen)}</span>`;
    
    highlighted += cleanSeq.substring(forwardLen, reverseStart);
    
    highlighted += `<span style="background-color: #87CEEB; padding: 2px 4px; border-radius: 3px; font-weight: 600;">${cleanSeq.substring(reverseStart)}</span>`;
    
    return highlighted;
}







// claculate pcr conditions
function calculatePCRConditions(forwardTm, reverseTm, productLength) {
    const lowerTm = Math.min(forwardTm, reverseTm);
    
    // annealing temp: (lower Tm - 5°C) ~ (lower Tm - 2°C)
    const annealingTempMin = lowerTm - 5;
    const annealingTempMax = lowerTm - 2;
    const annealingTemp = Math.round((annealingTempMin + annealingTempMax) / 2);
    
    // extension: 1 min per kb
    const extensionTime = Math.ceil(productLength / 1000) * 60; // seconds

    const cycleCount = 30;
    
    return {
        annealingTemp: annealingTemp,
        annealingTempRange: `${annealingTempMin.toFixed(1)}°C - ${annealingTempMax.toFixed(1)}°C`,
        extensionTime: extensionTime,
        cycleCount: cycleCount
    };
}


function designPrimers() {
    const targetSequence = document.getElementById('target-sequence').value.trim();
    
    if (!targetSequence) {
        alert('Please enter a target DNA sequence.');
        return;
    }
    
    if (!validateDNASequence(targetSequence)) {
        alert('Invalid DNA sequence. Only A, T, C, G, N characters are allowed.');
        return;
    }
    
    const cleanSeq = targetSequence.replace(/\s/g, '').toUpperCase();
    
    if (cleanSeq.length < 50) {
        alert('Sequence is too short. Please enter a sequence of at least 50 bp.');
        return;
    }
    
    const settings = {
        primerLength: document.getElementById('primer-length').value,
        targetTm: document.getElementById('target-tm').value ? parseInt(document.getElementById('target-tm').value) : null,
        gcContent: document.getElementById('gc-content').value
    };
    
    const primers = findOptimalPrimers(cleanSeq, settings);
    
    if (!primers.forward || !primers.reverse) {
        alert('Could not find suitable primers with the given parameters. Try adjusting the settings.');
        return;
    }
    
    document.getElementById('forward-primer').innerHTML = primers.forward.sequence;
    document.getElementById('forward-tm').textContent = primers.forward.tm.toFixed(1) + '°C';
    document.getElementById('forward-gc').textContent = primers.forward.gc.toFixed(1) + '%';
    
    document.getElementById('reverse-primer').innerHTML = primers.reverse.sequence;
    document.getElementById('reverse-tm').textContent = primers.reverse.tm.toFixed(1) + '°C';
    document.getElementById('reverse-gc').textContent = primers.reverse.gc.toFixed(1) + '%';

    const productLength = cleanSeq.length;
    const conditions = calculatePCRConditions(primers.forward.tm, primers.reverse.tm, productLength);
    
    document.getElementById('annealing-temp').textContent = conditions.annealingTempRange;
    document.getElementById('extension-time').textContent = conditions.extensionTime + ' sec';
    document.getElementById('cycle-count').textContent = conditions.cycleCount + ' cycles';

    const highlighted = highlightPrimerRegions(cleanSeq, primers.forward, primers.reverse);
    
    let output = `
        <h4 style="margin-bottom: 15px; color: #5B6B9E;">Target Sequence with Primer Regions</h4>
        <div class="sequence-output" style="line-height: 1.8; word-break: break-all;">
            ${highlighted}
        </div>
        <div class="info-box" style="margin-top: 15px;">
            <strong>Legend:</strong> 
            <span style="background-color: #FFD700; padding: 2px 6px; border-radius: 3px;">Forward Primer</span>
            <span style="background-color: #87CEEB; padding: 2px 6px; border-radius: 3px; margin-left: 10px;">Reverse Primer Region</span>
        </div>
        
        <div style="margin-top: 20px; padding: 15px; background: #F0F3FA; border-radius: 8px; border-left: 4px solid #5B6B9E;">
            <h5 style="color: #5B6B9E; margin-bottom: 10px;">Primer Details</h5>
            <p style="margin: 5px 0;"><strong>Product Length:</strong> ${productLength} bp</p>
            <p style="margin: 5px 0;"><strong>Tm Difference:</strong> ${Math.abs(primers.forward.tm - primers.reverse.tm).toFixed(1)}°C</p>
            ${settings.targetTm ? `<p style="margin: 5px 0;"><strong>Target Tm:</strong> ${settings.targetTm}°C ±5°C</p>` : '<p style="margin: 5px 0;"><strong>Tm Constraint:</strong> None (primers selected based on length and GC content)</p>'}
            <p style="margin: 5px 0; font-size: 13px; color: #6c757d;">
                <em>Note: Primers are designed for optimal amplification. The forward primer binds to the 5' end (yellow highlight) 
                and the reverse primer binds to the 3' end (blue highlight) of the template strand.</em>
            </p>
        </div>
    `;
    
    document.getElementById('pcr-result').innerHTML = output;
    document.getElementById('pcr-result').classList.add('show');
}

function copyPrimer(primerType) {
    let sequence = '';
    if (primerType === 'forward') {
        sequence = document.getElementById('forward-primer').textContent;
    } else {
        sequence = document.getElementById('reverse-primer').textContent;
    }
    
    navigator.clipboard.writeText(sequence).then(() => {
        alert('Primer sequence copied to clipboard!');
    });
}













// primer quality check

// hairpin check
function checkSelfComplementarity(sequence) {
    const cleanSeq = sequence.replace(/\s/g, '').toUpperCase();
    const complement = {
        'A': 'T', 'T': 'A', 'C': 'G', 'G': 'C'
    };
    
    let maxScore = 0;
    let maxPosition = 0;
    
    // comple region check
    for (let i = 0; i < cleanSeq.length - 3; i++) {
        for (let j = i + 4; j < cleanSeq.length; j++) {
            let score = 0;
            let k = 0;
            
            // consecutive comple bases
            while (i + k < j && j + k < cleanSeq.length) {
                if (cleanSeq[i + k] === complement[cleanSeq[j + k]]) {
                    score++;
                    k++;
                } else {
                    break;
                }
            }
            
            if (score > maxScore) {
                maxScore = score;
                maxPosition = i;
            }
        }
    }
    
    return {
        score: maxScore,
        position: maxPosition,
        status: maxScore >= 4 ? 'warning' : (maxScore >= 6 ? 'error' : 'good')
    };
}

// primer-dimer check
function checkPrimerDimer(forwardSeq, reverseSeq) {
    const cleanForward = forwardSeq.replace(/\s/g, '').toUpperCase();
    const cleanReverse = reverseSeq.replace(/\s/g, '').toUpperCase();
    const complement = {
        'A': 'T', 'T': 'A', 'C': 'G', 'G': 'C'
    };
    
    let maxScore = 0;
    let maxPosition = { forward: 0, reverse: 0 };
    
    for (let offset = -cleanReverse.length; offset < cleanForward.length; offset++) {
        let score = 0;
        let consecutiveMatches = 0;
        let maxConsecutive = 0;
        
        for (let i = 0; i < cleanForward.length; i++) {
            let j = i - offset;
            
            if (j >= 0 && j < cleanReverse.length) {
                // check comple bases
                if (cleanForward[i] === complement[cleanReverse[j]]) {
                    score++;
                    consecutiveMatches++;
                    maxConsecutive = Math.max(maxConsecutive, consecutiveMatches);
                } else {
                    consecutiveMatches = 0;
                }
            }
        }
        
        // weigh consecutive matches
        const weightedScore = score + (maxConsecutive * 2);
        
        if (weightedScore > maxScore) {
            maxScore = weightedScore;
            maxPosition = { forward: offset, reverse: 0, consecutive: maxConsecutive };
        }
    }
    
    return {
        score: maxScore,
        consecutiveMatches: maxPosition.consecutive,
        status: maxPosition.consecutive >= 4 ? 'error' : (maxPosition.consecutive >= 3 ? 'warning' : 'good')
    };
}

// 3' stability
function check3PrimeEnd(sequence) {
    const cleanSeq = sequence.replace(/\s/g, '').toUpperCase();
    const last5 = cleanSeq.slice(-5);
    const gcCount = (last5.match(/[GC]/g) || []).length;
    const gcContent = (gcCount / 5) * 100;
    
    // runs of same base
    const hasRuns = /(.)\1{2,}/.test(last5);
    
    return {
        sequence: last5,
        gcContent: gcContent,
        hasRuns: hasRuns,
        status: (gcContent >= 40 && gcContent <= 60 && !hasRuns) ? 'good' : 'warning'
    };
}

function checkPrimerQuality() {
    const forwardSeq = document.getElementById('forward-primer-check').value.trim();
    const reverseSeq = document.getElementById('reverse-primer-check').value.trim();
    
    if (!forwardSeq || !reverseSeq) {
        alert('Please enter both forward and reverse primer sequences.');
        return;
    }
    
    if (!validateDNASequence(forwardSeq) || !validateDNASequence(reverseSeq)) {
        alert('Invalid DNA sequence. Only A, T, C, G, N characters are allowed.');
        return;
    }
    
    const forwardSelfComp = checkSelfComplementarity(forwardSeq);
    const reverseSelfComp = checkSelfComplementarity(reverseSeq);
    const primerDimer = checkPrimerDimer(forwardSeq, reverseSeq);
    const forward3Prime = check3PrimeEnd(forwardSeq);
    const reverse3Prime = check3PrimeEnd(reverseSeq);
    
    // tm and gc
    const forwardTm = calculateMeltingTemp(forwardSeq);
    const reverseTm = calculateMeltingTemp(reverseSeq);
    const forwardGC = calculateGCContent(forwardSeq);
    const reverseGC = calculateGCContent(reverseSeq);
    const tmDifference = Math.abs(forwardTm - reverseTm);

    let output = '<h4 style="color: #5B6B9E; margin-bottom: 15px;">Quality Analysis Results</h4>';

    let totalIssues = 0;
    if (forwardSelfComp.status === 'error' || reverseSelfComp.status === 'error') totalIssues += 2;
    if (forwardSelfComp.status === 'warning' || reverseSelfComp.status === 'warning') totalIssues += 1;
    if (primerDimer.status === 'error') totalIssues += 2;
    if (primerDimer.status === 'warning') totalIssues += 1;
    if (forward3Prime.status === 'warning' || reverse3Prime.status === 'warning') totalIssues += 1;
    if (tmDifference > 5) totalIssues += 1;
    
    const overallStatus = totalIssues === 0 ? 'Excellent' : (totalIssues <= 2 ? 'Good' : (totalIssues <= 4 ? 'Fair' : 'Poor'));
    const statusColor = totalIssues === 0 ? '#28a745' : (totalIssues <= 2 ? '#9BA8C9' : (totalIssues <= 4 ? '#FFC107' : '#DC3545'));
    
    output += `<div style="background: ${statusColor}20; padding: 15px; border-radius: 8px; border-left: 4px solid ${statusColor}; margin-bottom: 20px;">`;
    output += `<h5 style="color: ${statusColor}; margin: 0;">Overall Quality: ${overallStatus}</h5>`;
    output += `<p style="margin: 5px 0 0 0; font-size: 14px;">Issues detected: ${totalIssues}</p>`;
    output += `</div>`;
    
    // primer-dimer
    output += `<div style="background: white; padding: 15px; border-radius: 8px; margin-bottom: 15px; border: 2px solid ${primerDimer.status === 'good' ? '#9BA8C9' : (primerDimer.status === 'warning' ? '#FFC107' : '#DC3545')};">`;
    output += `<h5 style="color: #5B6B9E;">Primer-Dimer Formation</h5>`;
    output += `<p><strong>Status:</strong> ${primerDimer.status === 'good' ? 'Low risk' : (primerDimer.status === 'warning' ? 'Moderate risk' : 'High risk')}</p>`;
    output += `<p><strong>Complementary bases:</strong> ${primerDimer.score}</p>`;
    output += `<p><strong>Consecutive matches:</strong> ${primerDimer.consecutiveMatches}</p>`;
    if (primerDimer.status !== 'good') {
        output += `<p style="color: #DC3545; font-size: 13px;"><em>Primers may form dimers. Consider redesigning if PCR fails.</em></p>`;
    }
    output += `</div>`;
    
    // self-comple
    output += `<div style="background: white; padding: 15px; border-radius: 8px; margin-bottom: 15px; border: 2px solid #E8E8F0;">`;
    output += `<h5 style="color: #5B6B9E;">Self-Complementarity (Hairpins)</h5>`;
    output += `<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">`;
    output += `<div>`;
    output += `<p><strong>Forward Primer:</strong></p>`;
    output += `<p>Max complementary: ${forwardSelfComp.score} bases</p>`;
    output += `<p>Status: ${forwardSelfComp.status === 'good' ? 'Good' : (forwardSelfComp.status === 'warning' ? 'Caution' : 'Poor')}</p>`;
    output += `</div>`;
    output += `<div>`;
    output += `<p><strong>Reverse Primer:</strong></p>`;
    output += `<p>Max complementary: ${reverseSelfComp.score} bases</p>`;
    output += `<p>Status: ${reverseSelfComp.status === 'good' ? 'Good' : (reverseSelfComp.status === 'warning' ? 'Caution' : 'Poor')}</p>`;
    output += `</div>`;
    output += `</div>`;
    if (forwardSelfComp.status !== 'good' || reverseSelfComp.status !== 'good') {
        output += `<p style="color: #FFC107; font-size: 13px; margin-top: 10px;"><em>Primer may form secondary structures (hairpins).</em></p>`;
    }
    output += `</div>`;
    
    // 3'
    output += `<div style="background: white; padding: 15px; border-radius: 8px; margin-bottom: 15px; border: 2px solid #E8E8F0;">`;
    output += `<h5 style="color: #5B6B9E;">3' End Stability</h5>`;
    output += `<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">`;
    output += `<div>`;
    output += `<p><strong>Forward (last 5 bp):</strong> ${forward3Prime.sequence}</p>`;
    output += `<p>GC content: ${forward3Prime.gcContent.toFixed(0)}%</p>`;
    output += `<p>Status: ${forward3Prime.status === 'good' ? 'Good' : 'Check'}</p>`;
    output += `</div>`;
    output += `<div>`;
    output += `<p><strong>Reverse (last 5 bp):</strong> ${reverse3Prime.sequence}</p>`;
    output += `<p>GC content: ${reverse3Prime.gcContent.toFixed(0)}%</p>`;
    output += `<p>Status: ${reverse3Prime.status === 'good' ? 'Good' : 'Check'}</p>`;
    output += `</div>`;
    output += `</div>`;
    output += `</div>`;
    
    // tm
    output += `<div style="background: white; padding: 15px; border-radius: 8px; margin-bottom: 15px; border: 2px solid #E8E8F0;">`;
    output += `<h5 style="color: #5B6B9E;">Melting Temperature</h5>`;
    output += `<div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px;">`;
    output += `<div style="text-align: center;">`;
    output += `<p style="font-size: 24px; font-weight: 600; color: #5B6B9E; margin: 0;">${forwardTm.toFixed(1)}°C</p>`;
    output += `<p style="font-size: 13px; color: #6c757d;">Forward Tm</p>`;
    output += `</div>`;
    output += `<div style="text-align: center;">`;
    output += `<p style="font-size: 24px; font-weight: 600; color: #5B6B9E; margin: 0;">${reverseTm.toFixed(1)}°C</p>`;
    output += `<p style="font-size: 13px; color: #6c757d;">Reverse Tm</p>`;
    output += `</div>`;
    output += `<div style="text-align: center;">`;
    output += `<p style="font-size: 24px; font-weight: 600; color: ${tmDifference <= 5 ? '#28a745' : '#DC3545'}; margin: 0;">${tmDifference.toFixed(1)}°C</p>`;
    output += `<p style="font-size: 13px; color: #6c757d;">Difference</p>`;
    output += `</div>`;
    output += `</div>`;
    if (tmDifference > 5) {
        output += `<p style="color: #DC3545; font-size: 13px; margin-top: 10px;"><em>Tm difference > 5°C may reduce PCR efficiency.</em></p>`;
    }
    output += `</div>`;
    
    document.getElementById('primer-quality-results').innerHTML = output;
}















//mm calc

function calculateMasterMix() {
    const numReactions = parseInt(document.getElementById('num-reactions').value);
    const reactionVolume = parseFloat(document.getElementById('reaction-volume-master').value);
    const extraPercent = parseFloat(document.getElementById('extra-volume').value);
    const kitType = document.getElementById('pcr-kit-type').value;
    
    if (isNaN(numReactions) || numReactions < 1) {
        alert('Please enter a valid number of reactions.');
        return;
    }
    
    const totalReactions = numReactions * (1 + extraPercent / 100);
    const totalVolume = totalReactions * reactionVolume;
    
    let reagents = {};
    
    if (kitType === 'taq') {
        reagents = {
            'PCR Buffer (10X)': reactionVolume * 0.1,
            'dNTP Mix (10 mM)': reactionVolume * 0.02,
            'MgCl₂ (25 mM)': reactionVolume * 0.06,
            'Forward Primer (10 μM)': reactionVolume * 0.04,
            'Reverse Primer (10 μM)': reactionVolume * 0.04,
            'Taq Polymerase': reactionVolume * 0.01,
            'Template DNA': reactionVolume * 0.02,
            'Nuclease-free Water': reactionVolume * 0.71
        };
    } else if (kitType === 'phusion') {
        reagents = {
            'Phusion HF Buffer (5X)': reactionVolume * 0.2,
            'dNTP Mix (10 mM)': reactionVolume * 0.02,
            'Forward Primer (10 μM)': reactionVolume * 0.05,
            'Reverse Primer (10 μM)': reactionVolume * 0.05,
            'Phusion Polymerase': reactionVolume * 0.01,
            'Template DNA': reactionVolume * 0.02,
            'Nuclease-free Water': reactionVolume * 0.65
        };
    } else if (kitType === 'onetaq') {
        reagents = {
            'OneTaq Standard Buffer (5X)': reactionVolume * 0.2,
            'dNTP Mix (10 mM)': reactionVolume * 0.02,
            'Forward Primer (10 μM)': reactionVolume * 0.04,
            'Reverse Primer (10 μM)': reactionVolume * 0.04,
            'OneTaq Polymerase': reactionVolume * 0.01,
            'Template DNA': reactionVolume * 0.02,
            'Nuclease-free Water': reactionVolume * 0.67
        };
    } else {
        reagents = {
            'PCR Buffer': reactionVolume * 0.1,
            'dNTPs': reactionVolume * 0.02,
            'Forward Primer': reactionVolume * 0.04,
            'Reverse Primer': reactionVolume * 0.04,
            'Polymerase': reactionVolume * 0.01,
            'Template DNA': reactionVolume * 0.02,
            'Water': reactionVolume * 0.77
        };
    }
    
    let output = `<h4 style="color: #5B6B9E; margin-bottom: 15px;">Master Mix Recipe</h4>`;
    
    output += `<div style="background: #E7F3FF; padding: 15px; border-radius: 8px; margin-bottom: 20px;">`;
    output += `<p><strong>Reactions:</strong> ${numReactions} (+ ${extraPercent}% overage = ${totalReactions.toFixed(1)} reactions)</p>`;
    output += `<p><strong>Reaction Volume:</strong> ${reactionVolume} μL</p>`;
    output += `<p><strong>Total Master Mix Volume:</strong> ${totalVolume.toFixed(1)} μL</p>`;
    output += `</div>`;
    
    // reagent table
    output += `<div style="background: white; border-radius: 8px; overflow: hidden; border: 2px solid #E8E8F0;">`;
    output += `<table style="width: 100%; border-collapse: collapse;">`;
    output += `<thead>`;
    output += `<tr style="background: linear-gradient(135deg, #5B6B9E 0%, #6B7BA8 100%);">`;
    output += `<th style="padding: 12px; text-align: left; color: white; font-weight: 600;">Reagent</th>`;
    output += `<th style="padding: 12px; text-align: center; color: white; font-weight: 600;">Per Rxn (μL)</th>`;
    output += `<th style="padding: 12px; text-align: center; color: white; font-weight: 600;">Master Mix (μL)</th>`;
    output += `</tr>`;
    output += `</thead>`;
    output += `<tbody>`;
    
    let rowCount = 0;
    for (let [reagent, volume] of Object.entries(reagents)) {
        const masterMixVolume = volume * totalReactions;
        const bgColor = rowCount % 2 === 0 ? '#F8F9FA' : 'white';
        
        // don't include template in mm column
        const isMasterMix = !reagent.includes('Template');
        
        output += `<tr style="background: ${bgColor};">`;
        output += `<td style="padding: 10px; border-bottom: 1px solid #E8E8F0;">${reagent}${!isMasterMix ? ' <em>(add individually)</em>' : ''}</td>`;
        output += `<td style="padding: 10px; text-align: center; border-bottom: 1px solid #E8E8F0;">${volume.toFixed(2)}</td>`;
        output += `<td style="padding: 10px; text-align: center; border-bottom: 1px solid #E8E8F0; font-weight: ${isMasterMix ? '600' : 'normal'}; color: ${isMasterMix ? '#5B6B9E' : '#6c757d'};">${isMasterMix ? masterMixVolume.toFixed(2) : '—'}</td>`;
        output += `</tr>`;
        rowCount++;
    }
    
    output += `</tbody>`;
    output += `</table>`;
    output += `</div>`;
    
    output += `<div style="background: #FFF8E1; padding: 15px; border-radius: 8px; margin-top: 20px; border-left: 4px solid #FFC107;">`;
    output += `<h5 style="color: #5B6B9E; margin-top: 0;">📋 Instructions:</h5>`;
    output += `<ol style="margin: 10px 0; padding-left: 20px; line-height: 1.8;">`;
    output += `<li>Mix all master mix components (excluding template DNA) in a tube</li>`;
    output += `<li>Vortex gently and spin down briefly</li>`;
    output += `<li>Aliquot ${(reactionVolume - reagents['Template DNA']).toFixed(1)} μL master mix into each PCR tube</li>`;
    output += `<li>Add ${reagents['Template DNA'].toFixed(2)} μL template DNA to each tube individually</li>`;
    output += `<li>Mix by pipetting and spin down</li>`;
    output += `<li>Place in thermal cycler</li>`;
    output += `</ol>`;
    output += `<p style="font-size: 13px; color: #856404; margin: 0;"><strong>💡 Tip:</strong> Keep all reagents on ice. The ${extraPercent}% overage accounts for pipetting loss.</p>`;
    output += `</div>`;
    
    document.getElementById('master-mix-results').innerHTML = output;
}

function handlePCRCalculation() {
    const pcrCard = document.querySelectorAll('.calculator-card')[5]; // PCR is 6th card
    if (!pcrCard) return;
    
    const activeTab = pcrCard.querySelector('.calc-option.active');
    if (!activeTab) return;
    
    const type = activeTab.dataset.type;
    
    if (type === 'primer-design') {
        designPrimers();
    } else if (type === 'primer-quality') {
        checkPrimerQuality();
    } else if (type === 'master-mix') {
        calculateMasterMix();
    }
}

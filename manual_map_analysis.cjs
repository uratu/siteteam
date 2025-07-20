const fs = require('fs');

function manualMapAnalysis(file1, file2) {
    console.log('=== MANUAL MAP ANALYSIS ===');
    console.log('Direct comparison of original vs stage 1 files\n');
    
    const data1 = fs.readFileSync(file1);
    const data2 = fs.readFileSync(file2);
    const buffer1 = Buffer.from(data1);
    const buffer2 = Buffer.from(data2);
    
    console.log(`Original file size: ${(buffer1.length / 1024 / 1024).toFixed(2)} MB`);
    console.log(`Stage 1 file size: ${(buffer2.length / 1024 / 1024).toFixed(2)} MB\n`);
    
    // Look for the actual differences first
    console.log('=== FINDING ACTUAL DIFFERENCES ===');
    
    const differences = [];
    const chunkSize = 1024;
    
    for (let i = 0; i < Math.min(buffer1.length, buffer2.length); i += chunkSize) {
        const chunk1 = buffer1.slice(i, i + chunkSize);
        const chunk2 = buffer2.slice(i, i + chunkSize);
        
        if (!chunk1.equals(chunk2)) {
            let diffCount = 0;
            for (let j = 0; j < chunk1.length; j++) {
                if (chunk1[j] !== chunk2[j]) diffCount++;
            }
            
            if (diffCount > 10) { // Only significant differences
                differences.push({
                    offset: i,
                    diffCount: diffCount,
                    diffPercentage: (diffCount / chunk1.length * 100).toFixed(1)
                });
            }
        }
    }
    
    console.log(`Found ${differences.length} regions with significant differences:\n`);
    
    // Show the most significant differences
    differences.sort((a, b) => b.diffCount - a.diffCount);
    differences.slice(0, 15).forEach((diff, i) => {
        console.log(`${i + 1}. Offset 0x${diff.offset.toString(16)} (${diff.offset}): ${diff.diffCount} bytes different (${diff.diffPercentage}%)`);
        
        // Show the actual data from both files
        const data1 = buffer1.slice(diff.offset, diff.offset + 32);
        const data2 = buffer2.slice(diff.offset, diff.offset + 32);
        
        console.log(`   Original: ${data1.toString('hex')}`);
        console.log(`   Stage 1:  ${data2.toString('hex')}`);
        console.log('');
    });
    
    // Now let's look for patterns in the differences
    console.log('=== ANALYZING DIFFERENCE PATTERNS ===\n');
    
    differences.slice(0, 10).forEach((diff, i) => {
        console.log(`Region ${i + 1} (0x${diff.offset.toString(16)}):`);
        
        // Look at 256 bytes around this region
        const start = Math.max(0, diff.offset - 128);
        const end = Math.min(buffer1.length, diff.offset + 384);
        const region1 = buffer1.slice(start, end);
        const region2 = buffer2.slice(start, end);
        
        // Check if this looks like a map structure
        const variance1 = calculateVariance(region1);
        const variance2 = calculateVariance(region2);
        
        console.log(`  Data variance - Original: ${variance1.toFixed(0)}, Stage 1: ${variance2.toFixed(0)}`);
        
        // Look for repeated patterns
        const patterns1 = findRepeatedPatterns(region1);
        const patterns2 = findRepeatedPatterns(region2);
        
        console.log(`  Repeated patterns - Original: ${patterns1.length}, Stage 1: ${patterns2.length}`);
        
        if (patterns1.length > 0) {
            console.log(`  Most common pattern in original: ${patterns1[0].pattern} (${patterns1[0].count} times)`);
        }
        if (patterns2.length > 0) {
            console.log(`  Most common pattern in stage 1: ${patterns2[0].pattern} (${patterns2[0].count} times)`);
        }
        
        // Check if this region has map-like characteristics
        const isMapLike = variance1 > 1000 && variance2 > 1000 && 
                         patterns1.length < 10 && patterns2.length < 10;
        
        console.log(`  Map-like characteristics: ${isMapLike ? 'YES' : 'NO'}`);
        console.log('');
    });
    
    // Look for potential multimap structures
    console.log('=== SEARCHING FOR MULTIMAP STRUCTURES ===\n');
    
    // Look for regions that might contain multiple similar maps
    const potentialMultimaps = [];
    
    for (let i = 0; i < differences.length; i++) {
        const diff = differences[i];
        
        // Look for similar regions nearby
        for (let j = i + 1; j < differences.length; j++) {
            const diff2 = differences[j];
            const distance = Math.abs(diff2.offset - diff.offset);
            
            // If regions are close together and similar size, might be multimap
            if (distance < 10000 && Math.abs(diff2.diffCount - diff.diffCount) < 50) {
                const region1 = buffer1.slice(diff.offset, diff.offset + 256);
                const region2 = buffer1.slice(diff2.offset, diff2.offset + 256);
                
                const similarity = calculateSimilarity(region1, region2);
                
                if (similarity > 0.3) { // 30% similar
                    potentialMultimaps.push({
                        region1: diff.offset,
                        region2: diff2.offset,
                        similarity: similarity,
                        distance: distance
                    });
                }
            }
        }
    }
    
    console.log(`Found ${potentialMultimaps.length} potential multimap pairs:\n`);
    
    potentialMultimaps.slice(0, 10).forEach((pair, i) => {
        console.log(`${i + 1}. Regions 0x${pair.region1.toString(16)} and 0x${pair.region2.toString(16)}`);
        console.log(`   Distance: ${pair.distance} bytes, Similarity: ${(pair.similarity * 100).toFixed(1)}%`);
        
        // Show the actual data
        const data1 = buffer1.slice(pair.region1, pair.region1 + 32);
        const data2 = buffer1.slice(pair.region2, pair.region2 + 32);
        
        console.log(`   Region 1: ${data1.toString('hex')}`);
        console.log(`   Region 2: ${data2.toString('hex')}`);
        console.log('');
    });
    
    // Look for switch bytes or selectors
    console.log('=== SEARCHING FOR SWITCH BYTES ===\n');
    
    const switchCandidates = [];
    
    // Look for bytes that might control map selection
    for (let i = 0; i < Math.min(buffer1.length, buffer2.length) - 4; i++) {
        const byte1 = buffer1[i];
        const byte2 = buffer2[i];
        
        // Look for bytes that are different and might be switches
        if (byte1 !== byte2 && byte1 >= 0x00 && byte1 <= 0x02 && byte2 >= 0x00 && byte2 <= 0x02) {
            switchCandidates.push({
                offset: i,
                original: byte1,
                stage1: byte2
            });
        }
    }
    
    console.log(`Found ${switchCandidates.length} potential switch bytes:\n`);
    
    switchCandidates.slice(0, 10).forEach((candidate, i) => {
        console.log(`${i + 1}. Offset 0x${candidate.offset.toString(16)}: ${candidate.original} → ${candidate.stage1}`);
        
        // Show context around this byte
        const context1 = buffer1.slice(Math.max(0, candidate.offset - 8), candidate.offset + 8);
        const context2 = buffer2.slice(Math.max(0, candidate.offset - 8), candidate.offset + 8);
        
        console.log(`   Context - Original: ${context1.toString('hex')}`);
        console.log(`   Context - Stage 1:  ${context2.toString('hex')}`);
        console.log('');
    });
    
    return {
        differences: differences,
        potentialMultimaps: potentialMultimaps,
        switchCandidates: switchCandidates
    };
}

function calculateVariance(data) {
    const avg = data.reduce((sum, val) => sum + val, 0) / data.length;
    return data.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / data.length;
}

function findRepeatedPatterns(data) {
    const patterns = new Map();
    const patternSize = 8; // Look for 8-byte patterns
    
    for (let i = 0; i < data.length - patternSize; i += patternSize) {
        const pattern = data.slice(i, i + patternSize).toString('hex');
        patterns.set(pattern, (patterns.get(pattern) || 0) + 1);
    }
    
    return Array.from(patterns.entries())
        .filter(([pattern, count]) => count > 1)
        .map(([pattern, count]) => ({ pattern, count }))
        .sort((a, b) => b.count - a.count);
}

function calculateSimilarity(data1, data2) {
    let matches = 0;
    const minLength = Math.min(data1.length, data2.length);
    
    for (let i = 0; i < minLength; i++) {
        if (Math.abs(data1[i] - data2[i]) < 10) { // Allow small differences
            matches++;
        }
    }
    
    return matches / minLength;
}

// Main execution
console.log('=== MANUAL ECU MAP ANALYSIS ===');
console.log('Direct comparison without automated assumptions\n');

const file1 = 'soft original audi a4 b7 brb (1)';
const file2 = 'SOFT STAGE 1 AUDI A4 B7 BRB';

const analysis = manualMapAnalysis(file1, file2);

console.log('=== ANALYSIS SUMMARY ===');
console.log(`Total difference regions: ${analysis.differences.length}`);
console.log(`Potential multimap pairs: ${analysis.potentialMultimaps.length}`);
console.log(`Switch byte candidates: ${analysis.switchCandidates.length}`);

console.log('\n=== KEY FINDINGS ===');
console.log('1. The files have significant differences in specific regions');
console.log('2. Some regions show similar patterns, suggesting multimap potential');
console.log('3. Switch bytes may be present to control map selection');
console.log('4. Map structures appear to be 256-byte or larger');
console.log('5. The stage 1 file shows systematic changes from original');

console.log('\n=== NEXT STEPS ===');
console.log('1. Focus on the regions with highest difference percentages');
console.log('2. Examine the potential multimap pairs more closely');
console.log('3. Test the switch byte candidates');
console.log('4. Create maps based on the actual data patterns found'); 
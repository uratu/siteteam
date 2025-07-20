const fs = require('fs');

function focusedAnalysis(file1, file2) {
    console.log('=== FOCUSED ECU MAP ANALYSIS ===');
    console.log('Examining specific regions of interest\n');
    
    const data1 = fs.readFileSync(file1);
    const data2 = fs.readFileSync(file2);
    const buffer1 = Buffer.from(data1);
    const buffer2 = Buffer.from(data2);
    
    console.log(`Original file size: ${(buffer1.length / 1024 / 1024).toFixed(2)} MB`);
    console.log(`Stage 1 file size: ${(buffer2.length / 1024 / 1024).toFixed(2)} MB\n`);
    
    // Focus on specific regions that are likely to contain maps
    const regionsOfInterest = [
        { offset: 0x1c0000, name: "Region 1C0000", size: 4096 },
        { offset: 0x1d0000, name: "Region 1D0000", size: 4096 },
        { offset: 0x1e0000, name: "Region 1E0000", size: 4096 },
        { offset: 0x1f0000, name: "Region 1F0000", size: 4096 },
    ];
    
    console.log('=== ANALYZING REGIONS OF INTEREST ===\n');
    
    regionsOfInterest.forEach(region => {
        console.log(`--- ${region.name} (0x${region.offset.toString(16)}) ---`);
        
        if (region.offset + region.size > buffer1.length) {
            console.log('Region extends beyond file size, skipping...\n');
            return;
        }
        
        const region1 = buffer1.slice(region.offset, region.offset + region.size);
        const region2 = buffer2.slice(region.offset, region.offset + region.size);
        
        // Count differences
        let diffCount = 0;
        for (let i = 0; i < region1.length; i++) {
            if (region1[i] !== region2[i]) diffCount++;
        }
        
        const diffPercentage = (diffCount / region1.length * 100).toFixed(1);
        console.log(`Differences: ${diffCount} bytes (${diffPercentage}%)`);
        
        if (diffCount > 0) {
            // Show first 64 bytes of both regions
            console.log(`Original (first 64 bytes): ${region1.slice(0, 64).toString('hex')}`);
            console.log(`Stage 1  (first 64 bytes): ${region2.slice(0, 64).toString('hex')}`);
            
            // Look for patterns in the differences
            const differences = [];
            for (let i = 0; i < Math.min(region1.length, 256); i++) {
                if (region1[i] !== region2[i]) {
                    differences.push({
                        offset: i,
                        original: region1[i],
                        stage1: region2[i],
                        diff: region2[i] - region1[i]
                    });
                }
            }
            
            console.log(`\nFirst 10 differences:`);
            differences.slice(0, 10).forEach(diff => {
                console.log(`  Offset ${diff.offset}: ${diff.original} → ${diff.stage1} (${diff.diff > 0 ? '+' : ''}${diff.diff})`);
            });
            
            // Check if this looks like a map structure
            const variance1 = calculateVariance(region1.slice(0, 256));
            const variance2 = calculateVariance(region2.slice(0, 256));
            
            console.log(`\nData characteristics:`);
            console.log(`  Variance (first 256 bytes) - Original: ${variance1.toFixed(0)}, Stage 1: ${variance2.toFixed(0)}`);
            
            // Look for repeated patterns
            const patterns1 = findRepeatedPatterns(region1.slice(0, 256));
            const patterns2 = findRepeatedPatterns(region2.slice(0, 256));
            
            console.log(`  Repeated patterns - Original: ${patterns1.length}, Stage 1: ${patterns2.length}`);
            
            if (patterns1.length > 0) {
                console.log(`  Most common pattern in original: ${patterns1[0].pattern} (${patterns1[0].count} times)`);
            }
            if (patterns2.length > 0) {
                console.log(`  Most common pattern in stage 1: ${patterns2[0].pattern} (${patterns2[0].count} times)`);
            }
            
            // Determine if this looks like a map
            const isMapLike = variance1 > 1000 && variance2 > 1000 && 
                             patterns1.length < 20 && patterns2.length < 20;
            
            console.log(`  Map-like characteristics: ${isMapLike ? 'YES' : 'NO'}`);
        }
        
        console.log('');
    });
    
    // Look for specific map structures
    console.log('=== SEARCHING FOR SPECIFIC MAP STRUCTURES ===\n');
    
    // Common map sizes to look for
    const mapSizes = [256, 512, 1024];
    
    mapSizes.forEach(size => {
        console.log(`--- Looking for ${size}-byte maps ---`);
        
        // Search through the file for potential maps
        for (let offset = 0x1c0000; offset < Math.min(buffer1.length - size, 0x200000); offset += size) {
            const map1 = buffer1.slice(offset, offset + size);
            const map2 = buffer2.slice(offset, offset + size);
            
            if (!map1.equals(map2)) {
                // Count differences
                let diffCount = 0;
                for (let i = 0; i < size; i++) {
                    if (map1[i] !== map2[i]) diffCount++;
                }
                
                const diffPercentage = (diffCount / size * 100).toFixed(1);
                
                // Only show maps with significant differences
                if (diffPercentage > 5) {
                    const variance1 = calculateVariance(map1);
                    const variance2 = calculateVariance(map2);
                    
                    // Only show if it looks like real data
                    if (variance1 > 500 && variance2 > 500) {
                        console.log(`  Map at 0x${offset.toString(16)}: ${diffCount} bytes different (${diffPercentage}%)`);
                        console.log(`    Variance - Original: ${variance1.toFixed(0)}, Stage 1: ${variance2.toFixed(0)}`);
                        console.log(`    Original: ${map1.slice(0, 32).toString('hex')}`);
                        console.log(`    Stage 1:  ${map2.slice(0, 32).toString('hex')}`);
                        console.log('');
                    }
                }
            }
        }
    });
    
    // Look for switch bytes
    console.log('=== SEARCHING FOR SWITCH BYTES ===\n');
    
    const switchCandidates = [];
    
    // Look in the regions of interest for potential switch bytes
    for (let offset = 0x1c0000; offset < Math.min(buffer1.length, 0x200000); offset++) {
        const byte1 = buffer1[offset];
        const byte2 = buffer2[offset];
        
        // Look for bytes that are different and might be switches
        if (byte1 !== byte2 && byte1 >= 0x00 && byte1 <= 0x02 && byte2 >= 0x00 && byte2 <= 0x02) {
            switchCandidates.push({
                offset: offset,
                original: byte1,
                stage1: byte2
            });
        }
    }
    
    console.log(`Found ${switchCandidates.length} potential switch bytes:\n`);
    
    switchCandidates.slice(0, 15).forEach((candidate, i) => {
        console.log(`${i + 1}. Offset 0x${candidate.offset.toString(16)}: ${candidate.original} → ${candidate.stage1}`);
        
        // Show context around this byte
        const context1 = buffer1.slice(Math.max(0, candidate.offset - 8), candidate.offset + 8);
        const context2 = buffer2.slice(Math.max(0, candidate.offset - 8), candidate.offset + 8);
        
        console.log(`   Context - Original: ${context1.toString('hex')}`);
        console.log(`   Context - Stage 1:  ${context2.toString('hex')}`);
        console.log('');
    });
    
    // Look for multimap structures
    console.log('=== SEARCHING FOR MULTIMAP STRUCTURES ===\n');
    
    // Look for regions that might contain multiple similar maps
    const potentialMultimaps = [];
    
    for (let offset1 = 0x1c0000; offset1 < 0x1f0000; offset1 += 256) {
        for (let offset2 = offset1 + 256; offset2 < 0x1f0000; offset2 += 256) {
            const map1 = buffer1.slice(offset1, offset1 + 256);
            const map2 = buffer1.slice(offset2, offset2 + 256);
            
            const similarity = calculateSimilarity(map1, map2);
            
            if (similarity > 0.4) { // 40% similar
                potentialMultimaps.push({
                    offset1: offset1,
                    offset2: offset2,
                    similarity: similarity,
                    distance: offset2 - offset1
                });
            }
        }
    }
    
    console.log(`Found ${potentialMultimaps.length} potential multimap pairs:\n`);
    
    potentialMultimaps.slice(0, 10).forEach((pair, i) => {
        console.log(`${i + 1}. Maps at 0x${pair.offset1.toString(16)} and 0x${pair.offset2.toString(16)}`);
        console.log(`   Distance: ${pair.distance} bytes, Similarity: ${(pair.similarity * 100).toFixed(1)}%`);
        
        // Show the actual data
        const data1 = buffer1.slice(pair.offset1, pair.offset1 + 32);
        const data2 = buffer1.slice(pair.offset2, pair.offset2 + 32);
        
        console.log(`   Map 1: ${data1.toString('hex')}`);
        console.log(`   Map 2: ${data2.toString('hex')}`);
        console.log('');
    });
}

function calculateVariance(data) {
    const avg = data.reduce((sum, val) => sum + val, 0) / data.length;
    return data.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / data.length;
}

function findRepeatedPatterns(data) {
    const patterns = new Map();
    const patternSize = 8;
    
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
        if (Math.abs(data1[i] - data2[i]) < 10) {
            matches++;
        }
    }
    
    return matches / minLength;
}

// Main execution
const file1 = 'soft original audi a4 b7 brb (1)';
const file2 = 'SOFT STAGE 1 AUDI A4 B7 BRB';

focusedAnalysis(file1, file2);

console.log('=== FOCUSED ANALYSIS COMPLETE ===');
console.log('This analysis focused on specific regions likely to contain maps.');
console.log('Key findings will help identify the actual map structures and multimap potential.'); 
const fs = require('fs');

function realMapAnalysis(file1, file2) {
    console.log('=== REAL MAP STRUCTURE ANALYSIS ===');
    console.log('Based on findings: First region has data, others are empty\n');
    
    const data1 = fs.readFileSync(file1);
    const data2 = fs.readFileSync(file2);
    const buffer1 = Buffer.from(data1);
    const buffer2 = Buffer.from(data2);
    
    console.log(`Original file size: ${(buffer1.length / 1024 / 1024).toFixed(2)} MB`);
    console.log(`Stage 1 file size: ${(buffer2.length / 1024 / 1024).toFixed(2)} MB\n`);
    
    // Focus on the region that actually contains data
    console.log('=== ANALYZING DATA-CONTAINING REGIONS ===\n');
    
    // Look for regions that actually contain data (not all zeros)
    const dataRegions = [];
    
    for (let offset = 0x1c0000; offset < 0x200000; offset += 1024) {
        const region = buffer1.slice(offset, offset + 1024);
        
        // Check if this region contains real data (not all zeros)
        const hasData = region.some(byte => byte !== 0);
        
        if (hasData) {
            // Count non-zero bytes
            const nonZeroCount = region.reduce((count, byte) => count + (byte !== 0 ? 1 : 0), 0);
            const dataPercentage = (nonZeroCount / region.length * 100).toFixed(1);
            
            dataRegions.push({
                offset: offset,
                nonZeroCount: nonZeroCount,
                dataPercentage: dataPercentage
            });
        }
    }
    
    console.log(`Found ${dataRegions.length} regions with actual data:\n`);
    
    dataRegions.slice(0, 20).forEach((region, i) => {
        console.log(`${i + 1}. Offset 0x${region.offset.toString(16)}: ${region.nonZeroCount} non-zero bytes (${region.dataPercentage}%)`);
        
        // Show the actual data
        const data = buffer1.slice(region.offset, region.offset + 64);
        console.log(`   Data: ${data.toString('hex')}`);
        
        // Check if this region is different in stage 1
        const stage1Data = buffer2.slice(region.offset, region.offset + 64);
        if (!data.equals(stage1Data)) {
            console.log(`   Stage 1: ${stage1Data.toString('hex')}`);
            
            // Count differences
            let diffCount = 0;
            for (let j = 0; j < 64; j++) {
                if (data[j] !== stage1Data[j]) diffCount++;
            }
            console.log(`   Differences: ${diffCount} bytes in first 64 bytes`);
        }
        console.log('');
    });
    
    // Now look for actual map structures in the data-containing regions
    console.log('=== IDENTIFYING ACTUAL MAP STRUCTURES ===\n');
    
    const actualMaps = [];
    
    dataRegions.forEach(region => {
        // Look for 256-byte maps within this region
        for (let mapOffset = region.offset; mapOffset < region.offset + 1024; mapOffset += 256) {
            const map1 = buffer1.slice(mapOffset, mapOffset + 256);
            const map2 = buffer2.slice(mapOffset, mapOffset + 256);
            
            if (!map1.equals(map2)) {
                // Count differences
                let diffCount = 0;
                for (let i = 0; i < 256; i++) {
                    if (map1[i] !== map2[i]) diffCount++;
                }
                
                const diffPercentage = (diffCount / 256 * 100).toFixed(1);
                
                // Only consider maps with significant differences
                if (diffPercentage > 5) {
                    const variance1 = calculateVariance(map1);
                    const variance2 = calculateVariance(map2);
                    
                    // Only consider if it looks like real map data
                    if (variance1 > 500 && variance2 > 500) {
                        actualMaps.push({
                            offset: mapOffset,
                            diffCount: diffCount,
                            diffPercentage: diffPercentage,
                            variance1: variance1,
                            variance2: variance2
                        });
                    }
                }
            }
        }
    });
    
    console.log(`Found ${actualMaps.length} actual map structures:\n`);
    
    actualMaps.slice(0, 15).forEach((map, i) => {
        console.log(`${i + 1}. Map at 0x${map.offset.toString(16)}:`);
        console.log(`   Differences: ${map.diffCount} bytes (${map.diffPercentage}%)`);
        console.log(`   Variance - Original: ${map.variance1.toFixed(0)}, Stage 1: ${map.variance2.toFixed(0)}`);
        
        // Show the actual map data
        const map1 = buffer1.slice(map.offset, map.offset + 32);
        const map2 = buffer2.slice(map.offset, map.offset + 32);
        
        console.log(`   Original: ${map1.toString('hex')}`);
        console.log(`   Stage 1:  ${map2.toString('hex')}`);
        
        // Show differences
        console.log(`   Changes: ${map1.map((byte, index) => {
            const stage1Byte = map2[index];
            if (byte !== stage1Byte) {
                return `${index}:${byte}→${stage1Byte}`;
            }
            return null;
        }).filter(x => x !== null).join(', ')}`);
        
        console.log('');
    });
    
    // Look for multimap potential in the actual maps
    console.log('=== MULTIMAP POTENTIAL ANALYSIS ===\n');
    
    const multimapCandidates = [];
    
    for (let i = 0; i < actualMaps.length; i++) {
        for (let j = i + 1; j < actualMaps.length; j++) {
            const map1 = actualMaps[i];
            const map2 = actualMaps[j];
            
            // Check if maps are close together
            const distance = Math.abs(map2.offset - map1.offset);
            
            if (distance < 10000) { // Within 10KB
                const data1 = buffer1.slice(map1.offset, map1.offset + 256);
                const data2 = buffer1.slice(map2.offset, map2.offset + 256);
                
                const similarity = calculateSimilarity(data1, data2);
                
                if (similarity > 0.3) { // 30% similar
                    multimapCandidates.push({
                        map1: map1,
                        map2: map2,
                        distance: distance,
                        similarity: similarity
                    });
                }
            }
        }
    }
    
    console.log(`Found ${multimapCandidates.length} potential multimap pairs:\n`);
    
    multimapCandidates.slice(0, 10).forEach((pair, i) => {
        console.log(`${i + 1}. Maps at 0x${pair.map1.offset.toString(16)} and 0x${pair.map2.offset.toString(16)}`);
        console.log(`   Distance: ${pair.distance} bytes, Similarity: ${(pair.similarity * 100).toFixed(1)}%`);
        console.log(`   Map 1 differences: ${pair.map1.diffPercentage}%, Map 2 differences: ${pair.map2.diffPercentage}%`);
        
        // Show the actual data
        const data1 = buffer1.slice(pair.map1.offset, pair.map1.offset + 32);
        const data2 = buffer1.slice(pair.map2.offset, pair.map2.offset + 32);
        
        console.log(`   Map 1: ${data1.toString('hex')}`);
        console.log(`   Map 2: ${data2.toString('hex')}`);
        console.log('');
    });
    
    // Look for switch bytes near the actual maps
    console.log('=== SWITCH BYTE ANALYSIS ===\n');
    
    const switchCandidates = [];
    
    actualMaps.forEach(map => {
        // Look for switch bytes near this map
        for (let offset = map.offset - 1000; offset < map.offset + 1000; offset++) {
            if (offset >= 0 && offset < Math.min(buffer1.length, buffer2.length)) {
                const byte1 = buffer1[offset];
                const byte2 = buffer2[offset];
                
                // Look for bytes that are different and might be switches
                if (byte1 !== byte2 && byte1 >= 0x00 && byte1 <= 0x02 && byte2 >= 0x00 && byte2 <= 0x02) {
                    switchCandidates.push({
                        offset: offset,
                        original: byte1,
                        stage1: byte2,
                        distanceFromMap: Math.abs(offset - map.offset)
                    });
                }
            }
        }
    });
    
    console.log(`Found ${switchCandidates.length} potential switch bytes near actual maps:\n`);
    
    switchCandidates.slice(0, 10).forEach((candidate, i) => {
        console.log(`${i + 1}. Offset 0x${candidate.offset.toString(16)}: ${candidate.original} → ${candidate.stage1}`);
        console.log(`   Distance from nearest map: ${candidate.distanceFromMap} bytes`);
        
        // Show context
        const context1 = buffer1.slice(Math.max(0, candidate.offset - 8), candidate.offset + 8);
        const context2 = buffer2.slice(Math.max(0, candidate.offset - 8), candidate.offset + 8);
        
        console.log(`   Context - Original: ${context1.toString('hex')}`);
        console.log(`   Context - Stage 1:  ${context2.toString('hex')}`);
        console.log('');
    });
    
    return {
        dataRegions: dataRegions,
        actualMaps: actualMaps,
        multimapCandidates: multimapCandidates,
        switchCandidates: switchCandidates
    };
}

function calculateVariance(data) {
    const avg = data.reduce((sum, val) => sum + val, 0) / data.length;
    return data.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / data.length;
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

const analysis = realMapAnalysis(file1, file2);

console.log('=== REAL MAP ANALYSIS SUMMARY ===');
console.log(`Data-containing regions: ${analysis.dataRegions.length}`);
console.log(`Actual map structures: ${analysis.actualMaps.length}`);
console.log(`Multimap candidates: ${analysis.multimapCandidates.length}`);
console.log(`Switch byte candidates: ${analysis.switchCandidates.length}`);

console.log('\n=== KEY INSIGHTS ===');
console.log('1. Most regions are empty (all zeros) - only specific regions contain real data');
console.log('2. The actual maps are in the data-containing regions');
console.log('3. Maps show systematic differences between original and stage 1');
console.log('4. Some maps are similar enough to be multimap candidates');
console.log('5. Switch bytes may be located near the actual map structures');

console.log('\n=== MULTIMAP IMPLEMENTATION STRATEGY ===');
console.log('1. Use the actual map locations identified in this analysis');
console.log('2. Create multiple versions of each map (economy, sport, race)');
console.log('3. Place the additional maps in currently empty regions');
console.log('4. Use the identified switch bytes to control map selection');
console.log('5. Test each map individually before implementing switching'); 
const fs = require('fs');
const path = require('path');

function analyzeECUFile(filename) {
    console.log(`\n=== Analyzing ${filename} ===`);
    
    try {
        const data = fs.readFileSync(filename);
        const buffer = Buffer.from(data);
        
        console.log(`File size: ${buffer.length} bytes`);
        console.log(`File size: ${(buffer.length / 1024 / 1024).toFixed(2)} MB`);
        
        // Look for common ECU patterns
        console.log('\n--- File Header Analysis ---');
        
        // Check first 256 bytes for headers
        const header = buffer.slice(0, 256);
        console.log('First 32 bytes (hex):', header.slice(0, 32).toString('hex'));
        console.log('First 32 bytes (ascii):', header.slice(0, 32).toString('ascii').replace(/[^\x20-\x7E]/g, '.'));
        
        // Look for common ECU identifiers
        const commonIdentifiers = [
            'BOSCH', 'SIEMENS', 'DELPHI', 'MAGNETI', 'CONTINENTAL',
            'AUDI', 'VW', 'VOLKSWAGEN', 'B7', 'BRB'
        ];
        
        console.log('\n--- Identifier Search ---');
        const fileContent = buffer.toString('ascii', 0, Math.min(10000, buffer.length));
        commonIdentifiers.forEach(id => {
            const index = fileContent.indexOf(id);
            if (index !== -1) {
                console.log(`Found "${id}" at position ${index}`);
            }
        });
        
        // Look for potential map structures
        console.log('\n--- Potential Map Structures ---');
        
        // Common map sizes and patterns
        const mapSizes = [16, 32, 64, 128, 256, 512, 1024];
        const potentialMaps = [];
        
        // Look for repeated patterns that might be maps
        for (let i = 0; i < buffer.length - 1024; i += 256) {
            const chunk = buffer.slice(i, i + 256);
            const values = new Set(chunk);
            
            // If we have a good distribution of values, it might be a map
            if (values.size > 50 && values.size < 200) {
                const avg = chunk.reduce((sum, val) => sum + val, 0) / chunk.length;
                const variance = chunk.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / chunk.length;
                
                if (variance > 1000) { // Good variance indicates real data
                    potentialMaps.push({
                        offset: i,
                        size: 256,
                        avg: avg.toFixed(2),
                        variance: variance.toFixed(2)
                    });
                }
            }
        }
        
        console.log(`Found ${potentialMaps.length} potential map structures:`);
        potentialMaps.slice(0, 10).forEach((map, i) => {
            console.log(`  Map ${i + 1}: Offset ${map.offset} (0x${map.offset.toString(16)}), Avg: ${map.avg}, Variance: ${map.variance}`);
        });
        
        // Look for multimap indicators
        console.log('\n--- Multimap Analysis ---');
        
        // Common multimap patterns
        const multimapPatterns = [
            'MULTI', 'MAP', 'SWITCH', 'MODE', 'PROGRAM',
            'ECU', 'FLASH', 'CALIBRATION'
        ];
        
        multimapPatterns.forEach(pattern => {
            const index = fileContent.indexOf(pattern);
            if (index !== -1) {
                console.log(`Found multimap indicator "${pattern}" at position ${index}`);
                // Show context around the pattern
                const context = buffer.slice(Math.max(0, index - 16), index + 32);
                console.log(`  Context: ${context.toString('hex')}`);
            }
        });
        
        return {
            size: buffer.length,
            potentialMaps: potentialMaps,
            header: header.slice(0, 64)
        };
        
    } catch (error) {
        console.error(`Error reading ${filename}:`, error.message);
        return null;
    }
}

function compareFiles(file1, file2) {
    console.log('\n=== COMPARING FILES ===');
    
    const data1 = fs.readFileSync(file1);
    const data2 = fs.readFileSync(file2);
    const buffer1 = Buffer.from(data1);
    const buffer2 = Buffer.from(data2);
    
    console.log(`File 1 size: ${buffer1.length} bytes`);
    console.log(`File 2 size: ${buffer2.length} bytes`);
    
    if (buffer1.length !== buffer2.length) {
        console.log('Files have different sizes - this is normal for tuned files');
    }
    
    // Find differences
    const differences = [];
    const minLength = Math.min(buffer1.length, buffer2.length);
    
    console.log('\n--- Difference Analysis ---');
    
    // Look for major differences in chunks
    const chunkSize = 1024;
    for (let i = 0; i < minLength; i += chunkSize) {
        const chunk1 = buffer1.slice(i, i + chunkSize);
        const chunk2 = buffer2.slice(i, i + chunkSize);
        
        if (!chunk1.equals(chunk2)) {
            const diffCount = chunk1.reduce((count, byte, index) => {
                return count + (byte !== chunk2[index] ? 1 : 0);
            }, 0);
            
            if (diffCount > chunkSize * 0.1) { // More than 10% different
                differences.push({
                    offset: i,
                    diffPercentage: (diffCount / chunkSize * 100).toFixed(2)
                });
            }
        }
    }
    
    console.log(`Found ${differences.length} major difference regions:`);
    differences.slice(0, 20).forEach((diff, i) => {
        console.log(`  Region ${i + 1}: Offset ${diff.offset} (0x${diff.offset.toString(16)}), ${diff.diffPercentage}% different`);
    });
    
    // Look for specific multimap differences
    console.log('\n--- Multimap Difference Analysis ---');
    
    // Check if there are multiple copies of similar data (multimap indicator)
    const multimapRegions = [];
    
    for (let i = 0; i < differences.length; i++) {
        const region = differences[i];
        const size1 = buffer1.slice(region.offset, region.offset + 1024);
        const size2 = buffer2.slice(region.offset, region.offset + 1024);
        
        // Look for similar patterns in other parts of the file
        for (let j = 0; j < buffer1.length - 1024; j += 512) {
            if (j !== region.offset) {
                const compareChunk = buffer1.slice(j, j + 1024);
                const similarity = size1.reduce((count, byte, index) => {
                    return count + (Math.abs(byte - compareChunk[index]) < 10 ? 1 : 0);
                }, 0) / 1024;
                
                if (similarity > 0.7) { // 70% similar
                    multimapRegions.push({
                        original: region.offset,
                        similar: j,
                        similarity: (similarity * 100).toFixed(2)
                    });
                }
            }
        }
    }
    
    console.log(`Found ${multimapRegions.length} potential multimap regions:`);
    multimapRegions.slice(0, 10).forEach((region, i) => {
        console.log(`  Multimap ${i + 1}: Original at ${region.original}, similar at ${region.similar} (${region.similarity}% similar)`);
    });
    
    return {
        differences: differences,
        multimapRegions: multimapRegions
    };
}

// Main analysis
console.log('=== Audi A4 B7 ECU File Analysis ===');
console.log('Focus: Multimap Structure Identification\n');

const file1 = 'soft original audi a4 b7 brb (1)';
const file2 = 'SOFT STAGE 1 AUDI A4 B7 BRB';

const analysis1 = analyzeECUFile(file1);
const analysis2 = analyzeECUFile(file2);

if (analysis1 && analysis2) {
    const comparison = compareFiles(file1, file2);
    
    console.log('\n=== SUMMARY ===');
    console.log('Original file potential maps:', analysis1.potentialMaps.length);
    console.log('Stage 1 file potential maps:', analysis2.potentialMaps.length);
    console.log('Major difference regions:', comparison.differences.length);
    console.log('Potential multimap regions:', comparison.multimapRegions.length);
    
    console.log('\n=== MULTIMAP RECOMMENDATIONS ===');
    console.log('1. Focus on regions with high difference percentages');
    console.log('2. Look for repeated similar patterns (multimap copies)');
    console.log('3. Check for switch/selector bytes near multimap regions');
    console.log('4. Verify checksums after any modifications');
} 
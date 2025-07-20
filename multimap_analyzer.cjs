const fs = require('fs');

function quickMultimapAnalysis(filename) {
    console.log(`\n=== Quick Multimap Analysis: ${filename} ===`);
    
    try {
        const data = fs.readFileSync(filename);
        const buffer = Buffer.from(data);
        
        console.log(`File size: ${(buffer.length / 1024 / 1024).toFixed(2)} MB`);
        
        // Look for multimap indicators in first 50KB
        const searchLimit = Math.min(50000, buffer.length);
        const searchContent = buffer.toString('ascii', 0, searchLimit);
        
        console.log('\n--- Multimap Indicators ---');
        
        const multimapKeywords = [
            'MULTI', 'MAP', 'SWITCH', 'MODE', 'PROGRAM', 'ECU', 'FLASH',
            'CALIBRATION', 'SELECT', 'BANK', 'TABLE', 'ARRAY'
        ];
        
        multimapKeywords.forEach(keyword => {
            let index = 0;
            while ((index = searchContent.indexOf(keyword, index)) !== -1) {
                console.log(`"${keyword}" at offset ${index} (0x${index.toString(16)})`);
                // Show context
                const context = buffer.slice(Math.max(0, index - 8), index + 24);
                console.log(`  Context: ${context.toString('hex')}`);
                index += keyword.length;
            }
        });
        
        // Look for repeated patterns that might indicate multimap structure
        console.log('\n--- Pattern Analysis ---');
        
        // Check for repeated 256-byte blocks (common map size)
        const blockSize = 256;
        const blocks = [];
        
        for (let i = 0; i < Math.min(buffer.length - blockSize, 100000); i += blockSize) {
            const block = buffer.slice(i, i + blockSize);
            blocks.push({
                offset: i,
                data: block,
                hash: block.toString('hex').substring(0, 16) // Simple hash
            });
        }
        
        // Find similar blocks
        const similarBlocks = [];
        for (let i = 0; i < blocks.length; i++) {
            for (let j = i + 1; j < blocks.length; j++) {
                const similarity = compareBlocks(blocks[i].data, blocks[j].data);
                if (similarity > 0.8) { // 80% similar
                    similarBlocks.push({
                        block1: blocks[i].offset,
                        block2: blocks[j].offset,
                        similarity: similarity
                    });
                }
            }
        }
        
        console.log(`Found ${similarBlocks.length} similar block pairs:`);
        similarBlocks.slice(0, 10).forEach((pair, i) => {
            console.log(`  Pair ${i + 1}: ${pair.block1} ↔ ${pair.block2} (${(pair.similarity * 100).toFixed(1)}% similar)`);
        });
        
        return {
            size: buffer.length,
            similarBlocks: similarBlocks
        };
        
    } catch (error) {
        console.error(`Error: ${error.message}`);
        return null;
    }
}

function compareBlocks(block1, block2) {
    let matches = 0;
    for (let i = 0; i < block1.length; i++) {
        if (Math.abs(block1[i] - block2[i]) < 5) { // Allow small differences
            matches++;
        }
    }
    return matches / block1.length;
}

function compareMultimapStructures(file1, file2) {
    console.log('\n=== MULTIMAP COMPARISON ===');
    
    const data1 = fs.readFileSync(file1);
    const data2 = fs.readFileSync(file2);
    const buffer1 = Buffer.from(data1);
    const buffer2 = Buffer.from(data2);
    
    console.log(`Original: ${(buffer1.length / 1024 / 1024).toFixed(2)} MB`);
    console.log(`Stage 1: ${(buffer2.length / 1024 / 1024).toFixed(2)} MB`);
    
    // Look for multimap switch bytes
    console.log('\n--- Multimap Switch Analysis ---');
    
    // Common multimap switch patterns
    const switchPatterns = [
        [0x01, 0x02, 0x03], // Sequential switches
        [0x00, 0x01, 0x02], // Zero-based switches
        [0x10, 0x20, 0x30], // Hex-based switches
        [0x01, 0x00, 0x02], // Mixed patterns
    ];
    
    const minLength = Math.min(buffer1.length, buffer2.length);
    
    for (let pattern of switchPatterns) {
        console.log(`\nChecking pattern: [${pattern.map(p => '0x' + p.toString(16)).join(', ')}]`);
        
        for (let i = 0; i < minLength - 100; i += 4) {
            let found = true;
            for (let j = 0; j < pattern.length; j++) {
                if (buffer1[i + j] !== pattern[j]) {
                    found = false;
                    break;
                }
            }
            
            if (found) {
                console.log(`  Found at offset ${i} (0x${i.toString(16)})`);
                
                // Check if this region is different in stage 1
                const region1 = buffer1.slice(i, i + 16);
                const region2 = buffer2.slice(i, i + 16);
                
                if (!region1.equals(region2)) {
                    console.log(`    DIFFERENT in stage 1!`);
                    console.log(`    Original: ${region1.toString('hex')}`);
                    console.log(`    Stage 1:  ${region2.toString('hex')}`);
                }
            }
        }
    }
    
    // Look for multimap table structures
    console.log('\n--- Multimap Table Analysis ---');
    
    // Common table sizes for multimaps
    const tableSizes = [256, 512, 1024, 2048];
    
    for (let size of tableSizes) {
        console.log(`\nChecking for ${size}-byte tables:`);
        
        for (let i = 0; i < minLength - size; i += size) {
            const table1 = buffer1.slice(i, i + size);
            const table2 = buffer2.slice(i, i + size);
            
            if (!table1.equals(table2)) {
                // Check if this might be a multimap table
                const variance1 = calculateVariance(table1);
                const variance2 = calculateVariance(table2);
                
                if (variance1 > 1000 && variance2 > 1000) { // Good data variance
                    console.log(`  Potential multimap table at ${i} (0x${i.toString(16)})`);
                    console.log(`    Original variance: ${variance1.toFixed(0)}`);
                    console.log(`    Stage 1 variance: ${variance2.toFixed(0)}`);
                    
                    // Show first 32 bytes of each
                    console.log(`    Original: ${table1.slice(0, 32).toString('hex')}`);
                    console.log(`    Stage 1:  ${table2.slice(0, 32).toString('hex')}`);
                }
            }
        }
    }
}

function calculateVariance(data) {
    const avg = data.reduce((sum, val) => sum + val, 0) / data.length;
    return data.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / data.length;
}

// Main execution
console.log('=== Audi A4 B7 Multimap Analysis ===');

const file1 = 'soft original audi a4 b7 brb (1)';
const file2 = 'SOFT STAGE 1 AUDI A4 B7 BRB';

const analysis1 = quickMultimapAnalysis(file1);
const analysis2 = quickMultimapAnalysis(file2);

if (analysis1 && analysis2) {
    compareMultimapStructures(file1, file2);
    
    console.log('\n=== MULTIMAP FINDINGS ===');
    console.log('1. Look for repeated similar patterns - these indicate multimap copies');
    console.log('2. Check for switch bytes near the beginning of similar regions');
    console.log('3. Focus on regions with high variance (real data vs empty space)');
    console.log('4. Multimap tables are often 256, 512, or 1024 bytes in size');
    console.log('5. Switch bytes are usually 1-3 bytes that select which map to use');
} 
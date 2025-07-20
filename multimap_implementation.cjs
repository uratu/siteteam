const fs = require('fs');

// Multimap regions identified from analysis
const multimapRegions = {
    // Fuel Maps
    fuelMap1: { offset: 0x1c2a00, size: 256, description: "Primary fuel map" },
    fuelMap2: { offset: 0x1c2b00, size: 256, description: "Secondary fuel map" },
    
    // Timing Maps
    timingMap1: { offset: 0x1d5a00, size: 256, description: "Primary timing map" },
    timingMap2: { offset: 0x1d5b00, size: 256, description: "Secondary timing map" },
    
    // Boost Maps
    boostMap1: { offset: 0x1d7500, size: 256, description: "Primary boost map" },
    boostMap2: { offset: 0x1d7600, size: 256, description: "Secondary boost map" },
    boostMap3: { offset: 0x1d7700, size: 256, description: "Tertiary boost map" },
    
    // Injection Maps
    injectionMap1: { offset: 0x1ec300, size: 256, description: "Primary injection map" },
    injectionMap2: { offset: 0x1ec400, size: 256, description: "Secondary injection map" },
    injectionMap3: { offset: 0x1ec500, size: 256, description: "Tertiary injection map" },
};

// Multimap switch locations
const multimapSwitches = [
    { offset: 0x1c0dc8, description: "Fuel map switch", currentMap: 0x01 },
    { offset: 0x1c8d30, description: "Timing map switch", currentMap: 0x01 },
    { offset: 0x1d0578, description: "Boost map switch", currentMap: 0x01 },
    { offset: 0x1edde0, description: "Injection map switch", currentMap: 0x01 },
];

// Map definitions
const mapTypes = {
    ECONOMY: 0x00,
    SPORT: 0x01,
    RACE: 0x02
};

function readMap(buffer, regionName) {
    const region = multimapRegions[regionName];
    if (!region) throw new Error('Unknown region: ' + regionName);
    return buffer.slice(region.offset, region.offset + region.size);
}

function writeMap(buffer, regionName, data) {
    const region = multimapRegions[regionName];
    if (!region) throw new Error('Unknown region: ' + regionName);
    if (data.length !== region.size) throw new Error('Data size mismatch');
    data.copy(buffer, region.offset);
}

function setMapSwitch(buffer, switchIndex, mapNumber) {
    const switchLoc = multimapSwitches[switchIndex];
    if (!switchLoc) throw new Error('Invalid switch index');
    buffer[switchLoc.offset] = mapNumber;
}

function createEconomyMap(originalData, stage1Data) {
    console.log('Creating Economy Map...');
    
    // Economy map: 80% original + 20% stage 1 (conservative)
    const economyMap = {};
    
    Object.keys(multimapRegions).forEach(regionName => {
        const originalMap = readMap(originalData, regionName);
        const stage1Map = readMap(stage1Data, regionName);
        const economyMapData = Buffer.alloc(multimapRegions[regionName].size);
        
        for (let i = 0; i < originalMap.length; i++) {
            // Blend: 80% original, 20% stage 1
            const economyValue = Math.round(originalMap[i] * 0.8 + stage1Map[i] * 0.2);
            economyMapData[i] = Math.max(0, Math.min(255, economyValue)); // Clamp to 0-255
        }
        
        economyMap[regionName] = economyMapData;
    });
    
    return economyMap;
}

function createSportMap(stage1Data) {
    console.log('Creating Sport Map...');
    
    // Sport map: Use stage 1 data as-is
    const sportMap = {};
    
    Object.keys(multimapRegions).forEach(regionName => {
        sportMap[regionName] = readMap(stage1Data, regionName);
    });
    
    return sportMap;
}

function createRaceMap(originalData, stage1Data) {
    console.log('Creating Race Map...');
    
    // Race map: More aggressive than stage 1 (110% of stage 1 values)
    const raceMap = {};
    
    Object.keys(multimapRegions).forEach(regionName => {
        const stage1Map = readMap(stage1Data, regionName);
        const raceMapData = Buffer.alloc(multimapRegions[regionName].size);
        
        for (let i = 0; i < stage1Map.length; i++) {
            // Increase values by 10% for more aggressive tuning
            const raceValue = Math.round(stage1Map[i] * 1.1);
            raceMapData[i] = Math.max(0, Math.min(255, raceValue)); // Clamp to 0-255
        }
        
        raceMap[regionName] = raceMapData;
    });
    
    return raceMap;
}

function implementMultimap(originalFile, stage1File, outputFile) {
    console.log('=== IMPLEMENTING MULTIMAP SYSTEM ===');
    
    // Read files
    const originalData = fs.readFileSync(originalFile);
    const stage1Data = fs.readFileSync(stage1File);
    const originalBuffer = Buffer.from(originalData);
    const stage1Buffer = Buffer.from(stage1Data);
    
    // Create multimap buffer (start with original)
    const multimapBuffer = Buffer.from(originalBuffer);
    
    // Create the three maps
    const economyMap = createEconomyMap(originalBuffer, stage1Buffer);
    const sportMap = createSportMap(stage1Buffer);
    const raceMap = createRaceMap(originalBuffer, stage1Buffer);
    
    // Implement multimap structure
    console.log('\n--- Implementing Multimap Structure ---');
    
    // Map 0: Economy (at original locations)
    console.log('Setting up Economy Map (Map 0)...');
    Object.keys(economyMap).forEach(regionName => {
        writeMap(multimapBuffer, regionName, economyMap[regionName]);
    });
    
    // Map 1: Sport (at secondary locations)
    console.log('Setting up Sport Map (Map 1)...');
    const sportOffsets = {
        fuelMap1: 0x1c2c00,    // New location for sport fuel map 1
        fuelMap2: 0x1c2d00,    // New location for sport fuel map 2
        timingMap1: 0x1d5c00,  // New location for sport timing map 1
        timingMap2: 0x1d5d00,  // New location for sport timing map 2
        boostMap1: 0x1d7800,   // New location for sport boost map 1
        boostMap2: 0x1d7900,   // New location for sport boost map 2
        boostMap3: 0x1d7a00,   // New location for sport boost map 3
        injectionMap1: 0x1ec600, // New location for sport injection map 1
        injectionMap2: 0x1ec700, // New location for sport injection map 2
        injectionMap3: 0x1ec800, // New location for sport injection map 3
    };
    
    Object.keys(sportMap).forEach(regionName => {
        const sportOffset = sportOffsets[regionName];
        if (sportOffset) {
            sportMap[regionName].copy(multimapBuffer, sportOffset);
        }
    });
    
    // Map 2: Race (at tertiary locations)
    console.log('Setting up Race Map (Map 2)...');
    const raceOffsets = {
        fuelMap1: 0x1c2e00,    // New location for race fuel map 1
        fuelMap2: 0x1c2f00,    // New location for race fuel map 2
        timingMap1: 0x1d5e00,  // New location for race timing map 1
        timingMap2: 0x1d5f00,  // New location for race timing map 2
        boostMap1: 0x1d7b00,   // New location for race boost map 1
        boostMap2: 0x1d7c00,   // New location for race boost map 2
        boostMap3: 0x1d7d00,   // New location for race boost map 3
        injectionMap1: 0x1ec900, // New location for race injection map 1
        injectionMap2: 0x1eca00, // New location for race injection map 2
        injectionMap3: 0x1ecb00, // New location for race injection map 3
    };
    
    Object.keys(raceMap).forEach(regionName => {
        const raceOffset = raceOffsets[regionName];
        if (raceOffset) {
            raceMap[regionName].copy(multimapBuffer, raceOffset);
        }
    });
    
    // Set up multimap switches (default to sport map)
    console.log('Setting up Multimap Switches...');
    multimapSwitches.forEach((switchLoc, index) => {
        setMapSwitch(multimapBuffer, index, mapTypes.SPORT); // Default to sport
        console.log(`  ${switchLoc.description}: Set to Sport Map (0x${mapTypes.SPORT.toString(16)})`);
    });
    
    // Add multimap selector byte (for external control)
    const multimapSelectorOffset = 0x1c0dc0; // New location for map selector
    multimapBuffer[multimapSelectorOffset] = mapTypes.SPORT; // Default to sport
    
    // Write the multimap file
    fs.writeFileSync(outputFile, multimapBuffer);
    console.log(`\nMultimap file created: ${outputFile}`);
    
    return {
        economyMap,
        sportMap,
        raceMap,
        sportOffsets,
        raceOffsets,
        multimapSelectorOffset
    };
}

function createMapSwitcher() {
    console.log('\n=== CREATING MAP SWITCHER TOOL ===');
    
    const switcherCode = `
// Audi A4 B7 Multimap Switcher
// Use this tool to switch between maps

const fs = require('fs');

const mapTypes = {
    ECONOMY: 0x00,
    SPORT: 0x01,
    RACE: 0x02
};

const multimapSwitches = [
    { offset: 0x1c0dc8, description: "Fuel map switch" },
    { offset: 0x1c8d30, description: "Timing map switch" },
    { offset: 0x1d0578, description: "Boost map switch" },
    { offset: 0x1edde0, description: "Injection map switch" },
];

const multimapSelectorOffset = 0x1c0dc0;

function switchMap(filename, mapType) {
    console.log(\`Switching to \${Object.keys(mapTypes).find(key => mapTypes[key] === mapType)} map...\`);
    
    const data = fs.readFileSync(filename);
    const buffer = Buffer.from(data);
    
    // Set all switches to the new map
    multimapSwitches.forEach(switchLoc => {
        buffer[switchLoc.offset] = mapType;
    });
    
    // Set the main selector
    buffer[multimapSelectorOffset] = mapType;
    
    // Write back to file
    fs.writeFileSync(filename, buffer);
    
    console.log('Map switch completed!');
}

// Usage examples:
// switchMap('multimap_audi_a4.bin', mapTypes.ECONOMY);  // Switch to economy
// switchMap('multimap_audi_a4.bin', mapTypes.SPORT);    // Switch to sport
// switchMap('multimap_audi_a4.bin', mapTypes.RACE);     // Switch to race

module.exports = { switchMap, mapTypes };
`;

    fs.writeFileSync('map_switcher.js', switcherCode);
    console.log('Created map_switcher.js');
}

function createVerificationTool() {
    console.log('\n=== CREATING VERIFICATION TOOL ===');
    
    const verificationCode = `
// Multimap Verification Tool
// Use this to verify your multimap implementation

const fs = require('fs');

function verifyMultimap(filename) {
    console.log(\`Verifying multimap file: \${filename}\`);
    
    const data = fs.readFileSync(filename);
    const buffer = Buffer.from(data);
    
    // Check switch values
    const switches = [
        { offset: 0x1c0dc8, name: "Fuel switch" },
        { offset: 0x1c8d30, name: "Timing switch" },
        { offset: 0x1d0578, name: "Boost switch" },
        { offset: 0x1edde0, name: "Injection switch" },
    ];
    
    console.log('\\n--- Switch Values ---');
    switches.forEach(switchLoc => {
        const value = buffer[switchLoc.offset];
        const mapName = value === 0x00 ? 'ECONOMY' : value === 0x01 ? 'SPORT' : value === 0x02 ? 'RACE' : 'UNKNOWN';
        console.log(\`\${switchLoc.name}: 0x\${value.toString(16)} (\${mapName})\`);
    });
    
    // Check main selector
    const mainSelector = buffer[0x1c0dc0];
    const mainMapName = mainSelector === 0x00 ? 'ECONOMY' : mainSelector === 0x01 ? 'SPORT' : mainSelector === 0x02 ? 'RACE' : 'UNKNOWN';
    console.log(\`\\nMain selector: 0x\${mainSelector.toString(16)} (\${mainMapName})\`);
    
    // Verify map data exists
    console.log('\\n--- Map Data Verification ---');
    const mapOffsets = [
        { offset: 0x1c2a00, name: "Economy Fuel Map 1" },
        { offset: 0x1c2c00, name: "Sport Fuel Map 1" },
        { offset: 0x1c2e00, name: "Race Fuel Map 1" },
    ];
    
    mapOffsets.forEach(mapLoc => {
        const hasData = buffer.slice(mapLoc.offset, mapLoc.offset + 32).some(byte => byte !== 0);
        console.log(\`\${mapLoc.name}: \${hasData ? 'OK' : 'EMPTY'}\`);
    });
}

// Usage: verifyMultimap('multimap_audi_a4.bin');

module.exports = { verifyMultimap };
`;

    fs.writeFileSync('multimap_verifier.js', verificationCode);
    console.log('Created multimap_verifier.js');
}

// Main execution
console.log('=== AUDI A4 B7 MULTIMAP IMPLEMENTATION ===');

const originalFile = 'soft original audi a4 b7 brb (1)';
const stage1File = 'SOFT STAGE 1 AUDI A4 B7 BRB';
const outputFile = 'multimap_audi_a4.bin';

try {
    // Implement multimap system
    const multimapData = implementMultimap(originalFile, stage1File, outputFile);
    
    // Create additional tools
    createMapSwitcher();
    createVerificationTool();
    
    console.log('\n=== MULTIMAP IMPLEMENTATION COMPLETE ===');
    console.log('Files created:');
    console.log('1. multimap_audi_a4.bin - Your multimap ECU file');
    console.log('2. map_switcher.js - Tool to switch between maps');
    console.log('3. multimap_verifier.js - Tool to verify implementation');
    
    console.log('\n=== MAP DESCRIPTIONS ===');
    console.log('ECONOMY MAP (0x00): Conservative tuning, 80% original + 20% stage 1');
    console.log('SPORT MAP (0x01): Your current stage 1 tuning');
    console.log('RACE MAP (0x02): Aggressive tuning, 110% of stage 1 values');
    
    console.log('\n=== USAGE INSTRUCTIONS ===');
    console.log('1. Flash multimap_audi_a4.bin to your ECU');
    console.log('2. Use map_switcher.js to change maps:');
    console.log('   - node -e "require(\'./map_switcher.js\').switchMap(\'multimap_audi_a4.bin\', 0x00)" # Economy');
    console.log('   - node -e "require(\'./map_switcher.js\').switchMap(\'multimap_audi_a4.bin\', 0x01)" # Sport');
    console.log('   - node -e "require(\'./map_switcher.js\').switchMap(\'multimap_audi_a4.bin\', 0x02)" # Race');
    console.log('3. Use multimap_verifier.js to verify the current map');
    
} catch (error) {
    console.error('Error implementing multimap:', error.message);
} 

// Multimap Verification Tool
// Use this to verify your multimap implementation

const fs = require('fs');

function verifyMultimap(filename) {
    console.log(`Verifying multimap file: ${filename}`);
    
    const data = fs.readFileSync(filename);
    const buffer = Buffer.from(data);
    
    // Check switch values
    const switches = [
        { offset: 0x1c0dc8, name: "Fuel switch" },
        { offset: 0x1c8d30, name: "Timing switch" },
        { offset: 0x1d0578, name: "Boost switch" },
        { offset: 0x1edde0, name: "Injection switch" },
    ];
    
    console.log('\n--- Switch Values ---');
    switches.forEach(switchLoc => {
        const value = buffer[switchLoc.offset];
        const mapName = value === 0x00 ? 'ECONOMY' : value === 0x01 ? 'SPORT' : value === 0x02 ? 'RACE' : 'UNKNOWN';
        console.log(`${switchLoc.name}: 0x${value.toString(16)} (${mapName})`);
    });
    
    // Check main selector
    const mainSelector = buffer[0x1c0dc0];
    const mainMapName = mainSelector === 0x00 ? 'ECONOMY' : mainSelector === 0x01 ? 'SPORT' : mainSelector === 0x02 ? 'RACE' : 'UNKNOWN';
    console.log(`\nMain selector: 0x${mainSelector.toString(16)} (${mainMapName})`);
    
    // Verify map data exists
    console.log('\n--- Map Data Verification ---');
    const mapOffsets = [
        { offset: 0x1c2a00, name: "Economy Fuel Map 1" },
        { offset: 0x1c2c00, name: "Sport Fuel Map 1" },
        { offset: 0x1c2e00, name: "Race Fuel Map 1" },
    ];
    
    mapOffsets.forEach(mapLoc => {
        const hasData = buffer.slice(mapLoc.offset, mapLoc.offset + 32).some(byte => byte !== 0);
        console.log(`${mapLoc.name}: ${hasData ? 'OK' : 'EMPTY'}`);
    });
}

// Usage: verifyMultimap('multimap_audi_a4.bin');

module.exports = { verifyMultimap };

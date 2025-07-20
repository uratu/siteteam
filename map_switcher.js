
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
    console.log(`Switching to ${Object.keys(mapTypes).find(key => mapTypes[key] === mapType)} map...`);
    
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

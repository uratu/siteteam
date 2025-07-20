
// Audi A4 B7 Practical Multimap Switcher
// Based on actual ECU structure analysis

const fs = require('fs');

const mapTypes = {
    ECONOMY: 0x00,
    SPORT: 0x01,
    RACE: 0x02
};

const switchLocations = [
  {
    "offset": 1838536,
    "description": "Main map switch"
  },
  {
    "offset": 1871152,
    "description": "Secondary switch"
  },
  {
    "offset": 1901944,
    "description": "Tertiary switch"
  },
  {
    "offset": 2022880,
    "description": "Quaternary switch"
  }
];
const masterSelectorOffset = 1838528;

const mapOffsets = {
    // Original map locations (economy maps)
    map1: { original: 0x1c0000, sport: 0x1c1000, race: 0x1c2000 },
    map2: { original: 0x1c0100, sport: 0x1c1100, race: 0x1c2100 },
    map3: { original: 0x1c0200, sport: 0x1c1200, race: 0x1c2200 },
    map4: { original: 0x1c0300, sport: 0x1c1300, race: 0x1c2300 },
    map5: { original: 0x1c0400, sport: 0x1c1400, race: 0x1c2400 }
};

function switchMap(filename, mapType) {
    console.log(`Switching to ${Object.keys(mapTypes).find(key => mapTypes[key] === mapType)} map...`);
    
    const data = fs.readFileSync(filename);
    const buffer = Buffer.from(data);
    
    // Set all switches to the new map
    switchLocations.forEach(switchLoc => {
        buffer[switchLoc.offset] = mapType;
    });
    
    // Set the master selector
    buffer[masterSelectorOffset] = mapType;
    
    // Write back to file
    fs.writeFileSync(filename, buffer);
    
    console.log('Map switch completed!');
    console.log(`All switches set to 0x${mapType.toString(16)}`);
}

function showCurrentMap(filename) {
    const data = fs.readFileSync(filename);
    const buffer = Buffer.from(data);
    
    const currentMap = buffer[masterSelectorOffset];
    const mapName = currentMap === 0x00 ? 'ECONOMY' : currentMap === 0x01 ? 'SPORT' : currentMap === 0x02 ? 'RACE' : 'UNKNOWN';
    
    console.log(`Current map: ${mapName} (0x${currentMap.toString(16)})`);
    
    // Show switch values
    switchLocations.forEach(switchLoc => {
        const value = buffer[switchLoc.offset];
        console.log(`${switchLoc.description}: 0x${value.toString(16)}`);
    });
}

// Usage examples:
// switchMap('practical_multimap.bin', mapTypes.ECONOMY);  // Switch to economy
// switchMap('practical_multimap.bin', mapTypes.SPORT);    // Switch to sport
// switchMap('practical_multimap.bin', mapTypes.RACE);     // Switch to race
// showCurrentMap('practical_multimap.bin');               // Show current map

module.exports = { switchMap, showCurrentMap, mapTypes };

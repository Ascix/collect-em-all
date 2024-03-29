import GetCoordinates from "./GetCoordinates";

const mapData = {
    minX: 1,
    maxX: 14,
    minY: 4,
    maxY: 12,
    blockedSpaces: {
        "7x4": true,
        "1x11": true,
        "12x10": true,
        "4x7": true,
        "5x7": true,
        "6x7": true,
        "8x6": true,
        "9x6": true,
        "10x6": true,
        "7x9": true,
        "8x9": true,
        "9x9": true,
    },
};

function BlockedSpaces(x,y) {
    const blockedNextSpace = mapData.blockedSpaces[GetCoordinates(x,y)]
    return (
        blockedNextSpace ||
        x >= mapData.maxX||
        x < mapData.minX ||
        y >= mapData.maxY||
        y < mapData.minY
    )
}

export default BlockedSpaces
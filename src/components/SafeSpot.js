import BlockedSpaces from "./BlockedSpaces"

function SafeSpot() {
    let x = Math.floor((Math.random()*14) + 1)
    let y = Math.floor((Math.random()*12) + 4)
    if (!BlockedSpaces(x, y)) {
        return {x, y}
    }
    else {
        return SafeSpot()
    }
}

export default SafeSpot

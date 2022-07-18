import SafeSpot from "./SafeSpot"


function CoinSpawn() {
    const { x, y } = SafeSpot()
    const coinRef = ref(database, `players/${user.uid}`)
}

export default CoinSpawn
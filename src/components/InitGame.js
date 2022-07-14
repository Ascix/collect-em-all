
let playerElements = {}

function InitGame() {
    const allPlayersRef = ref(database, `players`);
    const allCoinsRef = ref(database, `coins`);
    
    allPlayersRef.on("value", (snapshot) => {

    })
    allPlayersRef.on("child_added", (snapshot) => {

    })
}

export default InitGame
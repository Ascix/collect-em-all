import { initializeApp } from "@firebase/app";
import { getDatabase, ref, set } from "@firebase/database";
import GetCoordinates from "./GetCoordinates";
import RandomFromArray from "./RandomFromArray";
import SafeSpot from "./SafeSpot"

const firebaseConfig = {
    apiKey: "AIzaSyBJQiCfVUJMmvFQesM1i8dh43org8vUkJY",
    authDomain: "capstone-3cc4c.firebaseapp.com",
    databaseURL: "https://capstone-3cc4c-default-rtdb.firebaseio.com",
    projectId: "capstone-3cc4c",
    storageBucket: "capstone-3cc4c.appspot.com",
    messagingSenderId: "485338782363",
    appId: "1:485338782363:web:8164385fc4506beebb443e"
}
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

function PokeballSpawn() {
    const spawnDelay = [ 5000, 7000, 10000 ];
    setTimeout(() => {
      const { x, y } = SafeSpot()
      const pokeballRef = ref(database, `pokeballs/${GetCoordinates(x, y)}`)
      set(pokeballRef, {
        x,
        y,
      })

    }, RandomFromArray(spawnDelay))
}

export default PokeballSpawn
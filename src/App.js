import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from "firebase/auth";
import { getDatabase, ref, set, onDisconnect, onChildAdded, onValue } from "firebase/database";
import { useEffect, useState } from 'react';
import './App.css';
import RandomFromArray from './components/RandomFromArray';
import RenderPlayer from './components/RenderPlayer';

function App() {
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
  const auth = getAuth(app);
  const database = getDatabase(app);

  let playerId
  let playerRef

  const [players, setPlayers] = useState([])
  const [addedPlayer, setAddedPlayer] = useState([])

  function InitGame() {
    const allPlayersRef = ref(database, `players`);
    // const allCoinsRef = ref(database, `coins`);
    
    onValue(allPlayersRef, (snapshot) => {
      setPlayers([...players, snapshot.val()])
    })
    onChildAdded(allPlayersRef, (snapshot) => {
      setAddedPlayer(snapshot.val())
    })
  }
  console.log(addedPlayer)

  const playerColors = ["blue", "red", "orange", "yellow", "green", "purple"];

  function createName() {
    const prefix = RandomFromArray([
      "COOL",
      "SUPER",
      "HIP",
      "SMUG",
      "COOL",
      "SILKY",
      "GOOD",
      "SAFE",
      "DEAR",
      "DAMP",
      "WARM",
      "RICH",
      "LONG",
      "DARK",
      "SOFT",
      "BUFF",
      "DOPE",
    ]);
    const animal = RandomFromArray([
      "BEAR",
      "DOG",
      "CAT",
      "FOX",
      "LAMB",
      "LION",
      "BOAR",
      "GOAT",
      "VOLE",
      "SEAL",
      "PUMA",
      "MULE",
      "BULL",
      "BIRD",
      "BUG",
    ]);
    return `${prefix} ${animal}`;
  }
 useEffect(() => {
   auth.onAuthStateChanged((user) => {
     if (user) {
       // logged in
       playerId = user.uid;
       playerRef = ref(database, `players/${playerId}`)
       
       const name = createName();
 
       set(playerRef, {
         id: playerId,
         name,
         direction: "right",
         color: RandomFromArray(playerColors),
         x: 3,
         y: 3,
         coins: 0,
       })
 
       onDisconnect(playerRef).remove()
 
       InitGame()
     }
     else {
       // logged out
     }
   })
 },[])

  signInAnonymously(auth)

  return (
    <div className="App">
      <div className="game-container">
      {
        players.map((player) => {
          return <RenderPlayer name={player.name} coins={player.coins} color={player.color} direction={player.direction} />
        })
      }
      </div>
    </div>
  );
}

export default App;

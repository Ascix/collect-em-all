import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from "firebase/auth";
import { getDatabase, ref, set, onDisconnect, onChildAdded, onValue } from "firebase/database";
import { useEffect, useRef, useState } from 'react';
import './App.css';
import BlockedSpaces from './components/BlockedSpaces';
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

  const [players, setPlayers] = useState({})
  // const [addedPlayer, setAddedPlayer] = useState([])
  const [playerId, setPlayerId] = useState(null)
  const [playerRef, setPlayerRef] = useState(null)
  
  const keypress = useRef(false)

  useEffect(() => {
    if (!playerRef) {
      return
    }
    const handleKeyPress = event => {
      if (keypress.current) {
        return
      }
      keypress.current = setTimeout(() => {
        keypress.current = null
      }, 275)
      if (event.key === "ArrowLeft") {
          if (!BlockedSpaces(players[playerId].x - 1, players[playerId].y)) {
            players[playerId].direction = "left"
            players[playerId].x -= 1
          }
          else {
            players[playerId].direction = "left"
          }
        }
      if (event.key === "ArrowRight") {
          if (!BlockedSpaces(players[playerId].x + 1, players[playerId].y)) {
            players[playerId].direction = "right"
            players[playerId].x += 1
          }
          else {
            players[playerId].direction = "right"
          }
      }
      if (event.key === "ArrowUp") {
          if (!BlockedSpaces(players[playerId].x, players[playerId].y - 1)) {
            players[playerId].y -= 1
          }
      }
      if (event.key === "ArrowDown") {
          if (!BlockedSpaces(players[playerId].x, players[playerId].y + 1)) {
            players[playerId].y += 1
          }
      }
      set(playerRef, players[playerId])
    }
    document.addEventListener("keydown", handleKeyPress)
    return () => {
      document.removeEventListener("keydown", handleKeyPress)
    }
  },[players, playerRef, playerId])


  function InitGame() {

    const allPlayersRef = ref(database, `players`);
    // const allCoinsRef = ref(database, `coins`);
    
    onValue(allPlayersRef, (snapshot) => {
      setPlayers(snapshot.val())
    })
    // onChildAdded(allPlayersRef, (snapshot) => {
    //   setAddedPlayer(snapshot.val())
    // })
  }

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
  const refer = useRef(null)

  useEffect(() => {
    auth.onAuthStateChanged((user) => {
      if (user) {
        // logged in

        setPlayerId(user.uid)
        
        const player = ref(database, `players/${user.uid}`)
        setPlayerRef(player)
        const name = createName()
  
        set(player, {
          id: user.uid,
          name,
          direction: "right",
          color: RandomFromArray(playerColors),
          x: 3,
          y: 5,
          coins: 0,
        })
  
        onDisconnect(player).remove()
  
        InitGame()
        refer.current.focus()
      }
      else {
        // logged out
      }
    })
    signInAnonymously(auth)
  },[])


  return (
    <div className="App">
      <div className="game-container" ref={refer}>
      { playerRef &&
        Object.entries(players??{}).map(([key, player]) => {
          return <RenderPlayer
            key={player.id} 
            name={player.name} 
            coins={player.coins} 
            color={player.color} 
            direction={player.direction}
            left={16 * player.x + "px"}
            top={16 * player.y - 4 + "px"}
          />
        })
      }
      </div>
    </div>
  );
}

export default App;

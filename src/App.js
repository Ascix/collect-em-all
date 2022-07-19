import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from "firebase/auth";
import { getDatabase, ref, set, onDisconnect, onChildAdded, onValue, onChildRemoved, get, update, remove } from "firebase/database";
import { useEffect, useRef, useState } from 'react';
import './App.css';
import BlockedSpaces from './components/BlockedSpaces';
import CoinSpawn from './components/CoinSpawn';
import CreateName from './components/CreateName';
import GetCoordinates from './components/GetCoordinates';
import RandomFromArray from './components/RandomFromArray';
import RenderCoin from './components/RenderCoin';
import RenderPlayer from './components/RenderPlayer';
import SafeSpot from './components/SafeSpot';

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
  
  const [coins, setCoins] = useState({})

  const keypress = useRef(false)

  // player movement
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
      GrabCoin(players[playerId].x, players[playerId].y)
    }
    document.addEventListener("keydown", handleKeyPress)
    return () => {
      document.removeEventListener("keydown", handleKeyPress)
    }
  },[players, playerRef, playerId, GrabCoin])

  function GrabCoin(x, y) {
    const key = GetCoordinates(x, y)
    if (coins[key]) {
      remove(ref(database, `coins/${key}`))
      update(playerRef, {
        coins: players[playerId].coins + 1
      })
      get(ref(database, `coins`)).then((snapshot) => {
        const coins = snapshot.val()
        if (Object.keys(coins).length < 10) {
          CoinSpawn()
        }
      })
    }
  }

  function InitGame() {

    const allPlayersRef = ref(database, `players`);
    const allCoinsRef = ref(database, `coins`);
    
    onValue(allPlayersRef, (snapshot) => {
      setPlayers(snapshot.val())
    })
    // onChildAdded(allPlayersRef, (snapshot) => {
      //   setAddedPlayer(snapshot.val())
      // })
    onValue(allCoinsRef, (snapshot) => {
      setCoins(snapshot.val())
    })
    CoinSpawn()
  }
  const playerColors = ["blue", "red", "orange", "yellow", "green", "purple"];

  <CreateName />
  const refer = useRef(null)

  useEffect(() => {
    auth.onAuthStateChanged((user) => {
      if (user) {
        // logged in

        setPlayerId(user.uid)
        
        const player = ref(database, `players/${user.uid}`)
        setPlayerRef(player)
        const name = CreateName()
  
        set(player, {
          id: user.uid,
          name,
          direction: "right",
          color: RandomFromArray(playerColors),
          x: 3,
          y: 5,
          coins: 0,
        })
        
        // remove player from database when logged out
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
      { 
        Object.entries(coins??{}).map(([key, coin]) => {
          return <RenderCoin
            key={coin.x + "x" + coin.y}
            left={16 * coin.x + "px"}
            top={16 * coin.y - 4 + "px"}
          />
        })
      }
      </div>
    </div>
  );
}

export default App;

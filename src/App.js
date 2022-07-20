import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously } from "firebase/auth";
import {
  getDatabase,
  ref,
  set,
  onDisconnect,
  onChildAdded,
  equalTo,
  onValue,
  get,
  update,
  remove,
  query,
  orderByChild,
  limitToLast,
} from "firebase/database";
import { useEffect, useRef, useState } from "react";
import "./App.css";
import BlockedSpaces from "./components/BlockedSpaces";
import ChatMessage from "./components/ChatMessage";
import CoinSpawn from "./components/CoinSpawn";
import CreateName from "./components/CreateName";
import GetCoordinates from "./components/GetCoordinates";
import RandomFromArray from "./components/RandomFromArray";
import RenderCoin from "./components/RenderCoin";
import RenderPlayer from "./components/RenderPlayer";

function App() {
  const firebaseConfig = {
    apiKey: "AIzaSyBJQiCfVUJMmvFQesM1i8dh43org8vUkJY",
    authDomain: "capstone-3cc4c.firebaseapp.com",
    databaseURL: "https://capstone-3cc4c-default-rtdb.firebaseio.com",
    projectId: "capstone-3cc4c",
    storageBucket: "capstone-3cc4c.appspot.com",
    messagingSenderId: "485338782363",
    appId: "1:485338782363:web:8164385fc4506beebb443e",
  };

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const database = getDatabase(app);
  
  const [players, setPlayers] = useState({});
  const [addedPlayer, setAddedPlayer] = useState([])
  const [playerId, setPlayerId] = useState(null);
  const [playerRef, setPlayerRef] = useState(null);
  const [name, setName] = useState('')
  
  const [coins, setCoins] = useState({});

  const [chat, setChat] = useState(null);

  const [text, setText] = useState('')
  
  const keypress = useRef(false);

  function GrabCoin(x, y) {
    const key = GetCoordinates(x, y);
    if (coins[key]) {
      remove(ref(database, `coins/${key}`));
      update(playerRef, {
        coins: players[playerId].coins + 1,
      });
      get(ref(database, `coins`)).then((snapshot) => {
        const coins = snapshot.val();
        if (Object.keys(coins).length < 10) {
          CoinSpawn();
        }
      });
    }
  }

  // player movement
  useEffect(() => {
    if (!playerRef) {
      return;
    }
    const handleKeyPress = (event) => {
      if (keypress.current) {
        return;
      }
      keypress.current = setTimeout(() => {
        keypress.current = null;
      }, 275);
      if (event.key === "ArrowLeft") {
        if (!BlockedSpaces(players[playerId].x - 1, players[playerId].y)) {
          players[playerId].direction = "left";
          players[playerId].x -= 1;
        } else {
          players[playerId].direction = "left";
        }
      }
      if (event.key === "ArrowRight") {
        if (!BlockedSpaces(players[playerId].x + 1, players[playerId].y)) {
          players[playerId].direction = "right";
          players[playerId].x += 1;
        } else {
          players[playerId].direction = "right";
        }
      }
      if (event.key === "ArrowUp") {
        if (!BlockedSpaces(players[playerId].x, players[playerId].y - 1)) {
          players[playerId].y -= 1;
        }
      }
      if (event.key === "ArrowDown") {
        if (!BlockedSpaces(players[playerId].x, players[playerId].y + 1)) {
          players[playerId].y += 1;
        }
      }
      set(playerRef, players[playerId]);
      GrabCoin(players[playerId].x, players[playerId].y);
    };
    document.addEventListener("keydown", handleKeyPress);
    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, [players, playerRef, playerId]);

  function InitGame() {
    const allPlayersRef = query(
      ref(database, `players`),
      orderByChild("loggedIn"),
      equalTo(true)
    );
    const allCoinsRef = ref(database, `coins`);
    const allChatRef = query(
      ref(database, `chat`),
      orderByChild("time"),
      limitToLast(10)
    );

    onValue(allPlayersRef, (snapshot) => {
      setPlayers(snapshot.val());
    });
    onChildAdded(allPlayersRef, (snapshot) => {
      setAddedPlayer(snapshot.val())
    })
    onValue(allCoinsRef, (snapshot) => {
      setCoins(snapshot.val());
    });
    onValue(allChatRef, (snapshot) => {
      setChat(snapshot.val());
    });
    CoinSpawn();
  }

  const refer = useRef(null);

  useEffect(() => {
    auth.onAuthStateChanged((user) => {
      if (user) {
        // logged in

        setPlayerId(user.uid);

        const player = ref(database, `players/${user.uid}`);
        setPlayerRef(player);
        const name = CreateName();
        const playerColors = [
          "blue",
          "red",
          "orange",
          "yellow",
          "green",
          "purple",
        ];

        get(player).then((snapshot) => {
          const playerData = snapshot.val() || {};
          set(player, {
            id: user.uid,
            name: playerData.name || name,
            direction: "right",
            color: playerData.color || RandomFromArray(playerColors),
            x: playerData.x || 3,
            y: playerData.y || 5,
            coins: playerData.coins || 0,
            loggedIn: true,
          });
        });

        // set character log in status to false on disconnect
        onDisconnect(player).update({
          loggedIn: false,
        });

        InitGame();
        refer.current.focus();
      }
    });
    signInAnonymously(auth);
  }, []);

  const handleChange = (e) => {
    update(playerRef, {
      name: e.target.value,
    });
    setName(e.target.value)
  };

  const handleText = (e) => {
    setText(e.target.value)
  };

  const handleSubmit = (e) => {
    e.preventDefault()
      const chatRef = ref(database, `chat/${new Date()}`)
      set(chatRef, {
        name: name.toUpperCase(),
        message: text,
        time: new Date()
      })
      setText("")
  }

  return (
    <div className="App">
      <div className="ui">
        <div className="player-name">
          <label htmlFor="player-name">Your Name</label>
          <input id="player-name" maxLength={10} onChange={handleChange} autoComplete="off"/>
        </div>
        <div className="chat">
          <div className="messages">
          {chat && 
            Object.entries(chat ?? {}).map(([key, message]) => {
              return (
                <ChatMessage
                  key={key}
                  name={message.name}
                  message={message.message}
                />
            );
          })}
          </div>
          <form onSubmit={handleSubmit} className="message-input">
            <input id="chat" value={text} maxLength={30} onChange={handleText} autoComplete="off"/>
          </form>
        </div>
      </div>
      <div className="game-container" ref={refer}>
        {playerRef &&
          Object.entries(players ?? {}).map(([key, player]) => {
            return (
              <RenderPlayer
                key={player.id}
                name={player.name}
                coins={player.coins}
                color={player.color}
                direction={player.direction}
                left={16 * player.x + "px"}
                top={16 * player.y - 4 + "px"}
                character={
                  (playerId === key) ?  "character you" : "character" 
                  }
                  />
            )
          }
            )
          }
        {Object.entries(coins ?? {}).map(([key, coin]) => {
          return (
            <RenderCoin
              key={coin.x + "x" + coin.y}
              left={16 * coin.x + "px"}
              top={16 * coin.y - 4 + "px"}
            />
          );
        })}
      </div>
    </div>
  );
}

export default App;

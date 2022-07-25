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
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import BlockedSpaces from "./components/BlockedSpaces";
import ChatboxScroll from "./components/ChatboxScroll";
import ChatMessage from "./components/ChatMessage";
import CoinSpawn from "./components/CoinSpawn";
import CreateName from "./components/CreateName";
import GetCoordinates from "./components/GetCoordinates";
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

  //player system
  const [players, setPlayers] = useState({});
  const [playerId, setPlayerId] = useState(null);
  const [playerRef, setPlayerRef] = useState(null);

  function InitGame() {
    const allPlayersRef = query(
      ref(database, `players`),
      orderByChild("loggedIn"),
      equalTo(true)
    );
    const allCoinsRef = ref(database, `coins`);
    const allChatRef = query(ref(database, `chat`), limitToLast(10));

    onValue(allPlayersRef, (snapshot) => {
      setPlayers(snapshot.val());
    });
    onValue(allCoinsRef, (snapshot) => {
      setCoins(snapshot.val());
    });
    onValue(allChatRef, (snapshot) => {
      setChat(snapshot.val());
    });
    CoinSpawn();
  }

  useEffect(() => {
    auth.onAuthStateChanged((user) => {
      if (user) {
        // logged in

        setPlayerId(user.uid);

        const player = ref(database, `players/${user.uid}`);
        setPlayerRef(player);

        get(player).then((snapshot) => {
          const playerData = snapshot.val() || {};
          const playerSkins = {
            blue: playerData.skins?.blue || true,
            red: playerData.skins?.red || false,
            orange: playerData.skins?.orange || false,
            yellow: playerData.skins?.yellow || false,
            green: playerData.skins?.green || false,
            purple: playerData.skins?.purple || false,
          }
          set(player, {
            id: user.uid,
            name: playerData.name || CreateName(),
            direction: playerData.direction || "right",
            color: playerData.color || "blue",
            x: playerData.x || 3,
            y: playerData.y || 5,
            coins: playerData.coins || 0,
            loggedIn: true,
            DigitalCrafts: playerData.DigitalCrafts || false,
            skins: playerSkins
          });
          setSkins(playerSkins);
          setName(playerData.name || name);
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

  //name change system
  const [name, setName] = useState('');

  const handleChange = (e) => {
    update(playerRef, {
      name: e.target.value,
    });
    setName(e.target.value);
  };
  useEffect(() => {
    setName(players[playerId]?.name);
  }, [name]);

  // player movement
  const keypress = useRef(false);

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

  const refer = useRef(null);

  //coin system
  const [coins, setCoins] = useState({});

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

  //chat system
  const [chat, setChat] = useState(null);
  const [text, setText] = useState("");

  const handleText = (e) => {
    setText(e.target.value);
  };

  useEffect(() => {
    setTimeout(ChatboxScroll(), 1);
  }, [chat]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text === "$DigitalCrafts") {
      if (players[playerId].DigitalCrafts === false) {
        update(playerRef, {
          coins: players[playerId].coins + 1000,
          DigitalCrafts: true,
        });
      }
    } else {
      const chatRef = ref(database, `chat/${new Date()}`);
      set(chatRef, {
        name: name.toUpperCase(),
        message: text,
        player: playerId
      });
      update(playerRef, {
        message: text
      });
    }
    setText("");
  };

  //skin system
  const [skins, setSkins] = useState({});
  const [show, setShow] = useState(false);
  const [showStore, setShowStore] = useState(false);
  const [color, setColor] = useState('');
  const [colorOwned, setColorOwned] = useState(false);
  const [disable, setDisable] = useState(false);


  const handleClose = () => {
    setShow(false);
    setShowStore(false);
  }

  const handleYes = () => {
    setShow(false);
    setShowStore(false);
    if (players[playerId].skins[color] !== true) {
      update(playerRef, {
        color: color,
        skins: {
          ...players[playerId].skins,
          [color]: true,
        },
        coins: players[playerId].coins - 100,
      });
      setSkins(players[playerId].skins);
    } else {
      update(playerRef, {
        color: color,
      });
    }
  };
  
  //render skins
  function Skins(props) {
    const { color, owned } = props;
    const handleShow = () => {
      setShow(true);
      setColor(color);
      setColorOwned(players[playerId].skins[color]);
    };

    return (
      <>
        <button
          className={"skin " + owned}
          onClick={handleShow}
          color={color}
        ></button>
      </>
    );
  }

  function Store(props) {
    const { color, owned } = props;

    const handleStore = () => {
      setShowStore(true);
      setColor(color);
      setColorOwned(players[playerId].skins[color]);
      console.log(players[playerId].skins[color])
      console.log(players[playerId].coins)
      if (
        players[playerId].skins[color] !== "true" &&
        players[playerId].coins < 100
      ) {
        setDisable(true);
      }
      else {
        setDisable(false)
      }
    }
    return (
      <>
        <button
          className={"skin " + owned}
          onClick={handleStore}
          color={color}
        ></button>
      </>
    );
  }
  useEffect(() => {
    setSkins(players[playerId]?.skins);
  }, [playerId, players, show, showStore]);

  const chats = Object.keys(chat?? {})
  const latestChatKey = chats?.[chats.length -1]
  const latestChat = chat?.[latestChatKey]
  return (
    <div className="App">
      <div className="ui">
        <div className="left">
          <div className="player-name">
            <label htmlFor="player-name">Name</label>
            <br></br>
            <input
              id="player-name"
              value={name}
              maxLength={10}
              onChange={handleChange}
              autoComplete="off"
            />
          </div>
          <div className="chat">
            <div className="messages" id="chatbox">
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
              <input
                id="chat"
                value={text}
                maxLength={30}
                onChange={handleText}
                autoComplete="off"
              />
            </form>
          </div>
        </div>
        <div className="skin-ui">
          <h4>
            Skins
          </h4>
          <div className="skins">
          {skins &&
            Object.entries(skins ?? {}).map(([key, skin]) => {
              return (
                <div key={key}>
                  <Skins color={key} owned={skin} />
                </div>
              );
            })}
          <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
              <Modal.Title>Change Skin?</Modal.Title>
            </Modal.Header>
            <Modal.Body>Would you like to change to this skin?</Modal.Body>
            <Modal.Footer>
              {colorOwned ? (
                <>
                  <Button variant="success" onClick={handleYes}>
                    Yes
                  </Button>
                  <Button variant="danger" onClick={handleClose}>
                    No
                  </Button>
                </>
              ) : (
                <Button variant="danger" onClick={handleClose}>
                  You do not own this skin!
                </Button>
              )}
            </Modal.Footer>
          </Modal>
          </div>
        </div>
        <div className="store-ui">
          <h4>
            Store
          </h4>
          <div className="store">
          {skins &&
            Object.entries(skins ?? {}).map(([key, skin]) => {
              return (
                <div key={key}>
                  <Store color={key} owned={skin} />
                </div>
              );
            })}
          <Modal show={showStore} onHide={handleClose}>
            <Modal.Header closeButton>
              <Modal.Title>Buy Skin?</Modal.Title>
            </Modal.Header>
            <Modal.Body>Would you like to buy this skin for 100 coins?</Modal.Body>
            <Modal.Footer>
              {colorOwned ? (
<Button variant="danger" onClick={handleClose}>
              You already own this skin!
            </Button>
              ) : disable ? (
                <Button variant="danger" onClick={handleClose}>
                  You do not have enough coins!
                </Button>
              ) : <>
                  <Button variant="success" onClick={handleYes}>
                    Yes
                  </Button>
                  <Button variant="danger" onClick={handleClose}>
                    No
                  </Button>
                </> }
            </Modal.Footer>
          </Modal>
          </div>
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
                character={playerId === key ? "character you" : "character"}
                latestChat={latestChat}
                playerId={player.id}
              />
            );
          })}
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

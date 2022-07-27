import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously } from "firebase/auth";
import {
  getDatabase,
  ref,
  set,
  onDisconnect,
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
import PokeballSpawn from "./components/PokeballSpawn";
import CreateName from "./components/CreateName";
import GetCoordinates from "./components/GetCoordinates";
import RenderPokeball from "./components/RenderPokeball";
import RenderPlayer from "./components/RenderPlayer";
import RandomFromArray from "./components/RandomFromArray";


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
    const allPokeballsRef = ref(database, `pokeballs`);
    const allChatRef = query(ref(database, `chat`), limitToLast(10));

    onValue(allPlayersRef, (snapshot) => {
      setPlayers(snapshot.val());
    });
    onValue(allPokeballsRef, (snapshot) => {
      setPokeballs(snapshot.val());
    });
    onValue(allChatRef, (snapshot) => {
      setChat(snapshot.val());
    });
    PokeballSpawn();
  }

  useEffect(() => {
    auth.onAuthStateChanged((user) => {
      if (user) {
        // logged in

        setPlayerId(user.uid);

        const player = ref(database, `players/${user.uid}`);
        setPlayerRef(player)

        get(player).then((snapshot) => {
          const playerData = snapshot.val() || {};

          set(player, {
            id: user.uid,
            name: playerData.name || CreateName(),
            direction: playerData.direction || "right",
            pokemon: playerData.pokemon || "1",
            x: playerData.x || 3,
            y: playerData.y || 5,
            pokeballs: playerData.pokeballs || 0,
            loggedIn: true,
            DigitalCrafts: playerData.DigitalCrafts || false,
            skins: playerData.skins || {1:true}
          });
          setSkins(playerData.skins);
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
      GrabPokeball(players[playerId].x, players[playerId].y);
    };
    document.addEventListener("keydown", handleKeyPress);
    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, [players, playerRef, playerId]);

  const refer = useRef(null);

  //pokeball system
  const [pokeballs, setPokeballs] = useState({});

  function GrabPokeball(x, y) {
    const key = GetCoordinates(x, y);
    if (pokeballs[key]) {
      remove(ref(database, `pokeballs/${key}`));
      update(playerRef, {
        pokeballs: players[playerId].pokeballs + 1,
      });
      get(ref(database, `pokeballs`)).then((snapshot) => {
        const pokeballs = snapshot.val();
        if (Object.keys(pokeballs).length < 10) {
          PokeballSpawn();
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
          pokeballs: players[playerId].pokeballs + 1000,
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
  const [pokemon, setPokemon] = useState('');
  const [pokemonOwned, setPokemonOwned] = useState(false);
  const [disable, setDisable] = useState(false);

  const handleClose = () => {
    setShow(false);
    setShowStore(false);
  }

  const handleYes = () => {
    setShow(false);
    setShowStore(false);
    if (!Object.keys(players[playerId].skins).includes(pokemon)) {
      update(playerRef, {
        pokemon: pokemon,
        skins: {
          ...players[playerId].skins,
          [pokemon]: true,
        },
        pokeballs: players[playerId].pokeballs - price,
      });
      setSkins(players[playerId].skins);
    } else {
      update(playerRef, {
        pokemon: pokemon,
      });
    }
  };
  
  //render skins
  function Skins(props) {
    const { pokemon, owned } = props;
    const handleShow = () => {
      setShow(true);
      setPokemon(pokemon);
      setPokemonOwned(players[playerId].skins[pokemon]);
    };

    return (
      <>
        <img
          className={"skin " + owned}
          onClick={handleShow}
          src={`/pokemon/${pokemon}.png`} 
          alt={pokemon}
        ></img>
      </>
    );
  }
  
  const common = [
    "1",
    "4",
    "7",
    "10",
    "13",
    "16",
    "19",
    "21",
    "23",
    "25",
    "27",
    "29",
    "32",
    "35",
    "37",
    "39",
    "41",
    "43",
    "46",
    "48",
    "50",
    "52",
    "54",
    "56",
    "58",
    "60",
    "63",
    "66",
    "69",
    "72",
    "74",
    "77",
    "79",
    "81",
    "84",
    "86",
    "88",
    "90",
    "92",
    "96",
    "98",
    "100",
    "102",
    "104",
    "109",
    "111",
    "116",
    "118",
    "120",
    "129",
    "147"
]
const uncommon = [
  "2",
  "5",
  "8",
  "14",
  "17",
  "20",
  "22",
  "24",
  "26",
  "28",
  "30",
  "33",
  "36",
  "38",
  "40",
  "42",
  "44",
  "47",
  "49",
  "51",
  "53",
  "55",
  "57",
  "59",
  "61",
  "64",
  "67",
  "70",
  "73",
  "75",
  "78",
  "80",
  "82",
  "85",
  "87",
  "89",
  "91",
  "93",
  "95",
  "97",
  "99",
  "101",
  "103",
  "105",
  "108",
  "110",
  "112",
  "117",
  "119",
  "121",
  "130",
  "133",
  "138",
  "140",
  "148"
]
const rare = [
  "3",
  "6",
  "9",
  "12",
  "15",
  "18",
  "31",
  "34",
  "45",
  "62",
  "65",
  "68",
  "71",
  "83",
  "94",
  "106",
  "107",
  "113",
  "114",
  "115",
  "122",
  "123",
  "124",
  "125",
  "126",
  "127",
  "128",
  "131",
  "132",
  "134",
  "135",
  "136",
  "137",
  "139",
  "141",
  "142",
  "143",
  "149",
]
const legendary = [
  "144",
  "145",
  "146",
  "150",
  "151",
]
  const [store, setStore] = useState([])
  useEffect(() => {
    function GenerateStore() {
      let set = new Set()
      let RNG = Math.random() * (100 - 1) + 1
      while (set.size < 5) {
          if(RNG > 1 && RNG <= 10) {
              set.add(RandomFromArray(rare))
          }
          else if(RNG > 10 && RNG <= 55) {
              set.add(RandomFromArray(uncommon))
          }
          else if(RNG > 55 && RNG <= 100) {
              set.add(RandomFromArray(common))
          }
          else {
              set.add(RandomFromArray(legendary))
          }
      }
      return set
    }
    const newStore = GenerateStore()
    setStore(newStore)
  }, []);

  const [price, setPrice] = useState('')

  function Store(props) {
    const { pokemon } = props;

    const handleStore = () => {
      setShowStore(true);
      setPokemon(pokemon);
      setPokemonOwned(players[playerId].skins[pokemon]);
      if (common.includes(pokemon)) {
        setPrice(100)
      }
      else if ((uncommon.includes(pokemon))) {
        setPrice(500)
      }
      else if ((rare.includes(pokemon))) {
        setPrice(1000)
      }
      else if ((legendary.includes(pokemon))) {
        setPrice(25000)
      }
      if (
        !Object.keys(players[playerId].skins).includes(pokemon) &&
        players[playerId].pokeballs < price
      ) {
        setDisable(true);
      }
      else {
        setDisable(false)
      }

    }
    return (
      <>
        <img
          className="skin"
          src={`/pokemon/${pokemon}.png`} 
          onClick={handleStore} 
          alt={pokemon} >
        </img>
      </>
    );
  }
  useEffect(() => {
    setSkins(players?.[playerId]?.skins);
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
            PC Box
          </h4>
          <div className="skins">
          {skins &&
            Object.entries(skins ?? {}).map(([key, skin]) => {
              return (
                <div key={key}>
                  <Skins pokemon={key} owned={skin} />
                </div>
              );
            })}
          <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
              <Modal.Title>Switch Pokemon?</Modal.Title>
            </Modal.Header>
            <Modal.Body>Would you like to switch to this Pokemon?</Modal.Body>
            <Modal.Footer>
              {pokemonOwned ? (
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
                  You do not own this Pokemon!
                </Button>
              )}
            </Modal.Footer>
          </Modal>
          </div>
        </div>
        <div className="store-ui">
          <h4>
            PokeMart
          </h4>
          <div className="store">
          {
            [...store]?.map(item => {
              return (
                <div>
                  <Store pokemon={item} />
                </div>
              );
            })}
          <Modal show={showStore} onHide={handleClose}>
            <Modal.Header closeButton>
              <Modal.Title>Buy Pokemon?</Modal.Title>
            </Modal.Header>
            <Modal.Body><Store pokemon={pokemon} /> Would you like to buy this Pokemon for {price} pokeballs?</Modal.Body>
            <Modal.Footer>
              {pokemonOwned ? (
<Button variant="danger" onClick={handleClose}>
              You already own this Pokemon!
            </Button>
              ) : disable ? (
                <Button variant="danger" onClick={handleClose}>
                  You do not have enough pokeballs!
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
                pokeballs={player.pokeballs}
                pokemon={player.pokemon}
                direction={player.direction}
                left={16 * player.x + "px"}
                top={16 * player.y - 14 + "px"}
                character={playerId === key ? "character you" : "character"}
                latestChat={latestChat}
                playerId={player.id}
              />
            );
          })}
        {Object.entries(pokeballs ?? {}).map(([key, pokeball]) => {
          return (
            <RenderPokeball
              key={pokeball.x + "x" + pokeball.y}
              left={16 * pokeball.x + "px"}
              top={16 * pokeball.y - 4 + "px"}
            />
          );
        })}
      </div>
    </div>
  );
}

export default App;

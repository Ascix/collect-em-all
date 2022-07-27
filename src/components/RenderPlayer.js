import { useEffect, useRef, useState } from 'react'
import './RenderPlayer.css'

function RenderPlayer(props) {
    const { name, pokeballs, direction, left, top, character, playerId, latestChat, pokemon } = props
    const [chatBubble, setChatBubble] = useState(null)
    const timeout = useRef()

    useEffect(() => {
      if (latestChat?.player === playerId) {
        clearTimeout(timeout.current)
        setChatBubble(latestChat)
        timeout.current = setTimeout(() => setChatBubble(null), 3000)
      }
    },[latestChat, playerId])
    return (
        <div className={character} style={{ transform: `translate3d(${left},${top},0)` }}>
          <div className="character-shadow grid-cell"></div>
          <div className="character-sprite grid-cell" direction={direction} style={{ backgroundImage: `url(/pokemon/${pokemon}.png)` }}></div>
          <div className="character-name-container">
            <span className="character-name">{name}</span>
            <span className="character-pokeballs">{pokeballs}</span>
          </div>
          <div className={chatBubble ? "on" : "off"}>
          {chatBubble?.message}
          </div>
        </div>
    )
}

export default RenderPlayer
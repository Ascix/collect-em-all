import './RenderPlayer.css'

function RenderPlayer(props) {
    const { name, coins, color, direction, left, top, character } = props
    return (
        <div className={character} style={{ transform: `translate3d(${left},${top},0)` }}>
          <div className="character-shadow grid-cell"></div>
          <div className="character-sprite grid-cell" color={color} direction={direction}></div>
          <div className="character-name-container">
            <span className="character-name" >{name}</span>
            <span className="character-coins">{coins}</span>
          </div>
        </div>
    )
}

export default RenderPlayer
import './RenderPlayer.css'

function RenderPlayer(props) {
    const { name, coins, color, direction, left, top, you } = props
    return (
        <div className="Character" style={{ transform: `translate3d(${left},${top},0)` }}>
          <div className="Character_shadow grid-cell"></div>
          <div className="Character_sprite grid-cell"  color={color} direction={direction}></div>
          <div className="Character_name-container">
            <span className="Character_name" >{name}</span>
            <span className="Character_coins">{coins}</span>
          </div>
        </div>
    )
}

export default RenderPlayer
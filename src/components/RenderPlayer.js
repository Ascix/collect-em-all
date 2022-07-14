
function RenderPlayer(props) {
    const { name, coins, color, direction } = props
    return (
        <>
        <div class="Character_shadow grid-cell"></div>
        <div class="Character_sprite grid-cell" color={color} direction={direction}></div>
        <div class="Character_name-container">
          <span class="Character_name">{name}</span>
          <span class="Character_coins">{coins}</span>
        </div>
        </>
    )
}

export default RenderPlayer
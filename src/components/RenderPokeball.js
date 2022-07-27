import './RenderPokeball.css'

function RenderPokeball(props) {
    const { left, top } = props
    return (
        <div className="pokeball grid-cell" style={{ left:left, top:top }}>
            <div className="pokeball-shadow grid-cell"></div>
            <div className="pokeball-sprite grid-cell"></div>
        </div>
    )
}

export default RenderPokeball
import './RenderCoin.css'

function RenderCoin(props) {
    const { left, top } = props
    return (
        <div className="coin grid-cell" style={{ left:left, top:top }}>
            <div className="coin-shadow grid-cell"></div>
            <div className="coin-sprite grid-cell"></div>
        </div>
    )
}

export default RenderCoin
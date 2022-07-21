import "./Skins.css"

function Skins(props) {
    const { color, owned } = props
    return(
            <button className="skin" color={color} owned={owned}></button>
    )
    
}

export default Skins
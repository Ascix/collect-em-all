import "./ChatMessage.css"

function ChatMessage(props) {
    const { name, message } = props
    return (
        <div className="message">
            {name} : {message}
        </div>
    )
}

export default ChatMessage
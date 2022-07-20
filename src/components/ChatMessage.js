

function ChatMessage(props) {
    const { name, message } = props
    return (
        <div>
            {name}: {message}
        </div>
    )
}

export default ChatMessage
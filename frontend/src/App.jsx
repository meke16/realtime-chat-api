import { useEffect, useState } from 'react';
import echo from './lib/echo';

function App() {
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        console.log("Listening for messages...");
        
        const channel = echo.channel('chat');

        // Option A: Explicit name with dot
        channel.listen('.message.sent', (e) => {
            console.log('Caught via .message.sent:', e);
            setMessages((prev) => [...prev, e.message]);
        });

        // Option B: Standard name (if broadcastAs failed)
        channel.listen('MessageSent', (e) => {
            console.log('Caught via MessageSent:', e);
            setMessages((prev) => [...prev, e.message]);
        });

        return () => echo.leaveChannel('chat');
}, []);

    return (
        <div style={{ padding: '20px' }}>
            <h1>Real-time Chat</h1>
            <ul>
                {messages.map((msg, index) => (
                    <li key={index}>
                        <strong>{msg.user.name}:</strong> {msg.body}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default App;
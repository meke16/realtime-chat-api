import { useEffect, useState } from 'react';
import echo from './lib/echo';

function App() {
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        // Listen to the public channel 'chat'
        const channel = echo.channel('chat')
            .listen('MessageSent', (e) => {
                console.log('New message received:', e.message);
                setMessages((prev) => [...prev, e.message]);
            });

        return () => {
            channel.stopListening('MessageSent');
        };
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
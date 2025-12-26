import { useEffect, useState } from 'react';
import echo from '../lib/echo';
import { sendMessage, getToken } from '../lib/api';
import { getUsers, ping, getConversationMessages, sendDirectMessage } from '../lib/api';

function isOnline(last_seen_at) {
  if (!last_seen_at) return false;
  const diff = Date.now() - new Date(last_seen_at).getTime();
  return diff < 60_000; // 60s
}

export default function Dashboard({ user }) {
  const [users, setUsers] = useState([]);
  const [activeUser, setActiveUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [body, setBody] = useState('');
  const [, setError] = useState('');

  // Heartbeat for presence
  useEffect(() => {
    const t = setInterval(() => {
      if (getToken()) ping().catch(() => {});
    }, 15_000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    async function loadUsers() {
      try {
        const list = await getUsers();
        setUsers(list.filter(u => u.id !== user.id));
      } catch (e) { setError(e.message); }
    }
    loadUsers();
  }, [user.id]);

  useEffect(() => {
    const ch = echo.channel('chat');
    ch.listen('.message.sent', (e) => {
      if (!activeUser && !e.message.recipient_id) {
        setMessages(prev => prev.find(m => m.id === e.message.id) ? prev : [...prev, e.message]);
      }
    });
    return () => echo.leaveChannel('chat');
  }, [activeUser]);

  useEffect(() => {
    if (!activeUser) return;
    const a = Math.min(user.id, activeUser.id);
    const b = Math.max(user.id, activeUser.id);
    const ch = echo.channel(`chat.dm.${a}-${b}`);
    ch.listen('.message.sent', (e) => {
      setMessages(prev => prev.find(m => m.id === e.message.id) ? prev : [...prev, e.message]);
    });
    return () => echo.leaveChannel(`chat.dm.${a}-${b}`);
  }, [user.id, activeUser?.id]);

  async function selectUser(u) {
    setActiveUser(u);
    try {
      const data = await getConversationMessages(u.id);
      setMessages(data);
    } catch (e) { setError(e.message); }
  }

  async function onSend(e) {
    e.preventDefault();
    if (!body.trim()) return;
    try {
      if (activeUser) await sendDirectMessage(activeUser.id, body.trim());
      else await sendMessage(body.trim());
      setBody('');
    } catch (e) { setError(e.message); }
  }

  return (
    <div className="min-h-screen grid md:grid-cols-3 gap-4 p-4">
      <aside className="md:col-span-1 rounded-lg shadow bg-white/70 dark:bg-gray-800/70 p-3 backdrop-blur">
        <h2 className="text-lg font-medium mb-2">Users</h2>
        <ul className="space-y-1">
          {users.map(u => (
            <li key={u.id}>
              <button onClick={() => selectUser(u)} className={`w-full flex items-center justify-between px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 ${activeUser?.id===u.id?'bg-gray-100 dark:bg-gray-700':''}`}>
                <span>{u.name}</span>
                <span className={`inline-flex items-center text-xs ${isOnline(u.last_seen_at)?'text-green-600':'text-gray-400'}`}>{isOnline(u.last_seen_at)?'online':'offline'}</span>
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <main className="md:col-span-2 rounded-lg shadow bg-white/70 dark:bg-gray-800/70 backdrop-blur p-3 flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-medium">{activeUser ? `Chat with ${activeUser.name}` : 'Global chat'}</h2>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2">
          {messages.map((m) => (
            <div key={m.id} className="px-3 py-2 rounded-md bg-gray-100 dark:bg-gray-700">
              <div className="text-sm text-gray-600 dark:text-gray-300">{m.user?.name || 'Unknown'}</div>
              <div className="text-base">{m.body}</div>
            </div>
          ))}
        </div>

        <form onSubmit={onSend} className="flex gap-2 mt-3">
          <input className="flex-1 px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Type a message..." value={body} onChange={(e) => setBody(e.target.value)} />
          <button type="submit" className="inline-flex items-center px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700">Send</button>
        </form>
      </main>
    </div>
  );
}

import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

const echo = new Echo({
    broadcaster: 'reverb',
    key: 'xtg0qnd6k9gbfee6m3ui', // Hardcoded from your error log
    wsHost: '127.0.0.1',        // Use IP instead of localhost
    wsPort: 8080,
    forceTLS: false,            // This MUST be false
    enabledTransports: ['ws'],  // Disable wss completely
});

export default echo;
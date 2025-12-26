import { Link } from 'react-router-dom';

export default function App() {
    return (
        <div className="min-h-screen flex items-center justify-center p-6">
            <div className="w-full max-w-lg rounded-lg shadow p-6 bg-white/70 dark:bg-gray-800/70 backdrop-blur text-center">
                <h1 className="text-3xl font-semibold mb-3">Realtime Chat</h1>
                <p className="mb-6 text-gray-600 dark:text-gray-300">Sign up or log in to start chatting.</p>
                <div className="flex gap-3 justify-center">
                    <Link className="inline-flex items-center px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700" to="/signup">Create account</Link>
                    <Link className="inline-flex items-center px-4 py-2 rounded-md bg-gray-600 text-white hover:bg-gray-700" to="/login">Sign in</Link>
                </div>
            </div>
        </div>
    );
}


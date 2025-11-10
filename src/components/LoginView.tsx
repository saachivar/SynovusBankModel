import React, { useState, useEffect } from 'react';

interface LoginViewProps {
  onLogin: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [saveUsername, setSaveUsername] = useState(false);
    const [error, setError] = useState('');
    const [isLoggingIn, setIsLoggingIn] = useState(false);

    useEffect(() => {
        // This simulates checking local storage for a saved username on component mount.
        const saved = localStorage.getItem('synovus_saved_username');
        if (saved) {
            setUsername(saved);
            setSaveUsername(true);
        } else {
            setUsername('SynovusTracer'); // Default if nothing saved
            setSaveUsername(false);
        }
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoggingIn(true);

        // Simulate network delay
        setTimeout(() => {
            if (username === 'SynovusTracer' && password === '12345') {
                if (saveUsername) {
                    localStorage.setItem('synovus_saved_username', username);
                } else {
                    localStorage.removeItem('synovus_saved_username');
                }
                onLogin();
            } else {
                setError('Invalid username or password. Please try again.');
                setIsLoggingIn(false);
                setPassword('');
            }
        }, 1000);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-white font-sans">
            <div className="w-full max-w-sm p-8 space-y-8 bg-white rounded-lg">
                <div className="text-center">
                    <span className="text-synovus-red text-4xl font-bold font-serif tracking-widest">
                        SYNOVUS
                    </span>
                    <p className="mt-2 text-sm text-gray-600">My Synovus Digital Banking</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="username" className="sr-only">Username</label>
                        <input
                            id="username"
                            name="username"
                            type="text"
                            required
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="appearance-none rounded-md relative block w-full px-3 py-3 border border-gray-500 placeholder-gray-400 bg-synovus-dark-gray text-white focus:outline-none focus:ring-synovus-red focus:border-synovus-red focus:z-10 sm:text-sm"
                            placeholder="Username"
                        />
                    </div>
                    <div>
                         <label htmlFor="password" className="sr-only">Password</label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="appearance-none rounded-md relative block w-full px-3 py-3 border border-gray-500 placeholder-gray-400 bg-synovus-dark-gray text-white focus:outline-none focus:ring-synovus-red focus:border-synovus-red focus:z-10 sm:text-sm"
                            placeholder="Password"
                        />
                    </div>

                    {error && (
                        <p className="text-sm text-red-600 text-center">{error}</p>
                    )}

                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <input
                                id="save-username"
                                name="save-username"
                                type="checkbox"
                                checked={saveUsername}
                                onChange={(e) => setSaveUsername(e.target.checked)}
                                className="h-4 w-4 text-synovus-red focus:ring-synovus-red border-gray-300 rounded"
                            />
                            <label htmlFor="save-username" className="ml-2 block text-sm text-synovus-dark-gray">
                                Save Username
                            </label>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isLoggingIn}
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-synovus-red hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-gray-400"
                        >
                            {isLoggingIn ? 'Signing In...' : 'Sign In'}
                        </button>
                    </div>
                    <div className="text-center text-sm">
                        <a href="#" onClick={(e) => e.preventDefault()} className="font-medium text-synovus-cyan-button hover:text-cyan-600">
                            Forgot Username or Password?
                        </a>
                    </div>
                </form>
            </div>
        </div>
    );
};
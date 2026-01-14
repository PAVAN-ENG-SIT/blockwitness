import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GlassCard } from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { useGoogleLogin } from '@react-oauth/google';

export default function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        // TODO: Implement actual login logic here
        console.log('Login attempt:', formData);

        // Simulate API call
        setTimeout(() => {
            setLoading(false);

            // Simulate successful user data
            const mockUser = {
                id: '1',
                email: formData.email,
                name: formData.email.split('@')[0], // Extract name from email
                token: 'fake-jwt-token'
            };

            login(mockUser);
            navigate('/');
            console.log('Login successful');
        }, 1500);
    };

    const handleGoogleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                setLoading(true);
                // Fetch user info from Google
                const userInfo = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                    headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
                }).then(res => res.json());

                // Create a user object
                const user = {
                    id: userInfo.sub,
                    name: userInfo.name,
                    email: userInfo.email,
                    picture: userInfo.picture,
                    token: tokenResponse.access_token
                };

                login(user);
                navigate('/');
            } catch (err) {
                console.error("Google verify error:", err);
                setError("Failed to verify with Google");
            } finally {
                setLoading(false);
            }
        },
        onError: (error) => {
            console.error("Google Login Failed:", error);
            setError("Google Login Failed");
        }
    });

    return (
        <div className="flex items-center justify-center min-h-[80vh] px-4 animate-slide-up">
            <GlassCard className="w-full max-w-md p-8 relative overflow-hidden">
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 p-4 opacity-10 blur-xl">
                    <svg className="w-48 h-48 text-primary-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                    </svg>
                </div>

                <div className="relative z-10 animate-fade-in">
                    <div className="mb-8 text-center">
                        <h2 className="text-4xl font-extrabold gradient-text mb-2">Welcome</h2>
                        <p className="text-dark-300 font-medium">Sign in to report and verify incidents</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <Input
                            label="Email Address"
                            type="email"
                            name="email"
                            placeholder="you@example.com"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            icon={
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                </svg>
                            }
                        />

                        <Input
                            label="Password"
                            type="password"
                            name="password"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            icon={
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            }
                        />

                        {error && (
                            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
                                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {error}
                            </div>
                        )}

                        <div className="flex items-center justify-between text-sm">
                            <label className="flex items-center gap-2 text-dark-300 cursor-pointer hover:text-primary-400 transition-colors">
                                <input type="checkbox" className="rounded bg-dark-800 border-dark-600 text-primary-500 focus:ring-offset-dark-900 focus:ring-primary-500" />
                                Remember me
                            </label>
                            <Link to="/forgot-password" className="text-secondary-400 hover:text-secondary-300 transition-colors">
                                Forgot password?
                            </Link>
                        </div>

                        <Button type="submit" variant="primary" size="md" className="w-full" loading={loading}>
                            Sign In
                        </Button>
                    </form>

                    <div className="my-6 flex items-center gap-4">
                        <div className="h-px bg-dark-700 flex-1"></div>
                        <span className="text-dark-400 text-sm font-medium">OR</span>
                        <div className="h-px bg-dark-700 flex-1"></div>
                    </div>

                    <Button
                        type="button"
                        variant="ghost"
                        size="md"
                        className="w-full relative group"
                        onClick={handleGoogleLogin}
                    >
                        <div className="flex items-center justify-center gap-3">
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M23.766 12.2764C23.766 11.4607 23.6999 10.6406 23.5588 9.83807H12.24V14.4591H18.7217C18.4528 15.9494 17.5885 17.2678 16.323 18.1056V21.1039H20.19C22.4608 19.0139 23.766 15.9274 23.766 12.2764Z" fill="#4285F4" />
                                <path d="M12.24 24.0008C15.4766 24.0008 18.2059 22.9382 20.1945 21.1039L16.3275 18.1055C15.2517 18.8375 13.8627 19.252 12.2445 19.252C9.11388 19.252 6.45946 17.1399 5.50705 14.3003H1.5166V17.3912C3.55371 21.4434 7.7029 24.0008 12.24 24.0008Z" fill="#34A853" />
                                <path d="M5.50253 14.2998C5.00309 12.8097 5.00309 11.1958 5.50253 9.70575V6.61481H1.5166C-0.18551 10.0056 -0.18551 14.0004 1.5166 17.3912L5.50253 14.2998Z" fill="#FBBC05" />
                                <path d="M12.24 4.74966C13.9509 4.7232 15.6044 5.36697 16.8434 6.54867L20.2695 3.12262C18.1001 1.0855 15.2208 -0.0344664 12.24 0.000808666C7.7029 0.000808666 3.55371 2.55822 1.5166 6.61481L5.50253 9.70575C6.45064 6.86173 9.10947 4.74966 12.24 4.74966Z" fill="#EA4335" />
                            </svg>
                            <span>Continue with Google</span>
                        </div>
                    </Button>

                    <p className="mt-8 text-center text-dark-400">
                        Don't have an account?{' '}
                        <Link to="/signup" className="text-secondary-400 font-semibold hover:text-secondary-300 transition-colors underline-offset-4 hover:underline">
                            Create one now
                        </Link>
                    </p>
                </div>
            </GlassCard>
        </div>
    );
}

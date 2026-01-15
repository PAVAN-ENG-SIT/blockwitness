import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GlassCard } from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { useGoogleLogin } from '@react-oauth/google';

export default function Signup() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);
        // TODO: Implement actual signup logic here
        console.log('Signup attempt:', formData);

        // Simulate API call
        setTimeout(() => {
            setLoading(false);

            const mockUser = {
                id: '1',
                name: formData.name,
                email: formData.email,
                token: 'fake-jwt-token'
            };

            login(mockUser);
            navigate('/');
            console.log('Signup successful');
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

                login(user); // Automatically log them in after signup
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
        <div className="flex items-center justify-center min-h-[85vh] px-4 py-8 animate-slide-up">
            <GlassCard className="w-full max-w-md p-8 relative overflow-hidden">
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 p-4 opacity-10 blur-xl">
                    <svg className="w-48 h-48 text-secondary-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                </div>

                <div className="relative z-10 animate-fade-in">
                    <div className="mb-8 text-center">
                        <h2 className="text-4xl font-extrabold gradient-text mb-2">Create Account</h2>
                        <p className="text-dark-300 font-medium">Join the secure evidence network</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <Input
                            label="Full Name"
                            type="text"
                            name="name"
                            placeholder="your name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            icon={
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            }
                        />

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
                            placeholder="Min. 8 characters"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            minLength={8}
                            icon={
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            }
                        />

                        <Input
                            label="Confirm Password"
                            type="password"
                            name="confirmPassword"
                            placeholder="Retype password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                            icon={
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
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

                        <Button type="submit" variant="secondary" size="md" className="w-full" loading={loading}>
                            Create Account
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
                            <span>Sign up with Google</span>
                        </div>
                    </Button>

                    <p className="mt-8 text-center text-dark-400">
                        Already have an account?{' '}
                        <Link to="/login" className="text-secondary-400 font-semibold hover:text-secondary-300 transition-colors underline-offset-4 hover:underline">
                            Sign in
                        </Link>
                    </p>
                </div>
            </GlassCard>
        </div>
    );
}

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, User, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Login() {
    const [isLogin, setIsLogin] = useState(true);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login, signup } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isLogin) {
                await login(email, password);
            } else {
                await signup(name, email, password);
            }
            navigate('/');
        } catch (err) {
            setError(err.toString());
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#faf9f6',
            padding: '24px',
            color: '#3e2723'
        }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-panel"
                style={{
                    width: '100%',
                    maxWidth: '400px',
                    padding: '40px',
                    borderRadius: '24px',
                    border: '1px solid rgba(141, 110, 99, 0.2)',
                    background: 'white',
                    boxShadow: '0 10px 40px rgba(141, 110, 99, 0.1)'
                }}
            >
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(45deg, #8d6e63, #5d4037)', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                        <User size={24} />
                    </div>
                    <h1 style={{ fontSize: '28px', marginBottom: '8px', color: '#3e2723', fontWeight: 'bold' }}>
                        {isLogin ? 'Welcome Back' : 'Get Started'}
                    </h1>
                    <p style={{ color: '#8d6e63' }}>
                        {isLogin ? 'Sign in to manage your invoices' : 'Create your professional account'}
                    </p>
                </div>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        style={{
                            background: '#ffebee',
                            border: '1px solid #ef5350',
                            color: '#c62828',
                            padding: '12px',
                            borderRadius: '8px',
                            marginBottom: '24px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontSize: '14px'
                        }}
                    >
                        <AlertCircle size={16} />
                        {error}
                    </motion.div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <AnimatePresence mode='popLayout'>
                        {!isLogin && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                overflow="hidden"
                            >
                                <div style={{ position: 'relative' }}>
                                    <User size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#8d6e63' }} />
                                    <input
                                        type="text"
                                        placeholder="Full Name"
                                        className="input-field"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required={!isLogin}
                                        style={{
                                            paddingLeft: '48px',
                                            background: '#f5f5f5',
                                            border: '1px solid #e0e0e0',
                                            color: '#3e2723'
                                        }}
                                    />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div style={{ position: 'relative' }}>
                        <Mail size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#8d6e63' }} />
                        <input
                            type="email"
                            placeholder="Email Address"
                            className="input-field"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            style={{
                                paddingLeft: '48px',
                                background: '#f5f5f5',
                                border: '1px solid #e0e0e0',
                                color: '#3e2723'
                            }}
                        />
                    </div>

                    <div style={{ position: 'relative' }}>
                        <Lock size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#8d6e63' }} />
                        <input
                            type="password"
                            placeholder="Password"
                            className="input-field"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            style={{
                                paddingLeft: '48px',
                                background: '#f5f5f5',
                                border: '1px solid #e0e0e0',
                                color: '#3e2723'
                            }}
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn-primary"
                        disabled={loading}
                        style={{
                            justifyContent: 'center',
                            height: '48px',
                            fontSize: '16px',
                            marginTop: '8px',
                            background: 'linear-gradient(45deg, #8d6e63, #5d4037)',
                            border: 'none',
                            color: 'white'
                        }}
                    >
                        {loading ? 'Processing...' : (
                            <>
                                {isLogin ? 'Sign In' : 'Create Account'}
                                <ArrowRight size={18} style={{ marginLeft: '8px' }} />
                            </>
                        )}
                    </button>
                </form>

                <div style={{ marginTop: '32px', textAlign: 'center' }}>
                    <p style={{ fontSize: '14px', color: '#8d6e63' }}>
                        {isLogin ? "Don't have an account? " : "Already have an account? "}
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            style={{
                                color: '#5d4037',
                                background: 'none',
                                border: 'none',
                                padding: 0,
                                fontWeight: 'bold',
                                cursor: 'cursor'
                            }}
                        >
                            {isLogin ? 'Sign Up' : 'Log In'}
                        </button>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}

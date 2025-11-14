"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, signUp, getSession } from '@/lib/supabase';
import HFCBrandTitle from '@/components/HFCBrandTitle';

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Check if user is already logged in
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    const { session } = await getSession();
    if (session) {
      router.push('/dashboard');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      if (isLogin) {
        // Handle login
        const { data, error } = await signIn(email, password);
        
        if (error) {
          // Check for common error messages and provide helpful feedback
          if (error.message.includes('Email not confirmed')) {
            setError('Please verify your email address before logging in. Check your inbox for the confirmation link.');
          } else if (error.message.includes('Invalid login credentials')) {
            setError('Invalid email or password. If you just signed up, please check your email to confirm your account first.');
          } else {
            setError(error.message);
          }
        } else if (data.session) {
          // Successful login
          router.push('/dashboard');
        }
      } else {
        // Handle signup
        if (password !== confirmPassword) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }

        if (password.length < 6) {
          setError('Password must be at least 6 characters');
          setLoading(false);
          return;
        }

        const { data, error } = await signUp(email, password);
        
        if (error) {
          setError(error.message);
        } else {
          // Check if email confirmation is required
          if (data.user && !data.session) {
            setMessage('Account created! Please check your email and click the confirmation link before logging in.');
          } else if (data.session) {
            // If email confirmation is disabled, user is logged in immediately
            setMessage('Account created successfully! Redirecting...');
            setTimeout(() => router.push('/dashboard'), 1500);
          } else {
            setMessage('Account created successfully! You can now log in.');
          }
          setIsLogin(true);
          setPassword('');
          setConfirmPassword('');
        }
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ background: 'radial-gradient(ellipse at center, #4a7ba7 0%, #3a6a94 40%, #1e3d5a 100%)' }}>
      {/* No additional overlay needed - the radial gradient is the background */}
      
      <div className="relative z-10 w-full max-w-md px-6">
        {/* HFC Brand Title */}
        <div className="mb-8">
          <HFCBrandTitle size="xl" showSubtitle={true} />
          
          <p className="text-white/60 text-xs text-center mt-2">
            {isLogin ? 'Welcome back! Please sign in to continue.' : 'Create your account to get started.'}
          </p>
        </div>

        {/* Login/Signup Card */}
        <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/20">
          {/* Tab Switcher */}
          <div className="flex gap-2 mb-6 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => {
                setIsLogin(true);
                setError('');
                setMessage('');
              }}
              className={`flex-1 py-2.5 px-4 rounded-md font-semibold transition-all ${
                isLogin
                  ? 'bg-[#1e5a8e] text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setIsLogin(false);
                setError('');
                setMessage('');
              }}
              className={`flex-1 py-2.5 px-4 rounded-md font-semibold transition-all ${
                !isLogin
                  ? 'bg-[#1e5a8e] text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold mb-2 text-gray-700">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-[#1e5a8e] focus:ring-2 focus:ring-[#1e5a8e]/20 focus:outline-none transition"
                placeholder="you@example.com"
              />
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold mb-2 text-gray-700">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-[#1e5a8e] focus:ring-2 focus:ring-[#1e5a8e]/20 focus:outline-none transition"
                placeholder="••••••••"
              />
            </div>

            {/* Confirm Password (Sign Up only) */}
            {!isLogin && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-semibold mb-2 text-gray-700">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-[#1e5a8e] focus:ring-2 focus:ring-[#1e5a8e]/20 focus:outline-none transition"
                  placeholder="••••••••"
                />
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm font-medium">
                {error}
              </div>
            )}

            {/* Success Message */}
            {message && (
              <div className="bg-green-50 border-2 border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm font-medium">
                {message}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 px-4 rounded-lg font-bold text-white transition-all text-base ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-[#1e5a8e] hover:bg-[#164670] shadow-lg hover:shadow-xl active:scale-[0.98]'
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                isLogin ? 'Sign In' : 'Create Account'
              )}
            </button>
          </form>

          {/* Additional Options */}
          {isLogin && (
            <div className="mt-4 text-center">
              <a
                href="#"
                className="text-sm text-[#1e5a8e] hover:text-[#164670] font-medium transition"
                onClick={(e) => {
                  e.preventDefault();
                  setMessage('Password reset feature coming soon!');
                }}
              >
                Forgot your password?
              </a>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-xs text-white/50">
            © 2025 Health for California. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}

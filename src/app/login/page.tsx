'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') ?? '/';

  const [email, setEmail] = useState('');
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.replace(redirectTo);
      }
      setIsCheckingSession(false);
    });
  }, [router, redirectTo]);

  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      router.push(redirectTo);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingSession) {
    return (
      <div className="min-h-screen bg-[#F8F9FB] flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FB] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="rounded-3xl bg-white p-8 shadow-xl ring-1 ring-gray-200/50">
          <div className="mb-8 flex items-center justify-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-600 text-xl font-bold text-white">
              S
            </div>
            <span className="text-2xl font-bold text-gray-900">Selam Parking</span>
          </div>
          <h1 className="mb-2 text-center text-2xl font-bold text-gray-900">Admin Login</h1>
          <p className="mb-6 text-center text-sm text-gray-500">
            Sign in to manage parking zones and sessions
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                required
                autoComplete="email"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-xl bg-red-600 px-4 py-3 font-semibold text-white hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-gray-500">
            Customer parking at <a href="/user" className="text-red-600 hover:underline">/user</a>
          </p>
        
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F8F9FB] flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}

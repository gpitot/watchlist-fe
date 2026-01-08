import React, { useState } from "react";
import { supabase } from "api/database";
import { useNavigate } from "react-router-dom";

export const LoginForm: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleSocialLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
      });

      if (error) throw error;

      navigate("/");
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
      setIsLoading(false);
    }
  };

  const handleAnonymousLogin = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInAnonymously();

      if (error) throw error;

      navigate("/");
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-primary flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-accent shadow-primary-lg mb-4">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-text-primary mb-2">Watchlist</h1>
          <p className="text-text-tertiary">Track your movies and shows</p>
        </div>

        <div className="bg-surface backdrop-blur-xl border border-border-default rounded-2xl p-8 shadow-primary-lg">
          <h2 className="text-xl font-semibold text-text-primary mb-6 text-center">
            Sign in to continue
          </h2>

          {error && (
            <div className="mb-6 text-sm text-error-lighter bg-error/10 border border-error/20 p-3 rounded-xl">
              {error}
            </div>
          )}

          <button
            onClick={handleSocialLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white hover:bg-gray-100 text-slate-800 font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 48 48"
                className="w-5 h-5"
              >
                <path
                  fill="#EA4335"
                  d="M24 9.5c3.9 0 6.7 1.7 8.2 3.1l6-6C34.9 3 30.9 1.5 24 1.5 14 1.5 6.1 7.9 2.7 16.3l7.3 5.7C11.7 17 17.3 9.5 24 9.5z"
                />
                <path
                  fill="#4285F4"
                  d="M46.5 24.5c0-1.6-.1-2.8-.4-4.1H24v8h12.7c-.6 3-2.4 5.5-5 7.2l7.3 5.7c4.3-4 7-10 7-16.8z"
                />
                <path
                  fill="#FBBC05"
                  d="M10.5 28.5c-.5-1.5-.8-3-.8-4.5s.3-3 .8-4.5l-7.3-5.7C1.2 17.5 0 20.6 0 24s1.2 6.5 3.2 10.2l7.3-5.7z"
                />
                <path
                  fill="#34A853"
                  d="M24 47c6.5 0 12-2.1 16-5.7l-7.3-5.7c-2.2 1.5-5 2.4-8.7 2.4-6.7 0-12.4-4.5-14.4-10.5l-7.3 5.7C6.1 41.1 14 47 24 47z"
                />
              </svg>
            )}
            {isLoading ? "Signing in..." : "Continue with Google"}
          </button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border-default"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-surface text-text-tertiary">or</span>
            </div>
          </div>

          <button
            onClick={handleAnonymousLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-surface hover:bg-surface-hover text-text-primary font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-border-default"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-border-default border-t-text-primary rounded-full animate-spin" />
            ) : (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            )}
            Try without account
          </button>

          <p className="mt-6 text-center text-text-muted text-xs">
            By signing in, you agree to our terms of service
          </p>
        </div>
      </div>
    </div>
  );
};

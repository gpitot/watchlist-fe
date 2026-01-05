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

  return (
    <div
      className={`max-w-md mx-auto p-6 bg-slate-100 backdrop-blur-sm rounded-lg shadow-sm`}
    >
      <h2 className="text-2xl font-semibold mb-4">Sign in to Watchlist</h2>

      {error && (
        <div className="mb-4 text-sm text-red-400 bg-red-900/20 p-2 rounded">
          {error}
        </div>
      )}

      <button
        onClick={handleSocialLogin}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-3 px-4 py-2 bg-white text-slate-800 hover:bg-slate-200 disabled:opacity-60 rounded-md mb-4"
      >
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
            fill="#34A853"
            d="M46.5 24.5c0-1.6-.1-2.8-.4-4.1H24v8h12.7c-.6 3.4-2.8 6.1-6 8l7.3 5.7c4.3-4 7.5-9.9 7.5-16.6z"
          />
        </svg>
        {isLoading ? "Signing in…" : "Continue with Google"}
      </button>
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { Github, Mail, Loader } from 'lucide-react';

function SignIn() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [error, setError] = useState('');

  useEffect(() => {
    const handleAuthRedirect = async () => {
      const hash = window.location.hash;
      if (hash && hash.includes('access_token')) {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (session) {
          // Create profile for OAuth users if it doesn't exist
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (!profile) {
            const { error: profileError } = await supabase
              .from('profiles')
              .insert([
                {
                  id: session.user.id,
                  username: session.user.user_metadata.preferred_username || email.split('@')[0],
                  avatar_url: session.user.user_metadata.avatar_url,
                }
              ]);

            if (profileError) {
              console.error('Error creating profile:', profileError);
            }
          }
          navigate('/profile');
        }
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate('/profile');
      }
    });

    handleAuthRedirect();
  }, [navigate, email]);

  const handleGithubSignIn = async () => {
    try {
      setError('');
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) throw error;
    } catch (error) {
      console.error('Error signing in with GitHub:', error);
      setError('Failed to sign in with GitHub. Please try again.');
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let result;
      if (mode === 'signup') {
        result = await supabase.auth.signUp({
          email,
          password,
        });

        if (result.data.user) {
          // Create profile for email users
          const { error: profileError } = await supabase
            .from('profiles')
            .insert([
              {
                id: result.data.user.id,
                username: email.split('@')[0],
              }
            ]);

          if (profileError) {
            console.error('Error creating profile:', profileError);
          }
        }
      } else {
        result = await supabase.auth.signInWithPassword({
          email,
          password,
        });
      }

      if (result.error) {
        if (result.error.message === 'User already registered') {
          setError('An account with this email already exists. Please sign in instead.');
        } else if (result.error.message === 'Invalid login credentials') {
          setError('Invalid email or password. Please try again.');
        } else {
          throw result.error;
        }
        return;
      }
      
      if (mode === 'signup' && result.data.user && !result.data.session) {
        setError('Registration successful! Please check your email to confirm your account.');
      } else if (result.data.session) {
        navigate('/profile');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
          <p className="mt-2 text-gray-600">
            Sign in to join our creative community
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
            {error}
          </div>
        )}

        <div className="mt-8 space-y-6">
          <form onSubmit={handleEmailAuth} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? (
                <Loader className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Mail className="w-5 h-5 mr-2" />
                  {mode === 'signin' ? 'Sign in with Email' : 'Sign up with Email'}
                </>
              )}
            </button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          <button
            onClick={handleGithubSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
          >
            <Github className="w-5 h-5 mr-2" />
            Continue with GitHub
          </button>

          <div className="text-sm text-center">
            {mode === 'signin' ? (
              <p>
                Don't have an account?{' '}
                <button
                  onClick={() => {
                    setMode('signup');
                    setError('');
                  }}
                  className="font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Sign up
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <button
                  onClick={() => {
                    setMode('signin');
                    setError('');
                  }}
                  className="font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Sign in
                </button>
              </p>
            )}
          </div>

          <div className="text-xs text-center text-gray-600">
            By signing in, you agree to our{' '}
            <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
              Privacy Policy
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignIn;
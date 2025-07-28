import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  onAuthStateChanged, 
  signInWithRedirect, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut, 
  User as FirebaseUser 
} from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { createUser, getUserProfile } from '../lib/firestore';
import { handleRedirect } from '../lib/handleRedirect';

export const useAuth = () => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  // Listen for authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in
        setUser(firebaseUser);
        
        // Get or create user profile in Firestore
        try {
          const userProfile = await getUserProfile(firebaseUser.uid);
          if (!userProfile) {
            // Create new user profile
            await createUser(firebaseUser);
            const newProfile = await getUserProfile(firebaseUser.uid);
            setProfile(newProfile);
          } else {
            setProfile(userProfile);
          }
        } catch (error) {
          console.error('Error getting user profile:', error);
        }
      } else {
        // User is signed out
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    // Handle redirect result on page load
    handleRedirect().catch(console.error);

    return () => unsubscribe();
  }, []);

  const signInMutation = useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const result = await signInWithEmailAndPassword(auth, credentials.email, credentials.password);
      return result;
    },
    onError: (error: any) => {
      console.error('Sign in error:', error);
      if (error.code === 'auth/unauthorized-domain') {
        throw new Error(`Domain not authorized. Please add your domain to Firebase Console > Authentication > Settings > Authorized domains`);
      }
      throw error;
    }
  });

  const signUpMutation = useMutation({
    mutationFn: async (credentials: { email: string; password: string; displayName?: string }) => {
      const result = await createUserWithEmailAndPassword(auth, credentials.email, credentials.password);
      return result;
    },
    onError: (error: any) => {
      console.error('Sign up error:', error);
      throw error;
    }
  });

  const googleSignInMutation = useMutation({
    mutationFn: async () => {
      await signInWithRedirect(auth, googleProvider);
    },
    onError: (error: any) => {
      console.error('Google sign in error:', error);
      if (error.code === 'auth/unauthorized-domain') {
        throw new Error(`Domain not authorized. Please add your domain to Firebase Console > Authentication > Settings > Authorized domains`);
      }
      throw error;
    }
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await signOut(auth);
    },
    onSuccess: () => {
      setUser(null);
      setProfile(null);
      queryClient.clear();
    },
  });

  const signIn = async (credentials: { email: string; password: string }) => {
    return await signInMutation.mutateAsync(credentials);
  };

  const signUp = async (credentials: { email: string; password: string; displayName?: string }) => {
    return await signUpMutation.mutateAsync(credentials);
  };

  const signInWithGoogle = async () => {
    return await googleSignInMutation.mutateAsync();
  };

  const logout = async () => {
    await logoutMutation.mutateAsync();
  };

  return {
    user,
    profile,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    logout,
    isSigningIn: signInMutation.isPending,
    isSigningUp: signUpMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
    signInError: signInMutation.error,
    signUpError: signUpMutation.error,
  };
};
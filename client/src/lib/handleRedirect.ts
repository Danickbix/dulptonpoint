import { getAuth, getRedirectResult, GoogleAuthProvider } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "./firebase";

const auth = getAuth();

// Call this function on page load when the user is redirected back to your site
export async function handleRedirect() {
  try {
    const result = await getRedirectResult(auth);
    
    if (result) {
      // This gives you a Google Access Token. You can use it to access Google APIs.
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential?.accessToken;

      // The signed-in user info.
      const user = result.user;
      
      if (user) {
        // Create or update user document in Firestore
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        
        if (!userSnap.exists()) {
          // Create new user document
          await setDoc(userRef, {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || user.email?.split('@')[0] || 'User',
            photoURL: user.photoURL || '',
            createdAt: new Date(),
            lastLoginAt: new Date(),
            dulpBalance: 1000, // Welcome bonus
            totalEarned: 1000,
            referralCount: 0,
            loginStreak: 1,
            tasksCompleted: 0,
            level: 1,
            xp: 0,
            achievements: [],
            referralCode: generateReferralCode(),
          });
          
          // Create user stats document
          await setDoc(doc(db, 'userStats', user.uid), {
            userId: user.uid,
            xp: 0,
            level: 1,
            tasksCompleted: 0,
            gamesPlayed: 0,
            gamesWon: 0,
            totalEarnings: 1000,
            lastActiveAt: new Date(),
            achievements: [],
            streak: 1,
          });
        } else {
          // Update last login
          await setDoc(userRef, {
            lastLoginAt: new Date(),
          }, { merge: true });
        }
      }
      
      return { user, token };
    }
    
    return null;
  } catch (error) {
    console.error('Error handling redirect:', error);
    const errorCode = (error as any).code;
    const errorMessage = (error as any).message;
    
    // Handle specific errors
    if (errorCode === 'auth/unauthorized-domain') {
      throw new Error(`Domain not authorized. Please add your domain to Firebase Console > Authentication > Settings > Authorized domains`);
    }
    
    throw error;
  }
}

function generateReferralCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}
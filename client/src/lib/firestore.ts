import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs,
  addDoc,
  onSnapshot,
  Timestamp 
} from "firebase/firestore";
import { db } from "./firebase";
import { User } from "firebase/auth";

// User operations
export const createUser = async (user: User, additionalData: any = {}) => {
  const userRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userRef);
  
  if (!userSnap.exists()) {
    const userData = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || user.email?.split('@')[0] || 'User',
      photoURL: user.photoURL || '',
      createdAt: Timestamp.now(),
      lastLoginAt: Timestamp.now(),
      dulpBalance: 1000,
      totalEarned: 1000,
      referralCount: 0,
      loginStreak: 1,
      tasksCompleted: 0,
      level: 1,
      xp: 0,
      achievements: [],
      referralCode: generateReferralCode(),
      bio: '',
      username: '',
      avatar: '',
      ...additionalData
    };
    
    await setDoc(userRef, userData);
    
    // Create user stats
    await setDoc(doc(db, 'userStats', user.uid), {
      userId: user.uid,
      xp: 0,
      level: 1,
      tasksCompleted: 0,
      gamesPlayed: 0,
      gamesWon: 0,
      totalEarnings: 1000,
      lastActiveAt: Timestamp.now(),
      achievements: [],
      streak: 1,
    });
    
    return userData;
  }
  
  return userSnap.data();
};

export const getUserProfile = async (userId: string) => {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  return userSnap.exists() ? userSnap.data() : null;
};

export const updateUserProfile = async (userId: string, updates: any) => {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    ...updates,
    updatedAt: Timestamp.now()
  });
};

export const getUserStats = async (userId: string) => {
  const statsRef = doc(db, 'userStats', userId);
  const statsSnap = await getDoc(statsRef);
  return statsSnap.exists() ? statsSnap.data() : null;
};

export const updateUserStats = async (userId: string, updates: any) => {
  const statsRef = doc(db, 'userStats', userId);
  await updateDoc(statsRef, {
    ...updates,
    lastActiveAt: Timestamp.now()
  });
};

// Transaction operations
export const addTransaction = async (userId: string, transaction: any) => {
  const transactionData = {
    userId,
    ...transaction,
    createdAt: Timestamp.now()
  };
  
  await addDoc(collection(db, 'transactions'), transactionData);
  return transactionData;
};

export const getUserTransactions = async (userId: string, limitCount = 50) => {
  // Temporary: Remove orderBy to avoid composite index requirement
  // TODO: Create composite index for userId + createdAt in Firebase console
  const q = query(
    collection(db, 'transactions'),
    where('userId', '==', userId),
    limit(limitCount)
  );
  
  const querySnapshot = await getDocs(q);
  const transactions = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  
  // Sort in memory as temporary solution
  return transactions.sort((a: any, b: any) => {
    const aTime = a.createdAt?.toDate?.() || new Date(0);
    const bTime = b.createdAt?.toDate?.() || new Date(0);
    return bTime.getTime() - aTime.getTime();
  });
};

// Task operations
export const completeTask = async (userId: string, taskId: string, reward: number) => {
  
  // Add transaction
  await addTransaction(userId, {
    type: 'task_completion',
    amount: reward,
    description: `Completed task: ${taskId}`,
    taskId
  });
  
  // Update user balance and stats
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  
  if (userSnap.exists()) {
    const userData = userSnap.data();
    await updateDoc(userRef, {
      dulpBalance: (userData.dulpBalance || 0) + reward,
      totalEarned: (userData.totalEarned || 0) + reward,
      tasksCompleted: (userData.tasksCompleted || 0) + 1,
      xp: (userData.xp || 0) + Math.floor(reward / 10),
      lastActiveAt: Timestamp.now()
    });
  }
  
  // Update user stats
  const statsRef = doc(db, 'userStats', userId);
  const statsSnap = await getDoc(statsRef);
  
  if (statsSnap.exists()) {
    const statsData = statsSnap.data();
    await updateDoc(statsRef, {
      tasksCompleted: (statsData.tasksCompleted || 0) + 1,
      xp: (statsData.xp || 0) + Math.floor(reward / 10),
      totalEarnings: (statsData.totalEarnings || 0) + reward,
      lastActiveAt: Timestamp.now()
    });
  }
};

// Game operations
export const completeGame = async (userId: string, gameId: string, score: number, reward: number) => {
  // Add transaction
  await addTransaction(userId, {
    type: 'game_completion',
    amount: reward,
    description: `Completed game: ${gameId}`,
    gameId,
    score
  });
  
  // Update user balance and stats
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  
  if (userSnap.exists()) {
    const userData = userSnap.data();
    await updateDoc(userRef, {
      dulpBalance: (userData.dulpBalance || 0) + reward,
      totalEarned: (userData.totalEarned || 0) + reward,
      xp: (userData.xp || 0) + Math.floor(reward / 5),
      lastActiveAt: Timestamp.now()
    });
  }
  
  // Update user stats
  const statsRef = doc(db, 'userStats', userId);
  const statsSnap = await getDoc(statsRef);
  
  if (statsSnap.exists()) {
    const statsData = statsSnap.data();
    await updateDoc(statsRef, {
      gamesPlayed: (statsData.gamesPlayed || 0) + 1,
      gamesWon: (statsData.gamesWon || 0) + (score > 0 ? 1 : 0),
      xp: (statsData.xp || 0) + Math.floor(reward / 5),
      totalEarnings: (statsData.totalEarnings || 0) + reward,
      lastActiveAt: Timestamp.now()
    });
  }
  
  // Store game result
  await addDoc(collection(db, 'gameResults'), {
    userId,
    gameId,
    score,
    reward,
    completedAt: Timestamp.now()
  });
};

// Real-time subscriptions
export const subscribeToUserProfile = (userId: string, callback: (data: any) => void) => {
  const userRef = doc(db, 'users', userId);
  return onSnapshot(userRef, (doc) => {
    if (doc.exists()) {
      callback(doc.data());
    }
  });
};

export const subscribeToUserTransactions = (userId: string, callback: (data: any[]) => void) => {
  const q = query(
    collection(db, 'transactions'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(20)
  );
  
  return onSnapshot(q, (querySnapshot) => {
    const transactions = querySnapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    }));
    callback(transactions);
  });
};

// Utility functions
function generateReferralCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Leaderboard operations
export const getLeaderboard = async (gameId?: string, limitCount = 10) => {
  let q;
  
  if (gameId) {
    q = query(
      collection(db, 'gameResults'),
      where('gameId', '==', gameId),
      orderBy('score', 'desc'),
      limit(limitCount)
    );
  } else {
    q = query(
      collection(db, 'userStats'),
      orderBy('totalEarnings', 'desc'),
      limit(limitCount)
    );
  }
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};
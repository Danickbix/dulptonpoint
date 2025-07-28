import { useState, useEffect } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { collection, onSnapshot, addDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { MOCK_TASKS } from '../data/mockTasks';
import { Task } from '../types/task';

export const useTasks = (user: FirebaseUser | null) => {
  const [completingTasks, setCompletingTasks] = useState<Set<string>>(new Set());
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  // Load completed tasks from Firestore
  useEffect(() => {
    if (!user) {
      setCompletedTasks(new Set());
      return;
    }

    const loadCompletedTasks = async () => {
      try {
        const completedTasksQuery = query(
          collection(db, 'taskCompletions'),
          where('userId', '==', user.uid)
        );
        const snapshot = await getDocs(completedTasksQuery);
        const completed = new Set(snapshot.docs.map(doc => doc.data().taskId));
        setCompletedTasks(completed);
      } catch (error) {
        console.error('Error loading completed tasks:', error);
      }
    };

    loadCompletedTasks();
  }, [user]);

  // Mark task as completed
  const completeTask = async (taskId: string): Promise<boolean> => {
    if (!user || completedTasks.has(taskId) || completingTasks.has(taskId)) {
      return false;
    }

    setCompletingTasks(prev => new Set(prev).add(taskId));

    try {
      // Add task completion to Firestore
      await addDoc(collection(db, 'taskCompletions'), {
        taskId,
        userId: user.uid,
        completedAt: new Date(),
        verified: true,
        rewardClaimed: true
      });

      // Find the task to get reward amount
      const task = MOCK_TASKS.find(t => t.id === taskId);
      if (task) {
        // Add transaction for the reward
        await addDoc(collection(db, 'transactions'), {
          userId: user.uid,
          amount: task.reward,
          type: 'earn',
          description: `Completed task: ${task.title}`,
          createdAt: new Date()
        });

        // Update user balance (this would normally be done atomically)
        // For now, the useUserProfile hook will handle balance updates via transactions
      }

      setCompletedTasks(prev => new Set(prev).add(taskId));
      setCompletingTasks(prev => {
        const newSet = new Set(prev);
        newSet.delete(taskId);
        return newSet;
      });

      return true;
    } catch (error) {
      setCompletingTasks(prev => {
        const newSet = new Set(prev);
        newSet.delete(taskId);
        return newSet;
      });
      console.error('Error completing task:', error);
      return false;
    }
  };

  // Get available tasks for user
  const getAvailableTasks = () => {
    return MOCK_TASKS.filter((task: Task) => !completedTasks.has(task.id) && task.isActive);
  };

  // Check if task is currently being completed
  const isTaskCompleting = (taskId: string) => {
    return completingTasks.has(taskId);
  };

  // Get tasks by category
  const getTasksByCategory = (category: string) => {
    return getAvailableTasks().filter((task: Task) => task.category === category);
  };

  // Check if task is completed
  const isTaskCompleted = (taskId: string) => {
    return completedTasks.has(taskId);
  };

  // Get completed tasks count
  const completedTasksCount = completedTasks.size;

  return {
    tasks: getAvailableTasks(),
    loading,
    completeTask,
    isTaskCompleting,
    completedTasks,
    getTasksByCategory,
    isTaskCompleted,
    completedTasksCount
  };
};
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  query,
  where,
  getDocs,
  orderBy,
  serverTimestamp,
  Timestamp,
  onSnapshot,
  arrayUnion,
} from 'firebase/firestore';
import { db } from './firebase';

export interface WorkerResponse {
  workerId: string;
  workerName: string;
  timestamp: number; // Unix timestamp for easy sorting
}

export interface Job {
  id?: string;
  userId: string;
  service: string;
  description: string;
  status: 'pending' | 'matched' | 'assigned' | 'on_the_way' | 'arrived' | 'verified' | 'completed';
  workerId: string | null;
  workerName: string | null;
  verified: boolean;
  completed: boolean;
  rating: number | null;
  price: number | null;
  responses: WorkerResponse[];
  createdAt: any;
  assignedAt?: any;
  verifiedAt?: any;
  completedAt?: any;
}

export interface Issue {
  id?: string;
  jobId: string;
  userId: string;
  issueType: string;
  createdAt: any;
}

const JOBS_COLLECTION = 'jobs';
const ISSUES_COLLECTION = 'issues';

/**
 * Create a new job in Firestore.
 */
export const createJob = async (
  userId: string,
  service: string,
  description: string
): Promise<string> => {
  try {
    const jobData: Omit<Job, 'id'> = {
      userId,
      service,
      description,
      status: 'pending',
      workerId: null,
      workerName: null,
      verified: false,
      completed: false,
      rating: null,
      price: null,
      responses: [], // Initialize empty responses array
      createdAt: serverTimestamp(),
    };
    const docRef = await addDoc(collection(db, JOBS_COLLECTION), jobData);
    return docRef.id;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to create job');
  }
};

/**
 * Update a job document by ID.
 */
export const updateJob = async (
  jobId: string,
  updates: Partial<Job>
): Promise<void> => {
  try {
    const jobRef = doc(db, JOBS_COLLECTION, jobId);
    await updateDoc(jobRef, updates);
  } catch (error: any) {
    throw new Error(error.message || 'Failed to update job');
  }
};

/**
 * Subscribe to a specific job in real-time.
 * Returns an unsubscribe function.
 */
export const subscribeToJob = (
  jobId: string,
  callback: (job: Job | null) => void
) => {
  const jobRef = doc(db, JOBS_COLLECTION, jobId);
  return onSnapshot(
    jobRef,
    (docSnap) => {
      if (docSnap.exists()) {
        callback({ id: docSnap.id, ...docSnap.data() } as Job);
      } else {
        callback(null);
      }
    },
    (error) => {
      console.error('Error subscribing to job:', error);
    }
  );
};

/**
 * Add a simulated worker response to a job.
 */
export const addWorkerResponse = async (
  jobId: string,
  workerId: string,
  workerName: string
): Promise<void> => {
  try {
    const jobRef = doc(db, JOBS_COLLECTION, jobId);
    const newResponse: WorkerResponse = {
      workerId,
      workerName,
      timestamp: Date.now(),
    };
    await updateDoc(jobRef, {
      responses: arrayUnion(newResponse),
      status: 'matched', // Update status to matched when someone responds
    });
  } catch (error: any) {
    throw new Error(error.message || 'Failed to add worker response');
  }
};

/**
 * Get all jobs for a specific user, ordered by creation date.
 */
export const getUserJobs = async (userId: string): Promise<Job[]> => {
  try {
    const q = query(
      collection(db, JOBS_COLLECTION),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Job[];
  } catch (error: any) {
    throw new Error(error.message || 'Failed to fetch jobs');
  }
};

/**
 * Mark a job as verified (simulated QR scan).
 */
export const verifyJob = async (jobId: string): Promise<void> => {
  await updateJob(jobId, { 
    verified: true, 
    status: 'verified',
    verifiedAt: serverTimestamp(),
  });
};

/**
 * Complete a job with rating and price.
 */
export const completeJob = async (
  jobId: string,
  rating: number,
  price: number
): Promise<void> => {
  await updateJob(jobId, {
    completed: true,
    status: 'completed',
    rating,
    price,
    completedAt: serverTimestamp(),
  });
};

/**
 * Assign a worker to a job.
 */
export const assignWorker = async (
  jobId: string,
  workerId: string,
  workerName: string
): Promise<void> => {
  await updateJob(jobId, {
    status: 'assigned',
    workerId,
    workerName,
    assignedAt: serverTimestamp(),
  });
};

/**
 * Submit an issue report for a job.
 */
export const submitIssue = async (
  jobId: string,
  userId: string,
  issueType: string
): Promise<string> => {
  try {
    const issueData: Omit<Issue, 'id'> = {
      jobId,
      userId,
      issueType,
      createdAt: serverTimestamp(),
    };
    const docRef = await addDoc(collection(db, ISSUES_COLLECTION), issueData);
    return docRef.id;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to submit issue');
  }
};

/**
 * Mock worker templates for matching simulation.
 */
export const MOCK_WORKER_TEMPLATES = [
  { id: 'w1', name: 'Ravi Kumar', distance: '1.2 km', rating: 4.5, phone: '+919876543210' },
  { id: 'w2', name: 'Suresh Yadav', distance: '2.5 km', rating: 4.2, phone: '+919876543211' },
  { id: 'w3', name: 'Amit Singh', distance: '3.0 km', rating: 4.8, phone: '+919876543212' },
  { id: 'w4', name: 'Deepak Sharma', distance: '1.8 km', rating: 4.0, phone: '+919876543213' },
];

export const getWorkerDetails = (workerId: string) => {
  return MOCK_WORKER_TEMPLATES.find(w => w.id === workerId) || MOCK_WORKER_TEMPLATES[0];
};

import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs,
  updateDoc, 
  query, 
  where, 
  onSnapshot,
  serverTimestamp,
  Timestamp
} from "firebase/firestore";
import { db } from "../lib/firebase";

export interface Job {
  id?: string;
  userId: string;
  service: string;
  description: string;
  status: "pending" | "matched" | "assigned" | "on_the_way" | "arrived" | "completed" | "verified";
  workerId?: string;
  workerName?: string;
  workerRating?: number;
  responses?: any[];
  verified?: boolean;
  verifiedAt?: Timestamp | null;
  completed?: boolean;
  completedAt?: Timestamp | null;
  guaranteeEndsAt?: Timestamp | null;
  isReservice?: boolean;
  originalJobId?: string | null;
  createdAt: any;
}

// Create a new job
export const createJob = async (userId: string, service: string, description: string) => {
  try {
    const docRef = await addDoc(collection(db, "jobs"), {
      userId,
      service,
      description,
      status: "pending",
      responses: [],
      verified: false,
      verifiedAt: null,
      completed: false,
      completedAt: null,
      guaranteeEndsAt: null,
      isReservice: false,
      originalJobId: null,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error creating job:", error);
    throw error;
  }
};

// Listen to a specific job in real-time
export const subscribeToJob = (jobId: string, callback: (job: Job) => void) => {
  const jobRef = doc(db, "jobs", jobId);

  const unsubscribe = onSnapshot(jobRef, (docSnap) => {
    if (docSnap.exists()) {
      callback({ id: docSnap.id, ...docSnap.data() } as Job);
    }
  });

  return unsubscribe;
};

// Fetch user's jobs
export const getUserJobs = async (userId: string) => {
  try {
    const q = query(collection(db, "jobs"), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    
    const jobs: Job[] = [];
    querySnapshot.forEach((doc) => {
      jobs.push({ id: doc.id, ...doc.data() } as Job);
    });
    
    return jobs.sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds);
  } catch (error) {
    console.error("Error fetching user jobs:", error);
    throw error;
  }
};

// Update job status
export const updateJob = async (jobId: string, updates: Partial<Job>) => {
  try {
    const jobRef = doc(db, "jobs", jobId);
    await updateDoc(jobRef, updates);
  } catch (error) {
    console.error("Error updating job:", error);
    throw error;
  }
};

// Verify a job via QR scan
export const verifyJobByQR = async (jobId: string, scannedValue: string): Promise<boolean> => {
  if (scannedValue !== jobId) {
    return false;
  }

  try {
    const jobRef = doc(db, "jobs", jobId);
    const jobSnap = await getDoc(jobRef);

    if (!jobSnap.exists()) {
      throw new Error("Job not found");
    }

    await updateDoc(jobRef, {
      status: "verified",
      verified: true,
      verifiedAt: serverTimestamp(),
    });

    return true;
  } catch (error) {
    console.error("Error verifying job:", error);
    throw error;
  }
};

// Complete a job — sets completed flag and calculates 72-hour guarantee window
export const completeJob = async (jobId: string) => {
  try {
    const jobRef = doc(db, "jobs", jobId);
    const jobSnap = await getDoc(jobRef);

    if (!jobSnap.exists()) {
      throw new Error("Job not found");
    }

    const now = new Date();
    const guaranteeEnd = new Date(now.getTime() + 72 * 60 * 60 * 1000); // +72 hours

    await updateDoc(jobRef, {
      status: "completed",
      completed: true,
      completedAt: Timestamp.fromDate(now),
      guaranteeEndsAt: Timestamp.fromDate(guaranteeEnd),
    });
  } catch (error) {
    console.error("Error completing job:", error);
    throw error;
  }
};

// Create a re-service job linked to the original
export const createReserviceJob = async (
  originalJobId: string,
  userId: string,
  service: string,
  issueDescription: string
) => {
  try {
    const docRef = await addDoc(collection(db, "jobs"), {
      userId,
      service,
      description: issueDescription,
      status: "pending",
      responses: [],
      verified: false,
      verifiedAt: null,
      completed: false,
      completedAt: null,
      guaranteeEndsAt: null,
      isReservice: true,
      originalJobId,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error creating re-service job:", error);
    throw error;
  }
};

// Helper: calculate remaining guarantee time from a Timestamp
export const getGuaranteeRemaining = (guaranteeEndsAt: Timestamp | null | undefined): {
  expired: boolean;
  days: number;
  hours: number;
  minutes: number;
  label: string;
} => {
  if (!guaranteeEndsAt) {
    return { expired: true, days: 0, hours: 0, minutes: 0, label: "No guarantee" };
  }

  const now = Date.now();
  const endMs = guaranteeEndsAt.toMillis();
  const diff = endMs - now;

  if (diff <= 0) {
    return { expired: true, days: 0, hours: 0, minutes: 0, label: "Guarantee expired" };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  let label = "";
  if (days > 0) label += `${days}d `;
  if (hours > 0) label += `${hours}h `;
  if (minutes > 0 && days === 0) label += `${minutes}m`;
  label = label.trim() + " remaining";

  return { expired: false, days, hours, minutes, label };
};

// Simulate worker movement: assigned → on_the_way → arrived
export const simulateWorkerMovement = (jobId: string) => {
  const transitions: { status: Job["status"]; delayMs: number }[] = [
    { status: "on_the_way", delayMs: 5000 },
    { status: "arrived", delayMs: 12000 },
  ];

  const timers: NodeJS.Timeout[] = [];

  transitions.forEach(({ status, delayMs }) => {
    const timer = setTimeout(async () => {
      try {
        await updateJob(jobId, { status });
      } catch (err) {
        console.error(`Failed to transition to ${status}:`, err);
      }
    }, delayMs);
    timers.push(timer);
  });

  return () => timers.forEach(clearTimeout);
};

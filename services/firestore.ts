import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  getDocs,
  Timestamp,
  DocumentData
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { UserProfile, FoodLog, WeightRecord } from '../types';

// Collection names
const COLLECTIONS = {
  USERS: 'users',
  FOOD_LOGS: 'foodLogs',
  WEIGHT_RECORDS: 'weightRecords',
};

// ==================== User Profile ====================

/**
 * 獲取使用者個人檔案
 */
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const docRef = doc(db, COLLECTIONS.USERS, uid);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data() as UserProfile;
    }
    return null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
};

/**
 * 建立或更新使用者個人檔案
 */
export const saveUserProfile = async (uid: string, profile: UserProfile): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTIONS.USERS, uid);
    await setDoc(docRef, profile, { merge: true });
  } catch (error) {
    console.error('Error saving user profile:', error);
    throw error;
  }
};

/**
 * 刪除使用者個人檔案
 */
export const deleteUserProfile = async (uid: string): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTIONS.USERS, uid);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting user profile:', error);
    throw error;
  }
};

// ==================== Food Logs ====================

/**
 * 獲取使用者所有飲食記錄
 */
export const getFoodLogs = async (uid: string): Promise<FoodLog[]> => {
  try {
    const q = query(
      collection(db, COLLECTIONS.FOOD_LOGS),
      where('userId', '==', uid),
      orderBy('timestamp', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const logs: FoodLog[] = [];
    
    querySnapshot.forEach((doc) => {
      logs.push(doc.data() as FoodLog);
    });
    
    return logs;
  } catch (error) {
    console.error('Error getting food logs:', error);
    throw error;
  }
};

/**
 * 監聽使用者飲食記錄的即時變化
 */
export const subscribeFoodLogs = (
  uid: string, 
  callback: (logs: FoodLog[]) => void
): (() => void) => {
  const q = query(
    collection(db, COLLECTIONS.FOOD_LOGS),
    where('userId', '==', uid)
    // 暫時移除 orderBy，等 Firestore 索引建立完成後再加回
    // orderBy('timestamp', 'desc')
  );
  
  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const logs: FoodLog[] = [];
    querySnapshot.forEach((doc) => {
      logs.push(doc.data() as FoodLog);
    });
    // 在客戶端排序
    logs.sort((a, b) => b.timestamp - a.timestamp);
    callback(logs);
  }, (error) => {
    console.error('Error subscribing to food logs:', error);
  });
  
  return unsubscribe;
};

/**
 * 新增飲食記錄
 */
export const addFoodLog = async (uid: string, log: FoodLog): Promise<void> => {
  try {
    const logWithUserId = { ...log, userId: uid };
    console.log('Adding food log to Firestore:', { id: log.id, userId: uid });
    const docRef = doc(db, COLLECTIONS.FOOD_LOGS, log.id);
    await setDoc(docRef, logWithUserId);
    console.log('Food log added successfully:', log.id);
  } catch (error) {
    console.error('Error adding food log:', error);
    console.error('Failed log data:', { logId: log.id, userId: uid });
    throw error;
  }
};

/**
 * 更新飲食記錄
 */
export const updateFoodLog = async (uid: string, log: FoodLog): Promise<void> => {
  try {
    const logWithUserId = { ...log, userId: uid };
    const docRef = doc(db, COLLECTIONS.FOOD_LOGS, log.id);
    await updateDoc(docRef, { ...logWithUserId });
  } catch (error) {
    console.error('Error updating food log:', error);
    throw error;
  }
};

/**
 * 刪除飲食記錄
 */
export const deleteFoodLog = async (logId: string): Promise<void> => {
  try {
    console.log('Deleting food log from Firestore:', logId);
    const docRef = doc(db, COLLECTIONS.FOOD_LOGS, logId);
    await deleteDoc(docRef);
    console.log('Food log deleted successfully:', logId);
  } catch (error) {
    console.error('Error deleting food log:', error);
    console.error('Failed to delete log:', logId);
    throw error;
  }
};

// ==================== Weight Records ====================

/**
 * 獲取使用者所有體重記錄
 */
export const getWeightRecords = async (uid: string): Promise<WeightRecord[]> => {
  try {
    const q = query(
      collection(db, COLLECTIONS.WEIGHT_RECORDS),
      where('userId', '==', uid),
      orderBy('timestamp', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const records: WeightRecord[] = [];
    
    querySnapshot.forEach((doc) => {
      records.push(doc.data() as WeightRecord);
    });
    
    return records;
  } catch (error) {
    console.error('Error getting weight records:', error);
    throw error;
  }
};

/**
 * 監聽使用者體重記錄的即時變化
 */
export const subscribeWeightRecords = (
  uid: string, 
  callback: (records: WeightRecord[]) => void
): (() => void) => {
  const q = query(
    collection(db, COLLECTIONS.WEIGHT_RECORDS),
    where('userId', '==', uid)
    // 暫時移除 orderBy，等 Firestore 索引建立完成後再加回
    // orderBy('timestamp', 'desc')
  );
  
  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const records: WeightRecord[] = [];
    querySnapshot.forEach((doc) => {
      records.push(doc.data() as WeightRecord);
    });
    // 在客戶端排序
    records.sort((a, b) => b.timestamp - a.timestamp);
    callback(records);
  }, (error) => {
    console.error('Error subscribing to weight records:', error);
  });
  
  return unsubscribe;
};

/**
 * 新增體重記錄
 */
export const addWeightRecord = async (uid: string, record: WeightRecord): Promise<void> => {
  try {
    const recordWithUserId = { ...record, userId: uid };
    const docRef = doc(db, COLLECTIONS.WEIGHT_RECORDS, record.id);
    await setDoc(docRef, recordWithUserId);
  } catch (error) {
    console.error('Error adding weight record:', error);
    throw error;
  }
};

/**
 * 刪除體重記錄
 */
export const deleteWeightRecord = async (recordId: string): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTIONS.WEIGHT_RECORDS, recordId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting weight record:', error);
    throw error;
  }
};

// ==================== Migration ====================

/**
 * 從 localStorage 遷移資料到 Firestore
 */
export const migrateLocalStorageToFirestore = async (uid: string): Promise<void> => {
  try {
    // 檢查是否已經遷移過
    const userProfile = await getUserProfile(uid);
    if (userProfile) {
      console.log('User profile already exists in Firestore, skipping migration');
      return;
    }

    // 遷移 UserProfile
    const savedUser = localStorage.getItem('dietlog_user');
    if (savedUser) {
      const userProfile = JSON.parse(savedUser) as UserProfile;
      await saveUserProfile(uid, userProfile);
      console.log('Migrated user profile to Firestore');
    }

    // 遷移 FoodLogs
    const savedLogs = localStorage.getItem('dietlog_logs');
    if (savedLogs) {
      const logs = JSON.parse(savedLogs) as FoodLog[];
      for (const log of logs) {
        await addFoodLog(uid, log);
      }
      console.log(`Migrated ${logs.length} food logs to Firestore`);
    }

    // 遷移 WeightRecords
    const savedRecords = localStorage.getItem('dietlog_weight_records');
    if (savedRecords) {
      const records = JSON.parse(savedRecords) as WeightRecord[];
      for (const record of records) {
        await addWeightRecord(uid, record);
      }
      console.log(`Migrated ${records.length} weight records to Firestore`);
    }

    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Error during migration:', error);
    throw error;
  }
};

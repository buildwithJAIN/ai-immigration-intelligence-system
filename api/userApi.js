import { auth, db } from '../config/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

/**
 * Fetch current logged-in user's profile
 */
export const fetchUserProfile = async () => {
  try {
    const user = auth.currentUser;
    if (!user) return null;

    const userRef = doc(db, 'users', user.uid);
    const snapshot = await getDoc(userRef);

    if (!snapshot.exists()) return null;

    return {
      uid: user.uid,
      ...snapshot.data(),
    };
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};

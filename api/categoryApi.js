import { db } from '../config/firebaseConfig';
import { collection, getDocs, query, where } from 'firebase/firestore';

/**
 * Fetch all valid visa categories
 */
export const fetchCategories = async () => {
  try {
    const q = query(
      collection(db, 'categories'),
      where('valid', '==', true)
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
};

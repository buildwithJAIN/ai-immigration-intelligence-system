import { db } from '../config/firebaseConfig';
import { collection, getDocs, query, where } from 'firebase/firestore';

/**
 * Fetch all valid countries
 */
export const fetchCountries = async () => {
  try {
    const q = query(
      collection(db, 'countries'),
      where('validStatus', '==', true)
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error fetching countries:', error);
    return [];
  }
};

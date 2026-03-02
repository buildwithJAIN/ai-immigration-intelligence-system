import { db } from '../config/firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

/**
 * Submit visa generation request
 */
export const submitVisaRequest = async ({
  countryName,
  countryCode,
  category,
  language,
  requestedBy,
}) => {
  try {
    await addDoc(collection(db, 'visa_requests'), {
      countryName,
      countryCode,
      category,
      language,
      requestedBy: requestedBy || 'anonymous',
      status: 'PENDING',
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error submitting visa request:', error);
    throw error;
  }
};

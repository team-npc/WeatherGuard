import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs,
  deleteDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { User } from 'firebase/auth';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: any;
  updatedAt: any;
  preferences: {
    emergencyDetection: boolean;
    deviceShakeDetection: boolean;
    locationSharing: boolean;
    weatherAlerts: boolean;
    disasterWarnings: boolean;
    familySafetyUpdates: boolean;
    anonymousUsage: boolean;
  };
  emergencyContacts: EmergencyContact[];
  pinnedLocations: PinnedLocation[];
  lastLocation?: {
    latitude: number;
    longitude: number;
    timestamp: any;
  };
}

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  email?: string;
  relationship: string;
  isEmergency: boolean;
  createdAt: any;
}

export interface PinnedLocation {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  type: string;
  createdAt: any;
}

export interface EmergencyEvent {
  id: string;
  userId: string;
  trigger: string;
  level: string;
  location: {
    latitude: number;
    longitude: number;
  };
  timestamp: any;
  contactsNotified: number;
  resolved: boolean;
}

class UserService {
  // Create or update user profile
  async createUserProfile(user: User): Promise<void> {
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      const userProfile: UserProfile = {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || '',
        photoURL: user.photoURL || '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        preferences: {
          emergencyDetection: true,
          deviceShakeDetection: true,
          locationSharing: true,
          weatherAlerts: true,
          disasterWarnings: true,
          familySafetyUpdates: true,
          anonymousUsage: false,
        },
        emergencyContacts: [],
        pinnedLocations: [],
      };

      await setDoc(userRef, userProfile);
    } else {
      // Update existing user with any new fields
      await updateDoc(userRef, {
        updatedAt: serverTimestamp(),
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
      });
    }
  }

  // Get user profile
  async getUserProfile(uid: string): Promise<UserProfile | null> {
    try {
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        return userSnap.data() as UserProfile;
      }
      return null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }

  // Update user preferences
  async updateUserPreferences(uid: string, preferences: Partial<UserProfile['preferences']>): Promise<void> {
    try {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, {
        preferences,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating user preferences:', error);
      throw error;
    }
  }

  // Add emergency contact
  async addEmergencyContact(uid: string, contact: Omit<EmergencyContact, 'id' | 'createdAt'>): Promise<string> {
    try {
      const contactWithTimestamp = {
        ...contact,
        createdAt: serverTimestamp(),
      };

      const contactRef = await addDoc(collection(db, 'users', uid, 'emergencyContacts'), contactWithTimestamp);
      
      // Also update the user's profile
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const userData = userSnap.data() as UserProfile;
        const updatedContacts = [...(userData.emergencyContacts || []), { ...contactWithTimestamp, id: contactRef.id }];
        
        await updateDoc(userRef, {
          emergencyContacts: updatedContacts,
          updatedAt: serverTimestamp(),
        });
      }

      return contactRef.id;
    } catch (error) {
      console.error('Error adding emergency contact:', error);
      throw error;
    }
  }

  // Update emergency contact
  async updateEmergencyContact(uid: string, contactId: string, updates: Partial<EmergencyContact>): Promise<void> {
    try {
      const contactRef = doc(db, 'users', uid, 'emergencyContacts', contactId);
      await updateDoc(contactRef, updates);

      // Also update in user profile
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const userData = userSnap.data() as UserProfile;
        const updatedContacts = userData.emergencyContacts.map(contact => 
          contact.id === contactId ? { ...contact, ...updates } : contact
        );
        
        await updateDoc(userRef, {
          emergencyContacts: updatedContacts,
          updatedAt: serverTimestamp(),
        });
      }
    } catch (error) {
      console.error('Error updating emergency contact:', error);
      throw error;
    }
  }

  // Delete emergency contact
  async deleteEmergencyContact(uid: string, contactId: string): Promise<void> {
    try {
      const contactRef = doc(db, 'users', uid, 'emergencyContacts', contactId);
      await deleteDoc(contactRef);

      // Also remove from user profile
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const userData = userSnap.data() as UserProfile;
        const updatedContacts = userData.emergencyContacts.filter(contact => contact.id !== contactId);
        
        await updateDoc(userRef, {
          emergencyContacts: updatedContacts,
          updatedAt: serverTimestamp(),
        });
      }
    } catch (error) {
      console.error('Error deleting emergency contact:', error);
      throw error;
    }
  }

  // Add pinned location
  async addPinnedLocation(uid: string, location: Omit<PinnedLocation, 'id' | 'createdAt'>): Promise<string> {
    try {
      const locationWithTimestamp = {
        ...location,
        createdAt: serverTimestamp(),
      };

      const locationRef = await addDoc(collection(db, 'users', uid, 'pinnedLocations'), locationWithTimestamp);
      
      // Also update the user's profile
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const userData = userSnap.data() as UserProfile;
        const updatedLocations = [...(userData.pinnedLocations || []), { ...locationWithTimestamp, id: locationRef.id }];
        
        await updateDoc(userRef, {
          pinnedLocations: updatedLocations,
          updatedAt: serverTimestamp(),
        });
      }

      return locationRef.id;
    } catch (error) {
      console.error('Error adding pinned location:', error);
      throw error;
    }
  }

  // Delete pinned location
  async deletePinnedLocation(uid: string, locationId: string): Promise<void> {
    try {
      const locationRef = doc(db, 'users', uid, 'pinnedLocations', locationId);
      await deleteDoc(locationRef);

      // Also remove from user profile
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const userData = userSnap.data() as UserProfile;
        const updatedLocations = userData.pinnedLocations.filter(location => location.id !== locationId);
        
        await updateDoc(userRef, {
          pinnedLocations: updatedLocations,
          updatedAt: serverTimestamp(),
        });
      }
    } catch (error) {
      console.error('Error deleting pinned location:', error);
      throw error;
    }
  }

  // Log emergency event
  async logEmergencyEvent(event: Omit<EmergencyEvent, 'id' | 'timestamp'>): Promise<string> {
    try {
      const eventWithTimestamp = {
        ...event,
        timestamp: serverTimestamp(),
      };

      const eventRef = await addDoc(collection(db, 'emergencyEvents'), eventWithTimestamp);
      return eventRef.id;
    } catch (error) {
      console.error('Error logging emergency event:', error);
      throw error;
    }
  }

  // Update user location
  async updateUserLocation(uid: string, latitude: number, longitude: number): Promise<void> {
    try {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, {
        lastLocation: {
          latitude,
          longitude,
          timestamp: serverTimestamp(),
        },
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating user location:', error);
      throw error;
    }
  }
}

export const userService = new UserService();

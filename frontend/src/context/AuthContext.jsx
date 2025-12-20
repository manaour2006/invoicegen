import React, { createContext, useState, useEffect, useContext } from 'react';
import { auth, db } from '../services/firebase';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile as firebaseUpdateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                // Fetch full user profile from Firestore
                try {
                    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
                    const userData = userDoc.exists() ? userDoc.data() : {};

                    setUser({
                        uid: firebaseUser.uid,
                        email: firebaseUser.email,
                        name: userData.name || firebaseUser.displayName || '',
                        company: userData.company || '',
                        phone: userData.phone || '',
                        logo: userData.logo || null,
                        ...userData
                    });
                } catch (error) {
                    console.error('Error fetching user profile:', error);
                    setUser({
                        uid: firebaseUser.uid,
                        email: firebaseUser.email,
                        name: firebaseUser.displayName || '',
                        company: '',
                        phone: '',
                        logo: null
                    });
                }
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const login = (email, password) => {
        return signInWithEmailAndPassword(auth, email, password);
    };

    const signup = async (name, email, password) => {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        // Create user document in Firestore to store extra profile info
        await setDoc(doc(db, 'users', result.user.uid), {
            name,
            email,
            company: '',
            joined: new Date().toISOString()
        });
        // Update auth profile
        await firebaseUpdateProfile(result.user, { displayName: name });
        return result.user;
    };

    const logout = () => {
        return signOut(auth);
    };

    const updateProfile = async (data) => {
        if (!auth.currentUser) throw new Error('No user logged in');

        // Update Firestore doc
        const userRef = doc(db, 'users', auth.currentUser.uid);
        await setDoc(userRef, data, { merge: true });

        // Update local state if needed (or wait for real-time listener if we had one)
        setUser(prev => ({ ...prev, ...data }));
    };

    const value = {
        user,
        login,
        signup,
        logout,
        updateProfile,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}

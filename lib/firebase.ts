import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getDataConnect, DataConnect } from "firebase/data-connect";
import { getFirestore, Firestore } from "firebase/firestore";
import { connectorConfig } from "@dataconnect/generated";

// Firebase configuration for myportfolio-71cd3
const firebaseConfig = {
    apiKey: "AIzaSyBI1LhMG7z69IJC30X1TNFHeBI8TVqqhao",
    authDomain: "myportfolio-71cd3.firebaseapp.com",
    projectId: "myportfolio-71cd3",
    storageBucket: "myportfolio-71cd3.firebasestorage.app",
    messagingSenderId: "223383892295",
    appId: "1:223383892295:web:ff75ae25d50c72f8ac5c62",
    measurementId: "G-VVHD9T4LC3",
};

// Initialize Firebase (singleton pattern)
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let dataConnect: DataConnect;

function getFirebaseApp(): FirebaseApp {
    if (!app) {
        app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    }
    return app;
}

export function getFirebaseAuth(): Auth {
    if (!auth) {
        auth = getAuth(getFirebaseApp());
    }
    return auth;
}

export function getFirestoreDb(): Firestore {
    if (!db) {
        db = getFirestore(getFirebaseApp());
    }
    return db;
}

export function getDataConnectInstance(): DataConnect {
    if (!dataConnect) {
        dataConnect = getDataConnect(getFirebaseApp(), connectorConfig);
    }
    return dataConnect;
}

export { getFirebaseApp };


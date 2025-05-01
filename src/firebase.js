// firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyC_M_8waL_pXZQTg8t3IyxyVxtC7YM-ZWk",
    authDomain: "fs-dbms.firebaseapp.com",
    projectId: "fs-dbms",
    storageBucket: "fs-dbms.firebasestorage.app",
    messagingSenderId: "743452891191",
    appId: "1:743452891191:web:4eaa385be83b0c2b1407b2",
    measurementId: "G-S8QQE0QCKY"
  };


const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };

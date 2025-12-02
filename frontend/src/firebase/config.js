import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE",
  authDomain: "fnodatadashboardstreamlite.firebaseapp.com",
  projectId: "fnodatadashboardstreamlite",
  storageBucket: "fnodatadashboardstreamlite.appspot.com",
  messagingSenderId: "877238528573",
  appId: "YOUR_APP_ID_HERE",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();

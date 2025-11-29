import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.24.0/firebase-auth.js';
import { auth } from './firebaseConfig.js';

export function requireAuth(){
  onAuthStateChanged(auth, user => {
    if(!user) window.location.href = '/login/login.html';
  });
}

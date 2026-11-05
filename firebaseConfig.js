import { getApps, initializeApp } from 'firebase/app';
import { getAuth, RecaptchaVerifier } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyAQJ_Oyv7F5YMpiBuozrHWrPwSvhUv9alo',
  authDomain: 'optquiz-8daea.firebaseapp.com',
  projectId: 'optquiz-8daea',
  storageBucket: 'optquiz-8daea.firebasestorage.app',
  messagingSenderId: '244352339345',
  appId: '1:244352339345:web:4686571069e09a6dc69e30',
  measurementId: 'G-G06HMG7R8P',
};

const firebaseApp = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const firebaseAuth = getAuth(firebaseApp);
let recaptchaVerifier;

export function createPhoneRecaptcha() {
  if (typeof document === 'undefined') {
    throw new Error('Firebase SMS OTP is available in the web build. Use Demo Mode in Expo Go, or run the web build.');
  }

  if (recaptchaVerifier) {
    return recaptchaVerifier;
  }

  recaptchaVerifier = new RecaptchaVerifier(firebaseAuth, 'recaptcha-container', {
    size: 'invisible',
  });
  return recaptchaVerifier;
}

export function resetPhoneRecaptcha() {
  if (recaptchaVerifier) {
    recaptchaVerifier.clear();
    recaptchaVerifier = undefined;
  }
}

export { firebaseAuth };

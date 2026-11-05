# OTP Phone Verification App

This Expo app demonstrates an OTP phone verification flow for a mobile app. It supports:

- Phone number entry
- Requesting an OTP
- Entering the received code
- Verifying the OTP and showing success/failure
- Demo mode by default so the flow works immediately
- Optional live API mode when a backend endpoint is configured

## Run locally

1. Install dependencies:
   npm install
2. Start Expo:
   npx expo start
3. Open the app in Expo Go or an emulator.

## Real SMS integration

This project includes Firebase Phone Authentication with SMS OTP and reCAPTCHA protection.

### Firebase Phone Auth setup

1. Enable **Authentication → Sign-in method → Phone** in Firebase.
2. Run the web build with `npx expo start --web`.
3. Use a phone number in international format, such as `+923001234567`.
4. Firebase applies a reCAPTCHA challenge before sending the SMS.

Firebase's web Phone Auth flow requires a browser reCAPTCHA verifier. The app therefore uses Firebase live SMS in the web build and Demo Mode for Expo Go/native preview.

## Notes

- The default mode is `demo` so you can test the UI immediately without credentials.
- For a real SMS flow, do not expose API keys or secrets in the mobile app.
- Store secrets on a backend service or serverless function.

import React, { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { signInWithPhoneNumber } from 'firebase/auth';
import { createPhoneRecaptcha, firebaseAuth, resetPhoneRecaptcha } from './firebaseConfig';

const OTP_MODE = process.env.EXPO_PUBLIC_OTP_MODE || 'demo';

const generateOtp = () => String(Math.floor(100000 + Math.random() * 900000));

async function requestOtp(phoneNumber) {
  if (OTP_MODE === 'demo') {
    const otp = generateOtp();
    return {
      otp,
      verificationId: null,
      message: `Demo OTP sent to ${phoneNumber}. Use the code ${otp} to test verification.`,
    };
  }

  const verifier = createPhoneRecaptcha();
  const confirmationResult = await signInWithPhoneNumber(firebaseAuth, phoneNumber, verifier);
  return {
    confirmationResult,
    message: `OTP sent via SMS to ${phoneNumber}.`,
  };
}

export default function App() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [status, setStatus] = useState({
    type: 'info',
    message: 'Enter your phone number to receive an OTP.',
  });

  const appModeLabel = useMemo(() => {
    return OTP_MODE === 'demo' ? 'Demo Mode' : 'Live API Mode';
  }, []);

  const handleRequestOtp = async () => {
    const cleanedNumber = phoneNumber.replace(/\D/g, '');

    if (!cleanedNumber || cleanedNumber.length < 10) {
      setStatus({ type: 'error', message: 'Please enter a valid phone number with at least 10 digits.' });
      return;
    }

    setIsSending(true);
    setStatus({ type: 'info', message: 'Sending OTP...' });

    try {
      const result = await requestOtp(`+${cleanedNumber}`);
      setOtpCode(result.otp || '');
      setConfirmationResult(result.confirmationResult || null);
      setIsOtpSent(true);
      setStatus({ type: 'success', message: result.message });
    } catch (error) {
      resetPhoneRecaptcha();
      setIsOtpSent(false);
      setStatus({ type: 'error', message: error.message || 'Something went wrong while sending the OTP.' });
    } finally {
      setIsSending(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!isOtpSent) {
      setStatus({ type: 'error', message: 'Please request an OTP before verifying.' });
      return;
    }

    if (!otpInput.trim()) {
      setStatus({ type: 'error', message: 'Please enter the OTP you received.' });
      return;
    }

    setIsVerifying(true);

    try {
      if (OTP_MODE !== 'demo') {
        if (!confirmationResult) {
          throw new Error('Please request a new OTP before verifying.');
        }
        await confirmationResult.confirm(otpInput.trim());
        setStatus({ type: 'success', message: 'OTP verified successfully. Phone number verified.' });
      } else if (otpInput.trim() === (otpCode || '').trim()) {
        setStatus({ type: 'success', message: 'OTP verified successfully. Phone number verified.' });
      } else {
        setStatus({ type: 'error', message: 'Verification failed. The OTP is incorrect.' });
      }
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'OTP verification failed.' });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9ff" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.headerWrap}>
            <Text style={styles.title}>OTP Verification</Text>
            <Text style={styles.subtitle}>Secure phone number verification</Text>
          </View>

          <View style={styles.card}>
            <View nativeID="recaptcha-container" />
            <View style={styles.modeBadge}>
              <Text style={styles.modeText}>{appModeLabel}</Text>
            </View>

            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.input}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              placeholder="Enter your phone number"
              keyboardType="phone-pad"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <TouchableOpacity
              style={[styles.primaryButton, isSending && styles.disabledButton]}
              onPress={handleRequestOtp}
              disabled={isSending}
            >
              <Text style={styles.primaryButtonText}>{isSending ? 'Sending...' : 'Request OTP'}</Text>
            </TouchableOpacity>

            <Text style={styles.label}>OTP</Text>
            <TextInput
              style={styles.input}
              value={otpInput}
              onChangeText={setOtpInput}
              placeholder="Enter the 6-digit code"
              keyboardType="number-pad"
              maxLength={6}
              autoCapitalize="none"
              autoCorrect={false}
            />

            <TouchableOpacity
              style={[styles.secondaryButton, isVerifying && styles.disabledButton]}
              onPress={handleVerifyOtp}
              disabled={isVerifying}
            >
              <Text style={styles.secondaryButtonText}>{isVerifying ? 'Verifying...' : 'Verify OTP'}</Text>
            </TouchableOpacity>

            <View style={[styles.statusBox, status.type === 'error' ? styles.errorBox : styles.successBox]}>
              <Text style={[styles.statusText, status.type === 'error' ? styles.errorText : styles.successText]}>
                {status.message}
              </Text>
            </View>

            {OTP_MODE === 'demo' && isOtpSent && (
              <Text style={styles.demoHint}>Demo OTP: {otpCode || 'Generated'}</Text>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9ff',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  headerWrap: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: '#121a2a',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: '#5c6473',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 22,
    shadowColor: '#0b1020',
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  modeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#e8f0ff',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 18,
  },
  modeText: {
    color: '#2364d2',
    fontWeight: '700',
    fontSize: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1f2a3d',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#dfe7f5',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: '#f9fbff',
  },
  primaryButton: {
    backgroundColor: '#2563eb',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 18,
  },
  secondaryButton: {
    backgroundColor: '#0f172a',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 18,
  },
  disabledButton: {
    opacity: 0.7,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  statusBox: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginTop: 4,
  },
  successBox: {
    backgroundColor: '#eafaf2',
    borderColor: '#bfe8d2',
    borderWidth: 1,
  },
  errorBox: {
    backgroundColor: '#fff0f0',
    borderColor: '#f7c5c5',
    borderWidth: 1,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  successText: {
    color: '#166534',
  },
  errorText: {
    color: '#b42318',
  },
  demoHint: {
    marginTop: 12,
    fontSize: 12,
    color: '#4f46e5',
    fontWeight: '700',
    textAlign: 'center',
  },
});

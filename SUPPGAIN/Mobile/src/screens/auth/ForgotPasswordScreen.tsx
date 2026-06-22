import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, View } from 'react-native';

import { forgotPassword } from '../../api/authApi';
import { getApiErrorMessage } from '../../api/errors';
import { AppText, Button, Screen, TextInputField } from '../../components';
import type { AuthStackParamList } from '../../navigation/types';
import { colors, spacing } from '../../theme';

type Nav = NativeStackNavigationProp<AuthStackParamList>;

export function ForgotPasswordScreen() {
  const navigation = useNavigation<Nav>();
  const [email, setEmail] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSend() {
    if (!email.trim()) {
      setErrorMsg('E-posta adresi zorunludur.');
      return;
    }
    setIsSending(true);
    setErrorMsg(null);
    try {
      await forgotPassword(email.trim());
      setSent(true);
    } catch (err) {
      setErrorMsg(getApiErrorMessage(err));
    } finally {
      setIsSending(false);
    }
  }

  return (
    <Screen contentStyle={styles.screen}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.kav}>
        {/* Başlık */}
        <View style={styles.header}>
          <AppText variant="headline">Şifremi Unuttum</AppText>
          <AppText variant="bodyMuted" style={styles.sub}>
            Kayıtlı e-posta adresini gir, sıfırlama bağlantısı gönderelim.
          </AppText>
        </View>

        {sent ? (
          /* Başarı durumu */
          <View style={styles.successBox}>
            <AppText style={styles.successIcon}>✉</AppText>
            <AppText style={styles.successTitle}>Bağlantı Gönderildi</AppText>
            <AppText variant="bodyMuted" style={styles.successSub}>
              Eğer bu e-posta kayıtlıysa şifre yenileme bağlantısı gönderildi. Gelen kutunu ve
              spam klasörünü kontrol et.
            </AppText>
            <Button title="Giriş Sayfasına Dön" onPress={() => navigation.navigate('Login')} />
          </View>
        ) : (
          <>
            <TextInputField
              label="E-posta"
              leftAccessory="@"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="isim@ornek.com"
            />

            {errorMsg ? <AppText style={styles.errorText}>{errorMsg}</AppText> : null}

            <Button
              title={isSending ? 'Gönderiliyor...' : 'Bağlantı Gönder'}
              disabled={isSending}
              onPress={handleSend}
            />
          </>
        )}

        {/* Geri dön */}
        {!sent ? (
          <Pressable onPress={() => navigation.navigate('Login')} style={styles.backLink}>
            <AppText style={styles.backLinkText}>‹ Giriş sayfasına dön</AppText>
          </Pressable>
        ) : null}
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { justifyContent: 'center' },
  kav: { gap: spacing.md },
  header: { gap: spacing.xs, marginBottom: spacing.sm },
  sub: { lineHeight: 22 },
  errorText: { color: colors.danger, fontWeight: '600', textAlign: 'center' },
  successBox: { alignItems: 'center', gap: spacing.md, paddingVertical: spacing.lg },
  successIcon: { fontSize: 48 },
  successTitle: { color: colors.primary, fontSize: 20, fontWeight: '800' },
  successSub: { textAlign: 'center', lineHeight: 22 },
  backLink: { alignSelf: 'center', marginTop: spacing.sm },
  backLinkText: { color: colors.primary, fontWeight: '600', fontSize: 14 },
});

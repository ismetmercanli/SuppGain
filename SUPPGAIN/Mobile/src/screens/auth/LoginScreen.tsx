import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, View } from 'react-native';

import { getApiErrorMessage } from '../../api/errors';
import { AppText, BrandMark, Button, Card, Screen, TextInputField } from '../../components';
import { useAuth } from '../../context/AuthContext';
import { colors, spacing } from '../../theme';
import type { AuthStackParamList } from '../../navigation/types';

type LoginScreenProps = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export function LoginScreen({ navigation }: LoginScreenProps) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    if (!email.trim() || !password) {
      setErrorMessage('E-posta ve şifre alanlarını doldurmalısın.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await signIn({
        email: email.trim(),
        password,
      });
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Screen scroll contentStyle={styles.screen} keyboardShouldPersistTaps="handled">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <View style={styles.header}>
          <BrandMark />
          <AppText variant="headline">Tekrar Hoş Geldiniz</AppText>
          <AppText variant="bodyMuted" style={styles.subtitle}>
            Sağlık yolculuğunuza devam etmek için giriş yapın.
          </AppText>
        </View>

        <Card variant="premium" style={styles.card}>
          <TextInputField
            label="E-posta Adresi"
            leftAccessory="@"
            placeholder="isim@ornek.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            value={email}
            onChangeText={setEmail}
          />
          <TextInputField
            label="Şifre"
            leftAccessory="*"
            placeholder="••••••••"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          {errorMessage ? (
            <AppText style={styles.errorText}>{errorMessage}</AppText>
          ) : null}

          <Button
            title={isSubmitting ? 'Giriş yapılıyor...' : 'Giriş Yap'}
            variant="secondary"
            disabled={isSubmitting}
            onPress={handleSubmit}
          />
        </Card>

        <View style={styles.footer}>
          <Pressable onPress={() => navigation.navigate('ForgotPassword')} style={styles.forgotLink}>
            <AppText style={styles.forgotText}>Şifremi unuttum</AppText>
          </Pressable>
          <AppText variant="bodyMuted">Hesabınız yok mu?</AppText>
          <Button
            title="Kayıt Ol"
            variant="ghost"
            onPress={() => navigation.navigate('Register')}
          />
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    flexGrow: 1,
    justifyContent: 'center',
    gap: spacing.lg,
  },
  keyboardView: {
    gap: spacing.lg,
  },
  header: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  subtitle: {
    maxWidth: 300,
    textAlign: 'center',
  },
  card: {
    gap: spacing.md,
  },
  errorText: {
    color: colors.danger,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  forgotLink: { paddingVertical: 4 },
  forgotText: { color: colors.primary, fontWeight: '600', fontSize: 14 },
});

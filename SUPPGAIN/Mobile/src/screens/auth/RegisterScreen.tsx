import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';

import { getApiErrorMessage } from '../../api/errors';
import {
  AppText,
  BrandMark,
  Button,
  Card,
  Screen,
  TextInputField,
} from '../../components';
import { useAuth } from '../../context/AuthContext';
import { colors, spacing } from '../../theme';
import type { AuthStackParamList } from '../../navigation/types';

type RegisterScreenProps = NativeStackScreenProps<AuthStackParamList, 'Register'>;

export function RegisterScreen({ navigation }: RegisterScreenProps) {
  const { signUp } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password) {
      setErrorMessage('Ad, soyad, e-posta ve şifre alanları zorunlu.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await signUp({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        password,
        phone: phone.trim() || undefined,
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
          <AppText variant="headline">SuppGain’e Katıl</AppText>
          <AppText variant="bodyMuted" style={styles.subtitle}>
            Profilini oluştur, ürünleri keşfet ve haftalık programını takip et.
          </AppText>
        </View>

        <Card variant="premium" style={styles.card}>
          <View style={styles.nameRow}>
            <View style={styles.nameField}>
              <TextInputField
                label="Ad"
                placeholder="İsmet"
                value={firstName}
                onChangeText={setFirstName}
              />
            </View>
            <View style={styles.nameField}>
              <TextInputField
                label="Soyad"
                placeholder="Mercanlı"
                value={lastName}
                onChangeText={setLastName}
              />
            </View>
          </View>
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
            label="Telefon"
            leftAccessory="+"
            placeholder="05xx xxx xx xx"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
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
            title={isSubmitting ? 'Kayıt oluşturuluyor...' : 'Kayıt Ol'}
            disabled={isSubmitting}
            onPress={handleSubmit}
          />
        </Card>

        <View style={styles.footer}>
          <AppText variant="bodyMuted">Zaten hesabınız var mı?</AppText>
          <Button
            title="Giriş Yap"
            variant="ghost"
            onPress={() => navigation.navigate('Login')}
          />
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    flexGrow: 1,
    gap: spacing.lg,
  },
  keyboardView: {
    gap: spacing.lg,
  },
  header: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingTop: spacing.lg,
  },
  subtitle: {
    maxWidth: 300,
    textAlign: 'center',
  },
  card: {
    gap: spacing.md,
  },
  nameRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  nameField: {
    flex: 1,
  },
  errorText: {
    color: colors.danger,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    gap: spacing.sm,
  },
});

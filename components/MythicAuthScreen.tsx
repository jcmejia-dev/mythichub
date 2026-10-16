import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

type AuthMode = 'signIn' | 'signUp';

type Props = {
  mode: AuthMode;
  onChangeMode: (mode: AuthMode) => void;
  email: string;
  onChangeEmail: (email: string) => void;
  password: string;
  onChangePassword: (password: string) => void;
  name: string;
  onChangeName: (name: string) => void;
  busy: boolean;
  onSubmit: () => void;
};

const scene = require('../assets/images/mythichub-login-scene.jpg');
const emblem = require('../assets/images/mythichub-gold-logo.png');

const color = {
  ink: '#080C17',
  indigo: '#10162C',
  white: '#F6F7FF',
  gray: '#AAB8D7',
  gold: '#FFE0A3',
  violet: '#B874FF',
  cyan: '#19DDF2',
};

export default function MythicAuthScreen({
  mode,
  onChangeMode,
  email,
  onChangeEmail,
  password,
  onChangePassword,
  name,
  onChangeName,
  busy,
  onSubmit,
}: Props) {
  const { width, height } = useWindowDimensions();
  const desktop = width >= 840;
  const compact = width < 380;
  const [passwordVisible, setPasswordVisible] = useState(false);
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 2300,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 2300,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [pulse]);

  const formWidth = Math.min(width - (desktop ? 40 : 26), 492);
  const labelStyle = {
    color: color.gray,
    fontSize: 10,
    letterSpacing: 1.4,
    fontWeight: '800' as const,
    marginBottom: 8,
  };

  function AuthInput({
    icon,
    placeholder,
    value,
    onChange,
    secure = false,
    autoComplete,
    returnKeyType = 'next',
  }: {
    icon: React.ComponentProps<typeof Ionicons>['name'];
    placeholder: string;
    value: string;
    onChange: (value: string) => void;
    secure?: boolean;
    autoComplete?: 'email' | 'password' | 'new-password' | 'name';
    returnKeyType?: 'next' | 'go';
  }) {
    return (
      <View
        style={{
          minHeight: 54,
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 14,
          borderRadius: 10,
          borderWidth: 1,
          borderColor: '#425278',
          backgroundColor: '#151C33F2',
        }}
      >
        <Ionicons name={icon} size={20} color="#93A8CF" />
        <TextInput
          accessibilityLabel={placeholder}
          placeholder={placeholder}
          placeholderTextColor="#8190B0"
          value={value}
          onChangeText={onChange}
          keyboardType={autoComplete === 'email' ? 'email-address' : 'default'}
          autoComplete={autoComplete}
          autoCapitalize="none"
          autoCorrect={false}
          secureTextEntry={secure && !passwordVisible}
          returnKeyType={returnKeyType}
          onSubmitEditing={returnKeyType === 'go' ? onSubmit : undefined}
          style={{
            flex: 1,
            minWidth: 0,
            paddingHorizontal: 12,
            paddingVertical: 14,
            color: color.white,
            fontSize: 15,
          }}
        />
        {secure && (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={passwordVisible ? 'Hide password' : 'Show password'}
            onPress={() => setPasswordVisible((visible) => !visible)}
            hitSlop={10}
          >
            <Ionicons
              name={passwordVisible ? 'eye-off-outline' : 'eye-outline'}
              size={21}
              color="#9FAFD1"
            />
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: color.ink }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <ImageBackground
          source={scene}
          resizeMode="cover"
          style={{
            minHeight: Math.max(height, desktop ? 880 : 780),
            justifyContent: 'center',
            alignItems: 'center',
            overflow: 'hidden',
          }}
        >
          {/* Tint the artwork so the real, editable form takes priority. */}
          <LinearGradient
            pointerEvents="none"
            colors={['#050817B6', '#07091BD9', '#050714C9']}
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: 0,
              right: 0,
            }}
          />
          <LinearGradient
            pointerEvents="none"
            colors={['#AF3AFF55', '#06091708', '#08E9FF55']}
            start={{ x: 0, y: 0.48 }}
            end={{ x: 1, y: 0.55 }}
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: 0,
              right: 0,
              opacity: desktop ? 0.48 : 0.3,
            }}
          />

          <View
            style={{
              width: formWidth,
              alignSelf: 'center',
              paddingTop: desktop ? 36 : 25,
              paddingBottom: desktop ? 54 : 40,
            }}
          >
            <View style={{ alignItems: 'center' }}>
              <Animated.View
                style={{
                  alignItems: 'center',
                  transform: [
                    {
                      scale: pulse.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.985, 1.025],
                      }),
                    },
                  ],
                  opacity: pulse.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.92, 1],
                  }),
                }}
              >
                <Image
                  source={emblem}
                  resizeMode="contain"
                  accessibilityLabel="MythicHub gold and amethyst crest"
                  style={{
                    width: compact ? 220 : desktop ? 288 : 254,
                    height: compact ? 185 : desktop ? 240 : 212,
                  }}
                />
              </Animated.View>
            </View>

            <LinearGradient
              colors={['#9A44FF', '#5B50FF', '#19DDF2']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                borderRadius: 19,
                padding: 1.5,
                marginTop: -1,
                shadowColor: '#A64CFF',
                shadowOpacity: 0.4,
                shadowRadius: 24,
                shadowOffset: { width: 0, height: 8 },
                elevation: 16,
              }}
            >
              <View
                style={{
                  backgroundColor: '#0B1024F8',
                  borderRadius: 17,
                  paddingVertical: compact ? 22 : 28,
                  paddingHorizontal: compact ? 18 : desktop ? 32 : 24,
                }}
              >
                <View style={{ alignItems: 'center' }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 6,
                      marginBottom: 15,
                      borderWidth: 1,
                      borderColor: '#514078',
                      backgroundColor: '#35214B99',
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 20,
                    }}
                  >
                    <Ionicons name="game-controller-outline" size={13} color={color.gold} />
                    <Text
                      style={{
                        color: '#D6B8FF',
                        fontWeight: '800',
                        fontSize: 10,
                        letterSpacing: 1.5,
                      }}
                    >
                      THE GAMING LOUNGE
                    </Text>
                  </View>
                  <Text
                    style={{
                      color: color.white,
                      fontSize: compact ? 24 : desktop ? 32 : 28,
                      fontWeight: '900',
                      textAlign: 'center',
                      letterSpacing: -0.8,
                    }}
                  >
                    Your community.
                  </Text>
                  <Text
                    style={{
                      color: '#D493F8',
                      fontSize: compact ? 24 : desktop ? 32 : 28,
                      fontWeight: '900',
                      textAlign: 'center',
                      marginTop: 1,
                      letterSpacing: -0.8,
                    }}
                  >
                    Your collection.
                  </Text>
                  <Text
                    style={{
                      color: '#30D8FF',
                      fontSize: compact ? 24 : desktop ? 32 : 28,
                      fontWeight: '900',
                      textAlign: 'center',
                      marginTop: 1,
                      letterSpacing: -0.8,
                    }}
                  >
                    Your hub.
                  </Text>
                  <Text
                    style={{
                      color: color.gray,
                      textAlign: 'center',
                      fontSize: 12,
                      lineHeight: 19,
                      marginTop: 12,
                      marginBottom: 21,
                    }}
                  >
                    {mode === 'signIn'
                      ? 'Welcome back. Your player space awaits.'
                      : 'Create your own space in the gaming lounge.'}
                  </Text>
                </View>

                {mode === 'signUp' && (
                  <View style={{ marginBottom: 15 }}>
                    <Text style={labelStyle}>GAMER NAME</Text>
                    <AuthInput
                      icon="person-outline"
                      placeholder="Choose your display name"
                      value={name}
                      onChange={onChangeName}
                      autoComplete="name"
                    />
                  </View>
                )}

                <View style={{ marginBottom: 15 }}>
                  <Text style={labelStyle}>EMAIL ADDRESS</Text>
                  <AuthInput
                    icon="mail-outline"
                    placeholder="Email address"
                    value={email}
                    onChange={onChangeEmail}
                    autoComplete="email"
                  />
                </View>
                <View>
                  <Text style={labelStyle}>PASSWORD</Text>
                  <AuthInput
                    icon="lock-closed-outline"
                    placeholder={
                      mode === 'signUp' ? 'At least 8 characters' : 'Enter your password'
                    }
                    value={password}
                    onChange={onChangePassword}
                    autoComplete={mode === 'signUp' ? 'new-password' : 'password'}
                    secure
                    returnKeyType="go"
                  />
                </View>

                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityLabel={
                    mode === 'signIn' ? 'Sign in to MythicHub' : 'Create MythicHub account'
                  }
                  disabled={busy}
                  onPress={onSubmit}
                  style={{ marginTop: 23, opacity: busy ? 0.6 : 1 }}
                >
                  <LinearGradient
                    colors={['#993DFF', '#5A61FF', '#09DCE8']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{
                      minHeight: 56,
                      borderRadius: 11,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 10,
                      borderColor: '#B478FF',
                      borderWidth: 1,
                      shadowColor: '#7E48FF',
                      shadowRadius: 16,
                      shadowOpacity: 0.42,
                      elevation: 10,
                    }}
                  >
                    <Text
                      style={{
                        color: '#FFFFFF',
                        fontWeight: '900',
                        fontSize: 15,
                        letterSpacing: 0.2,
                      }}
                    >
                      {busy
                        ? 'PLEASE WAIT…'
                        : mode === 'signIn'
                          ? 'Enter MythicHub'
                          : 'Create my account'}
                    </Text>
                    {!busy && <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />}
                  </LinearGradient>
                </TouchableOpacity>

                <View
                  style={{
                    marginTop: 23,
                    paddingTop: 17,
                    borderTopWidth: 1,
                    borderTopColor: '#38405F',
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ color: '#98A9CB', fontSize: 12 }}>
                    {mode === 'signIn' ? 'New to MythicHub?' : 'Already have an account?'}
                  </Text>
                  <TouchableOpacity
                    accessibilityRole="button"
                    onPress={() => onChangeMode(mode === 'signIn' ? 'signUp' : 'signIn')}
                    style={{ marginTop: 8, paddingVertical: 6, paddingHorizontal: 10 }}
                  >
                    <Text
                      style={{
                        color: color.cyan,
                        fontSize: 14,
                        fontWeight: '800',
                      }}
                    >
                      {mode === 'signIn' ? 'Join MythicHub  →' : 'Back to sign in  →'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </LinearGradient>

            <View
              style={{
                paddingVertical: 20,
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'center',
                gap: 10,
                flexWrap: 'wrap',
              }}
            >
              <Ionicons name="people-outline" color="#D2B2FF" size={15} />
              <Text style={{ color: '#A9B7CF', fontSize: 10, letterSpacing: 1 }}>
                COMMUNITY   •   COLLECTIONS   •   DIAMOND GOALS
              </Text>
            </View>
            <Text
              style={{
                color: '#8B95AC',
                fontSize: 10,
                textAlign: 'center',
                lineHeight: 16,
              }}
            >
              Independent MLBB companion • Never enter your MLBB password
            </Text>
          </View>
        </ImageBackground>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

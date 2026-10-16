import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Image,
  AccessibilityInfo,
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
import Svg, { Circle, Defs, LinearGradient as SvgLinearGradient, RadialGradient, Stop, Path } from 'react-native-svg';

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

function AuthInput({
    icon,
    placeholder,
    value,
    onChange,
    secure = false,
    autoComplete,
    returnKeyType = 'next',
    passwordVisible = false,
    onTogglePassword,
    onSubmit,
  }: {
    icon: React.ComponentProps<typeof Ionicons>['name'];
    placeholder: string;
    value: string;
    onChange: (value: string) => void;
    secure?: boolean;
    autoComplete?: 'email' | 'password' | 'new-password' | 'name';
    returnKeyType?: 'next' | 'go';
    passwordVisible?: boolean;
    onTogglePassword?: () => void;
    onSubmit?: () => void;
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
            onPress={onTogglePassword}
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


/**
 * Real accretion-disc illustration, not thin ellipse outlines.
 * The spiral arms rotate behind the stationary crest with separate speeds.
 * We flatten the rotating circular disc AFTER rotation so the horizon remains
 * horizontal throughout the animation on web and native.
 */
function makeSpiral(startAngle: number, startRadius: number, endRadius: number, turns: number): string {
  const segments = 135;
  let path = '';
  for (let i = 0; i < segments; i += 1) {
    const t = i / (segments - 1);
    const angle = startAngle + 2 * Math.PI * turns * t;
    const radius = startRadius + (endRadius - startRadius) * t;
    const x = 180 + radius * Math.cos(angle);
    const y = 180 + radius * Math.sin(angle);
    path += `${i ? ' L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`;
  }
  return path;
}

const VORTEX_ARMS = [
  makeSpiral(0.32, 38, 149, 1.34),
  makeSpiral(3.58, 46, 157, 1.28),
  makeSpiral(1.65, 83, 164, 0.72),
  makeSpiral(4.7, 76, 155, 0.84),
];

/** A genuinely visible purple/cyan black-hole vortex; no video or GPU shader required. */
function MythicVortex({
  size,
  orbit,
  counterOrbit,
  pulse,
}: {
  size: number;
  orbit: Animated.Value;
  counterOrbit: Animated.Value;
  pulse: Animated.Value;
}) {
  const clockwise = orbit.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const anticlockwise = counterOrbit.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '-360deg'] });
  return (
    <View
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{
        position: 'absolute',
        width: size,
        height: size,
        top: -size * 0.18,
        alignSelf: 'center',
        transform: [{ scaleY: 0.66 }],
      }}
    >
      <Svg width={size} height={size} viewBox="0 0 360 360" style={{ position: 'absolute' }}>
        <Defs>
          <RadialGradient id="mhVortexHalo" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#5B16AA" stopOpacity={0.55} />
            <Stop offset="39%" stopColor="#A13DFA" stopOpacity={0.36} />
            <Stop offset="72%" stopColor="#198EF5" stopOpacity={0.15} />
            <Stop offset="100%" stopColor="#080918" stopOpacity={0} />
          </RadialGradient>
          <RadialGradient id="mhEventHorizon" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#000005" stopOpacity={1} />
            <Stop offset="65%" stopColor="#070312" stopOpacity={1} />
            <Stop offset="90%" stopColor="#190C32" stopOpacity={0.95} />
            <Stop offset="100%" stopColor="#6936B5" stopOpacity={0.25} />
          </RadialGradient>
        </Defs>
        <Circle cx={180} cy={180} r={173} fill="url(#mhVortexHalo)" />
        <Circle cx={180} cy={180} r={62} fill="url(#mhEventHorizon)" />
      </Svg>
      <Animated.View
        style={{
          position: 'absolute',
          width: size,
          height: size,
          opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.78, 0.98] }),
          transform: [{ rotate: clockwise }],
        }}
      >
        <Svg width={size} height={size} viewBox="0 0 360 360">
          <Defs>
            <SvgLinearGradient id="mhPurpleArm" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#E0B6FF" />
              <Stop offset="27%" stopColor="#6635DC" />
              <Stop offset="57%" stopColor="#DB65FF" />
              <Stop offset="83%" stopColor="#398FFF" />
              <Stop offset="100%" stopColor="#19DFFF" />
            </SvgLinearGradient>
            <SvgLinearGradient id="mhBlueArm" x1="100%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor="#66E2FF" />
              <Stop offset="39%" stopColor="#3467E7" />
              <Stop offset="76%" stopColor="#A85AF9" />
              <Stop offset="100%" stopColor="#F1B5E9" />
            </SvgLinearGradient>
          </Defs>
          {VORTEX_ARMS.slice(0, 2).map((arm, index) => (
            <React.Fragment key={index}>
              <Path
                d={arm}
                stroke={index ? 'url(#mhBlueArm)' : 'url(#mhPurpleArm)'}
                strokeWidth={27}
                strokeOpacity={0.2}
                strokeLinecap="round"
                fill="none"
              />
              <Path
                d={arm}
                stroke={index ? 'url(#mhBlueArm)' : 'url(#mhPurpleArm)'}
                strokeWidth={index ? 8.5 : 10.5}
                strokeOpacity={0.95}
                strokeLinecap="round"
                fill="none"
              />
              <Path
                d={arm}
                stroke="#F6DDFF"
                strokeWidth={1.8}
                strokeOpacity={0.68}
                strokeLinecap="round"
                fill="none"
              />
            </React.Fragment>
          ))}
          <Circle cx={180} cy={180} r={51} fill="#07030F" fillOpacity={0.94} />
        </Svg>
      </Animated.View>
      <Animated.View
        style={{
          position: 'absolute',
          width: size,
          height: size,
          opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.55, 0.76] }),
          transform: [{ rotate: anticlockwise }],
        }}
      >
        <Svg width={size} height={size} viewBox="0 0 360 360">
          <Defs>
            <SvgLinearGradient id="mhSecondaryArm" x1="0%" y1="100%" x2="100%" y2="0%">
              <Stop offset="0%" stopColor="#53E6FF" />
              <Stop offset="40%" stopColor="#AF60FF" />
              <Stop offset="75%" stopColor="#E6A26F" />
              <Stop offset="100%" stopColor="#FFF0C6" />
            </SvgLinearGradient>
          </Defs>
          {VORTEX_ARMS.slice(2).map((arm, index) => (
            <React.Fragment key={index}>
              <Path d={arm} stroke="url(#mhSecondaryArm)" strokeWidth={18} strokeOpacity={0.19} strokeLinecap="round" fill="none" />
              <Path d={arm} stroke="url(#mhSecondaryArm)" strokeWidth={5.5} strokeOpacity={0.85} strokeLinecap="round" fill="none" />
            </React.Fragment>
          ))}
          <Circle cx={326} cy={106} r={3.4} fill="#F8D8FF" />
          <Circle cx={59} cy={277} r={2.8} fill="#7DE8FC" />
        </Svg>
      </Animated.View>
    </View>
  );
}

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
  // Two very slow orbital rings evoke a black-hole accretion swirl.
  // All movements use native-driver transforms and honor reduced-motion preferences.
  const pulse = useRef(new Animated.Value(0)).current;
  const orbit = useRef(new Animated.Value(0)).current;
  const counterOrbit = useRef(new Animated.Value(0)).current;
  const atmosphere = useRef(new Animated.Value(0)).current;
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => { if (mounted) setReduceMotion(Boolean(enabled)); })
      .catch(() => {});
    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      (enabled) => { if (mounted) setReduceMotion(Boolean(enabled)); }
    );
    return () => { mounted = false; subscription.remove(); };
  }, []);

  useEffect(() => {
    if (reduceMotion) {
      pulse.stopAnimation();
      orbit.stopAnimation();
      counterOrbit.stopAnimation();
      atmosphere.stopAnimation();
      pulse.setValue(0);
      orbit.setValue(0);
      counterOrbit.setValue(0);
      atmosphere.setValue(0);
      return;
    }
    const breathe = Animated.loop(Animated.sequence([
      Animated.timing(pulse, {
        toValue: 1, duration: 4100, easing: Easing.inOut(Easing.sin), useNativeDriver: true,
      }),
      Animated.timing(pulse, {
        toValue: 0, duration: 4100, easing: Easing.inOut(Easing.sin), useNativeDriver: true,
      }),
    ]));
    const clockwise = Animated.loop(Animated.timing(orbit, {
      toValue: 1, duration: 12500, easing: Easing.linear, useNativeDriver: true,
    }));
    const counterClockwise = Animated.loop(Animated.timing(counterOrbit, {
      toValue: 1, duration: 19300, easing: Easing.linear, useNativeDriver: true,
    }));
    const roomDrift = Animated.loop(Animated.sequence([
      Animated.timing(atmosphere, {
        toValue: 1, duration: 23000, easing: Easing.inOut(Easing.sin), useNativeDriver: true,
      }),
      Animated.timing(atmosphere, {
        toValue: 0, duration: 23000, easing: Easing.inOut(Easing.sin), useNativeDriver: true,
      }),
    ]));
    breathe.start();
    clockwise.start();
    counterClockwise.start();
    roomDrift.start();
    return () => {
      breathe.stop();
      clockwise.stop();
      counterClockwise.stop();
      roomDrift.stop();
    };
  }, [pulse, orbit, counterOrbit, atmosphere, reduceMotion]);

  const formWidth = Math.min(width - (desktop ? 40 : 26), 492);
  const labelStyle = {
    color: color.gray,
    fontSize: 10,
    letterSpacing: 1.4,
    fontWeight: '800' as const,
    marginBottom: 8,
  };


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
        <View
          style={{
            minHeight: Math.max(height, desktop ? 880 : 780),
            justifyContent: 'center',
            alignItems: 'center',
            overflow: 'hidden',
          }}
        >
          {/* Full-bleed room art: gentle 46-second parallax, never a fast slideshow. */}
          <Animated.View
            pointerEvents="none"
            style={{
              position: 'absolute',
              top: -18,
              bottom: -18,
              left: -18,
              right: -18,
              transform: [
                { scale: atmosphere.interpolate({ inputRange: [0, 1], outputRange: [1.02, 1.045] }) },
                { translateX: atmosphere.interpolate({ inputRange: [0, 1], outputRange: [-5, 5] }) },
              ],
            }}
          >
            <Image
              source={scene}
              resizeMode="cover"
              accessibilityLabel="Atmospheric MythicHub gaming lounge"
              style={{ width: '100%', height: '100%' }}
            />
          </Animated.View>
          {/* Quiet vignette: center is dark, both sides keep their artwork. */}
          <LinearGradient
            pointerEvents="none"
            colors={['#05081780', '#060918AC', '#0607169A']}
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
            colors={['#A453EE22', '#06091702', '#35A5FF17']}
            start={{ x: 0, y: 0.48 }}
            end={{ x: 1, y: 0.55 }}
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: 0,
              right: 0,
              opacity: desktop ? 0.38 : 0.2,
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
              <View
                style={{
                  width: compact ? 266 : desktop ? 350 : 308,
                  height: compact ? 199 : desktop ? 245 : 221,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <MythicVortex
                  size={compact ? 265 : desktop ? 354 : 310}
                  orbit={orbit}
                  counterOrbit={counterOrbit}
                  pulse={pulse}
                />
                <Animated.View
                  style={{
                    alignItems: 'center',
                    opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.96, 1] }),
                    transform: [
                      { scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.995, 1.01] }) },
                    ],
                  }}
                >
                  <Image
                    source={emblem}
                    resizeMode="contain"
                    accessibilityLabel="MythicHub gold crest with a slow orbiting black-hole effect"
                    style={{
                      width: compact ? 220 : desktop ? 288 : 254,
                      height: compact ? 185 : desktop ? 240 : 212,
                    }}
                  />
                </Animated.View>
              </View>
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
                    passwordVisible={passwordVisible}
                    onTogglePassword={() => setPasswordVisible((visible) => !visible)}
                    onSubmit={onSubmit}
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
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

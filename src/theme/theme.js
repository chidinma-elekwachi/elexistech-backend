import { Platform } from 'react-native';
import { MD3LightTheme, configureFonts } from 'react-native-paper';

const fontConfig = {
    displayLarge: {
        fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
        fontSize: 57,
        fontWeight: '400',
        letterSpacing: 0,
        lineHeight: 64,
    },
    displayMedium: {
        fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
        fontSize: 45,
        fontWeight: '400',
        letterSpacing: 0,
        lineHeight: 52,
    },
    displaySmall: {
        fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
        fontSize: 36,
        fontWeight: '400',
        letterSpacing: 0,
        lineHeight: 44,
    },
    headlineLarge: {
        fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
        fontSize: 32,
        fontWeight: '400',
        letterSpacing: 0,
        lineHeight: 40,
    },
    headlineMedium: {
        fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
        fontSize: 28,
        fontWeight: '400',
        letterSpacing: 0,
        lineHeight: 36,
    },
    headlineSmall: {
        fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
        fontSize: 24,
        fontWeight: '400',
        letterSpacing: 0,
        lineHeight: 32,
    },
};

// Modern color palette
const colors = {
    primary: '#2563eb', // Modern blue
    secondary: '#3b82f6',
    accent: '#818cf8',
    background: '#f8fafc',
    surface: '#ffffff',
    text: '#1e293b',
    error: '#ef4444',
    success: '#22c55e',
    warning: '#f59e0b',
    placeholder: '#94a3b8',
    backdrop: 'rgba(0, 0, 0, 0.5)',
    surfaceVariant: '#f1f5f9',
    elevation: {
        level0: 'transparent',
        level1: '#ffffff',
        level2: '#ffffff',
        level3: '#ffffff',
        level4: '#ffffff',
        level5: '#ffffff',
    },
};

export const theme = {
    ...MD3LightTheme,
    colors: {
        ...MD3LightTheme.colors,
        ...colors,
    },
    fonts: configureFonts({ config: fontConfig }),
    roundness: 12,
};

export const styles = {
    shadow: {
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    gradientBackground: ['#2563eb', '#818cf8'],
};

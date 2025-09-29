import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { IconButton, useTheme } from 'react-native-paper';

import LoadingScreen from '../screens/LoadingScreen';
import AuthScreen from '../screens/AuthScreen';
import ProfileScreen from '../screens/ProfileScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import UsersScreen from '../screens/UsersScreen';
import MediaShareScreen from '../screens/MediaShareScreen';
// import ChatScreen from '../screens/ChatScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const MainTabs = () => {
    const theme = useTheme();

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;

                    if (route.name === 'Users') {
                        iconName = 'phone';
                    } else if (route.name === 'Profile') {
                        iconName = 'account';
                    } else if (route.name === 'Media') {
                        iconName = 'image-multiple';
                    }

                    return <IconButton icon={iconName} size={size} iconColor={color} />;
                },
                headerShown: false,
                tabBarActiveTintColor: theme.colors.primary,
                tabBarInactiveTintColor: theme.colors.placeholder,
                tabBarStyle: {
                    backgroundColor: theme.colors.surface,
                    borderTopColor: theme.colors.surfaceVariant,
                    elevation: 0,
                    shadowOpacity: 0,
                    height: 60,
                    paddingBottom: 8,
                },
                tabBarLabelStyle: {
                    fontWeight: '500',
                },
            })}
            initialRouteName="Profile"
        >
            <Tab.Screen name="Profile" component={ProfileScreen} />
            <Tab.Screen name="Users" component={UsersScreen} />
            <Tab.Screen name="Media" component={MediaShareScreen} />
        </Tab.Navigator>
    );
};

const Navigation = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator
                screenOptions={{
                    headerShown: false,
                }}
                initialRouteName="Loading"
            >
                <Stack.Screen name="Loading" component={LoadingScreen} />
                <Stack.Screen name="Auth" component={AuthScreen} />
                <Stack.Screen name="MainTabs" component={MainTabs} />
                <Stack.Screen
                    name="EditProfile"
                    component={EditProfileScreen}
                    options={{
                        headerShown: true,
                        title: 'Edit Profile',
                    }}
                />
                {/** Call screen temporarily disabled to exclude Agora from build */}
                {false && (
                    <Stack.Screen
                        name="Call"
                        component={ChatScreen}
                        options={{
                            headerShown: false,
                        }}
                    />
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default Navigation;

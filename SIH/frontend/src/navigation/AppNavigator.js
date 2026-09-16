import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View, StyleSheet } from 'react-native';

import { AuthContext } from '../context/AuthContext';

import LoginScreen from '../screens/LoginScreen';
import ActivateSupervisorScreen from '../screens/ActivateSupervisorScreen';

import AdminDashboardScreen from '../screens/AdminDashboardScreen';
import AdminSupervisorsScreen from '../screens/AdminSupervisorsScreen';
import AdminSupervisorDetailScreen from '../screens/AdminSupervisorDetailScreen';

import SupervisorDashboardScreen from '../screens/SupervisorDashboardScreen';
import InspectionsScreen from '../screens/InspectionsScreen';
import CreateInspectionScreen from '../screens/CreateInspectionScreen';
import InspectionDetailScreen from '../screens/InspectionDetailScreen';
import HistoryScreen from '../screens/HistoryScreen';
import AuditLogScreen from '../screens/AuditLogScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Simple custom tab bar icon helper
const TabIcon = ({ name, color }) => (
  <Text style={{ fontSize: 18, color }}>{name}</Text>
);

function AdminTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#1E293B' },
        headerTintColor: '#F8FAFC',
        tabBarStyle: { backgroundColor: '#1E293B', borderTopColor: '#334155' },
        tabBarActiveTintColor: '#38BDF8',
        tabBarInactiveTintColor: '#64748B',
      }}
    >
      <Tab.Screen
        name="DashboardTab"
        component={AdminDashboardScreen}
        options={{
          title: 'Admin Home',
          tabBarIcon: ({ color }) => <TabIcon name="📊" color={color} />,
        }}
      />
      <Tab.Screen
        name="SupervisorsTab"
        component={AdminSupervisorsScreen}
        options={{
          title: 'Supervisors',
          tabBarIcon: ({ color }) => <TabIcon name="👥" color={color} />,
        }}
      />
      <Tab.Screen
        name="AuditLogTab"
        component={AuditLogScreen}
        options={{
          title: 'Audit Logs',
          tabBarIcon: ({ color }) => <TabIcon name="📋" color={color} />,
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <TabIcon name="⚙️" color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}

function SupervisorTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#1E293B' },
        headerTintColor: '#F8FAFC',
        tabBarStyle: { backgroundColor: '#1E293B', borderTopColor: '#334155' },
        tabBarActiveTintColor: '#38BDF8',
        tabBarInactiveTintColor: '#64748B',
      }}
    >
      <Tab.Screen
        name="SupervisorHome"
        component={SupervisorDashboardScreen}
        options={{
          title: 'Portal',
          tabBarIcon: ({ color }) => <TabIcon name="🏠" color={color} />,
        }}
      />
      <Tab.Screen
        name="InspectionsTab"
        component={InspectionsScreen}
        options={{
          title: 'Inspections',
          tabBarIcon: ({ color }) => <TabIcon name="🔍" color={color} />,
        }}
      />
      <Tab.Screen
        name="HistoryTab"
        component={HistoryScreen}
        options={{
          title: 'History',
          tabBarIcon: ({ color }) => <TabIcon name="📚" color={color} />,
        }}
      />
      <Tab.Screen
        name="AuditTab"
        component={AuditLogScreen}
        options={{
          title: 'Audit',
          tabBarIcon: ({ color }) => <TabIcon name="📋" color={color} />,
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <TabIcon name="👤" color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { token, isAdmin, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Initializing LegalMetrix Mobile...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: '#1E293B' },
          headerTintColor: '#F8FAFC',
          headerTitleStyle: { fontWeight: '700' },
        }}
      >
        {!token ? (
          <>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="ActivateSupervisor"
              component={ActivateSupervisorScreen}
              options={{ title: 'Supervisor Activation' }}
            />
          </>
        ) : isAdmin ? (
          <>
            <Stack.Screen
              name="AdminMain"
              component={AdminTabs}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="AdminSupervisorDetail"
              component={AdminSupervisorDetailScreen}
              options={{ title: 'Supervisor Performance' }}
            />
            <Stack.Screen
              name="AuditLog"
              component={AuditLogScreen}
              options={{ title: 'Audit Trail' }}
            />
          </>
        ) : (
          <>
            <Stack.Screen
              name="SupervisorMain"
              component={SupervisorTabs}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="CreateInspection"
              component={CreateInspectionScreen}
              options={{ title: 'Start Inspection' }}
            />
            <Stack.Screen
              name="InspectionDetail"
              component={InspectionDetailScreen}
              options={{ title: 'LMPC Inspection Workflow' }}
            />
            <Stack.Screen
              name="History"
              component={HistoryScreen}
              options={{ title: 'Inspection Archive' }}
            />
            <Stack.Screen
              name="AuditLog"
              component={AuditLogScreen}
              options={{ title: 'Audit Logs' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#38BDF8',
    fontSize: 16,
    fontWeight: '700',
  },
});

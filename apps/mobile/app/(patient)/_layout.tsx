import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../lib/theme';

export default function PatientLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.gray400,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopColor: '#f0f0f0',
          height: 85,
          paddingTop: 8,
          paddingBottom: 28,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      {/* ── 4 VISIBLE TABS (matching Figma design) ── */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Ionicons name="home" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="doctors"
        options={{
          title: 'Doctors',
          tabBarIcon: ({ color }) => <Ionicons name="people" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="booking"
        options={{
          title: 'Messages',
          tabBarIcon: ({ color }) => <Ionicons name="chatbubbles" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'More',
          tabBarIcon: ({ color }) => <Ionicons name="grid" size={22} color={color} />,
        }}
      />

      {/* ── HIDDEN SCREENS (accessible via navigation, not shown in tab bar) ── */}
      <Tabs.Screen name="doctor-profile" options={{ href: null }} />
      <Tabs.Screen name="booking-confirm" options={{ href: null }} />
      <Tabs.Screen name="booking-success" options={{ href: null }} />
      <Tabs.Screen name="rate-doctor" options={{ href: null }} />
      <Tabs.Screen name="video-call" options={{ href: null }} />
      <Tabs.Screen name="appointments" options={{ href: null }} />
      <Tabs.Screen name="wallet" options={{ href: null }} />
      <Tabs.Screen name="notifications" options={{ href: null }} />
      <Tabs.Screen name="plans" options={{ href: null }} />
      <Tabs.Screen name="lab-tests" options={{ href: null }} />
      <Tabs.Screen name="my-profile" options={{ href: null }} />
      <Tabs.Screen name="edit-profile" options={{ href: null }} />
      <Tabs.Screen name="family-members" options={{ href: null }} />
      <Tabs.Screen name="switch-profile" options={{ href: null }} />
      <Tabs.Screen name="faq" options={{ href: null }} />
      <Tabs.Screen name="content-page" options={{ href: null }} />
    </Tabs>
  );
}

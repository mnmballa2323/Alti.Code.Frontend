import { BaseSpecialistAgent } from '../base_specialist.agent.js';
import { GeminiAiService } from '../../gemini/gemini.service.js';

/**
 * React Native OSS Specialist
 * Repository: https://github.com/facebook/react-native
 * Stars: 114k | Language: JavaScript/TypeScript, Java/Obj-C/C++
 */
class ReactNativeOssAgent extends BaseSpecialistAgent {
  constructor() {
    super();
    this.name = 'ReactNative_Oss_Expert';
    this.description =
      'Expert in React Native & Expo — View, Text, StyleSheet, FlatList, Navigation, animations (Reanimated), native modules, and styling.';
    this.preamble = `You are a senior mobile engineer specializing in React Native and Expo.

SETUP (Expo is recommended by React Native core):
npx create-expo-app@latest my-app
cd my-app
npx expo start

CORE COMPONENTS:
import { View, Text, StyleSheet, Image, TextInput, ScrollView, FlatList, TouchableOpacity, Pressable, Platform } from 'react-native'

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hello React Native</Text>
      
      {/* Pressable handles interactions with visual feedback */}
      <Pressable 
        style={({pressed}) => [styles.button, pressed && styles.pressed]}
        onPress={() => alert('Pressed!')}
      >
        <Text style={styles.buttonText}>Press Me</Text>
      </Pressable>
      
      {/* Platform specific logic */}
      {Platform.OS === 'ios' && <Text>iOS only</Text>}
    </View>
  )
}

STYLING (Flexbox default):
const styles = StyleSheet.create({
  container: {
    flex: 1,                          // takes full height
    backgroundColor: '#f5f5f5',
    alignItems: 'center',             // horizontal center
    justifyContent: 'center',         // vertical center
    padding: Platform.select({ ios: 40, android: 20 }),
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    elevation: 3,                     // Android shadow
    shadowColor: '#000',              // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  pressed: {
    opacity: 0.7,
  }
})

LISTS (FlatList - performant for large lists):
const DATA = [{ id: '1', title: 'First' }, { id: '2', title: 'Second' }];

<FlatList
  data={DATA}
  keyExtractor={item => item.id}
  renderItem={({ item }) => <Text style={styles.item}>{item.title}</Text>}
  ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: '#eee' }} />}
  ListEmptyComponent={<Text>No items found</Text>}
  refreshing={isRefreshing}
  onRefresh={loadData}
  onEndReached={loadMore}
  onEndReachedThreshold={0.5}
/>

NAVIGATION (React Navigation v6/v7):
npm install @react-navigation/native @react-navigation/native-stack
npx expo install react-native-screens react-native-safe-area-context

import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'

const Stack = createNativeStackNavigator()

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Overview' }} />
        <Stack.Screen name="Details" component={DetailsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}

function HomeScreen({ navigation }) {
  return <Button title="Go to Details" onPress={() => navigation.navigate('Details', { id: 42 })} />
}

function DetailsScreen({ route }) {
  const { id } = route.params
  return <Text>Details for {id}</Text>
}

EXPO ROUTER (File-based routing - Next.js style):
// app/index.tsx (Home)
import { Link } from 'expo-router'
export default function Home() { return <Link href="/details/42">Go</Link> }

// app/details/[id].tsx
import { useLocalSearchParams } from 'expo-router'
export default function Details() {
  const { id } = useLocalSearchParams()
  return <Text>ID: {id}</Text>
}

// app/_layout.tsx (Stack definition)
import { Stack } from 'expo-router'
export default function Layout() { return <Stack /> }

ANIMATIONS (Reanimated v3 - UI thread):
npm install react-native-reanimated

import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated'

export default function App() {
  // Shared value lives on UI thread
  const offset = useSharedValue(0)

  // Worklet function generates style reactively
  const animatedStyles = useAnimatedStyle(() => ({
    transform: [{ translateY: offset.value }],
  }))

  return (
    <>
      <Animated.View style={[styles.box, animatedStyles]} />
      <Button onPress={() => (offset.value = withSpring(Math.random() * 255))} title="Move" />
    </>
  )
}

SAFE AREA (Notches & Home Indicator):
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'

function CustomHeader() {
  const insets = useSafeAreaInsets()
  return <View style={{ paddingTop: insets.top, backgroundColor: 'red' }} />
}

EXPO EAS (Build & Submit):
npm install -g eas-cli
eas build --profile production --platform ios
eas submit -p ios`;
  }

  async _invoke(prompt, contextBlock) {
    return GeminiAiService.generateContent(
      `${this.preamble}\n\n=== CONTEXT ===\n${contextBlock}\n\n=== REACT NATIVE QUESTION ===\n${prompt}`,
    );
  }
}

export const reactNativeOssAgent = new ReactNativeOssAgent();

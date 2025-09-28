// import { StatusBar } from 'expo-status-bar';
// import { StyleSheet, Text, View } from 'react-native';

// export default function App() {
//   return (
//     <View style={styles.container}>
//       <Text>Open up App.js to start working on your app!</Text>
//       <StatusBar style="auto" />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
// });
import { registerRootComponent } from "expo"
import { ExpoRoot } from "expo-router"

// Must be exported or Fast Refresh won't update the context
export function App() {
  const ctx = require.context("./app")
  return <ExpoRoot context={ctx} />
}

registerRootComponent(App)

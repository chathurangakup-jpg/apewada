// app/App.tsx
import React, { useState } from "react";
import { StatusBar, View } from "react-native";
import SplashScreen from "../../components/Splash/SplashScreen";
// import AppNavigator from "./navigation/AppNavigator";

const App: React.FC = () => {
  const [isSplashVisible, setIsSplashVisible] = useState(true);

  const handleSplashFinish = () => {
    setIsSplashVisible(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <SplashScreen onFinish={handleSplashFinish} />
    </View>
  );
};

export default App;

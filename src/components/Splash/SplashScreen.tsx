// app/components/SplashScreen/SplashScreen.tsx
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Animated,
  Dimensions,
  FlatList,
  Image,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { styles } from "./SplashScreen.styles";

const { width, height } = Dimensions.get("window");

interface SlideData {
  id: string;
  image: any;
  title: string;
  description: string;
  icon: string;
}

interface SplashScreenProps {
  onFinish: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const router = useRouter();
  const { t } = useTranslation();

  const slides: SlideData[] = [
    {
      id: "1",
      image: require("../../../assets/images/splash_img1.png"), // Replace with your actual image
      title: t("splash.title1"),
      description: t("splash.desc1"),
      icon: "people-outline",
    },
    {
      id: "2",
      image: require("../../../assets/images/splash_img2.png"), // Replace with your actual image
      title: t("splash.title2"),
      description: t("splash.desc2"),
      icon: "briefcase-outline",
    },
    {
      id: "3",
      image: require("../../../assets/images/splash_img3.png"), // Replace with your actual image
      title: t("splash.title3"),
      description: t("splash.desc3"),
      icon: "star-outline",
    },
  ];

  // Auto-swipe logic
  useEffect(() => {
    const timer = setInterval(() => {
      const nextIndex = (currentIndex + 1) % slides.length;
      setCurrentIndex(nextIndex);
      flatListRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
      });
    }, 4000); // Change slide every 4 seconds

    return () => clearInterval(timer);
  }, [currentIndex]);

  // Handle manual swipe
  const onScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { useNativeDriver: false },
  );

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = useRef({
    viewAreaCoveragePercentThreshold: 50,
  }).current;

  const renderSlide = ({ item }: { item: SlideData }) => (
    <View style={[styles.slide, { width }]}>
      <View style={styles.iconContainer}>
        <Ionicons name={item.icon as any} size={32} color="#FF6B35" />
      </View>

      <Text style={styles.title}>{item.title}</Text>
      <View style={styles.imageContainer}>
        <Image source={item.image} style={styles.image} resizeMode="contain" />
      </View>

      <View style={styles.contentContainer}>
        <Text style={styles.description}>{item.description}</Text>
      </View>
    </View>
  );

  // app/components/SplashScreen/SplashScreen.tsx

  const renderDots = () => {
    return (
      <View style={styles.dotsContainer}>
        {slides.map((_, index) => {
          const opacity = scrollX.interpolate({
            inputRange: [
              (index - 1) * width,
              index * width,
              (index + 1) * width,
            ],
            outputRange: [0.3, 1, 0.3],
            extrapolate: "clamp",
          });

          // Calculate width based on selection
          const widthAnim = scrollX.interpolate({
            inputRange: [
              (index - 1) * width,
              index * width,
              (index + 1) * width,
            ],
            outputRange: [8, 32, 8], // Unselected: 8px, Selected: 32px
            extrapolate: "clamp",
          });

          const scale = scrollX.interpolate({
            inputRange: [
              (index - 1) * width,
              index * width,
              (index + 1) * width,
            ],
            outputRange: [0.8, 1.2, 0.8],
            extrapolate: "clamp",
          });

          return (
            <Animated.View
              key={index}
              style={[
                styles.dot,
                {
                  width: widthAnim, // Dynamic width
                  height: 8, // Fixed height
                  opacity,
                  transform: [{ scale }],
                  backgroundColor:
                    currentIndex === index ? "#FF6B35" : "#D1D5DB",
                },
              ]}
            />
          );
        })}
      </View>
    );
  };

  const handleGetStarted = () => {
    router.push("/(public)/language");
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        keyExtractor={(item) => item.id}
        scrollEventThrottle={16}
        decelerationRate="fast"
      />

      {renderDots()}

      <View style={styles.footer}>
        {currentIndex === slides.length - 1 ? (
          <TouchableOpacity
            style={styles.getStartedButton}
            onPress={handleGetStarted}
            activeOpacity={0.8}
          >
            <Text style={styles.getStartedText}>{t("splash.getStarted")}</Text>
            <Ionicons name="arrow-forward" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.skipButton}
            onPress={() => {
              flatListRef.current?.scrollToIndex({
                index: slides.length - 1,
                animated: true,
              });
            }}
          >
            <Text style={styles.skipText}>{t("splash.skip")}</Text>
            <Ionicons name="chevron-forward" size={20} color="#6B7280" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.indicatorContainer}>
        <Text style={styles.indicatorText}>
          {currentIndex + 1} / {slides.length}
        </Text>
      </View>
    </Animated.View>
  );
};

export default SplashScreen;

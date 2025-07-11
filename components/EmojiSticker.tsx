import { View } from 'react-native';
import { Image } from 'expo-image';
import { PanGestureHandler } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { ImageSourcePropType } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

interface GestureContext {
  translateX: number;
  translateY: number;
  [key: string]: unknown; // Index signature
}

type Props = {
  imageSize: number;
  stickerSource: ImageSourcePropType;
};

export default function EmojiSticker({ imageSize, stickerSource }:Props) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);

  const panGestureHandler = useAnimatedGestureHandler<any, GestureContext>({
    onStart: (_, context) => {
      context.translateX = translateX.value;
      context.translateY = translateY.value;
      scale.value = withSpring(1.1); // Slightly scale up when dragging starts
    },
    onActive: (event, context) => {
      translateX.value = context.translateX + event.translationX;
      translateY.value = context.translateY + event.translationY;
    },
    onEnd: () => {
      scale.value = withSpring(1); // Scale back to normal when dragging ends
    },
  });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value },
      ],
    };
  });

    const drag = Gesture.Pan().onChange(event => {
    translateX.value += event.changeX;
    translateY.value += event.changeY;
  });

  return (
    // <PanGestureHandler onGestureEvent={panGestureHandler}>
      <GestureDetector gesture={drag}>
      <Animated.View style={[
        animatedStyle,
        {
          position: 'absolute',
          top: 100, // Start position
          left: 100, // Start position
          zIndex: 1,
        }
      ]}>
        <Image
          source={stickerSource}
          style={{ 
            width: imageSize, 
            height: imageSize,
          }}
          contentFit="contain"
        />
      </Animated.View>
    </GestureDetector>
    // </PanGestureHandler>
  );
}
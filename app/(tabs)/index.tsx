import { ImageSourcePropType, Text, View, StyleSheet } from "react-native";
import { Link } from "expo-router";
import { Image } from 'expo-image';
import { useState } from 'react';
import ImageViewer from '@/components/ImageViewer';
import Button from '@/components/Button';
import * as ImagePicker from 'expo-image-picker';
import CircularButton from "@/components/CircularButton";
import IconButton from "@/components/IconButton";
import EmojiPicker from "@/components/EmojiPicker";
import EmojiList from "@/components/EmojiList";
import EmojiSticker from '@/components/EmojiSticker';
import * as MediaLibrary from 'expo-media-library';
import { useRef } from 'react';
import { captureRef } from 'react-native-view-shot';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const placeholderImage = require('@/assets/images/background-image.png');

export default function Index() {
  const imageRef = useRef<View>(null);
  const [status, requestPermission] = MediaLibrary.usePermissions();
  const [selectedImage, setSelectedImage] = useState<string | undefined>(undefined);
  const [showAppOptions, setShowAppOptions] = useState<boolean>(false);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [pickedEmoji, setPickedEmoji] = useState<ImageSourcePropType | undefined>(undefined);

  if (status === null) {
    requestPermission();
  }

  const PickImageAsync = async() => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'], // Updated syntax
      allowsEditing: false,
      quality: 1,
    });

    if(!result.canceled){
      setSelectedImage(result.assets[0].uri);
      setShowAppOptions(true); // Automatically show options when image is selected
    }
    else{
      alert('You didnt pick any image');
    }
  };

  const onReset = () => {
    setShowAppOptions(false);
    setSelectedImage(undefined);
    setPickedEmoji(undefined);
  };

  const onAddSticker = () => {
    setIsModalVisible(true);
  };

  const onModalClose = async () => {
    setIsModalVisible(false);
  };

  const onSaveImageAsync = async () => {
    try {
      // Add a small delay to ensure any animations are complete
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const localUri = await captureRef(imageRef, {
        height: 440,
        quality: 1,
        format: 'png',
        result: 'tmpfile', // Use tmpfile for better compatibility
      });

      await MediaLibrary.saveToLibraryAsync(localUri);
      if (localUri) {
        alert('Image saved successfully!');
      }
    } catch (e) {
      console.log('Error saving image:', e);
      alert('Error saving image. Please try again.');
    }
  };


  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <View style={styles.imageContainer} ref={imageRef} collapsable={false}>
          <ImageViewer imgSource={placeholderImage} selectedImage={selectedImage} />
          {pickedEmoji && (
            <EmojiSticker imageSize={40} stickerSource={pickedEmoji} />
          )}
        </View>

        {showAppOptions ? (
          <View style={styles.optionsContainer}>
            <View style={styles.optionsRow}>
              <IconButton icon="refresh" label="Reset" onPress={onReset} />
              <CircularButton onPress={onAddSticker} />
              <IconButton icon="save-alt" label="Save" onPress={onSaveImageAsync} />
            </View>
          </View>
        ) : (
          <View style={styles.footerContainer}>
            <Button theme='primary' label="Choose a photo" onPress={PickImageAsync} />
            <Button label="Use this photo" onPress={() => setShowAppOptions(true)} />
          </View>
        )}
        
        <EmojiPicker isVisible={isModalVisible} onClose={onModalClose}> 
          <EmojiList onSelect={setPickedEmoji} onCloseModal={onModalClose} />
        </EmojiPicker>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, 
    backgroundColor: '#25292e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerContainer: {
    flex: 1 / 3,
    alignItems: 'center',
  },
  text: {
    color: '#fff',
  },
  button: {
    fontSize: 20,
    textDecorationLine: 'underline',
    color: '#fff',
  },
  imageContainer: {
    flex: 1,
    paddingTop: 28,
    position: 'relative',
    alignItems: 'center', // Center the image
  },
  image: {
    width: 320,
    height: 440,
    borderRadius: 18,
  },
  optionsContainer: {
    position: 'absolute',
    bottom: 80,
  },
  optionsRow: {
    alignItems: 'center',
    flexDirection: 'row',
  },
});
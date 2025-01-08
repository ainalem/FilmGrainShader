import React, {useState} from 'react';
import {StyleSheet, View, Dimensions, Text} from 'react-native';
import Slider from '@react-native-community/slider';
import {
  Canvas,
  Skia,
  ImageShader,
  Shader,
  Fill,
  useImage,
} from '@shopify/react-native-skia';

// Get screen dimensions
const {width: screenWidth, height: screenHeight} = Dimensions.get('window');
const canvasSize = Math.min(screenWidth, screenHeight); // Minimum of width and height

// Shader code with noise coefficient controlled by a uniform
const risographGrainShader = Skia.RuntimeEffect.Make(`
uniform float u_time;
uniform vec2 u_resolution;
uniform shader image;
uniform float u_coefficient; // Uniform for controlling noise strength

float random(vec2 co) {
  return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
}

float grain(vec2 uv) {
  return random(uv * 1.0); // Add scaling to uv
}

half4 main(float2 xy) {
  vec2 uv = xy / u_resolution; // Normalize coordinates
  float noise = grain(uv); // Generate noise
  half4 baseColor = image.eval(xy); // Sample the image
  // Combine image and noise, scale noise by the coefficient
  return half4(baseColor.rgb * (1 + ((noise - 0.5) * u_coefficient)), baseColor.a);
}`)!;

const App = () => {
  // Load a reliable image (smooth gradient)
  // const image = useImage(
  //   'https://images.unsplash.com/photo-1506784365847-bbad939e9335?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=512', // Unsplash gradient
  // );
  const image = useImage(
    'https://images.unsplash.com/photo-1669780080335-0d16efe84b6d?q=80&w=2970&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', // Smooth rainbow gradient image
  );

  // State for the noise coefficient (controlled by the slider)
  const [coefficient, setCoefficient] = useState(0.3); // Default coefficient value

  // Wait for the image to load
  if (!image) {
    return null;
  }

  return (
    <>
      <View style={styles.container}>
        {/* Canvas with Risograph Grain Shader */}
        <Canvas style={{width: canvasSize, height: canvasSize}}>
          <Fill>
            <Shader
              source={risographGrainShader}
              uniforms={{
                u_time: Date.now() / 1000, // Time for animation
                u_resolution: [canvasSize, canvasSize], // Canvas resolution
                u_coefficient: coefficient, // Noise coefficient
              }}>
              <ImageShader
                image={image}
                fit="cover"
                rect={{x: 0, y: 0, width: canvasSize, height: canvasSize}}
              />
            </Shader>
          </Fill>
        </Canvas>

        {/* Intensity Slider */}
        <View style={styles.sliderContainer}>
          <Slider
            style={styles.slider}
            minimumValue={0.0} // Minimum coefficient
            maximumValue={1.0} // Maximum coefficient
            step={0.05} // Slider step
            value={coefficient}
            onValueChange={value => setCoefficient(value)} // Update coefficient
            minimumTrackTintColor="#FFFFFF"
            maximumTrackTintColor="#000000"
          />
        </View>
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.satoshiText}>React Native Shaders</Text>
        <Text style={styles.nanoText}>Shaders are remarkably underused</Text>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  canvas: {
    width: canvasSize,
    height: canvasSize,
  },
  sliderContainer: {
    marginTop: 20,
    width: '80%',
    alignItems: 'center',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  textContainer: {
    alignItems: 'center',
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    marginTop: -25,
    position: 'absolute',
    width: '100%',
  },
  satoshiText: {
    color: '#fff',
    fontFamily: 'Satoshi-Variable', // Matches the font file name
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  nanoText: {
    color: '#fff',
    fontFamily: 'nano', // Matches the font file name
    fontSize: 18,
    letterSpacing: 1.4,
  },
});

export default App;

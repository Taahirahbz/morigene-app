import React, { useState } from 'react';
import { SafeAreaView, ScrollView, Text, Button, TextInput, Image, Dimensions, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import TextRecognition from 'react-native-text-recognition';
import { LineChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

export default function App() {
  const [labValues, setLabValues] = useState([]);
  const [medication, setMedication] = useState('');
  const [message, setMessage] = useState('');
  const [image, setImage] = useState(null);

  const scanLabReport = async () => {
    // Ask for camera permissions
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (!permissionResult.granted) {
      alert("Camera permission is required!");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({ base64: false });
    if (!result.cancelled) {
      setImage(result.uri);

      // Perform OCR
      const text = await TextRecognition.recognize(result.uri);
      const values = text.join(' ').match(/\d+(\.\d+)?/g)?.map(Number) || [];
      setLabValues(values);
    }
  };

  const handleSubmit = () => {
    if (labValues.length > 0 && labValues[labValues.length - 1] > 100) {
      setMessage(`Your latest value is high. Take ${medication} and consult your doctor.`);
    } else {
      setMessage('All values normal.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Button title="Scan Lab Report" onPress={scanLabReport} />

        {image && <Image source={{ uri: image }} style={styles.image} />}

        <Text>Lab Values: {labValues.join(', ')}</Text>

        <TextInput
          placeholder="Enter Medication"
          value={medication}
          onChangeText={setMedication}
          style={styles.input}
        />

        <Button title="Submit" onPress={handleSubmit} />

        {labValues.length > 0 && (
          <LineChart
            data={{
              labels: labValues.map((_, i) => `T${i + 1}`),
              datasets: [{ data: labValues }],
            }}
            width={screenWidth - 40}
            height={220}
            chartConfig={{
              backgroundColor: '#fff',
              backgroundGradientFrom: '#fff',
              backgroundGradientTo: '#fff',
              decimalPlaces: 1,
              color: (opacity = 1) => `rgba(0,0,255,${opacity})`,
              labelColor: (opacity = 1) => `rgba(0,0,0,${opacity})`,
            }}
            style={{ marginVertical: 10 }}
          />
        )}

        {message.length > 0 && <Text style={styles.message}>{message}</Text>}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  image: { width: 200, height: 200, marginVertical: 10 },
  input: { borderWidth: 1, padding: 10, marginVertical: 10 },
  message: { marginTop: 20, fontSize: 16 },
});


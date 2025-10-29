import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  Button,
  TextInput,
  Image,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import TextRecognition from 'react-native-text-recognition';
import { LineChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

export default function App() {
  const [labValues, setLabValues] = useState([]);
  const [image, setImage] = useState(null);
  const [hbValue, setHbValue] = useState(null);
  const [message, setMessage] = useState('');
  const [isOnMeds, setIsOnMeds] = useState(null);
  const [medications, setMedications] = useState(['']);
  const [step, setStep] = useState(1);

  const scanLabReport = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (!permissionResult.granted) {
      alert("Camera permission is required!");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({ base64: false });
    if (!result.canceled) {
      setImage(result.uri);
      const text = await TextRecognition.recognize(result.uri);

      // Extract numeric values
      const values = text.join(' ').match(/\d+(\.\d+)?/g)?.map(Number) || [];
      setLabValues(values);

      if (values.length > 0) {
        const latestHB = values[values.length - 1];
        setHbValue(latestHB);
        evaluateHB(latestHB);
      }
    }
  };

  const evaluateHB = (value) => {
    if (value > 19) {
      setMessage('See your doctor, your HB is high.');
    } else if (value < 8) {
      setMessage('You need to see your doctor ASAP.');
    } else {
      setMessage('Your HB is normal.');
    }
  };

  const handleMedChange = (text, index) => {
    const newMeds = [...medications];
    newMeds[index] = text;
    setMedications(newMeds);
  };

  const addMedicationField = () => {
    if (medications.length < 5) {
      setMedications([...medications, '']);
    }
  };

  const handleFinalCheck = () => {
    if (hbValue > 19 && medications.some(m => m.toLowerCase().includes('iron'))) {
      setMessage('Stop that and see your doctor!');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.center}>
        <Text style={styles.title}>Haemoglobin Checker</Text>

        <TouchableOpacity style={styles.button} onPress={scanLabReport}>
          <Text style={styles.buttonText}>Scan Lab Report</Text>
        </TouchableOpacity>

        {image && <Image source={{ uri: image }} style={styles.image} />}

        {labValues.length > 0 && (
          <>
            <Text style={styles.text}>Detected HB Value: {hbValue}</Text>
            <Text style={styles.text}>{message}</Text>

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
                color: (opacity = 1) => `rgba(0,0,0,${opacity})`,
                labelColor: (opacity = 1) => `rgba(0,0,0,${opacity})`,
              }}
              style={{ marginVertical: 20 }}
            />

            {step === 1 && (
              <>
                <Text style={styles.text}>Are you under any medication?</Text>
                <View style={styles.row}>
                  <TouchableOpacity
                    style={styles.smallButton}
                    onPress={() => {
                      setIsOnMeds(false);
                      setStep(3);
                      setMessage('Great!');
                    }}
                  >
                    <Text style={styles.buttonText}>No</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.smallButton}
                    onPress={() => {
                      setIsOnMeds(true);
                      setStep(2);
                    }}
                  >
                    <Text style={styles.buttonText}>Yes</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

            {step === 2 && (
              <>
                <Text style={styles.text}>Which medications are you taking?</Text>
                {medications.map((med, index) => (
                  <TextInput
                    key={index}
                    placeholder={`Medication ${index + 1}`}
                    value={med}
                    onChangeText={(text) => handleMedChange(text, index)}
                    style={styles.input}
                  />
                ))}
                {medications.length < 5 && (
                  <TouchableOpacity style={styles.smallButton} onPress={addMedicationField}>
                    <Text style={styles.buttonText}>+ Add Another</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={styles.button}
                  onPress={() => {
                    setStep(3);
                    handleFinalCheck();
                  }}
                >
                  <Text style={styles.buttonText}>Submit Medications</Text>
                </TouchableOpacity>
              </>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'teal',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 20,
  },
  text: {
    color: '#fff',
    fontSize: 16,
    marginVertical: 10,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#004d4d',
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
    width: '80%',
    alignItems: 'center',
  },
  smallButton: {
    backgroundColor: '#006666',
    padding: 10,
    borderRadius: 8,
    margin: 5,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    width: '80%',
    marginVertical: 8,
  },
  image: {
    width: 200,
    height: 200,
    marginVertical: 15,
    borderRadius: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 10,
  },
});

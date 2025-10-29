import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';

const screenWidth = Dimensions.get('window').width;

export default function App() {
  const [hbValue, setHbValue] = useState('');
  const [labValues, setLabValues] = useState([]);
  const [message, setMessage] = useState('');
  const [isOnMeds, setIsOnMeds] = useState(null);
  const [medications, setMedications] = useState(['']);
  const [step, setStep] = useState(1);

  // Evaluate HB
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
    const hbNum = parseFloat(hbValue);
    if (hbNum > 19 && medications.some((m) => m.toLowerCase().includes('iron'))) {
      setMessage('Stop that and see your doctor!');
    }
    setLabValues([...labValues, hbNum]);
  };

  const handleHBSubmit = () => {
    const hbNum = parseFloat(hbValue);
    if (!isNaN(hbNum)) {
      evaluateHB(hbNum);
      setStep(1.5); // move to medication question
    } else {
      alert('Please enter a valid number for HB.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.center}>
        <Text style={styles.title}>Haemoglobin Checker</Text>

        {/* Manual HB input */}
        {(step === 1) && (
          <>
            <Text style={styles.text}>Enter your Haemoglobin (HB) value:</Text>
            <TextInput
              placeholder="e.g., 12.5"
              keyboardType="numeric"
              value={hbValue}
              onChangeText={setHbValue}
              style={styles.input}
            />
            <TouchableOpacity style={styles.button} onPress={handleHBSubmit}>
              <Text style={styles.buttonText}>Submit HB</Text>
            </TouchableOpacity>
          </>
        )}

        {/* Medication question */}
        {(step === 1.5) && (
          <>
            <Text style={styles.text}>Are you under any medication?</Text>
            <View style={styles.row}>
              <TouchableOpacity
                style={styles.smallButton}
                onPress={() => {
                  setIsOnMeds(false);
                  setStep(3);
                  setMessage('Great!');
                  setLabValues([...labValues, parseFloat(hbValue)]);
                }}
              >
                <Text style={styles.buttonText}>No</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.smallButton}
                onPress={() => setStep(2)}
              >
                <Text style={styles.buttonText}>Yes</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* Medication input */}
        {(step === 2) && (
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
                handleFinalCheck();
                setStep(3);
              }}
            >
              <Text style={styles.buttonText}>Submit Medications</Text>
            </TouchableOpacity>
          </>
        )}

        {/* Results */}
        {step >= 3 && (
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
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'teal' },
  center: { alignItems: 'center', justifyContent: 'center', padding: 20 },
  title: { color: '#fff', fontSize: 26, fontWeight: 'bold', marginVertical: 20 },
  text: { color: '#fff', fontSize: 16, marginVertical: 8, textAlign: 'center' },
  button: { backgroundColor: '#004d4d', padding: 12, borderRadius: 10, margin: 5, alignItems: 'center' },
  smallButton: { backgroundColor: '#006666', padding: 10, borderRadius: 8, margin: 5 },
  buttonText: { color: 'white', fontWeight: 'bold' },
  input: { backgroundColor: '#fff', borderRadius: 8, padding: 10, width: '80%', marginVertical: 8 },
  row: { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap' },
});

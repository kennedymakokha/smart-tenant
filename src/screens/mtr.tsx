// import React, { useEffect, useRef, useState } from 'react';
// import { View, Text, Button, StyleSheet, Image } from 'react-native';
// import RNFS from 'react-native-fs';
// import TextRecognition from '@react-native-ml-kit/text-recognition';
// import { Camera, useCameraDevices, CameraPermissionStatus, useCameraDevice } from 'react-native-vision-camera';

// import type { Camera as CameraType, PhotoFile } from 'react-native-vision-camera';

// export default function MeterScanner() {
//     const camera = useRef<CameraType>(null);
//     const [hasPermission, setHasPermission] = useState<boolean>(false);
//     const [meterReading, setMeterReading] = useState<string>('');
//     const [meterNumber, setMeterNumber] = useState<string>('');
//     const [photoUri, setPhotoUri] = useState<string | null>(null);

//     const devices = useCameraDevices();

//     const device = useCameraDevice("back")

//     useEffect(() => {
//         (async () => {
//             let status = await Camera.getCameraPermissionStatus();

//             if (status !== 'granted') {
//                 status = await Camera.requestCameraPermission();
//             }

//             if (status === 'denied') {
//                 // show a prompt or navigate away
//                 console.warn('Camera permission denied');
//             }
//         })();
//     }, []);
//     // useEffect(() => {
//     //     const requestPermission = async () => {
//     //         const permission: CameraPermissionStatus = await Camera.requestCameraPermission();
//     //         setHasPermission(permission === 'authorized');
//     //     };
//     //     requestPermission();
//     // }, []);

//     const takePhoto = async () => {
//         if (camera.current == null) return;

//         try {
//             const photo: PhotoFile = await camera.current.takePhoto({ flash: 'off' });
//             setPhotoUri(photo.path);
//             recognize(photo.path);
//         } catch (error) {
//             console.error('Error taking photo:', error);
//         }
//     };


//     const recognize = async (imagePath: string) => {
//         try {
//             const base64Image = await RNFS.readFile(imagePath, 'base64');
//             const result = await TextRecognition.recognize(`data:image/jpeg;base64,${base64Image}`);
//             console.log(result)
//             const extractedText = result.text;
//             console.log(result)
//             const meterNumMatch = extractedText.match(/\b\d{4}\s?\d{6,7}\b/);
//             const meterReadMatch = extractedText.match(/\b0*([1-9]\d{0,6})\b/);

//             setMeterNumber(meterNumMatch ? meterNumMatch[0].replace(/\s/g, '') : 'Not found');
//             setMeterReading(meterReadMatch ? meterReadMatch[1] : 'Not found');
//         } catch (error) {
//             console.error('Text recognition failed:', error);
//         }
//     };

//     if (device == null) {
//         return <Text>Loading camera...</Text>;
//     }

//     return (
//         <View style={styles.container}>
//             {photoUri ? (
//                 <Image source={{ uri: 'file://' + photoUri }} style={styles.preview} />
//             ) : (
//                 <Camera
//                     style={styles.camera}
//                     device={device}
//                     isActive={true}
//                     photo={true}
//                     ref={camera}
//                 />
//             )}
//             <Button title="Scan Meter" onPress={takePhoto} />
//             <Text style={styles.text}>Meter Number: {meterNumber}</Text>
//             <Text style={styles.text}>Meter Reading: {meterReading} m³</Text>
//             {photoUri && <Button title="Retake" onPress={() => setPhotoUri(null)} />}
//         </View>
//     );
// }

// const styles = StyleSheet.create({
//     container: { flex: 1, justifyContent: 'center', backgroundColor: '#fff' },
//     camera: { flex: 1 },
//     preview: { flex: 1, resizeMode: 'contain' },
//     text: { fontSize: 18, margin: 10, textAlign: 'center' },
// });

//Importación SDK firebase
import firebase from 'firebase/compat/app';
//Importación del servicio de firestore
import 'firebase/compat/firestore';

//import {getAuth, signInWithEmailAndPassword  } from 'firebase/auth';


// const firebaseConfig = {
//   apiKey: 'AIzaSyDU3Z1kXa0YXkechiMp115gvQuUcE4d26o',
//   authDomain: 'auto-factura-erps.firebaseapp.com',
//   databaseURL: 'https://auto-factura-erps-default-rtdb.firebaseio.com',
//   projectId: 'auto-factura-erps',
//   storageBucket: 'auto-factura-erps.appspot.com',
//   messagingSenderId: '1082492640140',
//   appId:'1:1082492640140:web:ffb23640f51dadd694d4a9',
//   measurementId: 'G-ZM6NQFHN2H'
// };

const firebaseConfig = {
  apiKey: "AIzaSyBYm8n5s34J9HuXuhvsYHrfoWjqKApjYjs",
  authDomain: "react-firestore-9bb26.firebaseapp.com",
  projectId: "react-firestore-9bb26",
  storageBucket: "react-firestore-9bb26.appspot.com",
  messagingSenderId: "643266613004",
  appId: "1:643266613004:web:2220b4be0ce088b3124329"
};
  
//Inicialización del servicio de firebase
firebase.initializeApp(firebaseConfig);

// const auth = getAuth();

// signInWithEmailAndPassword(auth, 'jose.campos@corporativomac.com', 'ZgYb9h>R!')
//   .then((userCredential) => {
//     // Signed in
//     //const user = userCredential.user;

//     //console.log(user)
//     // ...
//   })
//   .catch((error) => {
//     //const errorCode = error.code;
//     //console.log(errorCode)
//     //const errorMessage = error.message;
//     //console.log(errorMessage)
//   });

//Exportar el espacio de almacenamiento de base de datos firestore
export const inventarioStore = firebase.firestore();

//Exportar el identificador de la colección de soliitudes de calendario events
export const almacenStore = 'almacenes'
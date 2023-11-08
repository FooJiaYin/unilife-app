import firebase from "firebase/compat/app";
import 'firebase/compat/auth'
import "firebase/compat/firestore";
import "firebase/compat/storage";

import AsyncStorage from '@react-native-async-storage/async-storage';
import {initializeAuth} from 'firebase/auth';
import {getReactNativePersistence} from 'firebase/auth/react-native';

const firebaseConfig = {
  apiKey: 'AIzaSyDP3xjeH4nMBWQB4Mtf9HmnYM1d8cWrDY8',
  authDomain: 'gleaming-bot-319115.firebaseapp.com',
  databaseURL: 'https://gleaming-bot-319115.firebaseio.com',
  projectId: 'gleaming-bot-319115',
  storageBucket: 'gleaming-bot-319115.appspot.com',
  appId: '1:898870383375:android:a26f4b4a55268eee68a47a',
}

if (!firebase.apps.length) {
    const app = firebase.initializeApp(firebaseConfig)
    initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
}

export { firebase }

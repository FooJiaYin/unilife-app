import firebase from 'firebase'
import '@firebase/auth'
import '@firebase/firestore'

const firebaseConfig = {
  // apiKey: 'AIzaSyAOWHBpPhKoNhcGFKHH_Q_0AtL2gV-imgQ',
  // authDomain: 'production-a9404.firebaseapp.com',
  // databaseURL: 'https://production-a9404.firebaseio.com',
  // projectId: 'production-a9404',
  // storageBucket: 'production-a9404.appspot.com',
  // messagingSenderId: '525472070731',
  // appId: '1:525472070731:web:ee873bd62c0deb7eba61ce',
  apiKey: 'AIzaSyDP3xjeH4nMBWQB4Mtf9HmnYM1d8cWrDY8',
  authDomain: 'gleaming-bot-319115.firebaseapp.com',
  databaseURL: 'https://gleaming-bot-319115.firebaseio.com',
  projectId: 'gleaming-bot-319115',
  storageBucket: 'gleaming-bot-319115.appspot.com',
  appId: '1:898870383375:android:a26f4b4a55268eee68a47a',
}

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig)
}

export { firebase }

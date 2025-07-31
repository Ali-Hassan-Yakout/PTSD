// Initialize Firebase only once
if (!firebase.apps.length) {
  const firebaseConfig = {
    apiKey: "AIzaSyDuqPh18UT_pvjOsh3geYAMQFzQqEPJMN8",
    authDomain: "ptsd-support-app-38a5e.firebaseapp.com",
    projectId: "ptsd-support-app-38a5e",
    storageBucket: "ptsd-support-app-38a5e.appspot.com",
    messagingSenderId: "37400059495",
    appId: "1:37400059495:web:3d4ed2ede976180eda3ec2",
    measurementId: "G-6RY52F2PSC"
  };

  firebase.initializeApp(firebaseConfig);
}

// Expose auth and firestore globally for easy access
window.auth = firebase.auth();
window.db = firebase.firestore();

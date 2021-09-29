import Firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";

// Here I want to import the seed file
// import { seedDatabase } from "../seed";

const config = {
    apiKey: "AIzaSyAIwtkmtFt839fJJSKJKO6l2EiioUZ3TaQ",
    authDomain: "instagram-web-87b3b.firebaseapp.com",
    projectId: "instagram-web-87b3b",
    storageBucket: "instagram-web-87b3b.appspot.com",
    messagingSenderId: "976084733456",
    appId: "1:976084733456:web:33900325d0bd4d16864495",
};

const firebase = Firebase.initializeApp(config);
const { FieldValue } = Firebase.firestore;

// Here is where I want to call the seed file (only ONCE!)
// seedDatabase(firebase);

export { firebase, FieldValue };

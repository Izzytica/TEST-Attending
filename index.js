// Import stylesheets
import './style.css';
// Firebase App (the core Firebase SDK) is always required and must be listed first
import * as firebase from "firebase/app";

// Add the Firebase products that you want to use
import "firebase/auth";
import "firebase/firestore";

import * as firebaseui from 'firebaseui';

// Document elements
const startRsvpButton = document.getElementById('startSRVP');
const guestbookContainer = document.getElementById('guestbook-container');

const form = document.getElementById('leave-message');
const input = document.getElementById('message');
const guestbook = document.getElementById('guestbook');
const numberAttending = document.getElementById('number-attending');
const rsvpYes = document.getElementById('rsvp-yes');
const rsvpNo = document.getElementById('rsvp-no');

var rsvpListener = null;
var guestbookListener = null;

// Add Firebase project configuration object here
const firebaseConfig = {
  apiKey: "AIzaSyBlrcLY83l-NOeH31gIPhYbKVJmshflacU",
  authDomain: "firbase-web-codelab.firebaseapp.com",
  databaseURL: "https://firbase-web-codelab.firebaseio.com",
  projectId: "firbase-web-codelab",
  storageBucket: "firbase-web-codelab.appspot.com",
  messagingSenderId: "799596633703",
  appId: "1:799596633703:web:7affde40b0e66b2fea7ec2"
};

firebase.initializeApp(firebaseConfig);

// FirebaseUI config
const uiConfig = {
  credentialHelper: firebaseui.auth.CredentialHelper.NONE,
  signInOptions: [
    // Email / Password Provider.
    firebase.auth.EmailAuthProvider.PROVIDER_ID
  ],
  callbacks: {
    signInSuccessWithAuthResult: function(authResult, redirectUrl){
      // Handle sign-in.
      // Return false to avoid redirect.
      return false;
    }
  }
};

const ui = new firebaseui.auth.AuthUI(firebase.auth());

startRsvpButton.addEventListener("click",
 () => {
    if (firebase.auth().currentUser) {
      // User is signed in; allows user to sign out
      firebase.auth().signOut();
    } else {
      // No user is signed in; allows user to sign in
      ui.start("#firebaseui-auth-container", uiConfig);
    }
});

   firebase.auth().onAuthStateChanged((user)=>{
 if(user){
   startRsvpButton.textContent = "LOGOUT";
   guestbookContainer.style.display="block";
 }else{
   startRsvpButton.textContent = "RSVP";
   guestbookContainer.style.display="none";
 }
});

form.addEventListener("submit", (e) => {
 e.preventDefault();
 firebase.firestore().collection("guestbook").add({
   text: input.value,
   timestamp: Date.now(),
   name: firebase.auth().currentUser.displayName,
   userId: firebase.auth().currentUser.uid
 });

 input.value = ""; 
 return false;
});

function subscribedGuestBook(){
guestbookListener = firebase.firestore().collection("guestbook").orderBy("timestamp","desc")
.onSnapshot((snaps)=> {
  guestbook.innerHTML = "";
  snaps.forEach((doc)=>{
   const entry = document.createElement("p");
   entry.textContent = doc.data().name + ": " + doc.data().text;
   guestbook.appendChild(entry);

  })
});
};

function unsubscribeGuestbook(){
  if (guestbookListener != null){
    guestbookListener();
    guestbookListener = null;
  }
}

rsvpYes.onClick = () => {
  const userDoc = firebase.firestone().collection('attendees')
  .doc(firebase.auth().currentUser.uid);
  userDoc.set({
    attending: true
  }).catch(console.error);
}
rsvpNo.onClick = () => {
  const userDoc = firebase.firestone().collection('attendees')
  .doc(firebase.auth().currentUser.uid);
  userDoc.set({
    attending: false
  }).catch(console.error);
}
firebase.firestore()
.collection('attendees')
.where("attending", "==", true)
.onSnapshot(snap => {
 const newAttendeeCount = snap.docs.length;

 numberAttending.innerHTML = newAttendeeCount+' people going'; 
})

function subscribeCurrentRSVP(user){
 rsvpListener = firebase.firestore()
 .collection('attendees')
 .doc(user.uid)
 .onSnapshot((doc) => {
   if (doc && doc.data()){
     const attendingResponse = doc.data().attending;

     // Update css classes for buttons
     if (attendingResponse){
       rsvpYes.className="clicked";
       rsvpNo.className="";
     }
     else{
       rsvpYes.className="";
       rsvpNo.className="clicked";
     }
   }
 });
}
function unsubscribeCurrentRSVP() {
  if (rsvpListener != null) {
    rsvpListener();
    rsvpListener = null;
  }
  rsvpYes.className=""
  rsvpNo.className="";
  }
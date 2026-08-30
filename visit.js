import { initializeApp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";
import {
  getFirestore,
  doc,
  setDoc,
  increment,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

const firebaseConfig = {
apiKey: "AIzaSyCzARg2JN-JBqoCfqsspzjIUaST2IwDKYk",
authDomain: "luis-portfolio-f74d1.firebaseapp.com",
projectId: "luis-portfolio-f74d1",
storageBucket: "luis-portfolio-f74d1.firebasestorage.app",
messagingSenderId: "400457420291",
appId: "1:400457420291:web:4d19da0998f2af5de88836"
};

const db = getFirestore(initializeApp(firebaseConfig));

(async function recordVisit() {
  if (sessionStorage.getItem("counted")) return;

  let source = "direct";
  if (document.referrer) {
    try {
      const host = new URL(document.referrer).hostname.replace(/^www\./, "");
      if (host !== location.hostname) source = host;
    } catch (e) {
      source = "unknown";
    }
  }

  const month = new Date().toISOString().slice(0, 7);

  try {
    await setDoc(
      doc(db, "stats", month),
      {
        total: increment(1),
        referrers: { [source]: increment(1) },
        updated: serverTimestamp(),
      },
      { merge: true }
    );
    sessionStorage.setItem("counted", "1");
  } catch (e) {
    console.warn("visit not recorded", e);
  }
})();
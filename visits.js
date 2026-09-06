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
  appId: "1:400457420291:web:4d19da0998f2af5de88836",
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

  let country = "unknown";
  let city = "unknown";
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2000);
    const res = await fetch("https://ipwho.is/", { signal: controller.signal });
    clearTimeout(timer);
    const geo = await res.json();
    if (geo.success) {
      country = geo.country || "unknown";
      city = geo.city || "unknown";
    }
  } catch (e) {
    // lookup failed or timed out, keep unknowns
  }

  const now = new Date();
  const local = new Date(now.getTime() + 8 * 3600 * 1000);
  const isLocal =
    ["localhost", "127.0.0.1"].includes(location.hostname) ||
    /^192\.168\./.test(location.hostname);
  const month = local.toISOString().slice(0, 7) + (isLocal ? "-dev" : "");
  const day = local.toISOString().slice(0, 10);

  try {
    await setDoc(
      doc(db, "stats", month),
      {
        total: increment(1),
        days: { [day]: increment(1) },
        referrers: { [source]: increment(1) },
        countries: { [country]: increment(1) },
        cities: { [city]: increment(1) },
        updated: serverTimestamp(),
      },
      { merge: true }
    );
    sessionStorage.setItem("counted", "1");
  } catch (e) {
    console.warn("visit not recorded", e);
  }
})();
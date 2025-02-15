import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import {
  getDatabase,
  ref,
  set,
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyAPqBbtP-KqLLVt0NcuVIKBDDz7jJa6Bak",
  authDomain: "ip-y2s2.firebaseapp.com",
  databaseURL: "https://ip-y2s2-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "ip-y2s2",
  storageBucket: "ip-y2s2.firebasestorage.app",
  messagingSenderId: "191631267863",
  appId: "1:191631267863:web:ada36be630772321afe452"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const supabaseUrl = "https://mjnybiaabxdhlsygnpdf.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1qbnliaWFhYnhkaGxzeWducGRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkxNzY2MzEsImV4cCI6MjA1NDc1MjYzMX0.PtVhJhKdMEHqO2ukXFjfmNS_6l0p5Q2Fcvg67TMremM";

const client = supabase.createClient(supabaseUrl, supabaseAnonKey);

const video = document.getElementById("webcam");
const captureButton = document.getElementById("captureButton");
const uploadButton = document.getElementById("uploadButton");
const fileInput = document.getElementById("fileInput");
const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");

let imageData;

// Start the webcam
async function startWebcam() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
  } catch (error) {
    console.error("Error accessing webcam, check permissions:", error);
  }
}

// Capture the photo from video feed to canvas
function capturePhoto() {
  context.drawImage(video, 0, 0, canvas.width, canvas.height);
  imageData = canvas.toDataURL("image/png");
  uploadButton.disabled = false;
  alert("Photo captured!");
}

// Handle file selection
function handleFileSelect(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(img, 0, 0, canvas.width, canvas.height);
      imageData = canvas.toDataURL("image/png");
      uploadButton.disabled = false;
      alert("Photo selected from PC!");
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

// Upload to Supabase
async function uploadToSupabase() {
  if (!imageData) {
    alert("No photo captured!");
    return;
  }

  const blob = await fetch(imageData).then((res) => res.blob());
  const fileName = `webcam/${Date.now()}.png`;

  try {
    const { data, error } = await client.storage
      .from("images")
      .upload(fileName, blob);

    if (error) {
      console.error(error);
      throw error;
    }

    const publicUrlData = client.storage.from("images").getPublicUrl(fileName);
    const publicUrl = publicUrlData.data.publicUrl;

    const userId = localStorage.getItem("userId");
    if (userId) {
      const userRef = ref(db, `users/${userId}`);
      await set(userRef, { image: publicUrl });
      alert("Photo uploaded successfully!");
      window.location.href = "profile.html";
    } else {
      alert("User not logged in!");
    }
  } catch (error) {
    alert("Error uploading photo: " + error.message);
  }
}

// Event listeners
captureButton.addEventListener("click", capturePhoto);
uploadButton.addEventListener("click", uploadToSupabase);
fileInput.addEventListener("change", handleFileSelect);
window.addEventListener("load", startWebcam);
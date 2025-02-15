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
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import { getDatabase, ref, set, get, child } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";
import { getFirestore, collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const dbRealtime = getDatabase(app);
const dbFirestore = getFirestore(app);

// Sign Up Function
document.getElementById("sign-up-btn").addEventListener("click", async () => {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const username = document.getElementById("username").value; // Added username field
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Set displayName (username) in Firebase Authentication
        await updateProfile(user, {
            displayName: username
        });

        // Adding user data to Realtime Database
        const userRef = ref(dbRealtime, 'users/' + user.uid);
        await set(userRef, {
            email: user.email,
            uid: user.uid,
            username: username,
            createdAt: new Date().toISOString(),
        });

        console.log("User signed up and added to Realtime Database");

        // Redirect to Dashboard after successful sign-up
        window.location.href = "index.html"; // Make sure to have a dashboard.html page

    } catch (error) {
        console.error("Error signing up:", error);
        document.getElementById("user-info").innerHTML = "Error: " + error.message;
    }
});

// Sign In Function
document.getElementById("sign-in-btn").addEventListener("click", async () => {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Redirect to Dashboard after successful sign-in
        window.location.href = "index.html"; // Make sure to have a dashboard.html page

    } catch (error) {
        console.error("Error signing in:", error);
        document.getElementById("user-info").innerHTML = "Error: " + error.message;
    }
});

// Sign Out Function
document.getElementById("sign-out-btn").addEventListener("click", async () => {
    await signOut(auth);
    document.getElementById("user-info").innerHTML = "You have signed out.";
    document.getElementById("sign-in-btn").style.display = "inline";
    document.getElementById("sign-out-btn").style.display = "none";
});

// Fetch Data from Realtime Database (on dashboard)
async function fetchRealtimeUserData() {
    const dbRef = ref(dbRealtime);
    try {
        const snapshot = await get(child(dbRef, 'users/' + auth.currentUser.uid));
        if (snapshot.exists()) {
            console.log("User Data from Realtime Database:", snapshot.val());
            document.getElementById("user-info").innerHTML = `Welcome, ${snapshot.val().username}`;
        } else {
            console.log("No data available");
        }
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

// Fetch Data from Firestore
document.getElementById("fetch-firestore-btn").addEventListener("click", async () => {
    const querySnapshot = await getDocs(collection(dbFirestore, "users"));
    querySnapshot.forEach((doc) => {
        console.log(doc.id, " => ", doc.data());
    });
});

// Fetch Data from Realtime Database
document.getElementById("fetch-realtime-btn").addEventListener("click", async () => {
    const dbRef = ref(dbRealtime);
    try {
        const snapshot = await get(child(dbRef, 'users'));
        if (snapshot.exists()) {
            console.log("Data from Realtime Database:", snapshot.val());
        } else {
            console.log("No data available");
        }
    } catch (error) {
        console.error("Error fetching data:", error);
    }
});

// JavaScript to toggle navigation menu
// Place after your Firebase initialization and auth functions
// but before the profile button event listener

// Navigation functionality
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

hamburger.addEventListener('click', () => {
    // Toggle hamburger menu animation
    hamburger.classList.toggle('active');
    // Toggle navigation menu
    navLinks.classList.toggle('active');
});

// Close mobile menu when clicking a link
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navLinks.classList.remove('active');
    });
});

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
    if (!hamburger.contains(e.target) && !navLinks.contains(e.target)) {
        hamburger.classList.remove('active');
        navLinks.classList.remove('active');
    }
});

// Your existing profile button event listener can stay at the bottom
document.querySelector('.profile-button').addEventListener('click', function() {
    console.log('Profile button clicked!');
});

document.querySelector('.profile-button').addEventListener('click', function() {
    console.log('Profile button clicked!');
});

// Testimonial Carousel Logic
document.addEventListener('DOMContentLoaded', function () {
    const testimonialsContainer = document.querySelector(".testimonials-container");
    const testimonialsTrack = document.querySelector(".testimonials-track");
    const prevButton = document.querySelector(".scroll-btn.left");
    const nextButton = document.querySelector(".scroll-btn.right");

    if (!testimonialsContainer || !testimonialsTrack || !prevButton || !nextButton) return;

    const scrollAmount = 350; // Adjust as needed
    let scrollPosition = 0;

    // Disable prev button if at the start
    const checkScrollPosition = () => {
        if (scrollPosition === 0) {
            prevButton.disabled = true;
        } else {
            prevButton.disabled = false;
        }

        if (scrollPosition >= testimonialsTrack.scrollWidth - testimonialsContainer.clientWidth) {
            nextButton.disabled = true;
        } else {
            nextButton.disabled = false;
        }
    };

    // Scroll left or right
    const scrollTestimonials = (direction) => {
        scrollPosition = testimonialsContainer.scrollLeft;
        testimonialsContainer.scrollBy({
            left: direction * scrollAmount,
            behavior: "smooth",
        });

        // Update scroll position after smooth scroll
        setTimeout(() => {
            scrollPosition = testimonialsContainer.scrollLeft;
            checkScrollPosition();
        }, 300);
    };

    // Initial check for disabled buttons
    checkScrollPosition();

    // Event listeners for buttons
    prevButton.addEventListener('click', () => scrollTestimonials(-1));
    nextButton.addEventListener('click', () => scrollTestimonials(1));
});



export default Navigation;

function scrollTestimonials(direction) {
    const container = document.querySelector(".testimonials-container");
    const scrollAmount = 350; // Adjust as needed
    container.scrollBy({ left: direction * scrollAmount, behavior: "smooth" });
}
// login.js

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById('loginForm');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    try {
      const userCredential = await window.auth.signInWithEmailAndPassword(email, password);
      const uid = userCredential.user.uid;

      const userDoc = await window.db.collection("users").doc(uid).get();

      if (!userDoc.exists) {
        alert("User data not found in Firestore.");
        return;
      }

      const role = userDoc.data().role;

      if (role === "doctor") {
        window.location.href = "doctor-dashboard.html";
      } else if (role === "patient") {
        window.location.href = "welcome.html";
      } else {
        alert("User role not recognized.");
      }
    } catch (error) {
      alert("Login error: " + error.message);
    }
  });
});

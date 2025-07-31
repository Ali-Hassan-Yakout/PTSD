document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById('signupForm');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const fullName = document.getElementById('fullName').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const role = document.getElementById('role').value;
    const doctorCodeInput = document.getElementById('doctorCode').value.trim();

    // رمز الطبيب الصحيح (يمكنك تغييره هنا)
    const validDoctorCode = "PTSD123";

    if (role === "doctor") {
      if (doctorCodeInput !== validDoctorCode) {
        alert("Invalid Doctor Code! Please contact admin.");
        return; // إيقاف التسجيل
      }
    }

    try {
      const userCredential = await window.auth.createUserWithEmailAndPassword(email, password);
      const uid = userCredential.user.uid;

      await window.db.collection("users").doc(uid).set({
        fullName,
        email,
        role
      });

      alert("Account created successfully!");
      window.location.href = "login.html"; // Redirect to login page
    } catch (error) {
      alert("Error: " + error.message);
      console.error(error);
    }
  });
});

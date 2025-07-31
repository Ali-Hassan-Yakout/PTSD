// doctor-dashboard.js
const db = firebase.firestore();

function fetchPatients() {
  const patientsContainer = document.getElementById('patientsContainer');
  patientsContainer.innerHTML = 'Loading patients...';

  db.collection("users")
    .where("role", "==", "patient")
    .get()
    .then((querySnapshot) => {
      if (querySnapshot.empty) {
        patientsContainer.innerHTML = "<p>No patients found.</p>";
        return;
      }

      patientsContainer.innerHTML = '';
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const card = document.createElement('div');
        card.className = 'card';
        card.style.marginBottom = '15px';
        card.innerHTML = `
          <h3>${data.fullName}</h3>
          <p><strong>Email:</strong> ${data.email}</p>
          <button class="btn" onclick="viewPatientProfile('${doc.id}')">View Profile</button>
        `;
        patientsContainer.appendChild(card);
      });
    })
    .catch((error) => {
      console.error("Error loading patients:", error);
      patientsContainer.innerHTML = "<p>Failed to load patients.</p>";
    });
}

function viewPatientProfile(patientId) {
  // Redirect to a patient profile page - you can create this page
  window.location.href = `view-report.html?uid=${patientId}`;
}

window.addEventListener('DOMContentLoaded', fetchPatients);

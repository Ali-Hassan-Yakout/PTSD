const db = firebase.firestore();

firebase.auth().onAuthStateChanged(async user => {
  if (!user) return alert("يرجى تسجيل الدخول.");
  window.currentUser = user;
  await loadPatients();
});

async function loadPatients() {
  const select = document.getElementById("patientSelect");
  try {
    const snapshot = await db.collection("users").where("role", "==", "patient").get();
    select.innerHTML = '<option disabled selected>اختر المريض</option>';
    snapshot.forEach(doc => {
      const data = doc.data();
      select.innerHTML += `<option value="${doc.id}">${data.fullName}</option>`;
    });
  } catch (error) {
    console.error("فشل تحميل المرضى:", error);
    select.innerHTML = '<option disabled>فشل تحميل المرضى</option>';
  }
}

async function sendMessage() {
  const receiverId = document.getElementById("patientSelect").value;
  const message = document.getElementById("messageInput").value.trim();
  const senderId = window.currentUser.uid;

  if (!receiverId || !message) return;

  try {
    await db.collection("messages").add({
      senderId,
      receiverId,
      message,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });

    document.getElementById("messageInput").value = "";
    loadMessages();
  } catch (error) {
    showError("فشل في إرسال الرسالة: " + error.message);
  }
}

function showError(msg) {
  document.getElementById("errorBox").textContent = msg;
  setTimeout(() => {
    document.getElementById("errorBox").textContent = "";
  }, 5000);
}

function loadMessages() {
  const chatBox = document.getElementById("chatBox");
  const patientId = document.getElementById("patientSelect").value;
  const doctorId = window.currentUser.uid;

  if (!patientId) return;

  chatBox.innerHTML = "تحميل المحادثة...";

  db.collection("messages")
    .where("senderId", "in", [doctorId, patientId])
    .where("receiverId", "in", [doctorId, patientId])
    .orderBy("timestamp")
    .onSnapshot(snapshot => {
      chatBox.innerHTML = "";
      snapshot.forEach(doc => {
        const msg = doc.data();
        const isDoctor = msg.senderId === doctorId;
        const msgDiv = document.createElement("div");
        msgDiv.className = "msg " + (isDoctor ? "you" : "other");

        const time = msg.timestamp?.toDate?.().toLocaleString("ar-EG", {
          hour: '2-digit',
          minute: '2-digit',
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        }) || 'بدون وقت';

        msgDiv.innerHTML = `
          <div>${msg.message}</div>
          <div class="timestamp">${time}</div>
        `;
        chatBox.appendChild(msgDiv);
      });
      chatBox.scrollTop = chatBox.scrollHeight;
    }, error => {
      showError("فشل في تحميل الرسائل: " + error.message);
    });
}

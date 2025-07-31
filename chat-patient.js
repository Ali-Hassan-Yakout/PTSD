const db = firebase.firestore();
let patientId = null;
let doctorId = null;

firebase.auth().onAuthStateChanged(user => {
  if (!user) return;
  patientId = user.uid;

  // Get doctor ID from the first message sent to the patient
  db.collection("messages")
    .where("receiverId", "==", patientId)
    .orderBy("timestamp", "desc")
    .limit(1)
    .get()
    .then(snapshot => {
      if (snapshot.empty) {
        document.getElementById("chatBox").innerHTML = "لا توجد محادثات بعد.";
      } else {
        doctorId = snapshot.docs[0].data().senderId;
        loadMessages();
      }
    });
});

function sendMessage() {
  const msg = document.getElementById('messageInput').value.trim();
  if (!msg || !doctorId) return alert("لا يوجد طبيب محدد أو الرسالة فارغة");

  db.collection("messages").add({
    senderId: patientId,
    receiverId: doctorId,
    message: msg,
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  }).then(() => {
    document.getElementById('messageInput').value = "";
  });
}

function loadMessages() {
  const box = document.getElementById('chatBox');
  db.collection("messages")
    .where("receiverId", "in", [patientId, doctorId])
    .orderBy("timestamp")
    .onSnapshot(snapshot => {
      box.innerHTML = "";
      snapshot.forEach(doc => {
        const data = doc.data();
        if (
          (data.senderId === patientId && data.receiverId === doctorId) ||
          (data.senderId === doctorId && data.receiverId === patientId)
        ) {
          const div = document.createElement('div');
          div.className = "msg " + (data.senderId === patientId ? "you" : "other");

          const time = data.timestamp?.toDate().toLocaleTimeString('ar-EG', {
            hour: '2-digit',
            minute: '2-digit'
          }) || '';

          div.innerHTML = `<strong>${data.senderId === patientId ? "أنت" : "الطبيب"}:</strong><br>${data.message}<br><small>${time}</small>`;
          box.appendChild(div);
        }
      });
      box.scrollTop = box.scrollHeight;
    });
}

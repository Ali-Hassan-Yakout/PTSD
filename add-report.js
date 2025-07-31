const db = firebase.firestore();

const form = document.getElementById('reportForm');

form.addEventListener('submit', function (e) {
  e.preventDefault();

  const patientId = document.getElementById('userId').value.trim();
  const diagnosis = document.getElementById('diagnosis').value.trim();
  const notes = document.getElementById('notes').value.trim();

  if (!patientId || !diagnosis) {
    alert("الرجاء تعبئة كل الحقول المطلوبة.");
    return;
  }

  db.collection("reports").add({
    patientId: patientId,
    diagnosis: diagnosis,
    notes: notes,
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  })
    .then(() => {
      alert("تم حفظ التقرير بنجاح.");
      form.reset();
    })
    .catch(error => {
      console.error("حدث خطأ أثناء الحفظ:", error);
      alert("فشل في إرسال التقرير. حاول مرة أخرى.");
    });
});

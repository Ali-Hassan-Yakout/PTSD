const db = firebase.firestore();

async function getReport() {
  const userId = document.getElementById("userIdInput").value.trim();
  const container = document.getElementById("reportContainer");
  container.innerHTML = "";

  if (!userId) {
    alert("من فضلك أدخل معرف المستخدم");
    return;
  }

  try {
    const snapshot = await db
      .collection("reports")
      .where("patientId", "==", userId)
      .orderBy("timestamp", "desc") // تأكد من وجود index في Firestore لهذا الاستعلام
      .limit(1)
      .get();

    if (snapshot.empty) {
      container.innerHTML = "<p>لا يوجد تقرير مرتبط بهذا المعرف.</p>";
      return;
    }

    snapshot.forEach((doc) => {
      const data = doc.data();
      const date = data.timestamp
        ? new Date(data.timestamp.seconds * 1000).toLocaleString()
        : "غير متوفر";

      container.innerHTML = `
        <h3>تقرير الطبيب</h3>
        <p><strong>التشخيص:</strong> ${data.diagnosis}</p>
        <p><strong>ملاحظات:</strong> ${data.notes || "لا توجد ملاحظات إضافية"}</p>
        <p><strong>تاريخ التقرير:</strong> ${date}</p>
      `;
    });
  } catch (error) {
    console.error("حدث خطأ أثناء تحميل التقرير:", error);
    container.innerHTML = "<p>حدث خطأ أثناء تحميل التقرير.</p>";
  }
}

document.getElementById("viewReportBtn").addEventListener("click", getReport);

const db = firebase.firestore();

async function getReport() {
  const userId = document.getElementById("userIdInput").value.trim();
  const container = document.getElementById("reportContainer");

  // Reset UI
  container.innerHTML = "";
  container.style.display = "none";

  if (!userId) {
    alert("من فضلك أدخل معرف المستخدم");
    return;
  }

  console.log("Looking for patientId:", userId);

  // Show loading spinner
  container.innerHTML = `
    <div class="loading-spinner">
      <i class="fas fa-spinner fa-spin me-2"></i>
      جاري تحميل التقرير...
    </div>
  `;
  container.style.display = "block";

  try {
    const snapshot = await db
      .collection("reports")
      .where("patientId", "==", userId)
      .orderBy("timestamp", "desc")
      .limit(1)
      .get();

    console.log("Query result size:", snapshot.size);

    if (snapshot.empty) {
      container.innerHTML = `
        <div class="alert alert-warning">
          <i class="fas fa-exclamation-circle me-2"></i>
          لا يوجد تقرير مرتبط بهذا المعرف.
        </div>
      `;
      return;
    }

    snapshot.forEach((doc) => {
      const data = doc.data();
      console.log("Report data:", data);

      // Handle timestamp formats safely
      const date = data.timestamp?.toDate?.()
        ? data.timestamp.toDate().toLocaleString("ar-EG")
        : new Date(data.timestamp.seconds * 1000).toLocaleString("ar-EG");

      container.innerHTML = `
        <div class="report-section">
          <h5><i class="fas fa-notes-medical me-2"></i> التشخيص</h5>
          <p>${data.diagnosis || "غير متوفر"}</p>
        </div>
        <div class="report-section">
          <h5><i class="fas fa-comment-medical me-2"></i> ملاحظات الطبيب</h5>
          <p>${data.notes || "لا توجد ملاحظات إضافية"}</p>
        </div>
        <div class="report-section">
          <h5><i class="fas fa-calendar-alt me-2"></i> تاريخ التقرير</h5>
          <p>${date}</p>
        </div>
      `;
    });
  } catch (error) {
    console.error("حدث خطأ أثناء تحميل التقرير:", error);
    container.innerHTML = `
      <div class="alert alert-danger">
        <i class="fas fa-times-circle me-2"></i>
        حدث خطأ أثناء تحميل التقرير. حاول مرة أخرى لاحقًا.
      </div>
    `;
  }
}

document
  .getElementById("viewReportBtn")
  .addEventListener("click", getReport);

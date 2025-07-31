document.addEventListener('DOMContentLoaded', () => {
  const title = document.getElementById('result-title');
  const message = document.getElementById('result-message');
  const contactBtn = document.getElementById('contactBtn');

  const score = localStorage.getItem('assessmentScore') || 0; // النتيجة من الاستبيان
  let recommendation = "";

  if (score < 10) {
    title.textContent = "Assessment Result: Low Risk";
    message.textContent = "Your symptoms seem mild. Keep monitoring.";
    recommendation = "المساعدة الذاتية";
  } else if (score < 20) {
    title.textContent = "Assessment Result: Moderate Risk";
    message.textContent = "You may benefit from speaking with peers.";
    recommendation = "مجموعة الدعم";
  } else {
    title.textContent = "Assessment Result: High Risk";
    message.textContent = "We strongly recommend consulting a specialist.";
    recommendation = "التحدث مع طبيب";
  }

  // حفظ التوصية
  localStorage.setItem('recommendation', recommendation);

  // عند الضغط على الزر
  contactBtn.addEventListener('click', () => {
    window.location.href = "recommendation.html";
  });
});

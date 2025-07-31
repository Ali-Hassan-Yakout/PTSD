// result.js - Enhanced result page functionality with proper Arabic support

document.addEventListener('DOMContentLoaded', () => {
  const title = document.getElementById('result-title');
  const message = document.getElementById('result-message');
  const contactBtn = document.getElementById('contactBtn');

  // Get assessment data
  const score = parseInt(localStorage.getItem('assessmentScore') || 0);
  const assessmentData = JSON.parse(localStorage.getItem('assessmentData') || '{}');
  
  // Determine severity level and recommendations
  let severityLevel = '';
  let severityClass = '';
  let recommendation = '';
  let detailedMessage = '';
  let icon = '';

  // Analyze score and provide appropriate recommendations
  if (score <= 9) {
    severityLevel = 'منخفض';
    severityClass = 'severity-low';
    recommendation = 'المساعدة الذاتية';
    detailedMessage = `
      <p class="mb-3">أعراضك تبدو خفيفة نسبياً. نوصي بـ:</p>
      <ul class="list-unstyled">
        <li><i class="fas fa-check-circle text-success me-2"></i>ممارسة تقنيات الاسترخاء والتنفس العميق</li>
        <li><i class="fas fa-check-circle text-success me-2"></i>الحفاظ على روتين يومي منتظم</li>
        <li><i class="fas fa-check-circle text-success me-2"></i>البقاء على تواصل مع العائلة والأصدقاء</li>
        <li><i class="fas fa-check-circle text-success me-2"></i>ممارسة الرياضة الخفيفة بانتظام</li>
      </ul>
    `;
    icon = 'fas fa-heart';
  } else if (score <= 17) {
    severityLevel = 'متوسط';
    severityClass = 'severity-medium';
    recommendation = 'مجموعة الدعم';
    detailedMessage = `
      <p class="mb-3">أعراضك متوسطة. نوصي بـ:</p>
      <ul class="list-unstyled">
        <li><i class="fas fa-users text-warning me-2"></i>الانضمام لمجموعات الدعم النفسي</li>
        <li><i class="fas fa-users text-warning me-2"></i>التحدث مع أشخاص مروا بتجارب مشابهة</li>
        <li><i class="fas fa-users text-warning me-2"></i>ممارسة تقنيات التأمل واليقظة الذهنية</li>
        <li><i class="fas fa-users text-warning me-2"></i>تتبع الأعراض في دفتر يومي</li>
      </ul>
    `;
    icon = 'fas fa-users';
  } else if (score <= 25) {
    severityLevel = 'عالي';
    severityClass = 'severity-high';
    recommendation = 'التحدث مع طبيب';
    detailedMessage = `
      <p class="mb-3">أعراضك عالية نسبياً. نوصي بشدة بـ:</p>
      <ul class="list-unstyled">
        <li><i class="fas fa-user-md text-danger me-2"></i>استشارة طبيب نفسي متخصص</li>
        <li><i class="fas fa-user-md text-danger me-2"></i>الحصول على تقييم شامل للحالة</li>
        <li><i class="fas fa-user-md text-danger me-2"></i>البدء في خطة علاج منظمة</li>
        <li><i class="fas fa-user-md text-danger me-2"></i>الانضمام لمجموعات الدعم المتخصصة</li>
      </ul>
    `;
    icon = 'fas fa-user-md';
  } else {
    severityLevel = 'حرج';
    severityClass = 'severity-critical';
    recommendation = 'استشارة طبيب عاجلة';
    detailedMessage = `
      <p class="mb-3 text-danger fw-bold">أعراضك حرجة وتتطلب تدخل فوري:</p>
      <ul class="list-unstyled">
        <li><i class="fas fa-exclamation-triangle text-danger me-2"></i>استشارة طبيب نفسي فورية</li>
        <li><i class="fas fa-exclamation-triangle text-danger me-2"></i>الحصول على دعم طبي متخصص</li>
        <li><i class="fas fa-exclamation-triangle text-danger me-2"></i>البقاء تحت إشراف طبي منتظم</li>
        <li><i class="fas fa-exclamation-triangle text-danger me-2"></i>تجنب العزلة والبقاء على تواصل مع الدعم</li>
      </ul>
    `;
    icon = 'fas fa-exclamation-triangle';
  }

  // Update UI with results
  title.innerHTML = `
    <i class="${icon} me-2"></i>
    نتيجة التقييم: ${severityLevel}
    <span class="severity-indicator ${severityClass}"></span>
  `;

  message.innerHTML = `
    <div class="row">
      <div class="col-md-8">
        ${detailedMessage}
      </div>
      <div class="col-md-4">
        <div class="card bg-light">
          <div class="card-body text-center">
            <h6 class="card-title">الدرجة الإجمالية</h6>
            <div class="display-4 text-primary fw-bold">${score}</div>
            <small class="text-muted">من أصل 25</small>
          </div>
        </div>
      </div>
    </div>
  `;

  // Show contact button with appropriate action
  contactBtn.style.display = 'block';
  contactBtn.innerHTML = `
    <i class="fas fa-lightbulb me-2"></i>
    ${recommendation}
  `;

  // Handle contact button click
  contactBtn.addEventListener('click', () => {
    window.location.href = "recommendation.html";
  });
});

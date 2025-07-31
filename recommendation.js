document.addEventListener('DOMContentLoaded', () => {
    const title = document.getElementById('recommend-title');
    const text = document.getElementById('recommend-text');
  
    // جلب التوصية من LocalStorage (تم حفظها في result.js)
    const recommendation = localStorage.getItem('recommendation') || "التحدث مع طبيب";
  
    // عرض التوصية
    text.innerHTML = `نوصي لك بـ: <strong>${recommendation}</strong>`;
  
    // أزرار التنقل
    window.goToDoctor = () => {
      window.location.href = "chat-patient.html";
    }
  
    window.goToGroup = () => {
      window.location.href = "group-support.html";
    }
  
    window.goToSelfHelp = () => {
      window.location.href = "self-help.html";
    }
  });
  
// recommendation.js - Enhanced recommendation functionality

document.addEventListener('DOMContentLoaded', () => {
  const scoreDisplay = document.getElementById('scoreDisplay');
  const mainRecommendation = document.getElementById('mainRecommendation');
  const recommendationDescription = document.getElementById('recommendationDescription');
  const primaryActionBtn = document.getElementById('primaryActionBtn');

  // Get assessment data
  const score = parseInt(localStorage.getItem('assessmentScore') || 0);
  const recommendation = localStorage.getItem('recommendation') || '';

  // Update score display
  scoreDisplay.textContent = score;

  // Determine recommendation based on score
  let recommendationText = '';
  let descriptionText = '';
  let actionUrl = '';
  let actionText = '';

  if (score <= 9) {
    recommendationText = 'أدوات المساعدة الذاتية';
    descriptionText = 'أعراضك خفيفة نسبياً. يمكنك الاستفادة من أدوات المساعدة الذاتية.';
    actionUrl = 'self-help.html';
    actionText = 'استكشف أدوات المساعدة الذاتية';
  } else if (score <= 17) {
    recommendationText = 'الدعم الجماعي';
    descriptionText = 'أعراضك متوسطة. نوصي بالانضمام لمجموعات الدعم النفسي.';
    actionUrl = 'group-support.html';
    actionText = 'انضم لمجموعات الدعم';
  } else {
    recommendationText = 'التحدث مع طبيب مختص';
    descriptionText = 'أعراضك عالية نسبياً. نوصي بشدة باستشارة طبيب نفسي متخصص.';
    actionUrl = 'go-doctor.html';
    actionText = 'احجز موعد مع طبيب';
  }

  // Update UI
  mainRecommendation.textContent = recommendationText;
  recommendationDescription.textContent = descriptionText;

  // Update primary action button
  primaryActionBtn.textContent = actionText;
  primaryActionBtn.innerHTML = `<i class="fas fa-play me-2"></i>${actionText}`;
  primaryActionBtn.onclick = () => {
    window.location.href = actionUrl;
  };

  // Add severity indicator
  const severityClass = score <= 9 ? 'text-success' : 
                       score <= 17 ? 'text-warning' : 
                       score <= 25 ? 'text-danger' : 'text-danger';
  
  mainRecommendation.className = severityClass;

  // Save recommendation data to Firebase if user is logged in
  if (window.auth && window.auth.currentUser) {
    try {
      const user = window.auth.currentUser;
      const recommendationData = {
        userId: user.uid,
        score: score,
        recommendation: recommendationText,
        actionUrl: actionUrl,
        timestamp: new Date()
      };

      window.db.collection('recommendations').add(recommendationData)
        .then(() => {
          console.log('Recommendation saved to Firebase');
        })
        .catch(error => {
          console.error('Error saving recommendation:', error);
        });
    } catch (error) {
      console.error('Error with Firebase integration:', error);
    }
  }

  // Add smooth animations
  setTimeout(() => {
    scoreDisplay.style.opacity = '1';
    mainRecommendation.style.opacity = '1';
  }, 500);
});
  
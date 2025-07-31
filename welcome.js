const video = document.getElementById('welcomeVideo');
const playWithSoundBtn = document.getElementById('playWithSound');
const loadingOverlay = document.getElementById('loadingOverlay');

// عند انتهاء الفيديو انتقل لصفحة الأسئلة
video.onended = function () {
    goToQuestions();
};

// إخفاء عبارة "جاري تحميل الفيديو الترحيبي..." عند جهوزية الفيديو
video.addEventListener('canplaythrough', function () {
    loadingOverlay.style.display = 'none';
});

// زر "تشغيل بالصوت"
playWithSoundBtn.addEventListener('click', function () {
    video.muted = false; // إلغاء كتم الصوت
    video.currentTime = 0; // إعادة الفيديو للبداية
    video.play();
    playWithSoundBtn.style.display = 'none'; // إخفاء الزر بعد التشغيل بالصوت
});

// زر "تخطي"
function goToQuestions() {
    window.location.href = "questionnaire.html";
}

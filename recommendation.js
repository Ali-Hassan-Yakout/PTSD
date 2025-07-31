// recommendation.js - Enhanced recommendation logic with detailed analysis

document.addEventListener("DOMContentLoaded", () => {
    const scoreNumber = document.getElementById('scoreNumber');
    const scoreLabel = document.getElementById('scoreLabel');
    const severityIndicator = document.getElementById('severityIndicator');
    const primaryTitle = document.getElementById('primaryTitle');
    const primaryDescription = document.getElementById('primaryDescription');

    // Get score from localStorage
    const score = parseInt(localStorage.getItem("assessmentScore") || 0);

    // Update score display
    scoreNumber.textContent = score;
    scoreLabel.textContent = `من أصل 25 نقطة`;

    // Determine severity and recommendations
    let severity, severityClass, primaryRec, primaryDesc, primaryIcon;

    if (score <= 9) {
        severity = "منخفض";
        severityClass = "severity-low";
        primaryRec = "أدوات المساعدة الذاتية";
        primaryDesc = "أعراضك خفيفة ويمكن التعامل معها من خلال تقنيات المساعدة الذاتية. نوصي بتعلم تقنيات الاسترخاء والتنفس العميق.";
        primaryIcon = "fas fa-book-open";
    } else if (score <= 17) {
        severity = "متوسط";
        severityClass = "severity-medium";
        primaryRec = "الدعم الجماعي";
        primaryDesc = "أعراضك متوسطة وتحتاج إلى دعم إضافي. نوصي بالانضمام إلى مجموعات الدعم للتواصل مع أشخاص مروا بتجارب مشابهة.";
        primaryIcon = "fas fa-users";
    } else {
        severity = "مرتفع";
        severityClass = "severity-high";
        primaryRec = "استشارة طبية متخصصة";
        primaryDesc = "أعراضك تحتاج إلى تدخل طبي متخصص. نوصي بالتحدث مع طبيب نفسي للحصول على تقييم شامل وخطة علاج مناسبة.";
        primaryIcon = "fas fa-user-md";
    }

    // Update severity indicator
    severityIndicator.textContent = severity;
    severityIndicator.className = `severity-indicator ${severityClass}`;

    // Update primary recommendation
    primaryTitle.textContent = primaryRec;
    primaryDescription.textContent = primaryDesc;
    
    // Update primary recommendation icon
    const primaryIconElement = document.querySelector('#primaryRecommendation .recommendation-icon i');
    if (primaryIconElement) {
        primaryIconElement.className = primaryIcon;
    }

    // Add detailed analysis based on score
    addDetailedAnalysis(score);

    // Save recommendation to Firestore if user is logged in
    saveRecommendation(score, severity, primaryRec);
});

// Add detailed analysis
function addDetailedAnalysis(score) {
    const resultBody = document.querySelector('.result-body');
    
    // Create analysis section
    const analysisSection = document.createElement('div');
    analysisSection.className = 'mt-4 p-3 bg-light rounded';
    analysisSection.innerHTML = `
        <h6 class="text-primary mb-3">
            <i class="fas fa-chart-bar me-2"></i>
            تحليل مفصل
        </h6>
        <div class="row">
            <div class="col-md-6">
                <div class="mb-3">
                    <strong>مستوى الأعراض:</strong>
                    <span class="badge bg-${getSeverityColor(score)} ms-2">${getSeverityText(score)}</span>
                </div>
                <div class="mb-3">
                    <strong>نوع التدخل المطلوب:</strong>
                    <span class="text-muted">${getInterventionType(score)}</span>
                </div>
            </div>
            <div class="col-md-6">
                <div class="mb-3">
                    <strong>المدة المتوقعة للتحسن:</strong>
                    <span class="text-muted">${getExpectedDuration(score)}</span>
                </div>
                <div class="mb-3">
                    <strong>نوع المتابعة:</strong>
                    <span class="text-muted">${getFollowUpType(score)}</span>
                </div>
            </div>
        </div>
    `;

    // Insert before action buttons
    const actionButtons = document.querySelector('.action-buttons');
    resultBody.insertBefore(analysisSection, actionButtons);
}

// Helper functions for analysis
function getSeverityColor(score) {
    if (score <= 9) return 'success';
    if (score <= 17) return 'warning';
    return 'danger';
}

function getSeverityText(score) {
    if (score <= 9) return 'خفيف';
    if (score <= 17) return 'متوسط';
    return 'شديد';
}

function getInterventionType(score) {
    if (score <= 9) return 'مساعدة ذاتية مع دعم محدود';
    if (score <= 17) return 'دعم جماعي مع متابعة دورية';
    return 'تدخل طبي متخصص مع متابعة مكثفة';
}

function getExpectedDuration(score) {
    if (score <= 9) return '2-4 أسابيع';
    if (score <= 17) return '1-3 أشهر';
    return '3-6 أشهر أو أكثر';
}

function getFollowUpType(score) {
    if (score <= 9) return 'أسبوعي';
    if (score <= 17) return 'أسبوعي إلى شهري';
    return 'أسبوعي مع زيارات طبية دورية';
}

// Save recommendation to Firestore
async function saveRecommendation(score, severity, primaryRec) {
    try {
        const user = window.auth.currentUser;
        if (!user) return;

        const recommendationData = {
            userId: user.uid,
            score: score,
            severity: severity,
            primaryRecommendation: primaryRec,
            timestamp: new Date(),
            source: 'questionnaire'
        };

        await window.db.collection("recommendations").add(recommendationData);
        console.log('Recommendation saved to Firestore');

    } catch (error) {
        console.error('Error saving recommendation:', error);
    }
}

// Add animation to score display
function animateScore() {
    const scoreElement = document.getElementById('scoreNumber');
    const targetScore = parseInt(scoreElement.textContent);
    let currentScore = 0;
    
    const interval = setInterval(() => {
        currentScore += Math.ceil(targetScore / 20);
        if (currentScore >= targetScore) {
            currentScore = targetScore;
            clearInterval(interval);
        }
        scoreElement.textContent = currentScore;
    }, 50);
}

// Start animation when page loads
setTimeout(animateScore, 500);

// Add print functionality
function addPrintButton() {
    const printBtn = document.createElement('button');
    printBtn.className = 'btn btn-outline-secondary ms-2';
    printBtn.innerHTML = '<i class="fas fa-print me-1"></i>طباعة النتيجة';
    printBtn.onclick = () => window.print();
    
    const actionButtons = document.querySelector('.text-center');
    actionButtons.appendChild(printBtn);
}

// Add print button after page loads
setTimeout(addPrintButton, 1000);

// Add share functionality (if supported)
function addShareButton() {
    if (navigator.share) {
        const shareBtn = document.createElement('button');
        shareBtn.className = 'btn btn-outline-info ms-2';
        shareBtn.innerHTML = '<i class="fas fa-share me-1"></i>مشاركة';
        shareBtn.onclick = async () => {
            try {
                await navigator.share({
                    title: 'نتيجة التقييم النفسي',
                    text: `نتيجتي في التقييم النفسي: ${score}/25`,
                    url: window.location.href
                });
            } catch (error) {
                console.log('Error sharing:', error);
            }
        };
        
        const actionButtons = document.querySelector('.text-center');
        actionButtons.appendChild(shareBtn);
    }
}

// Add share button if supported
setTimeout(addShareButton, 1500);
  
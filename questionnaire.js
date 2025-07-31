// questionnaire.js - Enhanced questionnaire with multi-step navigation

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById('questionnaireForm');
    const alertContainer = document.getElementById('alertContainer');
    const progressFill = document.getElementById('progressFill');
    const progressPercentage = document.getElementById('progressPercentage');
    const currentQuestion = document.getElementById('currentQuestion');
    const totalQuestions = document.getElementById('totalQuestions');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const submitBtn = document.getElementById('submitBtn');

    let currentSection = 1;
    const totalSections = 6;

    // Show alert function
    function showAlert(message, type = 'info') {
        alertContainer.innerHTML = `
            <div class="alert alert-${type} alert-dismissible fade show" role="alert">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'danger' ? 'exclamation-circle' : 'info-circle'} me-2"></i>
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;
    }

    // Clear alerts
    function clearAlerts() {
        alertContainer.innerHTML = '';
    }

    // Update progress
    function updateProgress() {
        const progress = (currentSection / totalSections) * 100;
        progressFill.style.width = progress + '%';
        progressPercentage.textContent = Math.round(progress) + '%';
        currentQuestion.textContent = currentSection;
        totalQuestions.textContent = totalSections;
    }

    // Show/hide sections
    function showSection(sectionNumber) {
        // Hide all sections
        document.querySelectorAll('.question-section').forEach(section => {
            section.classList.remove('active');
        });

        // Show current section
        const currentSectionElement = document.querySelector(`[data-section="${sectionNumber}"]`);
        if (currentSectionElement) {
            currentSectionElement.classList.add('active');
        }

        // Update navigation buttons
        updateNavigationButtons();
        updateProgress();
    }

    // Update navigation buttons
    function updateNavigationButtons() {
        prevBtn.style.display = currentSection === 1 ? 'none' : 'block';
        nextBtn.style.display = currentSection === totalSections ? 'none' : 'block';
        submitBtn.style.display = currentSection === totalSections ? 'block' : 'none';
    }

    // Validate current section
    function validateCurrentSection() {
        const currentSectionElement = document.querySelector(`[data-section="${currentSection}"]`);
        const requiredFields = currentSectionElement.querySelectorAll('[required]');
        
        for (let field of requiredFields) {
            if (!field.value) {
                showAlert(`يرجى الإجابة على جميع الأسئلة في هذا القسم.`, 'danger');
                return false;
            }
        }

        // Special validation for multiple select
        const multipleSelect = currentSectionElement.querySelector('select[multiple]');
        if (multipleSelect && multipleSelect.selectedOptions.length === 0) {
            showAlert(`يرجى اختيار منطقة واحدة على الأقل.`, 'danger');
            return false;
        }

        return true;
    }

    // Next button click
    nextBtn.addEventListener('click', () => {
        if (validateCurrentSection()) {
            currentSection++;
            showSection(currentSection);
            clearAlerts();
        }
    });

    // Previous button click
    prevBtn.addEventListener('click', () => {
        currentSection--;
        showSection(currentSection);
        clearAlerts();
    });

    // Form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearAlerts();

        // Validate all sections
        if (!validateCurrentSection()) {
            return;
        }

        // Calculate total score
        let total = 0;
        for (let i = 1; i <= 5; i++) {
            const val = parseInt(document.querySelector(`select[name="q${i}"]`).value);
            if (isNaN(val)) {
                showAlert("يرجى الإجابة على جميع الأسئلة النفسية.", 'danger');
                return;
            }
            total += val;
        }

        // Show loading state
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>جاري إرسال الاستبيان...';
        submitBtn.disabled = true;

        try {
            // Get current user
            const user = window.auth.currentUser;
            if (!user) {
                showAlert("يرجى تسجيل الدخول مرة أخرى.", 'danger');
                return;
            }

            // Collect form data
            const formData = new FormData(form);
            const questionnaireData = {
                gender: formData.get('gender'),
                age: formData.get('age'),
                location: Array.from(formData.getAll('location')),
                duration: formData.get('duration'),
                event: formData.get('event'),
                q1: parseInt(formData.get('q1')),
                q2: parseInt(formData.get('q2')),
                q3: parseInt(formData.get('q3')),
                q4: parseInt(formData.get('q4')),
                q5: parseInt(formData.get('q5')),
                totalScore: total,
                submittedAt: new Date(),
                userId: user.uid
            };

            // Save to Firestore
            await window.db.collection("questionnaires").add(questionnaireData);

            // Store score in localStorage for backward compatibility
            localStorage.setItem("assessmentScore", total);

            showAlert("تم إرسال الاستبيان بنجاح! جاري التوجيه...", 'success');

            // Redirect to recommendation page
            setTimeout(() => {
                window.location.href = "recommendation.html";
            }, 2000);

        } catch (error) {
            console.error("Error submitting questionnaire:", error);
            showAlert("حدث خطأ أثناء إرسال الاستبيان. يرجى المحاولة مرة أخرى.", 'danger');
        } finally {
            // Reset button state
            submitBtn.innerHTML = '<i class="fas fa-paper-plane me-2"></i>إرسال الاستبيان';
            submitBtn.disabled = false;
        }
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
            e.preventDefault();
            if (currentSection < totalSections) {
                nextBtn.click();
            }
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
            e.preventDefault();
            if (currentSection > 1) {
                prevBtn.click();
            }
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (currentSection === totalSections) {
                submitBtn.click();
            } else {
                nextBtn.click();
            }
        }
    });

    // Auto-save progress (optional)
    function autoSaveProgress() {
        const formData = new FormData(form);
        const progress = {};
        
        for (let [key, value] of formData.entries()) {
            progress[key] = value;
        }
        
        localStorage.setItem('questionnaireProgress', JSON.stringify(progress));
    }

    // Load saved progress
    function loadSavedProgress() {
        const savedProgress = localStorage.getItem('questionnaireProgress');
        if (savedProgress) {
            try {
                const progress = JSON.parse(savedProgress);
                for (let [key, value] of Object.entries(progress)) {
                    const field = form.querySelector(`[name="${key}"]`);
                    if (field) {
                        if (field.multiple) {
                            // Handle multiple select
                            const values = Array.isArray(value) ? value : [value];
                            for (let option of field.options) {
                                option.selected = values.includes(option.value);
                            }
                        } else {
                            field.value = value;
                        }
                    }
                }
            } catch (error) {
                console.error("Error loading saved progress:", error);
            }
        }
    }

    // Auto-save on field change
    form.addEventListener('change', autoSaveProgress);

    // Initialize
    showSection(1);
    loadSavedProgress();

    // Clear saved progress on successful submission
    window.addEventListener('beforeunload', () => {
        if (document.querySelector('.alert-success')) {
            localStorage.removeItem('questionnaireProgress');
        }
    });
});
  
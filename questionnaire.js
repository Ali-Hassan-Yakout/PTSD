// questionnaire.js - Enhanced questionnaire functionality with Firebase integration

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('questionnaireForm');
  const progressBar = document.getElementById('progressBar');
  const progressText = document.getElementById('progressText');
  
  // Track form completion progress
  const totalFields = 9; // gender, age, location, duration, event, q1, q2, q3, q4, q5
  let completedFields = 0;

  // Update progress bar
  function updateProgress() {
    const progress = Math.round((completedFields / totalFields) * 100);
    progressBar.style.width = `${progress}%`;
    progressText.textContent = `${progress}%`;
  }

  // Monitor form field changes for progress
  const formFields = form.querySelectorAll('select, input');
  formFields.forEach(field => {
    field.addEventListener('change', () => {
      // Count completed fields
      completedFields = 0;
      formFields.forEach(f => {
        if (f.value && f.value.trim() !== '') {
          completedFields++;
        }
      });
      updateProgress();
    });
  });

  // Form submission handler
  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Show loading state
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>جاري الإرسال...';
    submitBtn.disabled = true;

    try {
      // Validate all required fields
      const formData = new FormData(form);
      let total = 0;
      let hasErrors = false;
      let errorMessage = '';

      // Check psychological questions (q1-q5)
      for (let i = 1; i <= 5; i++) {
        const val = parseInt(formData.get(`q${i}`));
        if (isNaN(val)) {
          hasErrors = true;
          errorMessage = 'يرجى الإجابة على جميع الأسئلة النفسية.';
          break;
        }
        total += val;
      }

      // Check other required fields
      const requiredFields = ['gender', 'age', 'duration', 'event'];
      for (const field of requiredFields) {
        const value = formData.get(field);
        if (!value || value.trim() === '') {
          hasErrors = true;
          errorMessage = 'يرجى ملء جميع الحقول المطلوبة.';
          break;
        }
      }

      if (hasErrors) {
        showAlert(errorMessage, 'danger');
        return;
      }

      // Prepare assessment data
      const assessmentData = {
        gender: formData.get('gender'),
        age: formData.get('age'),
        location: Array.from(form.querySelector('select[name="location"]').selectedOptions).map(opt => opt.value),
        duration: formData.get('duration'),
        event: formData.get('event'),
        psychologicalScore: total,
        timestamp: new Date(),
        userId: null // Will be set if user is logged in
      };

      // Check if user is logged in
      const currentUser = window.auth.currentUser;
      if (currentUser) {
        assessmentData.userId = currentUser.uid;
        
        // Save to Firebase if user is logged in
        try {
          await window.db.collection('assessments').add(assessmentData);
          console.log('Assessment saved to Firebase');
        } catch (firebaseError) {
          console.error('Error saving to Firebase:', firebaseError);
          // Continue with local storage even if Firebase fails
        }
      }

      // Store score in localStorage for result page
      localStorage.setItem("assessmentScore", total);
      localStorage.setItem("assessmentData", JSON.stringify(assessmentData));

      // Show success message
      showAlert('تم إرسال الاستبيان بنجاح! جاري الانتقال إلى النتائج...', 'success');

      // Redirect to result page after short delay
      setTimeout(() => {
        window.location.href = "result.html";
      }, 1500);

    } catch (error) {
      console.error('Error processing form:', error);
      showAlert('حدث خطأ أثناء إرسال الاستبيان. يرجى المحاولة مرة أخرى.', 'danger');
    } finally {
      // Reset button state
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
    }
  });

  // Alert function
  function showAlert(message, type) {
    // Remove existing alerts
    const existingAlert = document.querySelector('.alert');
    if (existingAlert) {
      existingAlert.remove();
    }

    // Create new alert
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.innerHTML = `
      <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'} me-2"></i>
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

    // Insert alert before form
    form.parentNode.insertBefore(alertDiv, form);

    // Auto-dismiss success alerts
    if (type === 'success') {
      setTimeout(() => {
        alertDiv.remove();
      }, 3000);
    }
  }

  // Initialize progress
  updateProgress();
});
  
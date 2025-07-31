// login.js - Enhanced with forgot password functionality

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById('loginForm');
    const forgotPasswordLink = document.getElementById('forgotPasswordLink');
    const forgotPasswordModal = new bootstrap.Modal(document.getElementById('forgotPasswordModal'));
    const forgotPasswordForm = document.getElementById('forgotPasswordForm');
    const alertContainer = document.getElementById('alertContainer');

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

    // Login form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearAlerts();

        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value.trim();
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;

        // Show loading state
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>جاري تسجيل الدخول...';
        submitBtn.disabled = true;

        try {
            const userCredential = await window.auth.signInWithEmailAndPassword(email, password);
            const uid = userCredential.user.uid;

            const userDoc = await window.db.collection("users").doc(uid).get();

            if (!userDoc.exists) {
                showAlert("لم يتم العثور على بيانات المستخدم في قاعدة البيانات.", 'danger');
                return;
            }

            const userData = userDoc.data();
            const role = userData.role;

            // Check if doctor is approved
            if (role === "doctor" && userData.status === "pending") {
                showAlert("حسابك قيد المراجعة من قبل الإدارة. سيتم إعلامك عند الموافقة.", 'warning');
                return;
            }

            showAlert("تم تسجيل الدخول بنجاح! جاري التوجيه...", 'success');

            // Redirect based on role
            setTimeout(() => {
                if (role === "doctor") {
                    window.location.href = "doctor-dashboard.html";
                } else if (role === "patient") {
                    window.location.href = "welcome.html";
                } else if (role === "admin") {
                    window.location.href = "admin-dashboard.html";
                } else {
                    showAlert("نوع المستخدم غير معروف.", 'danger');
                }
            }, 1500);

        } catch (error) {
            console.error("Login error:", error);
            let errorMessage = "حدث خطأ أثناء تسجيل الدخول.";
            
            switch (error.code) {
                case 'auth/user-not-found':
                    errorMessage = "البريد الإلكتروني غير مسجل.";
                    break;
                case 'auth/wrong-password':
                    errorMessage = "كلمة المرور غير صحيحة.";
                    break;
                case 'auth/invalid-email':
                    errorMessage = "البريد الإلكتروني غير صحيح.";
                    break;
                case 'auth/too-many-requests':
                    errorMessage = "تم تجاوز عدد المحاولات المسموح. يرجى المحاولة لاحقاً.";
                    break;
                case 'auth/user-disabled':
                    errorMessage = "تم تعطيل هذا الحساب.";
                    break;
            }
            
            showAlert(errorMessage, 'danger');
        } finally {
            // Reset button state
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });

    // Forgot password link click
    forgotPasswordLink.addEventListener('click', (e) => {
        e.preventDefault();
        forgotPasswordModal.show();
    });

    // Forgot password form submission
    forgotPasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('resetEmail').value.trim();
        const submitBtn = forgotPasswordForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;

        // Show loading state
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>جاري الإرسال...';
        submitBtn.disabled = true;

        try {
            await window.auth.sendPasswordResetEmail(email);
            showAlert("تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني.", 'success');
            forgotPasswordModal.hide();
            
            // Reset form
            forgotPasswordForm.reset();
            
        } catch (error) {
            console.error("Password reset error:", error);
            let errorMessage = "حدث خطأ أثناء إرسال رابط إعادة التعيين.";
            
            switch (error.code) {
                case 'auth/user-not-found':
                    errorMessage = "البريد الإلكتروني غير مسجل في النظام.";
                    break;
                case 'auth/invalid-email':
                    errorMessage = "البريد الإلكتروني غير صحيح.";
                    break;
                case 'auth/too-many-requests':
                    errorMessage = "تم تجاوز عدد الطلبات المسموح. يرجى المحاولة لاحقاً.";
                    break;
            }
            
            showAlert(errorMessage, 'danger');
        } finally {
            // Reset button state
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });

    // Clear alerts when modal is hidden
    document.getElementById('forgotPasswordModal').addEventListener('hidden.bs.modal', () => {
        clearAlerts();
    });
});

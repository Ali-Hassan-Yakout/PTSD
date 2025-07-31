// register.js - Enhanced with doctor registration flow

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById('signupForm');
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

    // Sanitize input function
    function sanitizeInput(input) {
        return input.trim().replace(/[<>]/g, '');
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearAlerts();

        const fullName = sanitizeInput(document.getElementById('fullName').value);
        const email = sanitizeInput(document.getElementById('email').value);
        const password = document.getElementById('password').value;
        const role = document.getElementById('role').value;

        // Validate inputs
        if (!fullName || !email || !password || !role) {
            showAlert("يرجى ملء جميع الحقول المطلوبة.", 'danger');
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showAlert("يرجى إدخال بريد إلكتروني صحيح.", 'danger');
            return;
        }

        // Password validation
        if (password.length < 6) {
            showAlert("كلمة المرور يجب أن تكون 6 أحرف على الأقل.", 'danger');
            return;
        }

        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;

        // Show loading state
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>جاري إنشاء الحساب...';
        submitBtn.disabled = true;

        try {
            // Create user account
            const userCredential = await window.auth.createUserWithEmailAndPassword(email, password);
            const uid = userCredential.user.uid;

            // Prepare user data
            const userData = {
                fullName,
                email,
                role,
                createdAt: new Date(),
                status: role === 'doctor' ? 'pending' : 'active'
            };

            // Add doctor-specific fields if role is doctor
            if (role === 'doctor') {
                const specialty = sanitizeInput(document.getElementById('specialty').value);
                const licenseNumber = sanitizeInput(document.getElementById('licenseNumber').value);
                const phoneNumber = sanitizeInput(document.getElementById('phoneNumber').value);

                if (!specialty || !licenseNumber || !phoneNumber) {
                    showAlert("يرجى ملء جميع الحقول المطلوبة للأطباء.", 'danger');
                    return;
                }

                userData.specialty = specialty;
                userData.licenseNumber = licenseNumber;
                userData.phoneNumber = phoneNumber;
                userData.requestDate = new Date();
            }

            // Save user data to Firestore
            await window.db.collection("users").doc(uid).set(userData);

            // Show success message
            if (role === 'doctor') {
                showAlert("تم إنشاء حسابك بنجاح! سيتم مراجعة طلبك من قبل الإدارة. ستتلقى إشعاراً عند الموافقة.", 'success');
                setTimeout(() => {
                    window.location.href = "login.html";
                }, 3000);
            } else {
                showAlert("تم إنشاء حسابك بنجاح! جاري التوجيه...", 'success');
                setTimeout(() => {
                    window.location.href = "login.html";
                }, 1500);
            }

        } catch (error) {
            console.error("Registration error:", error);
            let errorMessage = "حدث خطأ أثناء إنشاء الحساب.";
            
            switch (error.code) {
                case 'auth/email-already-in-use':
                    errorMessage = "البريد الإلكتروني مستخدم بالفعل.";
                    break;
                case 'auth/invalid-email':
                    errorMessage = "البريد الإلكتروني غير صحيح.";
                    break;
                case 'auth/weak-password':
                    errorMessage = "كلمة المرور ضعيفة جداً.";
                    break;
                case 'auth/operation-not-allowed':
                    errorMessage = "تم تعطيل إنشاء الحسابات مؤقتاً.";
                    break;
            }
            
            showAlert(errorMessage, 'danger');
        } finally {
            // Reset button state
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });
});

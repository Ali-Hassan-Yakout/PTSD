// auth-guard.js - Enhanced authentication guard with admin support

document.addEventListener("DOMContentLoaded", () => {
    // Get the required role for the current page from <body data-role="...">
    const requiredRole = document.body.getAttribute("data-role");

    // Listen for auth state changes
    window.auth.onAuthStateChanged(async (user) => {
        if (!user) {
            // Not logged in — redirect to login page
            window.location.href = "login.html";
            return;
        }

        try {
            // Get user document from Firestore
            const doc = await window.db.collection("users").doc(user.uid).get();

            if (!doc.exists) {
                showError("لم يتم العثور على بيانات المستخدم.");
                window.location.href = "login.html";
                return;
            }

            const userData = doc.data();

            // Check if user is active (for doctors, check approval status)
            if (userData.role === "doctor" && userData.status === "pending") {
                showError("حسابك قيد المراجعة من قبل الإدارة. سيتم إعلامك عند الموافقة.");
                window.location.href = "login.html";
                return;
            }

            if (userData.role === "doctor" && userData.status === "rejected") {
                showError("تم رفض طلبك. يرجى التواصل مع الإدارة.");
                window.location.href = "login.html";
                return;
            }

            // Check if user role matches the required role for the page
            if (requiredRole && userData.role !== requiredRole) {
                showError("أنت لا تملك صلاحية الوصول لهذه الصفحة");
                
                // Redirect based on user role
                setTimeout(() => {
                    if (userData.role === "admin") {
                        window.location.href = "admin-dashboard.html";
                    } else if (userData.role === "doctor") {
                        window.location.href = "doctor-dashboard.html";
                    } else if (userData.role === "patient") {
                        window.location.href = "welcome.html";
                    } else {
                        window.location.href = "index.html";
                    }
                }, 2000);
                return;
            }

            // Update last login time
            await window.db.collection("users").doc(user.uid).update({
                lastLogin: new Date()
            });

            // User is authorized — do nothing, allow page to load
            console.log(`User ${userData.fullName} (${userData.role}) authorized for ${requiredRole || 'any'} role`);

        } catch (error) {
            console.error("Error fetching user data:", error);
            showError("حدث خطأ أثناء التحقق من الصلاحيات");
            window.location.href = "login.html";
        }
    });

    // Show error function
    function showError(message) {
        // Create a temporary alert if alert container exists
        const alertContainer = document.getElementById('alertContainer');
        if (alertContainer) {
            alertContainer.innerHTML = `
                <div class="alert alert-danger alert-dismissible fade show" role="alert">
                    <i class="fas fa-exclamation-circle me-2"></i>
                    ${message}
                    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                </div>
            `;
        } else {
            // Fallback to alert if no container found
            alert(message);
        }
    }
});

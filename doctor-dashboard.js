// doctor-dashboard.js - Enhanced doctor dashboard functionality

document.addEventListener("DOMContentLoaded", () => {
    const alertContainer = document.getElementById('alertContainer');
    const doctorNameEl = document.getElementById('doctorName');
    const lastLoginEl = document.getElementById('lastLogin');
    const totalPatientsEl = document.getElementById('totalPatients');
    const pendingReportsEl = document.getElementById('pendingReports');
    const totalReportsEl = document.getElementById('totalReports');
    const recentPatientsEl = document.getElementById('recentPatients');
    const logoutBtn = document.getElementById('logoutBtn');

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

    // Format date function
    function formatDate(date) {
        if (!date) return 'غير محدد';
        const d = date.toDate ? date.toDate() : new Date(date);
        return d.toLocaleDateString('ar-SA', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    // Load doctor information
    async function loadDoctorInfo() {
        try {
            const user = window.auth.currentUser;
            if (!user) return;

            const userDoc = await window.db.collection("users").doc(user.uid).get();
            if (userDoc.exists) {
                const userData = userDoc.data();
                doctorNameEl.textContent = userData.fullName || 'طبيب';
                
                // Update last login
                const lastLogin = userData.lastLogin || user.metadata.lastSignInTime;
                lastLoginEl.textContent = formatDate(lastLogin);
            }
        } catch (error) {
            console.error("Error loading doctor info:", error);
        }
    }

    // Load dashboard statistics
    async function loadDashboardStats() {
        try {
            // Get total patients count
            const patientsSnapshot = await window.db.collection("users")
                .where("role", "==", "patient")
                .get();
            
            totalPatientsEl.textContent = patientsSnapshot.size;

            // Get reports statistics
            const reportsSnapshot = await window.db.collection("reports").get();
            totalReportsEl.textContent = reportsSnapshot.size;

            // Get pending reports count (you might need to adjust this based on your reports structure)
            const pendingReportsSnapshot = await window.db.collection("reports")
                .where("status", "==", "pending")
                .get();
            
            pendingReportsEl.textContent = pendingReportsSnapshot.size;

        } catch (error) {
            console.error("Error loading dashboard stats:", error);
            showAlert("حدث خطأ أثناء تحميل الإحصائيات.", 'danger');
        }
    }

    // Load recent patients
    async function loadRecentPatients() {
        try {
            const snapshot = await window.db.collection("users")
                .where("role", "==", "patient")
                .orderBy("createdAt", "desc")
                .limit(5)
                .get();

            if (snapshot.empty) {
                recentPatientsEl.innerHTML = `
                    <div class="text-center text-muted">
                        <i class="fas fa-users me-2"></i>
                        لا توجد مرضى مسجلين
                    </div>
                `;
                return;
            }

            let patientsHTML = '';
            snapshot.forEach(doc => {
                const data = doc.data();
                patientsHTML += `
                    <div class="patient-item">
                        <div class="row align-items-center">
                            <div class="col-md-6">
                                <h6 class="mb-1">${data.fullName || 'مريض غير محدد'}</h6>
                                <small class="text-muted">${data.email}</small>
                            </div>
                            <div class="col-md-4">
                                <small class="text-muted">
                                    <i class="fas fa-calendar me-1"></i>
                                    تاريخ التسجيل: ${formatDate(data.createdAt)}
                                </small>
                            </div>
                            <div class="col-md-2 text-end">
                                <a href="add-report.html?patient=${doc.id}" class="btn btn-sm btn-custom">
                                    <i class="fas fa-plus me-1"></i>
                                    تقرير
                                </a>
                            </div>
                        </div>
                    </div>
                `;
            });

            recentPatientsEl.innerHTML = patientsHTML;

        } catch (error) {
            console.error("Error loading recent patients:", error);
            recentPatientsEl.innerHTML = `
                <div class="text-center text-muted">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    حدث خطأ أثناء تحميل المرضى
                </div>
            `;
        }
    }

    // Logout function
    logoutBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        
        try {
            await window.auth.signOut();
            window.location.href = "login.html";
        } catch (error) {
            console.error("Error signing out:", error);
            showAlert("حدث خطأ أثناء تسجيل الخروج.", 'danger');
        }
    });

    // Initialize dashboard
    async function initializeDashboard() {
        try {
            await loadDoctorInfo();
            await loadDashboardStats();
            await loadRecentPatients();
        } catch (error) {
            console.error("Error initializing dashboard:", error);
            showAlert("حدث خطأ أثناء تحميل لوحة التحكم.", 'danger');
        }
    }

    // Start the dashboard
    initializeDashboard();

    // Auto-refresh statistics every 60 seconds
    setInterval(async () => {
        await loadDashboardStats();
    }, 60000);
});

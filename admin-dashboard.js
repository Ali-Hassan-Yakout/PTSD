// admin-dashboard.js - Admin dashboard functionality

document.addEventListener("DOMContentLoaded", () => {
    const alertContainer = document.getElementById('alertContainer');
    const doctorRequestsTable = document.getElementById('doctorRequestsTable');
    const logoutBtn = document.getElementById('logoutBtn');
    const pendingCountEl = document.getElementById('pendingCount');
    const totalDoctorsEl = document.getElementById('totalDoctors');
    const totalPatientsEl = document.getElementById('totalPatients');

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

    // Load dashboard statistics
    async function loadDashboardStats() {
        try {
            // Get pending doctor requests count
            const pendingSnapshot = await window.db.collection("users")
                .where("role", "==", "doctor")
                .where("status", "==", "pending")
                .get();
            
            pendingCountEl.textContent = pendingSnapshot.size;

            // Get total doctors count
            const doctorsSnapshot = await window.db.collection("users")
                .where("role", "==", "doctor")
                .get();
            
            totalDoctorsEl.textContent = doctorsSnapshot.size;

            // Get total patients count
            const patientsSnapshot = await window.db.collection("users")
                .where("role", "==", "patient")
                .get();
            
            totalPatientsEl.textContent = patientsSnapshot.size;

        } catch (error) {
            console.error("Error loading dashboard stats:", error);
            showAlert("حدث خطأ أثناء تحميل الإحصائيات.", 'danger');
        }
    }

    // Load doctor requests
    async function loadDoctorRequests() {
        try {
            const snapshot = await window.db.collection("users")
                .where("role", "==", "doctor")
                .where("status", "==", "pending")
                .orderBy("requestDate", "desc")
                .get();

            if (snapshot.empty) {
                doctorRequestsTable.innerHTML = `
                    <tr>
                        <td colspan="7" class="text-center text-muted">
                            <i class="fas fa-inbox me-2"></i>
                            لا توجد طلبات معلقة
                        </td>
                    </tr>
                `;
                return;
            }

            let tableHTML = '';
            snapshot.forEach(doc => {
                const data = doc.data();
                tableHTML += `
                    <tr data-user-id="${doc.id}">
                        <td>
                            <strong>${data.fullName || 'غير محدد'}</strong>
                            ${data.phoneNumber ? `<br><small class="text-muted">${data.phoneNumber}</small>` : ''}
                        </td>
                        <td>${data.email}</td>
                        <td>${data.specialty || 'غير محدد'}</td>
                        <td>${data.licenseNumber || 'غير محدد'}</td>
                        <td>${formatDate(data.requestDate)}</td>
                        <td>
                            <span class="status-badge status-pending">
                                <i class="fas fa-clock me-1"></i>
                                معلق
                            </span>
                        </td>
                        <td>
                            <button class="btn btn-success-custom btn-sm me-2" onclick="approveDoctor('${doc.id}')">
                                <i class="fas fa-check me-1"></i>
                                موافقة
                            </button>
                            <button class="btn btn-danger-custom btn-sm" onclick="rejectDoctor('${doc.id}')">
                                <i class="fas fa-times me-1"></i>
                                رفض
                            </button>
                        </td>
                    </tr>
                `;
            });

            doctorRequestsTable.innerHTML = tableHTML;

        } catch (error) {
            console.error("Error loading doctor requests:", error);
            showAlert("حدث خطأ أثناء تحميل طلبات الأطباء.", 'danger');
        }
    }

    // Approve doctor function
    window.approveDoctor = async function(userId) {
        if (!confirm('هل أنت متأكد من الموافقة على هذا الطبيب؟')) {
            return;
        }

        try {
            await window.db.collection("users").doc(userId).update({
                status: 'approved',
                approvedAt: new Date(),
                approvedBy: window.auth.currentUser.uid
            });

            showAlert("تمت الموافقة على الطبيب بنجاح.", 'success');
            
            // Reload data
            await loadDashboardStats();
            await loadDoctorRequests();

        } catch (error) {
            console.error("Error approving doctor:", error);
            showAlert("حدث خطأ أثناء الموافقة على الطبيب.", 'danger');
        }
    };

    // Reject doctor function
    window.rejectDoctor = async function(userId) {
        if (!confirm('هل أنت متأكد من رفض هذا الطبيب؟')) {
            return;
        }

        try {
            await window.db.collection("users").doc(userId).update({
                status: 'rejected',
                rejectedAt: new Date(),
                rejectedBy: window.auth.currentUser.uid
            });

            showAlert("تم رفض الطبيب بنجاح.", 'success');
            
            // Reload data
            await loadDashboardStats();
            await loadDoctorRequests();

        } catch (error) {
            console.error("Error rejecting doctor:", error);
            showAlert("حدث خطأ أثناء رفض الطبيب.", 'danger');
        }
    };

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
            await loadDashboardStats();
            await loadDoctorRequests();
        } catch (error) {
            console.error("Error initializing dashboard:", error);
            showAlert("حدث خطأ أثناء تحميل لوحة التحكم.", 'danger');
        }
    }

    // Start the dashboard
    initializeDashboard();

    // Auto-refresh every 30 seconds
    setInterval(async () => {
        await loadDashboardStats();
        await loadDoctorRequests();
    }, 30000);
});
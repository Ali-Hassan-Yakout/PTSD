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
        alert("User data not found.");
        window.location.href = "login.html";
        return;
      }

      const userData = doc.data();

      // Check if user role matches the required role for the page
      if (requiredRole && userData.role !== requiredRole) {
        alert("أنت لا تملك صلاحية الوصول لهذه الصفحة");
        window.location.href = "index.html"; // or any page for unauthorized access
        return;
      }

      // User is authorized — do nothing, allow page to load
    } catch (error) {
      console.error("Error fetching user data:", error);
      alert("حدث خطأ أثناء التحقق من الصلاحيات");
      window.location.href = "login.html";
    }
  });
});

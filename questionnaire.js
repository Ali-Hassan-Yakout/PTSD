document.getElementById('quizForm').addEventListener('submit', function(e) {
    e.preventDefault();
  
    let total = 0;
    const form = e.target;
    for (let i = 1; i <= 5; i++) {
      total += parseInt(form['q' + i].value);
    }
  
    if (total < 50) {
      window.location.href = "result.html";
    } else if (total >= 50 && total <= 70) {
      window.location.href = "result.html";
    } else {
      window.location.href = "result.html";
    }
  });
  
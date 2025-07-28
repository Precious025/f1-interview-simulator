let profileData = '';
let customQA = [];
let quizIndex = 0;
let mode = 'random';
let currentQA = [];

function saveProfile() {
  profileData = document.getElementById("profile").value;
  alert("Profile saved!");
}

function saveCustomQA() {
  const lines = document.getElementById("qa-input").value.trim().split("\n");
  customQA = lines.map(line => {
    const parts = line.split("|").map(p => p.trim());
    return { question: parts[0], answer: parts[1], tip: parts[2] || '' };
  });
  alert("Custom questions saved!");
}

function startQuiz() {
  mode = document.querySelector('input[name="mode"]:checked').value;
  currentQA = [...customQA];

  if (mode === "random") {
    currentQA = currentQA.sort(() => Math.random() - 0.5);
  }

  quizIndex = 0;
  document.getElementById("quiz-section").style.display = "block";
  showQuestion();
}

function showQuestion() {
  if (quizIndex >= currentQA.length) {
    evaluateVisa();
    return;
  }

  const q = currentQA[quizIndex];
  document.getElementById("current-question").innerText = q.question;
  document.getElementById("user-answer").value = '';
  document.getElementById("feedback").innerText = '';
  document.getElementById("tip").innerText = '';
}

function checkAnswer() {
  const userResponse = document.getElementById("user-answer").value.toLowerCase();
  const correctAnswer = currentQA[quizIndex].answer.toLowerCase();

  if (userResponse.includes(correctAnswer.substring(0, 4))) {
    document.getElementById("feedback").innerText = "✅ Approximate Match!";
  } else {
    document.getElementById("feedback").innerText = "❌ Not quite.";
  }

  document.getElementById("tip").innerText = "💡 Tip: " + currentQA[quizIndex].tip;
  quizIndex++;
  setTimeout(showQuestion, 2000);
}

function evaluateVisa() {
  document.getElementById("quiz-section").style.display = "none";
  const passed = Math.random() > 0.3;
  document.getElementById("result").style.display = "block";
  document.getElementById("visa-result").innerText = passed ? "✅ Visa Approved" : "❌ Visa Denied";
}

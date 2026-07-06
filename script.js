// 👉 Πιάνουμε στοιχεία από το DOM για να μπορούμε να τα αλλάζουμε δυναμικά
const progressText = document.getElementById("progress-text");
const progressBar = document.getElementById("progress-bar");
const questionElement = document.getElementById("question");
const answerButtons = document.querySelectorAll(".answer-btn");
const prevButton = document.getElementById("prev-btn");
const nextButton = document.getElementById("next-btn");
const resetButton = document.getElementById("reset-btn");

// 👉 Debug: βλέπουμε αν όντως βρήκαμε το element
console.log(questionElement);


// 👉 Τα δεδομένα του quiz (questions + answers)
let questions = [];
fetch("questions.json")
  .then(response => response.json())
  .then(data => {
    questions = data;

    // 👉 ξεκινάει το quiz ΜΟΝΟ όταν φορτώσουν τα δεδομένα (async)
    showQuestion();
  });


// 👉 State: ποια ερώτηση βλέπουμε τώρα
let currentQuestionIndex = 0;

// 👉 State: τι έχει απαντήσει ο χρήστης σε κάθε ερώτηση
let userAnswers = [];

// 👉 State: πόσες σωστές απαντήσεις έχει ο χρήστης
let score = 0;

// 👉 Κύρια function που "ζωγραφίζει" την ερώτηση στο UI
function showQuestion() {

  // 👉 Καθαρίζουμε το UI από προηγούμενη ερώτηση
  resetButtons();

  // 👉 Ενημερώνουμε τα κουμπιά next/prev
  updateNavButtons();

  // 👉 Εμφανίζουμε αρίθμηση ερώτησης 
  progressText.innerText = `Ερώτηση ${currentQuestionIndex + 1} από ${questions.length}`;
  // 👉 Εμφανίζουμε progress bar
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  progressBar.style.width = progress + "%";

  // 👉 Παίρνουμε την τρέχουσα ερώτηση από το array
  const currentQuestion = questions[currentQuestionIndex];

  // 👉 Βάζουμε το κείμενο της ερώτησης στο DOM
  questionElement.innerText = currentQuestion.question;

  // 👉 Γεμίζουμε τα κουμπιά με απαντήσεις
  answerButtons.forEach((button, index) => {
    const answer = currentQuestion.answers[index];
    button.innerText = answer.text;

    // 👉 Αποθηκεύουμε αν είναι σωστή (στο dataset του button)
    button.dataset.correct = answer.correct;
  });

  // 👉 Αν ο χρήστης είχε ήδη απαντήσει, το επαναφέρουμε
  restorePreviousAnswer();

  console.log(currentQuestion.question);
}

// 👉 Επαναφέρει προηγούμενη επιλογή όταν γυρνάς πίσω
function restorePreviousAnswer() {

  const saved = userAnswers[currentQuestionIndex];

  // 👉 Αν δεν έχει απαντήσει, δεν κάνουμε τίποτα
  if (!saved) return;

  answerButtons.forEach(button => {

    // 👉 Καθαρίζουμε πρώτα όλα τα styles
    button.classList.remove("selected", "correct", "wrong");

    // 👉 Αν το κουμπί είναι αυτό που είχε επιλέξει
    if (button.innerText === saved.answer) {

      // 👉 Βάζουμε σωστό ή λάθος style
      button.classList.add(saved.correct ? "correct" : "wrong");
    }
  });

  // 👉 Αν έχει απαντηθεί, απενεργοποιούμε όλα τα κουμπιά
  answerButtons.forEach(button => {
    button.disabled = !!userAnswers[currentQuestionIndex];
  });
}

// 👉 Προσθέτουμε click event σε κάθε answer button
answerButtons.forEach(button => {
  button.addEventListener("click", handleAnswer);
});


// 👉 Όταν ο χρήστης επιλέγει απάντηση
function handleAnswer(event) {

  // 👉 Βλέπουμε αν έχει ήδη απαντηθεί
  const existingAnswer = userAnswers[currentQuestionIndex];
  // 👉 Αν ναι → δεν αφήνουμε νέα επιλογή
  if (existingAnswer?.locked) return;

  const selectedButton = event.target;

  // 👉 Επειδή dataset είναι string → συγκρίνουμε με "true"
  const isCorrect = selectedButton.dataset.correct === "true";
  if (isCorrect) {
    score += 5;
  }

  // 👉 Αποθηκεύουμε την απάντηση στο state
  userAnswers[currentQuestionIndex] = {
    answer: selectedButton.innerText,
    locked: true,
    correct: isCorrect
  };

  // 👉 Καθαρίζουμε όλα τα styles
  answerButtons.forEach(button => {
    button.classList.remove("selected", "correct", "wrong");
  });

  // 👉 Βάζουμε style στο επιλεγμένο
  if (isCorrect) {
    console.log("Σωστό!");
    selectedButton.classList.add("correct");
  } else {
    console.log("Λάθος!");
    selectedButton.classList.add("wrong");
  }
}


// 👉 Navigation events
nextButton.addEventListener("click", nextQuestion);
prevButton.addEventListener("click", prevQuestion);


// 👉 Καθαρίζει UI πριν render
function resetButtons() {
  answerButtons.forEach(button => {
    button.disabled = false;
    button.classList.remove("correct", "wrong", "selected");
  });
}

// 👉 Ενημερώνει τα navigation buttons
function updateNavButtons() {

  const isFirstQuestion = currentQuestionIndex === 0;
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  prevButton.disabled = isFirstQuestion;
  nextButton.disabled = false;

  // 👉 CSS class για styling (π.χ. faded button)
  prevButton.classList.toggle("prev-btn-disabled", isFirstQuestion);

  // 👉 αλλάζουμε text στο τελευταίο step
  nextButton.innerText = isLastQuestion ? "Ολοκλήρωση" : "Επόμενη";
}

// 👉 Ελέγχει αν ο χρήστης έχει δώσει απάντηση στην τρέχουσα ερώτηση
function hasAnsweredCurrentQuestion() {
  return !!userAnswers[currentQuestionIndex];
}

// 👉 Όταν τελειώσουν οι ερωτήσεις, δείχνουμε τα αποτελέσματα
function nextQuestion() {
  if (!hasAnsweredCurrentQuestion()) {
    triggerShake(nextButton);
    return;
  }

  if (currentQuestionIndex < questions.length - 1) {
    currentQuestionIndex++;
    showQuestion();
  } else {
    showResults();
  }
}
// 👉 Button shake animation αν δεν έχει γίνει επιλογή
function triggerShake(element) {
  element.classList.remove("shake");

  setTimeout(() => {
    element.classList.add("shake");
  }, 10);
}

// 👉 Πάμε στην προηγούμενη ερώτηση
function prevQuestion() {
  if (currentQuestionIndex > 0) {
    currentQuestionIndex--;
    showQuestion();
  }
}

// 👉 Εμφανίζει τα αποτελέσματα στο τέλος
function showResults() {

  const percentage = (score / (questions.length * 5)) * 100;

  questionElement.innerHTML = `
    <h2>🎉 Ολοκλήρωσες το Quiz!</h2>
    <p>Σκορ: ${score} / ${questions.length * 5}</p>
    <p>Ποσοστό επιτυχίας: ${percentage.toFixed(0)}%</p>
  `;

  answerButtons.forEach(btn => btn.style.display = "none");

  nextButton.style.display = "none";
  prevButton.style.display = "none";

  progressText.innerText = "";
  progressBar.style.width = "100%";
}

// 👉 Επανεκκίνηση του Quiz
function resetQuiz() {
  // 👉 επιστροφή στην πρώτη ερώτηση
  currentQuestionIndex = 0;
  // 👉 καθάρισμα απαντήσεων
  userAnswers = [];
  // 👉 μηδενισμός σκορ
  score = 0;
  // 👉 ΞΑΝΑΦΕΡΝΟΥΜΕ ΟΛΑ ΤΑ ELEMENTS
  answerButtons.forEach(btn => {
    btn.style.display = "block";
  });

  nextButton.style.display = "inline-block";
  prevButton.style.display = "inline-block";

  // 👉 reset progress UI
  progressBar.style.width = "0%";
  progressText.innerText = "";

  // 👉 ξαναδείχνουμε πρώτη ερώτηση
  showQuestion();
}
resetButton.addEventListener("click", resetQuiz);
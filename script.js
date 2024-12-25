// Get DOM elements
const startButton = document.getElementById('start-button');
const questionContainer = document.getElementById('question-container');
const optionsContainer = document.getElementById('options-container');
const resultContainer = document.getElementById('results-screen');
const timerDisplay = document.getElementById('timer');
const scoreDisplay = document.getElementById('score');
const questionsModal = document.getElementById('questions-modal');
const closeQuestionsBtn = document.querySelector('.close-questions-btn');
const viewAllQuestionsBtn = document.getElementById('view-all-questions');
const questionsList = document.getElementById('questions-list');
const topScoresDiv = document.getElementById('top-scores');
const examScreen = document.getElementById('exam-screen');
const welcomeScreen = document.getElementById('welcome-screen');
const questionSelectScreen = document.getElementById('question-select-screen');
const showIncorrectMcqsBtn = document.getElementById('show-incorrect-mcqs'); // Added new element
const incorrectMcqsList = document.getElementById('incorrect-mcqs-list'); // Added new element

let currentQuestionIndex = 0;
let score = 0;
let timer;
let elapsedTime = 0; // Changed from timeLeft to elapsedTime
let selectedQuestions = [];
let wrongQuestions = [];
let questionCount = 10; // Default question count
let userName = '';

// Initialize the application
function init() {
    // Add event listeners
    viewAllQuestionsBtn.addEventListener('click', showAllQuestions);
    closeQuestionsBtn.addEventListener('click', () => questionsModal.classList.add('hidden'));

    // Add event listener for showing incorrect MCQs
    showIncorrectMcqsBtn.addEventListener('click', showIncorrectMcqs);
    
    // Set up score tabs
    setupScoreTabs();
}

// Start the quiz (called from HTML)
function startQuiz() {
    userName = document.getElementById('user-name').value;
    if (!userName) {
        alert('Please enter your name first!');
        return;
    }
    
    welcomeScreen.classList.add('hidden');
    questionSelectScreen.classList.remove('hidden');
}

// Start the exam with selected question count (called from HTML)
function startExam(count) {
    questionCount = count;
    
    // Reset variables
    currentQuestionIndex = 0;
    score = 0;
    wrongQuestions = [];
    
    // Select random questions
    selectedQuestions = selectRandomQuestions(questionCount);
    
    // Hide question select screen and show exam screen
    questionSelectScreen.classList.add('hidden');
    examScreen.classList.remove('hidden');
    
    // Reset and start timer
    elapsedTime = 0;
    startTimer();
    
    // Show first question
    showQuestion();
}

// Select random questions from the question bank
function selectRandomQuestions(count) {
    const shuffled = [...questions].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

// Show current question
function showQuestion() {
    const question = selectedQuestions[currentQuestionIndex];
    
    // Update question text
    document.getElementById('question-text').textContent = 
        `Question ${currentQuestionIndex + 1} of ${questionCount}: ${question.question}`;
    
    // Clear previous options
    optionsContainer.innerHTML = '';
    
    // Add new options
    question.options.forEach((option, index) => {
        const button = document.createElement('button');
        button.classList.add('option');
        button.textContent = option;
        button.onclick = () => checkAnswer(index);
        optionsContainer.appendChild(button);
    });

    // Always hide submit button initially on each question
    const submitButton = document.getElementById('submit-exam');
    submitButton.classList.add('hidden');
}

// Check if the selected answer is correct
function checkAnswer(selectedIndex) {
    const question = selectedQuestions[currentQuestionIndex];
    
    if (selectedIndex === question.correctAnswer) {
        score++;
    } else {
        wrongQuestions.push({
            question: question.question,
            selectedAnswer: question.options[selectedIndex],
            correctAnswer: question.options[question.correctAnswer]
        });
    }
    
    // If this is the last question, show the submit button
    if (currentQuestionIndex === questionCount - 1) {
        const submitButton = document.getElementById('submit-exam');
        submitButton.classList.remove('hidden');
        submitButton.onclick = submitExam;
    } else {
        // Move to next question
        currentQuestionIndex++;
        showQuestion();
    }
}

// Start the timer
function startTimer() {
    timer = setInterval(() => {
        elapsedTime++; // Increment elapsed time
        updateTimerDisplay();

        // Check if time limit is reached for 70 questions
        if (questionCount === 70 && elapsedTime >= 5400) { // 5400 seconds = 1 hour 30 minutes
            submitExam();
        }
    }, 1000);
}

// Update timer display
function updateTimerDisplay() {
    const minutes = Math.floor(elapsedTime / 60);
    const seconds = elapsedTime % 60;
    timerDisplay.textContent = 
        `Time: ${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// Submit the exam
function submitExam() {
    // Clear timer
    clearInterval(timer);
    
    // Hide exam screen and show results
    examScreen.classList.add('hidden');
    resultContainer.classList.remove('hidden');
    
    // Update score display with both percentage and correct answers
    const percentage = (score / questionCount) * 100;
    scoreDisplay.textContent = `${percentage.toFixed(1)}% (${score} correct out of ${questionCount} questions)`;
    
    // Save score
    saveScore(percentage, score);
    
    // Show wrong questions if any
    showWrongQuestions();
    
    // Show top scores
    showTopScores();
}

// Save score to localStorage
function saveScore(percentage, correctAnswers) {
    const scores = JSON.parse(localStorage.getItem('scores') || '{}');
    if (!scores[questionCount]) {
        scores[questionCount] = [];
    }
    
    const scoreEntry = {
        name: userName,
        score: percentage,
        correctAnswers: correctAnswers,
        totalQuestions: questionCount,
        date: new Date().toISOString()
    };
    
    // Check if user already exists in the scores
    const existingUserIndex = scores[questionCount].findIndex(entry => entry.name === userName);
    
    if (existingUserIndex !== -1) {
        // Update score if new score is higher
        if (percentage > scores[questionCount][existingUserIndex].score) {
            scores[questionCount][existingUserIndex] = scoreEntry;
        }
    } else {
        // Add new score
        scores[questionCount].push(scoreEntry);
    }
    
    // Sort scores in descending order
    scores[questionCount].sort((a, b) => b.score - a.score);
    
    // Keep only top 10 scores for each question count
    scores[questionCount] = scores[questionCount].slice(0, 10);
    
    localStorage.setItem('scores', JSON.stringify(scores));
}

// Show wrong questions
function showWrongQuestions() {
    const wrongQuestionsContainer = document.getElementById('wrong-questions');
    if (!wrongQuestionsContainer) return;
    
    wrongQuestionsContainer.innerHTML = '';
    
    if (wrongQuestions.length === 0) {
        wrongQuestionsContainer.innerHTML = '<div class="perfect-score">Perfect Score! 🎉</div>';
        return;
    }
    
    wrongQuestions.forEach(wrong => {
        const div = document.createElement('div');
        div.innerHTML = `
            <p><strong>Question:</strong> ${wrong.question}</p>
            <p><strong>Your Answer:</strong> ${wrong.selectedAnswer}</p>
            <p><strong>Correct Answer:</strong> ${wrong.correctAnswer}</p>
        `;
        wrongQuestionsContainer.appendChild(div);
    });
}

// Show top scores in the results screen
function showTopScores() {
    const scores = JSON.parse(localStorage.getItem('scores') || '{}');
    const questionScores = scores[questionCount] || [];
    
    // Clear previous scores
    topScoresDiv.innerHTML = '';
    
    if (questionScores.length === 0) {
        topScoresDiv.innerHTML = '<p>No previous scores available</p>';
        return;
    }
    
    // Create a list for scores
    const scoresList = document.createElement('ul');
    scoresList.classList.add('top-scores-list');
    
    // Get top 5 scores
    const topScores = questionScores.slice(0, 5);
    
    // Add each score to the list
    topScores.forEach((score, index) => {
        const li = document.createElement('li');
        const scoreText = score.correctAnswers ? 
            `${score.score.toFixed(1)}% (${score.correctAnswers}/${score.totalQuestions} correct)` :
            `${score.score.toFixed(1)}%`;
        li.innerHTML = `
            <span class="rank">#${index + 1}</span>
            <span class="name">${score.name}</span>
            <span class="score">${scoreText}</span>
        `;
        scoresList.appendChild(li);
    });
    
    topScoresDiv.appendChild(scoresList);
}

// Show all questions in alphabetical order
function showAllQuestions() {
    // Sort questions alphabetically
    const sortedQuestions = [...questions].sort((a, b) => 
        a.question.toLowerCase().localeCompare(b.question.toLowerCase())
    );
    
    // Clear the questions list
    questionsList.innerHTML = '';
    
    // Add each question to the list
    sortedQuestions.forEach((q, index) => {
        const questionDiv = document.createElement('div');
        questionDiv.classList.add('question-item');
        questionDiv.textContent = `${index + 1}. ${q.question}`;
        questionsList.appendChild(questionDiv);
    });
    
    // Show the modal
    questionsModal.classList.remove('hidden');
}

// Set up score tabs
function setupScoreTabs() {
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const count = parseInt(tab.dataset.questions);
            showScoresForCount(count);
            
            // Update active tab
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
        });
    });
}

// Show scores for specific question count in modal
function showScoresForCount(count) {
    const scores = JSON.parse(localStorage.getItem('scores') || '{}');
    const questionScores = scores[count] || [];
    
    // Update scores list
    scoresList.innerHTML = '';
    
    if (questionScores.length === 0) {
        const li = document.createElement('li');
        li.textContent = 'No scores yet';
        scoresList.appendChild(li);
        return;
    }
    
    questionScores.forEach((score, index) => {
        const li = document.createElement('li');
        const date = new Date(score.date).toLocaleDateString();
        const scoreText = score.correctAnswers ? 
            `${score.score.toFixed(1)}% (${score.correctAnswers}/${score.totalQuestions} correct)` :
            `${score.score.toFixed(1)}%`;
        li.textContent = `${index + 1}. ${score.name}: ${scoreText} - ${date}`;
        scoresList.appendChild(li);
    });
}

// Show incorrect MCQs
function showIncorrectMcqs() {
    incorrectMcqsList.innerHTML = ''; // Clear any existing content

    if (wrongQuestions.length === 0) {
        incorrectMcqsList.innerHTML = '<div class="perfect-score">Perfect Score! 🎉</div>';
        return;
    }

    wrongQuestions.forEach(mcq => {
        const mcqItem = document.createElement('div');
        mcqItem.classList.add('mcq-item');
        mcqItem.innerHTML = `
            <p><strong>Question:</strong> ${mcq.question}</p>
            <p><strong>Your Answer:</strong> ${mcq.selectedAnswer}</p>
            <p><strong>Correct Answer:</strong> ${mcq.correctAnswer}</p>
        `;
        incorrectMcqsList.appendChild(mcqItem);
    });

    incorrectMcqsList.classList.toggle('hidden');
}

// Show scores modal
function showScores() {
    modal.classList.remove('hidden');
    showScoresForCount(10); // Default to 10 questions
}

// Add event listeners for restart and home buttons
document.getElementById('restart-btn').addEventListener('click', function() {
    resultContainer.classList.add('hidden');
    questionSelectScreen.classList.remove('hidden');
});

document.getElementById('home-btn').addEventListener('click', function() {
    resultContainer.classList.add('hidden');
    welcomeScreen.classList.remove('hidden');
    document.getElementById('user-name').value = '';
    userName = '';
});

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init);

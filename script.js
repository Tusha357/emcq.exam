let currentQuestionIndex = 0;
let selectedQuestions = [];
let userAnswers = [];
let timerInterval;
let startTime;
let userName = '';
let isScoresVisible = false;

function startQuiz() {
    userName = document.getElementById('user-name').value;
    if (!userName) {
        alert('Please enter your name first!');
        return;
    }
    
    // Hide welcome screen and show question selection
    document.getElementById('welcome-screen').classList.add('hidden');
    document.getElementById('question-select-screen').classList.remove('hidden');
}

function startExam(questionCount) {
    // Hide question selection screen
    document.getElementById('question-select-screen').classList.add('hidden');
    
    // Randomly select questions
    const shuffledQuestions = [...questions].sort(() => Math.random() - 0.5);
    selectedQuestions = shuffledQuestions.slice(0, questionCount);
    
    // Show exam screen
    document.getElementById('exam-screen').classList.remove('hidden');
    
    // Start timer and show first question
    startTime = new Date();
    startTimer();
    showQuestion();
}

function startTimer() {
    timerInterval = setInterval(updateTimer, 1000);
}

function updateTimer() {
    const currentTime = new Date();
    const timeDiff = Math.floor((currentTime - startTime) / 1000);
    const minutes = Math.floor(timeDiff / 60);
    const seconds = timeDiff % 60;
    
    document.getElementById('timer').textContent = 
        `Time: ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function showQuestion() {
    const question = selectedQuestions[currentQuestionIndex];
    document.getElementById('question-text').textContent = 
        `${currentQuestionIndex + 1}. ${question.question}`;
    
    const optionsContainer = document.getElementById('options-container');
    optionsContainer.innerHTML = '';
    
    question.options.forEach((option, index) => {
        const optionDiv = document.createElement('div');
        optionDiv.className = 'option';
        optionDiv.textContent = option;
        optionDiv.onclick = () => selectOption(index);
        if (userAnswers[currentQuestionIndex] === index) {
            optionDiv.classList.add('selected');
        }
        optionsContainer.appendChild(optionDiv);
    });

    const submitButton = document.getElementById('submit-exam');
    submitButton.classList.toggle('hidden', currentQuestionIndex < selectedQuestions.length - 1);
}

function selectOption(optionIndex) {
    userAnswers[currentQuestionIndex] = optionIndex;
    
    const options = document.querySelectorAll('.option');
    options.forEach(option => option.classList.remove('selected'));
    options[optionIndex].classList.add('selected');
    
    if (currentQuestionIndex < selectedQuestions.length - 1) {
        setTimeout(() => {
            currentQuestionIndex++;
            showQuestion();
        }, 500);
    }
}

function submitExam() {
    clearInterval(timerInterval);
    const score = calculateScore();
    const totalQuestions = selectedQuestions.length;
    
    // Save score with timestamp
    saveScore(score, totalQuestions);
    
    // Show results
    document.getElementById('exam-screen').classList.add('hidden');
    document.getElementById('results-screen').classList.remove('hidden');
    
    document.getElementById('score').textContent = `${score} out of ${totalQuestions}`;
    
    // Show wrong questions instead of top scores
    showWrongQuestions();
}

function calculateScore() {
    return selectedQuestions.reduce((score, question, index) => {
        return score + (userAnswers[index] === question.correctAnswer ? 1 : 0);
    }, 0);
}

function saveScore(score, questionCount) {
    const timestamp = new Date().toISOString();
    const scoreData = {
        name: userName,
        score: score,
        questionCount: questionCount,
        timestamp: timestamp
    };

    // Get existing scores
    let leaderboardData = JSON.parse(localStorage.getItem('leaderboard') || '[]');
    
    // Add new score
    leaderboardData.push(scoreData);
    
    // Sort by timestamp (newest first)
    leaderboardData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    // Save back to localStorage
    localStorage.setItem('leaderboard', JSON.stringify(leaderboardData));
}

function showWrongQuestions() {
    const wrongQuestions = selectedQuestions.filter((question, index) => 
        userAnswers[index] !== question.correctAnswer
    );

    const wrongQuestionsContainer = document.getElementById('wrong-questions');
    
    if (wrongQuestions.length === 0) {
        wrongQuestionsContainer.innerHTML = '<div class="perfect-score">Congratulations! You got all questions correct! 🎉</div>';
        return;
    }

    let html = `
        <div class="wrong-questions-header">
            <h3>Questions to Review (${wrongQuestions.length} incorrect)</h3>
            <p class="review-message">📚 Take time to study these topics to improve your understanding</p>
        </div>
        <div class="wrong-questions-list">
    `;

    wrongQuestions.forEach((question, index) => {
        const userAnswer = userAnswers[selectedQuestions.indexOf(question)];
        html += `
            <div class="wrong-question-item">
                <div class="question-text">
                    <span class="question-number">Question ${selectedQuestions.indexOf(question) + 1}</span>
                    ${question.question}
                </div>
                <div class="answer-comparison">
                    <div class="wrong-answer">
                        <span class="label">Your Answer:</span>
                        <span class="incorrect">${userAnswer}</span>
                    </div>
                    <div class="correct-answer">
                        <span class="label">Correct Answer:</span>
                        <span class="correct">${question.correctAnswer}</span>
                    </div>
                </div>
            </div>
        `;
    });

    html += '</div>';
    wrongQuestionsContainer.innerHTML = html;
    wrongQuestionsContainer.classList.remove('hidden');
}

document.getElementById('restart-btn').addEventListener('click', function() {
    // Hide results screen
    document.getElementById('results-screen').classList.add('hidden');
    
    // Show question selection screen
    document.getElementById('question-select-screen').classList.remove('hidden');
    
    // Clear previous answers
    userAnswers = [];
    currentQuestionIndex = 0;
    selectedQuestions = [];
});

document.getElementById('home-btn').addEventListener('click', function() {
    // Hide all screens
    document.getElementById('results-screen').classList.add('hidden');
    document.getElementById('question-select-screen').classList.add('hidden');
    document.getElementById('exam-screen').classList.add('hidden');
    
    // Show welcome screen
    document.getElementById('welcome-screen').classList.remove('hidden');
    
    // Clear all states
    userAnswers = [];
    currentQuestionIndex = 0;
    selectedQuestions = [];
    userName = '';
    document.getElementById('user-name').value = '';
});

document.querySelector('.close-btn').addEventListener('click', function() {
    document.getElementById('scores-modal').classList.add('hidden');
});

// Tab functionality
document.querySelectorAll('.score-tabs .tab-btn').forEach(tab => {
    tab.addEventListener('click', function() {
        // Update active tab
        document.querySelectorAll('.score-tabs .tab-btn').forEach(t => t.classList.remove('active'));
        this.classList.add('active');
        
        // Show scores for selected question count
        showScores(parseInt(this.dataset.questions));
    });
});

function showScores(questionCount) {
    const scoresDiv = document.getElementById('all-scores');
    const leaderboardData = JSON.parse(localStorage.getItem('leaderboard') || '[]');
    
    // Filter scores for selected question count and sort by score
    const filteredScores = leaderboardData
        .filter(entry => entry.questionCount === questionCount)
        .sort((a, b) => b.score - a.score);
    
    if (filteredScores.length === 0) {
        scoresDiv.innerHTML = '<div class="no-scores">No scores yet for this section!</div>';
        return;
    }
    
    scoresDiv.innerHTML = filteredScores.map((entry, index) => {
        let rankClass = '';
        if (index === 0) rankClass = 'top-1';
        else if (index === 1) rankClass = 'top-2';
        else if (index === 2) rankClass = 'top-3';
        
        return `
            <div class="score-entry ${rankClass}">
                <div class="rank-name">
                    <span>#${index + 1}</span>
                    <span>${entry.name}</span>
                </div>
                <div class="score-value">${entry.score} out of ${entry.questionCount}</div>
            </div>
        `;
    }).join('');
}

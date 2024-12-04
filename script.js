let currentQuestionIndex = 0;
let selectedQuestions = [];
let userAnswers = [];
let timerInterval;
let startTime;
let userName = '';

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
    const percentage = Math.round((score / totalQuestions) * 100);
    
    // Get existing leaderboard
    let leaderboardData = JSON.parse(localStorage.getItem('leaderboard') || '[]');
    
    // Find if user already exists with same question count
    const existingUserIndex = leaderboardData.findIndex(entry => 
        entry.name.toLowerCase() === userName.toLowerCase() &&
        entry.questionCount === totalQuestions
    );
    
    const newScore = {
        name: userName,
        score: percentage,
        questionCount: totalQuestions,
        date: new Date().toLocaleDateString()
    };
    
    if (existingUserIndex !== -1) {
        // If new score is higher, update the existing entry
        if (percentage > leaderboardData[existingUserIndex].score) {
            leaderboardData[existingUserIndex] = newScore;
        }
    } else {
        // Add new entry
        leaderboardData.push(newScore);
    }
    
    // Sort by score (descending)
    leaderboardData = leaderboardData
        .filter(entry => entry.questionCount === totalQuestions)
        .sort((a, b) => b.score - a.score);
    
    localStorage.setItem('leaderboard', JSON.stringify(leaderboardData));
    
    // Update display
    document.getElementById('score').textContent = percentage;
    document.getElementById('exam-screen').classList.add('hidden');
    document.getElementById('results-screen').classList.remove('hidden');
    
    // Automatically show the leaderboard with all scores
    const leaderboard = document.getElementById('leaderboard');
    const topScores = document.getElementById('top-scores');
    leaderboard.classList.remove('hidden');
    
    if (leaderboardData.length === 0) {
        topScores.innerHTML = '<div class="no-scores">No scores yet!</div>';
    } else {
        topScores.innerHTML = leaderboardData
            .map((entry, index) => `
                <div class="${index < 3 ? 'top-' + (index + 1) : ''}">
                    <span>${index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '#' + (index + 1)} ${entry.name}</span>
                    <span>${entry.score}% (${entry.date})</span>
                </div>
            `).join('');
    }
}

function calculateScore() {
    return selectedQuestions.reduce((score, question, index) => {
        return score + (userAnswers[index] === question.correctAnswer ? 1 : 0);
    }, 0);
}

document.getElementById('show-leaderboard').addEventListener('click', function() {
    const leaderboard = document.getElementById('leaderboard');
    const topScores = document.getElementById('top-scores');
    
    if (leaderboard.classList.contains('hidden')) {
        leaderboard.classList.remove('hidden');
        const leaderboardData = JSON.parse(localStorage.getItem('leaderboard') || '[]');
        
        if (leaderboardData.length === 0) {
            topScores.innerHTML = '<div class="no-scores">No scores yet!</div>';
        } else {
            topScores.innerHTML = leaderboardData
                .filter(entry => entry.questionCount === selectedQuestions.length)
                .map((entry, index) => `
                    <div>
                        <span>#${index + 1} ${entry.name}</span>
                        <span>${entry.score}% (${entry.questionCount} Q)</span>
                    </div>
                `).join('');
        }
    } else {
        leaderboard.classList.add('hidden');
    }
});

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

document.getElementById('view-scores-btn').addEventListener('click', function() {
    document.getElementById('scores-modal').classList.remove('hidden');
    showScores(10); // Show 10Q scores by default
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
    
    scoresDiv.innerHTML = filteredScores.map((entry, index) => `
        <div>
            <span>#${index + 1} ${entry.name}</span>
            <span>${entry.score}% (${entry.date})</span>
        </div>
    `).join('');
}

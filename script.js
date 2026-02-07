// Game configuration
const CONFIG = {
    totalQuestions: 20,
    optionsPerQuestion: 4
};

// Vocabulary dataset (exactly as specified)
const VOCABULARY = [
    { es: "madre", ru: "мама", emoji: "👩" },
    { es: "padre", ru: "папа", emoji: "👨" },
    { es: "hermano", ru: "брат", emoji: "👦" },
    { es: "hermana", ru: "сестра", emoji: "👧" },
    { es: "abuela", ru: "бабушка", emoji: "👵" },
    { es: "abuelo", ru: "дедушка", emoji: "👴" },
    { es: "hijo", ru: "сын", emoji: "🧒" },
    { es: "hija", ru: "дочь", emoji: "👧" },
    { es: "tía", ru: "тётя", emoji: "👩‍🦱" },
    { es: "tío", ru: "дядя", emoji: "👨‍🦱" },
    { es: "primo", ru: "двоюродный брат", emoji: "👦" },
    { es: "prima", ru: "двоюродная сестра", emoji: "👧" },
    { es: "esposo", ru: "муж", emoji: "🤵" },
    { es: "esposa", ru: "жена", emoji: "👰" },
    { es: "nieto", ru: "внук", emoji: "👶" },
    { es: "nieta", ru: "внучка", emoji: "👶" }
];

// Game state
let gameState = {
    currentQuestionIndex: 0,
    score: 0,
    questions: [],
    selectedAnswer: null,
    isAnswered: false
};

// DOM Elements
const startScreen = document.getElementById('start-screen');
const quizScreen = document.getElementById('quiz-screen');
const resultsScreen = document.getElementById('results-screen');
const startBtn = document.getElementById('start-btn');
const nextBtn = document.getElementById('next-btn');
const restartBtn = document.getElementById('restart-btn');
const scoreElement = document.getElementById('score');
const progressBarFill = document.getElementById('progress-bar-fill');
const progressText = document.getElementById('progress-text');
const questionTypeElement = document.getElementById('question-type');
const questionContentElement = document.getElementById('question-content');
const optionsContainer = document.getElementById('options-container');
const feedbackElement = document.getElementById('feedback');
const finalScoreElement = document.getElementById('final-score');
const scorePercentageElement = document.getElementById('score-percentage');
const resultMessageElement = document.getElementById('result-message');
const resultsEmojiElement = document.getElementById('results-emoji');

// Utility functions
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateQuestions() {
    const questions = [];
    
    // Create a pool of available words
    let availableWords = [...VOCABULARY];
    
    for (let i = 0; i < CONFIG.totalQuestions; i++) {
        // If we've used all words, reset the pool
        if (availableWords.length === 0) {
            availableWords = [...VOCABULARY];
        }
        
        // Pick a random word from available words
        const randomIndex = Math.floor(Math.random() * availableWords.length);
        const correctWord = availableWords[randomIndex];
        
        // Remove it from available words for this round
        availableWords.splice(randomIndex, 1);
        
        // Randomly decide question type
        const questionType = Math.random() > 0.5 ? 'word' : 'emoji';
        
        // Generate incorrect options
        const incorrectOptions = [];
        const allWords = [...VOCABULARY];
        
        // Create a pool of words excluding the correct one
        const wordPool = allWords.filter(word => word.es !== correctWord.es);
        
        // Shuffle and pick 3 unique incorrect options
        const shuffledPool = shuffleArray(wordPool);
        for (let j = 0; j < CONFIG.optionsPerQuestion - 1; j++) {
            incorrectOptions.push(shuffledPool[j].ru);
        }
        
        // Create question object
        const question = {
            type: questionType,
            correctWord: correctWord,
            options: shuffleArray([correctWord.ru, ...incorrectOptions])
        };
        
        questions.push(question);
    }
    
    return questions;
}

// Game functions
function startGame() {
    console.log('Start game function called'); // Debug log
    
    // Reset game state
    gameState = {
        currentQuestionIndex: 0,
        score: 0,
        questions: generateQuestions(),
        selectedAnswer: null,
        isAnswered: false
    };
    
    // Update UI
    updateScore();
    updateProgress();
    
    // Switch screens
    startScreen.classList.remove('active');
    quizScreen.classList.add('active');
    resultsScreen.classList.remove('active');
    
    // Load first question
    loadQuestion();
}

function loadQuestion() {
    const question = gameState.questions[gameState.currentQuestionIndex];
    
    // Reset UI state
    gameState.selectedAnswer = null;
    gameState.isAnswered = false;
    nextBtn.disabled = true;
    feedbackElement.innerHTML = '';
    
    // Update question type indicator
    if (question.type === 'word') {
        questionTypeElement.textContent = 'Слово на испанском';
        questionContentElement.textContent = question.correctWord.es;
    } else {
        questionTypeElement.textContent = 'Эмодзи семьи';
        questionContentElement.textContent = question.correctWord.emoji;
    }
    
    // Generate options
    optionsContainer.innerHTML = '';
    question.options.forEach((option) => {
        const optionElement = document.createElement('div');
        optionElement.className = 'option';
        optionElement.textContent = option;
        optionElement.dataset.value = option;
        
        optionElement.addEventListener('click', () => selectAnswer(option));
        optionsContainer.appendChild(optionElement);
    });
    
    // Update progress
    updateProgress();
}

function updateProgress() {
    const progress = ((gameState.currentQuestionIndex + 1) / CONFIG.totalQuestions) * 100;
    progressBarFill.style.width = `${progress}%`;
    progressText.textContent = `Вопрос ${gameState.currentQuestionIndex + 1} из ${CONFIG.totalQuestions}`;
}

function updateScore() {
    scoreElement.textContent = gameState.score;
}

function selectAnswer(answer) {
    if (gameState.isAnswered) return;
    
    gameState.selectedAnswer = answer;
    gameState.isAnswered = true;
    
    const question = gameState.questions[gameState.currentQuestionIndex];
    const isCorrect = answer === question.correctWord.ru;
    
    // Highlight selected answer
    const optionElements = document.querySelectorAll('.option');
    optionElements.forEach(option => {
        option.classList.remove('selected');
        if (option.dataset.value === answer) {
            option.classList.add('selected');
            
            if (isCorrect) {
                option.classList.add('correct');
                gameState.score++;
                updateScore();
            } else {
                option.classList.add('incorrect');
            }
        }
        
        // Highlight correct answer if user was wrong
        if (!isCorrect && option.dataset.value === question.correctWord.ru) {
            option.classList.add('correct');
        }
        
        // Disable further clicks
        option.style.pointerEvents = 'none';
    });
    
    // Show feedback
    showFeedback(isCorrect, question.correctWord);
    
    // Enable next button
    nextBtn.disabled = false;
}

function showFeedback(isCorrect, correctWord) {
    let feedbackHTML = '';
    
    if (isCorrect) {
        feedbackHTML = `
            <div class="feedback-content feedback-correct">
                <span class="feedback-emoji">✅</span>
                Правильно! ${correctWord.es} = ${correctWord.ru}
            </div>
        `;
    } else {
        feedbackHTML = `
            <div class="feedback-content feedback-incorrect">
                <span class="feedback-emoji">❌</span>
                Неправильно. Правильный ответ: ${correctWord.ru}
            </div>
        `;
    }
    
    feedbackElement.innerHTML = feedbackHTML;
}

function nextQuestion() {
    gameState.currentQuestionIndex++;
    
    if (gameState.currentQuestionIndex < CONFIG.totalQuestions) {
        loadQuestion();
    } else {
        showResults();
    }
}

function showResults() {
    // Calculate score
    const percentage = Math.round((gameState.score / CONFIG.totalQuestions) * 100);
    
    // Update results screen
    finalScoreElement.textContent = gameState.score;
    scorePercentageElement.textContent = `${percentage}%`;
    
    // Set result message and emoji based on performance
    let message = '';
    let emoji = '';
    
    if (percentage === 100) {
        message = 'Идеально! Ты отлично знаешь испанские слова для семьи! ¡Excelente!';
        emoji = '🏆';
    } else if (percentage >= 80) {
        message = 'Отличный результат! Ты хорошо знаешь семью на испанском. ¡Muy bien!';
        emoji = '🎉';
    } else if (percentage >= 60) {
        message = 'Хорошая работа! Ещё немного практики - и будет идеально. ¡Buen trabajo!';
        emoji = '👍';
    } else if (percentage >= 40) {
        message = 'Неплохо! Продолжай учить эти слова. ¡Sigue así!';
        emoji = '💪';
    } else {
        message = 'Попробуй ещё раз! С каждым разом будет получаться лучше. ¡Ánimo!';
        emoji = '📚';
    }
    
    resultMessageElement.textContent = message;
    resultsEmojiElement.textContent = emoji;
    
    // Switch screens
    quizScreen.classList.remove('active');
    resultsScreen.classList.add('active');
}

function restartGame() {
    startGame();
}

// Initialize event listeners when DOM is loaded
function initializeGame() {
    console.log('Initializing game...'); // Debug log
    
    // Set initial screen
    startScreen.classList.add('active');
    quizScreen.classList.remove('active');
    resultsScreen.classList.remove('active');
    
    // Add event listeners
    if (startBtn) {
        startBtn.addEventListener('click', startGame);
        console.log('Start button event listener added'); // Debug log
    } else {
        console.error('Start button not found!');
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', nextQuestion);
    }
    
    if (restartBtn) {
        restartBtn.addEventListener('click', restartGame);
    }
    
    // Add some animation to the start button
    startBtn.addEventListener('mouseenter', function() {
        this.style.transform = 'scale(1.05)';
    });
    
    startBtn.addEventListener('mouseleave', function() {
        this.style.transform = 'scale(1)';
    });
    
    console.log('Game initialized successfully'); // Debug log
}

// Initialize the game when DOM is fully loaded
document.addEventListener('DOMContentLoaded', initializeGame);

// Also try to initialize if DOM is already loaded
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(initializeGame, 1);
}

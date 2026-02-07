// Game configuration
const CONFIG = {
    totalQuestions: 20,
    optionsPerQuestion: 4
};

// Vocabulary dataset (без эмодзи, только слова)
const VOCABULARY = [
    { es: "madre", ru: "мама" },
    { es: "padre", ru: "папа" },
    { es: "hermano", ru: "брат" },
    { es: "hermana", ru: "сестра" },
    { es: "abuela", ru: "бабушка" },
    { es: "abuelo", ru: "дедушка" },
    { es: "hijo", ru: "сын" },
    { es: "hija", ru: "дочь" },
    { es: "tía", ru: "тётя" },
    { es: "tío", ru: "дядя" },
    { es: "primo", ru: "двоюродный брат" },
    { es: "prima", ru: "двоюродная сестра" },
    { es: "esposo", ru: "муж" },
    { es: "esposa", ru: "жена" },
    { es: "nieto", ru: "внук" },
    { es: "nieta", ru: "внучка" }
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
    
    for (let i = 0; i < CONFIG.totalQuestions; i++) {
        // Pick a random word from vocabulary
        const correctIndex = Math.floor(Math.random() * VOCABULARY.length);
        const correctWord = VOCABULARY[correctIndex];
        
        // Randomly decide question direction
        // true = русский → испанский, false = испанский → русский
        const isRussianToSpanish = Math.random() > 0.5;
        
        // Generate incorrect options
        const incorrectOptions = [];
        const allWords = [...VOCABULARY];
        
        // Remove correct word from pool
        const wordPool = allWords.filter(word => word.es !== correctWord.es);
        
        // Shuffle and pick 3 incorrect options
        const shuffledPool = shuffleArray(wordPool);
        for (let j = 0; j < CONFIG.optionsPerQuestion - 1; j++) {
            if (isRussianToSpanish) {
                incorrectOptions.push(shuffledPool[j].es); // испанские варианты
            } else {
                incorrectOptions.push(shuffledPool[j].ru); // русские варианты
            }
        }
        
        // Create options array
        let options;
        if (isRussianToSpanish) {
            options = shuffleArray([correctWord.es, ...incorrectOptions]);
        } else {
            options = shuffleArray([correctWord.ru, ...incorrectOptions]);
        }
        
        // Create question object
        const question = {
            direction: isRussianToSpanish ? 'ru→es' : 'es→ru',
            correctWord: correctWord,
            options: options,
            questionText: isRussianToSpanish ? correctWord.ru : correctWord.es
        };
        
        questions.push(question);
    }
    
    return questions;
}

// Game functions
function startGame() {
    console.log('Start game function called');
    
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
    
    // Update question type and content
    if (question.direction === 'ru→es') {
        questionTypeElement.textContent = 'Перевод с русского на испанский';
        questionContentElement.textContent = `"${question.questionText}"`;
        questionContentElement.style.fontSize = '2.5rem';
        questionContentElement.style.color = '#4a6fa5';
    } else {
        questionTypeElement.textContent = 'Перевод с испанского на русский';
        questionContentElement.textContent = `"${question.questionText}"`;
        questionContentElement.style.fontSize = '2.5rem';
        questionContentElement.style.color = '#4a6fa5';
        questionContentElement.style.fontStyle = 'italic';
    }
    
    // Generate options
    optionsContainer.innerHTML = '';
    question.options.forEach((option) => {
        const optionElement = document.createElement('div');
        optionElement.className = 'option';
        optionElement.textContent = option;
        optionElement.dataset.value = option;
        
        optionElement.addEventListener('click', () => selectAnswer(option, question.direction));
        optionsContainer.appendChild(optionElement);
    });
    
    // Update progress
    updateProgress();
}

function updateProgress() {
    const progress = ((gameState.currentQuestionIndex + 1) / CONFIG.totalQuestions) * 100;
    if (progressBarFill) {
        progressBarFill.style.width = `${progress}%`;
    }
    progressText.textContent = `Вопрос ${gameState.currentQuestionIndex + 1} из ${CONFIG.totalQuestions}`;
}

function updateScore() {
    scoreElement.textContent = gameState.score;
}

function selectAnswer(answer, direction) {
    if (gameState.isAnswered) return;
    
    gameState.selectedAnswer = answer;
    gameState.isAnswered = true;
    
    const question = gameState.questions[gameState.currentQuestionIndex];
    
    // Determine correct answer based on direction
    const correctAnswer = direction === 'ru→es' ? question.correctWord.es : question.correctWord.ru;
    const isCorrect = answer === correctAnswer;
    
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
        if (!isCorrect && option.dataset.value === correctAnswer) {
            option.classList.add('correct');
        }
        
        // Disable further clicks
        option.style.pointerEvents = 'none';
    });
    
    // Show feedback
    showFeedback(isCorrect, question.correctWord, direction);
    
    // Enable next button
    nextBtn.disabled = false;
}

function showFeedback(isCorrect, correctWord, direction) {
    let feedbackHTML = '';
    const correctTranslation = direction === 'ru→es' ? correctWord.es : correctWord.ru;
    const fromLang = direction === 'ru→es' ? correctWord.ru : correctWord.es;
    const toLang = direction === 'ru→es' ? correctWord.es : correctWord.ru;
    
    if (isCorrect) {
        feedbackHTML = `
            <div class="feedback-content feedback-correct">
                <span class="feedback-emoji">✅</span>
                Правильно! ${fromLang} = ${toLang}
            </div>
        `;
    } else {
        feedbackHTML = `
            <div class="feedback-content feedback-incorrect">
                <span class="feedback-emoji">❌</span>
                Неправильно. ${fromLang} = ${toLang}
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
    console.log('Initializing game...');
    
    // Set initial screen
    startScreen.classList.add('active');
    quizScreen.classList.remove('active');
    resultsScreen.classList.remove('active');
    
    // Add event listeners
    if (startBtn) {
        startBtn.addEventListener('click', startGame);
        console.log('Start button event listener added');
    } else {
        console.error('Start button not found!');
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', nextQuestion);
    }
    
    if (restartBtn) {
        restartBtn.addEventListener('click', restartGame);
    }
    
    // Add hover animation to the start button
    if (startBtn) {
        startBtn.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.05)';
        });
        
        startBtn.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });
    }
    
    console.log('Game initialized successfully');
}

// Initialize the game when DOM is fully loaded
document.addEventListener('DOMContentLoaded', initializeGame);

// Also try to initialize if DOM is already loaded
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(initializeGame, 1);
}

// F-1 Visa Interview Practice App - Main JavaScript File

// Global variables
let currentTab = ‘practice’;
let studentProfile = {};
let customQuestions = [];
let profileBasedQuestions = [];
let allQuestions = [];
let currentQuestionIndex = 0;
let currentRound = 1;
let practiceMode = ‘sequential’; // or ‘random’
let questionQueue = [];
let sessionStats = {
practiced: 0,
approved: 0,
denied: 0,
responses: []
};
let isRecording = false;
let mediaRecorder = null;
let recordingTimer = null;
let responseTimer = null;
let recordingTime = 0;
let responseTime = 0;
let audioChunks = [];

// Question templates that get populated with profile data
const questionTemplates = [
{
template: “Why are you going to the United States of America?”,
generateAnswer: (profile) => `I have been admitted for a ${profile.program} program in ${profile.course} at ${profile.school}. Upon completion of my studies, I plan to return to ${profile.citizenship} to apply this knowledge and contribute to my home country's development.`,
tips: “Emphasize your academic purpose, specific program details, and intent to return home.”
},
{
template: “Why {school}?”,
generateAnswer: (profile) => `I chose ${profile.school} because of its excellent reputation in ${profile.course} and the specific research opportunities that align with my career goals. The university's programs and faculty expertise match perfectly with my academic interests.`,
tips: “Show specific knowledge about the school and how it matches your goals.”
},
{
template: “Why this program / why a {program} / why {course}?”,
generateAnswer: (profile) => `This ${profile.program} in ${profile.course} will provide me with the advanced knowledge and skills needed to address challenges in my field back in ${profile.citizenship}. My previous education in ${profile.previousDegree} has prepared me for this next step.`,
tips: “Connect your previous education to your current program choice and future plans.”
},
{
template: “Who will be covering your cost of attendance?”,
generateAnswer: (profile) => {
const deficit = (profile.coa || 0) - (profile.funding || 0);
return `My ${profile.sponsor} will be covering my expenses. The total cost of attendance is $${profile.coa}, and I have $${profile.funding} in funding/scholarships, leaving a deficit of $${deficit} which my ${profile.sponsor} will cover.`;
},
tips: “Be specific about funding sources and show financial preparedness.”
},
{
template: “What’s your post-study plan?”,
generateAnswer: (profile) => `After completing my ${profile.program} in ${profile.course}, I plan to return to ${profile.citizenship} to apply the knowledge and skills I've gained. I want to contribute to development in my home country.`,
tips: “Demonstrate strong ties to your home country and specific plans to return.”
},
{
template: “Do you have any intention of remaining in the United States?”,
generateAnswer: (profile) => `No, I do not intend to remain in the United States. My goal is to complete my ${profile.program} and return to ${profile.citizenship} to apply my education to contribute to my home country's development.`,
tips: “Be clear and direct about your intent to return home.”
},
{
template: “Tell me more about your highest degree?”,
generateAnswer: (profile) => `I have a ${profile.previousDegree} which provided me with the foundational knowledge in my field. This background has prepared me well for pursuing advanced studies in ${profile.course} at ${profile.school}.`,
tips: “Connect your previous education to your current program.”
},
{
template: “Where is your school located?”,
generateAnswer: (profile) => `${profile.school} is located in the United States and offers excellent academic resources and research opportunities that align with my program in ${profile.course}.`,
tips: “Show basic knowledge about your school’s location and what it offers.”
},
{
template: “Would you be working while schooling?”,
generateAnswer: (profile) => `I may work on-campus as permitted by F-1 visa regulations, such as research or teaching assistantships related to my ${profile.course} program. Any work would be directly related to my academic program.`,
tips: “Show understanding of F-1 work restrictions and keep it academic-focused.”
},
{
template: “How will this degree help you?”,
generateAnswer: (profile) => `This ${profile.program} in ${profile.course} will provide me with advanced skills and knowledge that I can apply to address challenges in my field when I return to ${profile.citizenship}. It will enhance my ability to contribute meaningfully to my home country's development.`,
tips: “Focus on how the degree benefits your home country, not just personal advancement.”
}
];

// Initialize the application
function init() {
loadStoredData();
updateProfileSummary();
updateSessionStats();
switchTab(‘practice’);
simulateUserCount();

```
// Load profile data into form if exists
if (Object.keys(studentProfile).length > 0) {
    populateProfileForm();
}
```

}

// Tab switching function
function switchTab(tab) {
// Hide all content
document.querySelectorAll(’[id$=“Content”]’).forEach(el => el.classList.add(‘hidden’));

```
// Remove active states from all tabs
document.querySelectorAll('[id$="Tab"]').forEach(el => {
    el.classList.remove('text-blue-600', 'border-blue-600');
    el.classList.add('text-gray-600', 'border-transparent');
});

// Show selected content and activate tab
document.getElementById(tab + 'Content').classList.remove('hidden');
const activeTab = document.getElementById(tab + 'Tab');
activeTab.classList.remove('text-gray-600', 'border-transparent');
activeTab.classList.add('text-blue-600', 'border-blue-600');

currentTab = tab;

// Update custom questions list when switching to questions tab
if (tab === 'questions') {
    displayCustomQuestions();
}

// Update results when switching to results tab
if (tab === 'results') {
    updateResultsDisplay();
}
```

}

// Profile management functions
function calculateDeficit() {
const coa = parseFloat(document.getElementById(‘coa’).value) || 0;
const funding = parseFloat(document.getElementById(‘funding’).value) || 0;
const deficit = coa - funding;

```
document.getElementById('calculatedDeficit').textContent = `$${deficit.toLocaleString()}`;
```

}

function saveProfile() {
studentProfile = {
name: document.getElementById(‘studentName’).value,
school: document.getElementById(‘school’).value,
program: document.getElementById(‘program’).value,
course: document.getElementById(‘course’).value,
coa: parseFloat(document.getElementById(‘coa’).value) || 0,
funding: parseFloat(document.getElementById(‘funding’).value) || 0,
award: document.getElementById(‘award’).value,
sponsor: document.getElementById(‘sponsor’).value,
previousDegree: document.getElementById(‘previousDegree’).value,
citizenship: document.getElementById(‘citizenship’).value,
interviewLocation: document.getElementById(‘interviewLocation’).value,
attemptNumber: document.getElementById(‘attemptNumber’).value
};

```
// Save to localStorage
localStorage.setItem('visaInterviewProfile', JSON.stringify(studentProfile));

// Generate profile-based questions
generateProfileQuestions();

// Update profile summary
updateProfileSummary();

// Show success message
showNotification('Profile saved successfully!', 'success');
```

}

function populateProfileForm() {
if (studentProfile.name) document.getElementById(‘studentName’).value = studentProfile.name;
if (studentProfile.school) document.getElementById(‘school’).value = studentProfile.school;
if (studentProfile.program) document.getElementById(‘program’).value = studentProfile.program;
if (studentProfile.course) document.getElementById(‘course’).value = studentProfile.course;
if (studentProfile.coa) document.getElementById(‘coa’).value = studentProfile.coa;
if (studentProfile.funding) document.getElementById(‘funding’).value = studentProfile.funding;
if (studentProfile.award) document.getElementById(‘award’).value = studentProfile.award;
if (studentProfile.sponsor) document.getElementById(‘sponsor’).value = studentProfile.sponsor;
if (studentProfile.previousDegree) document.getElementById(‘previousDegree’).value = studentProfile.previousDegree;
if (studentProfile.citizenship) document.getElementById(‘citizenship’).value = studentProfile.citizenship;
if (studentProfile.interviewLocation) document.getElementById(‘interviewLocation’).value = studentProfile.interviewLocation;
if (studentProfile.attemptNumber) document.getElementById(‘attemptNumber’).value = studentProfile.attemptNumber;

```
calculateDeficit();
```

}

function generateProfileQuestions() {
profileBasedQuestions = questionTemplates.map((template, index) => ({
id: `profile_${index}`,
question: template.template.replace(/{(\w+)}/g, (match, key) => studentProfile[key] || match),
answer: template.generateAnswer(studentProfile),
tips: template.tips,
type: ‘profile’
}));

```
updateAllQuestions();
```

}

// Custom questions management
function addCustomQuestion() {
const question = document.getElementById(‘customQuestion’).value.trim();
const answer = document.getElementById(‘customAnswer’).value.trim();
const tips = document.getElementById(‘customTips’).value.trim();

```
if (!question || !answer) {
    showNotification('Please fill in both question and answer fields.', 'error');
    return;
}

const newQuestion = {
    id: `custom_${Date.now()}`,
    question: question,
    answer: answer,
    tips: tips,
    type: 'custom'
};

customQuestions.push(newQuestion);

// Clear form
document.getElementById('customQuestion').value = '';
document.getElementById('customAnswer').value = '';
document.getElementById('customTips').value = '';

// Save to localStorage
localStorage.setItem('visaInterviewCustomQuestions', JSON.stringify(customQuestions));

// Update display
displayCustomQuestions();
updateAllQuestions();

showNotification('Custom question added successfully!', 'success');
```

}

function deleteCustomQuestion(id) {
customQuestions = customQuestions.filter(q => q.id !== id);
localStorage.setItem(‘visaInterviewCustomQuestions’, JSON.stringify(customQuestions));
displayCustomQuestions();
updateAllQuestions();
showNotification(‘Question deleted successfully!’, ‘success’);
}

function displayCustomQuestions() {
const container = document.getElementById(‘customQuestionsList’);

```
if (customQuestions.length === 0) {
    container.innerHTML = '<p class="text-gray-500">No custom questions added yet.</p>';
    return;
}

container.innerHTML = customQuestions.map(q => `
    <div class="border rounded-lg p-4">
        <div class="flex justify-between items-start mb-2">
            <h4 class="font-medium text-gray-800">${q.question}</h4>
            <button onclick="deleteCustomQuestion('${q.id}')" class="text-red-500 hover:text-red-700">
                <i class="fas fa-trash"></i>
            </button>
        </div>
        <p class="text-gray-600 text-sm mb-2">${q.answer.substring(0, 100)}...</p>
        ${q.tips ? `<p class="text-blue-600 text-xs italic">Tips: ${q.tips}</p>` : ''}
    </div>
`).join('');
```

}

function updateAllQuestions() {
allQuestions = […profileBasedQuestions, …customQuestions];
}

// Interview practice functions
function toggleMode() {
practiceMode = practiceMode === ‘sequential’ ? ‘random’ : ‘sequential’;
document.getElementById(‘modeText’).textContent = practiceMode === ‘random’ ? ‘Random Mode’ : ‘Sequential Mode’;
document.getElementById(‘modeButton’).className = practiceMode === ‘random’
? ‘bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors’
: ‘bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors’;
}

function startInterview() {
if (allQuestions.length === 0) {
showNotification(‘Please add some questions first! Set up your profile or add custom questions.’, ‘error’);
return;
}

```
// Initialize or reset interview
currentQuestionIndex = 0;
questionQueue = [...Array(allQuestions.length).keys()];

if (practiceMode === 'random') {
    questionQueue = shuffleArray(questionQueue);
}

// Show question card and hide welcome message
document.getElementById('questionCard').classList.remove('hidden');
document.getElementById('welcomeMessage').classList.add('hidden');

// Display first question
displayCurrentQuestion();

// Start response timer
startResponseTimer();
```

}

function displayCurrentQuestion() {
if (currentQuestionIndex >= questionQueue.length) {
completeRound();
return;
}

```
const questionIndex = questionQueue[currentQuestionIndex];
const question = allQuestions[questionIndex];

document.getElementById('currentQuestionNumber').textContent = currentQuestionIndex + 1;
document.getElementById('currentQuestionText').textContent = question.question;
document.getElementById('questionType').textContent = question.type === 'profile' ? 'Profile-Based' : 'Custom';
document.getElementById('currentRoundDisplay').textContent = currentRound;
document.getElementById('questionProgress').textContent = `${currentQuestionIndex + 1}/${allQuestions.length}`;

// Update reference answer
document.getElementById('referenceAnswer').textContent = question.answer;
document.getElementById('referenceTips').textContent = question.tips || 'No specific tips for this question.';

// Reset states
document.getElementById('responseAnalysis').classList.add('hidden');
document.getElementById('recordingStatus').classList.add('hidden');
document.getElementById('recordButton').disabled = false;
document.getElementById('stopButton').disabled = true;

// Update navigation buttons
document.getElementById('prevButton').disabled = currentQuestionIndex === 0;
document.getElementById('nextButton').textContent = currentQuestionIndex === questionQueue.length - 1 ? 'Finish Round' : 'Next';
```

}

function nextQuestion() {
if (currentQuestionIndex >= questionQueue.length - 1) {
completeRound();
return;
}

```
currentQuestionIndex++;
displayCurrentQuestion();
startResponseTimer();
```

}

function previousQuestion() {
if (currentQuestionIndex > 0) {
currentQuestionIndex–;
displayCurrentQuestion();
startResponseTimer();
}
}

function completeRound() {
document.getElementById(‘interviewComplete’).classList.remove(‘hidden’);
document.getElementById(‘nextButton’).classList.add(‘hidden’);
document.getElementById(‘prevButton’).classList.add(‘hidden’);
stopResponseTimer();
}

function startNewRound() {
currentRound++;
currentQuestionIndex = 0;

```
// Re-shuffle if random mode
if (practiceMode === 'random') {
    questionQueue = shuffleArray([...Array(allQuestions.length).keys()]);
}

document.getElementById('interviewComplete').classList.add('hidden');
document.getElementById('nextButton').classList.remove('hidden');
document.getElementById('prevButton').classList.remove('hidden');

displayCurrentQuestion();
startResponseTimer();
```

}

// Recording functions
async function startRecording() {
try {
const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

```
    mediaRecorder = new MediaRecorder(stream);
    audioChunks = [];
    
    mediaRecorder.ondataavailable = event => {
        audioChunks.push(event.data);
    };
    
    mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        // Here you would typically send the audio to a speech-to-text service
        analyzeResponse("Sample response text"); // Placeholder
    };
    
    mediaRecorder.start();
    isRecording = true;
    
    // Update UI
    document.getElementById('recordButton').disabled = true;
    document.getElementById('stopButton').disabled = false;
    document.getElementById('recordingStatus').classList.remove('hidden');
    
    // Start recording timer
    recordingTime = 0;
    recordingTimer = setInterval(() => {
        recordingTime++;
        document.getElementById('recordingTime').textContent = formatTime(recordingTime);
    }, 1000);
    
} catch (error) {
    console.error('Error starting recording:', error);
    showNotification('Could not access microphone. Please check permissions.', 'error');
}
```

}

function stopRecording() {
if (mediaRecorder && isRecording) {
mediaRecorder.stop();
mediaRecorder.stream.getTracks().forEach(track => track.stop());
isRecording = false;

```
    // Update UI
    document.getElementById('recordButton').disabled = false;
    document.getElementById('stopButton').disabled = true;
    document.getElementById('recordingStatus').classList.add('hidden');
    
    // Stop recording timer
    clearInterval(recordingTimer);
    
    // Show analysis
    document.getElementById('responseAnalysis').classList.remove('hidden');
}
```

}

function analyzeResponse(responseText) {
// Simple AI analysis simulation
const currentQuestion = allQuestions[questionQueue[currentQuestionIndex]];
const keywords = [‘return’, ‘home’, ‘country’, ‘study’, ‘degree’, ‘education’];

```
let score = 0;
keywords.forEach(keyword => {
    if (responseText.toLowerCase().includes(keyword)) score++;
});

// Update analysis display
document.getElementById('contentScore').textContent = score > 2 ? 'Good' : 'Needs Improvement';
document.getElementById('intentScore').textContent = responseText.toLowerCase().includes('return') ? 'Clear' : 'Unclear';
document.getElementById('financialScore').textContent = 'Adequate'; // Placeholder
document.getElementById('academicScore').textContent = 'Well-defined'; // Placeholder
```

}

function approveResponse() {
sessionStats.approved++;
sessionStats.practiced++;

```
const currentQuestion = allQuestions[questionQueue[currentQuestionIndex]];
sessionStats.responses.push({
    question: currentQuestion.question,
    status: 'approved',
    timestamp: new Date()
});

updateSessionStats();
showNotification('Response approved! 🎉', 'success');

// Auto-advance to next question after short delay
setTimeout(() => {
    nextQuestion();
}, 1500);
```

}

function denyResponse() {
sessionStats.denied++;
sessionStats.practiced++;

```
const currentQuestion = allQuestions[questionQueue[currentQuestionIndex]];
sessionStats.responses.push({
    question: currentQuestion.question,
    status: 'denied',
    timestamp: new Date()
});

updateSessionStats();
showNotification('Keep practicing! Review the reference answer.', 'warning');

// Show reference answer automatically
document.getElementById('referenceContent').classList.remove('hidden');
document.getElementById('toggleText').textContent = 'Hide';
```

}

// Timer functions
function startResponseTimer() {
responseTime = 0;
responseTimer = setInterval(() => {
responseTime++;
document.getElementById(‘responseTimer’).textContent = formatTime(responseTime);
}, 1000);
}

function stopResponseTimer() {
clearInterval(responseTimer);
}

function formatTime(seconds) {
const mins = Math.floor(seconds / 60);
const secs = seconds % 60;
return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// UI functions
function toggleAnswer() {
const content = document.getElementById(‘referenceContent’);
const toggleText = document.getElementById(‘toggleText’);

```
if (content.classList.contains('hidden')) {
    content.classList.remove('hidden');
    toggleText.textContent = 'Hide';
} else {
    content.classList.add('hidden');
    toggleText.textContent = 'Show';
}
```

}

function updateProfileSummary() {
const container = document.getElementById(‘profileSummary’);

```
if (Object.keys(studentProfile).length === 0) {
    container.innerHTML = '<p>Complete your profile first</p>';
    return;
}

const deficit = (studentProfile.coa || 0) - (studentProfile.funding || 0);

container.innerHTML = `
    <p><strong>${studentProfile.name || 'Not set'}</strong></p>
    <p>${studentProfile.program} in ${studentProfile.course}</p>
    <p>${studentProfile.school}</p>
    <p>COA: $${(studentProfile.coa || 0).toLocaleString()}</p>
    <p>Deficit: $${deficit.toLocaleString()}</p>
    <p>Sponsor: ${studentProfile.sponsor}</p>
`;
```

}

function updateSessionStats() {
document.getElementById(‘practiceCount’).textContent = sessionStats.practiced;
document.getElementById(‘approvedCount’).textContent = sessionStats.approved;
document.getElementById(‘deniedCount’).textContent = sessionStats.denied;

```
const successRate = sessionStats.practiced > 0 ? 
    Math.round((sessionStats.approved / sessionStats.practiced) * 100) : 0;
document.getElementById('successRate').textContent = `${successRate}%`;
```

}

function updateResultsDisplay() {
document.getElementById(‘totalPracticed’).textContent = sessionStats.practiced;
document.getElementById(‘totalApproved’).textContent = sessionStats.approved;
document.getElementById(‘totalDenied’).textContent = sessionStats.denied;

```
const overallScore = sessionStats.practiced > 0 ? 
    Math.round((sessionStats.approved / sessionStats.practiced) * 100) : 0;
document.getElementById('overallScore').textContent = `${overallScore}%`;
document.getElementById('overallProgress').style.width = `${overallScore}%`;

// Display detailed results
const detailedContainer = document.getElementById('detailedResults');
if (sessionStats.responses.length === 0) {
    detailedContainer.innerHTML = '<p class="text-gray-500">No practice sessions completed yet.</p>';
    return;
}

detailedContainer.innerHTML = sessionStats.responses.map((response, index) => `
    <div class="border rounded-lg p-4 ${response.status === 'approved' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}">
        <div class="flex justify-between items-start">
            <div>
                <h4 class="font-medium ${response.status === 'approved' ? 'text-green-800' : 'text-red-800'}">
                    Question ${index + 1}
                </h4>
                <p class="text-gray-700 text-sm mt-1">${response.question}</p>
            </div>
            <span class="px-2 py-1 rounded text-xs font-medium ${
                response.status === 'approved' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
            }">
                ${response.status === 'approved' ? 'Approved' : 'Needs Work'}
            </span>
        </div>
    </div>
`).join('');
```

}

function viewResults() {
switchTab(‘results’);
}

function downloadResults() {
const results = {
profile: studentProfile,
stats: sessionStats,
timestamp: new Date()
};

```
const dataStr = JSON.stringify(results, null, 2);
const dataBlob = new Blob([dataStr], { type: 'application/json' });

const link = document.createElement('a');
link.href = URL.createObjectURL(dataBlob);
link.download = `visa-interview-results-${new Date().toISOString().split('T')[0]}.json`;
link.click();
```

}

function resetAll() {
if (confirm(‘Are you sure you want to reset all data? This cannot be undone.’)) {
// Clear all data
studentProfile = {};
customQuestions = [];
profileBasedQuestions = [];
allQuestions = [];
sessionStats = { practiced: 0, approved: 0, denied: 0, responses: [] };

```
    // Clear localStorage
    localStorage.removeItem('visaInterviewProfile');
    localStorage.removeItem('visaInterviewCustomQuestions');
    localStorage.removeItem('visaInterviewSessionStats');
    
    // Reset UI
    updateProfileSummary();
    updateSessionStats();
    displayCustomQuestions();
    
    // Reset form
    document.querySelectorAll('input, textarea, select').forEach(el => el.value = '');
    
    showNotification('All data has been reset.', 'success');
}
```

}

// Utility functions
function shuffleArray(array) {
const newArray = […array];
for (let i = newArray.length - 1; i > 0; i–) {
const j = Math.floor(Math.random() * (i + 1));
[newArray[i], newArray[j]] = [newArray[j], newArray[i]];
}
return newArray;
}

function showNotification(message, type = ‘info’) {
// Create notification element
const notification = document.createElement(‘div’);
notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${ type === 'success' ? 'bg-green-500 text-white' : type === 'error' ? 'bg-red-500 text-white' : type === 'warning' ? 'bg-yellow-500 text-white' : 'bg-blue-500 text-white' }`;
notification.textContent = message;

```
document.body.appendChild(notification);

// Remove after 3 seconds
setTimeout(() => {
    notification.remove();
}, 3000);
```

}

function simulateUserCount() {
// Simulate online users count
const count = Math.floor(Math.random() * 50) + 1;
document.getElementById(‘userCount’).textContent = count;

```
// Update every 30 seconds
setInterval(() => {
    const newCount = Math.floor(Math.random() * 50) + 1;
    document.getElementById('userCount').textContent = newCount;
}, 30000);
```

}

function loadStoredData() {
// Load profile
const storedProfile = localStorage.getItem(‘visaInterviewProfile’);
if (storedProfile) {
studentProfile = JSON.parse(storedProfile);
generateProfileQuestions();
}

```
// Load custom questions
const storedQuestions = localStorage.getItem('visaInterviewCustomQuestions');
if (storedQuestions) {
    customQuestions = JSON.parse(storedQuestions);
}

// Load session stats
const storedStats = localStorage.getItem('visaInterviewSessionStats');
if (storedStats) {
    sessionStats = JSON.parse(storedStats);
}

updateAllQuestions();
```

}

// Initialize app when DOM is loaded
document.addEventListener(‘DOMContentLoaded’, init);

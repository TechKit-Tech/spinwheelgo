import { db } from "./firebaseconfig.js";
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', () => {
    // --- Element Selectors ---
    const spinner = document.getElementById('spinner');
    const spinBtn = document.getElementById('spin-btn');
    const modal = document.getElementById('questionModal');
    const questionText = document.getElementById('questionText');
    const answerOptionsContainer = document.getElementById('answer-options');
    const feedbackText = document.getElementById('feedbackText');
    const closeBtn = document.querySelector('.close-button');
    const claimPrizeBtn = document.getElementById('claim-prize-btn');
    // New prize display elements
    const prizeDisplay = document.getElementById('prize-display');
    const prizeImage = document.getElementById('prizeImage');
    const prizeName = document.getElementById('prizeName');

    // --- Game State ---
    let questions = [];
    let prizes = [];
    let currentPrize = null; // To store the current prize object
    let currentRotation = 0;
    let isSpinning = false;

    // --- Data Loading ---
    const loadData = async () => {
        try {
            const [questionsRes, prizesRes] = await Promise.all([
                fetch('questionskh.json'),
                fetch('prizes.json')
            ]);
            questions = await questionsRes.json();
            prizes = await prizesRes.json();
            createWheel();
        } catch (error) {
            console.error('Error loading data:', error);
        }
    };

    // --- Wheel Creation ---
    const createWheel = () => {
        // (This function remains the same as before)
        const numSegments = questions.length;
        const segmentAngle = 360 / numSegments;
        const colors = ['#6A1B9A', '#303F9F', '#0277BD', '#00695C', '#558B2F', '#F9A825', '#EF6C00', '#D84315'];

        const gradientParts = questions.map((_, i) => {
            const color = colors[i % colors.length];
            return `${color} ${i * segmentAngle}deg ${(i + 1) * segmentAngle}deg`;
        });
        spinner.style.background = `conic-gradient(${gradientParts.join(', ')})`;

        questions.forEach((q, i) => {
            const textContainer = document.createElement('div');
            textContainer.className = 'wheel-segment';
            const textElement = document.createElement('div');
            textElement.className = 'segment-text';
            textElement.textContent = q.question;
            const textRotation = (i * segmentAngle) + (segmentAngle / 2);
            textContainer.style.transform = `rotate(${textRotation}deg)`;
            textElement.style.transform = `translateY(-50%) rotate(90deg)`;
            textContainer.appendChild(textElement);
            spinner.appendChild(textContainer);
        });
    };
    
    // --- Spin Logic ---
    const spinWheel = () => {
        if (isSpinning) return;
        isSpinning = true;
        spinBtn.disabled = true;

        const randomExtraRotation = Math.floor(Math.random() * 360);
        const totalRotation = currentRotation + (360 * 5) + randomExtraRotation;
        currentRotation = totalRotation;
        spinner.style.transform = `rotate(${totalRotation}deg)`;
    };

    spinner.addEventListener('transitionend', () => {
        isSpinning = false;
        const actualRotation = currentRotation % 360;
        const numSegments = questions.length;
        const segmentAngle = 360 / numSegments;
        // The pointer is at the top (0/360 degrees), so we adjust by 90 degrees from the left pointer
        const winningIndex = Math.floor((360 - actualRotation + 90) % 360 / segmentAngle);
        const selectedQuestion = questions[winningIndex];
        showModal(selectedQuestion);
    });

    // --- Modal and Answer Logic ---
    const showModal = (item) => {
        questionText.textContent = item.question;
        answerOptionsContainer.innerHTML = ''; // Clear previous answers
        feedbackText.textContent = '';
        
        // Reset view: show answers, hide prize
        answerOptionsContainer.classList.remove('hidden');
        prizeDisplay.classList.add('hidden');
        claimPrizeBtn.classList.add('hidden');

        item.answers.forEach(answer => {
            const button = document.createElement('button');
            button.className = 'answer-btn';
            button.textContent = answer.text;
            button.onclick = () => checkAnswer(answer);
            answerOptionsContainer.appendChild(button);
        });
        
        modal.style.display = 'flex';
    };

    const checkAnswer = (selectedAnswer) => {
        // Disable all answer buttons
        const buttons = answerOptionsContainer.querySelectorAll('.answer-btn');
        buttons.forEach(button => button.disabled = true);
        
        if (selectedAnswer.correct) {
            answerOptionsContainer.style.display = 'none';
            // feedbackText.textContent = 'Correct! 🎉';
            feedbackText.style.color = '#ffffff';
            
            // Hide answers and show a random prize
            setTimeout(() => {
                answerOptionsContainer.classList.add('hidden');
                
                // Pick and display a random prize
                const randomIndex = Math.floor(Math.random() * prizes.length);
                currentPrize = prizes[randomIndex];
                prizeImage.src = currentPrize.image;
                prizeName.textContent = currentPrize.name;
                
                // prizeDisplay.classList.remove('hidden');
                claimPrizeBtn.classList.remove('hidden');
            }, 1000); // Wait 1 second before showing the prize

        } else {
            feedbackText.textContent = 'Sorry, that was incorrect.';
            feedbackText.style.color = '#ffffff';
        }
    };

    // Add this event listener for the new button at the end of your file
    const claimPrizeFromFirebase = async () => {
        // Disable the button to prevent multiple clicks
        // claimPrizeBtn.disabled = true;
        // claimPrizeBtn.textContent = 'Claiming...';
        
        try {
            // 1. Find a prize that has not been claimed yet
            await addDoc(collection(db, "prize_claim"), {
                prize: currentPrize.name,
                is_claim: true,
                createdAt: new Date()
            });
        
            // 4. Congratulate the user!
            alert(`Congratulations! 🏆 You won a ${currentPrize.name}`);
            
            closeModal();
        
        } catch (error) {
            console.error("Error claiming prize: ", error);
            // alert('There was an error claiming your prize. Please try again.');
            // Re-enable the button if there was an error
            claimPrizeBtn.disabled = false;
            claimPrizeBtn.textContent = 'Claim Prize 🏆';
        }
    };

    claimPrizeBtn.addEventListener('click', claimPrizeFromFirebase);

    const closeModal = () => {
        modal.style.display = 'none';
        answerOptionsContainer.style.display = 'block';
        claimPrizeBtn.textContent = 'Claim Prize 🏆';
        claimPrizeBtn.disabled = false;
        spinBtn.disabled = false;
    };

    // --- Event Listeners ---
    spinBtn.addEventListener('click', spinWheel);
    // claimPrizeBtn.addEventListener('click', claimPrize);
    closeBtn.addEventListener('click', closeModal);
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeModal();
        }
    });

    // --- Initial Load ---
    loadData();
});
document.addEventListener('DOMContentLoaded', () => {
    const spinner = document.getElementById('spinner');
    const spinBtn = document.getElementById('spin-btn');
    const modal = document.getElementById('questionModal');
    const questionText = document.getElementById('questionText');
    const answerOptionsContainer = document.getElementById('answer-options');
    const feedbackText = document.getElementById('feedbackText');
    const closeBtn = document.querySelector('.close-button');
    const claimPrizeBtn = document.getElementById('claim-prize-btn');

    let questions = [];
    let currentRotation = 0;
    let isSpinning = false;

    // 1. Fetch questions from the JSON file
    fetch('questions.json')
        .then(response => response.json())
        .then(data => {
            questions = data;
            createWheel();
        })
        .catch(error => console.error('Error fetching questions:', error));

    // 2. Create the wheel segments dynamically
    const createWheel = () => {
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
            textElement.textContent = q.question; // Display simple text on wheel

            const textRotation = (i * segmentAngle) + (segmentAngle / 2);
            textContainer.style.transform = `rotate(${textRotation}deg)`;
            textElement.style.transform = `translateY(-50%) rotate(90deg)`;

            textContainer.appendChild(textElement);
            spinner.appendChild(textContainer);
        });
    };

    // 3. Spin the wheel on button click
    spinBtn.addEventListener('click', () => {
        if (isSpinning) return;
        isSpinning = true;
        spinBtn.disabled = true;

        const randomExtraRotation = Math.floor(Math.random() * 360);
        const totalRotation = currentRotation + (360 * 5) + randomExtraRotation;
        
        currentRotation = totalRotation;
        spinner.style.transform = `rotate(${totalRotation}deg)`;
    });

    // 4. Handle the end of the spin animation
    spinner.addEventListener('transitionend', () => {
        isSpinning = false;
        
        const actualRotation = currentRotation % 360;
        const numSegments = questions.length;
        const segmentAngle = 360 / numSegments;
        
        const winningIndex = Math.floor((360 - actualRotation + 270) % 360 / segmentAngle);
        const selectedQuestion = questions[winningIndex];

        showModal(selectedQuestion);
    });

    // 5. Show the modal and populate with question and answer choices
    const showModal = (item) => {
        questionText.textContent = item.question;
        answerOptionsContainer.innerHTML = ''; 
        feedbackText.textContent = '';
        
        // Make sure the claim button is hidden initially
        claimPrizeBtn.classList.add('hidden');
    
        item.answers.forEach(answer => {
            const button = document.createElement('button');
            button.className = 'answer-btn';
            button.textContent = answer.text;
            button.onclick = () => checkAnswer(answer, item.answers);
            answerOptionsContainer.appendChild(button);
        });
        
        modal.style.display = 'flex';
    };

    // 6. Check if the selected answer is correct
    const checkAnswer = (selectedAnswer, allAnswers) => {
        const buttons = answerOptionsContainer.querySelectorAll('.answer-btn');
        buttons.forEach(button => {
            button.disabled = true;
            
            const answerData = allAnswers.find(a => a.text === button.textContent);
            if (answerData.correct) {
                button.classList.add('correct');
            }
        });
        
        if (selectedAnswer.correct) {
            feedbackText.textContent = 'Correct! 🎉';
            feedbackText.style.color = '#155724';
            
            // Show the claim prize button!
            claimPrizeBtn.classList.remove('hidden');
    
        } else {
            feedbackText.textContent = 'Sorry, that was incorrect.';
            feedbackText.style.color = '#721c24';
            const clickedButton = Array.from(buttons).find(b => b.textContent === selectedAnswer.text);
            clickedButton.classList.add('wrong');
        }
    };

    // Add this event listener for the new button at the end of your file
    claimPrizeBtn.addEventListener('click', () => {
        alert('Congratulations! Your prize has been claimed!');
        // You could add more complex logic here, like showing another modal or redirecting the user.
        closeModal(); // Close the modal after claiming
    });

    // Event listeners for closing the modal
    const closeModal = () => {
        modal.style.display = 'none';
        spinBtn.disabled = false; // Re-enable the spin button
    };

    closeBtn.addEventListener('click', closeModal);
    window.addEventListener('click', (event) => {
        if (event.target == modal) {
            closeModal();
        }
    });
});
import { db } from "../firebaseconfig.js";
import { collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', () => {
    // --- Element Selectors ---
    const spinner = document.getElementById('spinner');
    const spinBtn = document.getElementById('spin-btn');
    const modal = document.getElementById('questionModal');
    const questionText = document.getElementById('questionText');
    const feedbackText = document.getElementById('feedbackText');
    const closeBtn = document.querySelector('.close-button');
    const claimPrizeBtn = document.getElementById('claim-prize-btn');
    // New prize display elements
    const prizeDisplay = document.getElementById('prize-display');
    const prizeImage = document.getElementById('prizeImage');
    const prizeName = document.getElementById('prizeName');
    const wheel = document.getElementById('wheel');

    // --- Game State ---
    let accnumbers = [];
    let prizes = [];
    let winner_number = [];
    let currentPrize = null; // To store the current prize object
    let currentRotation = 0;
    let isSpinning = false;
    // 1. Create a reference to the entire collection
    const collectionRef = collection(db, "lucky_draw_number");

    // --- Data Loading ---
    const loadData = async () => {
        try {
            let filenameDate = "";
            switch (new Date().toLocaleDateString()) {
                case '9/8/2025':
                    filenameDate = "accountnumber.json";
                    break;
                case '9/12/2025':
                    filenameDate = "accountnumber_day2.json";
                    break;
                case '9/13/2025':
                    filenameDate = "accountnumber_day3.json";
                    break;
            }


            const [questionsRes, prizesRes] = await Promise.all([
                fetch(filenameDate),
                fetch('prizes.json'), 
            ]);
            console.log(`filenameDate ${filenameDate}`)
            console.log(`check date ${new Date().toLocaleDateString()}`)
            

            accnumbers = await questionsRes.json();
            prizes = await prizesRes.json();
            // createWheel();
        } catch (error) {
            console.error('Error loading data:', error);
        }
    };

    const loadWinnerNumber = async () => {
        const querySnapshot = await getDocs(collectionRef);
        winner_number = [];
        querySnapshot.forEach((doc) => {
            winner_number.push(doc.data().winner_number);
        });
        const numbersToRemove = new Set(winner_number);
        // Step 2: Filter list1, keeping only users whose accountnumber is NOT in the Set.
        // const filteredList = accnumbers.filter(user => !numbersToRemove.has(user.accountnumber));
        accnumbers = accnumbers.filter(user => !numbersToRemove.has(user.accountnumber));
        createWheel();
    }

    function getRandomColor() {
       return '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
    }

    // --- Wheel Creation ---
    const createWheel = () => {
        // (This function remains the same as before)
        spinner.innerHTML = '';

        const numSegments = accnumbers.length;
        const segmentAngle = 360 / numSegments;
        const colors = ['#6A1B9A', '#303F9F', '#0277BD', '#00695C', '#558B2F', '#F9A825', '#EF6C00', '#D84315'];

        const gradientParts = accnumbers.map((_, i) => {
            const color = colors[i % colors.length];
            return `${color} ${i * segmentAngle}deg ${(i + 1) * segmentAngle}deg`;
        });
        spinner.style.background = `conic-gradient(${gradientParts.join(', ')})`;

        // accnumbers.forEach((q, i) => {
        //     const textContainer = document.createElement('div');
        //     textContainer.className = 'wheel-segment';
        //     const textElement = document.createElement('div');
        //     textElement.className = 'segment-text';
        //     textElement.textContent = q.accountnumber;
        //     const textRotation = (i * segmentAngle) + (segmentAngle / 2);
        //     textContainer.style.transform = `rotate(${textRotation}deg)`;
        //     textElement.style.transform = `translateY(-50%) rotate(90deg)`;
        //     textContainer.appendChild(textElement);
        //     spinner.appendChild(textContainer);
        // });

        accnumbers.forEach((q, i) => {
            const textContainer = document.createElement('div');
            textContainer.className = 'wheel-segment';

            const textElement = document.createElement('div');
            textElement.className = 'segment-text';
            textElement.textContent = q.accountnumber;

            // Calculate rotation to place text in the middle of the segment
            const textRotation = (i * segmentAngle) + (segmentAngle / 2);

            // Position text in the center, then rotate to stay upright
            textContainer.style.position = "absolute";
            textContainer.style.top = "50%";
            textContainer.style.left = "50%";
            textContainer.style.transform = `rotate(${textRotation}deg) translate(0, -40%)`; 
            textContainer.style.transformOrigin = "center center";

            textElement.style.transform = `rotate(-${textRotation}deg)`; 
            textElement.style.textAlign = "center";

            textContainer.appendChild(textElement);
            spinner.appendChild(textContainer);
        });
    };

    // const createWheel = () => {
    //     wheel.innerHTML = ''; // Clear previous content

    //     // --- Helper functions for SVG ---
    //     const getRandomColor = () => {
    //         const hue = Math.floor(Math.random() * 360);
    //         return `hsl(${hue}, 80%, 60%)`;
    //     };

    //     // This function does the math to calculate a pie slice shape
    //     const getPathForSlice = (size, startAngle, endAngle) => {
    //         const radius = size / 2;
    //         const x1 = radius + radius * Math.cos(Math.PI * startAngle / 180);
    //         const y1 = radius + radius * Math.sin(Math.PI * startAngle / 180);
    //         const x2 = radius + radius * Math.cos(Math.PI * endAngle / 180);
    //         const y2 = radius + radius * Math.sin(Math.PI * endAngle / 180);
    //         const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
            
    //         return `M${radius},${radius} L${x1},${y1} A${radius},${radius} 0 ${largeArcFlag} 1 ${x2},${y2} Z`;
    //     };

    //     // --- Main wheel creation logic ---
    //     const numSegments = accnumbers.length;
    //     const segmentAngle = 360 / numSegments;
    //     const svgSize = 500; // SVG coordinate system size

    //     // Create the SVG element
    //     const svgNS = "http://www.w3.org/2000/svg";
    //     const svg = document.createElementNS(svgNS, "svg");
    //     svg.setAttribute("viewBox", `0 0 ${svgSize} ${svgSize}`);

    //     console.log(`length account ${winner_number.length}`)
    //     console.log(`length ${accnumbers.length}`)

    //     accnumbers.forEach((q, i) => {
    //         const startAngle = i * segmentAngle;
    //         const endAngle = startAngle + segmentAngle;

    //         // --- 1. Draw the colored SVG slice ---
    //         const slice = document.createElementNS(svgNS, "path");
    //         slice.setAttribute("d", getPathForSlice(svgSize, startAngle, endAngle));
    //         slice.setAttribute("fill", getRandomColor());
    //         svg.appendChild(slice);

    //         // --- 2. Create and place the HTML text element on top ---
    //         const textContainer = document.createElement('div');
    //         textContainer.className = 'wheel-segment';
            
    //         const textElement = document.createElement('div');
    //         textElement.className = 'segment-text';
    //         textElement.textContent = `Question ${i + 1}`;
            
    //         const textRotation = startAngle + (segmentAngle / 2);
    //         textContainer.style.transform = `rotate(${textRotation}deg)`;
            
    //         textContainer.appendChild(textElement);
    //         // Append text to the main wheel container, not the SVG
    //         wheel.appendChild(textContainer);
    //     });

    //     // Add the finished SVG to the wheel container
    //     wheel.prepend(svg);
    // };


    // ALSO, update the spin logic to rotate the new 'wheel' element
   
    const spinWheel = () => {
        // if (isSpinning) return;
        
        // isSpinning = true;
        // spinBtn.disabled = true;

        // const randomExtraRotation = Math.floor(Math.random() * 360);
        // const totalRotation = currentRotation + (360 * 5) + randomExtraRotation;
        // currentRotation = totalRotation;
        // // UPDATE this line to use 'wheel'
        // // wheel.style.transform = `rotate(${totalRotation}deg)`;
        if (isSpinning) return;
        isSpinning = true;
        spinBtn.disabled = true;

        const randomExtraRotation = Math.floor(Math.random() * 360);
        const totalRotation = currentRotation + (360 * 5) + randomExtraRotation;
        currentRotation = totalRotation;
        spinner.style.transform = `rotate(${totalRotation}deg)`;
    };

    spinner.addEventListener('transitionend', async () => {
    // wheel.addEventListener('transitionend', async () => {
        console.log('trigger')
        isSpinning = false;
        const actualRotation = currentRotation % 360;
        const numSegments = accnumbers.length;
        const segmentAngle = 360 / numSegments;
        // The pointer is at the top (0/360 degrees), so we adjust by 90 degrees from the left pointer
        const winningIndex = Math.floor((360 - actualRotation + 90) % 360 / segmentAngle);

        const selectedQuestion = accnumbers[winningIndex];
        await addDoc(collection(db, "lucky_draw_number"), {
                winner_number: selectedQuestion.accountnumber,
                createdAt: new Date()
            });

        showModal(selectedQuestion);
    });

    // --- Modal and Answer Logic ---
    const showModal = (item) => {
        questionText.textContent = item.accountnumber;
        feedbackText.textContent = '';
        
        // Reset view: show answers, hide prize
        prizeDisplay.classList.add('hidden');
        claimPrizeBtn.classList.add('hidden');        
        modal.style.display = 'flex';
    };

    // const checkAnswer = (selectedAnswer) => {
    //     // Disable all answer buttons
    //     const buttons = answerOptionsContainer.querySelectorAll('.answer-btn');
    //     buttons.forEach(button => button.disabled = true);
        
    //     if (selectedAnswer.correct) {
    //         answerOptionsContainer.style.display = 'none';
    //         feedbackText.textContent = 'Correct! 🎉';
    //         feedbackText.style.color = '#155724';
            
    //         // Hide answers and show a random prize
    //         setTimeout(() => {
    //             answerOptionsContainer.classList.add('hidden');
                
    //             // Pick and display a random prize
    //             const randomIndex = Math.floor(Math.random() * prizes.length);
    //             currentPrize = prizes[randomIndex];
    //             prizeImage.src = currentPrize.image;
    //             prizeName.textContent = currentPrize.name;
                
    //             prizeDisplay.classList.remove('hidden');
    //             claimPrizeBtn.classList.remove('hidden');
    //         }, 1000); // Wait 1 second before showing the prize

    //     } else {
    //         feedbackText.textContent = 'Sorry, that was incorrect.';
    //         feedbackText.style.color = '#721c24';
    //     }
    // };

    // Add this event listener for the new button at the end of your file
    const claimPrizeFromFirebase = async () => {
        // Disable the button to prevent multiple clicks
        claimPrizeBtn.disabled = true;
        claimPrizeBtn.textContent = 'Claiming...';
        
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
            alert('There was an error claiming your prize. Please try again.');
            // Re-enable the button if there was an error
            claimPrizeBtn.disabled = false;
            claimPrizeBtn.textContent = 'Claim Prize 🏆';
        }
    };

    claimPrizeBtn.addEventListener('click', claimPrizeFromFirebase);

    const closeModal = () => {
        modal.style.display = 'none';
        loadData();
        loadWinnerNumber();
        // answerOptionsContainer.style.display = 'block';
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
    loadWinnerNumber();
});
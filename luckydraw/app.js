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
    let wheelPower = 0;
    let wheelSpinning = false;

    // --- Data Loading ---
    const loadData = async () => {
        try {
            let filenameDate = "";
            switch (new Date().toLocaleDateString()) {
                case '9/8/2025':
                    filenameDate = "../luckydraw/accountnumber.json";
                    break;
                case '9/12/2025':
                    filenameDate = "../luckydraw/accountnumber_day2.json";
                    break;
                case '9/13/2025':
                    filenameDate = "../luckydraw/accountnumber_day3.json";
                    break;
            }


            const [questionsRes, prizesRes] = await Promise.all([
                fetch(filenameDate),
                fetch('prizes.json'), 
            ]);
            accnumbers = await questionsRes.json();
            prizes = await prizesRes.json();
            loadWinnerNumber();
            createWheel();
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
    
    let theWheel;
    
    function createWheel(){
        theWheel = new Winwheel({
            'strokeStyle': null,
            'outerRadius': 250,        // Set outer radius so wheel fits inside the background.
            'innerRadius': 25,         // Make wheel hollow so segments dont go all way to center.
            'textFontSize': 15,         // Set default font size for the segments.
            'textOrientation': 'horizontal', // Make text vertial so goes down from the outside of wheel.
            'textAlignment': 'outer',    // Align text to outside of wheel.
            'numSegments': 0,         // Specify number of segments.
            'textFontFamily': 'ang',
            'fillStyle'   : '#7de6ef',
            // 'segments':             // Define segments including colour and text.
            //     [                               // font size and text colour overridden on backrupt segments.
            //         { 'fillStyle': '#ee1c24', 'text': '300' },
            //         { 'fillStyle': '#3cb878', 'text': '450' },
            //         { 'fillStyle': '#f6989d', 'text': '600' },
            //         { 'fillStyle': '#00aef0', 'text': '750' },
            //         { 'fillStyle': '#f26522', 'text': '500' },
            //         { 'fillStyle': '#000000', 'text': 'BANKRUPT', 'textFontSize': 16, 'textFillStyle': '#ffffff' },
            //         { 'fillStyle': '#e70697', 'text': '3000' },
            //         { 'fillStyle': '#fff200', 'text': '600' },
            //         { 'fillStyle': '#f6989d', 'text': '700' },
            //         { 'fillStyle': '#ee1c24', 'text': '350' },
            //         { 'fillStyle': '#3cb878', 'text': '500' },
            //         { 'fillStyle': '#f26522', 'text': '800' },
            //         { 'fillStyle': '#a186be', 'text': '300' },
            //         { 'fillStyle': '#fff200', 'text': '400' },
            //         { 'fillStyle': '#00aef0', 'text': '650' },
            //         { 'fillStyle': '#ee1c24', 'text': '1000' },
            //         { 'fillStyle': '#f6989d', 'text': '500' },
            //         { 'fillStyle': '#f26522', 'text': '400' },
            //         { 'fillStyle': '#3cb878', 'text': '900' },
            //         { 'fillStyle': '#000000', 'text': 'BANKRUPT', 'textFontSize': 16, 'textFillStyle': '#ffffff' },
            //         { 'fillStyle': '#a186be', 'text': '600' },
            //         { 'fillStyle': '#fff200', 'text': '700' },
            //         { 'fillStyle': '#00aef0', 'text': '800' },
            //         { 'fillStyle': '#ffffff', 'text': 'LOOSE TURN', 'textFontSize': 12 }
            //     ],
            'animation':           // Specify the animation to use.
            {
                'type': 'spinToStop',
                'duration': 10,
                'spins': 3,
                'callbackFinished': showModal,
                'soundTrigger': 'pin'        // Specify pins are to trigger the sound.
            },
        });

        // let i = 0;

        theWheel.deleteSegment();
        const colors = ['#6A1B9A', '#303F9F', '#0277BD', '#00695C', '#558B2F', '#F9A825', '#EF6C00', '#D84315','#00695C', '#F9A825'];

        for (let i = 0; i < accnumbers.length; i++){
            theWheel.addSegment({
                'text' : accnumbers[i].accountnumber,
                'fillStyle' : colors[i],
                'textFillStyle' : "#ffffff"
            }, 1);
            theWheel.addSegment({
                'text' : 'Thank you',
                'fillStyle' : getRandomColor(),
                'textFillStyle' : "#ffffff"
            }, 2);
        }
        
        // console.log(`checking array ${i}`)
        theWheel.draw();
    }

    function getRandomColor() {
       return '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
    }

    function alertPrize(indicatedSegment) {
        // Do basic alert of the segment text. You would probably want to do something more interesting with this information.
        alert("You have won " + indicatedSegment.text);
    }

    const showModal = async (item) => {
        questionText.textContent = item.text;
        feedbackText.textContent = '';

        if (item.text != 'Thank you') {
            await addDoc(collection(db, "lucky_draw_number"), {
                winner_number: item.text,
                createdAt: new Date()
            });
        }

        
        // Reset view: show answers, hide prize
        prizeDisplay.classList.add('hidden');
        claimPrizeBtn.classList.add('hidden');        
        modal.style.display = 'flex';
    };

    const closeModal = () => {
        modal.style.display = 'none';
        
        loadData();
        // answerOptionsContainer.style.display = 'block';
        // claimPrizeBtn.textContent = 'Claim Prize 🏆';
        // claimPrizeBtn.disabled = false;
        // spinBtn.disabled = false;
        wheelSpinning = false;
    };

    closeBtn.addEventListener('click', closeModal);

    spinBtn.addEventListener('click', () => {
        // Ensure that spinning can't be clicked again while already running.
        if (wheelSpinning == false) {
            // Based on the power level selected adjust the number of spins for the wheel, the more times is has
            // to rotate with the duration of the animation the quicker the wheel spins.
            if (wheelPower == 1) {
                theWheel.animation.spins = 3;
            } else if (wheelPower == 2) {
                theWheel.animation.spins = 8;
            } else if (wheelPower == 3) {
                theWheel.animation.spins = 15;
            }

            theWheel.startAnimation();

            wheelSpinning = true;
        }
    })

    loadData();
});
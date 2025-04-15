const buttonmenu = document.querySelector('.droplink');
const menu = document.querySelector('.dropdowncontent');
buttonmenu.addEventListener('click', () => {
    if (menu.classList.contains('none')){
        // menu.style.display = 'block';
        menu.classList.remove('none');
    } else{
        // menu.style.display = 'none';
        menu.classList.add('none');
    }
})

let arttext = document.getElementById('arttext');
arttext.textContent = `There were about twenty people on the dam. Most of them were simply walking and getting exercise. 
There were a few who were fishing. There was a family who had laid down a blanket and they were having a picnic. 
It was like this most days and nothing seemed out of the ordinary. The problem was that nobody noticed the water leaking through the dam wall.
The house was located at the top of the hill at the end of a winding road. 
It wasn't obvious that the house was there, but everyone in town knew that it existed. 
They were just all too afraid to ever go and see it in person.
Then came the night of the first falling star. 
It was seen early in the morning, rushing over Winchester eastward, a line of flame high in the atmosphere. 
Hundreds must have seen it and taken it for an ordinary falling star. It seemed that it fell to earth about one hundred miles east of him.
At that moment he had a thought that he'd never imagine he'd consider. 'I could just cheat,' he thought, 'and that would solve the problem.' 
He tried to move on from the thought but it was persistent. It didn't want to go away and, if he was honest with himself, he didn't want it to.
Why do Americans have so many different types of towels? 
We have beach towels, hand towels, bath towels, dish towels, camping towels, quick-dry towels, and let’s not forget paper towels. 
Would 1 type of towel work for each of these things? Let’s take a beach towel. It can be used to dry your hands and body with no difficulty. 
A beach towel could be used to dry dishes. Just think how many dishes you could dry with one beach towel. 
I’ve used a beach towel with no adverse effects while camping. If you buy a thin beach towel it can dry quickly too. 
I’d probably cut up a beach towel to wipe down counters or for cleaning other items, but a full beach towel could be used too. 
Is having so many types of towels an extravagant luxury that Americans enjoy or is it necessary? 
I’d say it's overkill and we could cut down on the many types of towels that manufacturers deem necessary.`

// пазл емае

const sections = document.querySelectorAll('.section');
const puzzles = document.querySelectorAll('.puzzlecont');
const nextbtn = document.querySelector('.next');
const text = document.querySelector('.history');
const textVar = ['После года разлуки Алекс вернулся в родной город, ждала его любимая Лена. Он подошел к их любимому дереву с букетом белых, красных роз, сердце колотилось от волнения. Когда она увидела его, радость и слезы счастья наполнили её глаза, и они крепко обнялись, забыв о времени и расстоянии. Алекс пообещал, что больше никогдане расстанется с ней, они вместе начали мечтать о будущем, осознавая, что их любовь всегда будет сильнее любых преград.',
    'В маленьком городке жила бабушка Надя, которая всегда встречала свою внучку Лизу с тёплыми объятиями и ароматом выпечки. Они вместе гуляли по саду, где бабушка делилась историями о цветах и о своих мечтах стать художницей. После её ухода Лиза сохранила каждое мгновение в сердце. Вдохновлённая воспоминаниями, она нарисовала сад с бабушкой, улыбающейся на картине, и повесила её на стену, чтобы помнить о любви, которая никогда не угаснет.',
    'Старый дуб в парке был свидетелем многих радостей Алекса, который часто приходил на качели, чтобы вспомнить беззаботные дни своего детства. Каждый раз, качаясь, он возвращался в те времена, когда смех друзей и теплые вечера с сестрой наполняли его сердце счастьем. Дуб, словно верный друг, выслушивал его мечты и радости, и, несмотря на сложности взрослой жизни, воспоминания о детстве всегда оставались с ним, как крепкие корни дерева, которые продолжали расти с каждым годом.'
];
let currentIndex = 0;

// переключалка пазлов
function updateSections (){
    sections.forEach ((section, index) =>{
        if (index==currentIndex){
            section.classList.add ('active');
        } else {
            section.classList.remove ('active');
        }
    });

    if (puzzles[currentIndex].dataset.solved==='false'){
        nextbtn.classList.add ('hidden');
        text.classList.add ('hidden');
    } else {
        nextbtn.classList.remove ('hidden');
        text.textContent = textVar[currentIndex];
        text.classList.remove ('hidden');
        console.log(',e,e,e,e')
    }
}

function goToNextSection (){
    if (currentIndex<sections.length-1) currentIndex+=1;
    else currentIndex=0;
    updateSections();
}

nextbtn.addEventListener('click', goToNextSection);

// const puzzlecont = document.querySelector('.puzzlecont');

const gridSize = 2;

function loadImage (container){
    const img = new Image();
    img.src = container.dataset.image;
    img.onload = function () {
        createPuzzle(img, container);
    };
}

function createPuzzle(img, puzzlecont) {
    puzzlecont.innerHTML = '';
    const puzzleHeight = window.innerHeight*0.5;
    const scale = puzzleHeight/img.height;
    const puzzleWidth = img.width*scale;

    const pieceWidth = puzzleWidth/gridSize;
    const pieceHeight = puzzleHeight/gridSize;

    puzzlecont.style.scale = `${puzzleWidth}px`;
    puzzlecont.style.scale = `${puzzleHeight}px`;

    puzzlecont.style.display = "grid";
    puzzlecont.style.gridTemplateColumns = `repeat(${gridSize}, ${pieceWidth}px)`;
    puzzlecont.style.gridTemplateRows = `repeat(${gridSize}, ${pieceHeight}px)`;

    let pieces = [];
    let cells = [];

    for (let y = 0; y < gridSize; y++){
        for (let x = 0; x < gridSize; x++){
            const cell = document.createElement ("div");
            cell.classList.add ("puzzlecell");
            cell.dataset.correctX = x;
            cell.dataset.correctY = y;

            puzzlecont.appendChild(cell);
            cells.push(cell);

            const piece = document.createElement ("div");
            piece.classList.add ("piece");
            piece.style.width = `${pieceWidth}px`;
            piece.style.height = `${pieceHeight}px`;
            piece.style.backgroundImage = `url(${img.src})`;
            piece.style.backgroundSize = `${puzzleWidth}px ${puzzleHeight}px`;
            piece.style.backgroundPosition = `-${x*pieceWidth}px -${y*pieceHeight}px`;
            piece.dataset.correctX = x;
            piece.dataset.correctY = y;

            pieces.push(piece);
        }
    }

    pieces.sort(() => Math.random()-0.5);
    pieces.forEach((piece) => {
        const randomX = Math.random()*(window.innerWidth/1.5);
        const randomY = Math.random()*(window.innerHeight/1.5);
        piece.style.position = "absolute";
        piece.style.left = `${randomX}px`;
        piece.style.top = `${randomY}px`;
        puzzlecont.parentElement.appendChild (piece);
        move(piece, pieces, cells, puzzlecont);
    })
}


function move (piece, pieces, cells, container){
    let isdrag = false;
    let diffX, diffY;

    piece.addEventListener('mousedown', (event) =>{
        if (piece.classList.contains ('correct')) return;

        isdrag = true;

        diffX = event.clientX-piece.getBoundingClientRect().left;
        diffY = event.clientY-piece.getBoundingClientRect().top;

        piece.style.cursor = "grabbing";
        piece.style.zIndex = 6;
    })

    document.addEventListener('mousemove', (event) =>{
        if (!isdrag) return;

        piece.style.left = `${event.clientX-diffX}px`;
        piece.style.top = `${event.clientY-diffY}px`;
    })

    document.addEventListener('mouseup', (event) =>{
        if (!isdrag) return;

        isdrag = false;

        piece.style.cursor = "grab";
        piece.style.zIndex = 5;

        cells.forEach(cell => {
            const cellrect = cell.getBoundingClientRect();
            if (event.clientX<cellrect.right && event.clientX>cellrect.left && event.clientY<cellrect.bottom && event.clientY>cellrect.top){
                if (piece.dataset.correctX == cell.dataset.correctX && piece.dataset.correctY == cell.dataset.correctY){
                    piece.style.transition = "all 0.5s ease";
                    piece.style.left = `${cellrect.left}px`;
                    piece.style.top = `${cellrect.top}px`;
                    
                    piece.addEventListener('transitionend', () =>{
                        piece.style.transition = '';
                        piece.classList.add  ('correct');
                        piece.style.cursor = 'default';

                        let allcorrect = pieces.every(piece => piece.classList.contains('correct'));
                        if (allcorrect==true && pieces.length!=0){
                            if (container.dataset.solved=="false"){
                                container.dataset.solved = "true";
                                // стили собранного пазла
                                nextbtn.classList.remove('hidden');
                                text.textContent = textVar[currentIndex];
                                text.classList.remove('hidden');
                            }
                        }
                        
                    })
                }
            }
        })
    })
}


// переключалка
const button0 = document.querySelector('.button0');
const button1 = document.querySelector('.button1');
const button2 = document.querySelector('.button2');
const button3 = document.querySelector('.button3');
const screens = document.querySelectorAll('.screen');
const screen0 = document.querySelector('.screen0');
const screen1 = document.querySelector('.screen1');
const screen2 = document.querySelector('.screen2');
const screen3 = document.querySelector('.screen3');

button0.addEventListener('click', () =>{
    screens.forEach((screen) =>{
        if (screen.classList.contains('active')) screen.classList.remove('active');
    })
    screen0.classList.add('active');
});

button1.addEventListener('click', () =>{
    screens.forEach((screen) =>{
        if (screen.classList.contains('active')) screen.classList.remove('active');
    })
    screen1.classList.add('active');
    menu.classList.add('none');
    // включалка пазла
    puzzles.forEach(loadImage);
    updateSections();
});

button2.addEventListener('click', () =>{
    screens.forEach((screen) =>{
        if (screen.classList.contains('active')) screen.classList.remove('active');
    })
    screen2.classList.add('active');
    menu.classList.add('none');
});

button3.addEventListener('click', () =>{
    screens.forEach((screen) =>{
        if (screen.classList.contains('active')) screen.classList.remove('active');
    })
    screen3.classList.add('active');
    menu.classList.add('none');
});

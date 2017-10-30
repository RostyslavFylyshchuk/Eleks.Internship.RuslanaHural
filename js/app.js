(function(){

    // consts 
    const gameBlock = document.getElementById('block-game');
    const timerElemet = document.getElementById('timer');
    const startTime = '00:00:00';

    // vars
    let isActive = false;
    let time;
    let gameStatus = true;
    let levelSize = 2;
    let itemSize = getItemSize();
    let standardValues = createStandardValues();
    let values = getValues()
    let emptyItem, modalWindow, timerId;
    //let values = changeSolution();

    function getItemSize(){
        let gameBlockWidth = gameBlock.clientWidth;

        return gameBlockWidth/levelSize - 2;
    }

    function creatItemContent(value){
        let childBlock = document.createElement('div');
        let content = document.createTextNode(value);
        childBlock.className = "item-content"; // todo: can be deleted
        childBlock.appendChild(content);
        
        return childBlock;
    }

    function creatItemWrapper(){
        let itemWrapper = document.createElement('div');
        itemWrapper.className = "butt"; // todo: change class name
        itemWrapper.style.width = itemSize+'px';
        itemWrapper.style.height = itemSize+'px';

        return itemWrapper;
    }

    function createStandardValues() {
        let values = [];
        for (let i = 0; i < levelSize * levelSize; i++) values[i] = i;
        values.shift();
        values.push(0);
        return values;
    }

    function getValues() {
        let values = [...standardValues];
        if (!isActive) return values;
        values.sort(sortRandom);
        
        while(!existSolution(values) || isValuesSorted(values)){
            console.log(13, '--resort'); // todo: delete
            values.sort(sortRandom);
        }

        return values;
    }

    function sortRandom() {
        return Math.random() - 0.5;
    }

    function checkClick(row, col) {
        return (emptyItem.row === row && Math.abs(emptyItem.col - col) === 1) ||
            (emptyItem.col === col && Math.abs(emptyItem.row - row) === 1)
    }

    function changeValues(row, col) {
        const clickedIndex = row * levelSize + col;
        const emptyIndex = emptyItem.row * levelSize + emptyItem.col;
        const clickedValue = values[clickedIndex];

        values[emptyIndex] = clickedValue;
        values[clickedIndex] = 0;
    }

    function handleItemClick(event) {
        if (!isActive) return;
        
        const itemWrapper = this;

        const row = + itemWrapper.getAttribute('data-row');
        const col = + itemWrapper.getAttribute('data-col');

        if (checkClick(row, col)) {
            // substitution
            substitution(itemWrapper)

            // change values array
            changeValues(row, col)

            // update game satus
            updateGameSatus()

            if (gameStatus) {
                clearTimer();
                showModal();
                closeModal();

                isActive = false;
                gameBlock.className = 'no-active';

            }
            // check game status
            console.log(gameStatus);

            // change empty item
            emptyItem = {row, col};
        }
        
        return;
    }

    function substitution(itemWrapper) {
        // get clicked content
        const itemContent = itemWrapper.firstElementChild;
        // get empty element
        let emptyElement = document.getElementById('zero');
        // change clicked element
        itemWrapper.removeChild(itemContent);
        itemWrapper.className = '';
        itemWrapper.id = 'zero';
        // change empty element
        emptyElement.id = '';
        emptyElement.className = 'butt';
        emptyElement.appendChild(itemContent);
    }

    function init() {
        // fill game block in
        for (let i = 0; i < levelSize; i++) {
            for (let j = 0; j < levelSize; j++) {
                let itemWrapper = creatItemWrapper();
                itemWrapper.setAttribute('data-row', i);
                itemWrapper.setAttribute('data-col', j);

                const index = i * levelSize + j;
                const value = values[index]; 

                if (value === 0) {
                    itemWrapper.id = 'zero'
                    emptyItem = {
                        row: i,
                        col: j
                    };
                    // console.log(emptyItem);
                } else {
                    itemWrapper.appendChild(creatItemContent(value));
                }
                // add even listener on click
                itemWrapper.addEventListener('click', handleItemClick);

                document.addEventListener('keydown', hendleItemKey);

                gameBlock.appendChild(itemWrapper);
            }
        }
    }

    function updateGameSatus() {
        gameStatus = isValuesSorted(values);
    }

    function isValuesSorted(values) {

        let isSorted = true;
        values.forEach((value, index) => {
            if(value !== index + 1 && value !== 0) {
                isSorted = false;
            }
        });

        return isSorted;
    }

    function getEmptyRow(values){
        let emptyNumber;
        values.forEach((value, index) => {
             if( value === 0) {emptyNumber = parseInt(index / levelSize) + 1;} 
        });
        return emptyNumber;
    }

    function getInversion(values){
        let inversion = 0;
        for(let i = 0; i < levelSize*levelSize; i++){
            if (values[i] !== 0){
                for(let j = 0; j < i; j++){
                    if(values[j] > values[i]){ inversion++;}
                }
            }
        }
        return inversion;
    }

    function existSolution(values){
        let inversion, result, numberRow;
        
        inversion = getInversion(values);
        numberRow =  getEmptyRow(values);
        result = inversion + numberRow;

        return result % 2 === 0;
    }

    function refreshValues() {
        values = getValues();
    }
      
    function startGame(e){
        e.preventDefault();
        clearTimer();

        isActive = true;
        gameStatus = false;

        refreshValues();

        gameBlock.className = '';
        gameBlock.innerHTML = '';

        init();
        timerId = timer();
    }

    function changeLevel(e) {
        e.preventDefault();
        clearTimer();

        let level = parseInt(this.getAttribute('data-level'));
        if (level !== levelSize) {
            console.log('Level changing to ', level, ' from ', levelSize, gameStatus);
            levelSize = level || levelSize;
            isActive = false;
            gameStatus = true;

            itemSize = getItemSize();
            standardValues = createStandardValues();
            values = getValues()

            gameBlock.innerHTML = '';
            gameBlock.className = 'no-active';

            activeButton(levelSize);
            init();
        }
    }

    function timer() {
        time = 0;
        return timerIntervel = setInterval(() => {
            time++;
            timerElemet.innerHTML = intToTimeString(time);
        }, 1000);
    }

    function clearTimer() {
        if (timerId) {
            clearInterval(timerId);
        }
        timerElemet.innerHTML = intToTimeString(startTime);
    }

    function intToTimeString(n) {
        let timeStr = '';
        let hours, mins, secs;

        function timeItemToString(timeItem) {
            let timeItemStr = '00';
            timeItem = parseInt(timeItem);
            if (timeItem  < 1) {
                timeItemStr = '00';
            } else if (timeItem < 10) {
                timeItemStr = '0' + timeItem;
            } else if (timeItem < 60) {
                timeItemStr = '' + timeItem;
            }
            return timeItemStr
        }

        if (n < 1) {
            timeStr = '00:00:00';
        } else if (n < 60) {
            timeStr = '00:00:' + timeItemToString(n);
        } else if (n < 3600) {
            mins = parseInt(n / 60);
            secs = n % 60;
            timeStr = '00:' + timeItemToString(mins) + ':' + timeItemToString(secs);
        } else {
            hours = parseInt(n / 3600);
            mins = parseInt((n % 3600) / 60);
            secs = (n % 3600) % 60;
            timeStr = '' + timeItemToString(hours) + ':' + timeItemToString(mins) + ':' + timeItemToString(secs);
        }
        return timeStr;
    }

    function activeButton(size){
        let level = document.getElementsByClassName('level');

        for (let i = 0; i < level.length; i++){
            if(i === size-3){
                level[i].disabled = true;
                level[i].id = 'active-button';
            } else{
                level[i].disabled = false;
                level[i].removeAttribute('id');
            }
        };
    }

    /*create modal window*/

    function showModal(){
        let modal = document.getElementById('my-modal');
        
        let showResultTimeBlock = document.getElementById('showResultTime');
        showResultTimeBlock.innerHTML = `${intToTimeString(time)}`;

        let canv = document.getElementById('canv');
        
        canv.style.display = 'inline';
        draw();
        modal.style.display = 'block';
    }

    function closeModal(){
        let modal = document.getElementById('my-modal');
         let canv = document.getElementById('canv');

        window.addEventListener("click", function(){
             if (event.target == modal || event.target == canv) {
                modal.style.display = "none";
                canv.style.display = "none";
            }
        });
    }

    function draw(){
        let canvas = document.getElementById('canv');
        let context = canvas.getContext('2d');
        let circleArray = [];
        let ballColorSelections = ['#a7dbd8', '#efefef', '#adf7d3', '#88f7d2'];

        let settings = {
            maxCount: 400,
            bounce: -0.05,
            force: -1.25,
            gravity: -0.01
        }

        canvas.height = window.innerHeight;
        canvas.width = window.innerWidth;

        createCircle(settings.maxCount);

        window.addEventListener('resize', function() {
            canvas.height = window.innerHeight;
            canvas.width = window.innerWidth;
        });

        function Circle() {
            this.positionX = (Math.random() * window.innerWidth/2) + window.innerWidth/4;
            this.positionY = window.innerHeight;
            this.radius = Math.floor((Math.random() * window.innerWidth * 0.005) + 1);
            this.velocityY = (Math.random() * 100) / 100 * -1;
            this.velocityX = (Math.random() * 100) / 100 * -1;
            this.color = ballColorSelections[Math.floor(Math.random() * 5)];
        }

        function createCircle(max) {
            for (let i = 0; i < max; i++) {
                let circleObject = new Circle;
                circleObject.id = i;
                circleArray.push(circleObject);
            }
            moveCircle();
        }

        function drawCircle(object) {

            for (let i = 0; i < object.length; i++) {
                context.beginPath();
                context.arc(object[i].positionX, object[i].positionY, object[i].radius, 0, 2 * Math.PI);
                context.fillStyle = object[i].color;
                context.fill();
                context.closePath();
            }

        }

        function moveCircle() {
            
            context.fillStyle = "#69D2E7"; 
            context.clearRect(0,0,canvas.width,canvas.height);

            for (let i = 0; i < circleArray.length; i++) {

                collideCircle(circleArray, circleArray[i]);
                circleArray[i].velocityY += settings.gravity;
                circleArray[i].positionY += circleArray[i].velocityY;
                circleArray[i].positionX += circleArray[i].velocityX;

                if(circleArray[i].positionY > 0 - circleArray[i].radius) {
                    circleArray[i].positionY += circleArray[i].velocityY;
                } else {
                    circleArray[i].velocityY = (Math.random() * 100) / 100 * -1;
                    circleArray[i].positionX = (Math.random() * window.innerWidth);
                    circleArray[i].positionY = window.innerHeight;
                }

                if(circleArray[i].positionX > canvas.width + circleArray[i].radius || circleArray[i].positionX < 0 - circleArray[i].radius) {
            circleArray[i].positionX = (Math.random() * window.innerWidth);
            circleArray[i].positionY = window.innerHeight;
                }

            }

            function collideCircle(collideObject, circleObject) {
                for (let j = circleObject.id + 1; j < collideObject.length; j++) {
                    let distanceX = collideObject[j].positionX - circleObject.positionX;
                    let distanceY = collideObject[j].positionY - circleObject.positionY;
                    let distance = Math.floor(Math.sqrt((distanceX * distanceX) + (distanceY * distanceY)));
                    let minimumDistance = collideObject[j].radius + circleObject.radius * 10;
                    if (distance <= minimumDistance) {
                        let angle = Math.atan2(distanceY, distanceX);
                        let targetX = circleObject.positionX + Math.cos(angle) * minimumDistance;
                        let targetY = circleObject.positionY + Math.sin(angle) * minimumDistance;
                        let angleX = parseInt((targetX - collideObject[j].positionX) * settings.bounce) / 50;
                        let angleY = parseInt((targetY - collideObject[j].positionY) * settings.bounce) / 50;
                        circleObject.velocityX -= angleX;
                        circleObject.velocityY -= angleY;
                        collideObject[j].velocityX += angleX;
                        collideObject[j].velocityY += angleY;
                    }

                }
            }

            drawCircle(circleArray);
            requestAnimationFrame(moveCircle);
        }
    }

    function hendleItemKey(event){
        if (!isActive) return;

        event = event || window.event;

        let keyCode = event.keyCode;
        let empty = document.getElementById('zero');
        let row = + empty.getAttribute('data-row');
        let col = + empty.getAttribute('data-col');

        const items = document.querySelectorAll('#block-game .butt');

        switch(event.keyCode) {
            case 37:
                for (let i=0; i < items.length; i++) {
                    const item = items[i];
                    if (parseInt(item.getAttribute('data-row')) === row &&
                        parseInt(item.getAttribute('data-col')) === col + 1) {
                        item.click();
                        break;
                    }
                }
                break;
            case 38:
                for (let i=0; i < items.length; i++) {
                    const item = items[i];
                    if (parseInt(item.getAttribute('data-row')) === row + 1 &&
                        parseInt(item.getAttribute('data-col')) === col) {
                        item.click();
                        break;
                    }
                }
                break;
             case 39:
                for (let i=0; i < items.length; i++) {
                    const item = items[i];
                    if (parseInt(item.getAttribute('data-row')) === row &&
                        parseInt(item.getAttribute('data-col')) === col - 1) {
                        item.click();
                        break;
                    }
                }
                break;
            case 40:
                for (let i=0; i < items.length; i++) {
                    const item = items[i];
                    if (parseInt(item.getAttribute('data-row')) === row - 1 &&
                        parseInt(item.getAttribute('data-col')) === col) {
                        item.click();
                        break;
                    }
                }
                break;
            default:
                return;
        }
    }

    document.addEventListener("DOMContentLoaded", () => {
        init();
        const startButton = document.getElementById('start');
        startButton.addEventListener('click', startGame);
        const levelButtons = document.getElementsByClassName('level');
        [].forEach.call(levelButtons, level => level.addEventListener('click', changeLevel));

    })

})();

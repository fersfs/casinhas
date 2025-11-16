// Constantes para elementos do DOM
const panda = document.getElementById('panda');
const gameWorld = document.getElementById('game-world'); // Referência ao contêiner do cenário
const arrowLeft = document.getElementById('arrow-left');
const arrowRight = document.getElementById('arrow-right');
const arrowLeftImg = arrowLeft.querySelector('img'); // Pegamos a imagem dentro do botão
const arrowRightImg = arrowRight.querySelector('img');

// Variáveis de estado do jogo
let pandaPositionX = 100; 
const movementSpeed = 20; 
let currentFrame = 1; 
let isLocked = true; // Começa trancado
let rfidScanned = false; //scan do sensor
let animationInterval; 
const maxGameWidth = 800;

function startWalkingAnimation() {
    if (animationInterval) return;

    animationInterval = setInterval(() => {
        // Alterna entre panda1.png e panda2.png
        currentFrame = currentFrame === 1 ? 2 : 1;
        panda.src = `assets/panda${currentFrame}.png`;
    }, 250); 
}

function stopWalkingAnimation() {
    clearInterval(animationInterval);
    animationInterval = null;
    panda.src = `assets/panda.png`; 
}

function movePanda(direction) {
    startWalkingAnimation();

    if (direction === 'left') {
        panda.style.transform = 'scaleX(-1)'; 
        // Move, mas não deixa ele sair da borda esquerda
        pandaPositionX = Math.max(0, pandaPositionX - movementSpeed);
    } else if (direction === 'right') {
        panda.style.transform = 'scaleX(1)';
        // Move, mas não deixa ele sair da borda direita
        pandaPositionX = Math.min(maxGameWidth - panda.offsetWidth, pandaPositionX + movementSpeed);
    }

    // Aplica a nova posição
    panda.style.left = `${pandaPositionX}px`;

    // Verifica a Interação
    checkHouseInteraction();
    
}

function checkHouseInteraction() {
    // Posição aproximada onde a casa está no cenário (visual)
    // Se a casa estiver mais ou menos em 60% da tela até o final, a área de interação é:
    const houseInteractionAreaStart = maxGameWidth * 0.6; // Começa em 480px

    const pandaCenter = pandaPositionX + (panda.offsetWidth / 2);

    if (pandaCenter > houseInteractionAreaStart) {
        // O panda chegou na área da casa!

        if (isLocked) {
            // Destranca: remove a classe 'locked' e adiciona 'unlocked'
            gameWorld.classList.remove('locked');
            gameWorld.classList.add('unlocked');
            isLocked = false;
            console.log("Casa destrancada! Você venceu!");
        }

    } else {
        // O panda se afastou da casa
        // Se quisermos que ele volte a ficar trancado ao afastar (opcional)
        // if (!isLocked) {
        //     gameWorld.classList.remove('unlocked');
        //     gameWorld.classList.add('locked');
        //     isLocked = true;
        // }
    }
}

function checkHouseInteraction() {
    // Posição aproximada onde a casa está no cenário (visual)
    // Se a casa estiver mais ou menos em 60% da tela até o final, a área de interação é:
    const houseInteractionAreaStart = maxGameWidth * 0.6; // Começa em 480px

    const pandaCenter = pandaPositionX + (panda.offsetWidth / 2);

    if (pandaCenter > houseInteractionAreaStart) {
        // O panda chegou na área da casa!

        // DESTANCA SOMENTE se a casa estiver trancada E a tag RFID tiver sido lida
        if (isLocked && rfidScanned) {
            gameWorld.classList.remove('locked');
            gameWorld.classList.add('unlocked');
            isLocked = false;
            console.log("Casa destrancada! Você venceu com RFID!");
        }
    } 
    else {
        // O panda se afastou da casa
        // Se quisermos que ele volte a ficar trancado ao afastar (opcional)
        // if (!isLocked) {
        //     gameWorld.classList.remove('unlocked');
        //     gameWorld.classList.add('locked');
        //     isLocked = true;
        // }
    }
}

// Função genérica para tratar o pressionar e soltar da seta
function setupControls(button, buttonImg, direction) {
    let defaultSrc, pressedSrc;
    
    if (direction == 'left'){
        console.log(direction);
        defaultSrc = 'assets/arrow-default-left.png';
        pressedSrc = 'assets/arrow-pressed-left.png';
    }
    else{
        console.log(direction);
        defaultSrc = 'assets/arrow-default-right.png';
        pressedSrc = 'assets/arrow-pressed-right.png';
    }

    // Ação de Pressionar
    const startAction = () => {
        buttonImg.src = pressedSrc; // Troca para a imagem de pressionado
        movePanda(direction); 
        animationInterval = setInterval(() => movePanda(direction), 100); 
    };

    // Ação de Soltar
    const stopAction = () => {
        buttonImg.src = defaultSrc; // Volta para a imagem padrão
        clearInterval(animationInterval);
        animationInterval = null;
        stopWalkingAnimation(); 
    };
    
    // Eventos de Mouse
    button.addEventListener('mousedown', startAction);
    button.addEventListener('mouseup', stopAction);
    button.addEventListener('mouseleave', stopAction); 
    
    // Eventos de Toque (para mobile)
    button.addEventListener('touchstart', (e) => {
        e.preventDefault(); 
        startAction();
    });
    
    button.addEventListener('touchend', stopAction);
}

// FUNÇÃO GLOBAL: Chamada pela conexão Serial quando a tag RFID é lida
function rfidUnlockTag() {
    if (!rfidScanned) {
        rfidScanned = true;
        console.log("TAG RFID LIDA! Tentando destrancar...");
        // Verifica a interação do personagem com a casa imediatamente após a leitura
        checkHouseInteraction();
    }
}

// Configura os controles
setupControls(arrowLeft, arrowLeftImg, 'left');
setupControls(arrowRight, arrowRightImg, 'right');

// Opcional: Adiciona controle por teclado
// A lógica do teclado pode ser simplificada sem a troca de imagem da seta
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') {
        movePanda('left');
    } else if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') {
        movePanda('right');
    }
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a' || 
        e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') {
        stopWalkingAnimation();
    }
});

// Inicializa o estado do mundo como trancado ao carregar a página
gameWorld.classList.add('locked');



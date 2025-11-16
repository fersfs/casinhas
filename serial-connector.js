// A Web Serial API só funciona no Chrome ou Edge e requer interação do usuário (HTTPS ou localhost)

const UNLOCK_CODE = "UNLOCK_GAME"; // Deve ser a mesma mensagem enviada pelo micro:bit

// Elemento para o botão de conexão (Opcional: você pode adicionar um botão no seu HTML)
// const connectButton = document.createElement('button');
// connectButton.textContent = "Conectar Micro:bit";
// document.body.appendChild(connectButton);

// connectButton.addEventListener('click', async () => {
document.addEventListener('DOMContentLoaded', async () => {
    // Você pode querer que o usuário clique em um botão para iniciar a conexão
    // Vou iniciar automaticamente no DOMContentLoaded, mas a permissão ainda é necessária.
    
    // Tenta conectar à porta serial
    try {
        const port = await navigator.serial.requestPort({
            // Opcional: Filtros para tentar encontrar o micro:bit
            // filters: [{ usbVendorId: 0x0D28, usbProductId: 0x0204 }] 
        });

        await port.open({ baudRate: 115200 }); // Use o Baud Rate correto, geralmente 115200 para micro:bit

        console.log("Conectado à porta serial do Micro:bit.");

        const reader = port.readable.getReader();
        const decoder = new TextDecoderStream();
        const readableStreamClosed = port.readable.pipeTo(decoder.writable);
        const inputStream = decoder.readable.getReader();

        // Loop para ler dados do serial
        while (true) {
            const { value, done } = await inputStream.read();
            if (done) {
                console.log("Leitura da porta serial encerrada.");
                break;
            }
            
            // Verifica a mensagem recebida, tratando quebras de linha
            const lines = value.split('\n');
            lines.forEach(line => {
                const trimmedLine = line.trim();
                if (trimmedLine === UNLOCK_CODE) {
                    // SE a mensagem do Micro:bit for recebida, chame a função do jogo!
                    if (typeof rfidUnlockTag === 'function') {
                        rfidUnlockTag();
                        // Opcional: parar de ler depois do primeiro unlock
                        // inputStream.cancel(); 
                    }
                }
            });
        }

    } catch (error) {
        console.error("Erro ao conectar ou ler a porta serial. Certifique-se de que o Micro:bit está conectado e você está em um navegador compatível.", error);
    }
});


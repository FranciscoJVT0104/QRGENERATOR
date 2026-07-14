const generateQrButton = document.getElementById('generate-qr');
const downloadQrButton = document.getElementById('download-qr');
const contentInput = document.getElementById('content');
const imageInput = document.getElementById('image');
const fileNameDisplay = document.getElementById('file-name');
const qrCodeContainer = document.getElementById('qr-code');

imageInput.addEventListener('change', () => {
    const fileName = imageInput.files.length > 0 ? imageInput.files[0].name : 'Sin archivos seleccionados';
    fileNameDisplay.textContent = fileName;
});

// Obtiene el <canvas> real que dibuja qrcode.js, sin depender de índices frágiles
function getQrCanvas(qrCode) {
    // qrcode.js (davidshimjs) guarda el canvas interno en _oDrawing._elCanvas
    if (qrCode._oDrawing && qrCode._oDrawing._elCanvas) {
        return qrCode._oDrawing._elCanvas;
    }
    // Fallback: buscar cualquier <canvas> dentro del contenedor generado
    const found = qrCode._el.querySelector('canvas');
    if (found) return found;
    throw new Error('No se pudo obtener el canvas del QR generado');
}

generateQrButton.addEventListener('click', (e) => {
    e.preventDefault();
    const content = contentInput.value;
    const imageFile = imageInput.files[0];

    if (!content) {
        alert('Por favor, ingrese el contenido del código QR');
        return;
    }

    qrCodeContainer.innerHTML = '';

    const loadingSpinner = document.createElement('div');
    loadingSpinner.classList.add('loading-spinner');
    qrCodeContainer.appendChild(loadingSpinner);

    // Pequeño delay solo para que se aprecie el spinner (opcional, no afecta el dibujo)
    requestAnimationFrame(() => {
        const size = 500;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        // Genera el QR en un contenedor temporal (no necesita estar en el DOM)
        const qrHolder = document.createElement('div');
        const qrCode = new QRCode(qrHolder, {
            text: content,
            width: size,
            height: size,
            colorDark: '#000000',
            colorLight: '#ffffff',
            correctLevel: QRCode.CorrectLevel.H
        });

        let qrCanvas;
        try {
            qrCanvas = getQrCanvas(qrCode);
        } catch (err) {
            qrCodeContainer.innerHTML = '';
            alert('Error generando el QR: ' + err.message);
            return;
        }

        // Dibuja el QR llenando exactamente todo el canvas final (queda cuadrado 1:1)
        ctx.drawImage(qrCanvas, 0, 0, size, size);

        const finish = () => {
            qrCodeContainer.innerHTML = '';
            qrCodeContainer.appendChild(canvas);
        };

        if (imageFile) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    ctx.imageSmoothingEnabled = true;
                    ctx.imageSmoothingQuality = 'high';

                    const logoMax = 110;
                    let w = img.naturalWidth;
                    let h = img.naturalHeight;
                    if (w > h) {
                        h = (h / w) * logoMax;
                        w = logoMax;
                    } else {
                        w = (w / h) * logoMax;
                        h = logoMax;
                    }

                    // Centro exacto del canvas final (500x500 => centro en 250,250)
                    const cx = canvas.width / 2;
                    const cy = canvas.height / 2;
                    const x = cx - w / 2;
                    const y = cy - h / 2;

                    const padding = 15;
                    const boxX = x - padding;
                    const boxY = y - padding;
                    const boxW = w + padding * 2;
                    const boxH = h + padding * 2;

                    ctx.fillStyle = '#FFFFFF';
                    ctx.beginPath();
                    ctx.roundRect(boxX, boxY, boxW, boxH, 12);
                    ctx.fill();
                    ctx.beginPath();
                    ctx.roundRect(boxX, boxY, boxW, boxH, 12);
                    ctx.strokeStyle = '#DDDDDD';
                    ctx.lineWidth = 2;
                    ctx.stroke();

                    ctx.drawImage(img, x, y, w, h);
                    finish();
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(imageFile);
        } else {
            finish();
        }
    });
});

downloadQrButton.addEventListener('click', (e) => {
    e.preventDefault();
    const canvas = qrCodeContainer.querySelector('canvas');
    if (!canvas) {
        alert('Por favor, genere primero el código QR');
        return;
    }
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = 'qr-code.png';
    link.click();
});

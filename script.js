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

generateQrButton.addEventListener('click', (e) => {
    e.preventDefault();
    const content = contentInput.value;
    const imageFile = imageInput.files[0];

    if (!content) {
        alert('Por favor, ingrese el contenido del código QR');
        return;
    }

    qrCodeContainer.innerHTML = ''; // Clear any existing QR code
    
    // Add loading animation
    const loadingSpinner = document.createElement('div');
    loadingSpinner.classList.add('loading-spinner');
    qrCodeContainer.appendChild(loadingSpinner);

    setTimeout(() => {
        qrCodeContainer.innerHTML = ''; // Remove loading animation
        
        const canvas = document.createElement('canvas');
        canvas.width = 300;
        canvas.height = 300;
        const ctx = canvas.getContext('2d');

        // Generate the QR code
        const qrCode = new QRCode(document.createElement('div'), {
            text: content,
            width: 300,
            height: 300,
            colorDark: '#000000',
            colorLight: '#ffffff',
            correctLevel: QRCode.CorrectLevel.H
        });

        // Wait for the QR code to be drawn on the canvas
        setTimeout(() => {
            const tempCanvas = qrCode._el.childNodes[1];
            ctx.drawImage(tempCanvas, 0, 0);

            if (imageFile) {
                const reader = new FileReader();
                reader.onload = function (event) {
                    const img = new Image();
                    img.onload = function () {
                        const imgSize = 60;
                        const imgX = (canvas.width - imgSize) / 2;
                        const imgY = (canvas.height - imgSize) / 2;
                        ctx.drawImage(img, imgX, imgY, imgSize, imgSize);
                        qrCodeContainer.innerHTML = ''; // Clear any existing QR code
                        qrCodeContainer.appendChild(canvas);
                    };
                    img.src = event.target.result;
                };
                reader.readAsDataURL(imageFile);
            } else {
                qrCodeContainer.innerHTML = ''; // Clear any existing QR code
                qrCodeContainer.appendChild(canvas);
            }
        }, 500); // Adjust timeout if necessary
    }, 2000); // Simulated loading time, adjust as needed
});

downloadQrButton.addEventListener('click', (e) => {
    e.preventDefault();
    if (!qrCodeContainer.querySelector('canvas')) {
        alert('Por favor, genere primero el código QR');
        return;
    }

    const canvas = qrCodeContainer.querySelector('canvas');
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = 'qr-code.png';
    link.click();
});

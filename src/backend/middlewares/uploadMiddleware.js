const multer = require('multer');

// Isso faz o arquivo ficar na RAM só o tempo suficiente para o Sharp esmagá-lo.
const storage = multer.memoryStorage();

const upload = multer({
    storage: storage,
    limits: { fileSize: 20 * 1024 * 1024 }, // Aceitamos fotos de até 20MB da câmera!
    fileFilter: (req, file, cb) => {
        const extensoesPermitidas = /jpeg|jpg|png|webp/;
        const mimetype = extensoesPermitidas.test(file.mimetype);

        if (mimetype) {
            return cb(null, true);
        }
        cb(new Error('Apenas imagens são permitidas!'));
    }
});

module.exports = upload;
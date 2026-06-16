/**
 * src/backend/middlewares/csrfMiddleware.js
 *
 * Middleware simples de CSRF para formulários HTML.
 * Gera um token único por sessão e o torna disponível nos templates EJS.
 * Os formulários devem incluir: <input type="hidden" name="_csrf" value="<%= csrfToken %>">
 */

const crypto = require('crypto');

if (!process.env.CSRF_SECRET) {
    if (process.env.NODE_ENV === 'production') {
        throw new Error('CSRF_SECRET não configurado. Defina a variável de ambiente CSRF_SECRET.');
    }
    console.warn('⚠️  CSRF_SECRET não configurado. Usando fallback para desenvolvimento.');
}
const CSRF_SECRET = process.env.CSRF_SECRET || 'csrf_secret_dev_fallback';
const TOKEN_EXPIRY = 60 * 60 * 1000; // 1 hora

/**
 * Gera um token CSRF assinado
 */
function generateToken(sessionId) {
    const payload = `${sessionId}:${Date.now()}`;
    const signature = crypto.createHmac('sha256', CSRF_SECRET).update(payload).digest('hex');
    return Buffer.from(`${payload}:${signature}`).toString('base64');
}

/**
 * Valida um token CSRF
 */
function validateToken(token, sessionId) {
    try {
        const decoded = Buffer.from(token, 'base64').toString('utf8');
        const parts = decoded.split(':');
        if (parts.length !== 3) return false;

        const [tokenSessionId, timestamp, signature] = parts;

        // Verifica assinatura
        const expectedPayload = `${tokenSessionId}:${timestamp}`;
        const expectedSignature = crypto.createHmac('sha256', CSRF_SECRET).update(expectedPayload).digest('hex');
        if (signature !== expectedSignature) return false;

        // Verifica expiração
        if (Date.now() - parseInt(timestamp) > TOKEN_EXPIRY) return false;

        // Verifica se pertence à sessão atual
        if (tokenSessionId !== sessionId) return false;

        return true;
    } catch {
        return false;
    }
}

/**
 * Middleware que gera e injeta o token CSRF
 */
function csrfGenerate(req, res, next) {
    // Gera um ID de sessão simples se não existir
    if (!req.cookies.session_id) {
        const sessionId = crypto.randomBytes(16).toString('hex');
        res.cookie('session_id', sessionId, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000, // 24h
            sameSite: 'strict'
        });
        req.cookies.session_id = sessionId;
    }

    const token = generateToken(req.cookies.session_id);
    res.locals.csrfToken = token;
    next();
}

/**
 * Middleware interno que extrai e valida o token CSRF de uma requisição.
 * Retorna true se válido, false caso contrário.
 */
function _validateCsrf(req, res) {
    const token = (req.body && req.body._csrf) || req.headers['x-csrf-token'];
    const sessionId = req.cookies.session_id;

    if (!token || !sessionId) {
        res.status(403).json({ mensagem: 'Token CSRF ausente.' });
        return false;
    }

    if (!validateToken(token, sessionId)) {
        res.status(403).json({ mensagem: 'Token CSRF inválido ou expirado.' });
        return false;
    }

    // Remove o _csrf do body para não poluir os controllers
    if (req.body) {
        delete req.body._csrf;
    }

    return true;
}

/**
 * Middleware que valida o token CSRF em requisições POST/PUT/PATCH/DELETE.
 * Pula automaticamente requisições multipart/form-data (uploads),
 * que devem ser validadas pelo csrfValidateAfterUpload.
 */
function csrfValidate(req, res, next) {
    // Só valida em métodos que modificam dados
    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
        return next();
    }

    // Pula validação CSRF para rotas da API REST (JSON).
    // A API é consumida por clientes programáticos que autenticam via JWT/Cookie,
    // e não utilizam tokens CSRF em formulários HTML.
    if (req.path.startsWith('/api/') || req.originalUrl.startsWith('/api/')) {
        return next();
    }

    // Pula validação CSRF para multipart/form-data (uploads de arquivo).
    // O req.body ainda não existe porque o Multer não processou a requisição.
    // A validação deve ser feita pelo csrfValidateAfterUpload nas rotas de upload.
    const contentType = req.headers['content-type'] || '';
    if (contentType.includes('multipart/form-data')) {
        return next();
    }

    if (!_validateCsrf(req, res)) return;
    next();
}

/**
 * Middleware para validar CSRF em rotas com upload de arquivo (multipart/form-data).
 * DEVE ser usado DEPOIS do Multer (ex: upload.single('campo')), pois só então
 * o req.body estará disponível com o campo _csrf do formulário.
 */
function csrfValidateAfterUpload(req, res, next) {
    if (!_validateCsrf(req, res)) return;
    next();
}

module.exports = { csrfGenerate, csrfValidate, csrfValidateAfterUpload };

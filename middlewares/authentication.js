const jwt = require('jsonwebtoken');
require('dotenv').config();

function authenticationMiddleware(req, res, next) {
    try {
        const authHeader = req.headers.authorization;

        // Verifica se o cabeçalho de autorização está presente
        if (!authHeader) {
            return res.status(401).json({ error: 'Authorization header is missing' });
        }

        // Busca o token `jwt` no cabeçalho de autorização
        const jwtToken = authHeader.split(';').find(token => token.trim().startsWith('jwt='));

        // Verifica se o token `jwt` foi encontrado e está no formato correto
        if (!jwtToken || !jwtToken.trim().startsWith('jwt=')) {
            return res.status(401).json({ error: 'JWT token is missing or in an invalid format' });
        }

        const token = jwtToken.replace('jwt=', '').trim();

        // Verifica se o token está vazio após a remoção do prefixo
        if (!token) {
            return res.status(401).json({ error: 'JWT token is missing' });
        }

        // Verifica o token
        jwt.verify(token, process.env.JWTSECRET, (err, decoded) => {
            if (err) {
                // Log de erro detalhado para fins de depuração
                console.error('JWT verification error:', err);
                return res.status(401).json({ error: 'Invalid JWT token' });
            }

            // Adiciona as informações decodificadas do token ao objeto de solicitação
            req.user = decoded;

            // Prossegue para o próximo middleware ou rota
            next();
        });
    } catch (error) {
        // Log de erro detalhado para fins de depuração
        console.error('Authentication middleware error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

function authenticationMiddlewareApi(req, res, next) {
    try {
        const authHeader = req.headers.authorization;

        // Verifica se o cabeçalho de autorização está presente
        if (!authHeader) {
            return res.status(401).json({ error: 'Authorization header is missing' });
        }

        // Busca o token no cabeçalho de autorização que começa com 'jwt=' ou 'Bearer '
        const jwtToken = authHeader.split(';').find(token => token.trim().startsWith('jwt=') || token.trim().startsWith('Bearer '));

        // Verifica se o token foi encontrado e está no formato correto
        if (!jwtToken || (!jwtToken.trim().startsWith('jwt=') && !jwtToken.trim().startsWith('Bearer '))) {
            return res.status(401).json({ error: 'Token is missing or in an invalid format' });
        }

        // Remove o prefixo 'jwt=' ou 'Bearer ' do token
        let token = jwtToken.replace('jwt=', '').replace('Bearer ', '').trim();

        // Verifica se o token está vazio após a remoção dos prefixos
        if (!token) {
            return res.status(401).json({ error: 'Token is missing' });
        }

        // Verifica o token
        jwt.verify(token, process.env.JWTSECRET, (err, decoded) => {
            if (err) {
                // Log de erro detalhado para fins de depuração
                console.error('JWT verification error:', err);
                return res.status(401).json({ error: 'Invalid token' });
            }

            // Adiciona as informações decodificadas do token ao objeto de solicitação
            req.user = decoded;

            // Prossegue para o próximo middleware ou rota
            next();
        });
    } catch (error) {
        // Log de erro detalhado para fins de depuração
        console.error('Authentication middleware error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

function authenticationMiddlewareBasic(req, res, next) {
    try {
        const authHeader = req.headers.authorization;

        // Verifica se o cabeçalho de autorização está presente
        if (!authHeader) {
            return res.status(401).json({ error: 'Authorization header is missing' });
        }

        // Verifica se o cabeçalho de autorização está no formato Basic
        if (!authHeader.startsWith('Basic ')) {
            return res.status(401).json({ error: 'Invalid authorization header format' });
        }

        // Decodifica o base64 e extrai usuário e senha
        const base64Credentials = authHeader.split(' ')[1];
        const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
        const [username, password] = credentials.split(':');

        // Verifica se usuário e senha estão presentes
        if (!username || !password) {
            return res.status(401).json({ error: 'Invalid authorization credentials' });
        }

        // Verifica o token (supondo que a senha é o token JWT)
        jwt.verify(password, process.env.JWTSECRET, (err, decoded) => {
            if (err) {
                return res.status(401).json({ error: 'Invalid token' });
            }

            // Adiciona as informações decodificadas do token ao objeto de solicitação
            req.user = decoded;

            // Prossegue para o próximo middleware ou rota
            next();
        });
    } catch (error) {
        // Log de erro detalhado para fins de depuração
        console.error('Authentication middleware error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

module.exports = { authenticationMiddleware, authenticationMiddlewareApi, authenticationMiddlewareBasic };
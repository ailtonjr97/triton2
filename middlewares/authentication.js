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

module.exports = { authenticationMiddleware, authenticationMiddlewareApi };
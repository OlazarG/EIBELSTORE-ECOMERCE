const verifyRole = (role) => {
    return (req, res, next) => {
        if (!req.userRole || req.userRole !== role) {
            return res.status(403).json({ error: 'Acceso denegado' });
        }
        next();
    };
};

module.exports = verifyRole;

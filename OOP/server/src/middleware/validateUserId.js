// validateUserId.js

const validateUserId = (req, res, next) => {
    const userId = req.params.id;

    if (!userId || isNaN(userId)) {
        return res.status(400).json({ message: 'Invalid user ID format.' });
    }

    // Additional logic can go here to check if the user ID exists in the database
    next();
};

module.exports = validateUserId;

import User from '../models/User.js';

export const getAllUsers = async (req, res) => {
    const users = await User.find();
    res.json(users);
};
  
export const getUserById = async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
};
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

export const createUser = async (req, res) => {
    const { name, email, password, role } = req.body;
  
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });
  
    const user = await User.create({ name, email, password, role });
    res.status(201).json(user);
};
//user routes
import express, { Request, Response } from 'express';
import User from '../models/user';
import { validateUserInput, validateLoginInput } from '../middleware/validation';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const router = express.Router();

router.post('/signup', validateUserInput, async (req: Request, res: Response) => {
    try {
        const {
            name,
            email,
            phone,
            password,
            gender
        } = req.body;
        //encrypt password
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = new User({ name, email, phone, password:hashedPassword, gender });
        await newUser.save();
        res.status(201).json({ message: 'User created successfully' });
    }
    catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}
);

router.post('/login', async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email, password });
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.status(200).json(user);
    }
    catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
//user routes
import express, { Request, Response } from 'express';
import User from '../models/user';
import { validateUserInput } from '../middlewares/validation';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import authenticate from '../middlewares/authenticate';
import { RequestWithUser } from '../interfaces/IUser';
const router = express.Router();

//implementing refresh token rotation strategy  
//PUT /users/refresh-token
router.put('/refresh-token', async (req: Request, res: Response) => {
    try {
        const refreshToken = req.body.refresh_token;
        if (!refreshToken) return res.status(401).json({ error: 'Refresh token is required' });

        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET as string, (err: any, user: any) => {
            if (err) return res.status(401).json({ error: 'Invalid refresh token' });
            res.status(200).json({ access_token: jwt.sign({ email: user.email, id: user.id }, process.env.JWT_SECRET as string, { expiresIn: '10m' }) });
        });
    }
    catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}
);

//signup route 
//POST /users/signup
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
        const salt = await bcrypt.genSalt(Number(process.env.SALT));
        const hashedPassword = await bcrypt.hash(password, salt);

        //create new user and save to db
        const newUser = new User({ name, email, phone, password: hashedPassword, gender });
        await newUser.save();

        //generate token
        res.status(201).json(
            {
                message: 'User created successfully',
                access_token: jwt.sign({ email: newUser.email, id: newUser._id }, process.env.JWT_SECRET as string, { expiresIn: '10m' }),
                refresh_token: jwt.sign({ email: newUser.email, id: newUser._id }, process.env.REFRESH_TOKEN_SECRET as string, { expiresIn: '7d' })
            });

    }
    catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}
);

//login route 
//POST /users/login
router.post('/login', async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        //check if user exists and the credentials are valid
        const user = await User.findOne({ email })
        const validPassword = await bcrypt.compare(password, user?.password ?? '');
        if (!validPassword || !user) return res.status(401).json({ error: 'Invalid credentials' });

        //generate token if valid so that the token can be stored in session/local storage
        res.status(200).json(
            {
                message: 'Login successful',
                access_token: jwt.sign({ email: user.email, id: user._id }, process.env.JWT_SECRET as string, { expiresIn: '10m' }),
                refresh_token: jwt.sign({ email: user.email, id: user._id }, process.env.REFRESH_TOKEN_SECRET as string, { expiresIn: '7d' })
            });
    }
    catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});


//GET /users
router.get('/', authenticate, async (req: RequestWithUser, res: Response) => {
    try {
        const user = await User.findById(req.user?.id);
        if (!user) return res.status(400).json({ error: 'User not found' });
        res.status(200).json({name: user.name, email: user.email, phone: user.phone, gender: user.gender})
    }
    catch(err:any){
        res.status(500).json({ error: err.message });
    }
});

export default router;
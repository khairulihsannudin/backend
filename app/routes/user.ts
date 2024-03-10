//user routes
import express, { Request, Response } from 'express';
import User from '../models/user';
import { validateUserInput } from '../middlewares/validation';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import authenticate from '../middlewares/authenticate';
import { RequestWithUser } from '../interfaces/IUser';
import client from '../../redis';
import checkCache from '../middlewares/cache';
import tokenCache from '../middlewares/tokenCache';
import loginLimiter from '../middlewares/loginLimiter';
const router = express.Router();


//implementing refresh token rotation strategy  
//PUT /users/refresh-token
router.put('/refresh-token', tokenCache, async (req: RequestWithUser, res: Response) => {
    try {
        const refreshToken = req.body.refresh_token;
        if (!refreshToken) return res.status(401).json({ error: 'Refresh token is required' });
        const user = req.user;
        res.status(200).json({ access_token: jwt.sign({ email: user?.email, id: user?.id }, process.env.JWT_SECRET as string, { expiresIn: '10m' }) });
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

        //check if user already exists
        const userExists = await User.findOne({email});
        if (userExists) return res.status(400).json({ error: 'User already exists' });

        //encrypt password
        const salt = await bcrypt.genSalt(Number(process.env.SALT));
        const hashedPassword = await bcrypt.hash(password, salt);

        //create new user and save to db
        const newUser = new User({ name, email, phone, password: hashedPassword, gender });
        await newUser.save();

        //generate token
        let access_token = jwt.sign({ email: newUser.email, id: newUser._id }, process.env.JWT_SECRET as string, { expiresIn: '10m' });
        let refresh_token = jwt.sign({ email: newUser.email, id: newUser._id }, process.env.REFRESH_TOKEN_SECRET as string, { expiresIn: '7d' });
        client.setex(refresh_token, 604800, JSON.stringify({ refresh_token: refresh_token }));
        res.status(201).json(
            {
                message: 'User created successfully',
                access_token: access_token,
                refresh_token: refresh_token
            });

    }
    catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}
);

//login route 
//POST /users/login
router.post('/login', loginLimiter, async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        //check if user exists and the credentials are valid
        const user = await User.findOne({ email })
        const validPassword = await bcrypt.compare(password, user?.password ?? '');
        if (!validPassword || !user) return res.status(401).json({ error: 'Invalid credentials' });

        //generate token if valid so that the token can be stored in session/local storage
        const access_token = jwt.sign({ email: user.email, id: user._id }, process.env.JWT_SECRET as string, { expiresIn: '10m' })
        const refresh_token = jwt.sign({ email: user.email, id: user._id }, process.env.REFRESH_TOKEN_SECRET as string, { expiresIn: '7d' })
        client.setex(refresh_token, 604800, JSON.stringify({ refresh_token: refresh_token }));
        res.status(200).json(
            {
                message: 'Login successful',
                access_token: access_token,
                refresh_token: refresh_token

            });
    }
    catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});


//GET /users
router.get('/', authenticate, checkCache, async (req: RequestWithUser, res: Response) => {
    try {
        const user = await User.findById(req.user?.id);
        if (!user) return res.status(400).json({ error: 'User not found' });
        client.setex(req.user?.id, 3600, JSON.stringify({ name: user.name, email: user.email, phone: user.phone, gender: user.gender }));
        res.status(200).json({name: user.name, email: user.email, phone: user.phone, gender: user.gender})
    }
    catch(err:any){
        res.status(500).json({ error: err.message });
    }
});

//logout route
//DELETE /users/logout
router.delete('/logout', authenticate, async (req: Request, res: Response) => {
    try {
        client.del(req.body.refresh_token, (err, reply) => {
            if(err) res.status(500).json({ error: err.message });
            res.status(200).json({ message: 'User logged out successfully' });
        });
    }
    catch(err:any){
        res.status(500).json({ error: err.message });
    }
});

export default router;
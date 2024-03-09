import rateLimit from "express-rate-limit";
import { Request, Response } from "express";

const loginLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 jam
    max: 10, // limit each IP to 10 requests per windowMs
    handler: (req: Request, res: Response) => {
        res.status(429).json({ error: 'Too many requests, please try again later.' });
    }
});

export default loginLimiter;
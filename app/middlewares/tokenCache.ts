import client from "../../redis";
import { Request, Response, NextFunction } from "express";
import jwt from 'jsonwebtoken';

const tokenCache = (req: Request, res: Response, next: NextFunction) => {
    const db = process.env.NODE_ENV === 'test' ? 1 : 2;
    client.select(db , (err) => {
        if (err) throw err;
    });

    const key = req.body.refresh_token;
    client.get(key, (err, data) => {
        if (err) throw err;
        if (data !== null) {
            jwt.verify(data as string, process.env.JWT_SECRET as string, (err, user) => {
                if (err) return res.status(401).json({ error: 'Invalid token.' });
                res.set('X-Cache-Hit', 'true');
                next();
            });
            next();
        } else {
            res.status(401).json({ error: 'Invalid token.' });
        }
    });
    
}

export default tokenCache;
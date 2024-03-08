import client from "../../redis";
import { Request, Response, NextFunction } from "express";
import jwt from 'jsonwebtoken';

const tokenCache = (req: Request, res: Response, next: NextFunction) => {
    client.select(1 , (err) => {
        if (err) throw err;
    });

    const key = req.body.refresh_token;
    client.get(key, (err, data) => {
        if (err) throw err;
        if (data !== null) {
            const refresh_token = JSON.parse(data as string).refresh_token;
            if(typeof refresh_token !== 'string') return res.status(401).json({ error: 'Invalid token.' });
            jwt.verify(refresh_token, process.env.REFRESH_TOKEN_SECRET as string, (err:any, user:any) => {
                if (err) return res.status(401).json({ error: 'Invalid token.' });
                res.set('X-Cache-Hit', 'true');
                req.user = user;
                next();
            });
        } else {
            res.set('X-Cache-Hit', 'false');
            res.status(401).json({ error: 'Invalid token.' });
        }
    });
    
}

export default tokenCache;
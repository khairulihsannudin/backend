import client from "../../redis";
import { Response, NextFunction } from "express";
import { RequestWithUser } from "../interfaces/IUser";

const checkCache = (req: RequestWithUser, res: Response, next: NextFunction) => {
    const db = process.env.NODE_ENV === 'test' ? 2 : 0;
    client.select(db , (err) => {
        if (err) throw err;
    });
    const key = req.user?.id;
    client.get(key, (err, data) => {
        if (err) throw err;
        if (data !== null) {
            res.set('X-Cache-Hit', 'true');
            res.status(200).json(JSON.parse(data as string));
        } else {
            res.set('X-Cache-Hit', 'false');
            next();
        }
    });
}

export default checkCache;
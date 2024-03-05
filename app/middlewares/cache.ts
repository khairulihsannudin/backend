import client from "../../redis";
import { Response, NextFunction } from "express";
import { RequestWithUser } from "../interfaces/IUser";

const checkCache = (req: RequestWithUser, res: Response, next: NextFunction) => {
    const key = req.user?._id;
    client.get(key, (err, data) => {
        if (err) throw err;
        if (data !== null) {
            res.status(200).json(JSON.parse(data as string));
        } else {
            next();
        }
    });
}

export default checkCache;
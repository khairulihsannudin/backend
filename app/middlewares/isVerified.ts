import { Response, NextFunction } from "express";
import { RequestWithUser } from "../interfaces/IUser";

const isVerified = (req: RequestWithUser, res: Response, next: NextFunction) => {
    if (!req.user?.verified) return res.status(401).json({ error: 'User is not verified' });
    next();
}

export default isVerified;
import { Response, NextFunction } from "express";
import { RequestWithUser } from "../interfaces/IUser";
import User from "../models/user";

const isVerified =  async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const user = await User.findById(req.user?.id)
    const verified = user?.verified;
    if (!verified) return res.status(401).json({ error: 'User is not verified' });
    next();
}

export default isVerified;
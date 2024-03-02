import { Request } from "express";
import { JwtPayload } from "jsonwebtoken";

export interface IUser {
    _id: string;
    name: string;
    password: string;
    email: string;
    phone: string;
    gender: string;
};

export interface RequestWithUser extends Request{
    user?: JwtPayload;
  }
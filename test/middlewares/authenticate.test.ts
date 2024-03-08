// tests/authenticate.test.ts
import jwt from 'jsonwebtoken';
import authenticate from '../../app/middlewares/authenticate';
import { NextFunction, Request, Response } from 'express';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.test.local' });

describe('authenticate middleware', () => {
  it('should send 401 if no token is provided', () => {
    const req = {
      header: jest.fn(),
    } as unknown as Request;
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;
    const next = jest.fn() as NextFunction;

    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Access denied. No token provided.' });
  });

  it('should send 401 if the token is invalid', () => {
    const req = {
      header: jest.fn().mockReturnValue('Bearer invalid_token'),
    } as unknown as Request;
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;
    const next = jest.fn() as NextFunction;

    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid token.' });
  });

  it('should call next if the token is valid', () => {
    const validToken = jwt.sign({ _id: '12345', email:'john@mail.com' }, process.env.JWT_SECRET as string);
    const req = {
      header: jest.fn().mockReturnValue(`Bearer ${validToken}`),
      user: null,
    } as unknown as Request;
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;
    const next = jest.fn() as NextFunction;

    authenticate(req, res, next);

    expect(req.user).toBeDefined();
    expect(next).toHaveBeenCalled();
  });
});
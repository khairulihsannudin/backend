import request from 'supertest';
import express from 'express';
import eventsRouter from '../../app/routes/events';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { MongoMemoryServer } from 'mongodb-memory-server';
import Event from '../../app/models/event';
import User from '../../app/models/user';
import { ObjectId } from 'mongodb';

dotenv.config();
const app = express();
app.use(express.json());
app.use('/events', eventsRouter);

let mongoServer: any;
let access_token: string;
let user: any;
let events: any;
describe('Event routes', () => {

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
    user = new User({
      id: new ObjectId('3dd3dd3dd3dd3dd3dd3dd3dd'),
      name: 'John Doe',
      email: 'xana@mail.com',
      phone: '08212345678',
      password: 'password',
      gender: 'Male',
      events: ['1dd1dd1dd1dd1dd1dd1dd1dd']
    });

    events = await Event.insertMany([
      {
        id: new ObjectId('1dd1dd1dd1dd1dd1dd1dd1dd'),
        title: 'Test Event',
        description: 'This is a test event',
        date: new Date(),
        maxParticipants: 10,
        participants: ['3dd3dd3dd3dd3dd3dd3dd3dd'],
      },
      {
        id: new ObjectId('2dd2dd2dd2dd2dd2dd2dd2dd'),
        title: 'Test Event 2',
        description: 'This is a test event 2',
        date: new Date(),
        maxParticipants: 10,
        participants: [],
      }
    ]);

    await user.save();
    access_token = jwt.sign({ email: user.email, id: user.id }, process.env.JWT_SECRET as string, { expiresIn: '10m' });
  });

  afterAll(async () => {
    await mongoose.connection.close();
    await mongoServer.stop();
  });

  it('should return all events', async () => {
    const res = await request(app).get('/events').set('Authorization', `Bearer ${access_token}`);

    expect(res.status).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

});
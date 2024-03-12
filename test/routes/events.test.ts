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
let access_token2: string;
let user1: any;
let user2: any;
let events: any;
describe('Event routes', () => {

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
    user1 = new User({
      id: new ObjectId('3dd3dd3dd3dd3dd3dd3dd3dd'),
      name: 'John Doe',
      email: 'johndoe@mail.com',
      phone: '08212345678',
      password: 'password',
      gender: 'Male',
      events: [],
      verified: true
    });

    await user1.save();

    user2 = new User({
        id: new ObjectId('4dd4dd4dd4dd4dd4dd4dd4dd'),
        name: 'Jane Doe',
        email: 'jane@mail.com',
        phone: '08212345678',
        password: 'password',
        gender: 'Female',
        verified: false,
        events: []
      });
    await user2.save();

    events = await Event.insertMany([
      {
        id: new ObjectId('1dd1dd1dd1dd1dd1dd1dd1dd'),
        title: 'Test Event',
        description: 'This is a test event',
        date: new Date(),
        maxParticipants: 10,
        participants: [],
      },
      {
        id: new ObjectId('2dd2dd2dd2dd2dd2dd2dd2dd'),
        title: 'Test Event 2',
        description: 'This is a test event 2',
        date: new Date(),
        maxParticipants: 1,
        participants: [],
      }
    ]);
    access_token = jwt.sign({ email: user1.email, id: user1._id }, process.env.JWT_SECRET as string, { expiresIn: '10m' });
    access_token2 = jwt.sign({ email: user2.email, id: user2._id }, process.env.JWT_SECRET as string, { expiresIn: '10m' });
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

  it('should not let user to register for an event if not verified', async () => {
    const res = await request(app).post('/events/register').set('Authorization', `Bearer ${access_token2}`).send({ _id: events[1].id });

    expect(res.status).toEqual(401);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toBe('User is not verified');
  });

  it('should let user to register', async () => {
    const res = await request(app).post('/events/register').set('Authorization', `Bearer ${access_token}`).send({ _id: events[1]._id });

    expect(res.status).toEqual(200);
    expect(res.body).toHaveProperty('participants');
    expect(res.body.participants.length).toBe(1);
    expect(res.body.participants[0].toString()).toBe(user1.id.toString());

    user1 = await User.findById(user1._id);
    events = await Event.find();

    expect(user1.events.length).toBe(1);
    expect(user1.events[0].toString()).toBe(events[1]._id.toString());
  });

  it('should not let user to register for an event if already registered', async () => {
    const res = await request(app).post('/events/register').set('Authorization', `Bearer ${access_token}`).send({ _id: events[1].id });

    expect(res.status).toEqual(400);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toBe('User already registered for this event');
  });

  it('should not let user to register for an event if event is full', async () => {
    user2.verified = true;
    await user2.save();
    access_token2 = jwt.sign({ email: user2.email, id: user2.id }, process.env.JWT_SECRET as string, { expiresIn: '10m' });
    const res = await request(app).post('/events/register').set('Authorization', `Bearer ${access_token2}`).send({ _id: events[1].id });

    expect(res.status).toEqual(400);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toBe('Event is full');
    user2 = await User.findById(user2._id);
    expect(user2.events.length).toBe(0);
  });

  it('should let user to unregister', async () => {
    const res = await request(app).delete('/events/register').set('Authorization', `Bearer ${access_token}`).send({ _id: events[1].id });

    expect(res.status).toEqual(200);
    expect(res.body).toHaveProperty('participants');
    expect(res.body.participants.length).toBe(0);
    user1 = await User.findById(user1._id);
    expect(user1.events.length).toBe(0);
  });

  it('should not let user to unregister if not registered', async () => {
    const res = await request(app).delete('/events/register').set('Authorization', `Bearer ${access_token}`).send({ _id: events[1].id });

    expect(res.status).toEqual(400);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toBe('User is not registered for this event');
  });

  it('should not let user register to event that is not exist', async()=>{
    const res = await request(app).post('/events/register').set('Authorization', `Bearer ${access_token}`).send({ _id: new ObjectId('5dd5dd5dd5dd5dd5dd5dd5dd') });
    expect(res.status).toEqual(404);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toBe('Event not found');
  })
});
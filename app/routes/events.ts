import express, { Request, Response } from 'express';
import Event from '../models/event';
import User from '../models/user';
import authenticate from '../middlewares/authenticate';
import { RequestWithUser } from '../interfaces/IUser';
import { ObjectId } from 'mongodb';
import isVerified from '../middlewares/isVerified';

const router = express.Router();
router.use(authenticate);

//GET all /events
router.get('/', async (req: Request, res: Response) => {
    try {
        const events = await Event.find();
        res.status(200).json(events);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

//POST /events/register
router.post('/register', isVerified, async (req: RequestWithUser, res: Response) => {
    try {
        const { _id } = req.body;
        const event = await Event.findById(_id);

        if (!event) return res.status(404).json({ error: 'Event not found' });
        const user = await User.findById(req.user?.id);
        
        if (!user) return res.status(404).json({ error: 'User not found' });
        if (user.events.includes(_id)) return res.status(400).json({ error: 'User already registered for this event' });
        if((event.numberOfParticipants ?? 0) >= (event.maxParticipants ?? 0)) return res.status(400).json({ error: 'Event is full' });
        
        event.participants.push(req.user?.id);
        event.numberOfParticipants = event.participants.length ?? 0;
        user.events.push(_id);
        
        await user.save();
        await event.save();
        res.status(200).json(event);
    }
    catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}
);

//DELETE /events/unregister
router.delete('/register', isVerified, async (req: RequestWithUser, res: Response) => {
    try {
        const { _id } = req.body;
        const event = await Event.findById(_id);
        const user = await User.findById(req.user?.id);

        if (!event) return res.status(404).json({ error: 'Event not found' });
        if(!event.participants.includes(req.user?.id)) return res.status(400).json({ error: 'User is not registered for this event' });
        if (!user) return res.status(404).json({ error: 'User not found' });

        event.participants = event.participants.filter((participantId: ObjectId) => participantId != req.user?.id);
        event.numberOfParticipants = event.participants.length ?? 0;
        user.events =  user.events.filter((eventId: ObjectId) => eventId != _id);

        await user.save();
        await event.save();

        res.status(200).json(event);
    }
    catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
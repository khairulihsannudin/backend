import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
dotenv.config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD
    }
});

export const sendMail = async (data: string): Promise<boolean> => {
    const token = jwt.sign({email: data}, process.env.VERIFICATION_SECRET as string, { expiresIn: '10m' });
    const subject = 'Welcome to the club';
    const text = 'Thankyou for signing up to the club. Please click the link below to verify your email address\n\n' + process.env.API_URL + '/users/verify/' + token + '\n\nIf you did not sign up to the club, please ignore this email. This link will expire in 10 minutes.';
    try {
        const info = await transporter.sendMail({
            from: process.env.EMAIL,
            to: data,
            subject,
            text
        });
        return !!info.messageId;
    } catch (error) {
        console.error('Error occurred: %s', error);
        return false;
    }
};


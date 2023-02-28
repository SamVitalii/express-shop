import express from "express";

import { body} from "express-validator";

import {
    getLogin,
    postLogin,
    postLogout,
    getSignup,
    postSignup,
    getResetPassword,
    postResetPassword, getNewPassword, postNewPassword
} from "../controllers/auth.js";
import {User} from "../models/user.js";


const router = express.Router();

router.get('/login', getLogin);

router.get('/signup', getSignup);

router.post('/login', [
        body('email')
            .isEmail()
            .withMessage('Please enter a valid email address.'),
            // .normalizeEmail(),
        body('password', 'Password has to be valid.')
            .isLength({ min: 4 })
            .isAlphanumeric()
            .trim()
    ], postLogin);

router.post('/signup',[
        body('email')
            .isEmail()
            .withMessage('Please enter a valid email')
            .custom(async (value, {req}) => {
                // if (value === '1@gmail.com') {
                //     throw new Error('Please go and pray now . . .')
                // }
                // return true;
                const userDoc = await User.findOne({email: value});

                if (userDoc) {
                    return Promise.reject(`User with email '${userDoc.email}' already exist`);
                } else {
                    return userDoc;
                }
            }),
            // .normalizeEmail(),
        body('password', 'Password must contain only letters and number and be at least 5 characters')
            .isLength({min: 5})
            .isAlphanumeric()
            .trim(),
        body('confirmPassword')
            .trim()
            .custom((value, {req}) => {
                if (value !== req.body.password) {
                    throw new Error('Passwords must be identical')
                }
                return true;
            })
    ], postSignup);

router.post('/logout', postLogout);

router.get('/reset', getResetPassword);

router.post('/reset', postResetPassword);

router.get('/reset/:token', getNewPassword);

router.post('/new-password', postNewPassword);

export const authRoutes = router;
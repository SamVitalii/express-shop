import crypto from "crypto";

import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import sendGripTransport from "nodemailer-sendgrid-transport";

import {validationResult} from "express-validator";

import {User} from "../models/user.js";
import {errorHandle} from "./error.js";

const transporter = nodemailer.createTransport(sendGripTransport({
    auth: {
        api_key: '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'
    }
}))

export const getLogin = (req, res) => {
    let message = req.flash('error');
    message = message.length > 0 ? message[0] : null;

    res.render('auth/login', {
        pageTitle: 'Login',
        path: '/login',
        errorMessage: message,
        oldInput: {
            email: '',
            password: ''
        },
        validationErrors: []
    });
};

export const getSignup = (req, res) => {
    let message = req.flash('error');
    message = message.length > 0 ? message[0] : null;

    res.render('auth/signup', {
        path: '/signup',
        pageTitle: 'Sign Up',
        errorMessage: message,
        oldInput: {
            email: '',
            password: '',
            confirmPassword: ''
        },
        validationErrors: []
    });
};

export const postLogin = async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(422).render('auth/login', {
                path: '/login',
                pageTitle: 'Login',
                errorMessage: errors.array()[0].msg,
                oldInput: {
                    email: email,
                    password: password,
                    confirmPassword: req.body.confirmPassword
                },
                validationErrors: errors.array()
            });
        }

        const user = await User.findOne({email: email})

        if (!user) {
            return res.status(422).render('auth/login', {
                path: '/login',
                pageTitle: 'Login',
                errorMessage: 'Such user does not exist',
                oldInput: {
                    email: email,
                    password: password,
                },
                validationErrors: []
            });
        }
        const doMatch = await bcrypt.compare(password, user.password)

        if (doMatch) {
            req.session.isLoggedIn = true;
            req.session.user = user;
            res.redirect('/');
            console.log(`You have logged In by user: ${user.email}`)
            return await req.session.save();
        }
        return res.status(422).render('auth/login', {
            path: '/login',
            pageTitle: 'Login',
            errorMessage: 'Password is incorrect',
            oldInput: {
                email: email,
                password: password
            },
            validationErrors: []
        });

    } catch (e) {
        console.log(e);
        res.redirect('/login')
    }
}

export const postSignup = async (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).render('auth/signup', {
            path: '/signup',
            pageTitle: 'Sign Up',
            errorMessage: errors.array()[0].msg,
            oldInput: {
                email: email,
                password: password,
                confirmPassword: req.body.confirmPassword
            },
            validationErrors: errors.array()
        });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 12);

        const user = new User({
            email: email,
            password: hashedPassword,
            cart: {items: []}
        });

        await user.save();

        await transporter.sendMail({
            to: email,
            from: 'vitalii.samorodov@nure.ua',
            subject: 'Shop Sign Up succeeded',
            html: '<h1>You successfully Signed Up!</h1>'
        });

        res.redirect('/login');
    } catch (e) {
        errorHandle(e, next);
    }
};

export const postLogout = async (req, res, next) => {
    try {
        await req.session.destroy();

        res.redirect('/');
    } catch (e) {
        errorHandle(e, next);
    }
}

export const getResetPassword = (req, res) => {
    let message = req.flash('error');
    message = message.length > 0 ? message[0] : null;

    res.render('auth/reset-password', {
        path: '/reset',
        pageTitle: 'Reset Password',
        errorMessage: message
    });
}

export const postResetPassword = async (req, res, next) => {
    crypto.randomBytes(32, async (err, buffer) => {
        if (err) {
            console.log(err);
            return res.redirect('/reset');
        }
        const token = buffer.toString('hex');

        try {
            const user = await User.findOne({email: req.body.email});
            if (!user) {
                req.flash('error', `No account with email '${req.body.email}' found`);
                return res.redirect('/reset');
            }
            user.resetToken = token;
            user.resetTokenExpiration = Date.now() + 3600000;
            await user.save();

            res.redirect('/');

            transporter.sendMail({
                to: req.body.email,
                from: 'vitalii.samorodov@nure.ua',
                subject: 'Password reset',
                html: `
                    <p>You requsted a password reset</p>
                    <p>Click this <a href="http://localhost:3000/reset/${token}">link</a> to set a new password</p>
                `
            });

        } catch (e) {
            errorHandle(e, next);
        }
    });
}

export const getNewPassword = async (req, res) => {
    const token = req.params.token;
    const user = await User.findOne({resetToken: token, resetTokenExpiration: {$gt: Date.now()}});

    let message = req.flash('error');
    message = message.length > 0 ? message[0] : null;

    res.render('auth/new-password', {
        path: '/new-password',
        pageTitle: 'New Password',
        errorMessage: message,
        userId: String(user._id),
        passwordToken: token
    });
}

export const postNewPassword = async (req, res, next) => {
    try {
        const newPassword = req.body.password;
        const userId = req.body.userId;
        const passwordToken = req.body.passwordToken;

        const user = await User.findOne({
            resetToken: passwordToken,
            resetTokenExpiration: {$gt: Date.now()},
            _id: userId
        });

        user.password = await bcrypt.hash(newPassword, 12);
        user.resetToken = undefined;
        user.resetTokenExpiration = undefined;

        await user.save();

        res.redirect('/login');
    } catch (e) {
        errorHandle(e, next);
    }

}
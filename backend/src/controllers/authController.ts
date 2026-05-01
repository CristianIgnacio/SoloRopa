import { Request, Response, NextFunction, CookieOptions } from 'express';
import UserModel from "../models/User"
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import config from '../utils/config';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(config.GOOGLE_CLIENT_ID);

const cookieSameSite: CookieOptions["sameSite"] = config.COOKIE_SAME_SITE;

const buildSessionCookieOptions = (): CookieOptions => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production" || cookieSameSite === "none",
  sameSite: cookieSameSite,
  maxAge: 60 * 60 * 1000,
  path: "/",
});

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, password } = req.body;
    const user = await UserModel.findOne({ username }).select("+password");

    if (user) {
      if (!user.password) {
        return res.status(401).json({error: "Esta cuenta está vinculada a Google. Usa el inicio de sesión con Google."});
      }

      const passwordCorrect = await bcrypt.compare(password, user.password);
      
      if (!passwordCorrect) {
        res.status(401).json({error: "invalid username or password",});
      } else {
        const userForToken = {
          username: user.username,
          csrf: crypto.randomUUID(),
          id: user._id,
        };

        const token = jwt.sign(userForToken, config.JWT_SECRET, { expiresIn:  60 * 60 });
        res.setHeader("X-CSRF-Token", userForToken.csrf);
        res.cookie("token", token, buildSessionCookieOptions());

        res.status(200).send({ id: user.id, username: user.username, role : user.role, avatarUrl : user.avatarUrl  });
      }
    } else {
      res.status(401).json({error: "invalid username or password"});
    }
  } catch (error) {
    next(error);
  }
};

export const googleLogin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token } = req.body;

    // Verify token with Google
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: config.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      return res.status(401).json({ error: "Invalid Google token" });
    }

    const { sub: googleId, email, name, picture } = payload;

    if (!email) {
      return res.status(400).json({ error: "No email found in Google payload" });
    }

    // Check if user exists by email or googleId
    let user = await UserModel.findOne({
      $or: [{ email }, { googleId }]
    });

    if (user) {
      // If user exists but doesn't have googleId, update it
      if (!user.googleId) {
        user.googleId = googleId;
        // Optionally update avatar if they don't have one
        // if (!user.avatarUrl && picture) {
        //   user.avatarUrl = picture;
        // }
        await user.save();
      }
    } else {
      // Create new user
      // Generate a unique username from the name
      const baseUsername = name ? name.replace(/\s+/g, '').toLowerCase() : email.split('@')[0];
      let newUsername = baseUsername;
      let counter = 1;
      
      while (await UserModel.findOne({ username: newUsername })) {
        newUsername = `${baseUsername}${counter}`;
        counter++;
      }

      user = new UserModel({
        username: newUsername,
        email: email,
        googleId: googleId,
        // avatarUrl: picture,
      });

      await user.save();
    }

    const userForToken = {
      username: user.username,
      csrf: crypto.randomUUID(),
      id: user._id,
    };

    const jwtToken = jwt.sign(userForToken, config.JWT_SECRET, { expiresIn:  60 * 60 });
    res.setHeader("X-CSRF-Token", userForToken.csrf);
    res.cookie("token", jwtToken, buildSessionCookieOptions());

    res.status(200).send({ id: user.id, username: user.username, role: user.role, avatarUrl: user.avatarUrl });
  } catch (error) {
    next(error);
  }
};


export const getCurrentUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await UserModel.findById(req.userId);
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

export const logout = async (req: Request, res: Response) => {
  res.clearCookie("token", buildSessionCookieOptions());
  res.status(200).send({
    message: "Logged out successfully"
  });
};

const sendResetEmail = async (email: string, token: string) => {
  // Generamos una cuenta de pruebas on-the-fly de Ethereal para evitar
  // que credenciales antiguas expiren y tiren error 500.
  const testAccount = await nodemailer.createTestAccount();

  const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: testAccount.user,
      pass: testAccount.pass
    }
  });

  const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/reset-password/${token}`;

  const info = await transporter.sendMail({
    from: '"SoloRopa Soporte" <soporte@soloropa.com>',
    to: email,
    subject: "Recuperación de contraseña",
    text: `Solicitaste restablecer tu contraseña. Ingresa al siguiente enlace: ${resetUrl}`,
    html: `<p>Solicitaste restablecer tu contraseña. Ingresa al siguiente enlace para crear una nueva:</p>
           <a href="${resetUrl}">${resetUrl}</a><br/>
           <p>Este enlace expirará en 1 hora.</p>`
  });

  console.log("Mensaje enviado: %s", info.messageId);
  console.log("URL previsualización del correo: %s", nodemailer.getTestMessageUrl(info));
};

export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;
    const user = await UserModel.findOne({ email }).select("+resetPasswordToken +resetPasswordExpires");

    if (!user) {
      return res.status(200).json({ message: "Si el correo está registrado, se enviará un enlace de recuperación." });
    }

    // Generar un token aleatorio seguro
    const token = crypto.randomBytes(32).toString('hex');
    const hashedToken = await bcrypt.hash(token, 10);

    // Guardarlo en BD con 1 hora de expiración
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hora
    await user.save();

    await sendResetEmail(user.email, token);

    res.status(200).json({ message: "Si el correo está registrado, se enviará un enlace de recuperación." });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    // Buscar usuarios que tengan un token que no haya expirado
    const users = await UserModel.find({
      resetPasswordExpires: { $gt: Date.now() }
    }).select("+password +resetPasswordToken +resetPasswordExpires");

    let foundUser = null;
    for (const user of users) {
      if (user.resetPasswordToken) {
        const isMatch = await bcrypt.compare(token, user.resetPasswordToken);
        if (isMatch) {
          foundUser = user;
          break;
        }
      }
    }

    if (!foundUser) {
      return res.status(400).json({ error: "Token inválido o expirado" });
    }

    // Hashear nueva contraseña
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    foundUser.password = passwordHash;
    // Limpiar tokens
    foundUser.resetPasswordToken = undefined;
    foundUser.resetPasswordExpires = undefined;

    await foundUser.save();

    res.status(200).json({ message: "Contraseña actualizada correctamente" });
  } catch (error) {
    next(error);
  }
};

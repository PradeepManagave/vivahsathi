import axios from 'axios';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../../config/index';
import { db } from '../../config/database';
import { AppError } from '../utils/errors';
import logger from '../../config/logger';

interface GoogleUser {
  sub: string;
  email: string;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
}

interface FacebookUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  picture: { data: { url: string } };
}

export class SocialAuthService {
  async verifyGoogleToken(accessToken: string): Promise<GoogleUser> {
    if (!config.GOOGLE_CLIENT_ID) throw new AppError('Google login not configured', 501);
    try {
      const { data } = await axios.get<GoogleUser>('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      return data;
    } catch {
      throw new AppError('Invalid Google token', 401);
    }
  }

  async verifyFacebookToken(accessToken: string): Promise<FacebookUser> {
    if (!config.FACEBOOK_APP_ID) throw new AppError('Facebook login not configured', 501);
    try {
      const { data } = await axios.get<FacebookUser>('https://graph.facebook.com/me', {
        params: { fields: 'id,email,first_name,last_name,picture', access_token: accessToken },
      });
      return data;
    } catch {
      throw new AppError('Invalid Facebook token', 401);
    }
  }

  async findOrCreateUser(provider: 'google' | 'facebook', profile: GoogleUser | FacebookUser, ip: string) {
    const socialId = provider === 'google' ? (profile as GoogleUser).sub : (profile as FacebookUser).id;
    const email = provider === 'google' ? (profile as GoogleUser).email : (profile as FacebookUser).email;
    const firstName = provider === 'google' ? (profile as GoogleUser).given_name : (profile as FacebookUser).first_name;
    const lastName = provider === 'google' ? (profile as GoogleUser).family_name : (profile as FacebookUser).last_name;
    const photoUrl = provider === 'google' ? (profile as GoogleUser).picture : (profile as FacebookUser).picture?.data?.url;

    if (!email) throw new AppError('Email required from social provider', 400);

    const existing = await db('users').where({ email }).first();
    if (existing) {
      await db('users').where({ id: existing.id }).update({
        updatedAt: db.fn.now(),
      });
      return existing;
    }

    const userId = uuidv4();
    await db('users').insert({
      id: userId,
      email,
      firstName,
      lastName,
      isEmailVerified: true,
      socialProvider: provider,
      socialId,
      role: 'member',
      status: 'active',
      ipAddress: ip,
      createdAt: db.fn.now(),
      updatedAt: db.fn.now(),
    });

    if (photoUrl) {
      await db('profile_photos').insert({
        id: uuidv4(),
        userId,
        url: photoUrl,
        isPrimary: true,
        createdAt: db.fn.now(),
      });
    }

    logger.info(`Social user created via ${provider}: ${email}`);
    return { id: userId, email, firstName, lastName, role: 'member', status: 'active' };
  }

  async socialLogin(provider: 'google' | 'facebook', accessToken: string, ip: string) {
    const profile = provider === 'google'
      ? await this.verifyGoogleToken(accessToken)
      : await this.verifyFacebookToken(accessToken);

    const user = await this.findOrCreateUser(provider, profile, ip);

    const accessTokenJwt = jwt.sign(
      { userId: user.id, role: user.role },
      config.JWT_SECRET,
      { expiresIn: config.JWT_EXPIRES_IN as any }
    );

    const refreshToken = uuidv4();
    await db('refresh_tokens').insert({
      id: uuidv4(),
      userId: user.id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      createdAt: db.fn.now(),
    });

    await db('user_sessions').insert({
      id: uuidv4(),
      userId: user.id,
      token: accessTokenJwt,
      ipAddress: ip,
      userAgent: 'Social Login',
      createdAt: db.fn.now(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    return { user, accessToken: accessTokenJwt, refreshToken };
  }
}

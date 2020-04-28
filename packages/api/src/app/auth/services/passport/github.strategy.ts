import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import * as githubPassport from 'passport-github';
import { AuthService } from '../auth.service';
import { Request } from 'express';
import { Metadata, StateStoreStoreCallback, StateStoreVerifyCallback } from 'passport-oauth2';
import { AuthProviderEnum } from '@nest-starter/shared';

@Injectable()
export class GithubStrategy extends PassportStrategy(githubPassport.Strategy, 'github') {
  constructor(
    private authService: AuthService
  ) {
    super({
      clientID: process.env.GITHUB_OAUTH_CLIENT_ID,
      clientSecret: process.env.GITHUB_OAUTH_CLIENT_SECRET,
      callbackURL: process.env.GITHUB_OAUTH_REDIRECT,
      passReqToCallback: true,
      store: {
        verify(req: any, state: string, meta: Metadata, callback: StateStoreVerifyCallback) {
          callback(null, true, req.query.distinctId);
        },
        store(req: any, meta: Metadata, callback: StateStoreStoreCallback) {
          callback(null, req.query.distinctId);
        }
      }
    });
  }

  async validate(req, accessToken: string, refreshToken: string, profile, done: (err: any, data: any) => void) {
    try {
      const response = await this.authService.authenticate(
        AuthProviderEnum.GITHUB,
        accessToken,
        refreshToken,
        profile._json,
        req.query.state
      );

      done(null, {
        token: response.token,
        newUser: response.newUser
      });
    } catch (err) {
      done(err, false);
    }
  }

}

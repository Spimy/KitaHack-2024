import { firestore } from 'firebase-admin';
import { UserProfile } from '../../shared/src/types/user';

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PORT: string;
      CORS: string;
      FIREBASE_TYPE: string;
      FIREBASE_PROJECT_ID: string;
      FIREBASE_PRIVATE_KEY_ID: string;
      FIREBASE_PRIVATE_KEY: string;
      FIREBASE_CLIENT_EMAIL: string;
      FIREBASE_CLIENT_ID: string;
      FIREBASE_AUTH_URI: string;
      FIREBASE_TOKEN_URI: string;
      FIREBASE_AUTH_PROVIDER_CERT_URL: string;
      FIREBASE_CLIENT_CERT_URL: string;
      FIREBASE_UNIVERSE_DOMAIN: string;
    }
  }
  namespace Express {
    interface Request {
      user: {
        uid: string;
        email: string;
        emailVerified: boolean;
        profile: UserProfile;
      };
    }
  }

  type GenericDocument<T> = firestore.QueryDocumentSnapshot<
    T,
    firestore.DocumentData
  >;
}

export {};

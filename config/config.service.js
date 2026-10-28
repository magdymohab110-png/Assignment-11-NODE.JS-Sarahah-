import {config} from "dotenv"
import {resolve} from "node:path"

const NODE_ENV = process.env.NODE_ENV;

const envPath = {
    development : ".env.development",
    production : ".env.production"
}
config({path : resolve(`config/${envPath[NODE_ENV]}`)});

export const PORT = process.env.PORT;


export const OTP_MAX_EMAIL = +process.env.OTP_MAX_EMAIL; // 60 * 5 (5 mins)
export const OTP_BLOCK_SENDEMAIL = +process.env.OTP_BLOCK_SENDEMAIL; // 60 * 10 (10 mins)

export const OTP_EMAIL = +process.env.OTP_EMAIL;

export const OTP_BLOCK_SIGNIN = +process.env.OTP_BLOCK_SIGNIN;

// hash
export const SALT_ROUNDS = +process.env.SALT_ROUNDS;

// signture and expire of access token and refresh token
export const ACCESS_TOKEN_SIGNTURE = process.env.ACCESS_TOKEN_SIGNTURE;
export const ACCESS_TOKEN_EXP = +process.env.ACCESS_TOKEN_EXP; // 60 * 5 (5 mins)
export const REFRESH_TOKEN_SIGNTURE = process.env.REFRESH_TOKEN_SIGNTURE;
export const REFRESH_TOKEN_EXP = +process.env.REFRESH_TOKEN_EXP; // 60 * 60 * 24 (1 day)

// sign up with google
export const AUDIENCE_GMAIL = process.env.AUDIENCE_GMAIL;

// multer.js
export const UPLOAD_FOLDER = process.env.UPLOAD_FOLDER;

// encrypt.js
export const IV_LENGTH = +process.env.IV_LENGTH;
export const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;

// sendEmail.js
export const EMAIL = process.env.EMAIL;
export const PASSWORD = process.env.PASSWORD;

// for db
export const DB_URI = process.env.DB_URI;
export const REDIS_URI = process.env.REDIS_URI;

// allow origins
export const ALLOWORIGINS = process.env.ALLOWORIGINS.split(",");


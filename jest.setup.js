import { TextEncoder, TextDecoder } from "util";
import 'setimmediate';
import dotenv from 'dotenv';

dotenv.config({
  path: process.env.NODE_ENV === 'testing' ? '.env.test' : '.env'
});

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

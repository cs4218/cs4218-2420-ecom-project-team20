import { TextEncoder, TextDecoder } from "util";
import 'setimmediate';

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
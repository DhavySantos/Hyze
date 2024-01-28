import Client from "./classes/client";
import Path from 'node:path';
import Fs from 'node:fs';
import "dotenv/config";

if(!Fs.existsSync(Path.resolve(__dirname, 'temp')))
    Fs.mkdirSync(Path.resolve(__dirname, 'temp'));

new Client();
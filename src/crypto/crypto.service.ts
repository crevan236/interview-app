import { Injectable } from '@nestjs/common';
import { createReadStream } from 'fs';
import { normalize, join, resolve } from 'path';
import { Stream } from 'stream';
import { KeyPair } from './crypto.interfaces';
import { RSATransform } from './transform/rsa-transform';
import * as NodeRSA from 'node-rsa';
import { privateExportType, publicExportType } from './crypto.consts';

const FILE_PATH = '/src/crypto/data';
const FILE = '/sample.pdf';

@Injectable()
export class CryptoService {
  async generateKeyPair(): Promise<KeyPair> {
    const keyPair = new NodeRSA({ b: 2048 });
    const privateKey = keyPair.exportKey(privateExportType);
    const publicKey = keyPair.exportKey(publicExportType);

    return {
      privKey: privateKey,
      pubKey: publicKey,
    };
  }

  serveFile(publicKey: string): Stream {
    return createReadStream(CryptoService.getFilePath()).pipe(
      new RSATransform(publicKey),
    );
  }

  private static getFilePath(): string {
    return normalize(join(resolve('./'), FILE_PATH, FILE));
  }

  /*
  private static async streamDryRun() {
    const keyPair = new NodeRSA({ b: 2048 });
    const privateKey = keyPair.exportKey('pkcs1-der');
    const publicKey = keyPair.exportKey('pkcs8-public-der');

    const decodeTransform = (chunk, encoding, callback) => {
      const buffer = Buffer.from(chunk, 'base64');
      const key = new NodeRSA().importKey(privateKey, 'pkcs1-der');

      const decodedData = key.decrypt(buffer.toString('utf8'), 'utf8');
  
      callback(null, decodedData);
    };
    const encodePath = normalize(
      join(__dirname, '../../../crypto-results/', 'encoded'),
    );
    const decodePath = normalize(
      join(__dirname, '../../../crypto-results/', 'decoded.pdf'),
    );
    const readedFile = createReadStream(
      normalize(join(resolve('./'), FILE_PATH, 'sample.pdf')),
    );
    readedFile
      .pipe(new RSATransform(publicKey))
      .pipe(createWriteStream(encodePath));

    setTimeout(() => {
      createReadStream(encodePath, { encoding: 'utf-8' })
        .pipe(new Transform({ transform: decodeTransform }))
        .pipe(createWriteStream(decodePath));
    }, 3000);
  }
  */
}

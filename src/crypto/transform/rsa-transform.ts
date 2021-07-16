import { Transform } from 'stream';
import * as NodeRSA from 'node-rsa';
import { publicExportType } from '../crypto.consts';

const makeEncodeTransform = (publicKey: string) => {
  return (chunk, encoding, callback) => {
    const buffer = Buffer.from(chunk);
    const key = new NodeRSA().importKey(publicKey, publicExportType);
    const encodedData = key.encrypt(buffer);

    callback(null, encodedData.toString('base64'));
  };
};

export class RSATransform extends Transform {
  constructor(publicKey: string) {
    super({ transform: makeEncodeTransform(publicKey) });
  }
}

import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { CryptoUtil } from 'src/common/libs/crypto/CryptoUtil';
import { TEnvironmentFile } from 'src/common/my-config-service.type';

@Injectable()
export class AES256Provider implements OnModuleInit {
    // 암호화 키
    private KEY = Buffer.from(CryptoUtil.getRandomHexString(32), 'utf-8');

    // 초기화 벡터(initialization vector), 첫 블록을 암호화할 때 사용되는 값
    private IV = Buffer.from(CryptoUtil.getRandomHexString(32), 'hex');
    private AUTH_TAG_LENGTH = 16;

    public static ALGORITHM = <crypto.CipherCCMTypes>'aes-256-gcm';

    constructor(
        private readonly configService: ConfigService<TEnvironmentFile>,
    ) {}

    /**
     * 멤버 초기화
     */
    onModuleInit() {
        const tempStorage: Record<'KEY' | 'IV', string> = {
            KEY: this.KEY.toString('utf-8'),
            IV: this.IV.toString('utf-8'),
        };

        const KEY =
            this.configService.getOrThrow<string>('AES_256_KEY') ||
            tempStorage.KEY;
        const IV =
            this.configService.getOrThrow<string>('AES_256_IV') ||
            tempStorage.IV;

        this.KEY = Buffer.from(KEY, 'utf-8');
        this.IV = Buffer.from(IV, 'hex');
    }

    public convert = (from, to) => (str) => Buffer.from(str, from).toString(to);
    public utf8ToHex = this.convert('utf8', 'hex');
    public hexToUtf8 = this.convert('hex', 'utf8');

    /**
     * 암호화
     */
    public encrypt(secretMessage: string): string;
    public encrypt(secretMessage: string | Buffer): string {
        let secret: Buffer;

        if (typeof secretMessage === 'string') {
            secret = Buffer.from(secretMessage, 'utf-8');
        } else {
            secret = secretMessage;
        }

        const cipher = crypto.createCipheriv(
            AES256Provider.ALGORITHM,
            this.KEY,
            this.IV,
            {
                authTagLength: this.AUTH_TAG_LENGTH,
            },
        );
        const encryptedData = Buffer.concat([
            cipher.update(secret),
            cipher.final(),
            cipher.getAuthTag(),
        ]);

        return encryptedData.toString('hex');
    }

    /**
     * 복호화
     */
    public decrypt(encryptedData: string): string;
    public decrypt(encryptedData: Buffer | string): string {
        // hex 값을 Buffer 변환합니다.
        encryptedData =
            typeof encryptedData === 'string'
                ? Buffer.from(encryptedData, 'hex')
                : encryptedData;

        const dataToDecrypt = encryptedData.slice(
            0,
            encryptedData.length - this.AUTH_TAG_LENGTH,
        );
        const authTag = encryptedData.slice(
            encryptedData.length - this.AUTH_TAG_LENGTH,
            encryptedData.length,
        );

        const decipher = crypto.createDecipheriv(
            AES256Provider.ALGORITHM,
            this.KEY,
            this.IV,
            {
                authTagLength: this.AUTH_TAG_LENGTH,
            },
        );
        decipher.setAuthTag(authTag);

        const decryptedData = Buffer.concat([
            decipher.update(dataToDecrypt),
            decipher.final(),
        ]);

        return decryptedData.toString('utf-8');
    }
}

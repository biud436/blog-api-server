import { CryptoUtil } from 'src/common/libs/crypto/CryptoUtil';

namespace EnvModuleEntryPoint {
    /**
     * @private
     * @class EnvFileBuilder
     */
    class EnvFileBuilder {
        /**
         * 액세스 토큰의 비밀번호(secret)를 새로 발급합니다.
         * @returns
         */
        public issueTokenSecret() {
            const secret = this.generateSecret();
            return secret;
        }

        /**
         * 새로고침 토큰의 비밀번호(secret)를 새로 발급합니다.
         * @returns
         */
        public issueRefreshTokenSecret() {
            const secret = this.generateSecret();
            return secret;
        }

        private generateSecret() {
            return CryptoUtil.getRandomHexString(32);
        }
    }

    /** @public */
    export const envFileBuilder = new EnvFileBuilder();
}

export = EnvModuleEntryPoint;

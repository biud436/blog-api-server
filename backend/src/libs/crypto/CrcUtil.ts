import crc from 'crc';

export namespace CRC32 {
    export function getChecksum(content: string): string {
        return crc.crc32(content).toString(16);
    }
}

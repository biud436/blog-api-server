import { HttpException, InternalServerErrorException } from '@nestjs/common';

class RaiseConditionError extends HttpException {
    constructor() {
        super(
            HttpException.createBody(
                '경쟁 조건이 발생하였습니다.',
                'RAISE_CONDITION_ERROR',
                700,
            ),
            700,
        );
    }
}
class StageError extends Error {}
class ProgramError extends Error {}
class YoutubeError extends Error {}

function errorInterceptor<T extends Error = Error>(e: T) {
    if (e instanceof RaiseConditionError) {
        console.log(
            'RaiseConditionError:%s [%d]',
            e.getResponse(),
            e.getStatus(),
        );
    } else if (e instanceof StageError) {
        console.log('StageError');
    } else if (e instanceof ProgramError) {
        console.log('ProgramError');
    } else {
        console.log(e.message);
    }
}

describe('오류 테스트', () => {
    it('RaiseConditionError', () => {
        try {
            throw new RaiseConditionError();
        } catch (e: any) {
            errorInterceptor(e);
        }
    });
    it('StageError', () => {
        try {
            throw new StageError('오류 발생');
        } catch (e: any) {
            errorInterceptor(e);
        }
    });
    it('ProgramError', () => {
        try {
            throw new ProgramError('오류 발생');
        } catch (e: any) {
            errorInterceptor(e);
        }
    });
    it('OtherError', () => {
        try {
            throw new YoutubeError('오류 발생');
        } catch (e: any) {
            errorInterceptor(e);
        }
    });
});

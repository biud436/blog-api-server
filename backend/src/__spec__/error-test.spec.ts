class RaiseConditionError extends Error {}
class StageError extends Error {}
class ProgramError extends Error {}
class YoutubeError extends Error {}

describe('오류 테스트', () => {
    it('RaiseConditionError', () => {
        try {
            throw new RaiseConditionError('오류 발생');
        } catch (e: any) {
            if (e instanceof RaiseConditionError) {
                console.log('RaiseConditionError');
            } else if (e instanceof StageError) {
                console.log('StageError');
            } else if (e instanceof ProgramError) {
                console.log('ProgramError');
            } else {
                console.log(e.message);
            }
        }
    });
    it('StageError', () => {
        try {
            throw new StageError('오류 발생');
        } catch (e: any) {
            if (e instanceof RaiseConditionError) {
                console.log('RaiseConditionError');
            } else if (e instanceof StageError) {
                console.log('StageError');
            } else if (e instanceof ProgramError) {
                console.log('ProgramError');
            } else {
                console.log(e.message);
            }
        }
    });
    it('ProgramError', () => {
        try {
            throw new ProgramError('오류 발생');
        } catch (e: any) {
            if (e instanceof RaiseConditionError) {
                console.log('RaiseConditionError');
            } else if (e instanceof StageError) {
                console.log('StageError');
            } else if (e instanceof ProgramError) {
                console.log('ProgramError');
            } else {
                console.log(e.message);
            }
        }
    });
    it('OtherError', () => {
        try {
            throw new YoutubeError('오류 발생');
        } catch (e: any) {
            if (e instanceof RaiseConditionError) {
                console.log('RaiseConditionError');
            } else if (e instanceof StageError) {
                console.log('StageError');
            } else if (e instanceof ProgramError) {
                console.log('ProgramError');
            } else {
                console.log(e.message);
            }
        }
    });
});

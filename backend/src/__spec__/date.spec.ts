describe('날짜 변환 테스트', () => {
    it('정수 타입으로 변환', () => {
        expect((220509224700 / 10000000000) % 100 >> 0).toBe(22);
        expect((220509224700 / 100000000) % 100 >> 0).toBe(5);
        expect((220509224700 / 1000000) % 100 >> 0).toBe(9);
        expect((220509224700 / 10000) % 100 >> 0).toBe(22);
        expect((220509224700 / 100) % 100 >> 0).toBe(47);
        expect((220509224700 / 1) % 100 >> 0).toBe(0);
    });

    it('정수 타입으로 변환하는 경우', () => {
        let target = parseInt('220509224700');
        if (isNaN(target)) {
            throw new Error('날짜 타입이 잘못되었습니다');
        }
        let max = 10000000000;
        let ret = [];

        for (let i = 0; i < 6; i++) {
            ret.push((target / max) % 100 >> 0);

            max = max / 100;
        }

        expect(ret).toEqual([22, 5, 9, 22, 47, 0]);
    });

    it('잘못된 데이터가 있을 경우', () => {
        let target = parseInt('ff0509224700');
        if (isNaN(target)) {
            throw new Error('날짜 타입이 잘못되었습니다');
        }
        let max = 10000000000;
        let ret = [];

        for (let i = 0; i < 6; i++) {
            ret.push((target / max) % 100 >> 0);
            max = max / 100;
        }

        expect(ret).toEqual([NaN, 5, 9, 22, 47, 0]);
    });

    it('연도가 잘못되었을 경우', () => {
        let target = parseInt('000509224700');
        if (isNaN(target)) {
            throw new Error('날짜 타입이 잘못되었습니다');
        }
        let max = 10000000000;
        let ret = [];

        for (let i = 0; i < 6; i++) {
            ret.push((target / max) % 100 >> 0);
            max = max / 100;
        }

        expect(ret).toEqual([22, 5, 9, 22, 47, 0]);
    });

    it('날짜 범위 제한 (잘못된 데이터)', () => {
        const validator = {
            YAER: { min: 0, max: 99 },
            MONTH: { min: 1, max: 12 },
            DAY: { min: 1, max: 31 },
            HOUR: { min: 0, max: 23 },
            MINUTE: { min: 0, max: 59 },
            SECOND: { min: 0, max: 59 },
        };

        let target = parseInt('221432889999');
        if (isNaN(target)) {
            throw new Error('날짜 타입이 잘못되었습니다');
        }
        let max = 10000000000;
        let ret = [];

        for (let i = 0; i < 6; i++) {
            const value = (target / max) % 100 >> 0;
            const key = Object.keys(validator)[i];
            const limit = validator[key];
            const n = limit.max + 1;
            const retValue = ((value % n) + n) % n;
            ret.push(Math.min(Math.max(retValue, limit.min), limit.max));
            max = max / 100;
        }

        expect(ret).toEqual([22, 1, 1, 16, 39, 39]);
    });

    it('날짜 범위 제한 (옳은 데이터)', () => {
        const validator = {
            YAER: { min: 0, max: 99 },
            MONTH: { min: 1, max: 12 },
            DAY: { min: 1, max: 31 },
            HOUR: { min: 0, max: 23 },
            MINUTE: { min: 0, max: 59 },
            SECOND: { min: 0, max: 59 },
        };

        let target = parseInt('220509235800');
        if (isNaN(target)) {
            throw new Error('날짜 타입이 잘못되었습니다');
        }
        let max = 10000000000;
        let ret = [];

        for (let i = 0; i < 6; i++) {
            const value = (target / max) % 100 >> 0;
            const key = Object.keys(validator)[i];
            const limit = validator[key];
            const n = limit.max + 1;
            const retValue = ((value % n) + n) % n;
            ret.push(Math.min(Math.max(retValue, limit.min), limit.max));
            max = max / 100;
        }

        expect(ret).toEqual([22, 5, 9, 23, 58, 0]);
    });
});

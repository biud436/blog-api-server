/**
 * @class EmptyTransactionScanner
 */
export class EmptyTransactionScanner {
    isGlobalLock() {
        return false;
    }

    globalLock() {}
    globalUnlock() {}

    getTxEntityManager() {
        return undefined;
    }

    getTxQueryRunner() {
        return undefined;
    }
}

/**
 * @description Pagination Get 전략
 */
export enum PaginationGetStrategy {
    /**
     * 실행된 SQL의 결과 RAW 데이터를 특정한 엔티티에 매핑하여 반환합니다.
     */
    GET_MANY = 'getMany',
    /**
     * 실행된 SQL의 결과 RAW 데이터를 특정한 엔티티에 매핑하지 않고 그대로 반환합니다.
     */
    GET_RAW_MANY = 'getRawMany',
}

export enum PaginationStrategy {
    /**
     * offset, limit 방식의 페이지네이션을 지원합니다.
     *
     * 일부 데이터베이스에서는 offset, limit 방식의 페이지네이션을 지원하지 않습니다.
     * 이 경우에는 SKIP 전략을 사용해야 합니다.
     *
     * UI/UX 특징상 오프셋 방식을 사용할 수 밖에 없을 때가 많습니다.
     * 이때, 조회 속도를 높이려면 커버링 인덱스를 사용해야 합니다.
     */
    OFFSET = 'offset',
    /**
     * 일부 데이터베이스에서는 offset, limit 방식의 페이지네이션을 지원하지 않습니다.
     * 따라서 이런 경우, SKIP 전략이 권장됩니다.
     * SKIP 전략을 사용하면 WHERE IN 절로 실행됩니다.
     */
    SKIP = 'skip',

    /**
     * 커서 방식의 페이지네이션
     * 아직 구현되지 않았습니다.
     *
     * @deprecated
     */
    CURSOR = 'cursor',
}

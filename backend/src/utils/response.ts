import { HttpStatus, Injectable } from '@nestjs/common';
import { IResponse } from './response.interface';

export const MESSAGE_KEY = {
    READ_SUCCESS: '데이터 조회 성공',
    SAVE_SUCCESS: '데이터 저장 성공',
    LOGOUT_SUCCESS: '로그아웃 성공',
    UPDATE_SUCCESS: '업데이트 성공',
    UPDATE_FAIL: '데이터 수정 실패',
    DELETE_SUCCESS: '삭제 성공',
    LOGIN_SUCCESS: '로그인 성공',
    NULL_VALUE: '값이 없습니다',
    WRONG_PARAMS: '잘못된 값입니다.',
    ALREADY_USER: '이미 존재하는 유저입니다.',
    NULL_USER: '존재하지 않는 유저입니다.',
    EXPIRED_TOKEN: '이미 만료된 토큰입니다.',
    INVALID_TOKEN: '유효하지 않은 토큰입니다.',
    EMPTY_TOKEN: '토큰 값이 비어있습니다.',
    INVALID_ID: '유효하지 않은 ID 값입니다.',
    INVALID_PASSWORD: '잘못된 비밀번호를 입력하였습니다.',
    INTERNAL_SERVER_ERROR: '서버 내부 오류입니다.',
    FAILED_SIGNUP: '회원 가입에 실패하였습니다.',
    SUCCESS_SIGNUP: '회원 가입이 완료되었습니다',
    NOT_FOUND_RESULT: '결과가 존재하지 않습니다',
};

export type MessageId = keyof typeof MESSAGE_KEY;

// enum 확장 (타입스크립트에는 enum extends가 아직까진 없다)
const CustomHttpStatus = {
    ...HttpStatus,
    EXPIRED_TOKEN: 600,
    UNAUTHORIZED_TOKEN: 601,
    NO_INPUT_TOKEN: 602,
    INCORRECT_ID: 701,
    INCORRECT_PASSWORD: 702,
};

export const RESPONSE_MESSAGE: Record<MessageId, IResponse> = {
    // CRUD
    READ_SUCCESS: {
        message: '데이터 조회 성공',
        statusCode: HttpStatus.OK,
    },
    LOGOUT_SUCCESS: {
        message: '로그아웃 성공',
        statusCode: HttpStatus.OK,
    },
    SAVE_SUCCESS: {
        message: '데이터 저장 성공',
        statusCode: HttpStatus.CREATED,
    },
    UPDATE_SUCCESS: {
        message: '데이터 수정 성공',
        statusCode: HttpStatus.NO_CONTENT,
    },
    UPDATE_FAIL: {
        message: '데이터 수정 실패',
        statusCode: HttpStatus.BAD_REQUEST,
    },
    DELETE_SUCCESS: {
        message: '데이터 삭제 성공',
        statusCode: HttpStatus.NO_CONTENT,
    },
    LOGIN_SUCCESS: {
        message: '로그인 성공',
        statusCode: HttpStatus.NO_CONTENT,
    },
    NULL_VALUE: {
        message:
            'Params나 Body 중 필수적으로 입력해야 하는 값인데, 입력하지 않은 값(NULL)이 존재합니다.',
        statusCode: HttpStatus.BAD_REQUEST,
        error: 'Bad Request',
    },
    WRONG_PARAMS: {
        message:
            'Params나 Body에 잘못된 값이 입력되어서 조회(or 쓰기 or 수정 or 삭제)할 데이터가 없습니다.',
        statusCode: HttpStatus.UNAUTHORIZED,
        error: '[CUSTOM] Unauthorized',
    },
    ALREADY_USER: {
        message: '이미 등록된 사용자입니다.',
        statusCode: HttpStatus.PAYMENT_REQUIRED,
        error: '[CUSTOM] Payment Required',
    },
    NULL_USER: {
        message: '존재하지 않는 사용자입니다.',
        statusCode: HttpStatus.FORBIDDEN,
        error: 'Forbidden',
    },
    EXPIRED_TOKEN: {
        message: '토큰이 만료되었습니다.',
        statusCode: CustomHttpStatus.EXPIRED_TOKEN,
        error: 'Unauthorized',
    },
    INVALID_TOKEN: {
        message: '유효하지 않은 토큰입니다.',
        statusCode: CustomHttpStatus.UNAUTHORIZED_TOKEN,
        error: 'Unauthorized',
    },
    EMPTY_TOKEN: {
        message: '입력된 토큰이 없습니다.',
        statusCode: CustomHttpStatus.NO_INPUT_TOKEN,
        error: 'Unauthorized',
    },
    INVALID_ID: {
        message: '아이디가 일치하지 않습니다.',
        statusCode: CustomHttpStatus.INCORRECT_ID,
        error: 'Unauthorized',
    },
    INVALID_PASSWORD: {
        message: '비밀번호가 일치하지 않습니다.',
        statusCode: CustomHttpStatus.INCORRECT_PASSWORD,
        error: 'Unauthorized',
    },
    INTERNAL_SERVER_ERROR: {
        message: '서버 측에서 발생한 에러입니다.',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        error: 'Internal Server Error!',
    },

    NOT_FOUND_RESULT: {
        message: '기록이 존재하지 않습니다.',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
    },
    FAILED_SIGNUP: {
        message: '회원가입에 실패하였습니다',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
    },
    SUCCESS_SIGNUP: {
        message: '회원가입에 성공하였습니다',
        statusCode: HttpStatus.CREATED,
    },
};

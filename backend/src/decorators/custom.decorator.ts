import { applyDecorators, UseGuards } from '@nestjs/common';
import {
  ApiBadGatewayResponse,
  ApiBadRequestResponse,
  ApiBasicAuth,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/controllers/auth/guards/jwt-auth.guard';
import { Role } from './role.enum';
import { Roles } from './roles.decorator';

//=====================================================================
// API DOCS
//=====================================================================
type ApiOperationData = {
  summary: string;
  description: string;
  requestBody?: any;
};
type ApiOkResponseDescriptor = {
  operation: ApiOperationData;
  description: string;
  auth?: boolean;
  basicAuth?: boolean;
  requestBody?: any;
  type?: any;
  schema?: any;
};

/**
 * 스웨거 문서를 생성합니다.
 *
 * @param option
 * @returns
 */
export function CustomApiOkResponse(
  option: ApiOkResponseDescriptor,
): MethodDecorator & ClassDecorator {
  const operation = option.operation;
  const operationOption: ApiOperationData = {
    ...operation,
  };
  const { type, schema, ...partial } = option;

  if (option.requestBody) {
    operationOption.requestBody = option.requestBody;
  }

  const decorators = [
    ApiOperation(operationOption),
    ApiOkResponse(partial),
    ApiCreatedResponse(<Omit<ApiOkResponseDescriptor, 'type'>>partial),
    ApiBadRequestResponse({
      description: '클라이언트가 잘못된 요청을 보냈습니다',
    }),
    ApiForbiddenResponse({
      description:
        '리소스에 접근할 권한이 없습니다 (요청이 서버에 의해 거절됨)',
    }),
    ApiNotFoundResponse({
      description: '존재하지 않는 리소스입니다.',
    }),
    ApiInternalServerErrorResponse({
      description: '서버 내부 오류입니다.',
    }),
    ApiBadGatewayResponse({
      description: '서버가 응답하지 않습니다.',
    }),
  ];

  // JWT 인증 여부
  if (option.auth) {
    decorators.push(ApiBearerAuth());
  }
  // HTTP BASIC 인증 여부
  if (option.basicAuth) {
    decorators.push(ApiBasicAuth());
  }
  // Body에 타입을 표시할 지 여부
  let bodyData = {};

  if (option.type) {
    bodyData[type] = option.type;
  }

  if (option.schema) {
    bodyData['schema'] = option.schema;
  }

  if (option.type || option.schema) {
    decorators.push(ApiBody(bodyData));
  }

  return applyDecorators(...decorators);
}

export function OpenApiBody(): MethodDecorator & ClassDecorator {
  return applyDecorators();
}

/**
 * JwtGuard
 * @returns
 */
export function JwtGuard(): MethodDecorator & ClassDecorator {
  return applyDecorators(UseGuards(JwtAuthGuard));
}

/**
 * 관리자만 호출할 수 있는 API로 만듭니다.
 * @returns
 */
export function AdminOnly(): MethodDecorator & ClassDecorator {
  return applyDecorators(Roles(Role.Admin));
}

/**
 * 유저와 관리자만 모두 호출할 수 있는 API로 만듭니다.
 * @returns
 */
export function UserOnly(): MethodDecorator & ClassDecorator {
  return applyDecorators(Roles(Role.Admin, Role.User));
}

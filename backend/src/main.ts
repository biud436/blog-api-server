import { ServerConfigFactory } from './common/config/server-config';
import { NestBootstrapApplication } from './nest-bootstrap.application';

NestBootstrapApplication.getInstance().emit('ready');

import { NestBootstrapApplication } from './nest-bootstrap.application';

NestBootstrapApplication.getInstance().emit('ready');

import { NestBootstrapApplication } from './bootstrap/nest-bootstrap.application';

NestBootstrapApplication.getInstance().prepare().start();

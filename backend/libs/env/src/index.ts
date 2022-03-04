import { ServerLog } from 'src/utils/ServerLog';
import * as fs from 'fs';
import { IEnvFile, TerminalList } from './tools/types';
import { Command } from './commands/command';
import { Mutex } from 'src/utils/Mutex';

export * from './libs/env.module';
export * from './libs/env.service';

export namespace EnvModuleEntryPoint {
  /**
   * @public
   * @class TerminalHelper
   */
  export class TerminalHelper {
    private env?: IEnvFile;
    private tempXORKey?: number;

    private _commands: Command[];

    constructor() {}

    /**
     * 기초 커맨드를 생성합니다.
     */
    public initWithCommands() {
      const keys = Object.keys(TerminalList);
      this._commands = <Command[]>keys.map((key) => {
        return new Command(key);
      });
      return this._commands;
    }

    /**
     * 터미널 헬퍼를 시작합니다.
     */
    public async start() {
      const commands = await this.initWithCommands();
      const mutex = new Mutex<Number>();

      commands.forEach(async (command) => {
        const unlock = await mutex.lock();
        await command.execute();
        unlock();
      });
    }
  }

  export function start() {
    ServerLog.info('EnvModuleEntryPoint');
    const helper = new TerminalHelper();
    helper.start();
  }

  /**
   * backend 서버가 도커 내부에 있는지 확인합니다.
   * 통상적으로 도커 컨테이너 내부 환경의 경우에는 .dockerenv라는 파일이 존재합니다.
   *
   * @returns
   */
  export function isInsideDocker() {
    let isDockerInside = false;
    isDockerInside = fs.existsSync('/.dockerenv');

    // ! /proc/self/cgroup에 docker라는 단어가 있는지 체크합니다
    if (!isDockerInside) {
      const isExistedCGroup = fs.existsSync('/proc/self/cgroup');
      if (isExistedCGroup) {
        const cGroup = fs.readFileSync('/proc/self/cgroup', 'utf8');
        isDockerInside = cGroup.indexOf('docker') >= 0;
      }
    }

    return isDockerInside;
  }
}

EnvModuleEntryPoint.start();

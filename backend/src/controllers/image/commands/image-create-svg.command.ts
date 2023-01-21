import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';

export abstract class ImageCreateSvgCommand {
    abstract execute(
        text: string,
        username: string,
        color: string,
        textSize: number,
        y: number,
    ): Promise<Record<string, any>>;
}

@Injectable()
export class ImageCreateSvgCommandImpl extends ImageCreateSvgCommand {
    constructor(private readonly httpService: HttpService) {
        super();
    }

    async execute(
        text: string,
        username: string,
        color: string,
        textSize: number,
        y: number,
    ): Promise<Record<string, any>> {
        let login, name, followers;

        try {
            const { data } = (await this.httpService.axiosRef.get(
                `https://api.github.com/users/${username}`,
            )) as Record<string, any>;

            // const { login, name, public_repos, followers } = data;
            login = data.login;
            name = data.name;
            followers = data.followers;
        } catch {
            name = 'TEST';
            followers = 0;
            login = 'TEST';
        }

        const parameters = {
            name: name ?? login,
            followers: followers ?? 0,
            date: new Date().toLocaleTimeString(),
        };

        return {
            ...parameters,
            texts: (() => {
                return text.split('').map((char, index) => {
                    const x = 10 + index * 20;
                    const endX = -50 + x;

                    return {
                        x,
                        y,

                        color,
                        smoothTrailPath: `M${x - 20},20 C${x},-20 ${
                            x + 40
                        },80 ${x},20 C${40 - 20 + x} ${
                            y + 20
                        },80 ${endX}-15,20 z`,

                        textSize,
                        className:
                            index % 3 === 0 ? 'ping-pong' : 'ping-pong-2',
                        content: char,
                    };
                });
            })(),
        };
    }
}

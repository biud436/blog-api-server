import axios from 'axios';

export namespace SlackLog {
    export function info(message?: string) {
        if (!message) {
            return;
        }

        const url = process.env.SLACK_WEBHOOK_URL;

        if (!url) {
            return;
        }

        axios.post(url, {
            text: message,
        });
    }
}

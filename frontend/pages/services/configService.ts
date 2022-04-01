import dotenv from "dotenv";

class ConfigServiceImpl {
    constructor() {
        dotenv.config();
    }

    get(key: string): string {
        return process.env[key];
    }
}

export const ConfigService = new ConfigServiceImpl();

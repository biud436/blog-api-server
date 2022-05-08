import jwt from "jsonwebtoken";

class JwtProviderImpl {
    constructor() {}

    verify(token: string): jwt.JwtPayload {
        return jwt.verify(token, process.env.JWT_SECRET) as jwt.JwtPayload;
    }

    decode<T extends jwt.JwtPayload = jwt.JwtPayload>(token: string): T {
        return <T>jwt.decode(token);
    }
}

export const JwtProvider = new JwtProviderImpl();

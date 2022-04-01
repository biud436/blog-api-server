import { NextApiRequest, NextApiResponse } from "next";
import { JwtProvider } from "../providers/jwt.providers";

export default async (req: NextApiRequest, res: NextApiResponse) => {
    if (!req.headers.authorization) {
        res.status(401).end();
        return;
    }

    const token = req.headers.authorization.split(" ")[1];
    const decoded = JwtProvider.verify(token);

    if (!decoded) {
        res.status(401).end();
        return;
    }

    res.status(200).json({
        check: true,
        data: decoded,
    });
};

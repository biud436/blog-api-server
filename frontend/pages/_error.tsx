import { NextPageContext } from "next";

type ErrorProps = {
    statusCode: number;
    message: string;
};

function Error({ statusCode, message }: ErrorProps) {
    return (
        <main className="bg-gray-200 h-screen flex flex-col justify-center items-center">
            <p>
                {statusCode
                    ? `An error ${statusCode} occurred on server ${message}`
                    : "An error occurred on client"}
            </p>
        </main>
    );
}

Error.getInitialProps = ({ res, err }: NextPageContext): ErrorProps => {
    const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
    const message = err ? err.message : "";
    return { statusCode, message };
};

export default Error;

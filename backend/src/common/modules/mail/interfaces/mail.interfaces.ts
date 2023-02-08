export interface TransporterAuthOptions {
    user: string;
    pass: string;
}

export interface TransporterOptions {
    service: string;
}

export interface MailOptions {
    from: string;
    to: string;
    subject: string;
    text: string;
}

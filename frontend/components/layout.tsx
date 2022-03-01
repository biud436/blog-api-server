import Head from "next/head";
import Image from "next/image";
import styles from "./layout.module.css";
import utilStyles from "../styles/utils.module.css";
import Link from "next/link";
import Navigation from "./common/navigation";
import { useRecoilState } from "recoil";
import { authState } from "../recoil/auth";
import { isLoggedIn } from "../recoil/auth";
import { buttomMaker as buttonFactory } from "./common/buttonGroup";

export const siteTitle = "블로그";

export type ReactLayoutProps = {
    children: React.ReactNode;
    home?: boolean;
};

const getMetadata = () => {
    return (
        <>
            <link rel="icon" href="/favicon.ico" />
            <meta
                name="description"
                content="Learn how to build a personal website using Next.js"
            />
            <meta
                property="og:image"
                content={`https://og-image.vercel.app/${encodeURI(
                    siteTitle
                )}.png?theme=light&md=0&fontSize=75px&images=https%3A%2F%2Fassets.zeit.co%2Fimage%2Fupload%2Ffront%2Fassets%2Fdesign%2Fnextjs-black-logo.svg`}
            />
            <meta name="og:title" content={siteTitle} />
            <meta name="twitter:card" content="summary_large_image" />
        </>
    );
};

export default function Layout({ children, home }: ReactLayoutProps) {
    return (
        <div className={styles.container}>
            <Head>{getMetadata()}</Head>
            <header>
                <Navigation>{buttonFactory.build()}</Navigation>
            </header>
            <main>{children}</main>
        </div>
    );
}

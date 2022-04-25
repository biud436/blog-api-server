import "../styles/global.css";
import { AppProps } from "next/app";
import { RecoilRoot } from "recoil";

export default function App({ Component, pageProps }) {
    return (
        <RecoilRoot>
            <Component {...pageProps}></Component>
        </RecoilRoot>
    );
}

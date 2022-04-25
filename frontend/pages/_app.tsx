import "../styles/global.css";
import { AppProps } from "next/app";
import { RecoilRoot } from "recoil";
import CssBaseline from "@mui/material/CssBaseline";

export default function App({ Component, pageProps }) {
    return (
        <RecoilRoot>
            <CssBaseline />
            <Component {...pageProps}></Component>
        </RecoilRoot>
    );
}

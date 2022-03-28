import Head from "next/head";
import Layout, { siteTitle } from "../components/layout";
import utilStyles from "../styles/utils.module.css";
import { getSortedPostsData } from "../lib/posts";
import Link from "next/link";
import Date from "../components/tools/date";
import {
    GetServerSideProps,
    GetServerSidePropsContext,
    GetStaticProps,
} from "next";
import Router from "next/router";
import cookies from "next-cookies";

export default function Home({
    allPostsData,
}: {
    allPostsData: {
        date: string;
        title: string;
        id: string;
    }[];
}) {
    return (
        <Layout home>
            <Head>
                <title>{siteTitle}</title>
            </Head>
            {allPostsData.map(({ id, date, title }) => {
                return (
                    <div
                        className={`{utilStyles.card} border shadow rounded p-1 m-2 hover:shadow-md`}
                        key={id}
                    >
                        <Link href="/posts/[id]" as={`/posts/${id}`}>
                            <a>
                                <h3 className={utilStyles.headingLg}>
                                    {title}
                                </h3>
                            </a>
                        </Link>
                        <p className={utilStyles.lightText}>
                            <Date dateString={date} />
                        </p>
                    </div>
                );
            })}
        </Layout>
    );
}

export const getServerSideProps: GetServerSideProps = async (
    ctx: GetServerSidePropsContext
) => {
    const allPostsData = getSortedPostsData();

    const { token } = cookies(ctx);

    if (!token || token === "") {
        // SSR
        const isSSR = ctx.req && ctx.res;
        if (isSSR) {
            ctx.res.writeHead(302, { Location: "/login" });
            ctx.res.end();
        } else {
            Router.push("/login");
        }
    }

    return {
        props: {
            allPostsData,
        },
    };
};

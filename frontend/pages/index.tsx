import Head from "next/head";
import Layout, { siteTitle } from "../components/layout";
import utilStyles from "../styles/utils.module.css";
import { getSortedPostsData } from "../lib/posts";
import LoginForm from "../components/tools/login-form";
import Link from "next/link";
import Date from "../components/date";
import { GetStaticProps } from "next";
import Navigation from "../components/common/navigation";

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

export const getStaticProps: GetStaticProps = async () => {
    const allPostsData = getSortedPostsData();
    return {
        props: {
            allPostsData,
        },
    };
};

import Layout from "../../components/layout";
import { getAllPostIds, getPostData } from "../../lib/posts";
import Head from "next/head";
import Date from "../../components/tools/date";
import utilStyles from "../../styles/utils.module.css";
import { GetStaticProps, GetStaticPaths } from "next";
import Link from "next/link";
import { useRecoilState } from "recoil";
import { LoginState } from "../../recoil/auth";

type PostDataProp = {
  postData: {
    title: string;
    date: string;
    contentHtml: string;
  };
};

export default function Post({ postData }: PostDataProp) {
  const [isLogin] = useRecoilState(LoginState);

  if (!isLogin) {
    return (
      <Layout>
        <Head>
          <title>권한이 없습니다.</title>
        </Head>
        <article>
          <section>글을 읽을 수 있는 권한이 없습니다.</section>
        </article>
      </Layout>
    );
  }

  return (
    <Layout>
      <Head>
        <title>{postData.title}</title>
      </Head>
      <article className="rounded border shadow p-2 m-2">
        <h1
          className={`${utilStyles.headingXl} hover:underline cursor-pointer`}
        >
          {postData.title}
        </h1>
        <div className={`${utilStyles.lightText} hover:underline`}>
          <Date dateString={postData.date} />
        </div>
        <div dangerouslySetInnerHTML={{ __html: postData.contentHtml }} />
      </article>
      <section className="p-2 m-2 bg-gray-100 rounded border">
        <div className="text-left">
          <div>
            댓글 <span className="text-red-600 px-1">1</span>개{" "}
          </div>
          <div className="p-2 mt-4">
            <div className="border rounded p-2 m-1 w-32 bg-[rgba(255,255,255,0.5)] text-center">
              댓글 작성자
            </div>
            <div className="border rounded p-2 m-1 bg-[rgba(255,255,255,0.5)]">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            </div>
          </div>
        </div>
        <div className="mt-2 text-right m-2">
          <span className="hover:underline cursor-pointer border rounded p-2 bg-[rgba(255,255,255,0.5)]">
            댓글 쓰기
          </span>
        </div>
      </section>
      <section className="text-left m-2 p-2">
        <Link href="/">
          <a className="hover:underline border rounded p-2 w-32 text-black">
            목록
          </a>
        </Link>
      </section>
    </Layout>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = getAllPostIds();
  return {
    paths,
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const postData = await getPostData(params.id as string);
  return {
    props: {
      postData,
    },
  };
};

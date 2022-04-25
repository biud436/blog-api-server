import Layout from "../components/layout";
import LoginForm from "../components/tools/login-form";

export default function Login() {
    return (
        <Layout>
            <div className="container-xl flex justify-center items-center">
                <div className="w-96">
                    <LoginForm></LoginForm>
                </div>
            </div>
        </Layout>
    );
}

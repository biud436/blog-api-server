import Link from "next/link";

export type NavigationProps = {
    children: React.ReactNode;
};

export default function Navigation({ children }: NavigationProps) {
    return (
        <>
            <nav className="container-md bg-gray-600 p-2">
                <div className="mx-auto px-4">
                    <div className="grid grid-cols-2">
                        <div className="w-48 cursor-pointer">
                            <Link href="/">
                                <a className="text-2xl font-bold text-white">
                                    러닝은빛의 블로그
                                </a>
                            </Link>
                        </div>
                        <div className="text-white hover:text-gray-300 cursor-pointer">
                            <Link href="/login">{children}</Link>
                        </div>
                    </div>
                </div>
            </nav>
        </>
    );
}

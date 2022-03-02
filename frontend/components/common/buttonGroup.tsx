import { useRecoilState } from "recoil";
import { authState, LoginState } from "../../recoil/auth";

export const buttomMaker = {
  beforeLoginButtonGroup() {
    return (
      <div className="flex-1 text-right">
        <span className="pr-2">로그인</span>
      </div>
    );
  },

  afterLoginButtonGroup() {
    return (
      <div className="flex-1 text-right">
        <span className="pr-2">글 작성</span>
        <span>로그아웃</span>
      </div>
    );
  },

  build() {
    const [user, setUser] = useRecoilState(authState);
    const [login] = useRecoilState(LoginState);

    return login ? this.afterLoginButtonGroup() : this.beforeLoginButtonGroup();
  },
};

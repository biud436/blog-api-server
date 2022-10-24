/**
 * 오류 시에는 다음 형식으로 응답하지 않음.
 */
export interface GithubTokenResponse {
    access_token: string;
    scope: string;
    token_type: string;
    [key: string]: string;
}

export type GithubUserData = {
    login: string; // 저장 필요
    id: number; // 저장 필요
    node_id: string;
    avatar_url: string; // 저장 필요
    gravatar_id: string;
    url: string;
    html_url: string;
    followers_url: string;
    following_url: string;
    gists_url: string;
    starred_url: string;
    subscriptions_url: string;
    organizations_url: string;
    repos_url: string;
    events_url: string;
    received_events_url: string;
    type: string;
    site_admin: boolean;
    name: string; // 저장 필요
    company: string;
    blog: string;
    location: string;
    /**
     * 확인 결과, 프로필에 이메일 노출을 설정하지 않은 유저는 null로 응답합니다.
     */
    email: string | undefined | null;
    hireable: boolean;
    bio: string;
    twitter_username: string;
    public_repos: number;
    public_gists: number;
    followers: number;
    following: number;
    created_at: string;
    updated_at: string;
};

import { atom, selector } from 'recoil';

export type User = {
  id: number;
  username: string;
  email: string;
  phone: string;
  company: string;
};

// 유저 프로필 설정
export const userState = atom({
  key: 'userState',
  default: {
    id: 0,
    username: '',
    email: '',
    phone: '',
    company: '',
  },
});

/**
 * 유저 프로필 조회
 */
export const userProfile = selector({
  key: 'userProfile',
  get: ({ get }) => {
    const profile = get(userState);

    return profile;
  },
});

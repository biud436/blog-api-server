import { useEffect, useState } from 'react';

export function MainPage() {
  const [isLoading, setisLoading] = useState(true);

  if (isLoading) {
    return (
      <>
        <span>로딩중...</span>
      </>
    );
  }

  useEffect(() => {}, []);

  return <></>;
}

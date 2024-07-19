import { useEffect } from 'react';
import { useRouter } from 'next/router';

const IndexPage = () => {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the Sign-In page
    router.replace('/signin'); // Use 'replace' to avoid adding the current page to the history stack
  }, [router]);

  return null; // Return null while the redirect is processing
};

export default IndexPage;

'use client';

// ❌ Violates 'next/no-document-import-in-page'
import Head from 'next/head'; // ❌ Violates 'next/no-head-element'
import { useEffect, useState } from 'react';

/**
 *
 */
export default function Home() {
  let [count, setCount] = useState(0); // ❌ Should use 'const' instead of 'let'

  useEffect(() => {
    setCount(count + 1); // ❌ Missing dependency in dependency array
  }, []);

  return (
    <>
      <Head>
        <title>Bad ESLint Example</title>
      </Head>

      <div>
        <h1>ESLint Test</h1>

        {/* ❌ Violates 'next/no-img-element' because we should use 'next/image' */}
        <img src="/test.jpg" />

        {/* ❌ Violates 'next/next-script-for-ga' (Google Analytics should use <Script>) */}
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=UA-000000-1"
        ></script>

        <p>Count: {count}</p>
      </div>
    </>
  );
}

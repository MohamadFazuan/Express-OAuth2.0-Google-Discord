import Head from "next/head";
import AuthComponent from "../components/AuthComponent";

export default function Home() {
  return (
    <>
      <Head>
        <title>Next.js OAuth2.0 Demo</title>
        <meta
          name="description"
          content="Next.js OAuth2.0 integration with Google and Discord"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </Head>
      <AuthComponent />
    </>
  );
}

import Head from "next/head";
import AuthComponent from "../components/AuthComponent";

export default function Home() {
  return (
    <>
      <Head>
        <title>Retro OAuth Login</title>
        <meta
          name="description"
          content="Retro pixelated OAuth2.0 login with Google and Discord"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link
          href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap"
          rel="stylesheet"
        />
      </Head>
      <AuthComponent />
    </>
  );
}

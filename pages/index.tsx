import type { NextPage } from "next";
import Head from "next/head";
import ComponentsDemo from "./components";

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>RoadmapAI - Component Library</title>
        <meta name="description" content="RoadmapAI component library and design system" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <ComponentsDemo />
    </>
  );
};

export default Home;

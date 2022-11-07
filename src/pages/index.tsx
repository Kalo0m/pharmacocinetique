import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";


const Home: NextPage = () => {
  return (
    <div className="flex mx-auto min-h-screen gap-4 flex-col lg:flex-row justify-center items-center">
      <button className="flex justify-center gap-3 rounded-md border border-transparent bg-red-400 px-4 py-2 text-base font-medium text-white shadow-sm transition-all hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm">
        <Link href="/antibios">Antibiotiques</Link>
      </button>
      <button className="flex justify-center gap-3 rounded-md border border-transparent bg-red-400 px-4 py-2 text-base font-medium text-white shadow-sm transition-all hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm">
        <Link href="/antiparasitaires">Antiparasitaires</Link>
      </button>
      <button disabled={true} className="flex justify-center gap-3 rounded-md border border-transparent bg-red-200 px-4 py-2 text-base font-medium text-white shadow-sm transition-all  focus:outline-none focus:ring-2 focus:ring-red-300 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm">
        <Link className=" pointer-events-none" href="/la-flamme">La flamme 🔥 (coming soon...)</Link>
      </button>
    </div>
  );
};

export default Home;


import Image from "next/image";
import Footer from "@/components/footer";
import { getTranslations } from "next-intl/server";
import Link from "next/link";

import SearchForm from "@/components/parish/search";
import { ViewTransition } from "react";
import { getParishes } from "@/lib/entities/parishes";


export default async function Home() {

  const [__, parishes] = await Promise.all(
    [
      getTranslations(),
      getParishes().catch(() => [])
    ]
  )

  return (
    <div className="heaven min-h-screen relative flex flex-col justify-between">
      <div></div>
      <div className="grow flex flex-row items-center justify-center">
        <ViewTransition
          name="login"
          enter={{ forward: "forward", back: "back", default: "auto" }}
          exit={{ forward: "forward", back: "back", default: "auto" }}
          share={{ forward: "forward", back: "back", default: "auto" }}
        >
          <div className="flex md:min-w-xl flex-col justify-center items-center">
            <Image alt="" aria-hidden="true" width={1024} height={1024} className="w-24 h-24 my-7" src={'/logo.webp'} />
            <h1 className="font-barlow font-[300] text-6xl tracking-widest">KATOLIKA</h1>
            <p className="font-barlow font-[600] text-xl md:text-2xl text-center">{__('Eglizy Katolika Apostolika Romana')}<br />{__(`En ligne`)}</p>
            <Link href={`/parishes`} transitionTypes={['forward']} className="my-6 px-8 py-4 text-zinc-800 hover:text-zinc-900 shadow-lg text-lg rounded-lg bg-zinc-200/30 dark:bg-black hover:bg-zinc-100 transition duration-200 text-shadow-xs dark:text-white dark:hover:bg-black/60 dark:hover:text-white hover:text-shadow-none md:hidden">{__(`Midira amin'ny paroasinao`)}</Link>
          </div>
          <div className="hidden md:block grow p-4">
            <SearchForm parishes={parishes} />
          </div>
        </ViewTransition>
      </div>
      <Footer />
    </div>
  );
}

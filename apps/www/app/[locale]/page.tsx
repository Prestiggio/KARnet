import Image from "next/image";
import Footer from "@/components/footer";
import { getTranslations } from "next-intl/server";

export default async function Home() {

  const __ = await getTranslations()

  return (
    <div className="heaven min-h-screen flex flex-col justify-between">
      <div></div>
      <main className="grow flex flex-col justify-center items-center">
        <Image alt="" aria-hidden="true" width={1024} height={1024} className="w-24 h-24 my-7" src={'/logo.webp'}/>
        <h1 className="font-barlow font-[300] text-6xl tracking-widest">KATOLIKA</h1>
        <p className="font-barlow font-[600] text-xl md:text-2xl text-center">{__('Eglizy Katolika Apostolika Romana')}<br/>{__(`En ligne`)}</p>
        <p>{__(`Midira amin'ny paroasinao`)}</p>
      </main>
      <Footer/>
    </div>
  );
}

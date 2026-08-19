import Image from "next/image";
import Footer from "@/components/footer";
import { getTranslations } from "next-intl/server";

export default async function Home() {

  const __ = await getTranslations()

  return (
    <div className="heaven min-h-screen flex flex-col justify-between">
      <div></div>
      <div className="grow flex flex-col justify-center items-center">
        <Image alt={__(`Katolika, Eglizy en ligne`)} width={1024} height={1024} className="w-24 h-24 my-7" src={'/logo.webp'}/>
        <div className="font-barlow font-[300] text-6xl tracking-widest">KATOLIKA</div>
        <div className="font-barlow font-[600] text-xl md:text-2xl text-center">{__('Eglizy Katolika Apostolika Romana')}<br/>{__(`En ligne`)}</div>
        <div>{__(`Midira amin'ny paroasinao`)}</div>
      </div>
      <Footer/>
    </div>
  );
}

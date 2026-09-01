import Footer from "@/components/footer";
import { NextIntlClientProvider, useTranslations } from 'next-intl';
import "../globals.css";
import BackButton from "@/components/back-button";

export const dynamic = 'force-dynamic'

export default function NotFound() {

  const __ = useTranslations()

  return (
    <html>
      <body>
        <NextIntlClientProvider>
          <div className="flex min-h-dvh flex-col justify-between">
            <div className="grow flex flex-col justify-center items-center">
              <h2 className="text-3xl">404 - {__(`Ohatry ny very`)}</h2>
              <BackButton/>
            </div>
            <Footer/>
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}

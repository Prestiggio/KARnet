import Footer from "@/components/footer";

export default function Layout({children}: {children: React.ReactNode}) {
    return <>
        <div id="content" className="prose dark:bg-zinc-900 dark:prose-invert mx-4 lg:mx-auto lg:max-w-6xl transition-all duration-200">
            {children}
        </div>
        <Footer/>
    </>
}
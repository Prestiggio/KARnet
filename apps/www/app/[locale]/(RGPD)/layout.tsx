import Footer from "@/components/footer";

export default function Layout({children}) {
    return <>
        <div className="prose mx-4 lg:mx-auto lg:max-w-6xl">
            {children}
        </div>
        <Footer/>
    </>
}
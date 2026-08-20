import StaticPage from "@/components/static/page"

const staticPage = StaticPage('legal-notice')

export const generateMetadata = staticPage.generateMetadata
export const generateStaticParams = staticPage.generateStaticParams
export const revalidate = staticPage.revalidate
export default staticPage.Page
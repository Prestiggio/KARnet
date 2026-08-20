import StaticPage from "@/components/static/page"

const staticPage = StaticPage('privacy')

export const generateMetadata = staticPage.generateMetadata
export const generateStaticParams = staticPage.generateStaticParams
export const revalidate = 3600
export default staticPage.Page
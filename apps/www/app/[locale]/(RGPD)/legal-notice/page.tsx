import StaticPage, {generateStaticParams as _generateStaticParams} from "@/components/static/page"

const staticPage = StaticPage('legal-notice')

export const generateMetadata = staticPage.generateMetadata
export default staticPage.Page 
export const generateStaticParams = _generateStaticParams
export const dynamicParams = false
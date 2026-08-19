import StaticPage, {generateStaticParams as _generateStaticParams} from "@/components/static/page"

const staticPage = StaticPage('terms')

export const generateMetadata = staticPage.generateMetadata
export default staticPage.Page 
export const generateStaticParams = _generateStaticParams
export const dynamicParams = false
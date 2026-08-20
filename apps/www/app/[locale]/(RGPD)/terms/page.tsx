import StaticPage from "@/components/static/page"

const staticPage = StaticPage('terms')

export const generateMetadata = staticPage.generateMetadata
export default staticPage.Page
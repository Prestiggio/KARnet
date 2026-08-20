import StaticPage from "@/components/static/page"

const staticPage = StaticPage('privacy')

export const generateMetadata = staticPage.generateMetadata
export default staticPage.Page
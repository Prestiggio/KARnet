import directus from "@/lib/directus";
import directusLocalMailer from "@/lib/directus-local-mailer";

type MailObject = {
    to: string,
    subject: string,
    html: string,
    text?: string,
}

export default async function(mail: MailObject) {
    const directusInstance = process.env.NODE_ENV == 'development' ? directusLocalMailer : directus

    return await directusInstance.request(() => ({
        path: '/notifier/mail',
        method: 'POST',
        body: JSON.stringify(mail)
    }))
}
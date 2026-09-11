import { Body, Container, Head, Heading, Html, Section, Tailwind, Text, Link } from '@react-email/components'

function VersionEn({fullname, otp}:{otp: string, fullname: string}) {
    return <>
        <Text className="text-gray-900">Hi {fullname},</Text>
        <Section className="mt-4">
            <Heading className="text-center text-gray-700">
                Here is your OTP code
            </Heading>
            <Text className="text-2xl my-8 bg-yellow-100 py-6 px-10 tracking-widest text-center font-barlow text-gray-700">
                {otp}
            </Text>
            <Link className='text-center py-4 w-full block bg-sky-600 text-white text-lg font-bold' href={process.env.BETTER_AUTH_URL}>Please enter Katolika.net and validate</Link>
        </Section>
    </>
}

function VersionMg({fullname, otp}:{otp: string, fullname: string}) {
    return <>
        <Text className="text-gray-900">Miarahaba {fullname},</Text>
        <Section className="mt-4">
            <Heading className="text-center text-gray-700">
                Inty ny code ahafahanao miditra
            </Heading>
            <Text className="text-2xl my-8 bg-yellow-100 py-6 px-10 tracking-widest text-center font-barlow text-gray-700">
                {otp}
            </Text>
            <Link className='text-center py-4 w-full block bg-sky-600 text-white text-lg font-bold' href={process.env.BETTER_AUTH_URL}>Sokafy Katolika.net ary ampidiro ny code</Link>
        </Section>
    </>
}

function VersionFr({fullname, otp}:{otp: string, fullname: string}) {
    return <>
        <Text className="text-gray-900">Bonjour {fullname},</Text>
        <Section className="mt-4">
            <Heading className="text-center text-gray-700">
                Voici votre code de connexion
            </Heading>
            <Text className="text-2xl my-8 bg-yellow-100 py-6 px-10 tracking-widest text-center font-barlow text-gray-700">
                {otp}
            </Text>
            <Link className='text-center py-4 w-full block bg-sky-600 text-white text-lg font-bold' href={process.env.BETTER_AUTH_URL}>Ouvrir Katolika.net et Valider</Link>
        </Section>
    </>
}

export default async function LoginOtpMail({ otp, locale, fullname }: { otp: string, locale: string, fullname: string }) {

    let content = <VersionMg fullname={fullname} otp={otp}/>
    switch(locale) {
        case 'fr':
            content = <VersionFr fullname={fullname} otp={otp}/>
            break
        case 'en':
            content = <VersionEn fullname={fullname} otp={otp}/>
            break
    }

    return (
        <Html lang={locale}>
            <Head />
            <Tailwind>
                <Body className="bg-gray-100 font-sans">
                    <Container className="mx-auto my-10 w-full max-w-[600px] rounded bg-white p-6">
                        {content}
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    )
}
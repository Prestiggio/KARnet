// emails/rappel-messe.tsx
import { Body, Container, Head, Heading, Html, Section, Tailwind, Text } from '@react-email/components'

export default function CreateParishMail({ name, patron, district, diocese }: { name: string; patron: string, district: string, diocese: string }) {
    return (
        <Html lang="fr">
            <Head />
            <Tailwind>
                <Body className="bg-gray-100 font-sans">
                    <Container className="mx-auto my-10 w-full max-w-[600px] rounded bg-white p-6">
                        <Heading className="text-xl font-bold text-gray-900">Bonjour Landry</Heading>
                        <Section className="mt-4">
                            <Text className="text-base text-gray-700">
                                Une nouvelle paroisse a été soumise :
                            </Text>
                            <table className='w-full bg-yellow-200'>
                                <tbody>
                                    <tr>
                                        <th>Nom</th>
                                        <td>{name}</td>
                                    </tr>
                                    <tr>
                                        <th>Patron</th>
                                        <td>{patron}</td>
                                    </tr>
                                    <tr>
                                        <th>Diocèse</th>
                                        <td>{diocese}</td>
                                    </tr>
                                    <tr>
                                        <th>District</th>
                                        <td>{district}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </Section>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    )
}
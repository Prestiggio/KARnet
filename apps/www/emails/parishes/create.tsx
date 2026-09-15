// emails/rappel-messe.tsx
import { Body, Container, Head, Heading, Html, Section, Tailwind, Text, Img } from '@react-email/components'

export default function CreateParishMail({ name, patron, token, diocese, author }: { name: string; patron: string, token: string, diocese: string, author: any }) {
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
                                        <th>ID Ticket</th>
                                        <td>{token}</td>
                                    </tr>
                                </tbody>
                            </table>
                            <Text>Demande envoyée par:</Text>
                            <table className='w-full bg-lime-100'>
                                <tbody>
                                    <tr>
                                        <td></td>
                                        <td><Img src={author.user?.image}/></td>
                                    </tr>
                                    <tr>
                                        <td>Nom:</td>
                                        <td>{author.user?.name}</td>
                                    </tr>
                                    <tr>
                                        <td>Email:</td>
                                        <td>{author.user?.email}</td>
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
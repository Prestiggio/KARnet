import LoginForm from "@/components/auth/login";
import Footer from "@/components/footer";
import { withoutAuth } from "@/lib/withoutAuth";

export default withoutAuth(async function SignIn() {
    return <div className="flex flex-col min-h-dvh">
        <div className="grow flex flex-col justify-center bg-yellow-300/10 dark:bg-zinc-700">
            <div className="md:min-w-xl mx-auto">
                <LoginForm/>
            </div>
        </div>
        <Footer/>
    </div>
})
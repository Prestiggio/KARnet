import LoginForm from "@/components/auth/login";
import { withoutAuth } from "@/lib/withoutAuth";

export default withoutAuth(async function SignIn() {
    return <LoginForm/>
})
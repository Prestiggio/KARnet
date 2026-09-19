import AppleSignInButton from "./apple";
import FacebookSignInButton from "./facebook";
import GoogleSignInButton from "./google";
import LinkedingSignInButton from "./linkedin";

export default function SocialLogin() {
    return <>
        <FacebookSignInButton/>
        <GoogleSignInButton/>
        <AppleSignInButton/>
        <LinkedingSignInButton/>
    </>
}
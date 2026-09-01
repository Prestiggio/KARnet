import ParishForm from "@/components/parish/form";
import { ViewTransition } from "react";

export default async function CreateParish() {
    return <ViewTransition
            name="login"
            enter={{ forward: "forward", back: "back", default: "auto" }}
            exit={{ forward: "forward", back: "back", default: "auto" }}
            share={{ forward: "forward", back: "back", default: "auto" }}
        >
            <ParishForm/>
        </ViewTransition>
    
}
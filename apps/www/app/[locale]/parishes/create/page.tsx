import ParishForm from "@/components/parish/form";
import directus from "@/lib/directus";
import { readItems } from "@directus/sdk";
import { ViewTransition } from "react";

export default async function CreateParish() {

    const dioceses = await directus.request(readItems('organizations', {
        filter: {
            type: {
                slug: {
                    _eq: 'diosezy'
                }
            }
        }
    }))

    return <ViewTransition
            name="login"
            enter={{ forward: "forward", back: "back", default: "auto" }}
            exit={{ forward: "forward", back: "back", default: "auto" }}
            share={{ forward: "forward", back: "back", default: "auto" }}
        >
            <ParishForm dioceses={dioceses}/>
        </ViewTransition>
    
}
"use client";

import { usePathname, useRouter } from "next/navigation";
import { routing } from "@/i18n/routing";

const LanguageSwitcher = ({locale}) => {
    const router = useRouter();
    const pathname = usePathname();

    const switchLanguage = async (newLang) => {
        const segments = pathname.split('/');
        const currentPrefix = segments[1];

        if (routing.locales.includes(currentPrefix)) {
            segments[1] = newLang;
            router.push(segments.join('/'));
            return;
        }

        await fetch('/api/lang', {
            method: 'POST',
            body: JSON.stringify({
                lang: newLang
            })
        })

        router.refresh(); // Reload page to apply changes
    };

    return (
        <div className="flex gap-2">
            <button
                onClick={() => switchLanguage("mg")}
                className={`px-1 cursor-pointer rounded-sm text-2xl font-semibold transition`}
            >
                🇲🇬
            </button>
            <button
                onClick={() => switchLanguage("fr")}
                className={`px-1 cursor-pointer rounded-sm text-2xl font-semibold transition`}
            >
                🇫🇷
            </button>
            <button
                onClick={() => switchLanguage("en")}
                className={`px-1 cursor-pointer rounded-sm text-2xl font-semibold transition`}
            >
                🇬🇧
            </button>
        </div>
    );
};

export default LanguageSwitcher;

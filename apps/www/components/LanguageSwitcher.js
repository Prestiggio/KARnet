"use client";

import { usePathname, useRouter } from "next/navigation";
import { routing } from "@/i18n/routing";

const LANGUAGES = [
    { code: "mg", label: "Malagasy", flag: "🇲🇬" },
    { code: "fr", label: "Français", flag: "🇫🇷" },
    { code: "en", label: "English", flag: "🇬🇧" },
];

const LanguageSwitcher = ({ locale }) => {
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
        <nav aria-label="Changer de langue">
            <ul className="flex gap-8 md:gap-2 list-none">
                {LANGUAGES.map(({ code, label, flag }) => {
                    const isCurrent = locale === code;
                    return (
                        <li key={code}>
                            <button
                                type="button"
                                onClick={() => switchLanguage(code)}
                                aria-label={label}
                                aria-current={isCurrent ? "true" : undefined}
                                lang={code}
                                className={`px-1 cursor-pointer rounded-sm text-2xl font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current ${isCurrent ? "opacity-100" : "opacity-70 hover:opacity-100"}`}
                            >
                                <span aria-hidden="true">{flag}</span>
                            </button>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
};

export default LanguageSwitcher;

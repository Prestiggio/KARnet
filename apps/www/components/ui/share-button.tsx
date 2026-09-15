"use client";

import { Bookmark } from "lucide-react";
import { useTranslations } from "next-intl";
import React from "react";

interface ShareButtonProps {
    title: string;
    text: string;
    url: string;
}

export default function ShareButton({ title, text, url }: ShareButtonProps) {
    const __ = useTranslations()

    const handleShare = async () => {
        // Check if the browser supports the native share API
        if (navigator.share) {
            try {
                await navigator.share({
                    title,
                    text,
                    url,
                });
                console.log("Content shared successfully!");
            } catch (error) {
                console.error("Error sharing:", error);
            }
        } else {
            // Fallback: Copy link to clipboard if native share is unsupported
            try {
                await navigator.clipboard.writeText(url);
                alert("Share link copied to clipboard!");
            } catch (err) {
                console.error("Could not copy text: ", err);
            }
        }
    };

    return (
        <button
            onClick={handleShare}
            type="button"
            className="mt-6 px-4 py-2 min-w-60 cursor-pointer bg-slate-700 text-white rounded hover:bg-slate-600 transition"
        >
            {__(`Tadidìna`)} <Bookmark className="inline float-right"/>
        </button>
    );
}

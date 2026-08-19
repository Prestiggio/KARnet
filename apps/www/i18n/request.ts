import { locale as getRootLocale } from 'next/root-params';
import { getRequestConfig } from 'next-intl/server';
import { hasLocale, IntlErrorCode } from 'next-intl';
import { routing } from './routing';

export default getRequestConfig(async () => {
    const paramLocale = await getRootLocale();
    const _locale = hasLocale(routing.locales, paramLocale) ? paramLocale : routing.defaultLocale;
    const messages = (await import(`../messages/${_locale}.json`)).default

    const genericReturn = {
        onError(error:any) {
            if (error.code === IntlErrorCode.MISSING_MESSAGE) return;
                console.error(error);
            if (error.code === IntlErrorCode.MISSING_MESSAGE) {
                // Missing translations are expected and should only log an error
                console.error(error);
            } else {
                // Other errors indicate a bug in the app and should be reported
                console.error(error)
            }
        },

        getMessageFallback({ namespace, key, error }:{namespace:string, key:string, error:any}) {
            const path = [namespace, key].filter((part) => part != null).join('.');

            if (error.code === IntlErrorCode.MISSING_MESSAGE) {
                return path;
            } else {
                return 'Dear developer, please fix this message: ' + path;
            }
        }
    }

    return {
        ...genericReturn,
        locale: _locale,
        messages
    };
});
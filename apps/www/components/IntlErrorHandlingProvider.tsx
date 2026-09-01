'use client';

import * as Sentry from '@sentry/nextjs';
import {AbstractIntlMessages, NextIntlClientProvider} from 'next-intl';
import React from 'react';

export default function IntlErrorHandlingProvider({children, locale, messages}: {children: React.ReactNode, locale: string, messages: AbstractIntlMessages}) {
  return (
    <NextIntlClientProvider
      locale={locale}
      messages={messages}
      onError={(error) => {
        if(locale !== 'mg') {
          Sentry.captureException(error)
        }
      }}
      getMessageFallback={({namespace, key}) => {
        return key
      }}
    >
      {children}
    </NextIntlClientProvider>
  );
}
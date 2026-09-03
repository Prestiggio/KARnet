export const LG_COUNTRIES = {
    fr: 'fr_FR',
    mg: 'mg_MG',
    en: 'en_US'
}

export const LG_DASHCODES = {
    fr: 'fr-FR',
    mg: 'mg-MG',
    en: 'en-US'
}

const UUID_RE =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const isUuid = (s: any) => typeof s === 'string' && UUID_RE.test(s);

export const MGMoment = {
    months: 'Janoary_Febroary_Marsa_Aprily_Mey_Jona_Jolay_Aogositra_Septambra_Oktobra_Novambra_Desambra'.split(
        '_'
    ),
    monthsShort: 'Jan_Feb_Mar_Apr_Mey_Jon_Jol_Aog_Sep_Okt_Nov_Des'.split('_'),
    weekdays: 'Alahady_Alatsinainy_Talata_Alarobia_Alakamisy_Zoma_Asabotsy'.split(
        '_'
    ),
    weekdaysShort: 'Alah_Alats_Tal_Alar_Alak_Zom_Asab'.split('_'),
    weekdaysMin: 'Ah_At_Ta_Ar_Ak_Zo_As'.split('_'),
    longDateFormat: {
        LT: 'HH:mm',
        LTS: 'HH:mm:ss',
        L: 'DD/MM/YYYY',
        LL: 'D MMMM YYYY',
        LLL: 'D MMMM YYYY HH:mm',
        LLLL: 'dddd, D MMMM YYYY HH:mm',
    },
    calendar: {
        sameDay: '[Anio amin\'ny] LT',
        nextDay: '[Rahampitso amin\'ny] LT',
        nextWeek: 'dddd [amin\'ny] LT',
        lastDay: '[Omaly tamin\'ny] LT',
        lastWeek: 'dddd [teo amin\'ny] LT',
        sameElse: 'L',
    },
    relativeTime: {
        future: 'afaka %s',
        past: '%s lasa',
        s: 'segondra vitsivitsy',
        ss: '%d segondra',
        m: 'minitra iray',
        mm: '%d minitra',
        h: 'ora iray',
        hh: '%d ora',
        d: 'andro iray',
        dd: '%d andro',
        M: 'volana iray',
        MM: '%d volana',
        y: 'taona iray',
        yy: '%d taona',
    },
    dayOfMonthOrdinalParse: /\d{1,2}/,
    ordinal: function (n:number) {
        return n.toString();
    },
    week: {
        dow: 1, // Alatsinainy no andro voalohan'ny herinandro.
        doy: 4, // Ny herinandro misy ny 4 Janoary no herinandro voalohan'ny taona.
    },
}
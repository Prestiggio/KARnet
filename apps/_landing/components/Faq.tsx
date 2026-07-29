const FAQS = [
  {
    question: "Inona no KaRNet?",
    answer:
      "KaRNet dia rindrambaiko pastoraly ho an'ny EKAR: fisoratana amin'ny sakramenta, fanentanana ny kristianina, fotoam-pihaonana amin'ny pretra, vaovao ary fandaharam-potoana.",
  },
  {
    question: "Ilaina hividy aplikasiona ve mba hisoratra anarana?",
    answer:
      "Tsia. Ampy ny mameno ny laharana findaynao eto ambony. Efa eo am-pamolavolana ny aplikasiona KaRNet, ka ny fisoratana eto no hahafantaranao voalohany ny fivoarany sy hisantaranao amin'ny andrana ara-teknika.",
  },
  {
    question: "Mandoa vola ve raha misoratra anarana?",
    answer:
      "Tsy mandoa na inona na inona ianao. Ny fisoratana anarana amin'ny lisitry ny miandry ny KaRNet dia maimaim-poana tanteraka.",
  },
  {
    question: "Azo esorina ve ny fisoratana anarana rehefa avy nisoratra?",
    answer:
      "Eny, azo atao amin'ny fotoana rehetra ny fanesorana ny fisoratana anarana, amin'ny fangatahana amin'ny paroasy na amin'ny rohy ao amin'ny SMS voaray.",
  },
] as const;

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.answer,
    },
  })),
};

export default function Faq() {
  return (
    <section
      aria-labelledby="faq-heading"
      className="mx-auto max-w-3xl px-6 py-20"
    >
      <h2
        id="faq-heading"
        className="font-display text-2xl font-bold text-burgundy sm:text-3xl"
      >
        Fanontaniana matetika apetraka
      </h2>
      <p className="mt-2 text-sm text-ink/70">Questions fréquentes</p>

      <dl className="mt-8 divide-y divide-ochre/20">
        {FAQS.map((faq) => (
          <div key={faq.question} className="py-2">
            <details className="group py-3">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-2 font-display text-base font-semibold text-ink marker:content-none">
                <span>{faq.question}</span>
                <span
                  aria-hidden="true"
                  className="shrink-0 text-xl leading-none text-ochre transition-transform group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <dd className="mt-2 pb-2 pr-8 text-sm leading-relaxed text-ink/75">
                {faq.answer}
              </dd>
            </details>
          </div>
        ))}
      </dl>

      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </section>
  );
}

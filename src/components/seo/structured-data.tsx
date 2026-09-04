import React from 'react'

export function StructuredData() {
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: 'AIutiamoci',
    alternateName: 'Ti AIuto',
    url: 'https://aiutiamoci.cloud',
    logo: 'https://aiutiamoci.cloud/favicon.svg',
    description:
      'Piattaforma di formazione pratica e lavoro condiviso con Intelligenza Artificiale per professionisti, over 40 e aziende.',
    sameAs: ['https://aiutiamoci.cloud'],
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'info@aiutiamoci.cloud',
      contactType: 'customer support',
      availableLanguage: ['Italian'],
    },
  }

  const courseSchema = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: 'AI Start: Domina l’Intelligenza Artificiale da Zero',
    description:
      'Percorso formativo pratico in 20 video lezioni per imparare a usare l’IA (ChatGPT, Claude, Gemini, Automazioni) nel lavoro quotidiano senza tecnicismi.',
    provider: {
      '@type': 'EducationalOrganization',
      name: 'AIutiamoci',
      sameAs: 'https://aiutiamoci.cloud',
    },
    educationalLevel: 'Beginner',
    inLanguage: 'it',
    offers: {
      '@type': 'Offer',
      price: '97.00',
      priceCurrency: 'EUR',
      category: 'Paid',
      availability: 'https://schema.org/InStock',
      url: 'https://aiutiamoci.cloud',
    },
    hasCourseInstance: {
      '@type': 'CourseInstance',
      courseMode: 'online',
      courseWorkload: 'PT10H',
    },
  }

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Serve saper programmare o avere competenze tecniche?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Assolutamente no! AI Start è stato progettato appositamente per chi parte da zero. Spieghiamo tutto in modo chiaro, senza tecnicismi.',
        },
      },
      {
        '@type': 'Question',
        name: 'Come funziona l’accesso alle lezioni video?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Al momento dell’iscrizione riceverai un Codice Univoco personale (es. AI-START-8F92). Inserendolo nell’Area Studenti sbloccherai subito tutti i 20 video ed il player HTML5.',
        },
      },
      {
        '@type': 'Question',
        name: 'Cos’è l’Assistente @AI in Chat?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'È il tuo tutor virtuale integrato nella piattaforma. Durante la visione delle lezioni puoi digitare @AI per porre qualsiasi domanda e ricevere risposte istantanee.',
        },
      },
      {
        '@type': 'Question',
        name: 'Quando uscirà il Corso Avanzato AI Pro?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Il percorso avanzato "AI Pro & Agenti Autonomi B2B" è attualmente in fase di preparazione. Puoi iscriverti alla lista d’attesa in un click per ricevere un invito prioritario ed un coupon sconto!',
        },
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(courseSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </>
  )
}

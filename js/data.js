/**
 * Authentic Telc B2 Examination Data & Kerala Learning Resources
 * Includes: Teil 1 (Präsentation), Teil 2 (Diskussion), Teil 3 (Problemlösung),
 * B2 Redemittel, Nomen-Verb-Verbindungen, and Kerala Malayalam-German Grammar Tips.
 */

const TELC_B2_DATA = {
  // Common Malayalam learning tips for Kerala students
  keralaTips: [
    {
      id: "word-order",
      title: "Nebensatz Word Order (സബോർഡിനേറ്റ് ക്ലോസ് വാക്യഘടന)",
      malayalam: "മലയാളത്തിൽ ക്രിയ (verb) സാധാരണ വാക്യത്തിന്റെ അവസാനമാണ് വരുന്നത്. ജർമ്മൻ ഭാഷയിൽ Hauptsatz-ൽ Verb രണ്ടാമത്തെ സ്ഥാനത്താണ് (Position 2), എന്നാൽ weil, dass, obwohl, wenn തുടങ്ങിയ Nebensatz-ൽ ക്രിയ വാക്യത്തിന്റെ ഏറ്റവും അവസാനത്തിലേക്ക് (Endposition) മാറ്റണം.",
      english: "In Malayalam, verbs naturally come at the end (SOV). In German main clauses, the verb is in Position 2. But with subordinating conjunctions (weil, dass, obwohl), ensure the conjugated verb moves to the very end!",
      example: {
        incorrect: "Ich lerne Deutsch, weil ich möchte in Deutschland arbeiten. (തെറ്റ്)",
        correct: "Ich lerne Deutsch, weil ich in Deutschland arbeiten möchte. (ശരി)",
        malayalamMeaning: "എനിക്ക് ജർമ്മനിയിൽ ജോലി ചെയ്യാൻ ആഗ്രഹമുള്ളതുകൊണ്ട് ഞാൻ ജർമ്മൻ പഠിക്കുന്നു."
      }
    },
    {
      id: "nvv",
      title: "Nomen-Verb-Verbindungen (B2 സ്കോറിങ് കീ)",
      malayalam: "സാധാരണ ലളിതമായ ക്രിയകൾക്ക് പകരം B2 പരീക്ഷയിൽ Nomen-Verb-Verbindungen ഉപയോഗിച്ചാൽ Ausdrucksfähigkeit-ൽ കൂടുതൽ മാർക്ക് ലഭിക്കും. ഉദാഹരണത്തിന് 'entscheiden' എന്നതിന് പകരം 'eine Entscheidung treffen' എന്ന് പറയുക.",
      english: "Using Noun-Verb collocations instead of simple verbs dramatically boosts your Telc B2 'Ausdrucksfähigkeit' (range of expression) score.",
      example: {
        simple: "Wir müssen das Problem besprechen.",
        b2Level: "Wir müssen dieses Problem zur Sprache bringen.",
        malayalamMeaning: "നാം ഈ പ്രശ്നം ചർച്ചയ്ക്കെടുക്കണം."
      }
    },
    {
      id: "connectors",
      title: "Zweiteilige Konnektoren (ഇരട്ട കണക്ടറുകൾ)",
      malayalam: "B2 പരീക്ഷയിൽ വാക്യങ്ങൾ കൂട്ടിയോജിപ്പിക്കാൻ 'und', 'aber' മാത്രം ഉപയോഗിക്കരുത്. 'sowohl ... als auch' (ഇതും അതോടൊപ്പം അതും), 'nicht nur ... sondern auch' (ഇത് മാത്രമല്ല അത് കൂടിയും) തുടങ്ങിയവ ഉപയോഗിക്കുക.",
      english: "Avoid relying solely on 'und' or 'aber'. Elevate your sentences with two-part connectors like 'nicht nur ... sondern auch' or 'einerseits ... andererseits'.",
      example: {
        b2Level: "Deutschland bietet nicht nur hervorragende Karrieremöglichkeiten, sondern auch ein sicheres Gesundheitssystem.",
        malayalamMeaning: "ജർമ്മനി മികച്ച തൊഴിൽ അവസരങ്ങൾ മാത്രമല്ല, സുരക്ഷിതമായ ഒരു ആരോഗ്യ പരിപാലന സംവിധാനം കൂടിയാണ് നൽകുന്നത്."
      }
    },
    {
      id: "passive-substitutes",
      title: "Passiversatzformen (പാസീവ് ബദലുകൾ)",
      malayalam: "ആശുപത്രികളിലും ഔദ്യോഗിക സംഭാഷണങ്ങളിലും 'sein + zu + Infinitiv' അല്ലെങ്കിൽ 'sich lassen + Infinitiv' പോലുള്ള Passiversatzformen ഉപയോഗിക്കുന്നത് B2 ലെവൽ തെളിയിക്കുന്നു.",
      english: "Use passive alternatives like 'lässt sich machen' (it can be done) instead of basic modal verbs in your presentation and problem solving.",
      example: {
        simple: "Man kann diese Aufgabe leicht lösen.",
        b2Level: "Diese Aufgabe lässt sich ohne Weiteres bewältigen.",
        malayalamMeaning: "ഈ ചുമതല എളുപ്പത്തിൽ പരിഹരിക്കാൻ സാധിക്കുന്നതാണ്."
      }
    }
  ],

  // TEIL 1: PRÄSENTATION
  teil1: [
    {
      id: "t1-reise",
      title: "Thema: Eine Reise, die Sie beeindruckt hat",
      titleMl: "വിഷയം: നിങ്ങളെ ആകർഷിച്ച ഒരു യാത്ര (യാത്രാ വിവരണം)",
      titleEn: "Topic: A Journey That Impressed You",
      prompt: "Berichten Sie über eine Reise, die Sie unternommen haben. Gehen Sie dabei auf folgende Punkte ein:\n• Wohin sind Sie gereist und warum?\n• Wie war die Anreise und die Unterkunft?\n• Welche besonderen Erlebnisse oder Sehenswürdigkeiten gab es?\n• Was hat Sie besonders beeindruckt und was haben Sie gelernt?\n• Würden Sie diese Reise anderen empfehlen?",
      outline: [
        { step: "Einleitung (Introduction)", phrase: "Ich möchte heute über eine unvergessliche Reise berichten, die ich vor kurzem unternommen habe.", en: "I would like to report on an unforgettable trip I recently took.", ml: "ഞാൻ അടുത്തിടെ നടത്തിയ അവിസ്മരണീയമായ ഒരു യാത്രയെക്കുറിച്ച് ഇന്ന് അവതരിപ്പിക്കാൻ ആഗ്രഹിക്കുന്നു." },
        { step: "Hauptteil - Ziel & Anreise (Travel & Stay)", phrase: "Mein Reiseziel war..., da ich mich schon immer für die dortige Kultur und Natur begeistert habe. Die Anreise verlief reibungslos...", en: "My destination was..., as I have always been fascinated by the culture and nature. The travel went smoothly...", ml: "എന്റെ ലക്ഷ്യസ്ഥാനം... ആയിരുന്നു, കാരണം അവിടുത്തെ സംസ്കാരത്തിലും പ്രകൃതിയിലും ഞാൻ എപ്പോഴും തൽപരനായിരുന്നു." },
        { step: "Höhepunkte (Highlights)", phrase: "Ein absoluter Höhepunkt meines Aufenthalts war zweifellos...", en: "An absolute highlight of my stay was undoubtedly...", ml: "എന്റെ താമസത്തിലെ ഏറ്റവും പ്രധാനപ്പെട്ട ഒരു പ്രത്യേക അനുഭവം തീർച്ചയായും..." },
        { step: "Persönlicher Eindruck (Personal Impression)", phrase: "Was mich zutiefst beeindruckt hat, war die außergewöhnliche Gastfreundschaft der Einheimischen.", en: "What deeply impressed me was the extraordinary hospitality of the locals.", ml: "എന്നെ ഏറ്റവും കൂടുതൽ സ്വാധീനിച്ചത് നാട്ടുകാരുടെ ഊഷ്മളമായ ആതിഥ്യമര്യാദയായിരുന്നു." },
        { step: "Schluss & Empfehlung (Conclusion)", phrase: "Zusammenfassend lässt sich sagen, dass diese Erfahrung meinen Horizont erweitert hat. Ich kann diese Reise wärmstens weiterempfehlen.", en: "In summary, this experience broadened my horizons. I warmly recommend this trip.", ml: "ചുരുക്കത്തിൽ, ഈ അനുഭവം എന്റെ കാഴ്ചപ്പാടുകളെ വിശാലമാക്കി. മറ്റുള്ളവർക്കും ഞാൻ ഈ യാത്ര ശുപാർശ ചെയ്യുന്നു." }
      ],
      examinerQuestions: [
        {
          question: "Vielen Dank für Ihre Präsentation. Gab es während Ihrer Reise auch unvorhergesehene Schwierigkeiten oder Herausforderungen?",
          questionEn: "Thank you for your presentation. Were there any unexpected difficulties or challenges during your trip?",
          questionMl: "നിങ്ങളുടെ അവതരണത്തിന് നന്ദി. യാത്രയ്ക്കിടയിൽ അപ്രതീക്ഷിതമായ എന്തെങ്കിലും ബുദ്ധിമുട്ടുകളോ വെല്ലുവിളികളോ നേരിടേണ്ടി വന്നിരുന്നോ?",
          sampleAnswer: "Ehrlich gesagt gab es anfangs eine kleine sprachliche Barriere, doch mit Geduld und der Hilfsbereitschaft der Einheimischen ließ sich das Problem schnell lösen.",
          sampleAnswerEn: "To be honest, there was a minor language barrier initially, but with patience and the helpfulness of the locals, it was quickly resolved.",
          sampleAnswerMl: "സത്യം പറഞ്ഞാൽ തുടക്കത്തിൽ ചെറിയ ഭാഷാ തടസ്സങ്ങൾ ഉണ്ടായിരുന്നു, എന്നാൽ ക്ഷമയും നാട്ടുകാരുടെ സഹായമനസ്ഥിതിയും കാരണം ആ പ്രശ്നം വേഗത്തിൽ പരിഹരിക്കാൻ സാധിച്ചു."
        },
        {
          question: "Was würden Sie bei Ihrer nächsten Reise dorthin anders planen?",
          questionEn: "What would you plan differently on your next trip there?",
          questionMl: "അടുത്ത തവണ അവിടെ പോകുമ്പോൾ നിങ്ങൾ എന്ത് കാര്യമാണ് വ്യത്യസ്തമായി പ്ലാൻ ചെയ്യുക?",
          sampleAnswer: "Ich würde mir definitiv mehr Zeit nehmen, um auch abgelegenere Orte abseits der Touristenpfade zu erkunden.",
          sampleAnswerEn: "I would definitely allocate more time to explore more remote places away from tourist routes.",
          sampleAnswerMl: "ടൂറിസ്റ്റ് കേന്ദ്രങ്ങളിൽ നിന്ന് മാറി കൂടുതൽ ഉൾപ്രദേശങ്ങൾ കാണാൻ ഞാൻ തീർച്ചയായും കൂടുതൽ സമയം മാറ്റിവെക്കും."
        }
      ]
    },
    {
      id: "t1-buch",
      title: "Thema: Ein Buch, das Sie gelesen haben",
      titleMl: "വിഷയം: നിങ്ങൾ വായിച്ച ഒരു പുസ്തകം (പുസ്തകാവലോകനം)",
      titleEn: "Topic: A Book You Have Read",
      prompt: "Stellen Sie ein Buch vor, das Sie gelesen haben:\n• Wie heißt das Buch und wer ist der Autor?\n• Worum geht es in der Handlung (Handlung kurz zusammenfassen)?\n• Welche Charaktere stehen im Mittelpunkt?\n• Was ist die Hauptbotschaft oder Moral des Buches?\n• Warum hat Ihnen das Buch gefallen oder nicht gefallen?",
      outline: [
        { step: "Einleitung (Intro)", phrase: "Im Rahmen meiner Präsentation möchte ich Ihnen das bemerkenswerte Buch '...' von ... vorstellen.", en: "As part of my presentation, I'd like to introduce the remarkable book '...' by ...", ml: "എന്റെ പ്രസന്റേഷനിൽ '...' എന്ന ശ്രദ്ധേയമായ പുസ്തകത്തെക്കുറിച്ച് അവതരിപ്പിക്കാൻ ആഗ്രഹിക്കുന്നു." },
        { step: "Handlung (Plot)", phrase: "Das Werk thematisiert im Kern die Herausforderungen von...", en: "The work fundamentally addresses the challenges of...", ml: "ഈ കൃതി അടിസ്ഥാനപരമായി ചർച്ച ചെയ്യുന്നത് ... നേരിടുന്ന വെല്ലുവിളികളെയാണ്." },
        { step: "Charaktere & Stil (Style)", phrase: "Besonders faszinierend fand ich die psychologische Tiefe der Hauptfigur...", en: "I found the psychological depth of the protagonist particularly fascinating...", ml: "പ്രധാന കഥാപാത്രത്തിന്റെ മാനസിക തലങ്ങൾ എനിക്ക് വളരെ ആകർഷകമായി തോന്നി." },
        { step: "Relevanz & Fazit (Conclusion)", phrase: "Meines Erachtens vermittelt das Buch eine zeitlose Botschaft, die zum Nachdenken anregt.", en: "In my opinion, the book conveys a timeless message that stimulates reflection.", ml: "എന്റെ അഭിപ്രായത്തിൽ, ഈ പുസ്തകം ആഴത്തിൽ ചിന്തിപ്പിക്കുന്ന ഒരു സന്ദേശമാണ് നൽകുന്നത്." }
      ],
      examinerQuestions: [
        {
          question: "Denken Sie, dass die Thematik des Buches auch für die heutige Jugend noch relevant ist?",
          questionEn: "Do you think the book's theme is still relevant for today's youth?",
          questionMl: "ഈ പുസ്തകത്തിന്റെ ആശയം ഇന്നത്തെ യുവതലമുറയ്ക്കും പ്രസക്തമാണെന്ന് നിങ്ങൾ കരുതുന്നുണ്ടോ?",
          sampleAnswer: "Ja, absolut. Die Kernfragen nach Identität und gesellschaftlicher Verantwortung sind heutzutage sogar noch aktueller als je zuvor.",
          sampleAnswerEn: "Yes, absolutely. The fundamental questions about identity and social responsibility are even more topical today than ever before.",
          sampleAnswerMl: "തീർച്ചയായും. വ്യക്തിത്വം, സാമൂഹിക ഉത്തരവാദിത്തം എന്നിവയെക്കുറിച്ചുള്ള ചോദ്യങ്ങൾ ഇന്നത്തെ കാലത്ത് മുമ്പത്തേക്കാളും പ്രസക്തമാണ്."
        }
      ]
    },
    {
      id: "t1-film",
      title: "Thema: Ein Film oder eine Serie, die Sie beeindruckt hat",
      titleMl: "വിഷയം: നിങ്ങളെ ആകർഷിച്ച ഒരു സിനിമ അല്ലെങ്കിൽ വെബ് സീരീസ്",
      titleEn: "Topic: A Movie or Series That Impressed You",
      prompt: "Stellen Sie einen Film oder eine Dokumentation vor:\n• Titel, Regisseur und Genre des Films\n• Worum geht es im Inhalt?\n• Welche schauspielerische oder visuelle Leistung sticht hervor?\n• Welche gesellschaftliche oder ethische Frage wird aufgeworfen?\n• Für welches Publikum ist der Film empfehlenswert?",
      outline: [
        { step: "Einleitung (Intro)", phrase: "Heute widme ich meine Präsentation einem Film, der mich nachhaltig geprägt hat: '...'.", en: "Today I dedicate my presentation to a film that left a lasting impression on me: '...'.", ml: "എന്റെ മനസ്സിനെ ആഴത്തിൽ സ്വാധീനിച്ച ഒരു സിനിമയെക്കുറിച്ചാണ് ഞാൻ ഇന്ന് സംസാരിക്കുന്നത്." },
        { step: "Handlung (Plot)", phrase: "Die Handlung dreht sich um die spannende Geschichte von...", en: "The plot revolves around the captivating story of...", ml: "കഥ മുന്നോട്ട് പോകുന്നത് ... സംബന്ധിച്ച ഉദ്വേഗജനകമായ സംഭവങ്ങളിലൂടെയാണ്." },
        { step: "Reflexion (Reflection)", phrase: "Dieser Film wirft brisante Fragen auf bezüglich...", en: "This film raises pressing questions concerning...", ml: "ഈ സിനിമ ... സംബന്ധിച്ച കാതലായ ചോദ്യങ്ങൾ ഉയർത്തുന്നു." },
        { step: "Fazit (Conclusion)", phrase: "Zusammenfassend ist dieses Meisterwerk ein absolutes Muss für alle, die anspruchsvolles Kino schätzen.", en: "In conclusion, this masterpiece is an absolute must-watch for anyone who appreciates quality cinema.", ml: "ഉയർന്ന നിലവാരമുള്ള സിനിമകൾ ഇഷ്ടപ്പെടുന്നവർ തീർച്ചയായും കണ്ടിരിക്കേണ്ട ഒന്നാണിത്." }
      ],
      examinerQuestions: [
        {
          question: "Was unterscheidet diesen Film von typischen Hollywood-Blockbustern?",
          questionEn: "What distinguishes this film from typical Hollywood blockbusters?",
          questionMl: "സാധാരണ ഹോളിവുഡ് സിനിമകളിൽ നിന്ന് ഈ ചിത്രത്തെ വ്യത്യസ്തമാക്കുന്നത് എന്താണ്?",
          sampleAnswer: "Er verzichtet weitgehend auf oberflächliche Spezialeffekte und legt den Fokus ganz auf emotionale Tiefe und nuancierte Dialoge.",
          sampleAnswerEn: "It largely avoids superficial special effects, focusing entirely on emotional depth and nuanced dialogue.",
          sampleAnswerMl: "സാധാരണ ഗ്രാഫിക്സ് വിഷ്വലുകൾക്ക് പകരം കഥാപാത്രങ്ങളുടെ വൈകാരിക തലങ്ങൾക്കും ആഴമേറിയ സംഭാഷണങ്ങൾക്കുമാണ് ഇതിൽ മുൻഗണന നൽകിയിട്ടുള്ളത്."
        }
      ]
    },
    {
      id: "t1-person",
      title: "Thema: Eine wichtige Person in Ihrem Leben",
      titleMl: "വിഷയം: നിങ്ങളുടെ ജീവിതത്തെ സ്വാധീനിച്ച ഒരു പ്രധാന വ്യക്തി",
      titleEn: "Topic: An Important Person in Your Life",
      prompt: "Sprechen Sie über eine Person, die für Sie ein großes Vorbild ist:\n• Wer ist diese Person und wie stehen Sie zueinander?\n• Welche Charaktereigenschaften zeichnen sie besonders aus?\n• Welches konkrete Ereignis hat Ihre Bewunderung geprägt?\n• Wie hat diese Person Ihre Lebensentscheidungen oder Berufsplanung beeinflusst?",
      outline: [
        { step: "Einleitung (Intro)", phrase: "Es ist mir ein großes Anliegen, heute über ein echtes Vorbild in meinem Leben zu sprechen: meine/n...", en: "It is very important to me to speak today about a true role model in my life: my...", ml: "എന്റെ ജീവിതത്തിലെ ഒരു യഥാർത്ഥ മാതൃകയെക്കുറിച്ച് സംസാരിക്കാൻ ഞാൻ ആഗ്രഹിക്കുന്നു." },
        { step: "Eigenschaften (Traits)", phrase: "Was diese Persönlichkeit auszeichnet, ist ihr unermüdlicher Fleiß sowie ihr außergewöhnliches Einfühlungsvermögen.", en: "What distinguishes this person is tireless diligence and extraordinary empathy.", ml: "ഈ വ്യക്തിയെ വ്യത്യസ്തനാക്കുന്നത് കഠിനാധ്വാനവും മറ്റുള്ളവരോടുള്ള കാരുണ്യവുമാണ്." },
        { step: "Einfluss (Impact)", phrase: "Dank ihrer Ermutigung habe ich den Mut gefasst, neue Herausforderungen anzunehmen...", en: "Thanks to their encouragement, I gathered the courage to embrace new challenges...", ml: "അവരുടെ പ്രോത്സാഹനം കൊണ്ടാണ് പുതിയ വെല്ലുവിളികൾ ഏറ്റെടുക്കാൻ എനിക്ക് ധൈര്യം ലഭിച്ചത്." },
        { step: "Fazit (Conclusion)", phrase: "Zusammenfassend verdanke ich ihr einen großen Teil meiner persönlichen und beruflichen Reife.", en: "In summary, I owe them a large part of my personal and professional maturity.", ml: "എന്റെ വ്യക്തിപരവും തൊഴിൽപരവുമായ വളർച്ചയ്ക്ക് ഞാൻ അവരോട് ഏറെ കടപ്പെട്ടിരിക്കുന്നു." }
      ],
      examinerQuestions: [
        {
          question: "Welchen Ratschlag dieser Person befolgen Sie bis heute in Ihrem Alltag?",
          questionEn: "What piece of advice from this person do you still follow in your daily life?",
          questionMl: "ഈ വ്യക്തി തന്ന ഏത് ഉപദേശമാണ് നിങ്ങൾ ഇന്നും ജീവിതത്തിൽ പിന്തുടരുന്നത്?",
          sampleAnswer: "Vor allem den Grundsatz, auch in Krisensituationen stets Ruhe zu bewahren und lösungsorientiert zu handeln.",
          sampleAnswerEn: "Above all, the principle of always staying calm and acting solution-oriented even in crisis situations.",
          sampleAnswerMl: "പ്രതിസന്ധി ഘട്ടങ്ങളിലും മനസ്സാന്നിധ്യം കൈവിടാതെ പ്രശ്നപരിഹാരത്തിന് ശ്രമിക്കുക എന്ന നിർദ്ദേശമാണ് ഞാൻ എപ്പോഴും പിന്തുടരുന്നത്."
        }
      ]
    }
  ],

  // TEIL 2: DISKUSSION (CONTROVERSIAL TOPICS)
  teil2: [
    {
      id: "t2-vier-tage-woche",
      title: "Thema: Die Vier-Tage-Woche (Four-Day Work Week)",
      titleMl: "വിഷയം: ആഴ്ചയിൽ 4 പ്രവൃത്തിദിനങ്ങൾ (Four-Day Work Week)",
      titleEn: "Topic: Four-Day Work Week",
      contextText: "Immer mehr europäische Unternehmen testen das Modell der Vier-Tage-Woche bei gleichem Gehalt. Befürworter betonen eine höhere Produktivität, gesündere Work-Life-Balance und weniger Burnout. Kritiker befürchten jedoch Personalmangel, steigende Kosten für den Mittelstand und Engpässe in Pflege- und Dienstleistungsberufen.",
      contextTextMl: "ശമ്പളം കുറയ്ക്കാതെ ആഴ്ചയിൽ 4 ദിവസം മാത്രം ജോലി ചെയ്യുന്ന രീതി പല യൂറോപ്യൻ കമ്പനികളും പരീക്ഷിക്കുകയാണ്. ഇത് ജീവനക്കാരുടെ മാനസികാരോഗ്യം വർദ്ധിപ്പിക്കുമെന്നും ഉൽപ്പാദനക്ഷമത കൂട്ടുമെന്നും അനുകൂലികൾ വാദിക്കുന്നു. എന്നാൽ ആശുപത്രികൾ, സർവീസ് മേഖലകൾ എന്നിവയിൽ കടുത്ത ജീവനക്കാരുടെ കുറവുണ്ടാകുമെന്ന് എതിർക്കുന്നവർ ചൂണ്ടിക്കാണിക്കുന്നു.",
      contextTextEn: "More and more European companies are testing the four-day work week model with equal pay. Advocates highlight increased productivity and lower burnout, while critics fear labor shortages in healthcare and service sectors.",
      proArguments: [
        { de: "Steigerung der Motivation und Konzentrationsfähigkeit der Angestellten", en: "Increased employee motivation and focus", ml: "ജീവനക്കാരുടെ പ്രചോദനവും ഏകാഗ്രതയും വർദ്ധിക്കുന്നു" },
        { de: "Bessere Vereinbarkeit von Familie und Beruf", en: "Better balance between family life and career", ml: "കുടുംബജീവിതവും ജോലിയും തമ്മിൽ മികച്ച സന്തുലിതാവസ്ഥ സാധ്യമാകുന്നു" },
        { de: "Verringerung von Krankheitstagen und Burnout-Fällen", en: "Reduction in sick leave days and burnout cases", ml: "രോഗാവധി എടുക്കുന്നതും മാനസിക സമ്മർദ്ദവും കുറയുന്നു" }
      ],
      contraArguments: [
        { de: "Schwer umsetzbar in Schichtberufen wie der Krankenpflege oder Gastronomie", en: "Difficult to implement in shift work such as healthcare or hospitality", ml: "നഴ്സിംഗ്, ഹോട്ടൽ പോലുള്ള ഷിഫ്റ്റ് ജോലികളിൽ ഇത് പ്രാവർത്തികമാക്കാൻ പ്രയാസമാണ്" },
        { de: "Gefahr von Arbeitsverdichtung und erhöhtem Stress an den verbleibenden vier Tagen", en: "Risk of work intensification and stress over the remaining 4 days", ml: "ബാക്കി 4 ദിവസങ്ങളിൽ ജോലിഭാരവും ടെൻഷനും ക്രമാതീതമായി കൂടാൻ സാധ്യതയുണ്ട്" },
        { de: "Wirtschaftliche Belastung für kleinere mittelständische Unternehmen", en: "Financial burden for small and medium-sized enterprises", ml: "ചെറുകിട വ്യവസായങ്ങൾക്ക് അധിക സാമ്പത്തിക ബാധ്യത ഉണ്ടാക്കാം" }
      ],
      redemittelUsed: [
        { de: "Einerseits bietet dieses Modell Vorteile, andererseits...", en: "On one hand this model offers advantages, on the other hand...", ml: "ഒരു വശത്ത് ഈ രീതി ഗുണങ്ങൾ നൽകുമ്പോൾ, മറുവശത്ത്..." },
        { de: "Ich bin der festen Überzeugung, dass...", en: "I am firmly convinced that...", ml: "ഞാൻ ഉറച്ചു വിശ്വസിക്കുന്നത് എന്തെന്നാൽ..." },
        { de: "In diesem Punkt muss ich Ihnen allerdings widersprechen, weil...", en: "On this point, however, I must disagree with you because...", ml: "ഈ കാര്യത്തിൽ എനിക്ക് നിങ്ങളോട് വിയോജിക്കേണ്ടി വരുന്നു, കാരണം..." }
      ],
      examinerQuestions: [
        {
          question: "Wie könnte dieses Modell konkret in Krankenhäusern oder Seniorenheimen funktionieren, wo rund um die Uhr Personal benötigt wird?",
          questionEn: "How could this model function specifically in hospitals or nursing homes where staff is needed 24/7?",
          questionMl: "24 മണിക്കൂറും സ്റ്റാഫ് ആവശ്യമുള്ള ആശുപത്രികളിലും കെയർ ഹോമുകളിലും ഈ 4 ദിവസ രീതി എങ്ങനെ പ്രായോഗികമാക്കാം?",
          sampleAnswer: "Hier müsste man flexible Schichtmodelle einführen und vor allem durch attraktivere Arbeitsbedingungen mehr Fachkräfte aus dem Ausland anwerben, um die Schichten abzudecken.",
          sampleAnswerEn: "Here, flexible shift models would need to be introduced, alongside attracting more skilled international professionals through better working conditions.",
          sampleAnswerMl: "ഫ്ലെക്സിബിൾ ഷിഫ്റ്റുകൾ ഏർപ്പെടുത്തുകയും മികച്ച തൊഴിൽ അന്തരീക്ഷത്തിലൂടെ വിദേശത്തു നിന്ന് കൂടുതൽ ജീവനക്കാരെ ആകർഷിക്കുകയും ചെയ്യേണ്ടി വരും."
        }
      ]
    },
    {
      id: "t2-bargeld",
      title: "Thema: Soll Bargeld vollständig abgeschafft werden?",
      titleMl: "വിഷയം: ലിക്വിഡ് കറൻസി (പണം) പൂർണ്ണമായി നിർത്തലാക്കണമോ?",
      titleEn: "Topic: Should Cash Be Completely Abolished?",
      contextText: "Länder wie Schweden nutzen fast ausschließlich digitale Bezahlmethoden. Für viele bedeutet das mehr Komfort, schnellere Abläufe und effektivere Bekämpfung von Schwarzarbeit. In Deutschland und anderen Ländern betonen Bürger jedoch den Schutz der Privatsphäre, Unabhängigkeit von Banken und den Schutz älterer Menschen.",
      contextTextMl: "സ്വീഡൻ പോലുള്ള രാജ്യങ്ങൾ പൂർണ്ണമായും ഡിജിറ്റൽ പേയ്മെന്റുകളിലേക്ക് മാറി. ഇത് എളുപ്പമുള്ള ഇടപാടുകൾക്കും കള്ളപ്പണം തടയുന്നതിനും സഹായിക്കുന്നു. എന്നാൽ ഉപഭോക്താക്കളുടെ സ്വകാര്യത, പ്രായമായവർ അനുഭവിക്കുന്ന ബുദ്ധിമുട്ടുകൾ എന്നിവയാണ് എതിർവാദങ്ങൾ.",
      contextTextEn: "Countries like Sweden use almost exclusively digital payment methods. While it increases convenience and curbs illicit work, critics emphasize privacy protection and accessibility for the elderly.",
      proArguments: [
        { de: "Eindämmung von Steuerhinterziehung und Kriminalität", en: "Curbs tax evasion and financial crimes", ml: "നികുതി വെട്ടിപ്പും സാമ്പത്തിക കുറ്റകൃത്യങ്ങളും തടയുന്നു" },
        { de: "Zeitersparnis und hoher Komfort im Alltag", en: "Time savings and high everyday convenience", ml: "ദൈനംദിന ജീവിതത്തിൽ സമയലാഭവും സുഖസൗകര്യങ്ങളും" }
      ],
      contraArguments: [
        { de: "Verlust der Anonymität und totale Überwachung der Finanzen", en: "Loss of anonymity and comprehensive financial surveillance", ml: "സ്വകാര്യത നഷ്ടപ്പെടുകയും വ്യക്തിഗത സാമ്പത്തിക വിവരങ്ങൾ നിരീക്ഷിക്കപ്പെടുകയും ചെയ്യുന്നു" },
        { de: "Ausgrenzung von älteren Menschen und Menschen ohne Smartphone", en: "Marginalization of senior citizens and individuals without smartphones", ml: "സ്മാർട്ട്ഫോൺ ഉപയോഗിക്കാൻ അറിയാത്ത പ്രായമായ ആളുകൾ ഒറ്റപ്പെട്ടുപോകുന്നു" },
        { de: "Gefahr bei Systemausfällen oder Cyberangriffen", en: "Vulnerability to internet outages or cyber attacks", ml: "ഇന്റർനെറ്റ് തടസ്സപ്പെടുമ്പോഴോ സൈബർ ആക്രമണങ്ങൾ ഉണ്ടാകുമ്പോഴോ പണം ഇടപാടുകൾ നിലയ്ക്കുന്നു" }
      ],
      examinerQuestions: [
        {
          question: "Wie ist die Situation in Ihrem Heimatland bezüglich digitaler Bezahlmethoden?",
          questionEn: "What is the situation regarding digital payment methods in your home country?",
          questionMl: "നിങ്ങളുടെ മാതൃരാജ്യത്ത് ഡിജിറ്റൽ ഇടപാടുകളുടെ സ്ഥിതി എങ്ങനെയാണ്?",
          sampleAnswer: "In Indien beispielsweise hat das UPI-System das bargeldlose Bezahlen extrem vereinfacht. Dennoch bleibt Bargeld für den täglichen Grundbedarf vieler Menschen unerlässlich.",
          sampleAnswerEn: "In India, for instance, the UPI system has made cashless payments extremely simple. Nonetheless, cash remains essential for many people's daily needs.",
          sampleAnswerMl: "ഉദാഹരണത്തിന് ഇന്ത്യയിൽ UPI സംവിധാനം വന്നതോടെ ഡിജിറ്റൽ ഇടപാടുകൾ വളരെ എളുപ്പമായി. എങ്കിലും ദൈനംദിന ആവശ്യങ്ങൾക്ക് പണം ഇപ്പോഴും അനിവാര്യമാണ്."
        }
      ]
    },
    {
      id: "t2-tempolimit",
      title: "Thema: Generelles Tempolimit auf deutschen Autobahnen",
      titleMl: "വിഷയം: ജർമ്മൻ ഹൈവേകളിൽ (Autobahn) വേഗപരിധി ഏർപ്പെടുത്തണമോ?",
      titleEn: "Topic: General Speed Limit on German Highways",
      contextText: "Die Debatte um ein Tempolimit von 130 km/h auf Autobahnen spaltet Deutschland seit Jahren. Umweltverbände fordern es zur Reduktion von CO2-Emissionen und zur Erhöhung der Verkehrssicherheit. Gegner sehen darin eine Einschränkung der individuellen Freiheit.",
      contextTextMl: "ജർമ്മൻ ഓട്ടോബാനുകളിൽ 130 km/h വേഗപരിധി ഏർപ്പെടുത്തുന്നതിനെക്കുറിച്ചുള്ള ചർച്ചകൾ. പരിസ്ഥിതി സംരക്ഷണത്തിനും അപകടങ്ങൾ കുറയ്ക്കാനും ഇത് ആവശ്യമാണെന്ന് ഒരു വിഭാഗം വാദിക്കുന്നു, വ്യക്തിസ്വാതന്ത്ര്യത്തിന്റെ മേലുള്ള കടന്നുകയറ്റമാണെന്ന് മറുവിഭാഗവും.",
      contextTextEn: "The debate over a 130 km/h speed limit on German motorways has divided Germany for years. Environmental groups demand it to reduce emissions and improve safety, while opponents argue against restrictions on personal freedom.",
      proArguments: [
        { de: "Signifikante Senkung von Treibhausgasen und Spritverbrauch", en: "Significant reduction in greenhouse gas emissions and fuel consumption", ml: "കാർബൺ പുറന്തള്ളലും ഇന്ധന ഉപഭോഗവും ഗണ്യമായി കുറയ്ക്കുന്നു" },
        { de: "Drastische Reduzierung schwerer Unfälle mit Todesfolge", en: "Drastic reduction in severe and fatal highway accidents", ml: "മാരകമായ വാഹനാപകടങ്ങൾ വലിയ തോതിൽ കുറയ്ക്കുന്നു" }
      ],
      contraArguments: [
        { de: "Einschränkung der individuellen Freiheit der Autofahrer", en: "Restriction on drivers' personal freedom", ml: "ഡ്രൈവർമാരുടെ വ്യക്തിസ്വാതന്ത്ര്യത്തിന്മേലുള്ള നിയന്ത്രണം" },
        { de: "Geringer statistischer Beitrag zum gesamten Klimaschutz", en: "Relatively small statistical contribution to overall climate protection", ml: "ആഗോള കാലാവസ്ഥാ വ്യതിയാനത്തിൽ ഇതിന്റെ സ്വാധീനം താരതമ്യേന കുറവാണ്" }
      ],
      examinerQuestions: [
        {
          question: "Glauben Sie, dass ein Tempolimit auch den Verkehrsfluss auf langen Strecken harmonisieren könnte?",
          questionEn: "Do you believe a speed limit could harmonize traffic flow over long distances?",
          questionMl: "വേഗപരിധി ഏർപ്പെടുത്തിയാൽ ട്രാഫിക് തടസ്സങ്ങൾ കുറഞ്ഞ് യാത്ര സുഗമമാകുമെന്ന് കരുതുന്നുണ്ടോ?",
          sampleAnswer: "Ja, Studien zeigen deutlich, dass einheitliche Geschwindigkeiten Staus durch plötzliches Bremsen verhindern.",
          sampleAnswerEn: "Yes, studies clearly demonstrate that uniform speeds prevent traffic jams caused by sudden braking.",
          sampleAnswerMl: "അതെ, എല്ലാവരും ഒരേ വേഗതയിൽ പോകുമ്പോൾ പെട്ടെന്ന് ബ്രേക്ക് ചെയ്യേണ്ടി വരാത്തതിനാൽ ട്രാഫിക് ജാം കുറയുമെന്ന് പഠനങ്ങൾ തെളിയിക്കുന്നു."
        }
      ]
    }
  ],

  // TEIL 3: PROBLEMLÖSUNG / GEMEINSAM PLANEN
  teil3: [
    {
      id: "t3-abschiedsfeier",
      title: "Szenario: Abschiedsfeier für eine Kollegin / einen Kollegen organisieren",
      titleMl: "സാഹചര്യം: വിരമിക്കുന്ന സഹപ്രവർത്തകന് യാത്രയയപ്പ് ചടങ്ങ് സംഘടിപ്പിക്കുക",
      titleEn: "Scenario: Organizing a Farewell Party for a Colleague",
      situation: "Eine geschätzte Kollegin auf Ihrer Station verlässt nach vielen Jahren das Team. Sie und Ihr Prüfungspartner möchten eine gelungene Abschiedsfeier auf die Beine stellen.",
      situationMl: "നിങ്ങളുടെ ഹോസ്പിറ്റൽ വാർഡിലെ ഒരു പ്രിയപ്പെട്ട സഹപ്രവർത്തക ജോലി മാറുകയാണ്. നിങ്ങളും സഹപരീക്ഷാർത്ഥിയും ചേർന്ന് ഒരു മികച്ച യാത്രയയപ്പ് ചടങ്ങ് പ്ലാൻ ചെയ്യണം.",
      situationEn: "A valued colleague on your ward is leaving after many years. You and your exam partner want to organize a memorable farewell party.",
      tasks: [
        { point: "Wann und wo soll die Feier stattfinden?", en: "When and where should the celebration take place?", ml: "എപ്പോഴാണ്, എവിടെ വെച്ചാണ് പരിപാടി നടത്തേണ്ടത്?" },
        { point: "Was machen wir mit Essen und Getränken (Catering oder Mitbringparty)?", en: "Food and drink arrangements (catering vs. potluck party)", ml: "ഭക്ഷണവും പാനീയങ്ങളും എങ്ങനെ ഒരുക്കും?" },
        { point: "Welches Abschiedsgeschenk besorgen wir und wie viel Geld sammeln wir?", en: "Farewell gift and how much money to collect", ml: "എന്ത് സമ്മാനം നൽകണം, എത്ര തുക ശേഖരിക്കണം?" },
        { point: "Wie gestalten wir das Rahmenprogramm (Rede, Fotoalbum, Musik)?", en: "Program activities (speech, photo album, music)", ml: "പ്രസംഗം, ഫോട്ടോ ആൽബം തുടങ്ങിയ പരിപാടികൾ എങ്ങനെ പ്ലാൻ ചെയ്യും?" },
        { point: "Wer übernimmt welche Aufgaben?", en: "Who handles which responsibilities?", ml: "ആരൊക്കെ ഏതൊക്കെ ഉത്തരവാദിത്തങ്ങൾ ഏറ്റെടുക്കും?" }
      ],
      dialoguePrompts: [
        {
          role: "Prüfer / Partner",
          text: "Hallo! Wie du weißt, verlässt uns Frau Schmidt nächsten Monat. Wir sollten uns überlegen, wo wir die Feier am besten veranstalten. Was hältst du davon, wenn wir den Aufenthaltsraum der Klinik dekorieren?",
          en: "Hello! As you know, Mrs. Schmidt is leaving next month. We should think about the best venue. What do you think about decorating the hospital staff lounge?",
          ml: "ഹലോ! അടുത്ത മാസം ഫ്രോ സ്മിറ്റ് ജോലി മാറുന്നത് അറിഞ്ഞല്ലോ. എവിടെ വെച്ച് പാർട്ടി നടത്തണമെന്ന് പ്ലാൻ ചെയ്യണം. ഹോസ്പിറ്റലിലെ സ്റ്റാഫ് റൂം ഡെക്കറേറ്റ് ചെയ്ത് അവിടെ വെച്ച് നടത്തിയാൽ എങ്ങനെയുണ്ടാകും?"
        },
        {
          role: "User B2 Vorschlag",
          suggestion: "Das ist an sich ein guter Gedanke, allerdings ist der Aufenthaltsraum ziemlich beengt. Wie wäre es stattdessen, wenn wir bei gutem Wetter im Klinikgarten feiern oder einen Tisch in einem nahegelegenen Restaurant reservieren?",
          en: "That is a good idea in itself, but the lounge is quite cramped. How about celebrating in the hospital garden if weather permits, or reserving a table at a nearby restaurant?",
          ml: "നല്ല ആശയമാണ്, എങ്കിലും സ്റ്റാഫ് റൂം വളരെ ചെറുതാണ്. നല്ല കാലാവസ്ഥയാണെങ്കിൽ ഹോസ്പിറ്റൽ ഗാർഡനിൽ വെച്ച് നടത്തിയാലോ, അല്ലെങ്കിൽ അടുത്തുള്ള റസ്റ്റോറന്റിൽ ടേബിൾ ബുക്ക് ചെയ്താലോ?"
        }
      ]
    },
    {
      id: "t3-betriebsausflug",
      title: "Szenario: Betriebsausflug für das Pflegeteam planen",
      titleMl: "സാഹചര്യം: നഴ്സിംഗ് ടീമിനായി ഒരു സ്റ്റാഫ് ടൂർ (Day Out) പ്ലാൻ ചെയ്യുക",
      titleEn: "Scenario: Planning a Team Outing for Nursing Staff",
      situation: "Ihr Arbeitgeber stellt ein Budget für einen gemeinsamen Teamausflug bereit, um den Zusammenhalt zu stärken. Planen Sie den Tagesablauf gemeinsam.",
      situationMl: "ടീം അംഗങ്ങൾ തമ്മിലുള്ള ഐക്യം വർദ്ധിപ്പിക്കാൻ ഒരു ഡേ-ഔട്ട് പ്ലാൻ ചെയ്യാൻ മാനേജ്മെന്റ് ഫണ്ട് നൽകിയിട്ടുണ്ട്. ഒരു ദിവസത്തെ ടൂർ പ്ലാൻ ചെയ്യുക.",
      situationEn: "Your employer provides a budget for a team outing to strengthen team cohesion. Plan the itinerary together.",
      tasks: [
        { point: "Reiseziel und Art der Aktivität (Wanderung, Stadtbesichtigung, Kanufahrt)", en: "Destination and activity (hiking, city tour, canoeing)", ml: "ലക്ഷ്യസ്ഥാനവും പ്രവർത്തനങ്ങളും (ട്രക്കിംഗ്, ബോട്ടിംഗ് മുതലായവ)" },
        { point: "Transportmittel (Bus mieten, Bahn oder Fahrgemeinschaften)", en: "Transportation (charter bus, train, carpooling)", ml: "യാത്രാ മാർഗ്ഗം (ബസ്, ട്രെയിൻ മുതലായവ)" },
        { point: "Verpflegung während des Ausflugs", en: "Food and catering during the trip", ml: "ഭക്ഷണ ക്രമീകരണങ്ങൾ" },
        { point: "Planung bei schlechtem Wetter (Schlechtwetter-Alternative)", en: "Contingency plan in case of bad weather", ml: "മഴ പെയ്താൽ ചെയ്യാനുള്ള ബദൽ പ്ലാൻ" }
      ]
    },
    {
      id: "t3-infotag",
      title: "Szenario: 'Tag der offenen Tür' im Gesundheitszentrum organisieren",
      titleMl: "സാഹചര്യം: ഹെൽത്ത് സെന്ററിൽ 'ഓപ്പൺ ഡേ' (Infotag) സംഘടിപ്പിക്കുക",
      titleEn: "Scenario: Organizing an Open Day at the Healthcare Center",
      situation: "Ihr Zentrum möchte neue Auszubildende und Fachkräfte ansprechen. Sie planen gemeinsam einen Informationstag für interessierte Besucher.",
      situationMl: "പുതിയ വിദ്യാർത്ഥികളെയും ഉദ്യോഗാർത്ഥികളെയും ആകർഷിക്കാൻ ഹെൽത്ത് സെന്ററിൽ ഒരു ഓപ്പൺ ഡേ സംഘടിപ്പിക്കുന്നു. അതിന്റെ വിശദാംശങ്ങൾ ആസൂത്രണം ചെയ്യുക.",
      situationEn: "Your center wants to attract new trainees and skilled nurses. Together you plan an open information day for visitors.",
      tasks: [
        { point: "Zielgruppe und Werbung (Flyer, Social Media, Lokale Zeitungen)", en: "Target group and advertising (flyers, social media, local press)", ml: "ലക്ഷ്യമിടുന്ന ആളുകളും പരസ്യ പ്രചാരണവും" },
        { point: "Vorträge und Workshops vor Ort", en: "Presentations and hands-on workshops", ml: "ക്ലാസുകളും വർക്ക്ഷോപ്പുകളും" },
        { point: "Führungen durch die Abteilungen", en: "Guided tours through clinic departments", ml: "സ്ഥാപനം ചുറ്റിക്കാണിക്കൽ (ഗൈഡഡ് ടൂർ)" },
        { point: "Verpflegung der Gäste und Zeitplan", en: "Refreshments for guests and schedule", ml: "അതിഥികൾക്കുള്ള ഭക്ഷണവും സമയക്രമവും" }
      ]
    }
  ],

  // B2 REDEMITTEL (ESSENTIAL PHRASES WITH MALAYALAM)
  redemittel: {
    teil1: [
      {
        category: "Strukturierung der Präsentation (അവതരണത്തിന്റെ ക്രമീകരണം)",
        phrases: [
          { de: "Ich habe mein Thema in drei wesentliche Abschnitte unterteilt.", en: "I have divided my topic into three main sections.", ml: "എന്റെ വിഷയം ഞാൻ മൂന്ന് പ്രധാന ഭാഗങ്ങളായി തിരിച്ചിരിക്കുന്നു." },
          { de: "Zunächst gehe ich auf ..., anschließend beleuchte ich ... und zum Schluss...", en: "First I will address ..., then I will shed light on ..., and finally...", ml: "ആദ്യം ഞാൻ ... നെക്കുറിച്ചും, തുടർന്ന് ... നെക്കുറിച്ചും, ഒടുവിൽ ... നെക്കുറിച്ചും സംസാരിക്കും." },
          { de: "Lassen Sie mich nun zum nächsten Aspekt übergehen.", en: "Let me now move on to the next aspect.", ml: "ഇനി അടുത്ത കാര്യത്തിലേക്ക് കടക്കാൻ എന്നെ അനുവദിക്കുക." }
        ]
      },
      {
        category: "Eigene Meinung & Schlussfolgerung (അഭിപ്രായവും ഉപസംഹാരവും)",
        phrases: [
          { de: "Meines Erachtens spielt dieser Faktor eine ausschlaggebende Rolle.", en: "In my opinion, this factor plays a decisive role.", ml: "എന്റെ അഭിപ്രായത്തിൽ ഈ ഘടകം ഒരു നിർണ്ണായക പങ്ക് വഹിക്കുന്നുണ്ട്." },
          { de: "Aus meiner persönlichen Erfahrung kann ich bestätigen, dass...", en: "From my personal experience I can confirm that...", ml: "എന്റെ വ്യക്തിപരമായ അനുഭവത്തിൽ നിന്ന് എനിക്ക് ഉറപ്പിച്ചു പറയാൻ കഴിയും..." },
          { de: "Zusammenfassend lässt sich festhalten, dass...", en: "In summary, it can be stated that...", ml: "ചുരുക്കത്തിൽ വ്യക്തമാക്കാൻ സാധിക്കുന്നത് എന്തെന്നാൽ..." }
        ]
      }
    ],
    teil2: [
      {
        category: "Meinung äußern & Argumentieren (അഭിപ്രായം പ്രകടിപ്പിക്കൽ)",
        phrases: [
          { de: "Ich vertrete den Standpunkt, dass...", en: "I take the standpoint that...", ml: "ഞാൻ മുന്നോട്ട് വെക്കുന്ന നിലപാട് എന്തെന്നാൽ..." },
          { de: "Man sollte allerdings nicht außer Acht lassen, dass...", en: "One should not ignore, however, that...", ml: "എങ്കിലും നാം വിസ്മരിക്കാൻ പാടില്ലാത്ത ഒരു കാര്യം..." },
          { de: "Das stärkste Argument dafür/dagegen ist meiner Ansicht nach...", en: "The strongest argument for/against this in my view is...", ml: "ഇതിന് അനുകൂലമായ/എതിരായ ഏറ്റവും ശക്തമായ വാദം..." }
        ]
      },
      {
        category: "Zustimmung & Widerspruch (യോജിപ്പും വിയോജിപ്പും)",
        phrases: [
          { de: "Da stimme ich Ihnen voll und ganz zu.", en: "I completely agree with you on that.", ml: "ആ കാര്യത്തിൽ ഞാൻ നിങ്ങളോട് പൂർണ്ണമായും യോജിക്കുന്നു." },
          { de: "Bis zu einem gewissen Grad haben Sie recht, aber...", en: "To a certain extent you are right, but...", ml: "ഒരു പരിധി വരെ നിങ്ങൾ പറയുന്നത് ശരിയാണ്, എങ്കിലും..." },
          { de: "Da bin ich ganz anderer Meinung, denn...", en: "I hold a completely different opinion there, because...", ml: "ആ കാര്യത്തിൽ എനിക്ക് തികച്ചും വ്യത്യസ്തമായ അഭിപ്രായമാണുള്ളത്, കാരണം..." }
        ]
      }
    ],
    teil3: [
      {
        category: "Vorschläge machen & Verhandeln (നിർദ്ദേശങ്ങളും ഒത്തുതീർപ്പുകളും)",
        phrases: [
          { de: "Was hältst du davon, wenn wir...?", en: "What do you think if we...?", ml: "നമ്മൾ ... ചെയ്താൽ എങ്ങനെയുണ്ടാകും?" },
          { de: "Wir sollten unbedingt berücksichtigen, dass...", en: "We should definitely take into account that...", ml: "നാം തീർച്ചയായും പരിഗണിക്കേണ്ട ഒരു കാര്യം..." },
          { de: "Könnten wir uns vielleicht darauf einigen, dass...?", en: "Could we perhaps agree on that...?", ml: "നമുക്ക് ആ കാര്യത്തിൽ ഒരു തീരുമാനത്തിൽ എത്താമായിരുന്നോ?" },
          { de: "Wer könnte sich um ... kümmern? Ich würde vorschlagen, dass ich...", en: "Who could take care of ...? I'd suggest that I...", ml: "ആർക്കാണ് ... ന്റെ ഉത്തരവാദിത്തം ഏറ്റെടുക്കാൻ കഴിയുക? ഞാൻ ... ചെയ്യാമെന്ന് നിർദ്ദേശിക്കുന്നു." }
        ]
      }
    ]
  },

  // NOMEN-VERB-VERBINDUNGEN (B2 SPECIAL DRILL)
  nvvList: [
    { nvv: "eine Entscheidung treffen", verb: "entscheiden", en: "to make a decision", ml: "ഒരു തീരുമാനമെടുക്കുക", ex: "Wir müssen zeitnah eine wichtige Entscheidung treffen." },
    { nvv: "zur Verfügung stehen", verb: "vorhanden sein", en: "to be available", ml: "ലഭ്യമായിരിക്കുക", ex: "Für Fragen stehe ich Ihnen jederzeit gerne zur Verfügung." },
    { nvv: "in Betracht ziehen", verb: "berücksichtigen / überlegen", en: "to consider / take into account", ml: "പരിഗണിക്കുക", ex: "Wir sollten auch alternative Lösungen in Betracht ziehen." },
    { nvv: "Kritik üben an (+ Dat)", verb: "kritisieren", en: "to criticize", ml: "വിമർശിക്കുക", ex: "Der Prüfer übte konstruktive Kritik an der Argumentation." },
    { nvv: "in Frage kommen", verb: "möglich / relevant sein", en: "to be out of the question / in question", ml: "പ്രസക്തമായിരിക്കുക / പരിഗണനയിലുണ്ടാവുക", ex: "Diese Option kommt für uns leider nicht in Frage." },
    { nvv: "Einfluss ausüben auf (+ Akk)", verb: "beeinflussen", en: "to exert influence on", ml: "സ്വാധീനം ചെലുത്തുക", ex: "Soziale Medien üben einen großen Einfluss auf Jugendliche aus." },
    { nvv: "Bezug nehmen auf (+ Akk)", verb: "sich beziehen auf", en: "to refer to", ml: "പരാമർശിക്കുക", ex: "Ich möchte kurz Bezug auf Ihren vorherigen Punkt nehmen." },
    { nvv: "eine Rolle spielen", verb: "wichtig sein", en: "to play an important role", ml: "പ്രധാന പങ്ക് വഹിക്കുക", ex: "Die finanzielle Lage spielt hierbei eine untergeordnete Rolle." },
    { nvv: "zum Ausdruck bringen", verb: "ausdrücken / äußern", en: "to express", ml: "വ്യക്തമാക്കുക / പ്രകടിപ്പിക്കുക", ex: "Ich möchte meine tiefste Dankbarkeit zum Ausdruck bringen." },
    { nvv: "Maßnahmen ergreifen", verb: "handeln / aktiv werden", en: "to take measures", ml: "നടപടികൾ സ്വീകരിക്കുക", ex: "Die Klinikleitung muss dringend wirksame Maßnahmen ergreifen." },
    { nvv: "in Anspruch nehmen", verb: "beanspruchen / nutzen", en: "to make use of / take up", ml: "പ്രയോജനപ്പെടുത്തുക / ഉപയോഗിക്കുക", ex: "Sie können die professionelle Beratung jederzeit in Anspruch nehmen." },
    { nvv: "Verantwortung tragen für (+ Akk)", verb: "verantwortlich sein", en: "to bear responsibility for", ml: "ഉത്തരവാദിത്തം വഹിക്കുക", ex: "Pflegekräfte tragen eine enorme Verantwortung für das Wohl der Patienten." },
    { nvv: "in Kenntnis setzen über (+ Akk)", verb: "informieren", en: "to inform / notify", ml: "വിവരം അറിയിക്കുക", ex: "Wir werden Sie über die Testergebnisse umgehend in Kenntnis setzen." },
    { nvv: "einen Beitrag leisten zu (+ Dat)", verb: "beitragen", en: "to make a contribution to", ml: "സംഭാവന നൽകുക", ex: "Jeder Mitarbeiter kann einen wertvollen Beitrag zum Teamerfolg leisten." }
  ]
};

// Export to window
if (typeof window !== 'undefined') {
  window.TELC_B2_DATA = TELC_B2_DATA;
}

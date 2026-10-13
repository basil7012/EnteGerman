/**
 * Telc B2 Oral Examiner Logic & AI Assessment Engine
 * Evaluates student responses against official Telc criteria:
 * - Ausdrucksfähigkeit (B2 Vocabulary, Redemittel, NVV)
 * - Aufgabenbewältigung (Task fulfillment, length, structure)
 * - Formale Richtigkeit (Grammar, Nebensatz word order)
 * Provides trilingual feedback: German, English, and Malayalam!
 */

class TelcExaminer {
  constructor() {
    this.name = "Frau Dr. Weber";
    this.title = "Zertifizierte telc B2 Prüferin";
  }

  // Analyze student speech/text
  evaluateResponse(userText, taskType, taskContext) {
    const text = userText.trim();
    const wordCount = text.split(/\s+/).filter(Boolean).length;

    // Analysis metrics
    const findings = {
      wordCount: wordCount,
      scoreTotal: 0, // max 100
      ratings: {
        ausdruck: 0,      // Ausdrucksfähigkeit (B2 Vocab & NVV)
        aufgabe: 0,       // Aufgabenbewältigung
        grammatik: 0,     // Formale Richtigkeit
        fluency: 0        // Kohärenz & Struktur
      },
      detectedConnectors: [],
      detectedNVV: [],
      detectedRedemittel: [],
      grammarAlerts: [],
      improvements: [],
      malayalamFeedback: "",
      englishFeedback: "",
      germanExaminerComment: ""
    };

    if (wordCount < 10) {
      findings.ratings = { ausdruck: 20, aufgabe: 25, grammatik: 40, fluency: 30 };
      findings.scoreTotal = 28;
      findings.germanExaminerComment = "Ihre Antwort ist leider zu kurz für das B2-Niveau. In der telc B2 Prüfung müssen Sie zusammenhängend argumentieren und Ihre Gedanken ausführlich begründen.";
      findings.englishFeedback = "Your response is too short for Telc B2. Aim for at least 3 to 5 well-developed sentences with B2 connectors.";
      findings.malayalamFeedback = "നിങ്ങളുടെ മറുപടി B2 ലെവലിന് വളരെ ചെറുതാണ്. telc B2 പരീക്ഷയിൽ ആശയങ്ങൾ വിശദമായി വാദങ്ങളോടെയും ഉദാഹരണങ്ങളോടെയും അവതരിപ്പിക്കേണ്ടതുണ്ട് (കുറഞ്ഞത് 3-5 പൂർണ്ണ വാക്യങ്ങൾ).";
      return findings;
    }

    // 1. Check Connectors (Konnektoren)
    const connectors = [
      { term: "weil", type: "sub" },
      { term: "da", type: "sub" },
      { term: "obwohl", type: "sub" },
      { term: "sodass", type: "sub" },
      { term: "während", type: "sub" },
      { term: "nachdem", type: "sub" },
      { term: "bevor", type: "sub" },
      { term: "falls", type: "sub" },
      { term: "deshalb", type: "adv" },
      { term: "deswegen", type: "adv" },
      { term: "daher", type: "adv" },
      { term: "trotzdem", type: "adv" },
      { term: "einerseits", type: "two-part" },
      { term: "andererseits", type: "two-part" },
      { term: "nicht nur", type: "two-part" },
      { term: "sondern auch", type: "two-part" },
      { term: "sowohl", type: "two-part" },
      { term: "als auch", type: "two-part" },
      { term: "entweder", type: "two-part" },
      { term: "oder", type: "two-part" },
      { term: "weder", type: "two-part" },
      { term: "noch", type: "two-part" }
    ];

    connectors.forEach(c => {
      const regex = new RegExp(`\\b${c.term}\\b`, 'i');
      if (regex.test(text)) {
        findings.detectedConnectors.push(c.term);
      }
    });

    // 2. Check Nomen-Verb-Verbindungen (NVV)
    const nvvKeywords = [
      { pattern: /entscheidung.*treff/i, name: "eine Entscheidung treffen" },
      { pattern: /verfügung.*steh/i, name: "zur Verfügung stehen" },
      { pattern: /betracht.*zieh/i, name: "in Betracht ziehen" },
      { pattern: /rolle.*spiel/i, name: "eine Rolle spielen" },
      { pattern: /frage.*komm/i, name: "in Frage kommen" },
      { pattern: /kritik.*üb/i, name: "Kritik üben an" },
      { pattern: /einfluss.*ausüb/i, name: "Einfluss ausüben auf" },
      { pattern: /bezug.*nehm/i, name: "Bezug nehmen auf" },
      { pattern: /ausdruck.*bring/i, name: "zum Ausdruck bringen" },
      { pattern: /maßnahme.*ergreif/i, name: "Maßnahmen ergreifen" },
      { pattern: /anspruch.*nehm/i, name: "in Anspruch nehmen" },
      { pattern: /verantwortung.*trag/i, name: "Verantwortung tragen" },
      { pattern: /kenntnis.*setz/i, name: "in Kenntnis setzen" },
      { pattern: /beitrag.*leist/i, name: "einen Beitrag leisten" }
    ];

    nvvKeywords.forEach(k => {
      if (k.pattern.test(text)) {
        findings.detectedNVV.push(k.name);
      }
    });

    // 3. Check B2 Phrases (Redemittel)
    const b2Phrases = [
      { pattern: /meines erachtens/i, phrase: "Meines Erachtens..." },
      { pattern: /ich bin der (festen )?ansicht/i, phrase: "Ich bin der Ansicht..." },
      { pattern: /ich vertrete den standpunkt/i, phrase: "Ich vertrete den Standpunkt..." },
      { pattern: /zusammenfassend lässt sich/i, phrase: "Zusammenfassend lässt sich sagen..." },
      { pattern: /im gegensatz dazu/i, phrase: "Im Gegensatz dazu..." },
      { pattern: /was mich betrifft/i, phrase: "Was mich betrifft..." },
      { pattern: /wie wäre es,? wenn/i, phrase: "Wie wäre es, wenn...?" },
      { pattern: /ich schlage vor/i, phrase: "Ich schlage vor..." }
    ];

    b2Phrases.forEach(p => {
      if (p.pattern.test(text)) {
        findings.detectedRedemittel.push(p.phrase);
      }
    });

    // 4. Grammar checks (Malayalam learner specific errors: Nebensatz verb order)
    const weilMatch = text.match(/\bweil\s+([a-zA-Zäöüß]+)\s+(ist|kann|muss|will|hat|wird|geht)\b/i);
    if (weilMatch) {
      findings.grammarAlerts.push({
        type: "Nebensatz Word Order",
        rule: `Achtung: Nach 'weil' muss das konjugierte Verb ans Ende! (e.g. 'weil ... ${weilMatch[2]}', nicht 'weil ${weilMatch[1]} ${weilMatch[2]}').`,
        ml: `മുന്നറിയിപ്പ്: 'weil' വന്നാൽ ക്രിയ (${weilMatch[2]}) വാക്യത്തിന്റെ അവസാനമാണ് വരേണ്ടത്. മലയാളി വിദ്യാർത്ഥികൾ സാധാരണ വരുത്തുന്ന തെറ്റാണിത്.`
      });
    }

    const dassMatch = text.match(/\bdass\s+([a-zA-Zäöüß]+)\s+(ist|kann|muss|hat|wird)\b/i);
    if (dassMatch) {
      findings.grammarAlerts.push({
        type: "Dass-Satz Word Order",
        rule: `Achtung: Nach 'dass' gehört das finite Verb ans Satzende!`,
        ml: `'dass' ഉപയോഗിക്കുമ്പോൾ ക്രിയ (${dassMatch[2]}) വാക്യത്തിന്റെ അവസാനത്തിലേക്ക് മാറ്റുക.`
      });
    }

    // 5. Topic Relevance & Themaverfehlung Detection
    const topicKeywordsMap = {
      "t1-reise": ["reise", "reisen", "urlaub", "unterkunft", "hotel", "sehenswürdigkeit", "flug", "zug", "strand", "berge", "land", "stadt", "ausland", "kultur", "tourist", "ziel", "fahrt", "landschaft", "erlebnis", "besuch"],
      "t1-buch": ["buch", "bücher", "autor", "schriftsteller", "lesen", "gelesen", "handlung", "roman", "protagonist", "figur", "charakter", "kapitel", "geschichte", "titel", "werk", "literatur", "seite"],
      "t1-film": ["film", "filme", "serie", "serien", "kino", "schauspieler", "darsteller", "regisseur", "regie", "szene", "handlung", "kamera", "episode", "folge", "leinwand", "genre", "dokumentation"],
      "t1-person": ["person", "vorbild", "mutter", "vater", "eltern", "freund", "freundin", "kollege", "kollegin", "lehrer", "familie", "bruder", "schwester", "mensch", "charakter", "eigenschaft", "geprägt", "leben"],
      "t2-vier-tage-woche": ["vier-tage-woche", "arbeit", "arbeiten", "arbeitszeit", "woche", "tage", "gehalt", "lohn", "produktivität", "work-life-balance", "burnout", "angestellte", "schicht", "schichtarbeit", "pflege", "überstunden"],
      "t2-bargeld": ["bargeld", "geld", "bar", "bezahlen", "zahlung", "digital", "karte", "kartenzahlung", "münzen", "scheine", "bank", "konto", "finanzen", "überweisung", "kreditkarte", "anonym", "schwarzarbeit"],
      "t2-tempolimit": ["tempolimit", "autobahn", "geschwindigkeit", "tempo", "km/h", "fahren", "auto", "autos", "verkehr", "sicherheit", "unfall", "unfälle", "co2", "emissionen", "klima", "klimaschutz", "umwelt", "sprit", "benzin"],
      "t3-abschiedsfeier": ["abschied", "abschiedsfeier", "feier", "party", "kollegin", "kollege", "team", "station", "klinik", "geschenk", "essen", "getränke", "catering", "buffet", "aufenthaltsraum", "restaurant", "rede", "foto"],
      "t3-betriebsausflug": ["ausflug", "betriebsausflug", "teamausflug", "team", "kollegen", "wanderung", "wandern", "kanu", "bus", "bahn", "zug", "fahrt", "ziel", "verpflegung", "wetter", "programm"],
      "t3-infotag": ["infotag", "informationstag", "offenen tür", "gesundheitszentrum", "klinik", "krankenhaus", "azubi", "auszubildende", "ausbildung", "fachkräfte", "besucher", "gäste", "werbung", "flyer", "vortrag", "workshop", "führung"]
    };

    // Extract dynamic keywords from task context
    let expectedKeywords = [];
    let taskTitleDe = taskContext && taskContext.title ? taskContext.title : "Thema";
    let taskTitleMl = taskContext && taskContext.titleMl ? taskContext.titleMl : taskTitleDe;
    let taskTitleEn = taskContext && taskContext.titleEn ? taskContext.titleEn : taskTitleDe;

    if (taskContext && taskContext.id && topicKeywordsMap[taskContext.id]) {
      expectedKeywords = [...topicKeywordsMap[taskContext.id]];
    }

    if (taskContext) {
      const combinedTaskInfo = [
        taskContext.title || '',
        taskContext.prompt || '',
        taskContext.contextText || '',
        taskContext.situation || ''
      ].join(' ');

      const stopWords = new Set(["thema", "szenario", "diskussion", "sie", "ihre", "ihr", "oder", "und", "der", "die", "das", "ein", "eine", "einer", "einem", "einen", "für", "mit", "von", "bei", "nach", "über", "unter", "kann", "muss", "soll", "wird", "sind", "haben", "sein", "dass", "weil", "wenn", "aber", "auch", "sehr", "mehr", "immer", "alle"]);
      const extractedWords = combinedTaskInfo.toLowerCase().match(/[a-zäöüß]{4,}/g) || [];
      extractedWords.forEach(w => {
        if (!stopWords.has(w) && !expectedKeywords.includes(w)) {
          expectedKeywords.push(w);
        }
      });
    }

    // Match keywords against user text
    const matchedTopicKeywords = [];
    const lowerText = text.toLowerCase();
    expectedKeywords.forEach(kw => {
      const kwRegex = new RegExp(`\\b${kw}`, 'i');
      if (kwRegex.test(lowerText) && !matchedTopicKeywords.includes(kw)) {
        matchedTopicKeywords.push(kw);
      }
    });

    findings.matchedTopicKeywords = matchedTopicKeywords;
    findings.expectedTopicTitle = taskTitleDe;

    // Determine Themaverfehlung
    // If student produced at least 15 words and matched 0 topic keywords, or produced > 45 words with < 2 keywords
    let isThemaverfehlung = false;
    let themenBezugScore = 0;

    if (expectedKeywords.length > 0 && wordCount >= 15) {
      if (matchedTopicKeywords.length === 0) {
        isThemaverfehlung = true;
        themenBezugScore = 15;
      } else if (wordCount >= 45 && matchedTopicKeywords.length < 2) {
        isThemaverfehlung = true;
        themenBezugScore = 25;
      } else {
        themenBezugScore = Math.min(100, 40 + (matchedTopicKeywords.length * 15));
      }
    } else {
      themenBezugScore = 70;
    }

    findings.isThemaverfehlung = isThemaverfehlung;
    findings.themenBezug = themenBezugScore;

    // 6. Score calculation (Telc B2 Rubric)
    // Task fulfillment (Aufgabenbewältigung)
    let aufgabeScore = 0;
    if (isThemaverfehlung) {
      // In telc B2: Themaverfehlung = Grade D in Criterion A (max 20 - 25 points)
      aufgabeScore = Math.min(25, Math.max(10, matchedTopicKeywords.length * 10));
    } else {
      let baseLengthScore = Math.min(85, Math.max(40, wordCount * 1.4));
      if (wordCount > 60) baseLengthScore = Math.min(95, 75 + Math.min(20, wordCount / 5));
      aufgabeScore = Math.round((baseLengthScore * 0.5) + (themenBezugScore * 0.5));
      aufgabeScore = Math.min(98, Math.max(45, aufgabeScore));
    }

    // Ausdrucksfähigkeit
    let ausdruckScore = 55;
    ausdruckScore += findings.detectedConnectors.length * 6;
    ausdruckScore += findings.detectedNVV.length * 12;
    ausdruckScore += findings.detectedRedemittel.length * 8;
    ausdruckScore = Math.min(98, Math.max(45, ausdruckScore));

    // Grammatik
    let grammatikScore = 80;
    if (findings.grammarAlerts.length > 0) {
      grammatikScore -= (findings.grammarAlerts.length * 15);
    }
    grammatikScore = Math.max(40, grammatikScore);

    // Fluency / Structure
    let fluencyScore = 60 + (findings.detectedConnectors.length * 7);
    fluencyScore = Math.min(95, Math.max(50, fluencyScore));

    findings.ratings.aufgabe = Math.round(aufgabeScore);
    findings.ratings.ausdruck = Math.round(ausdruckScore);
    findings.ratings.grammatik = Math.round(grammatikScore);
    findings.ratings.fluency = Math.round(fluencyScore);

    let rawScore = (findings.ratings.aufgabe * 0.35) +
                   (findings.ratings.ausdruck * 0.25) +
                   (findings.ratings.grammatik * 0.25) +
                   (findings.ratings.fluency * 0.15);

    // In Telc B2, Themaverfehlung automatically prevents a pass grade (max 48 points)
    if (isThemaverfehlung) {
      findings.scoreTotal = Math.min(48, Math.round(rawScore));
    } else {
      findings.scoreTotal = Math.round(rawScore);
    }

    // Generate constructive feedback comments
    if (isThemaverfehlung) {
      findings.germanExaminerComment = `Themaverfehlung: Ihre Ausführungen gehen nicht auf das vorgegebene Thema ein (${taskTitleDe}). In der telc B2 Prüfung müssen Sie exakt die gestellte Aufgabe bearbeiten. Das Auswendiglernen allgemeiner Sätze ohne Themenbezug führt zum Nichtbestehen im Kriterium Aufgabenbewältigung (maximal Stufe D).`;
      findings.englishFeedback = `Off-Topic Response (Themaverfehlung): Your response fails to address the designated topic ("${taskTitleEn}"). In official Telc B2 exams, speaking on the wrong topic caps Task Fulfillment at Grade D, causing an overall failure even if your grammar is sound.`;
      findings.malayalamFeedback = `വിഷയം മാറിയുള്ള സംസാരം (Themaverfehlung / Off-Topic): നിങ്ങൾ സംസാരിച്ചത് നൽകിയിരിക്കുന്ന വിഷയവുമായി ('${taskTitleMl}') ബന്ധപ്പെട്ടതല്ല. telc B2 പരീക്ഷയിൽ വിഷയം തെറ്റിയാൽ 'Aufgabenbewältigung'-ൽ പരമാവധി 20-25% മാർക്ക് മാത്രമേ ലഭിക്കൂ, പരീക്ഷയിൽ പരാജയപ്പെടുകയും (Fail) ചെയ്യും. വ്യാകരണം എത്ര മികച്ചതാണെങ്കിലും നൽകിയിരിക്കുന്ന വിഷയം തന്നെ സംസാരിക്കണം.`;
    } else if (findings.scoreTotal >= 75) {
      findings.germanExaminerComment = `Sehr gute Leistung! Sie haben das Thema („${taskTitleDe}“) überzeugend bearbeitet und B2-relevante Strukturen gezeigt. Ihre Aufgabenbewältigung und Ausdrucksfähigkeit sind angemessen und klar strukturiert.`;
      findings.englishFeedback = `Great performance! You demonstrated solid B2 structures, stayed focused on the topic ("${taskTitleEn}"), and reasoned clearly. Keep using advanced collocations like this!`;
      findings.malayalamFeedback = `മികച്ച പ്രകടനം! നിങ്ങൾ നൽകിയിരിക്കുന്ന വിഷയത്തെക്കുറിച്ച് ('${taskTitleMl}') കൃത്യമായി സംസാരിക്കുകയും മികച്ച രീതിയിൽ B2 വാക്യഘടനകളും കണക്ടറുകളും ഉപയോഗിക്കുകയും ചെയ്തു. telc പരീക്ഷയിൽ ഈ രീതി തുടർന്നാൽ ഉയർന്ന സ്കോർ നേടാൻ സാധിക്കും.`;
    } else if (findings.scoreTotal >= 60) {
      findings.germanExaminerComment = `Solide Leistung auf B2-Niveau zum Thema „${taskTitleDe}“, aber es gibt noch Steigerungspotenzial. Achten Sie darauf, noch mehr Nomen-Verb-Verbindungen und abwechslungsreichere Konnektoren einzusetzen.`;
      findings.englishFeedback = `Solid B2 pass level on the topic, but there is room for improvement. Enrich your speech with more two-part connectors and noun-verb collocations.`;
      findings.malayalamFeedback = `നല്ല പ്രകടനം. B2 പാസ്സ് ലെവൽ കൈവരിച്ചിട്ടുണ്ട്, എന്നാൽ കൂടുതൽ ഉയർന്ന മാർക്കിനായി 'Nomen-Verb-Verbindungen' ഉം ഇരട്ട കണക്ടറുകളും (sowohl... als auch) ഉപയോഗിക്കാൻ ശ്രദ്ധിക്കുക.`;
    } else {
      findings.germanExaminerComment = `Sie müssen Ihre Argumentation zum Thema „${taskTitleDe}“ weiter ausbauen. Nutzen Sie feste Redemittel zur Einleitung und Begründung, und achten Sie streng auf die Wortstellung in Nebensätzen.`;
      findings.englishFeedback = `Needs more development. Focus on using standardized B2 phrases (Redemittel) and double-check your subordinate clause verb positions.`;
      findings.malayalamFeedback = `കൂടുതൽ പരിശീലനം ആവശ്യമാണ്. വാക്യഘടനകൾ കൂടുതൽ വ്യക്തമാക്കുകയും സബോർഡിനേറ്റ് ക്ലോസുകളിൽ (weil, dass) ക്രിയ അവസാനത്തിലേക്ക് മാറ്റാൻ പ്രത്യേകം ശ്രദ്ധിക്കുകയും ചെയ്യുക.`;
    }

    // Recommended upgrades
    if (isThemaverfehlung) {
      findings.improvements.push({
        tip: `Themenbezug herstellen: Verwenden Sie Schlüsselbegriffe zum Thema wie '${expectedKeywords.slice(0, 4).join("', '")}'.`,
        ml: `വിഷയത്തോട് നീതിപുലർത്തുക: '${expectedKeywords.slice(0, 4).join("', '")}' തുടങ്ങിയ പ്രധാന പദങ്ങൾ ഉപയോഗിച്ച് മറുപടി നൽകുക.`
      });
    }
    if (findings.detectedNVV.length === 0) {
      findings.improvements.push({
        tip: "Verwenden Sie Nomen-Verb-Verbindungen (e.g. 'eine Entscheidung treffen' statt 'entscheiden').",
        ml: "സാധാരണ ക്രിയകൾക്ക് പകരം 'Nomen-Verb-Verbindungen' ഉപയോഗിക്കുക."
      });
    }
    if (findings.detectedConnectors.length < 2) {
      findings.improvements.push({
        tip: "Verbinden Sie Ihre Sätze mit Konnektoren wie 'obwohl', 'daher' oder 'einerseits ... andererseits'.",
        ml: "വാക്യങ്ങൾ തമ്മിൽ ബന്ധിപ്പിക്കാൻ കൂടുതൽ കണക്ടറുകൾ ഉപയോഗിക്കുക."
      });
    }

    return findings;
  }

  // Modern Asynchronous AI-Powered Assessment with Seamless Local Fallback
  async evaluate(userText, taskType, taskContext) {
    const text = userText.trim();
    const wordCount = text.split(/\s+/).filter(Boolean).length;

    // Attempt AI evaluation if service is available
    if (typeof window !== 'undefined' && window.aiService && window.aiService.isAIEnabled()) {
      try {
        const aiResult = await window.aiService.analyzeSpeakingSession(text, taskType, taskContext);
        if (aiResult && aiResult.success && aiResult.analysis) {
          const aiData = aiResult.analysis;
          return {
            wordCount: wordCount,
            scoreTotal: Math.round(Number(aiData.scoreTotal) || 0),
            isThemaverfehlung: Boolean(aiData.isThemaverfehlung),
            ratings: {
              aufgabe: Math.round(Number(aiData.ratings?.aufgabe) || 0),
              ausdruck: Math.round(Number(aiData.ratings?.ausdruck) || 0),
              grammatik: Math.round(Number(aiData.ratings?.grammatik) || 0),
              fluency: Math.round(Number(aiData.ratings?.fluency) || 0)
            },
            detectedConnectors: Array.isArray(aiData.detectedConnectors) ? aiData.detectedConnectors : [],
            detectedNVV: Array.isArray(aiData.detectedNVV) ? aiData.detectedNVV : [],
            detectedRedemittel: Array.isArray(aiData.detectedRedemittel) ? aiData.detectedRedemittel : [],
            grammarAlerts: Array.isArray(aiData.grammarAlerts) ? aiData.grammarAlerts : [],
            improvements: Array.isArray(aiData.improvements) ? aiData.improvements : [],
            pronunciationTips: Array.isArray(aiData.pronunciationTips) ? aiData.pronunciationTips : [],
            germanExaminerComment: aiData.germanExaminerComment || '',
            englishFeedback: aiData.englishFeedback || '',
            malayalamFeedback: aiData.malayalamFeedback || '',
            examinerFollowUp: aiData.examinerFollowUp || null,
            isAIEvaluated: true,
            aiProvider: aiResult.provider || 'Google Gemini AI'
          };
        } else {
          console.info('Falling back to local examiner engine:', aiResult?.reason);
        }
      } catch (err) {
        console.warn('AI evaluation failed, falling back to local examiner:', err);
      }
    }

    // Seamless fallback to local deterministic rule engine
    const local = this.evaluateResponse(text, taskType, taskContext);
    local.isAIEvaluated = false;
    local.aiProvider = 'Lokale Prüfer-Regeln (Standard Engine)';
    return local;
  }
}

if (typeof window !== 'undefined') {
  window.TelcExaminer = TelcExaminer;
}

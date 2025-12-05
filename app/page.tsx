"use client";

import { useState, useEffect } from "react";
import styles from "./page.module.css";

type Step = "landing" | "symptom" | "recommendation" | "expectations" | "nextSteps";
type Language = "FR" | "EN";

const translations = {
  FR: {
    landing: {
      heroTitle: "Trouve le bon endroit pour te faire soigner",
      heroSubtitle: "Réponds à quelques questions et on t'oriente vers GAP, CLSC, clinique, pharmacie ou urgence.",
      heroSupport: "Aucune interprétation médicale. On t'aide à naviguer, pas à diagnostiquer.",
      ctaButton: "Commencer – Trouver où aller",
      ctaHelp: "Environ 2 minutes. On utilise les services existants au Québec (GAP, CLSC, Clic Santé).",
      reassurance1: "Basé sur les services disponibles à Montréal et au Québec.",
      reassurance2: "Couvert RAMQ quand applicable.",
      reassurance3: "Tu peux arrêter à tout moment.",
      footerNote: "Ce service ne remplace pas une évaluation médicale. En cas d'urgence, appelle le 911 ou rends-toi directement à l'urgence.",
    },
    symptom: {
      progress: "Étape 1 sur 4 · Symptômes",
      safetyBanner: "Cet outil ne pose pas de diagnostic. Il t'aide seulement à choisir le bon endroit où aller.",
      title: "Décris ce qui t'arrive",
      placeholder: "Ex. « Je tousse depuis 3 jours et j'ai un peu de fièvre »",
      orLabel: "Ou choisis dans la liste",
      back: "Retour",
      continue: "Continuer",
    },
    recommendation: {
      progress: "Étape 2 sur 4 · Options de soins",
      title: "En fonction de ce que tu as décrit, voici où aller en premier",
      helper: "Choisis l'option qui correspond le mieux à ta situation.",
      gap: {
        title: "GAP (Guichet d'accès)",
        subtitle: "Suivi non urgent, besoin d'un médecin de famille",
        wait: "Attente: 2–7 jours",
        cost: "Coût: Couvert RAMQ",
        why: "Pourquoi: symptômes stables, besoin d'un suivi.",
      },
      clsc: {
        title: "CLSC de ton quartier",
        subtitle: "Soins de première ligne, services infirmiers",
        wait: "Attente: variable, souvent le jour même",
        cost: "Coût: Couvert RAMQ",
        why: "Pourquoi: bon premier point de contact si tu n'es pas certain où aller.",
      },
      pharmacy: {
        title: "Consultation avec pharmacien.ne",
        subtitle: "Conseils rapides, renouvellements, petits bobos",
        wait: "Attente: souvent < 30 min",
        cost: "Coût: souvent couvert RAMQ",
        why: "Pourquoi: symptômes légers, besoin de conseils rapides.",
      },
      back: "Retour",
      continue: "Continuer",
    },
    expectations: {
      progress: "Étape 3 sur 4 · À quoi t'attendre",
      title: "Ce qui va se passer",
      helper: "Aperçu rapide de l'attente, des coûts et du déroulement typique.",
      waitLabel: "Attente estimée",
      waitValue: "Entre 45 min et 2 heures",
      costLabel: "Coût",
      costValue: "Couvert par la RAMQ",
      documentsLabel: "Documents à apporter",
      documents: ["Carte RAMQ", "Une pièce d'identité", "Liste de tes médicaments"],
      timelineLabel: "Déroulement typique",
      timeline: [
        "Tu t'enregistres à l'accueil.",
        "On vérifie tes informations et ta carte RAMQ.",
        "Tu attends en salle d'attente.",
        "Tu rencontres un.e professionnel.le de la santé.",
        "On te donne des recommandations ou un suivi au besoin.",
      ],
      back: "Retour",
      continue: "Voir les prochaines étapes",
    },
    nextSteps: {
      progress: "Étape 4 sur 4 · Prochaines étapes",
      title: "Ce que tu peux faire maintenant",
      step1: "1. Y aller dès que possible",
      step1Text: "Prépare tes documents, vérifie les heures d'ouverture, et rends-toi sur place.",
      step2: "2. Noter les infos importantes",
      step2Text: "Lieu, heures, ce que tu veux dire au professionnel de la santé.",
      step3: "3. Demander de l'aide",
      step3Text: "Si tu n'es pas à l'aise d'y aller seul.e, demande à quelqu'un de t'accompagner.",
      restart: "Recommencer pour un autre souci",
      home: "Retour à l'écran d'accueil",
    },
    emergency: "Urgence vitale ? Appelle le 911 ou va à l'urgence la plus proche.",
    symptomTags: ["Fièvre", "Douleur", "Toux", "Nausée", "Maux de tête", "Stress / anxiété"],
  },
  EN: {
    landing: {
      heroTitle: "Find the right place to get care",
      heroSubtitle: "Answer a few questions and we'll guide you to GAP, CLSC, clinic, pharmacy, or emergency.",
      heroSupport: "No medical diagnosis. We help you navigate, not diagnose.",
      ctaButton: "Start – Find where to go",
      ctaHelp: "About 2 minutes. We use existing Québec services (GAP, CLSC, Clic Santé).",
      reassurance1: "Based on services available in Montreal and Québec.",
      reassurance2: "RAMQ covered when applicable.",
      reassurance3: "You can stop at any time.",
      footerNote: "This service does not replace a medical evaluation. In case of emergency, call 911 or go directly to the emergency room.",
    },
    symptom: {
      progress: "Step 1 of 4 · Symptoms",
      safetyBanner: "This tool does not provide a diagnosis. It only helps you choose the right place to go.",
      title: "Describe what's happening",
      placeholder: "Ex. \"I've been coughing for 3 days and have a slight fever\"",
      orLabel: "Or choose from the list",
      back: "Back",
      continue: "Continue",
    },
    recommendation: {
      progress: "Step 2 of 4 · Care options",
      title: "Based on what you described, here's where to go first",
      helper: "Choose the option that best matches your situation.",
      gap: {
        title: "GAP (Access Point)",
        subtitle: "Non-urgent follow-up, need a family doctor",
        wait: "Wait: 2–7 days",
        cost: "Cost: RAMQ covered",
        why: "Why: stable symptoms, need follow-up.",
      },
      clsc: {
        title: "Your neighborhood CLSC",
        subtitle: "Primary care, nursing services",
        wait: "Wait: variable, often same day",
        cost: "Cost: RAMQ covered",
        why: "Why: good first point of contact if you're not sure where to go.",
      },
      pharmacy: {
        title: "Consultation with pharmacist",
        subtitle: "Quick advice, renewals, minor issues",
        wait: "Wait: often < 30 min",
        cost: "Cost: often RAMQ covered",
        why: "Why: mild symptoms, need quick advice.",
      },
      back: "Back",
      continue: "Continue",
    },
    expectations: {
      progress: "Step 3 of 4 · What to expect",
      title: "What will happen",
      helper: "Quick overview of wait time, costs, and typical process.",
      waitLabel: "Estimated wait",
      waitValue: "Between 45 min and 2 hours",
      costLabel: "Cost",
      costValue: "Covered by RAMQ",
      documentsLabel: "Documents to bring",
      documents: ["RAMQ card", "ID", "List of your medications"],
      timelineLabel: "Typical process",
      timeline: [
        "You register at reception.",
        "They verify your information and RAMQ card.",
        "You wait in the waiting room.",
        "You meet with a healthcare professional.",
        "You receive recommendations or follow-up as needed.",
      ],
      back: "Back",
      continue: "See next steps",
    },
    nextSteps: {
      progress: "Step 4 of 4 · Next steps",
      title: "What you can do now",
      step1: "1. Go as soon as possible",
      step1Text: "Prepare your documents, check opening hours, and go to the location.",
      step2: "2. Note important information",
      step2Text: "Location, hours, what you want to tell the healthcare professional.",
      step3: "3. Ask for help",
      step3Text: "If you're not comfortable going alone, ask someone to accompany you.",
      restart: "Start over for another concern",
      home: "Back to home screen",
    },
    emergency: "Life-threatening emergency? Call 911 or go to the nearest emergency room.",
    symptomTags: ["Fever", "Pain", "Cough", "Nausea", "Headache", "Stress / anxiety"],
  },
};

interface AIRecommendation {
  id: "gap" | "clsc" | "pharmacy";
  priority: number;
  why: string;
  waitTime: string;
  cost: string;
}

export default function Home() {
  const [step, setStep] = useState<Step>("landing");
  const [language, setLanguage] = useState<Language>("FR");
  const [symptomText, setSymptomText] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [aiRecommendations, setAiRecommendations] = useState<AIRecommendation[] | null>(null);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);

  const t = translations[language];
  const symptomTags = t.symptomTags;

  const canContinueFromSymptom = symptomText.trim().length > 0 || selectedTags.length > 0;
  const canContinueFromRecommendation = !!selectedOption;

  // Fetch AI recommendations when moving to recommendation step
  useEffect(() => {
    if (step === "recommendation" && !aiRecommendations && !isLoadingRecommendations) {
      fetchRecommendations();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const fetchRecommendations = async () => {
    setIsLoadingRecommendations(true);
    try {
      const response = await fetch("/api/recommend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          symptomText,
          selectedTags,
          language,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Sort by priority
        const sorted = data.options.sort((a: AIRecommendation, b: AIRecommendation) => a.priority - b.priority);
        setAiRecommendations(sorted);
      } else {
        // Fallback to static recommendations on error
        console.error("Failed to fetch recommendations");
        setAiRecommendations(null);
      }
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      setAiRecommendations(null);
    } finally {
      setIsLoadingRecommendations(false);
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((current) =>
      current.includes(tag) ? current.filter((t) => t !== tag) : [...current, tag]
    );
  };

  const resetFlow = () => {
    setStep("landing");
    setSymptomText("");
    setSelectedTags([]);
    setSelectedOption(null);
    setAiRecommendations(null);
  };

  // Get recommendation data (AI-generated or fallback to static)
  const getRecommendationData = (id: "gap" | "clsc" | "pharmacy") => {
    const aiRec = aiRecommendations?.find((r) => r.id === id);
    if (aiRec) {
      return {
        why: aiRec.why,
        wait: language === "FR" ? `Attente: ${aiRec.waitTime}` : `Wait: ${aiRec.waitTime}`,
        cost: language === "FR" ? `Coût: ${aiRec.cost}` : `Cost: ${aiRec.cost}`,
      };
    }
    // Fallback to static translations
    const staticData = t.recommendation[id];
    return {
      why: staticData.why,
      wait: staticData.wait,
      cost: staticData.cost,
    };
  };

  return (
    <div className={styles.app}>
      {/* Top Bar */}
      <header className={styles.topBar}>
        <div className={styles.logoBox}>Allo Santé Québec</div>
        <div className={styles.topBarRight}>
          <div className={styles.languageToggle}>
            <button
              type="button"
              className={language === "FR" ? styles.languageActive : ""}
              onClick={() => setLanguage("FR")}
            >
              FR
            </button>
            <button
              type="button"
              className={language === "EN" ? styles.languageActive : ""}
              onClick={() => setLanguage("EN")}
            >
              EN
            </button>
          </div>
          <button type="button" className={styles.helpIcon}>?</button>
        </div>
      </header>

      {/* Main content frame (mobile-first, grey-box layout) */}
      <main className={styles.frame}>
        {step === "landing" && (
          <section className={styles.screen}>
            <div className={styles.heroCard}>
              <div className={styles.heroIllustration}>[ Illustration ]</div>
              <h1 className={styles.heroTitle}>{t.landing.heroTitle}</h1>
              <p className={styles.heroSubtitle}>{t.landing.heroSubtitle}</p>
              <p className={styles.heroSupport}>{t.landing.heroSupport}</p>
            </div>

            <div className={styles.primaryCtaBlock}>
              <button type="button" className={styles.primaryButton} onClick={() => setStep("symptom")}>
                {t.landing.ctaButton}
              </button>
              <p className={styles.ctaHelpText}>{t.landing.ctaHelp}</p>
            </div>

            <div className={styles.reassuranceCard}>
              <div className={styles.reassuranceRow}>
                <div className={styles.reassuranceIcon}>•</div>
                <p>{t.landing.reassurance1}</p>
              </div>
              <div className={styles.reassuranceRow}>
                <div className={styles.reassuranceIcon}>•</div>
                <p>{t.landing.reassurance2}</p>
              </div>
              <div className={styles.reassuranceRow}>
                <div className={styles.reassuranceIcon}>•</div>
                <p>{t.landing.reassurance3}</p>
              </div>
            </div>

            <p className={styles.footerNote}>{t.landing.footerNote}</p>
          </section>
        )}

        {step === "symptom" && (
          <section className={styles.screen}>
            <div className={styles.progressBar}>
              <div className={styles.progressFill} />
              <span className={styles.progressText}>{t.symptom.progress}</span>
            </div>

            <div className={styles.safetyBanner}>{t.symptom.safetyBanner}</div>

            <div className={styles.sectionCard}>
              <h2 className={styles.sectionTitle}>{t.symptom.title}</h2>
              <div className={styles.textAreaBox}>
                <textarea
                  className={styles.textArea}
                  placeholder={t.symptom.placeholder}
                  value={symptomText}
                  onChange={(e) => setSymptomText(e.target.value)}
                />
              </div>
            </div>

            <div className={styles.sectionCard}>
              <p className={styles.sectionLabel}>{t.symptom.orLabel}</p>
              <div className={styles.chipRow}>
                {symptomTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    className={`${styles.chip} ${
                      selectedTags.includes(tag) ? styles.chipSelected : ""
                    }`}
                    onClick={() => toggleTag(tag)}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.actionsRow}>
              <button type="button" className={styles.secondaryButton} onClick={resetFlow}>
                {t.symptom.back}
              </button>
              <button
                type="button"
                className={`${styles.primaryButton} ${
                  !canContinueFromSymptom ? styles.buttonDisabled : ""
                }`}
                disabled={!canContinueFromSymptom}
                onClick={async () => {
                  setStep("recommendation");
                  // Reset AI recommendations when starting new flow
                  setAiRecommendations(null);
                }}
              >
                {t.symptom.continue}
              </button>
            </div>
          </section>
        )}

        {step === "recommendation" && (
          <section className={styles.screen}>
            <div className={styles.progressBar}>
              <div className={styles.progressFillTwo} />
              <span className={styles.progressText}>{t.recommendation.progress}</span>
            </div>

            <div className={styles.sectionCard}>
              <h2 className={styles.sectionTitle}>{t.recommendation.title}</h2>
              <p className={styles.sectionHelper}>{t.recommendation.helper}</p>
            </div>

            {isLoadingRecommendations ? (
              <div className={styles.sectionCard}>
                <p style={{ textAlign: "center", color: "#6b7280" }}>
                  {language === "FR" 
                    ? "Analyse de tes symptômes en cours..." 
                    : "Analyzing your symptoms..."}
                </p>
              </div>
            ) : (
              <div className={styles.optionList}>
                {(["gap", "clsc", "pharmacy"] as const).map((id) => {
                  const data = getRecommendationData(id);
                  const staticData = t.recommendation[id];
                  return (
                    <button
                      key={id}
                      type="button"
                      className={`${styles.optionCard} ${
                        selectedOption === id ? styles.optionSelected : ""
                      }`}
                      onClick={() => setSelectedOption(id)}
                    >
                      <div className={styles.optionHeader}>
                        <div className={styles.optionIcon}>
                          {id === "gap" ? "[ GAP ]" : id === "clsc" ? "[ CLSC ]" : "[ Pharmacie ]"}
                        </div>
                        <div>
                          <p className={styles.optionTitle}>{staticData.title}</p>
                          <p className={styles.optionSubtitle}>{staticData.subtitle}</p>
                        </div>
                      </div>
                      <div className={styles.optionMetaRow}>
                        <div className={styles.metaBadge}>{data.wait}</div>
                        <div className={styles.metaBadge}>{data.cost}</div>
                      </div>
                      <p className={styles.optionWhy}>{data.why}</p>
                    </button>
                  );
                })}
              </div>
            )}

            <div className={styles.actionsRow}>
              <button type="button" className={styles.secondaryButton} onClick={() => setStep("symptom")}>
                {t.recommendation.back}
              </button>
              <button
                type="button"
                className={`${styles.primaryButton} ${
                  !canContinueFromRecommendation ? styles.buttonDisabled : ""
                }`}
                disabled={!canContinueFromRecommendation}
                onClick={() => setStep("expectations")}
              >
                {t.recommendation.continue}
              </button>
            </div>
          </section>
        )}

        {step === "expectations" && (
          <section className={styles.screen}>
            <div className={styles.progressBar}>
              <div className={styles.progressFillThree} />
              <span className={styles.progressText}>{t.expectations.progress}</span>
            </div>

            <div className={styles.sectionCard}>
              <h2 className={styles.sectionTitle}>{t.expectations.title}</h2>
              <p className={styles.sectionHelper}>{t.expectations.helper}</p>
            </div>

            <div className={styles.expectationGrid}>
              <div className={styles.expectationBox}>
                <p className={styles.expectationLabel}>{t.expectations.waitLabel}</p>
                <div className={styles.expectationValueBox}>{t.expectations.waitValue}</div>
              </div>
              <div className={styles.expectationBox}>
                <p className={styles.expectationLabel}>{t.expectations.costLabel}</p>
                <div className={styles.expectationValueBox}>{t.expectations.costValue}</div>
              </div>
              <div className={styles.expectationBox}>
                <p className={styles.expectationLabel}>{t.expectations.documentsLabel}</p>
                <ul className={styles.checklist}>
                  {t.expectations.documents.map((doc, idx) => (
                    <li key={idx}>{doc}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className={styles.sectionCard}>
              <p className={styles.sectionLabel}>{t.expectations.timelineLabel}</p>
              <ol className={styles.timeline}>
                {t.expectations.timeline.map((step, idx) => (
                  <li key={idx}>{step}</li>
                ))}
              </ol>
            </div>

            <div className={styles.actionsRow}>
              <button type="button" className={styles.secondaryButton} onClick={() => setStep("recommendation")}>
                {t.expectations.back}
              </button>
              <button type="button" className={styles.primaryButton} onClick={() => setStep("nextSteps")}>
                {t.expectations.continue}
              </button>
            </div>
          </section>
        )}

        {step === "nextSteps" && (
          <section className={styles.screen}>
            <div className={styles.progressBar}>
              <div className={styles.progressFillFour} />
              <span className={styles.progressText}>{t.nextSteps.progress}</span>
            </div>

            <div className={styles.sectionCard}>
              <h2 className={styles.sectionTitle}>{t.nextSteps.title}</h2>
            </div>

            <div className={styles.nextStepsGrid}>
              <div className={styles.nextCard}>
                <p className={styles.nextTitle}>{t.nextSteps.step1}</p>
                <p className={styles.nextText}>{t.nextSteps.step1Text}</p>
              </div>
              <div className={styles.nextCard}>
                <p className={styles.nextTitle}>{t.nextSteps.step2}</p>
                <p className={styles.nextText}>{t.nextSteps.step2Text}</p>
              </div>
              <div className={styles.nextCard}>
                <p className={styles.nextTitle}>{t.nextSteps.step3}</p>
                <p className={styles.nextText}>{t.nextSteps.step3Text}</p>
              </div>
            </div>

            <div className={styles.actionsColumn}>
              <button type="button" className={styles.primaryButton} onClick={resetFlow}>
                {t.nextSteps.restart}
              </button>
              <button type="button" className={styles.secondaryButton} onClick={resetFlow}>
                {t.nextSteps.home}
              </button>
            </div>
          </section>
        )}
      </main>

      {/* Fixed emergency bar */}
      <button type="button" className={styles.emergencyBar}>
        {t.emergency}
      </button>
    </div>
  );
}

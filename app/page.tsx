"use client";

import { useState } from "react";
import styles from "./page.module.css";

type Step =
  | "landing"
  | "topic"
  | "questions"
  | "recommendation"
  | "nextStep"
  | "otherFallback"
  | "learnHowItWorks"
  | "notFeelingWellType"
  | "notFeelingWellSafety"
  | "notFeelingWellSeverity"
  | "notFeelingWellRecommendation"
  | "notFeelingWellNextStep"
  | "medicationType"
  | "medicationScope"
  | "medicationRecommendation"
  | "medicationAction"
  | "appointmentType"
  | "appointmentRequirements"
  | "appointmentAction";

type Topic =
  | "notFeelingWell"
  | "medication"
  | "appointment"
  | "other";

type ProblemType = "injury" | "fever" | "pain" | "chronic" | "unsure" | null;
type MedicationHelpType = "renewal" | "minorCondition" | "otcQuestion" | "sideEffects" | "unsure" | null;
type AppointmentType = "vaccination" | "bloodTest" | "nurseVisit" | "screening" | "unsure" | null;
type SafetyAnswer = "yes" | "no" | null;
type SeverityLevel = "mild" | "moderate" | "severe" | null;
type SeverityAnswer = "yes" | "no" | null;
type AgeGroup = "adult" | "child" | null;
type TimeAnswer = "yes" | "no" | null;

type CareOptionId = "pharmacist" | "walkIn" | "clsc" | "gap" | "er";

interface CareOptionContent {
  id: CareOptionId;
  label: string;
  why: string;
  canDo: string;
  cannotDo?: string;
  timeExpectation: string;
}

const careOptions: Record<CareOptionId, CareOptionContent> = {
  pharmacist: {
    id: "pharmacist",
    label: "💊 Pharmacist",
    why: "Good first stop for minor issues and questions about medications.",
    canDo: "Help with minor infections, renewals, common medication questions.",
    cannotDo: "Cannot order imaging or manage complex or unstable conditions.",
    timeExpectation: "Usually quick, often within minutes or the same day.",
  },
  walkIn: {
    id: "walkIn",
    label: "🏥 Walk-in clinic",
    why: "For non-urgent exams, infections, and minor injuries that need a clinician.",
    canDo: "Assess infections, minor injuries, and other non-urgent concerns.",
    cannotDo: "Not for severe pain, major trauma, or life-threatening issues.",
    timeExpectation: "Wait time can be long and depends on the clinic.",
      },
      clsc: {
    id: "clsc",
    label: "🏥 CLSC",
    why: "Community clinic for vaccines, nursing care, and social support.",
    canDo: "Help with community care, vaccinations, follow-up, and support services.",
    timeExpectation: "Varies by CLSC; some services require an appointment.",
  },
      gap: {
    id: "gap",
    label: "📞 GAP (Access point)",
    why: "For patients without a family doctor who need ongoing or chronic care.",
    canDo: "Help unattached patients find care and organize follow-up.",
    timeExpectation: "Delays can be several days; not for urgent problems.",
  },
  er: {
    id: "er",
    label: "🚨 Emergency room",
    why: "For severe pain, trouble breathing, heavy bleeding, or feeling very unwell.",
    canDo: "Handle serious and life-threatening problems with full hospital resources.",
    cannotDo: "Not for minor issues that can safely wait or be handled elsewhere.",
    timeExpectation: "Wait times can be long and depend on how urgent your case is.",
  },
};

interface NextStepContent {
  title: string;
  body: string[];
  linkLabel?: string;
  linkHref?: string;
}

function getNextStepContent(option: CareOptionId): NextStepContent {
  switch (option) {
    case "pharmacist":
      return {
        title: "Next step: Talk to a pharmacist",
        body: [
          "Go to a nearby pharmacy and ask to speak with the pharmacist about your concern.",
          "Bring your RAMQ card and a list of your medications if you have one.",
          "If the pharmacist is worried, they may direct you to a clinic or the emergency room.",
        ],
      };
    case "walkIn":
      return {
        title: "Next step: Find a walk-in clinic",
        body: [
          "Look up walk-in clinics in your area using your regional health network website or a trusted search engine.",
          "Check opening hours and whether you need to book through Clic Santé.",
          "Go as early as you can—wait times can be long.",
        ],
        linkLabel: "Open Clic Santé booking",
        linkHref: "https://portal3.clicsante.ca/",
      };
    case "clsc":
      return {
        title: "Next step: Contact a CLSC",
        body: [
          "Search for the CLSC in your neighbourhood on the Québec government website.",
          "Call to ask which services are available and how to book.",
          "Bring your RAMQ card and any relevant documents to your visit.",
        ],
        linkLabel: "Find nearby CLSC",
        linkHref: "https://www.quebec.ca/en/health/finding-resource/clsc",
      };
    case "gap":
      return {
        title: "Next step: Call your regional GAP line",
        body: [
          "The GAP helps patients without a family doctor connect to the right service.",
          "Search \"GAP santé\" with your region (e.g., Montréal, Laval) to find the right phone number.",
          "Explain your situation and they will guide you to a clinic or follow-up service.",
        ],
      };
    case "er":
      return {
        title: "Next step: Go to the emergency room",
        body: [
          "If you can travel safely, go to the nearest emergency department.",
          "If you cannot travel safely or feel very unwell, call 911.",
          "Bring your RAMQ card, a list of your medications, and any important medical documents.",
        ],
      };
    default:
      return {
        title: "Next step",
        body: ["Follow the instructions from the recommended care option."],
      };
  }
}

function getRecommendedOptionsForNotFeelingWell(
  problemType: ProblemType,
  safetyAnswer: SafetyAnswer,
  severity: SeverityLevel
): CareOptionId[] {
  // Safety first: any red flag goes to ER
  if (safetyAnswer === "yes") {
    return ["er"];
  }

  // Severe symptoms → ER
  if (severity === "severe") {
    return ["er"];
  }

  // Mild symptoms → pharmacist
  if (severity === "mild") {
    return ["pharmacist"];
  }

  // Moderate symptoms → walk-in or GAP depending on problem type
  if (severity === "moderate") {
    switch (problemType) {
      case "injury":
      case "fever":
      case "pain":
        return ["walkIn", "gap"];
      case "chronic":
        return ["gap", "walkIn"];
      default:
        return ["walkIn", "gap"];
    }
  }

  // Default fallback
  return ["pharmacist", "gap"];
}

function canPharmacistHelp(medicationType: MedicationHelpType): boolean {
  // Pharmacists can handle most medication requests
  switch (medicationType) {
    case "renewal":
    case "minorCondition":
    case "otcQuestion":
      return true;
    case "sideEffects":
      // Side effects might need clinic evaluation, but pharmacist can advise first
      return true;
    case "unsure":
      // When unsure, suggest pharmacist first as they can triage
      return true;
    default:
      return true;
  }
}

function getRecommendedOptions(
  topic: Topic | null,
  severity: SeverityAnswer,
  time: TimeAnswer
): CareOptionId[] {
  // Safety first: any severe red flag goes to ER
  if (severity === "yes") {
    return ["er"];
  }

  if (!topic) {
    return ["gap"];
  }

  switch (topic) {
    case "notFeelingWell":
      // Not feeling well + needs care within 24h → walk-in or pharmacist
      if (time === "yes") {
        return ["walkIn", "pharmacist"];
      }
      return ["pharmacist", "gap"];
    case "medication":
      // Medication questions → pharmacist first
      return ["pharmacist", "clsc"];
    case "appointment":
      // Booking/managing appointments → CLSC or GAP
      return ["clsc", "gap"];
    default:
      return ["gap"];
  }
}

export default function Home() {
  const [step, setStep] = useState<Step>("landing");
  const [language, setLanguage] = useState<"FR" | "EN">("EN");
  const [topic, setTopic] = useState<Topic | null>(null);
  const [problemType, setProblemType] = useState<ProblemType>(null);
  const [medicationType, setMedicationType] = useState<MedicationHelpType>(null);
  const [appointmentType, setAppointmentType] = useState<AppointmentType>(null);
  const [safetyAnswer, setSafetyAnswer] = useState<SafetyAnswer>(null);
  const [severityLevel, setSeverityLevel] = useState<SeverityLevel>(null);
  const [severity, setSeverity] = useState<SeverityAnswer>(null);
  const [ageGroup, setAgeGroup] = useState<AgeGroup>(null);
  const [timeNeed, setTimeNeed] = useState<TimeAnswer>(null);
  const [recommendedOptions, setRecommendedOptions] = useState<CareOptionId[]>([]);
  const [selectedCareOption, setSelectedCareOption] = useState<CareOptionId | null>(null);
  const [pharmacistCanHelp, setPharmacistCanHelp] = useState<boolean>(false);

  const canContinueFromTopic = !!topic;
  const canContinueFromQuestions = !!severity && !!ageGroup && !!timeNeed;
  const canContinueFromProblemType = !!problemType;
  const canContinueFromSafety = safetyAnswer !== null;
  const canContinueFromSeverity = !!severityLevel;
  const canContinueFromMedicationType = !!medicationType;
  const canContinueFromAppointmentType = !!appointmentType;

  const restart = () => {
    setStep("landing");
    setTopic(null);
    setProblemType(null);
    setMedicationType(null);
    setAppointmentType(null);
    setSafetyAnswer(null);
    setSeverityLevel(null);
    setSeverity(null);
    setAgeGroup(null);
    setTimeNeed(null);
    setRecommendedOptions([]);
    setSelectedCareOption(null);
    setPharmacistCanHelp(false);
  };

  const handleContinueFromTopic = () => {
    if (topic === "other") {
      setStep("otherFallback");
    } else if (topic === "notFeelingWell") {
      setStep("notFeelingWellType");
    } else if (topic === "medication") {
      setStep("medicationType");
    } else if (topic === "appointment") {
      setStep("appointmentType");
    } else {
      setStep("questions");
    }
  };

  const handleContinueFromProblemType = () => {
    setStep("notFeelingWellSafety");
  };

  const handleContinueFromSafety = () => {
    if (safetyAnswer === "yes") {
      // Red flag detected → go directly to ER recommendation
      setRecommendedOptions(["er"]);
      setSelectedCareOption(null);
      setStep("notFeelingWellRecommendation");
      } else {
      setStep("notFeelingWellSeverity");
    }
  };

  const handleContinueFromSeverity = () => {
    const options = getRecommendedOptionsForNotFeelingWell(problemType, safetyAnswer, severityLevel);
    setRecommendedOptions(options);
    setSelectedCareOption(null);
    setStep("notFeelingWellRecommendation");
  };

  const handleContinueFromMedicationType = () => {
    setStep("medicationScope");
  };

  const handleContinueFromMedicationScope = () => {
    const canHelp = canPharmacistHelp(medicationType);
    setPharmacistCanHelp(canHelp);
    setStep("medicationRecommendation");
  };

  const handleContinueFromAppointmentType = () => {
    setStep("appointmentRequirements");
  };

  const handleContinueFromAppointmentRequirements = () => {
    setStep("appointmentAction");
  };

  const handleContinueFromQuestions = () => {
    const options = getRecommendedOptions(topic, severity, timeNeed).slice(0, 2);
    setRecommendedOptions(options);
    setSelectedCareOption(null);
    setStep("recommendation");
  };

  return (
    <div className={styles.app}>
      <header className={styles.topBar}>
        <button 
          type="button"
          className={styles.logoBox}
          onClick={restart}
          style={{ 
            background: "none", 
            border: "none", 
            cursor: "pointer",
            padding: "6px 0px",
            textAlign: "left"
          }}
        >
          <span className={styles.locationIcon}>📍</span>
          CareNav
        </button>
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
        </div>
      </header>

      <main className={
        step === "landing" 
          ? styles.frameLanding 
          : step === "topic" || step === "notFeelingWellType" || step === "medicationType" || step === "appointmentType"
          ? styles.frameStep1
          : styles.frameStep1
      }>
        {step === "landing" && (
          <section className={styles.landingScreen}>
            <div className={styles.heroSection}>
              <h1 className={styles.heroTitle}>
                {language === "EN" ? (
                  <>
                    Find the right care,
                    <br />
                    when you need it
                  </>
                ) : (
                  <>
                    Trouver le bon soin,
                    <br />
                    quand vous en avez besoin
                  </>
                )}
              </h1>
              <p className={styles.heroSubtitle}>
                {language === "EN"
                  ? "Not sure where to go for care in Québec? We'll help you understand your options — no jargon, no diagnosis, just clear guidance."
                  : "Vous ne savez pas où aller pour des soins au Québec? Nous vous aiderons à comprendre vos options — pas de jargon, pas de diagnostic, juste des conseils clairs."}
              </p>
            </div>

            <div className={styles.ctaBlock}>
              <button
                type="button"
                className={styles.primaryLandingButton}
                onClick={() => setStep("topic")}
              >
                {language === "EN" ? "Get started" : "Commencer"}
                <span className={styles.arrowIcon}>→</span>
              </button>
              <button
                type="button"
                className={styles.secondaryLandingButton}
                onClick={() => setStep("learnHowItWorks")}
              >
                {language === "EN" ? "Learn how it works" : "Découvrir comment ça fonctionne"}
              </button>
            </div>
          </section>
        )}

        {step === "learnHowItWorks" && (
          <section className={styles.learnHowItWorksScreen}>
            <div className={styles.optionListStep1}>
              <div className={styles.infoCard}>
                <div className={styles.infoCardIcon}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z" fill="#2563eb"/>
                  </svg>
                </div>
                <div>
                  <h3 className={styles.infoCardTitle}>
                    {language === "EN" ? "Find the right place" : "Trouver le bon endroit"}
                  </h3>
                  <p className={styles.infoCardText}>
                    {language === "EN"
                      ? "Understand the difference between ERs, walk-ins, CLSCs, pharmacies, and GAP — in plain language."
                      : "Comprenez la différence entre les urgences, les cliniques sans rendez-vous, les CLSC, les pharmacies et le GAP — en langage clair."}
                  </p>
                </div>
              </div>

              <div className={styles.infoCard}>
                <div className={styles.infoCardIcon}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" stroke="#2563eb" strokeWidth="2" fill="none"/>
                    <circle cx="12" cy="12" r="1.5" fill="#2563eb"/>
                    <path d="M12 6V12L7 17" stroke="#2563eb" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M7 7L5 5M17 5L19 7M5 19L7 17M19 19L17 17" stroke="#2563eb" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </div>
                <div>
                  <h3 className={styles.infoCardTitle}>
                    {language === "EN" ? "Know what's urgent" : "Savoir ce qui est urgent"}
                  </h3>
                  <p className={styles.infoCardText}>
                    {language === "EN"
                      ? "Get clear guidance on whether your situation needs immediate attention or can wait."
                      : "Obtenez des conseils clairs sur si votre situation nécessite une attention immédiate ou peut attendre."}
                  </p>
                </div>
              </div>

              <div className={styles.infoCard}>
                <div className={styles.infoCardIcon}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16 11C17.66 11 18.99 9.66 18.99 8C18.99 6.34 17.66 5 16 5C14.34 5 13 6.34 13 8C13 9.66 14.34 11 16 11ZM8 11C9.66 11 10.99 9.66 10.99 8C10.99 6.34 9.66 5 8 5C6.34 5 5 6.34 5 8C5 9.66 6.34 11 8 11ZM8 13C5.67 13 1 14.17 1 16.5V19H15V16.5C15 14.17 10.33 13 8 13ZM16 13C15.71 13 15.38 13.02 15.03 13.05C16.19 13.89 17 15.02 17 16.5V19H23V16.5C23 14.17 18.33 13 16 13Z" fill="#2563eb"/>
                  </svg>
                </div>
                <div>
                  <h3 className={styles.infoCardTitle}>
                    {language === "EN" ? "No family doctor? No problem" : "Pas de médecin de famille? Pas de problème"}
                  </h3>
                  <p className={styles.infoCardText}>
                    {language === "EN"
                      ? "This tool works for everyone, whether you have a family doctor or not."
                      : "Cet outil fonctionne pour tout le monde, que vous ayez un médecin de famille ou non."}
                  </p>
                </div>
              </div>

              <div className={`${styles.infoCard} ${styles.infoCardImportant}`}>
                <div className={`${styles.infoCardIcon} ${styles.infoCardIconImportant}`}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" stroke="#2563eb" strokeWidth="2" fill="none"/>
                    <path d="M12 8V12M12 16H12.01" stroke="#2563eb" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <div>
                  <h3 className={styles.infoCardTitle}>
                    {language === "EN" ? "This tool provides guidance, not medical advice" : "Cet outil fournit des conseils, pas des conseils médicaux"}
                  </h3>
                  <p className={styles.infoCardText}>
                    {language === "EN"
                      ? "We help you navigate the healthcare system. We do not diagnose conditions or replace professional medical judgment. If you're experiencing a medical emergency, call 911 immediately."
                      : "Nous vous aidons à naviguer dans le système de santé. Nous ne diagnostiquons pas les conditions ni ne remplaçons le jugement médical professionnel. Si vous vivez une urgence médicale, appelez le 911 immédiatement."}
                  </p>
                </div>
              </div>
            </div>

            <div className={styles.learnHowItWorksFooter}>
              <div className={styles.bottomActions}>
                <button
                  type="button"
                  className={styles.secondaryButtonBottom}
                  onClick={() => setStep("landing")}
                >
                  {language === "EN" ? "Back" : "Retour"}
                </button>
              </div>
              {/* <div className={styles.footerText}>
                {language === "EN"
                  ? "© 2025 CareNav. A navigation tool for Québec healthcare."
                  : "© 2025 CareNav. Un outil de navigation pour les soins de santé au Québec."}
              </div> */}
            </div>
          </section>
        )}

        {step === "topic" && (
          <section className={styles.step1Screen}>
            <h1 className={styles.sectionTitleStep1}>
              {language === "EN" ? "What do you need help with today?" : "De quoi avez-vous besoin aujourd'hui?"}
            </h1>
            <p className={styles.sectionHelperStep1}>
              {language === "EN"
                ? "Choose the option that fits best — you can always go back."
                : "Choisissez l'option qui correspond le mieux — vous pouvez toujours revenir en arrière."}
            </p>

            <div className={styles.optionListStep1}>
              <button
                type="button"
                className={`${styles.optionCardStep1} ${
                  topic === "notFeelingWell" ? styles.optionSelectedStep1 : ""
                }`}
                onClick={() => {
                  setTopic("notFeelingWell");
                  setTimeout(() => handleContinueFromTopic(), 100);
                }}
              >
                <div className={styles.optionHeaderStep1}>
                  <div className={styles.optionIconStep1}>🤒</div>
                  <div>
                    <p className={styles.optionTitleStep1}>
                      {language === "EN" ? "I'm not feeling well" : "Je ne me sens pas bien"}
                    </p>
                    <p className={styles.optionSubtitleStep1}>
                      {language === "EN"
                        ? "Find the right care for symptoms or illness."
                        : "Trouvez les bons soins pour les symptômes ou la maladie."}
                    </p>
              </div>
              </div>
              </button>

              <button
                type="button"
                className={`${styles.optionCardStep1} ${
                  topic === "medication" ? styles.optionSelectedStep1 : ""
                }`}
                onClick={() => {
                  setTopic("medication");
                  setTimeout(() => handleContinueFromTopic(), 100);
                }}
              >
                <div className={styles.optionHeaderStep1}>
                  <div className={styles.optionIconStep1}>💊</div>
                  <div>
                    <p className={styles.optionTitleStep1}>
                      {language === "EN" ? "I need help with medication" : "J'ai besoin d'aide avec des médicaments"}
                    </p>
                    <p className={styles.optionSubtitleStep1}>
                      {language === "EN"
                        ? "Help with renewals, minor issues, or medication questions. Check if a pharmacist can treat your issue."
                        : "Aide pour les renouvellements, les problèmes mineurs ou les questions sur les médicaments. Vérifiez si un pharmacien peut traiter votre problème."}
                    </p>
              </div>
            </div>
              </button>

              <button
                type="button"
                className={`${styles.optionCardStep1} ${
                  topic === "appointment" ? styles.optionSelectedStep1 : ""
                }`}
                onClick={() => {
                  setTopic("appointment");
                  setTimeout(() => handleContinueFromTopic(), 100);
                }}
              >
                <div className={styles.optionHeaderStep1}>
                  <div className={styles.optionIconStep1}>📅</div>
                  <div>
                    <p className={styles.optionTitleStep1}>
                      {language === "EN"
                        ? "I need to book or manage an appointment"
                        : "Je dois prendre ou gérer un rendez-vous"}
                    </p>
                    <p className={styles.optionSubtitleStep1}>
                      {language === "EN"
                        ? "Find where to book vaccines, blood tests, and screenings."
                        : "Trouvez où prendre rendez-vous pour les vaccins, les analyses sanguines et les dépistages."}
                    </p>
                  </div>
              </div>
              </button>

              <button
                type="button"
                className={`${styles.optionCardStep1} ${
                  topic === "other" ? styles.optionSelectedStep1 : ""
                }`}
                onClick={() => {
                  setTopic("other");
                  setTimeout(() => handleContinueFromTopic(), 100);
                }}
              >
                <div className={styles.optionHeaderStep1}>
                  <div className={styles.optionIconStep1}>❓</div>
                  <div>
                    <p className={styles.optionTitleStep1}>
                      {language === "EN" ? "Something else" : "Autre chose"}
                    </p>
                    <p className={styles.optionSubtitleStep1}>
                      {language === "EN"
                        ? "Get general guidance or a safe next step."
                        : "Obtenez des conseils généraux ou une prochaine étape sécuritaire."}
                    </p>
              </div>
              </div>
              </button>
            </div>

            <div className={styles.bottomActions}>
              <button
                type="button"
                className={styles.secondaryButtonBottom}
                onClick={restart}
              >
                {language === "EN" ? "Back" : "Retour"}
              </button>
            </div>
          </section>
        )}

        {/* Flow 1: I'm not feeling well - Step 1: Problem Type */}
        {step === "notFeelingWellType" && (
          <section className={styles.step1Screen}>
            <h1 className={styles.sectionTitleStep1}>
              {language === "EN" ? "What type of problem is this?" : "Quel type de problème s'agit-il?"}
            </h1>
            <p className={styles.sectionHelperStep1}>
              {language === "EN"
                ? "This helps us guide you to the right care. No diagnosis is given."
                : "Cela nous aide à vous orienter vers les bons soins. Aucun diagnostic n'est donné."}
            </p>

            <div className={styles.optionListStep1}>
              <button
                type="button"
                className={`${styles.optionCardStep1} ${
                  problemType === "injury" ? styles.optionSelectedStep1 : ""
                }`}
                onClick={() => {
                  setProblemType("injury");
                  setTimeout(() => handleContinueFromProblemType(), 100);
                }}
              >
                <div className={styles.optionHeaderStep1}>
                  <div className={styles.optionIconStep1}>🩹</div>
                  <div>
                    <p className={styles.optionTitleStep1}>
                      {language === "EN" ? "Injury" : "Blessure"}
                    </p>
                    <p className={styles.optionSubtitleStep1}>
                      {language === "EN"
                        ? "Cuts, bruises, sprains, or trauma."
                        : "Coupures, ecchymoses, entorses ou traumatismes."}
                    </p>
              </div>
            </div>
              </button>

                  <button
                    type="button"
                className={`${styles.optionCardStep1} ${
                  problemType === "fever" ? styles.optionSelectedStep1 : ""
                }`}
                onClick={() => {
                  setProblemType("fever");
                  setTimeout(() => handleContinueFromProblemType(), 100);
                }}
              >
                <div className={styles.optionHeaderStep1}>
                  <div className={styles.optionIconStep1}>🌡️</div>
                  <div>
                    <p className={styles.optionTitleStep1}>
                      {language === "EN" ? "Fever or infection" : "Fièvre ou infection"}
                    </p>
                    <p className={styles.optionSubtitleStep1}>
                      {language === "EN"
                        ? "Fever, cold symptoms, or signs of infection."
                        : "Fièvre, symptômes de rhume ou signes d'infection."}
                    </p>
                  </div>
                </div>
                  </button>

              <button
                type="button"
                className={`${styles.optionCardStep1} ${
                  problemType === "pain" ? styles.optionSelectedStep1 : ""
                }`}
                onClick={() => {
                  setProblemType("pain");
                  setTimeout(() => handleContinueFromProblemType(), 100);
                }}
              >
                <div className={styles.optionHeaderStep1}>
                  <div className={styles.optionIconStep1}>😣</div>
                  <div>
                    <p className={styles.optionTitleStep1}>
                      {language === "EN" ? "Pain or new symptom" : "Douleur ou nouveau symptôme"}
                    </p>
                    <p className={styles.optionSubtitleStep1}>
                      {language === "EN"
                        ? "New pain, discomfort, or other symptoms."
                        : "Nouvelle douleur, inconfort ou autres symptômes."}
                    </p>
              </div>
            </div>
              </button>

              <button
                type="button"
                className={`${styles.optionCardStep1} ${
                  problemType === "chronic" ? styles.optionSelectedStep1 : ""
                }`}
                onClick={() => {
                  setProblemType("chronic");
                  setTimeout(() => handleContinueFromProblemType(), 100);
                }}
              >
                <div className={styles.optionHeaderStep1}>
                  <div className={styles.optionIconStep1}>🔄</div>
                  <div>
                    <p className={styles.optionTitleStep1}>
                      {language === "EN" ? "Chronic condition flare" : "Poussée d'une condition chronique"}
                    </p>
                    <p className={styles.optionSubtitleStep1}>
                      {language === "EN"
                        ? "Worsening of an existing health condition."
                        : "Aggravation d'un problème de santé existant."}
                    </p>
                  </div>
                </div>
              </button>

              <button
                type="button"
                className={`${styles.optionCardStep1} ${
                  problemType === "unsure" ? styles.optionSelectedStep1 : ""
                }`}
                onClick={() => {
                  setProblemType("unsure");
                  setTimeout(() => handleContinueFromProblemType(), 100);
                }}
              >
                <div className={styles.optionHeaderStep1}>
                  <div className={styles.optionIconStep1}>❓</div>
                  <div>
                    <p className={styles.optionTitleStep1}>
                      {language === "EN" ? "I'm not sure" : "Je ne suis pas sûr"}
                    </p>
                    <p className={styles.optionSubtitleStep1}>
                      {language === "EN"
                        ? "Not sure how to categorize your concern."
                        : "Je ne sais pas comment catégoriser votre préoccupation."}
                    </p>
                  </div>
                </div>
              </button>
            </div>

            <div className={styles.bottomActions}>
              <button
                type="button"
                className={styles.secondaryButtonBottom}
                onClick={() => setStep("topic")}
              >
                {language === "EN" ? "Back" : "Retour"}
              </button>
            </div>
          </section>
        )}

        {/* Flow 1: Step 2: Safety Check */}
        {step === "notFeelingWellSafety" && (
          <section className={styles.screen}>
            <div className={styles.sectionCard}>
              <h2 className={styles.sectionTitle}>
                {language === "EN" ? "Safety check" : "Vérification de sécurité"}
              </h2>
              <p className={styles.sectionHelper}>
                {language === "EN"
                  ? "We need to check if this is an emergency. This helps ensure your safety."
                  : "Nous devons vérifier s'il s'agit d'une urgence. Cela permet d'assurer votre sécurité."}
              </p>
            </div>

            <div className={styles.sectionCard}>
              <p className={styles.sectionLabel}>
                {language === "EN"
                  ? "Are you experiencing any of the following right now?"
                  : "Éprouvez-vous l'un des symptômes suivants en ce moment?"}
              </p>
              <ul className={styles.checklist} style={{ marginTop: "8px", marginBottom: "16px" }}>
                <li>
                  {language === "EN" ? "Difficulty breathing" : "Difficulté à respirer"}
                </li>
                <li>
                  {language === "EN" ? "Chest pain" : "Douleur thoracique"}
                </li>
                <li>
                  {language === "EN" ? "Severe bleeding" : "Saignement important"}
                </li>
                <li>
                  {language === "EN" ? "Loss of consciousness" : "Perte de conscience"}
                </li>
                <li>
                  {language === "EN" ? "Sudden severe symptom" : "Symptôme grave soudain"}
                </li>
              </ul>
              <div className={styles.chipRow}>
                <button
                  type="button"
                  className={`${styles.chip} ${
                    safetyAnswer === "yes" ? styles.chipSelected : ""
                  }`}
                  onClick={() => {
                    setSafetyAnswer("yes");
                    setTimeout(() => handleContinueFromSafety(), 100);
                  }}
                >
                  {language === "EN" ? "Yes" : "Oui"}
                </button>
                <button
                  type="button"
                  className={`${styles.chip} ${
                    safetyAnswer === "no" ? styles.chipSelected : ""
                  }`}
                  onClick={() => {
                    setSafetyAnswer("no");
                    setTimeout(() => handleContinueFromSafety(), 100);
                  }}
                >
                  {language === "EN" ? "No" : "Non"}
                </button>
              </div>
            </div>

            <div className={styles.safetyBanner}>
              {language === "EN"
                ? "If you feel unsafe or much worse, go to the emergency room or call 911 immediately."
                : "Si vous vous sentez en danger ou beaucoup plus mal, allez à l'urgence ou appelez le 911 immédiatement."}
            </div>

            <div className={styles.bottomActions}>
              <button
                type="button"
                className={styles.secondaryButtonBottom}
                onClick={() => setStep("notFeelingWellType")}
              >
                {language === "EN" ? "Back" : "Retour"}
              </button>
            </div>
          </section>
        )}

        {/* Flow 1: Step 3: Severity */}
        {step === "notFeelingWellSeverity" && (
          <section className={styles.screen}>
              <div className={styles.sectionCard}>
              <h2 className={styles.sectionTitle}>
                {language === "EN" ? "How severe is this?" : "Quelle est la gravité?"}
              </h2>
              <p className={styles.sectionHelper}>
                {language === "EN"
                  ? "Choose the level that best describes your symptoms right now."
                  : "Choisissez le niveau qui décrit le mieux vos symptômes en ce moment."}
                </p>
              </div>

              <div className={styles.optionList}>
                    <button
                      type="button"
                      className={`${styles.optionCard} ${
                  severityLevel === "mild" ? styles.optionSelected : ""
                      }`}
                onClick={() => {
                  setSeverityLevel("mild");
                  setTimeout(() => handleContinueFromSeverity(), 100);
                }}
                    >
                      <div className={styles.optionHeader}>
                  <div>
                    <p className={styles.optionTitle}>
                      {language === "EN" ? "Mild" : "Léger"}
                    </p>
                    <p className={styles.optionSubtitle}>
                      {language === "EN"
                        ? "Uncomfortable but manageable. You can go about your day."
                        : "Inconfortable mais gérable. Vous pouvez vaquer à vos occupations."}
                    </p>
                        </div>
                </div>
              </button>

              <button
                type="button"
                className={`${styles.optionCard} ${
                  severityLevel === "moderate" ? styles.optionSelected : ""
                }`}
                onClick={() => {
                  setSeverityLevel("moderate");
                  setTimeout(() => handleContinueFromSeverity(), 100);
                }}
              >
                <div className={styles.optionHeader}>
                        <div>
                    <p className={styles.optionTitle}>
                      {language === "EN" ? "Moderate" : "Modéré"}
                    </p>
                    <p className={styles.optionSubtitle}>
                      {language === "EN"
                        ? "Noticeably bothersome. Affects your daily activities."
                        : "Visiblement gênant. Affecte vos activités quotidiennes."}
                    </p>
                        </div>
                      </div>
              </button>

              <button
                type="button"
                className={`${styles.optionCard} ${
                  severityLevel === "severe" ? styles.optionSelected : ""
                }`}
                onClick={() => {
                  setSeverityLevel("severe");
                  setTimeout(() => handleContinueFromSeverity(), 100);
                }}
              >
                <div className={styles.optionHeader}>
                  <div>
                    <p className={styles.optionTitle}>
                      {language === "EN" ? "Severe" : "Grave"}
                    </p>
                    <p className={styles.optionSubtitle}>
                      {language === "EN"
                        ? "Very intense or unbearable. Hard to focus on anything else."
                        : "Très intense ou insupportable. Difficile de se concentrer sur autre chose."}
                    </p>
                      </div>
                </div>
              </button>
            </div>

            <div className={styles.bottomActions}>
              <button
                type="button"
                className={styles.secondaryButtonBottom}
                onClick={() => setStep("notFeelingWellSafety")}
              >
                {language === "EN" ? "Back" : "Retour"}
              </button>
            </div>
          </section>
        )}

        {/* Flow 1: Step 4: Recommendation */}
        {step === "notFeelingWellRecommendation" && (
          <section className={styles.screen}>
              <div className={styles.sectionCard}>
              <h2 className={styles.sectionTitle}>
                {language === "EN" ? "Suggested care option" : "Option de soins suggérée"}
              </h2>
              <p className={styles.sectionHelper}>
                {language === "EN"
                  ? "Based on your answers, this option fits your situation. Tap to see next steps."
                  : "Basé sur vos réponses, cette option correspond à votre situation. Appuyez pour voir les prochaines étapes."}
                </p>
              </div>

              <div className={styles.optionList}>
              {recommendedOptions.map((id) => {
                const option = careOptions[id];
                  return (
                    <button
                      key={id}
                      type="button"
                      className={`${styles.optionCardRecommendation} ${
                      selectedCareOption === id ? styles.optionSelected : ""
                      }`}
                    onClick={() => {
                      setSelectedCareOption(id);
                      setStep("notFeelingWellNextStep");
                    }}
                    >
                      <div className={styles.optionHeaderRecommendation}>
                        <div className={styles.optionIconRecommendation}>
                          {option.label.match(/^[\u{1F300}-\u{1F9FF}]+/u)?.[0] || option.label.charAt(0)}
                        </div>
                        <div className={styles.optionContentRecommendation}>
                          <h3 className={styles.optionTitleRecommendation}>
                            {option.label.replace(/^[\u{1F300}-\u{1F9FF}]+\s*/u, "")}
                          </h3>
                          <div className={styles.optionDetailSection}>
                            <p className={styles.optionDetailLabel}>
                              {language === "EN" ? "Why this option fits" : "Pourquoi cette option convient"}
                            </p>
                            <p className={styles.optionDetailText}>{option.why}</p>
                          </div>
                          <div className={styles.optionDetailSection}>
                            <p className={styles.optionDetailLabel}>
                              {language === "EN" ? "What this option can do" : "Ce que cette option peut faire"}
                            </p>
                            <p className={styles.optionDetailText}>{option.canDo}</p>
                          </div>
                          {option.cannotDo && (
                            <div className={styles.optionDetailSection}>
                              <p className={styles.optionDetailLabel}>
                                {language === "EN" ? "What it cannot do" : "Ce qu'elle ne peut pas faire"}
                              </p>
                              <p className={styles.optionDetailText}>{option.cannotDo}</p>
                            </div>
                          )}
                          <div className={styles.optionDetailSection}>
                            <p className={styles.optionDetailLabel}>
                              {language === "EN" ? "Time expectations" : "Délais attendus"}
                            </p>
                            <p className={styles.optionDetailText}>{option.timeExpectation}</p>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

            <div className={styles.safetyBanner}>
              {language === "EN"
                ? "If symptoms suddenly get worse, if you feel very unwell, or feel unsafe at home, go to the emergency room or call 911."
                : "Si les symptômes s'aggravent soudainement, si vous vous sentez très mal ou en danger à la maison, allez à l'urgence ou appelez le 911."}
            </div>

            <div className={styles.bottomActions}>
              <button
                type="button"
                className={styles.secondaryButtonBottom}
                onClick={() => setStep("notFeelingWellSeverity")}
              >
                {language === "EN" ? "Back" : "Retour"}
              </button>
            </div>
          </section>
        )}

        {/* Flow 1: Step 5: Next Step */}
        {step === "notFeelingWellNextStep" && selectedCareOption && (
          <section className={styles.screen}>
            <div className={styles.sectionCard}>
              <h2 className={styles.sectionTitle}>
                Next step: {careOptions[selectedCareOption].label}
              </h2>
              <p className={styles.sectionHelper}>
                Follow these instructions to move forward. This is navigation support only, not a
                diagnosis.
              </p>
            </div>

            {(() => {
              const content = getNextStepContent(selectedCareOption);
              return (
            <div className={styles.sectionCard}>
                  <p className={styles.sectionLabel}>{content.title}</p>
                  <ul className={styles.checklist}>
                    {content.body.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                  {content.linkHref && content.linkLabel && (
                    <a
                      href={content.linkHref}
                      target="_blank"
                      rel="noreferrer"
                      className={styles.linkButton}
                    >
                      {content.linkLabel}
                    </a>
                  )}
                  <p className={styles.sectionHelper}>
                    {language === "EN"
                      ? "You can also call Info-Santé 811 for nurse advice about where to go."
                      : "Vous pouvez également appeler Info-Santé 811 pour obtenir des conseils d'infirmière sur où aller."}
                  </p>
            </div>
              );
            })()}

            <div className={styles.safetyBanner}>
              {language === "EN"
                ? "If your condition suddenly worsens or you are very worried about your safety, go to the emergency room or call 911."
                : "Si votre état s'aggrave soudainement ou si vous êtes très inquiet pour votre sécurité, allez à l'urgence ou appelez le 911."}
            </div>

            <div className={styles.bottomActions}>
              <button
                type="button"
                className={styles.secondaryButtonBottom}
                onClick={restart}
              >
                {language === "EN" ? "Restart" : "Recommencer"}
              </button>
            </div>
          </section>
        )}

        {/* Flow 2: I need help with medication - Step 1: Type of help */}
        {step === "medicationType" && (
          <section className={styles.step1Screen}>
            <h1 className={styles.sectionTitleStep1}>What type of medication help do you need?</h1>
            <p className={styles.sectionHelperStep1}>
              This helps us direct you to the right place.
            </p>

            <div className={styles.optionListStep1}>
              <button
                type="button"
                className={`${styles.optionCardStep1} ${
                  medicationType === "renewal" ? styles.optionSelectedStep1 : ""
                }`}
                onClick={() => setMedicationType("renewal")}
              >
                <div className={styles.optionHeaderStep1}>
                  <div className={styles.optionIconStep1}>🔄</div>
                  <div>
                    <p className={styles.optionTitleStep1}>Renewal / refill</p>
                    <p className={styles.optionSubtitleStep1}>
                      Need to refill a prescription that&apos;s running out.
                    </p>
                  </div>
                </div>
              </button>

              <button
                type="button"
                className={`${styles.optionCardStep1} ${
                  medicationType === "minorCondition" ? styles.optionSelectedStep1 : ""
                }`}
                onClick={() => {
                  setMedicationType("minorCondition");
                  setTimeout(() => handleContinueFromMedicationType(), 100);
                }}
              >
                <div className={styles.optionHeaderStep1}>
                  <div className={styles.optionIconStep1}>🩹</div>
                  <div>
                    <p className={styles.optionTitleStep1}>A minor condition</p>
                    <p className={styles.optionSubtitleStep1}>
                      UTI, cold sore, eczema, allergies, or similar issue.
                    </p>
                  </div>
                </div>
              </button>

              <button
                type="button"
                className={`${styles.optionCardStep1} ${
                  medicationType === "otcQuestion" ? styles.optionSelectedStep1 : ""
                }`}
                onClick={() => {
                  setMedicationType("otcQuestion");
                  setTimeout(() => handleContinueFromMedicationType(), 100);
                }}
              >
                <div className={styles.optionHeaderStep1}>
                  <div className={styles.optionIconStep1}>💡</div>
                  <div>
                    <p className={styles.optionTitleStep1}>A question about OTC medication</p>
                    <p className={styles.optionSubtitleStep1}>
                      Need advice about over-the-counter products or dosing.
                    </p>
                  </div>
                </div>
              </button>

              <button
                type="button"
                className={`${styles.optionCardStep1} ${
                  medicationType === "sideEffects" ? styles.optionSelectedStep1 : ""
                }`}
                onClick={() => {
                  setMedicationType("sideEffects");
                  setTimeout(() => handleContinueFromMedicationType(), 100);
                }}
              >
                <div className={styles.optionHeaderStep1}>
                  <div className={styles.optionIconStep1}>⚠️</div>
                  <div>
                    <p className={styles.optionTitleStep1}>Side effects or concerns</p>
                    <p className={styles.optionSubtitleStep1}>
                      Experiencing side effects or worried about your medication.
                    </p>
                  </div>
                </div>
              </button>

              <button
                type="button"
                className={`${styles.optionCardStep1} ${
                  medicationType === "unsure" ? styles.optionSelectedStep1 : ""
                }`}
                onClick={() => {
                  setMedicationType("unsure");
                  setTimeout(() => handleContinueFromMedicationType(), 100);
                }}
              >
                <div className={styles.optionHeaderStep1}>
                  <div className={styles.optionIconStep1}>❓</div>
                  <div>
                    <p className={styles.optionTitleStep1}>I&apos;m not sure</p>
                    <p className={styles.optionSubtitleStep1}>
                      Not sure how to categorize your medication question.
                    </p>
                  </div>
                </div>
              </button>
            </div>

            <div className={styles.bottomActions}>
              <button
                type="button"
                className={styles.secondaryButtonBottom}
                onClick={() => setStep("topic")}
              >
                {language === "EN" ? "Back" : "Retour"}
              </button>
            </div>
          </section>
        )}

        {/* Flow 2: Step 2: Pharmacist Scope */}
        {step === "medicationScope" && (
          <section className={styles.screen}>
            <div className={styles.sectionCard}>
              <h2 className={styles.sectionTitle}>What pharmacists can help with</h2>
              <p className={styles.sectionHelper}>
                Pharmacists in Québec have expanded scope of practice. They can help with many medication-related concerns.
              </p>
            </div>

            <div className={styles.sectionCard}>
              <p className={styles.sectionLabel} style={{ marginBottom: "12px", fontWeight: "600" }}>
                Pharmacists in Québec can:
              </p>
              <ul className={styles.checklist}>
                <li>Renew most maintenance medications</li>
                <li>Prescribe for minor ailments (UTI, cold sore, eczema, allergies)</li>
                <li>Adjust medication dosage</li>
                <li>Substitute equivalent drugs when needed</li>
                <li>Provide medication advice and counseling</li>
                <li>Treat common infections</li>
              </ul>
            </div>

            <div className={styles.bottomActions}>
              <button
                type="button"
                className={styles.secondaryButtonBottom}
                onClick={() => setStep("medicationType")}
              >
                Back
              </button>
              <button
                type="button"
                className={styles.primaryButtonBottom}
                onClick={handleContinueFromMedicationScope}
              >
                {language === "EN" ? "Continue" : "Continuer"}
              </button>
              </div>
          </section>
        )}

        {/* Flow 2: Step 3: Recommendation */}
        {step === "medicationRecommendation" && (
          <section className={styles.screen}>
            <div className={styles.sectionCard}>
              <h2 className={styles.sectionTitle}>
                {language === "EN" ? "Recommendation" : "Recommandation"}
              </h2>
              <p className={styles.sectionHelper}>
                {language === "EN"
                  ? "Based on your situation, here's what we recommend."
                  : "Basé sur votre situation, voici ce que nous recommandons."}
              </p>
              </div>

            <div className={styles.sectionCard}>
              {pharmacistCanHelp ? (
                <>
                  <p className={styles.sectionLabel} style={{ fontSize: "16px", marginBottom: "12px", fontWeight: "600" }}>
                    A pharmacist can help you with this.
                  </p>
                  <p className={styles.sectionHelper}>
                    A pharmacist can address your medication concern. They may be able to renew your prescription, 
                    prescribe for minor conditions, or provide advice based on their expanded scope of practice in Québec.
                  </p>
                </>
              ) : (
                <>
                  <p className={styles.sectionLabel} style={{ fontSize: "16px", marginBottom: "12px", fontWeight: "600" }}>
                    You may need a clinic visit for this issue.
                  </p>
                  <p className={styles.sectionHelper}>
                    While pharmacists can help with many medication concerns, this issue may require a clinic visit 
                    for proper evaluation. A pharmacist can still provide initial advice and may help determine if 
                    immediate care is needed.
                  </p>
                </>
              )}
              </div>

            <div className={styles.bottomActions}>
              <button
                type="button"
                className={styles.secondaryButtonBottom}
                onClick={() => setStep("medicationScope")}
              >
                Back
              </button>
              <button
                type="button"
                className={styles.primaryButtonBottom}
                onClick={() => setStep("medicationAction")}
              >
                {language === "EN" ? "Next steps" : "Prochaines étapes"}
              </button>
            </div>
          </section>
        )}

        {/* Flow 2: Step 4: Action */}
        {step === "medicationAction" && (
          <section className={styles.screen}>
            <div className={styles.sectionCard}>
              <h2 className={styles.sectionTitle}>
                {language === "EN" ? "Next steps" : "Prochaines étapes"}
              </h2>
              <p className={styles.sectionHelper}>
                {language === "EN"
                  ? "Choose an action to move forward with your medication concern."
                  : "Choisissez une action pour avancer avec votre préoccupation concernant les médicaments."}
              </p>
            </div>

            <div className={styles.actionsColumn} style={{ gap: "12px" }}>
              {pharmacistCanHelp ? (
                <>
                  <a
                    href="https://www.google.com/maps/search/pharmacy"
                    target="_blank"
                    rel="noreferrer"
                    className={styles.primaryButton}
                    style={{ textDecoration: "none", textAlign: "center" }}
                  >
                    Find a pharmacy
                  </a>
                  
                  <div className={styles.sectionCard} style={{ marginTop: "8px" }}>
                    <p className={styles.sectionHelper} style={{ fontSize: "13px", margin: "0" }}>
                      <strong>When you go:</strong> Bring your RAMQ card and a list of current medications. 
                      The pharmacist can help with renewals, minor conditions, or medication questions.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <a
                    href="https://www.google.com/maps/search/pharmacy"
                    target="_blank"
                    rel="noreferrer"
                    className={styles.secondaryButton}
                    style={{ textDecoration: "none", textAlign: "center", width: "100%" }}
                  >
                    Find a pharmacy (for initial advice)
                  </a>
                  
                  <button
                    type="button"
                    className={styles.primaryButton}
                    onClick={() => {
                      setRecommendedOptions(["walkIn", "clsc"]);
                      setSelectedCareOption(null);
                      setStep("recommendation");
                    }}
                  >
                    See clinic options
              </button>
                </>
              )}
              
              <div className={styles.sectionCard} style={{ marginTop: "8px" }}>
                <p className={styles.sectionHelper} style={{ fontSize: "13px", margin: "0" }}>
                  <strong>Tip:</strong> You can call pharmacies ahead to check if a pharmacist is available 
                  and what services they offer. Bring your RAMQ card to your visit.
                </p>
              </div>
            </div>

            <div className={styles.bottomActions}>
              <button
                type="button"
                className={styles.secondaryButtonBottom}
                onClick={() => setStep("medicationRecommendation")}
              >
                Back
              </button>
            </div>
          </section>
        )}

        {/* Flow 3: I need to book or manage an appointment - Step 1: Type of appointment */}
        {step === "appointmentType" && (
          <section className={styles.step1Screen}>
            <h1 className={styles.sectionTitleStep1}>
              {language === "EN" ? "What kind of appointment do you need?" : "Quel type de rendez-vous avez-vous besoin?"}
            </h1>
            <p className={styles.sectionHelperStep1}>
              {language === "EN"
                ? "Choose the type of appointment you want to book or manage."
                : "Choisissez le type de rendez-vous que vous souhaitez prendre ou gérer."}
            </p>

            <div className={styles.optionListStep1}>
              <button
                type="button"
                className={`${styles.optionCardStep1} ${
                  appointmentType === "vaccination" ? styles.optionSelectedStep1 : ""
                }`}
                onClick={() => setAppointmentType("vaccination")}
              >
                <div className={styles.optionHeaderStep1}>
                  <div className={styles.optionIconStep1}>💉</div>
                  <div>
                    <p className={styles.optionTitleStep1}>Vaccination</p>
                    <p className={styles.optionSubtitleStep1}>
                      Flu, COVID-19, RSV, routine vaccinations.
                    </p>
                  </div>
                </div>
              </button>

              <button
                type="button"
                className={`${styles.optionCardStep1} ${
                  appointmentType === "bloodTest" ? styles.optionSelectedStep1 : ""
                }`}
                onClick={() => {
                  setAppointmentType("bloodTest");
                  setTimeout(() => handleContinueFromAppointmentType(), 100);
                }}
              >
                <div className={styles.optionHeaderStep1}>
                  <div className={styles.optionIconStep1}>🧪</div>
                  <div>
                    <p className={styles.optionTitleStep1}>Blood tests / specimens</p>
                    <p className={styles.optionSubtitleStep1}>
                      Lab work, blood draws, or specimen collection.
                    </p>
                  </div>
                </div>
              </button>

              <button
                type="button"
                className={`${styles.optionCardStep1} ${
                  appointmentType === "nurseVisit" ? styles.optionSelectedStep1 : ""
                }`}
                onClick={() => {
                  setAppointmentType("nurseVisit");
                  setTimeout(() => handleContinueFromAppointmentType(), 100);
                }}
              >
                <div className={styles.optionHeaderStep1}>
                  <div className={styles.optionIconStep1}>👩‍⚕️</div>
                  <div>
                    <p className={styles.optionTitleStep1}>Nurse visit</p>
                    <p className={styles.optionSubtitleStep1}>
                      Nursing care, wound checks, or follow-up visits.
                    </p>
                  </div>
                </div>
              </button>

              <button
                type="button"
                className={`${styles.optionCardStep1} ${
                  appointmentType === "screening" ? styles.optionSelectedStep1 : ""
                }`}
                onClick={() => {
                  setAppointmentType("screening");
                  setTimeout(() => handleContinueFromAppointmentType(), 100);
                }}
              >
                <div className={styles.optionHeaderStep1}>
                  <div className={styles.optionIconStep1}>🔍</div>
                  <div>
                    <p className={styles.optionTitleStep1}>Screening test</p>
                    <p className={styles.optionSubtitleStep1}>
                      Cancer screening, health checkups, or preventive tests.
                    </p>
                  </div>
                </div>
              </button>

              <button
                type="button"
                className={`${styles.optionCardStep1} ${
                  appointmentType === "unsure" ? styles.optionSelectedStep1 : ""
                }`}
                onClick={() => {
                  setAppointmentType("unsure");
                  setTimeout(() => handleContinueFromAppointmentType(), 100);
                }}
              >
                <div className={styles.optionHeaderStep1}>
                  <div className={styles.optionIconStep1}>❓</div>
                  <div>
                    <p className={styles.optionTitleStep1}>I&apos;m not sure</p>
                    <p className={styles.optionSubtitleStep1}>
                      Not sure which type of appointment you need.
                    </p>
                  </div>
                </div>
              </button>
            </div>

            <div className={styles.bottomActions}>
              <button
                type="button"
                className={styles.secondaryButtonBottom}
                onClick={() => setStep("topic")}
              >
                Back
              </button>
            </div>
          </section>
        )}

        {/* Flow 3: Step 2: Requirements */}
        {step === "appointmentRequirements" && (
          <section className={styles.screen}>
            <div className={styles.sectionCard}>
              <h2 className={styles.sectionTitle}>What you&apos;ll need</h2>
              <p className={styles.sectionHelper}>
                Some services may require a prescription or referral. Here&apos;s what to know.
              </p>
            </div>

            <div className={styles.sectionCard}>
              {appointmentType === "vaccination" && (
                <>
                  <p className={styles.sectionHelper} style={{ marginBottom: "12px" }}>
                    <strong>Most vaccinations</strong> can be booked through Clic Santé or your local CLSC.
                    Bring your RAMQ card to your appointment.
                  </p>
                  <p className={styles.sectionHelper}>
                    Some vaccinations may be available at pharmacies. Check with your local pharmacy for availability.
                  </p>
                </>
              )}
              {appointmentType === "bloodTest" && (
                <>
                  <p className={styles.sectionHelper} style={{ marginBottom: "12px" }}>
                    <strong>Some blood tests require a prescription.</strong> We&apos;ll let you know which ones 
                    when you book.
                  </p>
                  <p className={styles.sectionHelper}>
                    Many routine blood tests can be booked directly through Clic Santé. Bring your RAMQ card and 
                    any requisition form if you have one.
                  </p>
                </>
              )}
              {appointmentType === "nurseVisit" && (
                <>
                  <p className={styles.sectionHelper} style={{ marginBottom: "12px" }}>
                    <strong>Nurse visits</strong> are typically available at CLSC locations.
                  </p>
                  <p className={styles.sectionHelper}>
                    Some services may require a referral from a doctor. Call your local CLSC to check what&apos;s 
                    needed. Bring your RAMQ card.
                  </p>
                </>
              )}
              {appointmentType === "screening" && (
                <>
                  <p className={styles.sectionHelper} style={{ marginBottom: "12px" }}>
                    <strong>Screening programs</strong> are often coordinated through public health or your CLSC.
                  </p>
                  <p className={styles.sectionHelper}>
                    Some screenings require a referral. Contact your CLSC or visit the Québec health ministry website 
                    for information about available screening programs.
                  </p>
                </>
              )}
              {appointmentType === "unsure" && (
                <>
                  <p className={styles.sectionHelper} style={{ marginBottom: "12px" }}>
                    <strong>If you&apos;re not sure,</strong> you can call Info-Santé 811 for guidance on what 
                    type of appointment you need.
                  </p>
                  <p className={styles.sectionHelper}>
                    Your local CLSC can also help you understand which services are available and how to book them.
                  </p>
                </>
              )}
            </div>

            <div className={styles.bottomActions}>
              <button
                type="button"
                className={styles.secondaryButtonBottom}
                onClick={() => setStep("appointmentType")}
              >
                Back
              </button>
              <button
                type="button"
                className={styles.primaryButtonBottom}
                onClick={handleContinueFromAppointmentRequirements}
              >
                Continue
              </button>
              </div>
          </section>
        )}

        {/* Flow 3: Step 3: Direct Action */}
        {step === "appointmentAction" && (
          <section className={styles.screen}>
            <div className={styles.sectionCard}>
              <h2 className={styles.sectionTitle}>Book your appointment</h2>
              <p className={styles.sectionHelper}>
                Choose an option to book or find your appointment.
              </p>
              </div>

            <div className={styles.actionsColumn} style={{ gap: "12px" }}>
              {appointmentType === "vaccination" && (
                <a
                  href="https://portal3.clicsante.ca/"
                  target="_blank"
                  rel="noreferrer"
                  className={styles.primaryButton}
                  style={{ textDecoration: "none", textAlign: "center" }}
                >
                  Book vaccination appointment
                </a>
              )}
              
              {appointmentType === "bloodTest" && (
                <a
                  href="https://portal3.clicsante.ca/"
                  target="_blank"
                  rel="noreferrer"
                  className={styles.primaryButton}
                  style={{ textDecoration: "none", textAlign: "center" }}
                >
                  Find a blood test clinic near you
                </a>
              )}

              {appointmentType === "nurseVisit" && (
                <a
                  href="https://www.quebec.ca/en/health/finding-resource/clsc"
                  target="_blank"
                  rel="noreferrer"
                  className={styles.primaryButton}
                  style={{ textDecoration: "none", textAlign: "center" }}
                >
                  See nurse visit options at CLSC
                </a>
              )}

              {appointmentType === "screening" && (
                <a
                  href="https://www.quebec.ca/en/health/health-system-and-services/preventive-health-and-health-promotion"
                  target="_blank"
                  rel="noreferrer"
                  className={styles.primaryButton}
                  style={{ textDecoration: "none", textAlign: "center" }}
                >
                  Learn more about screening programs
                </a>
              )}

              {appointmentType === "unsure" && (
                <>
                  <a
                    href="https://portal3.clicsante.ca/"
                    target="_blank"
                    rel="noreferrer"
                    className={styles.primaryButton}
                    style={{ textDecoration: "none", textAlign: "center" }}
                  >
                    Visit Clic Santé
                  </a>
                  <a
                    href="https://www.quebec.ca/en/health/finding-resource/clsc"
                    target="_blank"
                    rel="noreferrer"
                    className={styles.secondaryButton}
                    style={{ textDecoration: "none", textAlign: "center", width: "100%" }}
                  >
                    Find your local CLSC
                  </a>
                </>
              )}

              <div className={styles.sectionCard} style={{ marginTop: "8px" }}>
                <p className={styles.sectionHelper} style={{ fontSize: "13px", margin: "0" }}>
                  <strong>Remember:</strong> Bring your RAMQ card to your appointment. Some services may require 
                  a prescription or referral - check when booking.
                </p>
              </div>
            </div>

            <div className={styles.bottomActions}>
              <button
                type="button"
                className={styles.secondaryButtonBottom}
                onClick={() => setStep("appointmentRequirements")}
              >
                Back
              </button>
            </div>
          </section>
        )}

        {step === "questions" && (
          <section className={styles.step1Screen}>
            <h1 className={styles.sectionTitleStep1}>
              {language === "EN" ? "A few quick questions" : "Quelques questions rapides"}
            </h1>
            <p className={styles.sectionHelperStep1}>
              {language === "EN"
                ? "This helps choose a safe care option. No diagnosis is given."
                : "Cela aide à choisir une option de soins sécuritaire. Aucun diagnostic n'est donné."}
            </p>

            <div className={styles.optionListStep1}>
              <div className={styles.sectionCard}>
                <p className={styles.sectionLabel}>
                  Is this causing severe pain, difficulty breathing, or heavy bleeding?
                </p>
                <div className={styles.chipRow}>
                  <button
                    type="button"
                    className={`${styles.chip} ${
                      severity === "yes" ? styles.chipSelected : ""
                    }`}
                    onClick={() => setSeverity("yes")}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    className={`${styles.chip} ${
                      severity === "no" ? styles.chipSelected : ""
                    }`}
                    onClick={() => setSeverity("no")}
                  >
                    No
                  </button>
                </div>
              </div>

              <div className={styles.sectionCard}>
                <p className={styles.sectionLabel}>Who is this for?</p>
                <div className={styles.chipRow}>
                  <button
                    type="button"
                    className={`${styles.chip} ${
                      ageGroup === "adult" ? styles.chipSelected : ""
                    }`}
                    onClick={() => setAgeGroup("adult")}
                  >
                    👤 Adult
                  </button>
                  <button
                    type="button"
                    className={`${styles.chip} ${
                      ageGroup === "child" ? styles.chipSelected : ""
                    }`}
                    onClick={() => setAgeGroup("child")}
                  >
                    👶 Child
                  </button>
                </div>
              </div>

              <div className={styles.sectionCard}>
                <p className={styles.sectionLabel}>Do you need care within 24 hours?</p>
                <div className={styles.chipRow}>
                  <button
                    type="button"
                    className={`${styles.chip} ${
                      timeNeed === "yes" ? styles.chipSelected : ""
                    }`}
                    onClick={() => setTimeNeed("yes")}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    className={`${styles.chip} ${
                      timeNeed === "no" ? styles.chipSelected : ""
                    }`}
                    onClick={() => setTimeNeed("no")}
                  >
                    No
                  </button>
                </div>
              </div>
            </div>

            <div className={styles.safetyBanner}>
              This tool does not diagnose. If you feel unsafe or much worse, go to the emergency room
              or call 911.
            </div>

            <div className={styles.bottomActions}>
              <button
                type="button"
                className={styles.secondaryButtonBottom}
                onClick={() => setStep("topic")}
              >
                Back
              </button>
              <button
                type="button"
                className={`${styles.primaryButtonBottom} ${
                  !canContinueFromQuestions ? styles.buttonDisabled : ""
                }`}
                disabled={!canContinueFromQuestions}
                onClick={handleContinueFromQuestions}
              >
                See care options
              </button>
            </div>
          </section>
        )}

        {step === "recommendation" && (
          <section className={styles.step1Screen}>
            <h1 className={styles.sectionTitleStep1}>
              {language === "EN" ? "Suggested care options" : "Options de soins suggérées"}
            </h1>
            <p className={styles.sectionHelperStep1}>
              {language === "EN"
                ? "Based on your answers, these options fit your situation. Choose one to see next steps."
                : "Basé sur vos réponses, ces options correspondent à votre situation. Choisissez-en une pour voir les prochaines étapes."}
            </p>

              <div className={styles.optionListStep1}>
              {recommendedOptions.map((id) => {
                const option = careOptions[id];
                  return (
                    <button
                      key={id}
                      type="button"
                      className={`${styles.optionCardRecommendation} ${
                      selectedCareOption === id ? styles.optionSelected : ""
                      }`}
                    onClick={() => {
                      setSelectedCareOption(id);
                      setStep("nextStep");
                    }}
                    >
                      <div className={styles.optionHeaderRecommendation}>
                        <div className={styles.optionIconRecommendation}>
                          {option.label.match(/^[\u{1F300}-\u{1F9FF}]+/u)?.[0] || option.label.charAt(0)}
                        </div>
                        <div className={styles.optionContentRecommendation}>
                          <h3 className={styles.optionTitleRecommendation}>
                            {option.label.replace(/^[\u{1F300}-\u{1F9FF}]+\s*/u, "")}
                          </h3>
                          <div className={styles.optionDetailSection}>
                            <p className={styles.optionDetailLabel}>
                              {language === "EN" ? "Why this option fits" : "Pourquoi cette option convient"}
                            </p>
                            <p className={styles.optionDetailText}>{option.why}</p>
                          </div>
                          <div className={styles.optionDetailSection}>
                            <p className={styles.optionDetailLabel}>
                              {language === "EN" ? "What this option can do" : "Ce que cette option peut faire"}
                            </p>
                            <p className={styles.optionDetailText}>{option.canDo}</p>
                          </div>
                          {option.cannotDo && (
                            <div className={styles.optionDetailSection}>
                              <p className={styles.optionDetailLabel}>
                                {language === "EN" ? "What it cannot do" : "Ce qu'elle ne peut pas faire"}
                              </p>
                              <p className={styles.optionDetailText}>{option.cannotDo}</p>
                            </div>
                          )}
                          <div className={styles.optionDetailSection}>
                            <p className={styles.optionDetailLabel}>
                              {language === "EN" ? "Time expectations" : "Délais attendus"}
                            </p>
                            <p className={styles.optionDetailText}>{option.timeExpectation}</p>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

            <div className={styles.safetyBanner}>
              If symptoms suddenly get worse, if you feel very unwell, or feel unsafe at home, go to the
              emergency room or call 911.
            </div>

            <div className={styles.bottomActions}>
              <button
                type="button"
                className={styles.secondaryButtonBottom}
                onClick={() => setStep("questions")}
              >
                Back
              </button>
            </div>
          </section>
        )}

        {step === "otherFallback" && (
          <section className={styles.screen}>
            <div className={styles.sectionCard}>
              <h2 className={styles.sectionTitle}>
                {language === "EN" ? "We'll help you with other requests." : "Nous vous aiderons avec d'autres demandes."}
              </h2>
              <p className={styles.sectionHelper}>
                {language === "EN"
                  ? "For now, if you're not sure which option fits, you can call Info-Santé 811 for nurse advice or contact your local CLSC for general support."
                  : "Pour l'instant, si vous n'êtes pas sûr de l'option qui convient, vous pouvez appeler Info-Santé 811 pour des conseils d'infirmière ou contacter votre CLSC local pour un soutien général."}
              </p>
            </div>

            <div className={styles.bottomActions}>
              <button
                type="button"
                className={styles.secondaryButtonBottom}
                onClick={() => setStep("topic")}
              >
                Back
              </button>
            </div>
          </section>
        )}

        {step === "nextStep" && selectedCareOption && (
          <section className={styles.screen}>
            <div className={styles.sectionCard}>
              <h2 className={styles.sectionTitle}>
                {language === "EN"
                  ? `Next step: ${careOptions[selectedCareOption].label.replace(/^[\u{1F300}-\u{1F9FF}]+\s*/u, "")}`
                  : `Prochaine étape: ${careOptions[selectedCareOption].label.replace(/^[\u{1F300}-\u{1F9FF}]+\s*/u, "")}`}
              </h2>
              <p className={styles.sectionHelper}>
                {language === "EN"
                  ? "Follow these instructions to move forward. This is navigation support only, not a diagnosis."
                  : "Suivez ces instructions pour continuer. Il s'agit uniquement d'un soutien à la navigation, pas d'un diagnostic."}
              </p>
              </div>

            {(() => {
              const content = getNextStepContent(selectedCareOption);
              return (
                <div className={styles.sectionCard}>
                  <p className={styles.sectionLabel}>{content.title}</p>
                  <ul className={styles.checklist}>
                    {content.body.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                  {content.linkHref && content.linkLabel && (
                    <a
                      href={content.linkHref}
                      target="_blank"
                      rel="noreferrer"
                      className={styles.linkButton}
                    >
                      {content.linkLabel}
                    </a>
                  )}
                  <p className={styles.sectionHelper}>
                    You can also call Info-Santé&nbsp;811 for nurse advice about where to go.
                  </p>
              </div>
              );
            })()}

            <div className={styles.safetyBanner}>
              If your condition suddenly worsens or you are very worried about your safety, go to the
              emergency room or call 911.
            </div>

            <div className={styles.bottomActions}>
              <button
                type="button"
                className={styles.secondaryButtonBottom}
                onClick={restart}
              >
                Restart
              </button>
            </div>
          </section>
        )}
      </main>

      <button type="button" className={styles.emergencyBar}>
        {language === "EN"
          ? "🚨 Life-threatening emergency? Call 911 or go to the nearest emergency room."
          : "🚨 Urgence mettant la vie en danger? Appelez le 911 ou allez à l'urgence la plus proche."}
      </button>
    </div>
  );
}



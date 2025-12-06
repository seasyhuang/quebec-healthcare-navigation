"use client";

import { useState } from "react";
import styles from "./page.module.css";

type Step =
  | "landing"
  | "topic"
  | "questions"
  | "recommendation"
  | "nextStep"
  | "otherFallback";

type Topic =
  | "notFeelingWell"
  | "medication"
  | "appointment"
  | "other";

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
  const [language, setLanguage] = useState<"FR" | "EN">("FR");
  const [topic, setTopic] = useState<Topic | null>(null);
  const [severity, setSeverity] = useState<SeverityAnswer>(null);
  const [ageGroup, setAgeGroup] = useState<AgeGroup>(null);
  const [timeNeed, setTimeNeed] = useState<TimeAnswer>(null);
  const [recommendedOptions, setRecommendedOptions] = useState<CareOptionId[]>([]);
  const [selectedCareOption, setSelectedCareOption] = useState<CareOptionId | null>(null);

  const canContinueFromTopic = !!topic;
  const canContinueFromQuestions = !!severity && !!ageGroup && !!timeNeed;

  const restart = () => {
    setStep("landing");
    setTopic(null);
    setSeverity(null);
    setAgeGroup(null);
    setTimeNeed(null);
    setRecommendedOptions([]);
    setSelectedCareOption(null);
  };

  const handleContinueFromTopic = () => {
    if (topic === "other") {
      setStep("otherFallback");
    } else {
      setStep("questions");
    }
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
        <div className={styles.logoBox}> ⛑️ Allo Santé Québec</div>
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

      <main className={styles.frame}>
        {step === "landing" && (
          <section className={styles.screen}>
            <div className={styles.heroCard}>
              <h1 className={styles.heroTitle}>
                Find the right care,
                <br />
                when you need it
              </h1>
              <p className={styles.heroSubtitle}>
                Not sure where to go for care in Québec? We&apos;ll help you understand your options — no
                diagnosis.
              </p>
            </div>

            <div className={styles.primaryCtaBlock}>
              <button
                type="button"
                className={styles.primaryButton}
                onClick={() => setStep("topic")}
              >
                ▶️ Start
              </button>
            </div>
          </section>
        )}

        {step === "topic" && (
          <section className={styles.screen}>
            <p className={styles.stepLabel}>Step 1 of 3</p>
            <h1 className={styles.sectionTitle}>What do you need help with today?</h1>
            <p className={styles.sectionHelper}>
              Choose the option that fits best — you can always go back.
            </p>

            <div className={styles.optionList}>
              <button
                type="button"
                className={`${styles.optionCard} ${
                  topic === "notFeelingWell" ? styles.optionSelected : ""
                }`}
                onClick={() => setTopic("notFeelingWell")}
              >
                <div className={styles.optionHeader}>
                  <div className={styles.optionIcon}>🤒</div>
                  <div>
                    <p className={styles.optionTitle}>I&apos;m not feeling well</p>
                    <p className={styles.optionSubtitle}>
                      Find the right care for symptoms or illness.
                    </p>
                  </div>
                </div>
                <div className={styles.optionChevron}>›</div>
              </button>

              <button
                type="button"
                className={`${styles.optionCard} ${
                  topic === "medication" ? styles.optionSelected : ""
                }`}
                onClick={() => setTopic("medication")}
              >
                <div className={styles.optionHeader}>
                  <div className={styles.optionIcon}>💊</div>
                  <div>
                    <p className={styles.optionTitle}>I need help with medication</p>
                    <p className={styles.optionSubtitle}>
                      Help with renewals, minor issues, or medication questions. Check if a pharmacist can treat your issue.
                    </p>
                  </div>
                </div>
                <div className={styles.optionChevron}>›</div>
              </button>

              <button
                type="button"
                className={`${styles.optionCard} ${
                  topic === "appointment" ? styles.optionSelected : ""
                }`}
                onClick={() => setTopic("appointment")}
              >
                <div className={styles.optionHeader}>
                  <div className={styles.optionIcon}>📅</div>
                  <div>
                    <p className={styles.optionTitle}>I need to book or manage an appointment</p>
                    <p className={styles.optionSubtitle}>
                      Find where to book vaccines, blood tests, and screenings.
                    </p>
                  </div>
                </div>
                <div className={styles.optionChevron}>›</div>
              </button>

              <button
                type="button"
                className={`${styles.optionCard} ${
                  topic === "other" ? styles.optionSelected : ""
                }`}
                onClick={() => setTopic("other")}
              >
                <div className={styles.optionHeader}>
                  <div className={styles.optionIcon}>❓</div>
                  <div>
                    <p className={styles.optionTitle}>Something else</p>
                    <p className={styles.optionSubtitle}>Get general guidance or a safe next step.</p>
                  </div>
                </div>
                <div className={styles.optionChevron}>›</div>
              </button>
            </div>

            <div className={styles.actionsRow}>
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={restart}
              >
                Back
              </button>
              <button
                type="button"
                className={`${styles.primaryButton} ${
                  !canContinueFromTopic ? styles.buttonDisabled : ""
                }`}
                disabled={!canContinueFromTopic}
                onClick={handleContinueFromTopic}
              >
                Continue
              </button>
            </div>
          </section>
        )}

        {step === "questions" && (
          <section className={styles.screen}>
            <div className={styles.sectionCard}>
              <p className={styles.stepLabel}>Step 2 of 3</p>
              <h2 className={styles.sectionTitle}>A few quick questions</h2>
              <p className={styles.sectionHelper}>
                This helps choose a safe care option. No diagnosis is given.
              </p>
            </div>

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

            <div className={styles.safetyBanner}>
              This tool does not diagnose. If you feel unsafe or much worse, go to the emergency room
              or call 911.
            </div>

            <div className={styles.actionsRow}>
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={() => setStep("topic")}
              >
                Back
              </button>
              <button
                type="button"
                className={`${styles.primaryButton} ${
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
          <section className={styles.screen}>
            <div className={styles.sectionCard}>
              <p className={styles.stepLabel}>Step 3 of 3</p>
              <h2 className={styles.sectionTitle}>Suggested care options</h2>
              <p className={styles.sectionHelper}>
                Based on your answers, these options fit your situation. Choose one to see next steps.
              </p>
            </div>

            <div className={styles.optionList}>
              {recommendedOptions.map((id) => {
                const option = careOptions[id];
                return (
                  <button
                    key={id}
                    type="button"
                    className={`${styles.optionCard} ${
                      selectedCareOption === id ? styles.optionSelected : ""
                    }`}
                    onClick={() => {
                      setSelectedCareOption(id);
                      setStep("nextStep");
                    }}
                  >
                    <div className={styles.optionHeader}>
                      <div className={styles.optionIcon}>{option.label}</div>
                      <div>
                        <p className={styles.optionTitle}>Why this option fits</p>
                        <p className={styles.optionSubtitle}>{option.why}</p>
              </div>
              </div>
                    <div className={styles.optionMetaRow}>
                      <div className={styles.metaBadge}>What this option can do</div>
                      {option.cannotDo && (
                        <div className={styles.metaBadge}>What it cannot do</div>
                      )}
                      <div className={styles.metaBadge}>Time expectations</div>
              </div>
                    <p className={styles.optionWhy}>
                      <strong>Can do:</strong> {option.canDo}
                    </p>
                    {option.cannotDo && (
                      <p className={styles.optionWhy}>
                        <strong>Cannot do:</strong> {option.cannotDo}
                      </p>
                    )}
                    <p className={styles.optionWhy}>
                      <strong>Time:</strong> {option.timeExpectation}
                    </p>
                    <p className={styles.optionNextHint}>Tap to see clear next steps</p>
                  </button>
                );
              })}
            </div>

            <div className={styles.safetyBanner}>
              If symptoms suddenly get worse, if you feel very unwell, or feel unsafe at home, go to the
              emergency room or call 911.
            </div>

            <div className={styles.actionsRow}>
              <button
                type="button"
                className={styles.secondaryButton}
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
              <h2 className={styles.sectionTitle}>We&apos;ll help you with other requests.</h2>
              <p className={styles.sectionHelper}>
                For now, if you&apos;re not sure which option fits, you can call Info-Santé 811 for nurse
                advice or contact your local CLSC for general support.
              </p>
            </div>

            <div className={styles.actionsRow}>
              <button
                type="button"
                className={styles.secondaryButton}
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
                    You can also call Info-Santé&nbsp;811 for nurse advice about where to go.
                  </p>
              </div>
              );
            })()}

            <div className={styles.safetyBanner}>
              If your condition suddenly worsens or you are very worried about your safety, go to the
              emergency room or call 911.
            </div>

            <div className={styles.actionsColumn}>
              <button
                type="button"
                className={styles.primaryButton}
                onClick={restart}
              >
                Restart
              </button>
            </div>
          </section>
        )}
      </main>

      <button type="button" className={styles.emergencyBar}>
        🚨 Life-threatening emergency? Call 911 or go to the nearest emergency room.
      </button>
    </div>
  );
}



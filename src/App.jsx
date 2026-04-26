import React, { useMemo, useState } from "react";

const styles = {
  page: { minHeight: "100vh", background: "#f8fafc", padding: "clamp(10px, 3vw, 24px)", fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif", color: "#0f172a" },
  container: { maxWidth: 1280, margin: "0 auto" },
  header: { display: "flex", justifyContent: "space-between", gap: 16, alignItems: "flex-end", flexWrap: "wrap", marginBottom: 20 },
  title: { margin: 0, fontSize: "clamp(24px, 6vw, 32px)", fontWeight: 800, letterSpacing: -0.5 },
  subtitle: { margin: "6px 0 0", color: "#475569" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 420px), 1fr))", gap: "clamp(14px, 3vw, 24px)", alignItems: "start" },
  card: { background: "white", border: "1px solid #e2e8f0", borderRadius: 18, padding: "clamp(14px, 3vw, 20px)", boxShadow: "0 1px 3px rgba(15,23,42,0.08)", marginBottom: 16, overflow: "hidden" },
  cardTitle: { margin: "0 0 14px", fontSize: 20, fontWeight: 750 },
  miniCards: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 150px), 1fr))", gap: 10, width: "min(100%, 420px)" },
  miniCard: { background: "white", border: "1px solid #e2e8f0", borderRadius: 16, padding: "12px 14px", boxShadow: "0 1px 3px rgba(15,23,42,0.08)" },
  miniLabel: { fontSize: 12, color: "#64748b" },
  miniValue: { fontSize: 22, fontWeight: 800, marginTop: 2 },
  formGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 240px), 1fr))", gap: 12 },
  checkGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 230px), 1fr))", gap: 10 },
  label: { display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 5 },
  input: { width: "100%", boxSizing: "border-box", border: "1px solid #cbd5e1", borderRadius: 12, padding: "11px 12px", fontSize: 16, background: "white" },
  textarea: { width: "100%", boxSizing: "border-box", border: "1px solid #cbd5e1", borderRadius: 12, padding: 12, fontSize: 15, background: "white", resize: "vertical", maxWidth: "100%" },
  checkboxRow: { display: "flex", alignItems: "center", gap: 9, border: "1px solid #e2e8f0", borderRadius: 12, padding: 10, background: "white", minHeight: 44, WebkitTapHighlightColor: "transparent" },
  checkboxLabel: { fontSize: 14, lineHeight: 1.25, cursor: "pointer" },
  button: { border: 0, borderRadius: 12, padding: "12px 16px", fontWeight: 750, cursor: "pointer", background: "#0f172a", color: "white", minHeight: 44 },
  riskBadge: { fontSize: 34, fontWeight: 900, margin: "8px 0" },
  infoBox: { background: "#f1f5f9", borderRadius: 12, padding: 12, fontSize: 14, marginTop: 10 },
  warningBox: { background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 12, padding: 12, fontSize: 14, marginTop: 10, color: "#9a3412" },
  small: { fontSize: 13, color: "#475569", lineHeight: 1.45 },
};

const defaultData = {
  mdcRecente: false,
  electiveHydration: "sf",
  guideline: "ESUR",
  urgentHydration: "sf",
  nome: "",
  cognome: "",
  sesso: "",
  eta: "",
  peso: "",
  creatinina: "",
  creatininaData: "",
  creatininaBasale: "",
  esame: "TC con mezzo di contrasto iodato",
  motivo: "",
  urgenza: "elezione",
  viaMdc: "ev",
  volumeMdc: "",
  pazienteNoto: false,
  diabete: false,
  ipertensione: false,
  scompenso: false,
  cardiopatia: false,
  ckdNota: false,
  aki: false,
  trapiantoRene: false,
  disidratazione: false,
  ipotensione: false,
  albuminuria: false,
  anemia: false,
  iabp: false,
  acs: false,
  mieloma: false,
  ipercalcemia: false,
  dialisi: false,
  residuoDiuresi: true,
  metformina: false,
  aceArb: false,
  diuretici: false,
  fans: false,
  sglt2: false,
  aminoglicosidi: false,
  amphotericina: false,
  platini: false,
  methotrexate: false,
  zoledronato: false,
  strategiaAvanzataDiuresi: false,
  noteAnamnesi: "",
  noteTerapia: "",
};

function isGadoliniumScenario(data) {
  return data.guideline === "ESUR" && data.viaMdc === "gbca_rm";
}

function shouldShowAdvancedDiuresis(data) {
  return data.guideline === "KDIGO" && data.urgenza === "urgenza" && data.viaMdc === "ia_primo" && !data.dialisi;
}

function toNumber(value) {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(String(value).replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

function ckdepi2021(creatininaMgDl, eta, sesso) {
  const scr = toNumber(creatininaMgDl);
  const age = toNumber(eta);
  if (scr === null || age === null || scr <= 0 || age <= 0 || !sesso) return null;
  const isFemale = sesso === "F";
  const k = isFemale ? 0.7 : 0.9;
  const alpha = isFemale ? -0.241 : -0.302;
  const femaleFactor = isFemale ? 1.012 : 1;
  return 142 * Math.pow(Math.min(scr / k, 1), alpha) * Math.pow(Math.max(scr / k, 1), -1.2) * Math.pow(0.9938, age) * femaleFactor;
}

function egfrCategory(egfr) {
  if (egfr == null) return "ND";
  if (egfr >= 60) return "G1-G2 / non ridotto";
  if (egfr >= 45) return "G3a";
  if (egfr >= 30) return "G3b";
  if (egfr >= 15) return "G4";
  return "G5";
}

function creatinineAgeDays(dateString, now = new Date()) {
  if (!dateString) return null;
  const date = new Date(`${dateString}T00:00:00`);
  if (Number.isNaN(date.getTime())) return null;
  return Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
}

function creatinineValidity(data) {
  if (isGadoliniumScenario(data)) {
    if (data.dialisi) {
      return { valid: true, maxDays: null, message: "Dialisi cronica: la datazione della creatinina/eGFR non modifica la gestione del GBCA; decisione basata su dialisi e tipo di mezzo di contrasto." };
    }
    if (data.urgenza === "urgenza") {
      return { valid: true, maxDays: null, message: "Urgenza: non ritardare RM clinicamente necessaria; usare comunque il dato di funzione renale più recente disponibile." };
    }
    const egfr = ckdepi2021(data.creatinina, data.eta, data.sesso);
    const age = creatinineAgeDays(data.creatininaData);
    const maxDays = data.aki || (egfr !== null && egfr < 30) ? 7 : 90;
    if (age === null) {
      return {
        valid: false,
        maxDays,
        message: maxDays === 7
          ? "Per RM con gadolinio in paziente con AKI/eGFR <30 ml/min/1,73 m² è necessario disporre di funzione renale recente, preferibilmente entro 7 giorni."
          : "Per RM con gadolinio è opportuno disporre di eGFR/creatinina documentati e recenti; nei pazienti non a rischio elevato è accettabile un dato stabile entro 3 mesi."
      };
    }
    return age <= maxDays
      ? { valid: true, maxDays, message: `Funzione renale documentata ${age} giorni fa; limite usato ${maxDays} giorni.` }
      : {
          valid: false,
          maxDays,
          message: maxDays === 7
            ? "Necessario ripetere funzione renale entro 7 giorni prima di RM con gadolinio in paziente con AKI/eGFR <30 ml/min/1,73 m²."
            : "Dato di funzione renale non recente per RM con gadolinio; necessario aggiornare creatinina/eGFR se il quadro clinico non è documentatamente stabile."
        };
  }

  if (data.urgenza === "urgenza") {
    return { valid: true, maxDays: null, message: "Urgenza: non ritardare l'esame se clinicamente necessario per attendere una nuova creatinina." };
  }
  const age = creatinineAgeDays(data.creatininaData);
  const unstable = Boolean(data.aki || data.ckdNota || data.scompenso || data.disidratazione || data.ipotensione);
  const maxDays = unstable ? 7 : 90;
  if (age === null) {
    return { valid: false, maxDays, message: `Creatinina non datata: necessario ripetere funzione renale entro ${maxDays} giorni al fine di valutare stabilità del quadro.` };
  }
  return age <= maxDays
    ? { valid: true, maxDays, message: `Creatinina valida per elezione: ${age} giorni fa, limite usato ${maxDays} giorni.` }
    : { valid: false, maxDays, message: `Necessario ripetere funzione renale entro ${maxDays} giorni al fine di valutare stabilità del quadro.` };
}

function esurRisk(data, egfr) {
  const via = data?.viaMdc || "ev";
  if (data?.dialisi) return { level: "DIALISI", label: "Dialisi cronica", highRisk: false, dialysis: true, reason: "Paziente in trattamento emodialitico sostitutivo: CA-AKI/PC-AKI non applicabile nei termini standard." };
  if (egfr == null) return { level: "ND", label: "Non calcolabile", highRisk: false, reason: "Inserire creatinina, età e sesso." };
  if (data?.aki) return { level: "ALTO", label: "Alto", highRisk: true, reason: "AKI in atto o recente." };
  if (via === "ia_primo" && egfr < 45) return { level: "ALTO", label: "Alto", highRisk: true, reason: "eGFR <45 ml/min/1,73 m² con somministrazione intra-arteriosa a primo passaggio renale." };
  if ((via === "ev" || via === "ia_secondo") && egfr < 30) return { level: "ALTO", label: "Alto", highRisk: true, reason: "eGFR <30 ml/min/1,73 m² con somministrazione endovenosa o intra-arteriosa a secondo passaggio renale." };
  if (egfr < 45 || data?.diabete || data?.scompenso || data?.disidratazione || data?.ipotensione || data?.anemia || data?.albuminuria || data?.mieloma) return { level: "INTERMEDIO", label: "Intermedio", highRisk: false, reason: "Riduzione del filtrato e/o fattori clinici predisponenti." };
  return { level: "BASSO", label: "Basso", highRisk: false, reason: "eGFR non critico e assenza di fattori maggiori selezionati." };
}

function esurGadoliniumRisk(data, egfr) {
  if (data?.dialisi) return { level: "ALTO", label: "Alto", highRisk: true, dialysis: true, reason: "Dialisi cronica: rischio NSF/ritenzione da gadolinio da gestire in base al tipo di GBCA." };
  if (egfr == null) return { level: "ND", label: "Non calcolabile", highRisk: false, reason: "Inserire creatinina, età e sesso." };
  if (data?.aki || egfr < 30) return { level: "ALTO", label: "Alto", highRisk: true, reason: "AKI/eGFR <30 ml/min/1,73 m²: rischio aumentato di NSF/ritenzione." };
  return { level: "BASSO", label: "Basso", highRisk: false, reason: "eGFR ≥30 ml/min/1,73 m²: rischio NSF molto basso con GBCA a basso rischio e dose approvata." };
}

function kdigoRisk(data, egfr) {
  if (data?.dialisi) return { level: "DIALISI", label: "Dialisi cronica", highRisk: false, dialysis: true, reason: "Paziente in trattamento emodialitico sostitutivo: CA-AKI/PC-AKI non applicabile nei termini standard." };
  if (egfr == null) return { level: "ND", label: "Non calcolabile", highRisk: false, reason: "Inserire creatinina, età e sesso." };
  if (data?.aki) return { level: "ALTO", label: "Alto", highRisk: true, reason: "AKI o sospetta AKI = rischio elevato e necessità di strategia nefroprotettiva." };
  const riskFactorCount = [data?.diabete, data?.scompenso, data?.ipotensione, data?.disidratazione, data?.albuminuria, data?.anemia, data?.acs, data?.nephrotoxins].filter(Boolean).length;
  if (egfr < 30) return { level: "ALTO", label: "Alto", highRisk: true, reason: "eGFR <30 ml/min/1,73 m²." };
  if (egfr < 45 && riskFactorCount >= 1) return { level: "ALTO", label: "Alto", highRisk: true, reason: "eGFR 30–44 con fattori clinici aggiuntivi." };
  if (egfr < 60 || riskFactorCount >= 2) return { level: "INTERMEDIO", label: "Intermedio", highRisk: false, reason: "CKD/fattori di suscettibilità multipli; considerare bundle nefroprotettivo." };
  return { level: "BASSO", label: "Basso", highRisk: false, reason: "Basso rischio clinico dai dati inseriti." };
}

function getRisk(data, egfr) {
  if (isGadoliniumScenario(data)) return esurGadoliniumRisk(data, egfr);
  return data.guideline === "KDIGO" ? kdigoRisk(data, egfr) : esurRisk(data, egfr);
}

function mehranScore(data, egfr) {
  let score = 0;
  if (data?.ipotensione) score += 5;
  if (data?.iabp) score += 5;
  if (data?.scompenso) score += 5;
  const eta = toNumber(data?.eta);
  if (eta !== null && eta > 75) score += 4;
  if (data?.anemia) score += 3;
  if (data?.diabete) score += 3;
  const volume = toNumber(data?.volumeMdc);
  if (volume !== null && volume > 0) score += Math.floor(volume / 100);
  if (egfr != null) {
    if (egfr < 20) score += 6;
    else if (egfr < 40) score += 4;
    else if (egfr < 60) score += 2;
  }
  if (score >= 16) return { score, classe: "molto alto", rischio: "circa 57%" };
  if (score >= 11) return { score, classe: "alto", rischio: "circa 26%" };
  if (score >= 6) return { score, classe: "moderato", rischio: "circa 14%" };
  return { score, classe: "basso", rischio: "circa 7,5%" };
}

function infusionRate(weight, mlKgHour) {
  const kg = toNumber(weight);
  if (kg === null || kg <= 0) return null;
  return Math.round(kg * mlKgHour);
}

function joinNonEmptyLines(lines) {
  if (!Array.isArray(lines)) return "";
  return lines.filter((line) => typeof line === "string" && line.trim().length > 0).join("\n");
}

function getHydrationText(data, risk) {
  if (isGadoliniumScenario(data)) return "Non indicata profilassi infusionale specifica per RM con gadolinio; gestione centrata su scelta del GBCA, dose minima diagnostica efficace e valutazione eGFR/AKI.";
  const isDialysis = Boolean(data.dialisi);
  const isUrgent = data.urgenza === "urgenza";
  const hasHeartFailure = Boolean(data.scompenso);
  const urgentHydration = data.urgentHydration || "sf";
  const electiveHydration = data.electiveHydration || "sf";
  const allowAdvanced = shouldShowAdvancedDiuresis(data);
  const needsHydration = !isDialysis && (risk.highRisk || data.aki || (risk.level === "INTERMEDIO" && data.guideline === "KDIGO"));
  const rate1 = infusionRate(data.peso, 1);
  const rate05 = infusionRate(data.peso, 0.5);
  const rate3 = infusionRate(data.peso, 3);
  const rateLine = rate1 ? ` Per peso ${data.peso} kg: 1 ml/kg/h ≈ ${rate1} ml/h${rate05 ? `; 0,5 ml/kg/h ≈ ${rate05} ml/h` : ""}${rate3 ? `; 3 ml/kg/h ≈ ${rate3} ml/h` : ""}.` : "";
  const advanced = data.strategiaAvanzataDiuresi && allowAdvanced ? " In setting selezionato cardiologico/interventistico ad alto rischio può essere considerata strategia avanzata di diuresi forzata guidata, con espansione di volume associata a diuretico dell'ansa, esclusivamente sotto stretto monitoraggio clinico-emodinamico, bilancio idrico e disponibilità di correzione tempestiva del volume." : "";
  if (isDialysis) return "Non indicata espansione di volume profilattica; evitare sovraccarico volemico.";
  if (!needsHydration) return `Non indicata profilassi infusionale sistematica; raccomandare adeguata idratazione orale ed evitare disidratazione.${advanced}`;
  const heart = hasHeartFailure ? " In presenza di scompenso cardiaco/rischio congestizio ridurre a circa 0,5 ml/kg/h e monitorare clinica, PA, diuresi e congestione." : "";
  if (isUrgent) {
    if (urgentHydration === "bicarbonato") return `bicarbonato di sodio 1,4% 3 ml/kg/h per 1 ora prima della procedura, quindi 1 ml/kg/h per 6 ore dopo, se compatibile con stato volemico ed equilibrio acido-base.${heart}${rateLine}${advanced}`;
    return `NaCl 0,9% 3 ml/kg in 1 ora prima della procedura, quindi 1 ml/kg/h per 4–6 ore dopo; se non vi è tempo sufficiente, iniziare quanto prima e proseguire dopo l'esame.${heart}${rateLine}${advanced}`;
  }
  if (data.guideline === "KDIGO") return `Espansione di volume: cristalloide isotonico, preferibilmente NaCl 0,9% 1 ml/kg/h per 6–12 ore prima e 6–12 ore dopo la procedura; bicarbonato utilizzabile come alternativa in base al contesto clinico, senza associazione routinaria a N-acetilcisteina.${heart}${rateLine}${advanced}`;
  if (electiveHydration === "bicarbonato") return `Espansione di volume con bicarbonato di sodio 1,4%: 3 ml/kg/h per 1 ora prima della procedura, quindi 1 ml/kg/h per 4–6 ore dopo.${heart}${rateLine}${advanced}`;
  return `Espansione di volume con NaCl 0,9%: 1 ml/kg/h per 3–4 ore prima e 4–6 ore dopo la procedura.${heart}${rateLine}${advanced}`;
}

function getMetforminText(data, egfr) {
  if (isGadoliniumScenario(data)) return data.metformina ? "Metformina: non è richiesta sospensione per la sola somministrazione di GBCA; gestire in base a funzione renale e quadro clinico generale." : "Metformina non segnalata.";
  if (data.dialisi) return data.metformina ? "Metformina: sospendere; paziente in dialisi cronica." : "Non intraprendere terapia con metformina in paziente in dialisi cronica.";
  if (!data.metformina) return "Non intraprendere terapia con metformina fino a rivalutazione della funzione renale dopo la procedura.";
  const lowRisk = egfr != null && egfr > 30 && !data.aki && data.viaMdc !== "ia_primo";
  return lowRisk ? "Metformina: proseguire terapia." : "Metformina: sospendere al momento/prima dell'esame; rivalutare eGFR dopo 48 ore e riprendere solo se funzione renale stabile.";
}

function renalFunctionLine(data, egfr) {
  const egfrText = egfr ? `${egfr.toFixed(1)} ml/min/1,73 m²` : "[non calcolabile]";
  let line = `Creatinina sierica attuale: ${data.creatinina || "[ ]"} mg/dl${data.creatininaBasale ? `; creatinina basale riferita: ${data.creatininaBasale} mg/dl` : ""}. eGFR calcolato con CKD-EPI 2021: ${egfrText} (${egfrCategory(egfr)}).`;
  const att = toNumber(data.creatinina);
  const bas = toNumber(data.creatininaBasale);
  if (att !== null && bas !== null && att >= bas + 0.3) line += " Valore attuale superiore alla creatinina basale riferita, compatibile con possibile peggioramento della funzione renale.";
  return line;
}

function buildGadoliniumConsultation(data, egfr, risk, creatinineStatus) {
  const fullName = `${data.nome || "[Nome]"} ${data.cognome || "[Cognome]"}`.trim();
  const repeatRenalLine = creatinineStatus.valid ? "" : `${creatinineStatus.message}\n`;
  const riskLine = `secondo linee guida ESUR, paziente a rischio ${risk.label.toLowerCase()} di complicanze correlate a gadolinio/NSF`;
  const dialysisText = data.dialisi ? "Essendo il paziente in trattamento emodialitico sostitutivo necessaria seduta dialitica supplementare immediatamente successiva all'esame." : "";
  const highRiskText = !data.dialisi && risk.highRisk
    ? "Valutare metodica alternativa senza gadolinio. Se la RM con contrasto è indispensabile, utilizzare GBCA a basso rischio NSF alla minima dose diagnostica efficace."
    : "Utilizzare GBCA a basso rischio NSF alla minima dose diagnostica efficace.";
  const intervalText = data.mdcRecente
    ? (risk.highRisk || data.dialisi
      ? "- Evitare, se possibile, somministrazioni ripetute ravvicinate di GBCA; nei pazienti con eGFR <30 ml/min/1,73 m² o in dialisi mantenere, se clinicamente possibile, almeno 7 giorni tra due somministrazioni di gadolinio."
      : "- In caso di precedente GBCA recente, rispettare se possibile un intervallo di almeno 4 ore tra somministrazioni in pazienti con eGFR ≥30 ml/min/1,73 m².")
    : "";
  const gbcaRecommendations = joinNonEmptyLines([intervalText, data.dialisi ? `- ${dialysisText}` : ""]);
  return `Paziente ${data.pazienteNoto ? "già noto alla nostra U.O." : "non noto"}, ${fullName}, ${data.sesso ? (data.sesso === "F" ? "sesso femminile" : "sesso maschile") : "sesso [ ]"}, anni ${data.eta || "[ ]"}. Si richiede consulenza nefrologica pre-somministrazione di mezzo di contrasto a base di gadolinio per ${data.esame || "RM con mezzo di contrasto"}, procedura in ${data.urgenza === "urgenza" ? "urgenza" : "elezione"}${data.motivo ? `. Indicazione clinica: ${data.motivo}` : ""}.

${renalFunctionLine(data, egfr)}
${repeatRenalLine}${riskLine}.
${data.dialisi ? "" : highRiskText}
${gbcaRecommendations}

La presente consulenza è redatta sulla base dei dati clinici e laboratoristici disponibili al momento della richiesta. La decisione finale in merito all’esecuzione della procedura e alla gestione peri-procedurale resta a carico del medico prescrittore in relazione al quadro clinico complessivo. Eventuali variazioni acute del quadro clinico o laboratoristico possono modificare la stratificazione del rischio e le raccomandazioni sopra riportate.`;
}

function buildConsultation(data, egfr, risk, mehran, hydrationText, metforminText, drugText, creatinineStatus, anamnesi, terapiaRilevante) {
  if (isGadoliniumScenario(data)) return buildGadoliniumConsultation(data, egfr, risk, creatinineStatus);
  const viaTextMap = { ev: "endovenosa", ia_primo: "intra-arteriosa con esposizione renale al primo passaggio", ia_secondo: "intra-arteriosa con esposizione renale al secondo passaggio" };
  const viaText = viaTextMap[data.viaMdc] || viaTextMap.ev;
  const fullName = `${data.nome || "[Nome]"} ${data.cognome || "[Cognome]"}`.trim();
  const isIACardiac = data.viaMdc === "ia_primo" || data.acs;
  const repeatRenalLine = creatinineStatus.valid ? "" : `${creatinineStatus.message}\n`;
  const patientArticle = data.sesso === "F" ? "la" : "il";
  const riskLine = data.dialisi ? "paziente in trattamento emodialitico sostitutivo; rischio CA-AKI/PC-AKI non applicabile nei termini standard" : `secondo linee guida ${data.guideline}, paziente a rischio ${risk.label.toLowerCase()} di CA-AKI/PC-AKI`;
  const decisionText = data.dialisi
    ? "Paziente in trattamento emodialitico sostitutivo: non indicata espansione di volume profilattica (evitare sovraccarico volemico); utilizzare la minima dose efficace di mezzo di contrasto; non indicata seduta dialitica supplementare esclusivamente per la rimozione del mezzo di contrasto, salvo sovraccarico o indicazioni cliniche specifiche."
    : (risk.highRisk
      ? `Si consiglia di considerare, ove clinicamente appropriato, esame diagnostico alternativo senza mezzo di contrasto iodato. Qualora l'esame non sia differibile e sia ritenuto necessario, informare ${patientArticle} paziente dei rischi e dei benefici, esplicitando la possibilità di peggioramento della funzione renale in entità non prevedibile a priori, anche fino alla necessità di trattamento emodialitico cronico.`
      : "Se l'esame è clinicamente indicato, non emergono controindicazioni nefrologiche assolute dai soli dati inseriti; procedere dopo valutazione clinica del rapporto rischio/beneficio e ottimizzazione dei fattori modificabili.");
  const monitorText = data.dialisi ? "Monitorare stato volemico e pressione arteriosa; programmare eventuale seduta dialitica secondo indicazione clinica, non esclusivamente per rimozione del mezzo di contrasto in assenza di sovraccarico." : "Monitorare funzione renale, diuresi ed equilibrio elettrolitico/acido-base per 48–72 ore.";
  const mdcRecenteText = data.mdcRecente ? "- Evitare, se possibile, somministrazioni ravvicinate/ripetute di mezzo di contrasto iodato; se l'esame è non differibile, procedere previa rivalutazione del rapporto rischio/beneficio e monitoraggio della funzione renale." : "";
  const aceArbText = data.aceArb ? (data.disidratazione || data.aki || data.ipotensione ? "- ACE-inibitore/sartano: sospendere temporaneamente in relazione a ipovolemia/ipotensione/AKI." : "- ACE-inibitore/sartano: proseguire terapia; valutare eventuale sospensione solo in caso di instabilità emodinamica o peggioramento funzione renale.") : "";
  const sglt2Text = data.sglt2 ? (data.disidratazione || data.aki || data.ipotensione ? "- SGLT2-inibitore: sospendere temporaneamente in relazione a rischio di AKI/chetoacidosi e condizioni acute." : "- SGLT2-inibitore: proseguire terapia; valutare sospensione solo in caso di digiuno prolungato, malattia acuta o rischio metabolico.") : "";
  const diureticText = data.diuretici ? (data.disidratazione || data.aki || data.ipotensione ? "- Diuretici: sospendere temporaneamente/valutare sospensione in relazione a ipovolemia, ipotensione o AKI." : (data.scompenso ? "- Diuretici: non sospendere automaticamente; modulare in base a stato volemico, congestione e quadro emodinamico." : "- Diuretici: non necessaria sospensione routinaria; rivalutare in base a stato volemico e pressione arteriosa.")) : "";
  const standardRecommendations = joinNonEmptyLines([`- ${hydrationText}`, "- Utilizzare la minima dose efficace di mezzo di contrasto iodato; preferire mezzo a bassa osmolarità o iso-osmolare secondo disponibilità e indicazione radiologica.", mdcRecenteText, "- Evitare disidratazione e correggere ipovolemia/ipotensione prima della procedura quando possibile.", `- ${metforminText}`, `- ${drugText}`, aceArbText, sglt2Text, diureticText, `- ${monitorText}`]);
  const dialysisRecommendations = data.dialisi ? `- ${monitorText}` : standardRecommendations;
  return `Paziente ${data.pazienteNoto ? "già noto alla nostra U.O." : "non noto"}, ${fullName}, ${data.sesso ? (data.sesso === "F" ? "sesso femminile" : "sesso maschile") : "sesso [ ]"}, anni ${data.eta || "[ ]"}. Si richiede consulenza nefrologica pre-somministrazione di mezzo di contrasto iodato per ${data.esame || "[esame]"}, procedura in ${data.urgenza === "urgenza" ? "urgenza" : "elezione"}, con somministrazione ${viaText}${data.volumeMdc ? `, volume previsto circa ${data.volumeMdc} ml` : ""}${data.motivo ? `. Indicazione clinica: ${data.motivo}` : ""}.

In anamnesi: ${anamnesi.length ? anamnesi.join(", ") : "non emergono, dai dati forniti, fattori di rischio nefrologico maggiori"}${data.noteAnamnesi ? `. ${data.noteAnamnesi}` : ""}.
In terapia: ${terapiaRilevante.length ? terapiaRilevante.join(", ") : "non segnalati farmaci nefrotossici o farmaci di particolare rilievo ai fini della procedura"}${data.noteTerapia ? `. ${data.noteTerapia}` : ""}.

${renalFunctionLine(data, egfr)}
${repeatRenalLine}${riskLine}.${isIACardiac && !data.dialisi ? ` Mehran score ${mehran.score}, classe ${mehran.classe}, rischio ${mehran.rischio}.` : ""}

${decisionText}
${!data.dialisi ? "Se il rapporto rischio/beneficio è accettato dal paziente si consiglia:" : ""}

${dialysisRecommendations}

La presente consulenza è redatta sulla base dei dati clinici e laboratoristici disponibili al momento della richiesta. La decisione finale in merito all’esecuzione della procedura e alla gestione peri-procedurale resta a carico del medico prescrittore in relazione al quadro clinico complessivo. Eventuali variazioni acute del quadro clinico o laboratoristico possono modificare la stratificazione del rischio e le raccomandazioni sopra riportate.`;
}

function runSelfTests() {
  const male = ckdepi2021(1, 50, "M");
  const female = ckdepi2021(1, 50, "F");
  console.assert(male !== null && male > 80 && male < 100, "CKD-EPI 2021 maschio 50 anni Scr 1 deve essere circa 90");
  console.assert(female !== null && female > 65 && female < 85, "CKD-EPI 2021 femmina 50 anni Scr 1 deve essere circa 77");
  console.assert(ckdepi2021("", 50, "M") === null, "Creatinina vuota deve restituire null");
  console.assert(ckdepi2021("1,0", 50, "M") !== null, "Creatinina con virgola deve essere accettata");
  console.assert(joinNonEmptyLines(["a", "", false, "b"]) === "a\nb", "joinNonEmptyLines deve ignorare valori non stringa e righe vuote");
  console.assert(egfrCategory(29.9) === "G4", "eGFR 29.9 deve essere G4");
  console.assert(esurRisk({ viaMdc: "ia_primo", aki: false }, 44).highRisk === true, "ESUR IA primo passaggio con eGFR <45 alto rischio");
  console.assert(esurRisk({ viaMdc: "ev", aki: false }, 44).highRisk === false, "ESUR EV con eGFR 44 senza AKI non alto rischio");
  console.assert(kdigoRisk({ diabete: true }, 40).highRisk === true, "KDIGO eGFR 30-44 + fattore deve diventare alto rischio");
  console.assert(esurRisk({ dialisi: true, residuoDiuresi: false, aki: true, viaMdc: "ev" }, 5).level === "DIALISI", "Dialisi cronica prevale su AKI/eGFR per iodato");
  console.assert(esurGadoliniumRisk({ dialisi: true }, 5).level === "ALTO", "Dialisi cronica con gadolinio deve essere alto rischio NSF/ritenzione");
  console.assert(esurGadoliniumRisk({ aki: false }, 29).highRisk === true, "Gadolinio con eGFR <30 deve essere alto rischio");
  console.assert(esurGadoliniumRisk({ aki: false }, 45).highRisk === false, "Gadolinio con eGFR >=30 senza AKI non deve essere alto rischio");
  console.assert(getHydrationText({ dialisi: true, residuoDiuresi: false }, { highRisk: true }).includes("Non indicata espansione"), "Dialisi non deve proporre idratazione per iodato");
  console.assert(getHydrationText({ guideline: "ESUR", viaMdc: "gbca_rm" }, { highRisk: true }).includes("gadolinio"), "Gadolinio deve avere gestione GBCA, non idratazione iodato");
  console.assert(getHydrationText({ guideline: "ESUR", urgenza: "urgenza", peso: 70, urgentHydration: "sf" }, { highRisk: true }).includes("NaCl 0,9%"), "Urgenza con scelta SF deve mostrare solo NaCl");
  console.assert(!getHydrationText({ guideline: "ESUR", urgenza: "urgenza", peso: 70, urgentHydration: "sf" }, { highRisk: true }).includes("bicarbonato"), "Urgenza con scelta SF non deve mostrare bicarbonato");
  console.assert(getHydrationText({ guideline: "ESUR", urgenza: "urgenza", peso: 70, urgentHydration: "bicarbonato" }, { highRisk: true }).includes("bicarbonato di sodio 1,4%"), "Urgenza con scelta bicarbonato deve mostrare bicarbonato");
  console.assert(!getHydrationText({ guideline: "ESUR", urgenza: "urgenza", peso: 70, urgentHydration: "bicarbonato" }, { highRisk: true }).includes("NaCl 0,9% 3 ml/kg"), "Urgenza con scelta bicarbonato non deve mostrare lo schema SF rapido");
  console.assert(getHydrationText({ guideline: "ESUR", urgenza: "elezione", peso: 70, electiveHydration: "sf" }, { highRisk: true }).includes("Espansione di volume con NaCl 0,9%"), "ESUR elezione con scelta SF deve mostrare NaCl");
  console.assert(!getHydrationText({ guideline: "ESUR", urgenza: "elezione", peso: 70, electiveHydration: "sf" }, { highRisk: true }).includes("bicarbonato di sodio 1,4%"), "ESUR elezione con scelta SF non deve mostrare bicarbonato");
  console.assert(getHydrationText({ guideline: "ESUR", urgenza: "elezione", peso: 70, electiveHydration: "bicarbonato" }, { highRisk: true }).includes("Espansione di volume con bicarbonato di sodio 1,4%"), "ESUR elezione con scelta bicarbonato deve mostrare bicarbonato");
  console.assert(!getHydrationText({ guideline: "ESUR", urgenza: "elezione", peso: 70, electiveHydration: "bicarbonato" }, { highRisk: true }).includes("Espansione di volume con NaCl 0,9%"), "ESUR elezione con scelta bicarbonato non deve mostrare NaCl");
  console.assert(getHydrationText({ guideline: "KDIGO", urgenza: "elezione", peso: 70 }, { highRisk: true }).includes("6–12"), "KDIGO elezione deve usare schema più lungo");
  console.assert(shouldShowAdvancedDiuresis({ guideline: "KDIGO", urgenza: "urgenza", viaMdc: "ia_primo", dialisi: false }) === true, "Spunta avanzata visibile solo in KDIGO + urgenza + IA primo passaggio");
  console.assert(shouldShowAdvancedDiuresis({ guideline: "ESUR", urgenza: "urgenza", viaMdc: "ia_primo", dialisi: false }) === false, "Spunta avanzata non visibile in ESUR");
  console.assert(shouldShowAdvancedDiuresis({ guideline: "KDIGO", urgenza: "elezione", viaMdc: "ia_primo", dialisi: false }) === false, "Spunta avanzata non visibile in elezione");
  console.assert(getHydrationText({ guideline: "KDIGO", urgenza: "urgenza", viaMdc: "ia_primo", peso: 70, urgentHydration: "sf", strategiaAvanzataDiuresi: true }, { highRisk: true }).includes("diuresi forzata guidata"), "Strategia avanzata deve comparire solo se spuntata e nel contesto giusto");
  console.assert(!getHydrationText({ guideline: "KDIGO", urgenza: "elezione", viaMdc: "ia_primo", peso: 70, strategiaAvanzataDiuresi: true }, { highRisk: true }).includes("diuresi forzata guidata"), "Strategia avanzata non deve comparire fuori contesto");
  console.assert(mehranScore({ ipotensione: true, iabp: true, scompenso: true, eta: 80, anemia: true, diabete: true, volumeMdc: 250 }, 25).score >= 25, "Mehran score deve sommare i fattori");
  console.assert(creatinineValidity({ urgenza: "urgenza" }, { highRisk: true }).valid === true, "Urgenza non deve bloccare per data creatinina");
  const now = new Date();
  const daysAgo = (days) => {
    const d = new Date(now);
    d.setDate(d.getDate() - days);
    return d.toISOString().slice(0, 10);
  };
  console.assert(creatinineValidity({ urgenza: "elezione", creatininaData: daysAgo(80), aki: false, ckdNota: false, scompenso: false, disidratazione: false, ipotensione: false }, { highRisk: false }).valid === true, "Paziente stabile in elezione: creatinina valida entro 90 giorni");
  console.assert(creatinineValidity({ urgenza: "elezione", creatininaData: daysAgo(80), ckdNota: true }, { highRisk: false }).valid === false, "Paziente instabile/CKD: creatinina non valida oltre 7 giorni");
  console.assert(creatinineValidity({ urgenza: "elezione", creatininaData: daysAgo(80), ckdNota: true }, { highRisk: false }).message.includes("Necessario ripetere funzione renale entro 7 giorni"), "Creatinina non recente deve generare frase clinica, non ATTENZIONE");
  console.assert(creatinineValidity({ guideline: "ESUR", viaMdc: "gbca_rm", dialisi: true }).valid === true, "Gadolinio + dialisi non deve generare alert sulla datazione della creatinina");
  console.assert(creatinineValidity({ guideline: "ESUR", viaMdc: "gbca_rm", urgenza: "elezione", creatinina: "3", eta: "70", sesso: "M" }).message.includes("entro 7 giorni"), "Gadolinio con eGFR <30 deve richiedere funzione renale recente entro 7 giorni");
  const gbcaDialysisLinear = buildConsultation({ ...defaultData, guideline: "ESUR", viaMdc: "gbca_rm", dialisi: true, sesso: "M", eta: "70", creatinina: "8" }, 5, esurGadoliniumRisk({ dialisi: true }, 5), { score: 0, classe: "basso", rischio: "circa 7,5%" }, "", "", "", { valid: true, message: "ok" }, [], []);
  console.assert(gbcaDialysisLinear.includes("seduta dialitica supplementare immediatamente successiva all'esame"), "GBCA in dialisi deve indicare seduta dialitica supplementare immediata");
  console.assert((gbcaDialysisLinear.match(/seduta dialitica supplementare/g) || []).length === 1, "La raccomandazione dialitica GBCA non deve essere duplicata");
  console.assert(!gbcaDialysisLinear.includes("In anamnesi"), "Nel ramo gadolinio non devono comparire anamnesi e terapia");
  const femaleHighRisk = buildConsultation({ ...defaultData, sesso: "F", eta: "80", creatinina: "3", viaMdc: "ev" }, 15, { label: "Alto", highRisk: true }, { score: 0, classe: "basso", rischio: "circa 7,5%" }, "Idratazione", "Metformina", "Nefrotossici", { valid: true, message: "ok" }, [], []);
  const maleHighRisk = buildConsultation({ ...defaultData, sesso: "M", eta: "80", creatinina: "3", viaMdc: "ev" }, 15, { label: "Alto", highRisk: true }, { score: 0, classe: "basso", rischio: "circa 7,5%" }, "Idratazione", "Metformina", "Nefrotossici", { valid: true, message: "ok" }, [], []);
  console.assert(femaleHighRisk.includes("informare la paziente"), "Paziente femmina deve usare articolo la");
  console.assert(maleHighRisk.includes("informare il paziente"), "Paziente maschio deve usare articolo il");
  console.assert(femaleHighRisk.includes("si consiglia:"), "La frase deve terminare con si consiglia:");
  console.assert(femaleHighRisk.includes("Monitorare funzione renale, diuresi"), "Monitoraggio deve usare funzione renale e non creatinina/eGFR");
}

if (typeof window !== "undefined" && !window.__mdcIodatoSelfTestsRun) {
  window.__mdcIodatoSelfTestsRun = true;
  runSelfTests();
}

function Field({ label, children, wide }) {
  return <div style={wide ? { gridColumn: "1 / -1" } : undefined}><label style={styles.label}>{label}</label>{children}</div>;
}

function TextInput({ value, onChange, placeholder = "", type = "text" }) {
  return <input style={styles.input} type={type} value={value || ""} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} />;
}

function SelectInput({ value, onChange, options }) {
  return <select style={styles.input} value={value || ""} onChange={(event) => onChange(event.target.value)}>{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select>;
}

function CheckItem({ id, label, checked, onChange }) {
  return <label style={styles.checkboxRow}><input type="checkbox" checked={Boolean(checked)} onChange={(event) => onChange(id, event.target.checked)} /><span style={styles.checkboxLabel}>{label}</span></label>;
}

export default function App() {
  const [data, setData] = useState(defaultData);
  const [copied, setCopied] = useState(false);
  const isGbca = isGadoliniumScenario(data);

  const set = (key, value) => setData((current) => {
    const next = { ...current, [key]: value };
    if (key === "guideline" && value === "KDIGO" && current.viaMdc === "gbca_rm") {
      next.viaMdc = "ev";
      next.esame = "TC con mezzo di contrasto iodato";
    }
    if (key === "viaMdc" && value === "gbca_rm") {
      next.esame = "RM con mezzo di contrasto";
      next.volumeMdc = "";
      next.strategiaAvanzataDiuresi = false;
    }
    if (key === "viaMdc" && value !== "gbca_rm" && current.viaMdc === "gbca_rm") {
      next.esame = "TC con mezzo di contrasto iodato";
    }
    if (key === "dialisi" && value === true) next.aki = false;
    if (key === "aki" && value === true) next.dialisi = false;
    if (key === "viaMdc" && value === "ia_primo") next.acs = true;
    if (key === "urgenza" && value === "urgenza") next.urgentHydration = next.urgentHydration || "sf";
    const future = key === "guideline" || key === "urgenza" || key === "viaMdc" || key === "dialisi" ? next : current;
    if (!shouldShowAdvancedDiuresis(future)) next.strategiaAvanzataDiuresi = false;
    return next;
  });

  const egfr = useMemo(() => ckdepi2021(data.creatinina, data.eta, data.sesso), [data.creatinina, data.eta, data.sesso]);
  const nephrotoxins = isGbca ? [] : [data.fans && "FANS/COX-2 inibitori", data.aminoglicosidi && "aminoglicosidi", data.amphotericina && "amfotericina B", data.platini && "derivati del platino", data.methotrexate && "metotrexate", data.zoledronato && "zoledronato/bisfosfonati nefrotossici"].filter(Boolean);
  const dataForKdigo = useMemo(() => ({ ...data, nephrotoxins: nephrotoxins.length > 0 }), [data, nephrotoxins.length]);
  const displayedRisk = useMemo(() => getRisk(dataForKdigo, egfr), [dataForKdigo, egfr]);
  const mehran = useMemo(() => mehranScore(data, egfr), [data, egfr]);
  const creatinineStatus = useMemo(() => creatinineValidity(data), [data]);
  const hydrationText = useMemo(() => getHydrationText(data, displayedRisk), [data, displayedRisk]);
  const metforminText = useMemo(() => getMetforminText(data, egfr), [data, egfr]);
  const showAdvancedDiuresis = shouldShowAdvancedDiuresis(data);
  const drugText = nephrotoxins.length ? `Sospendere/evitare, se non indispensabili, farmaci potenzialmente nefrotossici: ${nephrotoxins.join(", ")}, orientativamente 24–48 h prima e 48 h dopo nei pazienti con AKI o eGFR <30, compatibilmente con quadro clinico.` : "Evitare comunque FANS e altri nefrotossici non essenziali nel peri-procedurale.";
  const terapiaRilevante = isGbca ? [] : [data.metformina && "metformina", data.aceArb && "ACE-inibitore/sartano", data.sglt2 && "SGLT2-inibitore", data.diuretici && "diuretici", ...nephrotoxins].filter(Boolean);
  const anamnesi = isGbca ? [data.mdcRecente && "somministrazione recente di GBCA/gadolinio", data.dialisi && `trattamento dialitico cronico${data.residuoDiuresi ? " con diuresi residua" : " senza diuresi residua riferita"}`].filter(Boolean) : [data.mdcRecente && "somministrazione recente di mezzo di contrasto iodato (<72h)", data.diabete && "diabete mellito", data.ipertensione && "ipertensione arteriosa", data.scompenso && "scompenso cardiaco", data.cardiopatia && "cardiopatia/vasculopatia", data.ckdNota && "malattia renale cronica nota", data.aki && "AKI in atto o recente", data.trapiantoRene && "trapianto renale", data.disidratazione && "deplezione volemica/disidratazione", data.ipotensione && "ipotensione/shock", data.albuminuria && "albuminuria/proteinuria", data.anemia && "anemia", data.acs && "sindrome coronarica acuta/instabilità emodinamica", data.mieloma && "mieloma multiplo", data.ipercalcemia && "ipercalcemia", data.dialisi && `trattamento dialitico cronico${data.residuoDiuresi ? " con diuresi residua" : " senza diuresi residua riferita"}`].filter(Boolean);
  const consulenza = useMemo(() => buildConsultation(data, egfr, displayedRisk, mehran, hydrationText, metforminText, drugText, creatinineStatus, anamnesi, terapiaRilevante), [data, egfr, displayedRisk, mehran, hydrationText, metforminText, drugText, creatinineStatus, anamnesi, terapiaRilevante]);

  const copy = async () => {
    try {
      if (navigator?.clipboard?.writeText) await navigator.clipboard.writeText(consulenza);
      else throw new Error("Clipboard API non disponibile");
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch (_error) {
      const textArea = document.createElement("textarea");
      textArea.value = consulenza;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    }
  };

  const check = (id, label) => <CheckItem id={id} label={label} checked={data[id]} onChange={set} />;
  const scenarioOptions = data.guideline === "ESUR" ? [{ value: "ev", label: "MDC iodato endovenoso" }, { value: "ia_primo", label: "MDC iodato intra-arterioso: primo passaggio renale/cardiologico" }, { value: "ia_secondo", label: "MDC iodato intra-arterioso: secondo passaggio renale" }, { value: "gbca_rm", label: "RM con gadolinio" }] : [{ value: "ev", label: "MDC iodato endovenoso" }, { value: "ia_primo", label: "MDC iodato intra-arterioso: primo passaggio renale/cardiologico" }, { value: "ia_secondo", label: "MDC iodato intra-arterioso: secondo passaggio renale" }];

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Consulenza pre-MDC</h1>
            <p style={styles.subtitle}>Decision support ospedaliero: ESUR/KDIGO, iodato o gadolinio, CKD-EPI 2021, dialisi e testo copiabile.</p>
          </div>
          <div style={styles.miniCards}>
            <div style={styles.miniCard}><div style={styles.miniLabel}>🧮 eGFR CKD-EPI 2021</div><div style={styles.miniValue}>{egfr ? egfr.toFixed(1) : "—"}</div></div>
            <div style={styles.miniCard}><div style={styles.miniLabel}>⚠️ Rischio</div><div style={styles.miniValue}>{displayedRisk.label}</div></div>
          </div>
        </div>

        <section style={styles.card}>
          <h2 style={styles.cardTitle}>Linea guida e scenario</h2>
          <div style={styles.formGrid}>
            <Field label="Linea guida"><SelectInput value={data.guideline} onChange={(v) => set("guideline", v)} options={[{ value: "ESUR", label: "ESUR" }, { value: "KDIGO", label: "KDIGO" }]} /></Field>
            <Field label="Scenario"><SelectInput value={data.viaMdc} onChange={(v) => set("viaMdc", v)} options={scenarioOptions} /></Field>
          </div>
          <p style={styles.small}>Autocompilazione: se selezioni intra-arterioso a primo passaggio viene attivato il contesto cardiologico/Mehran; se selezioni RM con gadolinio viene usata la logica ESUR GBCA/NSF.</p>
        </section>

        <div style={styles.grid}>
          <div>
            <section style={styles.card}>
              <h2 style={styles.cardTitle}>🩺 Dati procedura e paziente</h2>
              <div style={styles.formGrid}>
                <Field label="Nome"><TextInput value={data.nome} onChange={(v) => set("nome", v)} placeholder="Nome" /></Field>
                <Field label="Cognome"><TextInput value={data.cognome} onChange={(v) => set("cognome", v)} placeholder="Cognome" /></Field>
                <Field label="Sesso"><SelectInput value={data.sesso} onChange={(v) => set("sesso", v)} options={[{ value: "", label: "Seleziona" }, { value: "M", label: "Maschio" }, { value: "F", label: "Femmina" }]} /></Field>
                <Field label="Età"><TextInput type="number" value={data.eta} onChange={(v) => set("eta", v)} placeholder="Età" /></Field>
                <Field label="Peso"><TextInput type="number" value={data.peso} onChange={(v) => set("peso", v)} placeholder="kg, utile per ml/h" /></Field>
                <Field label="Creatinina attuale"><TextInput type="text" value={data.creatinina} onChange={(v) => set("creatinina", v)} placeholder="mg/dl" /></Field>
                <Field label="Data creatinina"><TextInput type="date" value={data.creatininaData} onChange={(v) => set("creatininaData", v)} /></Field>
                <Field label="Creatinina basale, opzionale"><TextInput type="text" value={data.creatininaBasale} onChange={(v) => set("creatininaBasale", v)} placeholder="mg/dl" /></Field>
                <Field label="Urgenza"><SelectInput value={data.urgenza} onChange={(v) => set("urgenza", v)} options={[{ value: "elezione", label: "Elezione" }, { value: "urgenza", label: "Urgenza" }]} /></Field>
                {!isGbca && data.urgenza === "urgenza" ? <><Field label="Schema idratazione urgenza"><SelectInput value={data.urgentHydration} onChange={(v) => set("urgentHydration", v)} options={[{ value: "sf", label: "Soluzione fisiologica NaCl 0,9%" }, { value: "bicarbonato", label: "Bicarbonato di sodio 1,4%" }]} /></Field>{showAdvancedDiuresis ? <div style={{ gridColumn: "1 / -1" }}><label style={styles.label}>Strategia avanzata</label><div style={styles.checkGrid}>{check("strategiaAvanzataDiuresi", "Diuresi forzata guidata (solo in centri esperti)")}</div></div> : null}</> : data.guideline === "ESUR" && !isGbca ? <Field label="Schema idratazione elezione"><SelectInput value={data.electiveHydration} onChange={(v) => set("electiveHydration", v)} options={[{ value: "sf", label: "Soluzione fisiologica NaCl 0,9%" }, { value: "bicarbonato", label: "Bicarbonato di sodio 1,4%" }]} /></Field> : null}
                <Field label="Esame richiesto"><TextInput value={data.esame} onChange={(v) => set("esame", v)} placeholder={isGbca ? "RM con mezzo di contrasto" : "TC con mdc iodato"} /></Field>
                {isGbca ? null : <Field label="Volume MDC previsto"><TextInput type="number" value={data.volumeMdc} onChange={(v) => set("volumeMdc", v)} placeholder="ml, utile per Mehran" /></Field>}
                <Field label="Quesito / indicazione clinica" wide><TextInput value={data.motivo} onChange={(v) => set("motivo", v)} placeholder="Indicazione clinica" /></Field>
              </div>
              <div style={{ marginTop: 12 }}>{check("pazienteNoto", "Paziente già noto")}</div>
            </section>

            {!isGbca ? <section style={styles.card}><h2 style={styles.cardTitle}>Fattori di rischio / anamnesi</h2><div style={styles.checkGrid}>{check("diabete", "Diabete mellito")}{check("ipertensione", "Ipertensione arteriosa")}{check("scompenso", "Scompenso cardiaco")}{check("cardiopatia", "Cardiopatia/vasculopatia")}{check("ckdNota", "CKD nota")}{check("aki", "AKI in atto o recente")}{check("trapiantoRene", "Trapianto renale")}{check("disidratazione", "Disidratazione/deplezione volemica")}{check("ipotensione", "Ipotensione/shock")}{check("albuminuria", "Albuminuria/proteinuria")}{check("anemia", "Anemia")}{check("acs", "ACS/procedura coronarica urgente")}{check("iabp", "Contropulsatore/IABP")}{check("mieloma", "Mieloma multiplo")}{check("ipercalcemia", "Ipercalcemia")}{check("mdcRecente", "MDC iodato recente (<72h)")}</div><div style={{ marginTop: 12 }}><label style={styles.label}>Note anamnestiche libere</label><textarea style={{ ...styles.textarea, minHeight: 80 }} value={data.noteAnamnesi} onChange={(event) => set("noteAnamnesi", event.target.value)} /></div></section> : <section style={styles.card}><h2 style={styles.cardTitle}>Dialisi</h2><div style={styles.checkGrid}>{check("dialisi", "Dialisi cronica")}{check("residuoDiuresi", "Diuresi residua presente")}</div></section>}
            {!isGbca ? <section style={styles.card}><h2 style={styles.cardTitle}>Terapia</h2><div style={styles.checkGrid}>{check("metformina", "Metformina")}{check("aceArb", "ACE-inibitore/sartano")}{check("diuretici", "Diuretici")}{check("fans", "FANS/COX-2")}{check("sglt2", "SGLT2-inibitore")}{check("aminoglicosidi", "Aminoglicosidi")}{check("amphotericina", "Amfotericina B")}{check("platini", "Derivati del platino")}{check("methotrexate", "Metotrexate")}{check("zoledronato", "Zoledronato/bisfosfonati")}</div><div style={{ marginTop: 12 }}><label style={styles.label}>Altra terapia / note</label><textarea style={{ ...styles.textarea, minHeight: 80 }} value={data.noteTerapia} onChange={(event) => set("noteTerapia", event.target.value)} /></div></section> : null}
          </div>

          <aside>
            <section style={{ ...styles.card, borderLeft: "5px solid #64748b" }}>
              <h2 style={styles.cardTitle}>Output rischio</h2>
              <div style={styles.riskBadge}>{displayedRisk.label}</div>
              <p style={styles.small}>{displayedRisk.reason}</p>
              <div style={styles.infoBox}>Linea guida: <b>{data.guideline}</b></div>
              <div style={styles.infoBox}>Categoria eGFR: <b>{egfrCategory(egfr)}</b></div>
              {(data.viaMdc === "ia_primo" || data.acs) && !data.dialisi && !isGbca ? <div style={styles.infoBox}>Mehran score: <b>{mehran.score}</b> — classe {mehran.classe}, rischio {mehran.rischio}</div> : null}
              {!creatinineStatus.valid ? <div style={styles.warningBox}>{creatinineStatus.message}</div> : <div style={styles.infoBox}>{creatinineStatus.message}</div>}
            </section>
            <section style={styles.card}>
              <h2 style={styles.cardTitle}>💧 Raccomandazioni automatiche</h2>
              <p style={styles.small}><b>{isGbca ? "Gestione GBCA:" : "Idratazione:"}</b> {hydrationText}</p>
              {data.strategiaAvanzataDiuresi ? <p style={styles.small}><b>Step avanzato:</b> attivo solo perché selezionato manualmente; da usare in setting esperto/interventistico con monitoraggio stretto.</p> : null}
              {!isGbca ? <p style={styles.small}><b>Metformina:</b> {metforminText}</p> : null}
              {!isGbca ? <p style={styles.small}><b>Nefrotossici:</b> {drugText}</p> : null}
            </section>
            <section style={styles.card}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", marginBottom: 12 }}>
                <h2 style={{ ...styles.cardTitle, margin: 0 }}>📄 Consulenza generata</h2>
                <button style={styles.button} onClick={copy}>{copied ? "Copiata" : "Copia"}</button>
              </div>
              <textarea style={{ ...styles.textarea, minHeight: "min(620px, 65vh)", fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace", fontSize: 13 }} value={consulenza} readOnly />
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}
  sesso: "",
  eta: "",
  peso: "",
  creatinina: "",
  creatininaData: "",
  creatininaBasale: "",
  
  esame: "TC con mezzo di contrasto iodato",
  motivo: "",
  urgenza: "elezione",
  viaMdc: "ev",
  volumeMdc: "",
  pazienteNoto: false,
  diabete: false,
  ipertensione: false,
  scompenso: false,
  cardiopatia: false,
  ckdNota: false,
  aki: false,
  trapiantoRene: false,
  disidratazione: false,
  ipotensione: false,
  albuminuria: false,
  anemia: false,
  iabp: false,
  acs: false,
  mieloma: false,
  ipercalcemia: false,
  dialisi: false,
  residuoDiuresi: true,
  metformina: false,
  aceArb: false,
  diuretici: false,
  fans: false,
  sglt2: false,
  aminoglicosidi: false,
  amphotericina: false,
  platini: false,
  methotrexate: false,
  zoledronato: false,
  strategiaAvanzataDiuresi: false,
  noteAnamnesi: "",
  noteTerapia: "",
};

function shouldShowAdvancedDiuresis(data) {
  return data.guideline === "KDIGO" && data.urgenza === "urgenza" && data.viaMdc === "ia_primo" && !data.dialisi;
}

function toNumber(value) {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(String(value).replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

function ckdepi2021(creatininaMgDl, eta, sesso) {
  const scr = toNumber(creatininaMgDl);
  const age = toNumber(eta);
  if (scr === null || age === null || scr <= 0 || age <= 0 || !sesso) return null;
  const isFemale = sesso === "F";
  const k = isFemale ? 0.7 : 0.9;
  const alpha = isFemale ? -0.241 : -0.302;
  const femaleFactor = isFemale ? 1.012 : 1;
  return 142 * Math.pow(Math.min(scr / k, 1), alpha) * Math.pow(Math.max(scr / k, 1), -1.2) * Math.pow(0.9938, age) * femaleFactor;
}

function egfrCategory(egfr) {
  if (egfr == null) return "ND";
  if (egfr >= 60) return "G1-G2 / non ridotto";
  if (egfr >= 45) return "G3a";
  if (egfr >= 30) return "G3b";
  if (egfr >= 15) return "G4";
  return "G5";
}

function creatinineAgeDays(dateString, now = new Date()) {
  if (!dateString) return null;
  const date = new Date(`${dateString}T00:00:00`);
  if (Number.isNaN(date.getTime())) return null;
  return Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
}

function creatinineValidity(data, risk) {
  if (data.urgenza === "urgenza") {
    return { valid: true, maxDays: null, message: "Urgenza: non ritardare l'esame se clinicamente necessario per attendere una nuova creatinina." };
  }
  const age = creatinineAgeDays(data.creatininaData);
  const unstable = Boolean(data.aki || data.ckdNota || data.scompenso || data.disidratazione || data.ipotensione);
  const maxDays = unstable ? 7 : 90;
  if (age === null) {
    return { valid: false, maxDays, message: `Creatinina non datata: necessario ripetere funzione renale entro ${maxDays} giorni al fine di valutare stabilità del quadro.` };
  }
  return age <= maxDays
    ? { valid: true, maxDays, message: `Creatinina valida per elezione: ${age} giorni fa, limite usato ${maxDays} giorni.` }
    : { valid: false, maxDays, message: `Necessario ripetere funzione renale entro ${maxDays} giorni al fine di valutare stabilità del quadro.` };
}

function esurRisk(data, egfr) {
  const via = data?.viaMdc || "ev";
  if (data?.dialisi) {
    return { level: "DIALISI", label: "Dialisi cronica", highRisk: false, dialysis: true, reason: "Paziente in trattamento emodialitico sostitutivo: CA-AKI/PC-AKI non applicabile nei termini standard." };
  }
  if (egfr == null) return { level: "ND", label: "Non calcolabile", highRisk: false, reason: "Inserire creatinina, età e sesso." };
  if (data?.aki) return { level: "ALTO", label: "Alto", highRisk: true, reason: "AKI in atto o recente." };
  if (via === "ia_primo" && egfr < 45) return { level: "ALTO", label: "Alto", highRisk: true, reason: "eGFR <45 ml/min/1,73 m² con somministrazione intra-arteriosa a primo passaggio renale." };
  if ((via === "ev" || via === "ia_secondo") && egfr < 30) return { level: "ALTO", label: "Alto", highRisk: true, reason: "eGFR <30 ml/min/1,73 m² con somministrazione endovenosa o intra-arteriosa a secondo passaggio renale." };
  if (egfr < 45 || data?.diabete || data?.scompenso || data?.disidratazione || data?.ipotensione || data?.anemia || data?.albuminuria || data?.mieloma) {
    return { level: "INTERMEDIO", label: "Intermedio", highRisk: false, reason: "Riduzione del filtrato e/o fattori clinici predisponenti." };
  }
  return { level: "BASSO", label: "Basso", highRisk: false, reason: "eGFR non critico e assenza di fattori maggiori selezionati." };
}

function kdigoRisk(data, egfr) {
  if (data?.dialisi) {
    return { level: "DIALISI", label: "Dialisi cronica", highRisk: false, dialysis: true, reason: "Paziente in trattamento emodialitico sostitutivo: CA-AKI/PC-AKI non applicabile nei termini standard." };
  }
  if (egfr == null) return { level: "ND", label: "Non calcolabile", highRisk: false, reason: "Inserire creatinina, età e sesso." };
  if (data?.aki) return { level: "ALTO", label: "Alto", highRisk: true, reason: "AKI o sospetta AKI = rischio elevato e necessità di strategia nefroprotettiva." };
  const riskFactorCount = [data?.diabete, data?.scompenso, data?.ipotensione, data?.disidratazione, data?.albuminuria, data?.anemia, data?.acs, data?.nephrotoxins].filter(Boolean).length;
  if (egfr < 30) return { level: "ALTO", label: "Alto", highRisk: true, reason: "eGFR <30 ml/min/1,73 m²." };
  if (egfr < 45 && riskFactorCount >= 1) return { level: "ALTO", label: "Alto", highRisk: true, reason: "eGFR 30–44 con fattori clinici aggiuntivi." };
  if (egfr < 60 || riskFactorCount >= 2) return { level: "INTERMEDIO", label: "Intermedio", highRisk: false, reason: "CKD/fattori di suscettibilità multipli; considerare bundle nefroprotettivo." };
  return { level: "BASSO", label: "Basso", highRisk: false, reason: "Basso rischio clinico dai dati inseriti." };
}

function getRisk(data, egfr) {
  return data.guideline === "KDIGO" ? kdigoRisk(data, egfr) : esurRisk(data, egfr);
}

function mehranScore(data, egfr) {
  let score = 0;
  if (data?.ipotensione) score += 5;
  if (data?.iabp) score += 5;
  if (data?.scompenso) score += 5;
  const eta = toNumber(data?.eta);
  if (eta !== null && eta > 75) score += 4;
  if (data?.anemia) score += 3;
  if (data?.diabete) score += 3;
  const volume = toNumber(data?.volumeMdc);
  if (volume !== null && volume > 0) score += Math.floor(volume / 100);
  if (egfr != null) {
    if (egfr < 20) score += 6;
    else if (egfr < 40) score += 4;
    else if (egfr < 60) score += 2;
  }
  if (score >= 16) return { score, classe: "molto alto", rischio: "circa 57%" };
  if (score >= 11) return { score, classe: "alto", rischio: "circa 26%" };
  if (score >= 6) return { score, classe: "moderato", rischio: "circa 14%" };
  return { score, classe: "basso", rischio: "circa 7,5%" };
}

function infusionRate(weight, mlKgHour) {
  const kg = toNumber(weight);
  if (kg === null || kg <= 0) return null;
  return Math.round(kg * mlKgHour);
}

function getHydrationText(data, risk) {
  const isDialysis = Boolean(data.dialisi);
  const isUrgent = data.urgenza === "urgenza";
  const hasHeartFailure = Boolean(data.scompenso);
  const urgentHydration = data.urgentHydration || "sf";
  const electiveHydration = data.electiveHydration || "sf";
  const allowAdvanced = shouldShowAdvancedDiuresis(data);
  const needsHydration = !isDialysis && (risk.highRisk || data.aki || (risk.level === "INTERMEDIO" && data.guideline === "KDIGO"));
  const rate1 = infusionRate(data.peso, 1);
  const rate05 = infusionRate(data.peso, 0.5);
  const rate3 = infusionRate(data.peso, 3);
  const rateLine = rate1 ? ` Per peso ${data.peso} kg: 1 ml/kg/h ≈ ${rate1} ml/h${rate05 ? `; 0,5 ml/kg/h ≈ ${rate05} ml/h` : ""}${rate3 ? `; 3 ml/kg/h ≈ ${rate3} ml/h` : ""}.` : "";
  const advanced = data.strategiaAvanzataDiuresi && allowAdvanced
    ? " In setting selezionato cardiologico/interventistico ad alto rischio può essere considerata strategia avanzata di diuresi forzata guidata, con espansione di volume associata a diuretico dell'ansa, esclusivamente sotto stretto monitoraggio clinico-emodinamico, bilancio idrico e disponibilità di correzione tempestiva del volume."
    : "";

  if (isDialysis) return "Non indicata espansione di volume profilattica; evitare sovraccarico volemico.";
  if (!needsHydration) return `Non indicata profilassi infusionale sistematica; raccomandare adeguata idratazione orale ed evitare disidratazione.${advanced}`;

  const heart = hasHeartFailure ? " In presenza di scompenso cardiaco/rischio congestizio ridurre a circa 0,5 ml/kg/h e monitorare clinica, PA, diuresi e congestione." : "";

  if (isUrgent) {
    if (urgentHydration === "bicarbonato") {
      return `bicarbonato di sodio 1,4% 3 ml/kg/h per 1 ora prima della procedura, quindi 1 ml/kg/h per 6 ore dopo, se compatibile con stato volemico ed equilibrio acido-base.${heart}${rateLine}${advanced}`;
    }
    return `NaCl 0,9% 3 ml/kg in 1 ora prima della procedura, quindi 1 ml/kg/h per 4–6 ore dopo; se non vi è tempo sufficiente, iniziare quanto prima e proseguire dopo l'esame.${heart}${rateLine}${advanced}`;
  }

  if (data.guideline === "KDIGO") {
    return `Espansione di volume: cristalloide isotonico, preferibilmente NaCl 0,9% 1 ml/kg/h per 6–12 ore prima e 6–12 ore dopo la procedura; bicarbonato utilizzabile come alternativa in base al contesto clinico, senza associazione routinaria a N-acetilcisteina.${heart}${rateLine}${advanced}`;
  }

  if (electiveHydration === "bicarbonato") {
    return `Espansione di volume con bicarbonato di sodio 1,4%: 3 ml/kg/h per 1 ora prima della procedura, quindi 1 ml/kg/h per 4–6 ore dopo.${heart}${rateLine}${advanced}`;
  }

  return `Espansione di volume con NaCl 0,9%: 1 ml/kg/h per 3–4 ore prima e 4–6 ore dopo la procedura.${heart}${rateLine}${advanced}`;
}

function getMetforminText(data, egfr) {
  if (data.dialisi) {
    return data.metformina
      ? "Metformina: sospendere; paziente in dialisi cronica."
      : "Non intraprendere terapia con metformina in paziente in dialisi cronica.";
  }
  if (!data.metformina) return "Non intraprendere terapia con metformina fino a rivalutazione della funzione renale dopo la procedura.";
  const lowRisk = egfr != null && egfr > 30 && !data.aki && data.viaMdc !== "ia_primo";
  return lowRisk
    ? "Metformina: proseguire terapia."
    : "Metformina: sospendere al momento/prima dell'esame; rivalutare eGFR dopo 48 ore e riprendere solo se funzione renale stabile.";
}

function buildConsultation(data, egfr, risk, mehran, hydrationText, metforminText, drugText, creatinineStatus, anamnesi, terapiaRilevante) {
  const viaTextMap = {
    ev: "endovenosa",
    ia_primo: "intra-arteriosa con esposizione renale al primo passaggio",
    ia_secondo: "intra-arteriosa con esposizione renale al secondo passaggio",
  };
  const viaText = viaTextMap[data.viaMdc] || viaTextMap.ev;
  const egfrText = egfr ? `${egfr.toFixed(1)} ml/min/1,73 m²` : "[non calcolabile]";
  const fullName = `${data.nome || "[Nome]"} ${data.cognome || "[Cognome]"}`.trim();
  const isIACardiac = data.viaMdc === "ia_primo" || data.acs;
  const repeatRenalLine = creatinineStatus.valid ? "" : `${creatinineStatus.message}\n`;
  const riskLine = data.dialisi
    ? "paziente in trattamento emodialitico sostitutivo; rischio CA-AKI/PC-AKI non applicabile nei termini standard"
    : `secondo linee guida ${data.guideline}, paziente a rischio ${risk.label.toLowerCase()} di CA-AKI/PC-AKI`;
  const decisionText = data.dialisi
    ? "Paziente in trattamento emodialitico sostitutivo: non indicata espansione di volume profilattica (evitare sovraccarico volemico); utilizzare la minima dose efficace di mezzo di contrasto; non indicata seduta dialitica supplementare esclusivamente per la rimozione del mezzo di contrasto, salvo sovraccarico o indicazioni cliniche specifiche."
    : (risk.highRisk
      ? "Si consiglia di considerare, ove clinicamente appropriato, esame diagnostico alternativo senza mezzo di contrasto iodato. Qualora l'esame non sia differibile e sia ritenuto necessario, informare il/la paziente dei rischi e dei benefici, esplicitando la possibilità di peggioramento della funzione renale in entità non prevedibile a priori, anche fino alla necessità di trattamento emodialitico cronico."
      : "Se l'esame è clinicamente indicato, non emergono controindicazioni nefrologiche assolute dai soli dati inseriti; procedere dopo valutazione clinica del rapporto rischio/beneficio e ottimizzazione dei fattori modificabili.");
  const monitorText = data.dialisi
    ? "Monitorare stato volemico e pressione arteriosa; programmare eventuale seduta dialitica secondo indicazione clinica, non esclusivamente per rimozione del mezzo di contrasto in assenza di sovraccarico."
    : "Monitorare creatinina/eGFR, diuresi ed equilibrio elettrolitico/acido-base per 48–72 ore nei pazienti ad alto rischio, con AKI, eGFR <30, o dopo procedura intra-arteriosa a primo passaggio con eGFR <45.";

  const mdcRecenteText = data.mdcRecente
    ? "- Evitare, se possibile, somministrazioni ravvicinate/ripetute di mezzo di contrasto iodato; se l'esame è non differibile, procedere previa rivalutazione del rapporto rischio/beneficio e monitoraggio della funzione renale."
    : "";
  const aceArbText = data.aceArb
    ? (data.disidratazione || data.aki || data.ipotensione
      ? "- ACE-inibitore/sartano: sospendere temporaneamente in relazione a ipovolemia/ipotensione/AKI."
      : "- ACE-inibitore/sartano: proseguire terapia; valutare eventuale sospensione solo in caso di instabilità emodinamica o peggioramento funzione renale.")
    : "";
  const sglt2Text = data.sglt2
    ? (data.disidratazione || data.aki || data.ipotensione
      ? "- SGLT2-inibitore: sospendere temporaneamente in relazione a rischio di AKI/chetoacidosi e condizioni acute."
      : "- SGLT2-inibitore: proseguire terapia; valutare sospensione solo in caso di digiuno prolungato, malattia acuta o rischio metabolico.")
    : "";

  const standardRecommendations = [
    `- ${hydrationText}`,
    "- Utilizzare la minima dose efficace di mezzo di contrasto iodato; preferire mezzo a bassa osmolarità o iso-osmolare secondo disponibilità e indicazione radiologica.",
    mdcRecenteText,
    "- Evitare disidratazione e correggere ipovolemia/ipotensione prima della procedura quando possibile.",
    `- ${metforminText}`,
    `- ${drugText}`,
    aceArbText,
    sglt2Text,
    `- ${monitorText}`,
  ].filter(Boolean).join("\n");

  const dialysisRecommendations = data.dialisi ? `- ${monitorText}` : standardRecommendations;

  return `Paziente ${data.pazienteNoto ? "già noto alla nostra U.O." : "non noto"}, ${fullName}, ${data.sesso ? (data.sesso === "F" ? "sesso femminile" : "sesso maschile") : "sesso [ ]"}, anni ${data.eta || "[ ]"}. Si richiede consulenza nefrologica pre-somministrazione di mezzo di contrasto iodato per ${data.esame || "[esame]"}, procedura in ${data.urgenza === "urgenza" ? "urgenza" : "elezione"}, con somministrazione ${viaText}${data.volumeMdc ? `, volume previsto circa ${data.volumeMdc} ml` : ""}${data.motivo ? `. Indicazione clinica: ${data.motivo}` : ""}.

In anamnesi: ${anamnesi.length ? anamnesi.join(", ") : "non emergono, dai dati forniti, fattori di rischio nefrologico maggiori"}${data.noteAnamnesi ? `. ${data.noteAnamnesi}` : ""}.
In terapia: ${terapiaRilevante.length ? terapiaRilevante.join(", ") : "non segnalati farmaci nefrotossici o farmaci di particolare rilievo ai fini della procedura"}${data.noteTerapia ? `. ${data.noteTerapia}` : ""}.

Creatinina sierica attuale: ${data.creatinina || "[ ]"} mg/dl${data.creatininaBasale ? `; creatinina basale riferita: ${data.creatininaBasale} mg/dl` : ""}. eGFR calcolato con CKD-EPI 2021: ${egfrText} (${egfrCategory(egfr)}).${(() => {
  const att = toNumber(data.creatinina);
  const bas = toNumber(data.creatininaBasale);
  if (att !== null && bas !== null && att >= bas + 0.3) {
    return " Valore attuale superiore alla creatinina basale riferita, compatibile con possibile peggioramento della funzione renale.";
  }
  return "";
})()}
${repeatRenalLine}
${riskLine}.${isIACardiac && !data.dialisi ? ` Mehran score ${mehran.score}, classe ${mehran.classe}, rischio ${mehran.rischio}.` : ""}

${decisionText}
${!data.dialisi ? "Se il rapporto rischio/beneficio è accettato dal paziente si consiglia di:" : ""}

${dialysisRecommendations}

La presente consulenza è redatta sulla base dei dati clinici e laboratoristici disponibili al momento della richiesta. La decisione finale in merito all’esecuzione della procedura e alla gestione peri-procedurale resta a carico del medico prescrittore in relazione al quadro clinico complessivo. Eventuali variazioni acute del quadro clinico o laboratoristico possono modificare la stratificazione del rischio e le raccomandazioni sopra riportate.`;
}

function runSelfTests() {
  const male = ckdepi2021(1, 50, "M");
  const female = ckdepi2021(1, 50, "F");
  console.assert(male !== null && male > 80 && male < 100, "CKD-EPI 2021 maschio 50 anni Scr 1 deve essere circa 90");
  console.assert(female !== null && female > 65 && female < 85, "CKD-EPI 2021 femmina 50 anni Scr 1 deve essere circa 77");
  console.assert(ckdepi2021("", 50, "M") === null, "Creatinina vuota deve restituire null");
  console.assert(ckdepi2021("1,0", 50, "M") !== null, "Creatinina con virgola deve essere accettata");
  console.assert(egfrCategory(29.9) === "G4", "eGFR 29.9 deve essere G4");
  console.assert(esurRisk({ viaMdc: "ia_primo", aki: false }, 44).highRisk === true, "ESUR IA primo passaggio con eGFR <45 alto rischio");
  console.assert(esurRisk({ viaMdc: "ev", aki: false }, 44).highRisk === false, "ESUR EV con eGFR 44 senza AKI non alto rischio");
  console.assert(kdigoRisk({ diabete: true }, 40).highRisk === true, "KDIGO eGFR 30-44 + fattore deve diventare alto rischio");
  console.assert(esurRisk({ dialisi: true, residuoDiuresi: false, aki: true, viaMdc: "ev" }, 5).level === "DIALISI", "Dialisi cronica prevale su AKI/eGFR");
  console.assert(getHydrationText({ dialisi: true, residuoDiuresi: false }, { highRisk: true }).includes("Non indicata espansione"), "Dialisi non deve proporre idratazione");
  console.assert(getHydrationText({ guideline: "ESUR", urgenza: "urgenza", peso: 70, urgentHydration: "sf" }, { highRisk: true }).includes("NaCl 0,9%"), "Urgenza con scelta SF deve mostrare solo NaCl");
  console.assert(!getHydrationText({ guideline: "ESUR", urgenza: "urgenza", peso: 70, urgentHydration: "sf" }, { highRisk: true }).includes("bicarbonato"), "Urgenza con scelta SF non deve mostrare bicarbonato");
  console.assert(getHydrationText({ guideline: "ESUR", urgenza: "urgenza", peso: 70, urgentHydration: "bicarbonato" }, { highRisk: true }).includes("bicarbonato di sodio 1,4%"), "Urgenza con scelta bicarbonato deve mostrare bicarbonato");
  console.assert(!getHydrationText({ guideline: "ESUR", urgenza: "urgenza", peso: 70, urgentHydration: "bicarbonato" }, { highRisk: true }).includes("NaCl 0,9% 3 ml/kg"), "Urgenza con scelta bicarbonato non deve mostrare lo schema SF rapido");
  console.assert(getHydrationText({ guideline: "ESUR", urgenza: "elezione", peso: 70, electiveHydration: "sf" }, { highRisk: true }).includes("Espansione di volume con NaCl 0,9%"), "ESUR elezione con scelta SF deve mostrare NaCl");
  console.assert(!getHydrationText({ guideline: "ESUR", urgenza: "elezione", peso: 70, electiveHydration: "sf" }, { highRisk: true }).includes("bicarbonato di sodio 1,4%"), "ESUR elezione con scelta SF non deve mostrare bicarbonato");
  console.assert(getHydrationText({ guideline: "ESUR", urgenza: "elezione", peso: 70, electiveHydration: "bicarbonato" }, { highRisk: true }).includes("Espansione di volume con bicarbonato di sodio 1,4%"), "ESUR elezione con scelta bicarbonato deve mostrare bicarbonato");
  console.assert(!getHydrationText({ guideline: "ESUR", urgenza: "elezione", peso: 70, electiveHydration: "bicarbonato" }, { highRisk: true }).includes("Espansione di volume con NaCl 0,9%"), "ESUR elezione con scelta bicarbonato non deve mostrare NaCl");
  console.assert(getHydrationText({ guideline: "KDIGO", urgenza: "elezione", peso: 70 }, { highRisk: true }).includes("6–12"), "KDIGO elezione deve usare schema più lungo");
  console.assert(shouldShowAdvancedDiuresis({ guideline: "KDIGO", urgenza: "urgenza", viaMdc: "ia_primo", dialisi: false }) === true, "Spunta avanzata visibile solo in KDIGO + urgenza + IA primo passaggio");
  console.assert(shouldShowAdvancedDiuresis({ guideline: "ESUR", urgenza: "urgenza", viaMdc: "ia_primo", dialisi: false }) === false, "Spunta avanzata non visibile in ESUR");
  console.assert(shouldShowAdvancedDiuresis({ guideline: "KDIGO", urgenza: "elezione", viaMdc: "ia_primo", dialisi: false }) === false, "Spunta avanzata non visibile in elezione");
  console.assert(getHydrationText({ guideline: "KDIGO", urgenza: "urgenza", viaMdc: "ia_primo", peso: 70, urgentHydration: "sf", strategiaAvanzataDiuresi: true }, { highRisk: true }).includes("diuresi forzata guidata"), "Strategia avanzata deve comparire solo se spuntata e nel contesto giusto");
  console.assert(!getHydrationText({ guideline: "KDIGO", urgenza: "elezione", viaMdc: "ia_primo", peso: 70, strategiaAvanzataDiuresi: true }, { highRisk: true }).includes("diuresi forzata guidata"), "Strategia avanzata non deve comparire fuori contesto");
  console.assert(mehranScore({ ipotensione: true, iabp: true, scompenso: true, eta: 80, anemia: true, diabete: true, volumeMdc: 250 }, 25).score >= 25, "Mehran score deve sommare i fattori");
  console.assert(creatinineValidity({ urgenza: "urgenza" }, { highRisk: true }).valid === true, "Urgenza non deve bloccare per data creatinina");
  const now = new Date();
  const daysAgo = (days) => {
    const d = new Date(now);
    d.setDate(d.getDate() - days);
    return d.toISOString().slice(0, 10);
  };
  console.assert(creatinineValidity({ urgenza: "elezione", creatininaData: daysAgo(80), aki: false, ckdNota: false, scompenso: false, disidratazione: false, ipotensione: false }, { highRisk: false }).valid === true, "Paziente stabile in elezione: creatinina valida entro 90 giorni");
  console.assert(creatinineValidity({ urgenza: "elezione", creatininaData: daysAgo(80), ckdNota: true }, { highRisk: false }).valid === false, "Paziente instabile/CKD: creatinina non valida oltre 7 giorni");
  console.assert(creatinineValidity({ urgenza: "elezione", creatininaData: daysAgo(80), ckdNota: true }, { highRisk: false }).message.includes("Necessario ripetere funzione renale entro 7 giorni"), "Creatinina non recente deve generare frase clinica, non ATTENZIONE");

  const mdcRecenteConsultation = buildConsultation(
    { ...defaultData, mdcRecente: true, sesso: "M", eta: "70", creatinina: "1.2", viaMdc: "ev" },
    65,
    { label: "Basso", highRisk: false, reason: "test" },
    { score: 0, classe: "basso", rischio: "circa 7,5%" },
    "Non indicata profilassi infusionale sistematica; raccomandare adeguata idratazione orale ed evitare disidratazione.",
    "Metformina: test",
    "Nefrotossici: test",
    { valid: true, message: "ok" },
    ["somministrazione recente di mezzo di contrasto iodato (<72h)"],
    []
  );
  console.assert(mdcRecenteConsultation.includes("somministrazioni ravvicinate/ripetute"), "MDC recente deve aggiungere raccomandazione dedicata");
  console.assert(!mdcRecenteConsultation.includes("\n\n- -"), "Le raccomandazioni non devono avere doppio trattino o righe malformate");
}

if (typeof window !== "undefined" && !window.__mdcIodatoSelfTestsRun) {
  window.__mdcIodatoSelfTestsRun = true;
  runSelfTests();
}

function Field({ label, children, wide }) {
  return <div style={wide ? { gridColumn: "1 / -1" } : undefined}><label style={styles.label}>{label}</label>{children}</div>;
}

function TextInput({ value, onChange, placeholder = "", type = "text" }) {
  return <input style={styles.input} type={type} value={value || ""} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} />;
}

function SelectInput({ value, onChange, options }) {
  return <select style={styles.input} value={value || ""} onChange={(event) => onChange(event.target.value)}>{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select>;
}

function CheckItem({ id, label, checked, onChange }) {
  return <label style={styles.checkboxRow}><input type="checkbox" checked={Boolean(checked)} onChange={(event) => onChange(id, event.target.checked)} /><span style={styles.checkboxLabel}>{label}</span></label>;
}

export default function App() {
  const [data, setData] = useState(defaultData);
  const [copied, setCopied] = useState(false);

  const set = (key, value) => setData((current) => {
    const next = { ...current, [key]: value };
    if (key === "dialisi" && value === true) next.aki = false;
    if (key === "aki" && value === true) next.dialisi = false;
    if (key === "viaMdc" && value === "ia_primo") next.acs = true;
    if (key === "urgenza" && value === "urgenza") next.urgentHydration = next.urgentHydration || "sf";
    const future = key === "guideline" || key === "urgenza" || key === "viaMdc" || key === "dialisi" ? next : current;
    if (!shouldShowAdvancedDiuresis(future)) next.strategiaAvanzataDiuresi = false;
    return next;
  });

  const egfr = useMemo(() => ckdepi2021(data.creatinina, data.eta, data.sesso), [data.creatinina, data.eta, data.sesso]);
  const risk = useMemo(() => getRisk(data, egfr), [data, egfr]);
  const mehran = useMemo(() => mehranScore(data, egfr), [data, egfr]);
  const creatinineStatus = useMemo(() => creatinineValidity(data, risk), [data, risk]);

  const nephrotoxins = [
    data.fans && "FANS/COX-2 inibitori",
    data.diuretici && "diuretici",
    data.aminoglicosidi && "aminoglicosidi",
    data.amphotericina && "amfotericina B",
    data.platini && "derivati del platino",
    data.methotrexate && "metotrexate",
    data.zoledronato && "zoledronato/bisfosfonati nefrotossici",
  ].filter(Boolean);

  const dataForKdigo = useMemo(() => ({ ...data, nephrotoxins: nephrotoxins.length > 0 }), [data, nephrotoxins.length]);
  const displayedRisk = useMemo(() => getRisk(dataForKdigo, egfr), [dataForKdigo, egfr]);
  const hydrationText = useMemo(() => getHydrationText(data, displayedRisk), [data, displayedRisk]);
  const metforminText = useMemo(() => getMetforminText(data, egfr), [data, egfr]);
  const showAdvancedDiuresis = shouldShowAdvancedDiuresis(data);
  const drugText = nephrotoxins.length
    ? `Sospendere/evitare, se non indispensabili, farmaci potenzialmente nefrotossici: ${nephrotoxins.join(", ")}, orientativamente 24–48 h prima e 48 h dopo nei pazienti con AKI o eGFR <30, compatibilmente con quadro clinico.`
    : "Evitare comunque FANS e altri nefrotossici non essenziali nel peri-procedurale.";

  const terapiaRilevante = [data.metformina && "metformina", data.aceArb && "ACE-inibitore/sartano", data.sglt2 && "SGLT2-inibitore", ...nephrotoxins].filter(Boolean);
  const anamnesi = [
    data.mdcRecente && "somministrazione recente di mezzo di contrasto iodato (<72h)",
    data.diabete && "diabete mellito",
    data.ipertensione && "ipertensione arteriosa",
    data.scompenso && "scompenso cardiaco",
    data.cardiopatia && "cardiopatia/vasculopatia",
    data.ckdNota && "malattia renale cronica nota",
    data.aki && "AKI in atto o recente",
    data.trapiantoRene && "trapianto renale",
    data.disidratazione && "deplezione volemica/disidratazione",
    data.ipotensione && "ipotensione/shock",
    data.albuminuria && "albuminuria/proteinuria",
    data.anemia && "anemia",
    data.acs && "sindrome coronarica acuta/instabilità emodinamica",
    data.mieloma && "mieloma multiplo",
    data.ipercalcemia && "ipercalcemia",
    data.dialisi && `trattamento dialitico cronico${data.residuoDiuresi ? " con diuresi residua" : " senza diuresi residua riferita"}`,
  ].filter(Boolean);

  const consulenza = useMemo(() => buildConsultation(data, egfr, displayedRisk, mehran, hydrationText, metforminText, drugText, creatinineStatus, anamnesi, terapiaRilevante), [data, egfr, displayedRisk, mehran, hydrationText, metforminText, drugText, creatinineStatus, anamnesi, terapiaRilevante]);

  const copy = async () => {
    try {
      if (navigator?.clipboard?.writeText) await navigator.clipboard.writeText(consulenza);
      else throw new Error("Clipboard API non disponibile");
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch (_error) {
      const textArea = document.createElement("textarea");
      textArea.value = consulenza;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    }
  };

  const check = (id, label) => <CheckItem id={id} label={label} checked={data[id]} onChange={set} />;

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Consulenza pre-MDC iodato</h1>
            <p style={styles.subtitle}>Decision support ospedaliero: ESUR/KDIGO, CKD-EPI 2021, via di somministrazione, dialisi, idratazione e testo copiabile.</p>
          </div>
          <div style={styles.miniCards}>
            <div style={styles.miniCard}><div style={styles.miniLabel}>🧮 eGFR CKD-EPI 2021</div><div style={styles.miniValue}>{egfr ? egfr.toFixed(1) : "—"}</div></div>
            <div style={styles.miniCard}><div style={styles.miniLabel}>⚠️ Rischio</div><div style={styles.miniValue}>{displayedRisk.label}</div></div>
          </div>
        </div>

        <section style={styles.card}>
          <h2 style={styles.cardTitle}>Linea guida e scenario</h2>
          <div style={styles.formGrid}>
            <Field label="Linea guida"><SelectInput value={data.guideline} onChange={(v) => set("guideline", v)} options={[{ value: "ESUR", label: "ESUR" }, { value: "KDIGO", label: "KDIGO" }]} /></Field>
            <Field label="Scenario"><SelectInput value={data.viaMdc} onChange={(v) => set("viaMdc", v)} options={[{ value: "ev", label: "Endovenoso" }, { value: "ia_primo", label: "Intra-arterioso: primo passaggio renale/cardiologico" }, { value: "ia_secondo", label: "Intra-arterioso: secondo passaggio renale" }]} /></Field>
          </div>
          <p style={styles.small}>Autocompilazione: se selezioni intra-arterioso a primo passaggio, viene attivato il contesto cardiologico/Mehran; se selezioni dialisi, AKI viene disattivata; se selezioni AKI, dialisi viene disattivata.</p>
        </section>

        <div style={styles.grid}>
          <div>
            <section style={styles.card}>
              <h2 style={styles.cardTitle}>🩺 Dati procedura e paziente</h2>
              <div style={styles.formGrid}>
                <Field label="Nome"><TextInput value={data.nome} onChange={(v) => set("nome", v)} placeholder="Nome" /></Field>
                <Field label="Cognome"><TextInput value={data.cognome} onChange={(v) => set("cognome", v)} placeholder="Cognome" /></Field>
                <Field label="Sesso"><SelectInput value={data.sesso} onChange={(v) => set("sesso", v)} options={[{ value: "", label: "Seleziona" }, { value: "M", label: "Maschio" }, { value: "F", label: "Femmina" }]} /></Field>
                <Field label="Età"><TextInput type="number" value={data.eta} onChange={(v) => set("eta", v)} placeholder="Età" /></Field>
                <Field label="Peso"><TextInput type="number" value={data.peso} onChange={(v) => set("peso", v)} placeholder="kg, utile per ml/h" /></Field>
                <Field label="Creatinina attuale"><TextInput type="text" value={data.creatinina} onChange={(v) => set("creatinina", v)} placeholder="mg/dl" /></Field>
                <Field label="Data creatinina"><TextInput type="date" value={data.creatininaData} onChange={(v) => set("creatininaData", v)} /></Field>
                <Field label="Creatinina basale, opzionale"><TextInput type="text" value={data.creatininaBasale} onChange={(v) => set("creatininaBasale", v)} placeholder="mg/dl" /></Field>
                
                <Field label="Urgenza"><SelectInput value={data.urgenza} onChange={(v) => set("urgenza", v)} options={[{ value: "elezione", label: "Elezione" }, { value: "urgenza", label: "Urgenza" }]} /></Field>

                {data.urgenza === "urgenza" ? (
                  <>
                    <Field label="Schema idratazione urgenza"><SelectInput value={data.urgentHydration} onChange={(v) => set("urgentHydration", v)} options={[{ value: "sf", label: "Soluzione fisiologica NaCl 0,9%" }, { value: "bicarbonato", label: "Bicarbonato di sodio 1,4%" }]} /></Field>
                    {showAdvancedDiuresis ? (
                      <div style={{ gridColumn: "1 / -1" }}>
                        <label style={styles.label}>Strategia avanzata</label>
                        <div style={styles.checkGrid}>{check("strategiaAvanzataDiuresi", "Diuresi forzata guidata (solo in centri esperti)")}</div>
                      </div>
                    ) : null}
                  </>
                ) : data.guideline === "ESUR" ? (
                  <Field label="Schema idratazione elezione">
                    <SelectInput
                      value={data.electiveHydration}
                      onChange={(v) => set("electiveHydration", v)}
                      options={[
                        { value: "sf", label: "Soluzione fisiologica NaCl 0,9%" },
                        { value: "bicarbonato", label: "Bicarbonato di sodio 1,4%" }
                      ]}
                    />
                  </Field>
                ) : null}

                <Field label="Esame richiesto"><TextInput value={data.esame} onChange={(v) => set("esame", v)} placeholder="TC con mdc iodato" /></Field>
                <Field label="Volume MDC previsto"><TextInput type="number" value={data.volumeMdc} onChange={(v) => set("volumeMdc", v)} placeholder="ml, utile per Mehran" /></Field>
                <Field label="Quesito / indicazione clinica" wide><TextInput value={data.motivo} onChange={(v) => set("motivo", v)} placeholder="Indicazione clinica" /></Field>
              </div>
              <div style={{ marginTop: 12 }}>{check("pazienteNoto", "Paziente già noto")}</div>
            </section>

            <section style={styles.card}>
              <h2 style={styles.cardTitle}>Fattori di rischio / anamnesi</h2>
              <div style={styles.checkGrid}>
                {check("diabete", "Diabete mellito")}
                {check("ipertensione", "Ipertensione arteriosa")}
                {check("scompenso", "Scompenso cardiaco")}
                {check("cardiopatia", "Cardiopatia/vasculopatia")}
                {check("ckdNota", "CKD nota")}
                {check("aki", "AKI in atto o recente")}
                {check("trapiantoRene", "Trapianto renale")}
                {check("disidratazione", "Disidratazione/deplezione volemica")}
                {check("ipotensione", "Ipotensione/shock")}
                {check("albuminuria", "Albuminuria/proteinuria")}
                {check("anemia", "Anemia")}
                {check("acs", "ACS/procedura coronarica urgente")}
                {check("iabp", "Contropulsatore/IABP")}
                {check("mieloma", "Mieloma multiplo")}
                {check("ipercalcemia", "Ipercalcemia")}
                {check("dialisi", "Dialisi cronica")}
                {check("mdcRecente", "MDC iodato recente (<72h)")}
                {check("residuoDiuresi", "Diuresi residua presente")}
              </div>
              <div style={{ marginTop: 12 }}><label style={styles.label}>Note anamnestiche libere</label><textarea style={{ ...styles.textarea, minHeight: 80 }} value={data.noteAnamnesi} onChange={(event) => set("noteAnamnesi", event.target.value)} /></div>
            </section>

            <section style={styles.card}>
              <h2 style={styles.cardTitle}>Terapia</h2>
              <div style={styles.checkGrid}>
                {check("metformina", "Metformina")}
                {check("aceArb", "ACE-inibitore/sartano")}
                {check("diuretici", "Diuretici")}
                {check("fans", "FANS/COX-2")}
                {check("sglt2", "SGLT2-inibitore")}
                {check("aminoglicosidi", "Aminoglicosidi")}
                {check("amphotericina", "Amfotericina B")}
                {check("platini", "Derivati del platino")}
                {check("methotrexate", "Metotrexate")}
                {check("zoledronato", "Zoledronato/bisfosfonati")}
              </div>
              <div style={{ marginTop: 12 }}><label style={styles.label}>Altra terapia / note</label><textarea style={{ ...styles.textarea, minHeight: 80 }} value={data.noteTerapia} onChange={(event) => set("noteTerapia", event.target.value)} /></div>
            </section>
          </div>

          <aside>
            <section style={{ ...styles.card, borderLeft: "5px solid #64748b" }}>
              <h2 style={styles.cardTitle}>Output rischio</h2>
              <div style={styles.riskBadge}>{displayedRisk.label}</div>
              <p style={styles.small}>{displayedRisk.reason}</p>
              <div style={styles.infoBox}>Linea guida: <b>{data.guideline}</b></div>
              <div style={styles.infoBox}>Categoria eGFR: <b>{egfrCategory(egfr)}</b></div>
              {(data.viaMdc === "ia_primo" || data.acs) && !data.dialisi ? <div style={styles.infoBox}>Mehran score: <b>{mehran.score}</b> — classe {mehran.classe}, rischio {mehran.rischio}</div> : null}
              {!creatinineStatus.valid ? <div style={styles.warningBox}>{creatinineStatus.message}</div> : <div style={styles.infoBox}>{creatinineStatus.message}</div>}
            </section>

            <section style={styles.card}>
              <h2 style={styles.cardTitle}>💧 Raccomandazioni automatiche</h2>
              <p style={styles.small}><b>Idratazione:</b> {hydrationText}</p>
              {data.strategiaAvanzataDiuresi ? <p style={styles.small}><b>Step avanzato:</b> attivo solo perché selezionato manualmente; da usare in setting esperto/interventistico con monitoraggio stretto.</p> : null}
              <p style={styles.small}><b>Metformina:</b> {metforminText}</p>
              <p style={styles.small}><b>Nefrotossici:</b> {drugText}</p>
            </section>

            <section style={styles.card}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", marginBottom: 12 }}>
                <h2 style={{ ...styles.cardTitle, margin: 0 }}>📄 Consulenza generata</h2>
                <button style={styles.button} onClick={copy}>{copied ? "Copiata" : "Copia"}</button>
              </div>
              <textarea style={{ ...styles.textarea, minHeight: "min(620px, 65vh)", fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace", fontSize: 13 }} value={consulenza} readOnly />
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}

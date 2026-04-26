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
  reparto: "",
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
  reazioneMdc: false,
  asmaAtopia: false,
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
  noteAnamnesi: "",
  noteTerapia: "",
};

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
  if (data.urgenza === "urgenza") return { valid: true, message: "Urgenza: non ritardare l'esame se clinicamente necessario per attendere una nuova creatinina." };
  const age = creatinineAgeDays(data.creatininaData);
  if (age === null) return { valid: false, message: "Creatinina non datata: per esame in elezione è opportuno disporre di creatinina recente." };
  const maxDays = risk.highRisk || data.diabete || data.ckdNota || data.aki || data.scompenso || data.dialisi ? 7 : 30;
  return age <= maxDays
    ? { valid: true, message: `Creatinina valida per elezione: ${age} giorni fa, limite usato ${maxDays} giorni.` }
    : { valid: false, message: `ATTENZIONE: creatinina non recente per esame in elezione (${age} giorni fa; limite usato ${maxDays} giorni).` };
}

function esurRisk(data, egfr) {
  const via = data?.viaMdc || "ev";
  if (data?.dialisi) {
    return {
      level: "DIALISI",
      label: "Dialisi cronica",
      highRisk: false,
      dialysis: true,
      reason: "Paziente in trattamento emodialitico sostitutivo: CA-AKI/PC-AKI non applicabile nei termini standard.",
    };
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
    return {
      level: "DIALISI",
      label: "Dialisi cronica",
      highRisk: false,
      dialysis: true,
      reason: "Paziente in trattamento emodialitico sostitutivo: CA-AKI/PC-AKI non applicabile nei termini standard.",
    };
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
  const needsHydration = !isDialysis && (risk.highRisk || data.aki || (risk.level === "INTERMEDIO" && data.guideline === "KDIGO"));
  const rate1 = infusionRate(data.peso, 1);
  const rate05 = infusionRate(data.peso, 0.5);
  const rate3 = infusionRate(data.peso, 3);
  const rateLine = rate1 ? ` Per peso ${data.peso} kg: 1 ml/kg/h ≈ ${rate1} ml/h${rate05 ? `; 0,5 ml/kg/h ≈ ${rate05} ml/h` : ""}${rate3 ? `; 3 ml/kg/h ≈ ${rate3} ml/h` : ""}.` : "";

  if (isDialysis) {
    return "Non indicata espansione di volume profilattica; evitare sovraccarico volemico.";
  }
  if (!needsHydration) return "Non indicata profilassi infusionale sistematica; raccomandare adeguata idratazione orale ed evitare disidratazione.";

  const heart = hasHeartFailure ? " In presenza di scompenso cardiaco/rischio congestizio ridurre a circa 0,5 ml/kg/h e monitorare clinica, PA, diuresi e congestione." : "";

  if (isUrgent) {
    if (urgentHydration === "bicarbonato") {
      return `bicarbonato di sodio 1,4% 3 ml/kg/h per 1 ora prima della procedura, quindi 1 ml/kg/h per 6 ore dopo, se compatibile con stato volemico ed equilibrio acido-base.${heart}${rateLine}`;
    }
    return `NaCl 0,9% 3 ml/kg in 1 ora prima della procedura, quindi 1 ml/kg/h per 4–6 ore dopo; se non vi è tempo sufficiente, iniziare quanto prima e proseguire dopo l'esame.${heart}${rateLine}`;
  }

  if (data.guideline === "KDIGO") {
    return `Espansione di volume: cristalloide isotonico, preferibilmente NaCl 0,9% 1 ml/kg/h per 6–12 ore prima e 6–12 ore dopo la procedura; bicarbonato utilizzabile come alternativa in base al contesto clinico, senza associazione routinaria a N-acetilcisteina.${heart}${rateLine}`;
  }
  return `Espansione di volume: NaCl 0,9% 1 ml/kg/h per 3–4 ore prima e 4–6 ore dopo la procedura.${heart}${rateLine}`;
}

function getMetforminText(data, egfr) {
  if (data.dialisi) {
    return data.metformina
      ? "Metformina: sospendere; paziente in dialisi cronica."
      : "Non intraprendere terapia con metformina in paziente in dialisi cronica.";
  }

  if (!data.metformina) {
    return "Non intraprendere terapia con metformina fino a rivalutazione della funzione renale dopo la procedura.";
  }

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
  const warningLine = creatinineStatus.valid ? "" : `${creatinineStatus.message}\n`;
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

  const dialysisRecommendations = data.dialisi
    ? `- ${monitorText}`
    : `- ${hydrationText}
- Utilizzare la minima dose efficace di mezzo di contrasto iodato; preferire mezzo a bassa osmolarità o iso-osmolare secondo disponibilità e indicazione radiologica.
- Evitare disidratazione e correggere ipovolemia/ipotensione prima della procedura quando possibile.
- ${metforminText}
- ${drugText}
${data.aceArb ? (data.disidratazione || data.aki || data.ipotensione ? "- ACE-inibitore/sartano: sospendere temporaneamente in relazione a ipovolemia/ipotensione/AKI." : "- ACE-inibitore/sartano: proseguire terapia; valutare eventuale sospensione solo in caso di instabilità emodinamica o peggioramento funzione renale.") : ""}
${data.sglt2 ? (data.disidratazione || data.aki || data.ipotensione ? "- SGLT2-inibitore: sospendere temporaneamente in relazione a rischio di AKI/chetoacidosi e condizioni acute." : "- SGLT2-inibitore: proseguire terapia; valutare sospensione solo in caso di digiuno prolungato, malattia acuta o rischio metabolico.") : ""}
- ${monitorText}`;

  return `Paziente ${data.pazienteNoto ? "già noto alla nostra U.O." : "non noto"}, ${fullName}, ${data.sesso ? (data.sesso === "F" ? "sesso femminile" : "sesso maschile") : "sesso [ ]"}, anni ${data.eta || "[ ]"}. Si richiede consulenza nefrologica pre-somministrazione di mezzo di contrasto iodato per ${data.esame || "[esame]"}, procedura in ${data.urgenza === "urgenza" ? "urgenza" : "elezione"}, con somministrazione ${viaText}${data.volumeMdc ? `, volume previsto circa ${data.volumeMdc} ml` : ""}${data.motivo ? `. Indicazione clinica: ${data.motivo}` : ""}.

In anamnesi: ${anamnesi.length ? anamnesi.join(", ") : "non emergono, dai dati forniti, fattori di rischio nefrologico maggiori"}${data.noteAnamnesi ? `. ${data.noteAnamnesi}` : ""}.
In terapia: ${terapiaRilevante.length ? terapiaRilevante.join(", ") : "non segnalati farmaci nefrotossici o farmaci di particolare rilievo ai fini della procedura"}${data.noteTerapia ? `. ${data.noteTerapia}` : ""}.

${warningLine}Creatinina sierica attuale: ${data.creatinina || "[ ]"} mg/dl${data.creatininaBasale ? `; creatinina basale riferita: ${data.creatininaBasale} mg/dl` : ""}. eGFR calcolato con CKD-EPI 2021: ${egfrText} (${egfrCategory(egfr)}).

Stratificazione: ${riskLine}.${isIACardiac && !data.dialisi ? ` Calcolatore aggiuntivo per procedure coronariche/intra-arteriose: Mehran score stimato ${mehran.score}, classe ${mehran.classe}, rischio atteso ${mehran.rischio}.` : ""}

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
  console.assert(getHydrationText({ guideline: "KDIGO", urgenza: "elezione", peso: 70 }, { highRisk: true }).includes("6–12"), "KDIGO elezione deve usare schema più lungo");
  console.assert(mehranScore({ ipotensione: true, iabp: true, scompenso: true, eta: 80, anemia: true, diabete: true, volumeMdc: 250 }, 25).score >= 25, "Mehran score deve sommare i fattori");
  console.assert(creatinineValidity({ urgenza: "urgenza" }, { highRisk: true }).valid === true, "Urgenza non deve bloccare per data creatinina");

  const testConsultation = buildConsultation(
    { ...defaultData, guideline: "ESUR", sesso: "M", eta: "70", creatinina: "2.1", viaMdc: "ev" },
    28,
    { label: "Alto", highRisk: true, reason: "eGFR <30" },
    { score: 0, classe: "basso", rischio: "circa 7,5%" },
    "Espansione di volume: test",
    "Metformina: test",
    "Nefrotossici: test",
    { valid: true, message: "ok" },
    [],
    []
  );
  console.assert(testConsultation.includes("secondo linee guida ESUR, paziente a rischio alto di CA-AKI/PC-AKI"), "La stratificazione deve usare la frase breve richiesta");
  console.assert(!testConsultation.includes("Criterio principale"), "Il testo finale non deve contenere Criterio principale");

  const dialysisConsultation = buildConsultation(
    { ...defaultData, dialisi: true, residuoDiuresi: true, sesso: "M", eta: "70", creatinina: "8", viaMdc: "ev" },
    5,
    { label: "Dialisi cronica", highRisk: false, reason: "dialisi" },
    { score: 0, classe: "basso", rischio: "circa 7,5%" },
    "Non indicata espansione di volume profilattica; evitare sovraccarico volemico.",
    "Non intraprendere terapia con metformina in paziente in dialisi cronica.",
    "Evitare FANS.",
    { valid: true, message: "ok" },
    ["trattamento dialitico cronico con diuresi residua"],
    []
  );
  console.assert(dialysisConsultation.includes("trattamento emodialitico sostitutivo"), "Dialisi deve usare wording emodialitico sostitutivo");
  console.assert(!dialysisConsultation.includes("Il/la paziente"), "Dialisi non deve usare Il/la paziente");
  console.assert(!dialysisConsultation.includes("Se il rapporto rischio/beneficio"), "Dialisi non deve includere frase rischio/beneficio standard");
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
  const drugText = nephrotoxins.length
    ? `Sospendere/evitare, se non indispensabili, farmaci potenzialmente nefrotossici: ${nephrotoxins.join(", ")}, orientativamente 24–48 h prima e 48 h dopo nei pazienti con AKI o eGFR <30, compatibilmente con quadro clinico.`
    : "Evitare comunque FANS e altri nefrotossici non essenziali nel peri-procedurale.";

  const terapiaRilevante = [data.metformina && "metformina", data.aceArb && "ACE-inibitore/sartano", data.sglt2 && "SGLT2-inibitore", ...nephrotoxins].filter(Boolean);
  const anamnesi = [
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
    data.reazioneMdc && "pregressa reazione moderata/severa a mezzo di contrasto",
    data.asmaAtopia && "asma/atopia in trattamento medico",
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
          <h2 style={styles.cardTitle}>Linea guida e autocompilazione</h2>
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
                <Field label="Reparto richiedente"><TextInput value={data.reparto} onChange={(v) => set("reparto", v)} placeholder="Reparto" /></Field>
                <Field label="Urgenza"><SelectInput value={data.urgenza} onChange={(v) => set("urgenza", v)} options={[{ value: "elezione", label: "Elezione" }, { value: "urgenza", label: "Urgenza" }]} /></Field>
                {data.urgenza === "urgenza" ? <Field label="Schema idratazione urgenza"><SelectInput value={data.urgentHydration} onChange={(v) => set("urgentHydration", v)} options={[{ value: "sf", label: "Soluzione fisiologica NaCl 0,9%" }, { value: "bicarbonato", label: "Bicarbonato di sodio 1,4%" }]} /></Field> : null}
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
                {check("residuoDiuresi", "Diuresi residua presente")}
                {check("reazioneMdc", "Pregressa reazione moderata/severa a MDC")}
                {check("asmaAtopia", "Asma/atopia in trattamento")}
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

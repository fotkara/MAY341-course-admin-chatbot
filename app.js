function parseNumber(value) {
  if (value === null || value === undefined) return NaN;
  const cleaned = String(value).trim().replace(",", ".");
  if (cleaned === "") return NaN;
  return Number(cleaned);
}

function formatNumber(x) {
  if (!Number.isFinite(x)) return "";
  return (Math.round(x * 1000) / 1000).toString().replace(".", ",");
}

function calculateGrade(gamma, a1, a2, b) {
  const A = (a1 + a2) / 2;
  const weighted = 0.6 * gamma + 0.4 * A;
  const T = Math.max(gamma, weighted);
  const TB = T > 3.5 ? T + b : T;
  return { A, weighted, T, TB };
}

function getPolicy() {
  const fallback = {
    lectures: [
      "Τρίτη 14:00–16:00, Αίθουσα 001",
      "Πέμπτη 09:00–11:00, Αίθουσα 001"
    ],
    officeHours: [
      "Τρίτη 12:30–13:30",
      "Πέμπτη 11:30–12:30"
    ],
    examDate: "Τρίτη, 27 Ιανουαρίου 2026",
    email: "fkarakatsani@uoi.gr"
  };

  if (typeof COURSE_POLICY === "undefined") {
    return fallback;
  }

  return {
    lectures: COURSE_POLICY.lectures || fallback.lectures,
    officeHours: COURSE_POLICY.officeHours || fallback.officeHours,
    examDate: COURSE_POLICY.examDate || fallback.examDate,
    email: COURSE_POLICY.email || fallback.email
  };
}

function getQuickAnswers() {
  const policy = getPolicy();

  return {
    grade: `Ο τελικός βαθμός υπολογίζεται σε δύο βήματα.

Πρώτα:
\\[
T = \\max\\{\\Gamma,\\;0.6\\Gamma + 0.4A\\}.
\\]

Έπειτα:
\\[
TB =
\\begin{cases}
T+B, & \\text{αν } T>3.5,\\\\
T, & \\text{αν } T\\le 3.5.
\\end{cases}
\\]

Το B είναι το συνολικό μπόνους από τα κουίζ.`,

    lectures: `Οι διαλέξεις γίνονται:

• ${policy.lectures[0]}
• ${policy.lectures[1]}`,

    office: `Οι ώρες γραφείου είναι:

• ${policy.officeHours[0]}
• ${policy.officeHours[1]}

Αν δεν είστε διαθέσιμοι/ες αυτές τις ώρες, μπορείτε να στείλετε email στη διδάσκουσα (${policy.email}) για να κανονιστεί διαφορετικό ραντεβού.`,

    exam: `Η τελική εξέταση για το ακαδημαϊκό έτος 2025–2026 έχει οριστεί για:

${policy.examDate}

Ο βαθμός της τελικής εξέτασης συμβολίζεται με Γ.`,

    quiz: `Τα κουίζ γίνονται διαδικτυακά στο e-course στα τελευταία 15 λεπτά κάθε διάλεξης.

Οι ερωτήσεις βασίζονται στην ύλη που καλύφθηκε στη συγκεκριμένη διάλεξη. Από τα κουίζ προκύπτει ένα συνολικό μπόνους B.

Το συνολικό μπόνους B προστίθεται στο τέλος μόνο αν πρώτα ισχύει T > 3.5.`,

    midterms: `Θα γίνουν δύο ενδιάμεσα διαγωνίσματα διάρκειας μίας ώρας.

Ο βαθμός A είναι ο μέσος όρος των δύο βαθμών:
\\[
A = \\frac{A_1 + A_2}{2}.
\\]

Συμμετοχή στα διαγωνίσματα έχουν μόνο όσοι/όσες το δηλώσουν στο e-course. Όσοι/όσες δεν γράψουν τουλάχιστον 35% στο πρώτο διαγώνισμα χάνουν αυτόματα το δικαίωμα συμμετοχής στο δεύτερο.`
  };
}

function showQuickAnswer(key) {
  const box = document.getElementById("quickAnswer");
  if (!box) return;

  const answers = getQuickAnswers();
  box.textContent = answers[key] || "Δεν βρέθηκε απάντηση.";

  document.querySelectorAll(".quick").forEach((button) => {
    button.classList.toggle("active", button.dataset.answer === key);
  });

  if (window.MathJax && typeof MathJax.typesetPromise === "function") {
    MathJax.typesetPromise([box]).catch(() => {});
  }
}

function runGradeCalculation() {
  const gammaRaw = document.getElementById("gamma").value;
  const a1Raw = document.getElementById("a1").value;
  const a2Raw = document.getElementById("a2").value;
  const bRaw = document.getElementById("b").value;
  const result = document.getElementById("calcResult");

  if (!gammaRaw.trim() || !a1Raw.trim() || !a2Raw.trim() || !bRaw.trim()) {
    result.textContent = "Παρακαλώ συμπληρώστε και τα τέσσερα πεδία: Γ, A1, A2 και B.";
    return;
  }

  const gamma = parseNumber(gammaRaw);
  const a1 = parseNumber(a1Raw);
  const a2 = parseNumber(a2Raw);
  const b = parseNumber(bRaw);

  const gradeValues = [gamma, a1, a2];
  if (gradeValues.some(v => !Number.isFinite(v) || v < 0 || v > 10)) {
    result.textContent = "Οι βαθμοί Γ, A1 και A2 πρέπει να είναι αριθμοί από 0 έως 10.";
    return;
  }

  if (!Number.isFinite(b) || b < 0) {
    result.textContent = "Το B πρέπει να είναι μη αρνητικός αριθμός, π.χ. 0,5 ή 1.";
    return;
  }

  const { A, weighted, T, TB } = calculateGrade(gamma, a1, a2, b);

  result.innerHTML = `
    <div class="final-grade">
      <span>Τελικός βαθμός TB</span>
      <strong>${formatNumber(TB)}</strong>
    </div>
    <div class="result-lines">
      <div><strong>A = (A1+A2)/2:</strong> ${formatNumber(A)}</div>
      <div><strong>0.6Γ + 0.4A:</strong> ${formatNumber(weighted)}</div>
      <div><strong>T = max{Γ, 0.6Γ+0.4A}:</strong> ${formatNumber(T)}</div>
      <div class="muted">${T > 3.5
        ? `Επειδή T > 3,5, προστέθηκε το συνολικό μπόνους B=${formatNumber(b)}.`
        : `Επειδή T ≤ 3,5, δεν προστέθηκε το μπόνους B από τα κουίζ.`}
      </div>
    </div>
  `;
}

function setupApp() {
  document.addEventListener("click", (event) => {
    const quickButton = event.target.closest(".quick[data-answer]");
    if (quickButton) {
      event.preventDefault();
      showQuickAnswer(quickButton.dataset.answer);
    }
  });

  const calcBtn = document.getElementById("calcBtn");
  if (calcBtn) {
    calcBtn.addEventListener("click", runGradeCalculation);
  }

  const clearBtn = document.getElementById("clearCalcBtn");
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      ["gamma", "a1", "a2", "b"].forEach(id => {
        const field = document.getElementById(id);
        if (field) field.value = "";
      });
      const result = document.getElementById("calcResult");
      if (result) result.textContent = "";
      const gamma = document.getElementById("gamma");
      if (gamma) gamma.focus();
    });
  }

  ["gamma", "a1", "a2", "b"].forEach(id => {
    const field = document.getElementById(id);
    if (!field) return;

    field.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        runGradeCalculation();
      }
    });
  });

  // Αρχική απάντηση, ώστε να φαίνεται αμέσως ότι τα κουμπιά δουλεύουν.
  showQuickAnswer("grade");
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", setupApp);
} else {
  setupApp();
}

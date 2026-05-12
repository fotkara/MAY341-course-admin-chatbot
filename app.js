function normalizeGreek(text) {
  return (text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[ς]/g, "σ")
    .replace(/[;·]/g, "?")
    .trim();
}

function formatNumber(x) {
  if (!Number.isFinite(x)) return "";
  return Math.round(x * 1000) / 1000;
}

function calculateGrade(gamma, a1, a2, b) {
  const A = (a1 + a2) / 2;
  const T = Math.max(gamma, 0.6 * gamma + 0.4 * A);
  const TB = T > 3.5 ? T + b : T;
  return { A, T, TB };
}

function answerQuestion(question) {
  const q = normalizeGreek(question);

  const asksPersonalGrade =
    q.includes("βαθμο μου") ||
    q.includes("βαθμοσ μου") ||
    q.includes("τι πηρα") ||
    q.includes("ποσο πηρα") ||
    q.includes("βαθμο του") ||
    q.includes("βαθμο τησ") ||
    q.includes("βαθμο φοιτητη");

  if (asksPersonalGrade) {
    return `Δεν έχω πρόσβαση σε προσωπικούς βαθμούς φοιτητών και δεν μπορώ να απαντήσω για ατομικές επιδόσεις.

Μπορώ όμως να εξηγήσω πώς υπολογίζεται ο τελικός βαθμός ή να κάνω υποθετικό υπολογισμό, αν μου δώσετε τιμές για Γ, A1, A2 και το συνολικό μπόνους B από τα κουίζ.`;
  }

  if (q.includes("τελικο") || q.includes("βαθμοσ") || q.includes("βαθμολογ") || q.includes("υπολογιζεται") || q.includes("πως βγαινει")) {
    return `Ο τελικός βαθμός υπολογίζεται σε δύο βήματα.

Πρώτα υπολογίζεται:
\\[
T = \\max\\{\\Gamma,\\;0.6\\Gamma + 0.4A\\},
\\]
όπου Γ είναι ο βαθμός της τελικής εξέτασης και A είναι ο μέσος όρος των δύο ενδιάμεσων διαγωνισμάτων.

Έπειτα:
\\[
TB =
\\begin{cases}
T + B, & \\text{αν } T>3.5,\\\\
T, & \\text{αν } T\\le 3.5.
\\end{cases}
\\]

Το B είναι το συνολικό μπόνους από τα κουίζ συμμετοχής στο e-course.`;
  }

  if (q.includes("διαλεξ") || q.includes("μαθημα") || q.includes("ωρα μαθηματοσ") || q.includes("ωρες μαθηματος")) {
    return `Οι διαλέξεις γίνονται:

• ${COURSE_POLICY.lectures[0]}
• ${COURSE_POLICY.lectures[1]}`;
  }

  if (q.includes("ωρεσ γραφειου") || q.includes("ωρα γραφειου") || q.includes("γραφειο") || q.includes("ραντεβου")) {
    return `Οι ώρες γραφείου είναι:

• ${COURSE_POLICY.officeHours[0]}
• ${COURSE_POLICY.officeHours[1]}

Αν δεν είστε διαθέσιμοι/ες αυτές τις ώρες, μπορείτε να στείλετε email στη διδάσκουσα (${COURSE_POLICY.email}) για να κανονιστεί διαφορετικό ραντεβού.`;
  }

  if (q.includes("τελικη εξεταση") || q.includes("εξεταση") || q.includes("ιανουαριου")) {
    return `Η τελική εξέταση για το ακαδημαϊκό έτος 2025–2026 έχει οριστεί για:

${COURSE_POLICY.examDate}

Ο βαθμός της τελικής εξέτασης συμβολίζεται με Γ.`;
  }

  if (q.includes("κουιζ") || q.includes("quiz") || q.includes("συμμετοχ")) {
    return `Τα κουίζ γίνονται διαδικτυακά στο e-course στα τελευταία 15 λεπτά κάθε διάλεξης.

Οι ερωτήσεις βασίζονται στην ύλη που καλύφθηκε στη συγκεκριμένη διάλεξη. Από τα κουίζ προκύπτει ο βαθμός B, ο οποίος εξαρτάται από τον αριθμό των κουίζ που έχουν υποβληθεί και από τους βαθμούς σε αυτά.

Το συνολικό μπόνους B από τα κουίζ προστίθεται στο τέλος μόνο αν πρώτα ισχύει T > 3.5.`;
  }

  if (q.includes("διαγωνισμ") || q.includes("ενδιαμεσ") || q.includes("35") || q.includes("τριαντα πεντε")) {
    return `Θα γίνουν δύο ενδιάμεσα διαγωνίσματα διάρκειας μίας ώρας.

Ο βαθμός A είναι ο μέσος όρος των δύο βαθμών:
\\[
A = \\frac{A_1 + A_2}{2}.
\\]

Συμμετοχή στα διαγωνίσματα έχουν μόνο όσοι/όσες το δηλώσουν στο e-course. Όσοι/όσες δεν γράψουν τουλάχιστον 35% στο πρώτο διαγώνισμα χάνουν αυτόματα το δικαίωμα συμμετοχής στο δεύτερο.`;
  }

  if (q.includes("υλη") || q.includes("περιεχομενο") || q.includes("στοχοσ") || q.includes("τι θα κανουμε")) {
    return `Στόχος του μαθήματος είναι η παρουσίαση και ανάλυση αριθμητικών μεθόδων για:

• τη λύση μη γραμμικών εξισώσεων,
• τη λύση γραμμικών συστημάτων,
• το πρόβλημα της προσέγγισης,
• την αριθμητική ολοκλήρωση.

Στις αρχικές διαλέξεις συζητείται επίσης η αριθμητική πεπερασμένης ακρίβειας και η ευστάθεια αριθμητικών μεθόδων.`;
  }

  if (q.includes("email") || q.includes("επικοινων")) {
    return `Μπορείτε να επικοινωνήσετε με τη διδάσκουσα στο email:

${COURSE_POLICY.email}`;
  }

  return `Μπορώ να απαντήσω σε ερωτήσεις για το μάθημα, τις διαλέξεις, τις ώρες γραφείου, τα κουίζ, τα ενδιάμεσα διαγωνίσματα και τον υπολογισμό του τελικού βαθμού.

Παραδείγματα:
• Πώς βγαίνει ο τελικός βαθμός;
• Τι ισχύει για τα κουίζ;
• Πότε είναι οι ώρες γραφείου;
• Αν έχω Γ=6, A1=7, A2=8 και B=0.5, πόσο βγαίνει υποθετικά ο τελικός βαθμός;`;
}

function appendMessage(text, role) {
  const chat = document.getElementById("chat");
  const div = document.createElement("div");
  div.className = `message ${role}`;
  div.textContent = text;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;

  if (window.MathJax) {
    MathJax.typesetPromise([div]).catch(() => {});
  }
}

function resetChat() {
  const chat = document.getElementById("chat");
  chat.innerHTML = "";
  appendMessage(`Καλώς ήλθατε! Είμαι ο βοηθός του μαθήματος «${COURSE_POLICY.courseTitle}».

Μπορώ να απαντήσω σε οργανωτικές ερωτήσεις και να υπολογίσω υποθετικά τον τελικό βαθμό με βάση τους κανόνες του μαθήματος. Δεν έχω πρόσβαση σε προσωπικούς βαθμούς φοιτητών.`, "assistant");
}

function handleQuestion(question) {
  appendMessage(question, "user");
  const answer = answerQuestion(question);
  appendMessage(answer, "assistant");
}

document.addEventListener("DOMContentLoaded", () => {
  resetChat();

  document.getElementById("chatForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const input = document.getElementById("userInput");
    const text = input.value.trim();
    if (!text) return;
    input.value = "";
    handleQuestion(text);
  });

  document.querySelectorAll(".quick").forEach((btn) => {
    btn.addEventListener("click", () => handleQuestion(btn.dataset.q));
  });

  document.getElementById("clearChatBtn").addEventListener("click", () => {
    resetChat();
    document.getElementById("userInput").focus();
  });

  document.getElementById("clearCalcBtn").addEventListener("click", () => {
    ["gamma", "a1", "a2", "b"].forEach(id => document.getElementById(id).value = "");
    document.getElementById("calcResult").textContent = "";
  });

  document.getElementById("calcBtn").addEventListener("click", () => {
    const gamma = Number(document.getElementById("gamma").value);
    const a1 = Number(document.getElementById("a1").value);
    const a2 = Number(document.getElementById("a2").value);
    const b = Number(document.getElementById("b").value);
    const result = document.getElementById("calcResult");

    const values = [gamma, a1, a2, b];
    if (values.some(v => !Number.isFinite(v) || v < 0 || v > 10)) {
      result.textContent = "Παρακαλώ συμπληρώστε όλους τους βαθμούς/τιμές με αριθμούς από 0 έως 10.";
      return;
    }

    const { A, T, TB } = calculateGrade(gamma, a1, a2, b);
    result.innerHTML = `
      <strong>A:</strong> ${formatNumber(A)}<br>
      <strong>T = max{Γ, 0.6Γ+0.4A}:</strong> ${formatNumber(T)}<br>
      <strong>TB = T + B, αν T>3.5:</strong> ${formatNumber(TB)}<br>
      <span class="muted">Δεν έχει εφαρμοστεί στρογγυλοποίηση ή πλαφόν στο 10.</span>
    `;

    appendMessage(`Υποθετικός υπολογισμός με Γ=${gamma}, A1=${a1}, A2=${a2}, B=${b}`, "user");
    appendMessage(`Ο μέσος όρος των δύο διαγωνισμάτων είναι A=${formatNumber(A)}.

Έπειτα:
T = max{${gamma}, 0.6·${gamma}+0.4·${formatNumber(A)}} = ${formatNumber(T)}.

${T > 3.5
  ? `Επειδή T > 3.5, προστίθεται B. Άρα TB = ${formatNumber(T)} + 0.2·${b} = ${formatNumber(TB)}.`
  : `Επειδή T ≤ 3.5, δεν προστίθεται το μπόνους B από τα κουίζ. Άρα TB = ${formatNumber(TB)}.`
}

Δεν έχει εφαρμοστεί στρογγυλοποίηση ή πλαφόν στο 10.`, "assistant");
  });
});

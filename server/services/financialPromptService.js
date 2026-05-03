// ─────────────────────────────────────────────────────────────────────────────
// financialPromptService.js
// Converts a stored FinancialContext document into a crisp, token-efficient
// system prompt that primes the AI with the user's financial reality.
// ─────────────────────────────────────────────────────────────────────────────

const formatINR = (amount) =>
    `₹${Number(amount).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

const formatPercent = (val) => `${val > 0 ? "+" : ""}${val}%`;

/**
 * Builds the AI system prompt from a FinancialContext document.
 * @param {Object} ctx  - A plain FinancialContext document (from .lean() or toObject())
 * @param {Object} [opts]
 * @param {string} [opts.userName]      - Optional first name to personalise the prompt
 * @param {string} [opts.userQuestion]  - The live question the user just asked (for context injection)
 * @returns {{ systemPrompt: string, contextSummary: string }}
 */
export const buildFinancialPrompt = (ctx, opts = {}) => {
    const { userName = "the user", userQuestion = null } = opts;

    // ── Macro ────────────────────────────────────────────────────────────────
    const { macro = {}, velocity = {} } = ctx;
    const incomeMtd      = macro.incomeMtd      ?? 0;
    const expenseMtd     = macro.expenseMtd     ?? 0;
    const incomeYtd      = macro.incomeYtd      ?? 0;
    const expenseYtd     = macro.expenseYtd     ?? 0;
    const savingsRate    = macro.savingsRateMtd ?? 0;
    const currency       = macro.currency       ?? "INR";

    const netMtd         = incomeMtd - expenseMtd;
    const netYtd         = incomeYtd - expenseYtd;

    const dailyBurnRate      = velocity.dailyBurnRate      ?? 0;
    const projectedEomSpend  = velocity.projectedEomSpend  ?? 0;
    const momDelta           = velocity.momSpendDeltaPercentage ?? 0;

    // ── Top Categories ───────────────────────────────────────────────────────
    const topCatsBlock = (ctx.topCategoriesMtd ?? [])
        .map((c, i) => `  ${i + 1}. ${c.category}: ${formatINR(c.amount)} (${c.percentageOfTotal}% of spend)`)
        .join("\n") || "  No data yet.";

    // ── Top Income Sources ───────────────────────────────────────────────────
    const topSrcBlock = (ctx.topIncomeSourcesMtd ?? [])
        .map((s, i) => `  ${i + 1}. ${s.source}: ${formatINR(s.amount)} (${s.percentageOfTotal}% of income)`)
        .join("\n") || "  No data yet.";

    // ── Largest Transactions ─────────────────────────────────────────────────
    const largestTxBlock = (ctx.largestTransactionsMtd ?? [])
        .map((t) => {
            const d = t.date ? new Date(t.date).toLocaleDateString("en-IN") : "?";
            return `  • ${t.type} | ${t.categoryOrSource} | ${formatINR(t.amount)} on ${d}`;
        })
        .join("\n") || "  No data yet.";

    // ── Anomalies ────────────────────────────────────────────────────────────
    const anomaliesBlock = (ctx.anomalies ?? [])
        .map((a) => `  ⚠ ${a}`)
        .join("\n") || "  None detected.";

    // ── Recurring Subscriptions ──────────────────────────────────────────────
    const recurBlock = (ctx.recurringSubscriptions ?? [])
        .map((r) => `  • ${r.name}: ~${formatINR(r.estimatedMonthlyCost)}/mo`)
        .join("\n") || "  None tracked.";

    // ── Last updated label ───────────────────────────────────────────────────
    const lastCalc = ctx.lastCalculatedAt
        ? new Date(ctx.lastCalculatedAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
        : "Unknown";

    // ────────────────────────────────────────────────────────────────────────
    // SYSTEM PROMPT
    // ────────────────────────────────────────────────────────────────────────
    const systemPrompt = `You are Spendwise AI — a sharp, empathetic personal finance assistant for Indian users.
Your responses must be:
• Concise and actionable (no fluff)
• Friendly but data-driven
• Written in plain English (no code, no markdown tables unless explicitly useful)
• Denominated in ${currency} (use ₹ symbol)

━━━━━━━━━━━━━  USER FINANCIAL SNAPSHOT  ━━━━━━━━━━━━━
[Data as of: ${lastCalc} IST]

▌ THIS MONTH (MTD)
  Income  : ${formatINR(incomeMtd)}
  Expenses: ${formatINR(expenseMtd)}
  Net     : ${formatINR(netMtd)} (${netMtd >= 0 ? "surplus" : "deficit"})
  Savings Rate: ${formatPercent(savingsRate)}

▌ THIS YEAR (YTD)
  Income  : ${formatINR(incomeYtd)}
  Expenses: ${formatINR(expenseYtd)}
  Net     : ${formatINR(netYtd)}

▌ SPEND VELOCITY
  Daily Burn Rate    : ${formatINR(dailyBurnRate)}/day
  Projected EOM Spend: ${formatINR(projectedEomSpend)}
  MoM Spend Delta    : ${formatPercent(momDelta)}

▌ TOP EXPENSE CATEGORIES (MTD)
${topCatsBlock}

▌ TOP INCOME SOURCES (MTD)
${topSrcBlock}

▌ LARGEST TRANSACTIONS (MTD)
${largestTxBlock}

▌ RECURRING SUBSCRIPTIONS
${recurBlock}

▌ PRE-COMPUTED ANOMALIES
${anomaliesBlock}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Respond only about finances. If the user asks something unrelated, politely redirect them.
${userQuestion ? `The user is currently asking: "${userQuestion}"` : ""}`;

    // A short human-readable context summary (useful for logging / debugging)
    const contextSummary = `MTD: Income ${formatINR(incomeMtd)} | Expenses ${formatINR(expenseMtd)} | Net ${formatINR(netMtd)} | Savings ${formatPercent(savingsRate)}`;

    return { systemPrompt, contextSummary };
};

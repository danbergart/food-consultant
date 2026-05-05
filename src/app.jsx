import { useState, useRef } from "react";

const API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY;
const APP_PASSWORD = import.meta.env.VITE_APP_PASSWORD;

const ZOE_KNOWLEDGE = `
# DAN'S PERSONAL ZOE PROFILE (tested Feb-Mar 2024)
- Blood Sugar Control: 29/100 — POOR. Spikes harder and longer than most. Carbs and sugar are especially bad for Dan.
- Blood Fat Control: 65/100 — GOOD. Tolerates healthy fats well.
- PRIORITY: Blood sugar management is Dan's #1 dietary goal.

## SCORING: 75-100 Enjoy freely | 50-74 Enjoy regularly | 25-49 Moderation | 0-24 Once in a while

## TOP FOODS (75-100): Almonds 95 | Almond butter 89 | Artichoke hearts canned 97 | Avocado 91-97 | Black beans 97 | Blackberries wild 97 | Brazil nuts 100 | Brussels sprouts 92 | Butter beans canned 92 | Cashew nuts 85-86 | Catfish 88 | Cauliflower 82 | Cherries 87 | Chicken breast 70 | Chickpeas canned 82 | Chickpeas roasted 89 | Cod 89 | Coffee black 84 | Courgette 83 | Cucumber 85-95 | Eggs 77 | Green beans 98 | Hazelnuts 100 | Hummus 82-90 | Kale 86 | Kerry Kefir 76-78 | Kimchi Daikon 90 | Leon Hummus 85 | Mushrooms 100 | Pistachios Aldi 100

## GOOD FOODS (50-74): Almond milk unsweetened 56 | Apple 71 | Baked beans 58 | Blackberries 79 | Bulgur wheat 59 | Butter 58 | Butternut squash 68 | Cashew butter 69 | Cheese Cheddar 67 | Cheese Emmental 76 | Cheese Mozzarella 70 | Coffee black 84 | Dark chocolate >70% 56 | Eggs 77 | Kimchi 60-75 | Kefir plain 62 | Oat milk unsweetened 50 | Califia Farms Oat Barista 48

## MODERATE (25-49): Banana 41 | Blueberries 46 | Bread sourdough shop 24-29 | Crisps 38 | Dark chocolate 42 | Grapes 43 | Oats 40-48

## POOR (0-24): Apple juice 12 | Bagels 0-5 | White bread 0 | Bacon 4-19 | Couscous 13-17 | Flipz pretzels 4-13 | Nando's Chips 21 | Pizza 24-29

## GUT SUPPRESSORS: Bagels | Cornflakes | Chicken nuggets | Doughnuts

## FERMENTED (great): All Kimchi 60-90 | All Kefir 46-83

## NANDO'S: Chips 21 | Quarter Chicken 46 | Wings 43 | Beanie Wrap 62 | Double Chicken Wrap 54 | Fully Loaded Wrap 56 | Coleslaw 66 | Houmous Set 85 | Chilli Jam 2 | Diet Coke 34 | Coca-Cola 0

## OAT MILKS: Oat milk unsweetened 50 | Califia Farms Oat Barista 48 | Jord Oat Drink 36
`;

const GG_KNOWLEDGE = `
# GLUCOSE GODDESS PRINCIPLES (especially important — Dan's blood sugar is 29/100)
1. Eat in right order: veg/fibre first → protein/fat → carbs/sugar last
2. Veggie starter every lunch/dinner
3. Savoury breakfast — no cereal/toast/juice/pastries
4. Vinegar hack: 1 tbsp ACV in water 10-20 mins before meals, reduces spike ~30%
5. Move after eating: 10 min walk within 30 mins
6. Clothe your carbs: never eat carbs alone
7. Sweet things after meals not as standalone snacks
8. Savoury snacks: nuts/cheese/hummus/eggs not fruit bars
KEY PAIRINGS: Rice/pasta → veg+protein first | Fruit → after meals | Oats → add nut butter | Sushi → edamame/miso first
`;

const UPF_KNOWLEDGE = `
# ULTRA PROCESSED FOOD (van Tulleken — Ultra Processed People)
NOVA 4 UPF if contains: lecithin, mono/diglycerides E471, carrageenan, polysorbate 80, xanthan/gellan gum, sucralose, aspartame, acesulfame K, maltodextrin as filler, protein isolates, sodium benzoate, potassium sorbate, hydrogenated oils, "natural flavourings" as only flavour.
UPF TRAPS: Supermarket sourdough | Most oat milks | Protein bars | Most granola | Carton smoothies | Low-fat products | Huel | Plant-based meats | Richmond sausages
NOT UPF: Plain Greek yoghurt | Real cheese | Tinned fish | Tinned beans | Frozen plain veg | Real nut butter | Real sourdough | Dark choc 85%+
`;

const SYSTEM_PROMPT = `You are Dan's personal food consultant — part nutritionist, part stand-up comedian. Warm, funny, opinionated. Not preachy. Call out bad choices with a raised eyebrow, celebrate good ones. Dry wit welcome.

Dan's ZOE results: Blood Sugar 29/100 (POOR - spikes hard), Blood Fat 65/100 (GOOD). Daily protein target: 140g.

${ZOE_KNOWLEDGE}
${GG_KNOWLEDGE}
${UPF_KNOWLEDGE}

RECIPE REQUESTS (when Dan mentions ingredients, asks for recipe ideas, or asks what to make):
Respond with RECIPE format — do NOT use the score card format for these.

RECIPE: true
INTRO: [1 witty sentence acknowledging what Dan has]

OPTION_1_NAME: [recipe name]
OPTION_1_ZOE: [1-10]
OPTION_1_GG: [1-10]
OPTION_1_UPF: [1-10]
OPTION_1_PROTEIN_G: [grams per serving]
OPTION_1_VERDICT: [good/ok/avoid and why in 1 sentence]
OPTION_1_METHOD: [3-5 short steps, each on a new line starting with a number]
OPTION_1_TIP: [one glucose/nutrition tip specific to this recipe]

OPTION_2_NAME: [recipe name]
OPTION_2_ZOE: [1-10]
OPTION_2_GG: [1-10]
OPTION_2_UPF: [1-10]
OPTION_2_PROTEIN_G: [grams per serving]
OPTION_2_VERDICT: [good/ok/avoid and why in 1 sentence]
OPTION_2_METHOD: [3-5 short steps]
OPTION_2_TIP: [one tip]

BEST_PICK: [name of the better option and one sentence why it wins for Dan specifically]

Always suggest the healthiest practical options given the ingredients. If the ingredients are all high sugar (like fruits for dessert), suggest ways to make them work — e.g. pair with Greek yoghurt and nuts to flatten the glucose spike, or make a chia seed pudding base. Never just say everything is bad. Always find a constructive angle.
BROAD: true
CATEGORY: [name]
HEADLINE: [1 sentence]
VARIANTS:
- BEST: [name] | [why]
- OK: [name] | [why]
- AVOID: [name] | [why]
FOLLOWUP: [short question]

CRITICAL FORMAT RULES - follow exactly or the app breaks:
- No markdown. No bold. No asterisks. No headers. No code blocks. No backticks.
- Do not add a title line at the start.
- Each score must be a single integer only - not "9/10", just "9"
- Start your response with ZOE_SCORE: on the very first line, nothing before it.

ZOE_SCORE: [integer 1-10]
GG_SCORE: [integer 1-10]
UPF_SCORE: [integer 1-10]
PROTEIN_G: [integer]
VERDICT: [3-6 words, no punctuation]
DATA_SOURCE: [your personal Zoe data OR general nutritional knowledge]
IDENTIFIED: [what you see in photo, or N/A]
SUMMARY: [2-3 sentences, no bold, no asterisks]
TIPS:
- [tip one]
- [tip two if useful, else omit this line]

Scoring: ZOE=gut/fat (10=great), GG=glucose spike for Dan specifically (strict, 10=no spike), UPF=processing (10=whole food). Tips = food/eating order only.`;

function fileToBase64(file) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result.split(",")[1]);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}

async function askClaude(messages) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 90000);
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": API_KEY, "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true" },
      body: JSON.stringify({ model: "claude-sonnet-4-5", max_tokens: 1500, system: SYSTEM_PROMPT, messages }),
      signal: ctrl.signal
    });
    clearTimeout(t);
    if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e?.error?.message || res.statusText); }
    const d = await res.json();
    return d.content.filter(b => b.type === "text").map(b => b.text).join("\n");
  } catch(e) { clearTimeout(t); throw e; }
}

function parseBroad(text) {
  if (!text.includes("BROAD: true")) return null;
  const category = text.match(/CATEGORY:\s*(.+)/)?.[1]?.trim();
  const headline = text.match(/HEADLINE:\s*(.+)/)?.[1]?.trim();
  const followup = text.match(/FOLLOWUP:\s*(.+)/)?.[1]?.trim();
  const variants = [];
  const bestM = text.match(/- BEST:\s*(.+)/);
  const okM = text.match(/- OK:\s*(.+)/);
  const avoidM = text.match(/- AVOID:\s*(.+)/);
  if (bestM) { const [name, why] = bestM[1].split("|").map(s => s.trim()); variants.push({ type: "best", name, why }); }
  if (okM) { const [name, why] = okM[1].split("|").map(s => s.trim()); variants.push({ type: "ok", name, why }); }
  if (avoidM) { const [name, why] = avoidM[1].split("|").map(s => s.trim()); variants.push({ type: "avoid", name, why }); }
  return { category, headline, followup, variants };
}

function parseReply(text) {
  const z = text.replace(/\*\*/g, "").match(/ZOE_SCORE:\s*(\d+)/)?.[1];
  const g = text.replace(/\*\*/g, "").match(/GG_SCORE:\s*(\d+)/)?.[1];
  const u = text.replace(/\*\*/g, "").match(/UPF_SCORE:\s*(\d+)/)?.[1];
  const clean = text.replace(/\*\*/g, "");
  const verdict = clean.match(/VERDICT:\s*(.+)/)?.[1]?.trim();
  const source = clean.match(/DATA_SOURCE:\s*(.+)/)?.[1]?.trim();
  const identified = clean.match(/IDENTIFIED:\s*(.+)/)?.[1]?.trim();
  const proteinG = parseInt(clean.match(/PROTEIN_G:\s*(\d+)/)?.[1] || "0");
  const summary = clean.match(/SUMMARY:\s*([\s\S]+?)(?=TIPS:|$)/)?.[1]?.trim();
  const tipsBlock = clean.match(/TIPS:([\s\S]+)$/)?.[1] || "";
  const tips = tipsBlock.trim().split("\n").filter(t => t.trim().match(/^[-•*]/)).map(t => t.replace(/^[-•*]\s*/, "").trim()).filter(Boolean).slice(0, 2);
  if (!z || !g || !u) return null;
  return { zoe: parseInt(z), gg: parseInt(g), upf: parseInt(u), proteinG, verdict, source, identified, summary, tips };
}

function parseRecipe(text) {
  if (!text.includes("RECIPE: true")) return null;
  const intro = text.match(/INTRO:\s*(.+)/)?.[1]?.trim();
  const bestPick = text.match(/BEST_PICK:\s*([\s\S]+?)(?=OPTION_|$)/)?.[1]?.trim();
  const options = [];
  for (let n = 1; n <= 3; n++) {
    const name = text.match(new RegExp(`OPTION_${n}_NAME:\\s*(.+)`))?.[1]?.trim();
    if (!name) break;
    const score = parseInt(text.match(new RegExp(`OPTION_${n}_SCORE:\\s*(\\d+)`))?.[1] || "5");
    const verdict = text.match(new RegExp(`OPTION_${n}_VERDICT:\\s*(.+)`))?.[1]?.trim();
    const methodBlock = text.match(new RegExp(`OPTION_${n}_METHOD:\\s*([\\s\\S]+?)(?=OPTION_${n}_TIP:)`))?.[1]?.trim();
    const tip = text.match(new RegExp(`OPTION_${n}_TIP:\\s*(.+)`))?.[1]?.trim();
    const steps = methodBlock ? methodBlock.split("\n").filter(s => s.trim()).map(s => s.replace(/^\d+[\.\)]\s*/, "").trim()) : [];
    options.push({ name, score, verdict, steps, tip });
  }
  return { intro, options, bestPick };
}

function RecipeCard({ data }) {
  const [open, setOpen] = useState(0);
  return (
    <div style={{ maxWidth: "96%", alignSelf: "flex-start", display: "flex", flexDirection: "column", gap: 8 }}>
      {data.intro && (
        <div style={{ background: "linear-gradient(135deg,#1b4332,#2d6a4f)", borderRadius: 20, padding: "12px 16px" }}>
          <div style={{ color: "white", fontWeight: 700, fontSize: 15 }}>👨‍🍳 Recipe Ideas</div>
          <div style={{ color: "rgba(255,255,255,0.85)", fontSize: 13, marginTop: 4 }}>{data.intro}</div>
        </div>
      )}
      {data.options.map((opt, i) => {
        const color = opt.score >= 7 ? "#00c875" : opt.score >= 4 ? "#ffb800" : "#ff4444";
        const isOpen = open === i;
        return (
          <div key={i} style={{ background: "white", borderRadius: 20, overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.08)", border: isOpen ? `2px solid ${color}` : "2px solid transparent" }}>
            <button onClick={() => setOpen(isOpen ? -1 : i)} style={{ width: "100%", background: "none", border: "none", padding: "14px 16px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, textAlign: "left" }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: color + "22", border: `2px solid ${color}`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 16, color, flexShrink: 0 }}>{opt.score}</div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 14, color: "#222" }}>{opt.name}</div>
                  <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>{opt.verdict}</div>
                </div>
              </div>
              <div style={{ fontSize: 18, color: "#ccc", flexShrink: 0 }}>{isOpen ? "▲" : "▼"}</div>
            </button>
            {isOpen && (
              <div style={{ padding: "0 16px 16px" }}>
                <div style={{ borderTop: "1px solid #f0f0f0", paddingTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
                  {opt.steps.map((step, si) => (
                    <div key={si} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                      <div style={{ width: 24, height: 24, borderRadius: "50%", background: color, color: "white", fontSize: 11, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>{si + 1}</div>
                      <div style={{ fontSize: 13, color: "#444", lineHeight: 1.5 }}>{step}</div>
                    </div>
                  ))}
                  {opt.tip && (
                    <div style={{ background: "#fffbea", border: "1px solid #ffe066", borderRadius: 12, padding: "8px 12px", fontSize: 12, color: "#886600", marginTop: 4 }}>
                      💡 {opt.tip}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
      {data.bestPick && (
        <div style={{ background: "#e6fff5", border: "2px solid #00c875", borderRadius: 20, padding: "12px 16px" }}>
          <div style={{ fontWeight: 800, fontSize: 12, color: "#007a45", marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>🏆 Best pick for you</div>
          <div style={{ fontSize: 13, color: "#333" }}>{data.bestPick}</div>
        </div>
      )}
    </div>
  );
}

function BroadCard({ data, onFollowup }) {
  const typeStyle = {
    best: { bg: "#e6fff5", border: "#00c875", icon: "✅", label: "Best pick" },
    ok: { bg: "#fff8e6", border: "#ffb800", icon: "⚠️", label: "It depends" },
    avoid: { bg: "#fff0f0", border: "#ff4444", icon: "❌", label: "Avoid" }
  };
  return (
    <div style={{ maxWidth: "92%", alignSelf: "flex-start", display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ background: "white", borderRadius: 24, overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}>
        <div style={{ background: "linear-gradient(135deg,#1b4332,#2d6a4f)", padding: "14px 18px" }}>
          <div style={{ color: "white", fontWeight: 900, fontSize: 18 }}>🤔 It depends!</div>
          <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 13, marginTop: 3 }}>{data.headline}</div>
        </div>
        <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
          {data.variants.map((v, i) => {
            const s = typeStyle[v.type];
            return (
              <div key={i} style={{ background: s.bg, border: `2px solid ${s.border}`, borderRadius: 14, padding: "10px 14px", display: "flex", gap: 10 }}>
                <div style={{ fontSize: 18 }}>{s.icon}</div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 13, color: "#222" }}>{s.label}: {v.name}</div>
                  <div style={{ fontSize: 12, color: "#666", marginTop: 2 }}>{v.why}</div>
                </div>
              </div>
            );
          })}
        </div>
        {data.followup && (
          <div style={{ padding: "0 16px 16px" }}>
            <div style={{ background: "#f0f7f4", borderRadius: 14, padding: "12px 14px" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#2d6a4f", marginBottom: 6 }}>💬 {data.followup}</div>
              <input placeholder="Type your answer..." onKeyDown={e => { if (e.key === "Enter" && e.target.value.trim()) { onFollowup(e.target.value); e.target.value = ""; } }} style={{ width: "100%", padding: "8px 12px", borderRadius: 10, border: "2px solid #d0e8da", fontSize: 13, fontFamily: "inherit", outline: "none", boxSizing: "border-box", background: "white" }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ResultCard({ m }) {
  const p = parseReply(m.text || "");
  if (!p) return (
    <div style={{ maxWidth: "88%", alignSelf: "flex-start", background: "white", borderRadius: 20, padding: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.08)", fontSize: 15, lineHeight: 1.6, color: "#333" }}>
      <span style={{ whiteSpace: "pre-wrap" }}>{m.text}</span>
    </div>
  );
  const avg = Math.round((p.zoe + p.gg + p.upf) / 3);
  const vStyle = avg >= 7 ? { label: "Great choice! 🎉", bg: "linear-gradient(135deg,#00b865,#00c875)" } : avg >= 4 ? { label: "OK in moderation ⚠️", bg: "linear-gradient(135deg,#f0a500,#ffb800)" } : { label: "Best avoided ❌", bg: "linear-gradient(135deg,#e03030,#ff4444)" };
  const isPersonal = p.source?.toLowerCase().includes("zoe");
  return (
    <div style={{ maxWidth: "92%", alignSelf: "flex-start", display: "flex", flexDirection: "column", gap: 8 }}>
      {p.identified && p.identified !== "N/A" && (
        <div style={{ background: "#f0f7f4", borderRadius: 20, padding: "10px 16px", display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 18 }}>👀</span>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#2d6a4f", textTransform: "uppercase", letterSpacing: 0.5 }}>I can see...</div>
            <div style={{ fontSize: 13, color: "#333", fontWeight: 600 }}>{p.identified}</div>
          </div>
        </div>
      )}
      <div style={{ background: vStyle.bg, borderRadius: 20, padding: "14px 18px", boxShadow: "0 4px 14px rgba(0,0,0,0.15)" }}>
        <div style={{ color: "white", fontWeight: 900, fontSize: 20, marginBottom: 2 }}>{vStyle.label}</div>
        {p.verdict && <div style={{ color: "white", fontSize: 13, opacity: 0.85, fontStyle: "italic" }}>{p.verdict}</div>}
      </div>
      <div style={{ background: "white", borderRadius: 20, padding: "16px 12px", boxShadow: "0 2px 12px rgba(0,0,0,0.08)", display: "flex", justifyContent: "space-around", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
        <ScoreCircle label="Zoe" score={p.zoe} icon="🧬" />
        <ScoreCircle label="Glucose" score={p.gg} icon="🩸" />
        <ScoreCircle label="UPF" score={p.upf} icon="🏭" />
        {p.proteinG > 0 && (() => {
          const pct = Math.round((p.proteinG / 140) * 100);
          const color = p.proteinG >= 20 ? "#00c875" : p.proteinG >= 10 ? "#ffb800" : "#ff4444";
          const label = p.proteinG >= 20 ? "High 💪" : p.proteinG >= 10 ? "Moderate" : "Low";
          return (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <div style={{ background: color + "22", border: "2px solid " + color, borderRadius: 14, padding: "6px 12px", textAlign: "center", minWidth: 60 }}>
                <div style={{ fontSize: 20, fontWeight: 900, color, lineHeight: 1 }}>{p.proteinG}g</div>
                <div style={{ fontSize: 9, color, fontWeight: 700, marginTop: 2 }}>{pct}% of 140g</div>
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#666" }}>💪 Protein</div>
              <div style={{ fontSize: 10, color, fontWeight: 600 }}>{label}</div>
            </div>
          );
        })()}
      </div>
      {p.summary && (
        <div style={{ background: "white", borderRadius: 20, padding: "14px 16px", boxShadow: "0 2px 10px rgba(0,0,0,0.07)", fontSize: 14, lineHeight: 1.7, color: "#444" }}>{p.summary}</div>
      )}
      {p.tips?.length > 0 && (
        <div style={{ background: "#fffbea", border: "2px solid #ffe066", borderRadius: 20, padding: "12px 16px" }}>
          <div style={{ fontWeight: 900, fontSize: 12, color: "#cc9900", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>💡 If you eat this</div>
          {p.tips.map((tip, i) => (
            <div key={i} style={{ fontSize: 13, color: "#555", lineHeight: 1.6, marginBottom: i < p.tips.length-1 ? 6 : 0, display: "flex", gap: 8 }}>
              <span style={{ color: "#ffb800", fontWeight: 700 }}>→</span><span>{tip}</span>
            </div>
          ))}
        </div>
      )}
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: 20, background: isPersonal ? "#e6fff5" : "#fff8e6", fontSize: 10, fontWeight: 700, color: isPersonal ? "#007a45" : "#aa8000" }}>
          {isPersonal ? "🧬 Your personal Zoe data" : "📚 General knowledge"}
        </div>
      </div>
    </div>
  );
}

({ label, score, icon }) {
  const color = score >= 7 ? "#00c875" : score >= 4 ? "#ffb800" : "#ff4444";
  const size = 72; const r = 28; const circ = 2 * Math.PI * r; const dash = (score / 10) * circ;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
      <div style={{ position: "relative", width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#eee" strokeWidth={6} />
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={6} strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: 18, fontWeight: 900, color, lineHeight: 1 }}>{score}</span>
          <span style={{ fontSize: 9, color: "#999", lineHeight: 1 }}>/10</span>
        </div>
      </div>
      <div style={{ fontSize: 11, fontWeight: 700, color: "#666", textAlign: "center" }}>{icon} {label}</div>
    </div>
  );
}

function BroadCard({ data, onFollowup }) {
  const typeStyle = {
    best: { bg: "#e6fff5", border: "#00c875", icon: "✅", label: "Best pick" },
    ok: { bg: "#fff8e6", border: "#ffb800", icon: "⚠️", label: "It depends" },
    avoid: { bg: "#fff0f0", border: "#ff4444", icon: "❌", label: "Avoid" }
  };
  return (
    <div style={{ maxWidth: "92%", alignSelf: "flex-start", display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ background: "white", borderRadius: 24, overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}>
        <div style={{ background: "linear-gradient(135deg, #1b4332, #2d6a4f)", padding: "14px 18px" }}>
          <div style={{ color: "white", fontWeight: 900, fontSize: 18 }}>🤔 It depends!</div>
          <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 13, marginTop: 3 }}>{data.headline}</div>
        </div>
        <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
          {data.variants.map((v, i) => {
            const s = typeStyle[v.type];
            return (
              <div key={i} style={{ background: s.bg, border: `2px solid ${s.border}`, borderRadius: 14, padding: "10px 14px", display: "flex", gap: 10 }}>
                <div style={{ fontSize: 18 }}>{s.icon}</div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 13, color: "#222" }}>{s.label}: {v.name}</div>
                  <div style={{ fontSize: 12, color: "#666", marginTop: 2 }}>{v.why}</div>
                </div>
              </div>
            );
          })}
        </div>
        {data.followup && (
          <div style={{ padding: "0 16px 16px" }}>
            <div style={{ background: "#f0f7f4", borderRadius: 14, padding: "12px 14px" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#2d6a4f", marginBottom: 6 }}>💬 {data.followup}</div>
              <input placeholder="Type your answer..." onKeyDown={e => { if (e.key === "Enter" && e.target.value.trim()) { onFollowup(e.target.value); e.target.value = ""; } }} style={{ width: "100%", padding: "8px 12px", borderRadius: 10, border: "2px solid #d0e8da", fontSize: 13, fontFamily: "inherit", outline: "none", boxSizing: "border-box", background: "white" }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ResultCard({ m }) {
  const broad = parseBroad(m.text || "");
  if (broad) return null;
  const p = parseReply(m.text || "");
  if (!p) return (
    <div style={{ maxWidth: "88%", alignSelf: "flex-start", background: "white", borderRadius: 20, padding: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.08)", fontSize: 15, lineHeight: 1.6, color: "#333" }}>
      <span style={{ whiteSpace: "pre-wrap" }}>{m.text}</span>
    </div>
  );
  const avg = Math.round((p.zoe + p.gg + p.upf) / 3);
  const vStyle = avg >= 7 ? { label: "Great choice! 🎉", bg: "linear-gradient(135deg,#00b865,#00c875)" } : avg >= 4 ? { label: "OK in moderation ⚠️", bg: "linear-gradient(135deg,#f0a500,#ffb800)" } : { label: "Best avoided ❌", bg: "linear-gradient(135deg,#e03030,#ff4444)" };
  const isPersonal = p.source?.toLowerCase().includes("zoe");

  return (
    <div style={{ maxWidth: "92%", alignSelf: "flex-start", display: "flex", flexDirection: "column", gap: 8 }}>
      {p.identified && p.identified !== "N/A" && (
        <div style={{ background: "#f0f7f4", borderRadius: 20, padding: "10px 16px", display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 18 }}>👀</span>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#2d6a4f", textTransform: "uppercase", letterSpacing: 0.5 }}>I can see...</div>
            <div style={{ fontSize: 13, color: "#333", fontWeight: 600 }}>{p.identified}</div>
          </div>
        </div>
      )}
      <div style={{ background: vStyle.bg, borderRadius: 20, padding: "14px 18px", boxShadow: "0 4px 14px rgba(0,0,0,0.15)" }}>
        <div style={{ color: "white", fontWeight: 900, fontSize: 20, marginBottom: 2 }}>{vStyle.label}</div>
        {p.verdict && <div style={{ color: "white", fontSize: 13, opacity: 0.85, fontStyle: "italic" }}>{p.verdict}</div>}
      </div>
      <div style={{ background: "white", borderRadius: 20, padding: "16px 12px", boxShadow: "0 2px 12px rgba(0,0,0,0.08)", display: "flex", justifyContent: "space-around", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
        <ScoreCircle label="Zoe" score={p.zoe} icon="🧬" />
        <ScoreCircle label="Glucose" score={p.gg} icon="🩸" />
        <ScoreCircle label="UPF" score={p.upf} icon="🏭" />
        {p.proteinG > 0 && (() => {
          const pct = Math.round((p.proteinG / 140) * 100);
          const color = p.proteinG >= 20 ? "#00c875" : p.proteinG >= 10 ? "#ffb800" : "#ff4444";
          const label = p.proteinG >= 20 ? "High 💪" : p.proteinG >= 10 ? "Moderate" : "Low";
          return (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <div style={{ background: color + "22", border: "2px solid " + color, borderRadius: 14, padding: "6px 12px", textAlign: "center", minWidth: 60 }}>
                <div style={{ fontSize: 20, fontWeight: 900, color, lineHeight: 1 }}>{p.proteinG}g</div>
                <div style={{ fontSize: 9, color, fontWeight: 700, marginTop: 2 }}>{pct}% of 140g</div>
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#666" }}>💪 Protein</div>
              <div style={{ fontSize: 10, color, fontWeight: 600 }}>{label}</div>
            </div>
          );
        })()}
      </div>
      {p.summary && (
        <div style={{ background: "white", borderRadius: 20, padding: "14px 16px", boxShadow: "0 2px 10px rgba(0,0,0,0.07)", fontSize: 14, lineHeight: 1.7, color: "#444" }}>{p.summary}</div>
      )}
      {p.tips?.length > 0 && (
        <div style={{ background: "#fffbea", border: "2px solid #ffe066", borderRadius: 20, padding: "12px 16px" }}>
          <div style={{ fontWeight: 900, fontSize: 12, color: "#cc9900", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>💡 If you eat this</div>
          {p.tips.map((tip, i) => (
            <div key={i} style={{ fontSize: 13, color: "#555", lineHeight: 1.6, marginBottom: i < p.tips.length-1 ? 6 : 0, display: "flex", gap: 8 }}>
              <span style={{ color: "#ffb800", fontWeight: 700 }}>→</span><span>{tip}</span>
            </div>
          ))}
        </div>
      )}
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: 20, background: isPersonal ? "#e6fff5" : "#fff8e6", fontSize: 10, fontWeight: 700, color: isPersonal ? "#007a45" : "#aa8000" }}>
          {isPersonal ? "🧬 Your personal Zoe data" : "📚 General knowledge"}
        </div>
      </div>
    </div>
  );
}

function LockScreen({ onUnlock }) {
  const [taps, setTaps] = useState([]);
  const SECRET_ZONE = { x: [0, 100], y: [0, 50] }; // anywhere in top half
  const REQUIRED = 3;
  const TIMEOUT = 2000;
  const timerRef = useRef(null);

  function handleTap(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const xPct = ((e.clientX - rect.left) / rect.width) * 100;
    const yPct = ((e.clientY - rect.top) / rect.height) * 100;
    const inZone = xPct >= SECRET_ZONE.x[0] && xPct <= SECRET_ZONE.x[1] && yPct >= SECRET_ZONE.y[0] && yPct <= SECRET_ZONE.y[1];
    if (!inZone) return;
    clearTimeout(timerRef.current);
    const newTaps = [...taps, Date.now()];
    setTaps(newTaps);
    if (newTaps.length >= REQUIRED) { onUnlock(); return; }
    timerRef.current = setTimeout(() => setTaps([]), TIMEOUT);
  }

  return (
    <div onClick={handleTap} style={{ height: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#f5f8f5", padding: 24, userSelect: "none", cursor: "default" }}>
      <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.3 }}>🍽️</div>
      <div style={{ fontSize: 18, fontWeight: 700, color: "#ccc", marginBottom: 8 }}>Nothing to see here</div>
      <div style={{ fontSize: 13, color: "#ddd" }}>This page is private.</div>
    </div>
  );
}

export default function App() {
  const [unlocked, setUnlocked] = useState(false);
  const [chat, setChat] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const endRef = useRef(null);
  const scroll = () => setTimeout(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), 50);

  if (!unlocked) return <LockScreen onUnlock={() => setUnlocked(true)} />;

  async function send(txt) {
    const msg = txt !== undefined ? txt : input;
    if (!msg.trim() && images.length === 0) return;
    setLoading(true);
    const userContent = [];
    for (const img of images) {
      userContent.push({ type: "image", source: { type: "base64", media_type: img.type, data: img.b64 } });
    }
    if (msg.trim()) userContent.push({ type: "text", text: msg });
    const userMsg = { role: "user", content: userContent, text: msg, previews: images.map(i => i.preview) };
    const newChat = [...chat, userMsg];
    setChat(newChat); setInput(""); setImages([]); scroll();
    try {
      const reply = await askClaude(newChat.map(m => ({ role: m.role, content: m.content })));
      setChat(c => [...c, { role: "assistant", text: reply, content: [{ type: "text", text: reply }] }]);
    } catch(e) {
      setChat(c => [...c, { role: "assistant", text: "Oops! Something went wrong — try again 🙏", content: [] }]);
    }
    setLoading(false); scroll();
  }

  const isEmpty = chat.length === 0;

  return (
    <div style={{ fontFamily: "system-ui,sans-serif", maxWidth: 600, margin: "0 auto", height: "100vh", height: "100dvh", display: "flex", flexDirection: "column", background: "#f5f8f5" }}>
      <div style={{ background: "linear-gradient(135deg,#1b4332,#2d6a4f)", padding: "16px 20px", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ fontSize: 28, letterSpacing: 1 }}>🍎🥑🍫🥚🍕</div>
          <div>
            <div style={{ color: "white", fontWeight: 900, fontSize: 20, letterSpacing: -0.5 }}>Food Consultant</div>
            <div style={{ color: "rgba(255,255,255,0.65)", fontSize: 11 }}>Your Zoe · Glucose Goddess · UPF science</div>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "20px 14px 10px", display: "flex", flexDirection: "column", gap: 12 }}>
        {isEmpty && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "40px 20px" }}>
            <div style={{ fontSize: 60, marginBottom: 14 }}>🥗</div>
            <div style={{ fontSize: 26, fontWeight: 900, color: "#1b4332", marginBottom: 8, letterSpacing: -0.5 }}>Is this food good for me?</div>
            <div style={{ fontSize: 14, color: "#999", lineHeight: 1.6 }}>Type any food or take a photo of a label.<br />Instant personal score, no judgement.<br />(OK, maybe a little judgement. 😄)</div>
          </div>
        )}
        {chat.map((m, i) => {
          if (m.role === "user") return (
            <div key={i} style={{ maxWidth: "80%", alignSelf: "flex-end", background: "linear-gradient(135deg,#1b4332,#2d6a4f)", color: "white", borderRadius: "20px 20px 4px 20px", padding: "12px 16px", boxShadow: "0 2px 10px rgba(27,67,50,0.3)" }}>
              {m.preview && <img src={m.preview} style={{ maxWidth: "100%", maxHeight: 120, width: "auto", height: "auto", borderRadius: 12, marginBottom: 8, display: "block" }} />}
              {m.text && <span style={{ fontSize: 15, lineHeight: 1.5 }}>{m.text}</span>}
            </div>
          );
          const recipe = parseRecipe(m.text || "");
          if (recipe) return <RecipeCard key={i} data={recipe} />;
          const broad = parseBroad(m.text || "");
          if (broad) return <BroadCard key={i} data={broad} onFollowup={q => send(q)} />;
          return <ResultCard key={i} m={m} />;
        })}
        {loading && (
          <div style={{ alignSelf: "flex-start", background: "white", borderRadius: 20, padding: "14px 18px", boxShadow: "0 2px 10px rgba(0,0,0,0.08)", display: "flex", gap: 6, alignItems: "center" }}>
            {[0,1,2].map(i => <div key={i} style={{ width: 9, height: 9, borderRadius: "50%", background: "#2d6a4f", animation: "bounce 1.2s infinite", animationDelay: i*0.2+"s" }} />)}
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div style={{ padding: "10px 14px 16px", background: "white", borderTop: "2px solid #eef2ee", flexShrink: 0, position: "sticky", bottom: 0 }}>
        {images.length > 0 && (
          <div style={{ marginBottom: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
            {images.map((img, i) => (
              <div key={i} style={{ position: "relative", display: "inline-block" }}>
                <img src={img.preview} style={{ height: 64, width: "auto", borderRadius: 10, border: "3px solid #2d6a4f", display: "block" }} />
                <button onClick={() => setImages(imgs => imgs.filter((_, j) => j !== i))} style={{ position: "absolute", top: -8, right: -8, background: "#ff4444", color: "white", border: "none", borderRadius: "50%", width: 22, height: 22, cursor: "pointer", fontSize: 13, fontWeight: 700, lineHeight: "22px", textAlign: "center" }}>×</button>
              </div>
            ))}
          </div>
        )}
        <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
          <label style={{ flexShrink: 0, width: 48, height: 48, background: "linear-gradient(135deg,#1b4332,#40916c)", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 20, boxShadow: "0 3px 10px rgba(27,67,50,0.3)" }}>
            📷
            <input type="file" accept="image/*" multiple style={{ display: "none" }} onChange={async e => {
              const files = Array.from(e.target.files || []);
              const newImgs = await Promise.all(files.map(async f => ({
                b64: await fileToBase64(f), type: f.type, preview: URL.createObjectURL(f)
              })));
              setImages(imgs => [...imgs, ...newImgs].slice(0, 4));
              e.target.value = "";
            }} />
          </label>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onFocus={e => setTimeout(() => e.target.scrollIntoView({ behavior: "smooth", block: "center" }), 300)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder="e.g. oat milk, avocado toast, Huel..."
            style={{ flex: 1, padding: "13px 16px", borderRadius: 16, border: "2px solid #d0e8da", resize: "none", fontSize: 15, fontFamily: "inherit", outline: "none", minHeight: 48, maxHeight: 120, lineHeight: 1.4, background: "#f9fcf9" }}
            rows={1}
          />
          <button onClick={() => send()}           disabled={loading || (!input.trim() && images.length === 0)}             style={{ flexShrink: 0, width: 48, height: 48, background: (!input.trim() && images.length === 0) ? "#ddd" : "linear-gradient(135deg,#1b4332,#40916c)", color: "white", border: "none", borderRadius: 16, cursor: (!input.trim() && images.length === 0) ? "not-allowed" : "pointer", fontSize: 20, boxShadow: (!input.trim() && images.length === 0) ? "none" : "0 3px 10px rgba(27,67,50,0.3)", transition: "all 0.2s" }}>↑</button>
        </div>
      </div>
      <style>{`@keyframes bounce{0%,80%,100%{transform:scale(0.6);opacity:0.4}40%{transform:scale(1);opacity:1}}`}</style>
    </div>
  );
}

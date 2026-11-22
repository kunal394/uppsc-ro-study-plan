import { writeFile } from "node:fs/promises";
import { resources, papers, paperURL, pyqGroups, weeks, days, checked } from "./plan.mjs";
import { questions } from "./questions.mjs";

const escape = value => String(value).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const link = (url, label) => `<a href="${escape(url)}" target="_blank" rel="noopener noreferrer">${escape(label)}<span class="sr-only"> (opens a new tab)</span></a>`;
const resourceLinks = ids => ids.map(id => link(resources[id].url, resources[id].name)).join(" · ");
const paperLinks = id => papers[id].urls.map((url, i) => link(url, papers[id].urls.length === 1 ? "Combined paper PDF" : i === 0 ? "GS paper PDF" : "Hindi paper PDF")).join(" · ");
function renderQuestion(q, prefix) {
  const id = `${prefix}-${q.id}`;
  const answer = `<p><strong>${q.language === "hi" ? "उत्तर" : "Answer"}: ${String.fromCharCode(65 + q.correct)}. ${escape(q.options[q.correct])}</strong></p><p>${escape(q.explanation)}</p><p class="small">Editorial explanation, not an official key. ${link(q.evidence || resources[q.source].url, q.evidence ? "Independent reference" : resources[q.source].name)}</p>`;
  return `<article class="practice-question" lang="${q.language}">
    <p class="eyebrow">Adapted PYQ · 2025 · Q${q.number} · PDF p${q.page}</p>
    <fieldset><legend>${escape(q.stem)}</legend>${q.options.map((option,i) => `<label class="question-option"><input type="radio" name="${id}" value="${i}"><span>${String.fromCharCode(65+i)}. ${escape(option)}</span></label>`).join("")}</fieldset>
    <button type="button" class="answer-toggle enhanced-only" aria-expanded="false" aria-controls="${id}-answer">${q.language === "hi" ? "उत्तर दिखाएँ" : "Reveal answer"}</button>
    <div class="question-answer" id="${id}-answer" hidden>${answer}</div>
    <noscript><details class="question-answer"><summary>${q.language === "hi" ? "उत्तर दिखाएँ" : "Reveal answer"}</summary>${answer}</details></noscript>
    <details class="question-source"><summary>Original-paper reference (secondary)</summary><p>${link(`${paperURL}#page=${q.page}`, `Exact source file · Q${q.number} · PDF p${q.page}`)}. Wording/options here are independently adapted, not verbatim extraction; the source scan may show marked choices. Do not use those marks as an official key.</p></details>
  </article>`;
}
function selectQuestions(groups, count, offset) {
  const matching = questions.filter(q => q.groups.some(group => groups.includes(group)));
  const shift = matching.length ? offset % matching.length : 0;
  return [...matching.slice(shift), ...matching.slice(0, shift)].slice(0, count);
}
const task = (day, key, title, body, language = "") => `<div class="task">
  <label class="task-label"><input type="checkbox" data-task="${day}-${key}" disabled><span>${escape(title)}</span></label>
  <div class="task-body"${language ? ` lang="${language}"` : ""}>${body}</div>
</div>`;
function pyqSet(id) {
  const group = pyqGroups[id];
  return `<details class="pyq-set"><summary>${escape(group.title)}</summary>
    <ul>${group.refs.map(([page, questions, topic]) => `<li>${link(`${paperURL}#page=${page}`, `2025 · PDF p${page} · Q${questions}`)} — ${escape(topic)}</li>`).join("")}</ul>
    <p class="small">${escape(group.scope)}</p>
  </details>`;
}
function renderDay(day) {
  const fullPaper = Boolean(day.paper);
  const hindiGroups = day.hindi[0] === "mixed" ? ["correction","antonyms","synonyms","tatsam","adjectives","oneWord"] : [day.hindi[0]];
  const selectedQuestions = fullPaper
    ? selectQuestions(["polity","modern","ancient","medieval","geography","population","economy","agriculture","environment","biology","physics","chemistry","reasoning","scienceTech","up","current"], 12, day.day).concat(selectQuestions(["correction","antonyms","synonyms","tatsam","adjectives","oneWord"],6,day.day))
    : selectQuestions(day.groups, 6, day.day).concat(selectQuestions(hindiGroups,4,day.day));
  const practice = `<p class="practice-note"><strong>Practise here, without a marked scan.</strong> Select an option, then reveal the answer when ready. These ${selectedQuestions.length} cards are concise <strong>adaptations of verified paper concepts</strong>, not verbatim transcriptions or the entire 200-question paper. Answers/explanations are editorial, not an official key. Repeated cards deliberately support recall.</p>${selectedQuestions.map(q => renderQuestion(q,`day${day.day}`)).join("")}`;
  const due = [day.day - 1, day.day - 7, day.day - 21].filter(n => n > 0);
  const recall = due.length ? `Revisit ${due.map(n => `<a href="#day-${n}">Day ${n}</a>`).join(", ")} notes/errors: one-day, seven-day and twenty-one-day recall where available. ` : "Begin a small closed-book recall notebook. ";
  const taskBodies = fullPaper ? [
    task(day.day, "gs", "180 min · Reserved full-paper block", `<p>${escape(day.reading)}</p><p><strong>Important:</strong> the embedded text cards are a selected practice drill, <strong>not a complete 200-question paper</strong>. Use an unseen, unmarked 200-question paper from a lawful source you already have for a genuine 180-minute mock. Otherwise use today's cards as a shorter untimed learning/retrieval drill and label it accordingly.</p><details class="secondary-paper"><summary>Optional past-paper source files (may contain marks)</summary><p>${paperLinks(day.paper)} · <a href="#papers">File provenance and limitations</a></p></details>`),
    task(day.day, "hindi", "15 min · Hindi error triage", `<p lang="hi">हिन्दी की गलतियों को छह क्षेत्रों में बाँटें: विलोम, शुद्धि, वाक्यांश, तत्सम–तद्भव, विशेष्य–विशेषण और पर्यायवाची। गलत उत्तर का कारण लिखें; अनिश्चित उत्तर को पक्का न मानें।</p><p>${resourceLinks(["hindi"])}</p>`),
    task(day.day, "pyq", "20 min · GS error triage / text drill", `<p>After a full attempt, pick three costly errors; write concept / reading / recall / guess / time as the cause. Separate unresolved or obsolete questions. Tomorrow's first reading block repairs these errors. If no unmarked full paper is available, use these selected cards as a shorter drill, not a mock score.</p><p>${escape(day.output)}</p>${practice}`),
    task(day.day, "current", "10 min · Historical/current-fact check", `<p>${escape(day.upTask)} Keep the year asked in the paper. Use ${resourceLinks(["pib","ca"])} only to verify relevant developments, not to silently replace the historical answer.</p>`),
    task(day.day, "recall", "15 min · Review plan and delayed queue", `<p>${recall}Log attempted/correct/wrong/blanks/unresolved separately for GS and Hindi. <a href="#method">Use the review protocol</a>; add follow-up dates, not just a score.</p>`)
  ] : [
    task(day.day, "gs", "90 min · GS reading + a concrete output", `<p>${escape(day.reading)}</p><p class="output"><strong>Produce:</strong> ${escape(day.output)}</p><p><strong>Read from:</strong> ${resourceLinks(day.materials)}. Use the named topic/chapter, not the entire book. <a href="#materials">Free alternatives and book-selection guidance</a>.</p>`),
    task(day.day, "hindi", "45 min · दैनिक हिन्दी", `<p lang="hi">${escape(day.hindi[1])} सप्ताह ${day.week > 4 ? "5 के बाद पुराने कठिन शब्द और गलत नियम पहले दोहराएँ; नया शब्द-संग्रह बढ़ाने के बजाय त्रुटियाँ घटाएँ।" : "1–4 में छोटे अर्थ-समूह और नियम बनाएं, विशाल सूची नहीं।"} नीचे हिन्दी के प्रश्न-कार्डों पर पहले स्वयं उत्तर दें, फिर उत्तर दिखाएँ।</p><p>${resourceLinks(["hindi"])}</p>`, "hi"),
    task(day.day, "pyq", "45 min · Text PYQs + explanation review", `<p>Complete today's embedded GS and Hindi cards first, then explain each wrong choice and revisit your errors. For a longer set, optionally supplement from a lawful unmarked source to reach <strong>8–12 GS and 5–8 Hindi questions</strong>. Those are adjustable practice targets, not exam weights or a claim about the number embedded here. A small set with careful explanation is better than a rushed larger set. Repeated exposure is intentional retrieval practice.</p>
      ${practice}
      <details class="secondary-paper"><summary>More original question/page references (scans may show marks)</summary><p>The embedded bank covers a selected set, not every question below. These secondary references are for source checking or additional practice. Handwritten ticks are not official answers.</p>${day.groups.map(pyqSet).join("")}<div lang="hi">${hindiGroups.map(pyqSet).join("")}</div></details>
      <p class="small">All locators use the exact 34-page CareerPower file linked here. PDF viewer page jumps may not work on every phone; manually go to the stated PDF page. For extra unseen practice, use the <a href="#papers">other past-paper files</a> or one lawful solved compilation; do not invent topic/question tags.</p>`),
    task(day.day, "current", "30 min · Current affairs + UP connection", `<p>${escape(day.upTask || "Review one UP topic connected to today's reading.")}</p><p>Spend about 15 minutes on the latest selected monthly compilation and 15 minutes on the UP link above. Extract at most five facts: <strong>date, institution, what changed, location and static link</strong>. Mark numbers with year and units.</p><p>${resourceLinks(["ca","pib"])} · ${resourceLinks(day.subject.includes("UP") || day.groups.includes("up") ? ["up","tourism","upbudget"] : ["up"])}</p>`),
    task(day.day, "recall", "30 min · Closed-book recall + error repair", `<p>${recall}Write five questions yourself, answer without notes, then correct in another colour. Reattempt errors without seeing the previous answer. Finish by choosing tomorrow's first task.</p><p>Once a week only: optional 75-word original explanation or a five-line official-letter outline, <strong>inside this block and capped at 30 minutes/week</strong>. No daily essays or separate accounts preparation for RO General.</p>`)
  ];
  return `<details class="day-card" id="day-${day.day}" data-day="${day.day}" data-week="${day.week}" data-subject="${escape(day.subject)}"${day.day === 1 ? " open" : ""}>
    <summary><span class="day-num">${String(day.day).padStart(2, "0")}</span><span class="day-heading"><span class="eyebrow">${escape(day.phase)} · ${escape(day.subject)} <span class="scheduled-date"></span></span><span class="day-title">${escape(day.title)}</span></span><span class="day-status" aria-label="Day progress">0/5</span></summary>
    <div class="day-content"><p class="pace-note">${fullPaper ? "Full-paper day: 3 h attempt + 1 h triage. With only 2 h/day, spread this over two days and shift the cycle; a split attempt is not a 3 h simulation." : "Standard day: 4 h total. For 2 h, use 40 / 25 / 25 / 15 / 15 minutes; halve the reading/examples, keep explanation review, and extend the cycle where necessary."}</p>
    ${taskBodies.join("")}
    <div class="day-actions enhanced-only"><button type="button" data-complete="${day.day}">Mark all five tasks complete</button><a href="#day-${Math.min(day.day + 1, 84)}">${day.day === 84 ? "Cycle complete: review next steps below" : "Next day →"}</a></div>
    </div></details>`;
}
const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="A detailed, prelims-first 84-day UPPSC RO/ARO study cycle with authentic PYQ page links, official study materials, daily Hindi, revision and private local progress tracking.">
  <meta name="theme-color" content="#143a39">
  <title>UPPSC RO/ARO · A daily study companion</title>
  <link rel="icon" type="image/svg+xml" href="favicon.svg">
  <link rel="stylesheet" href="styles.css">
  <script src="app.js" defer></script>
</head>
<body>
<a class="skip-link" href="#main">Skip to study content</a>
<header class="site-header">
  <a class="brand" href="#home"><span class="brand-mark" aria-hidden="true">RO</span><span>Study companion<small>UPPSC · RO / ARO</small></span></a>
  <nav aria-label="Main navigation"><a href="#daily">Daily plan</a><a href="#practice">Practise PYQs</a><a href="#materials">Materials</a><a href="#mains">Later mains</a></nav>
</header>
<main id="main">
<section class="hero" id="home">
  <div><p class="eyebrow">12 weeks · 84 days · one manageable routine</p>
  <h1>Study with a plan.<br><em>Progress one day at a time.</em></h1>
  <p class="hero-copy">A descriptive, prelims-first path through General Studies, daily Hindi and real previous-year questions. Read selectively, practise with context, revise what you forget.</p>
  <div class="hero-actions"><a class="button primary" href="#daily">Start the daily plan</a><a class="button secondary" href="#start">How to use it</a></div>
  <p class="small">Independent educational guide · not affiliated with UPPSC · no account or payment required</p></div>
  <aside class="hero-card"><p class="eyebrow">The revised prelims</p><strong class="big-number">200<span>questions · 200 marks</span></strong><div class="split"><span><b>140</b> GS</span><span><b>60</b> Hindi</span></div><p>One objective paper · 3 hours<br>Wrong answer: one-third penalty</p><a href="#scheme">Check the scheme and provenance →</a></aside>
</section>
<section id="start" class="section">
  <div class="section-heading"><p class="eyebrow">Before Day 1</p><h2>A cycle, not an invented deadline</h2></div>
  <p>This is a <strong>scalable 84-day cycle</strong>, not a claim that your exam is 12 weeks away. No exam date, available study hours or current ability is assumed. Begin with the diagnostic and adapt to the actual notification/calendar and your accuracy. The default plan gives <strong>90–95% priority to prelims</strong>; tiny mains-overlap exercises are optional and limited.</p>
  <div class="three-grid">
    <article class="info-card"><span class="step">01</span><h3>Keep a small source stack</h3><p>One history reference, one polity reference, one Hindi book, one UP GK book and one solved PYQ compilation if needed. NCERT is a foundation/repair resource, not a demand to read classes 6–12 in full. Paid books are optional; links go to lawful catalogues, never pirated copies.</p></article>
    <article class="info-card"><span class="step">02</span><h3>Attempt, explain, revisit</h3><p>Practise text-based PYQ adaptations inside each day. Answers and explanations stay hidden until you reveal them. Source scans are secondary, because marked choices spoil practice. Revisit after 1, 7 and 21 days. A repeated question is retrieval practice, not fresh-mock proof.</p></article>
    <article class="info-card"><span class="step">03</span><h3>Make the pace realistic</h3><p>If you miss a day, resume the unfinished work; do not double tomorrow's load. Use revision days for a small backlog. At 2 hours/day, reduce first-pass reading and extend the cycle. Actual 3-hour simulations need a longer block, or an honestly labelled split attempt.</p></article>
  </div>
  <div class="table-wrap"><table><caption>Ordinary-day time budget (minutes)</caption><thead><tr><th scope="col">Block</th><th scope="col">4 hours</th><th scope="col">2 hours</th><th scope="col">Keep this outcome</th></tr></thead><tbody>
  <tr><th scope="row">GS</th><td>90</td><td>40</td><td>One named topic, one map/table/summary</td></tr>
  <tr><th scope="row">Hindi</th><td>45</td><td>25</td><td>One rule/category, a small example set</td></tr>
  <tr><th scope="row">PYQs + explanation</th><td>45</td><td>25</td><td>Fewer questions if needed; never remove explanation review</td></tr>
  <tr><th scope="row">Current affairs + UP</th><td>30</td><td>15</td><td>Five dated facts at most, with static connections</td></tr>
  <tr><th scope="row">Recall + errors</th><td>30</td><td>15</td><td>Delayed retrieval and the next repair task</td></tr>
  </tbody></table></div>
  <p class="callout"><strong>Full-paper days are different:</strong> 180 minutes for GS + Hindi together, then 60 minutes of triage. Detailed repair starts the next day. At 2 hours/day, split over two days and move the schedule forward; do not compress 3 hours into 2.</p>
</section>
<section id="scheme" class="section muted-section">
  <div class="section-heading"><p class="eyebrow">Syllabus source check · ${checked}</p><h2>Use the revised 2026 scheme</h2></div>
  <p><strong>Basis:</strong> advertisement A-4/E-1/2026 dated 26 October 2026; Appendix 2 and 3, PDF pages 7–8. The ${link("https://uppsc.up.nic.in/CandidatePages/Notifications.aspx","official UPPSC notification listing")} identifies the advertisement. The full eight-page document used here is a ${link("https://cdn-images.prepp.in/public/image/UPPSC_RO_ARO_2026_Notification_English_117a31a047ca12049e125a3823b586fd.pdf#page=7","Prepp-hosted notification mirror")}, <strong>not an UPPSC-hosted PDF</strong>. Official advertisement deep links can require a session; open UPPSC home → Notifications → the matching advertisement and confirm any later corrigendum.</p>
  <p class="callout">Some “2026 syllabus” pages still show <strong>two prelims papers and an old 400-mark mains</strong>. Do not use those summaries as the current scheme. A vacancy-bifurcation PDF is not the full syllabus. This website is study guidance, not application/eligibility advice.</p>
  <div class="two-grid"><article class="info-card"><h3>Prelims: one objective paper</h3><p>200 questions / 200 marks / 3 hours: 140 GS and 60 Hindi. Wrong/multiple-marked answers receive the notified one-third penalty; unanswered questions have no penalty. Use the instructions printed for your actual exam.</p><p><strong>GS scope:</strong> general science; Indian history and national movement; polity, economy and culture; agriculture, commerce and trade; population, ecology and urbanisation; world/Indian geography and natural resources; current national/international events; general intelligence; special UP knowledge of education, culture, agriculture, industry, trade, living and social traditions.</p></article>
  <article class="info-card" lang="hi"><h3>हिन्दी: छह क्षेत्र, हर क्षेत्र 10 प्रश्न</h3><p>विलोम शब्द; वाक्य/वर्तनी का अशुद्धि-शोधन; वाक्यांश के लिए एक शब्द; तत्सम–तद्भव; विशेष्य–विशेषण; पर्यायवाची।</p><p>रोज छोटा अभ्यास करें। सामान्य दिखने वाला शब्द भी अर्थ या प्रयोग में भ्रमित कर सकता है। पिछले प्रश्नों में नियम पहचानें, केवल चिह्नित विकल्प न याद करें। सामान्य अध्ययन अंग्रेज़ी या हिन्दी में पढ़ सकते हैं, पर हिन्दी का अभ्यास हिन्दी में ही करें।</p><p>नीचे छहों क्षेत्रों के वास्तविक प्रश्न-संदर्भ जुड़े हैं; नई सूचियों से पहले अपनी पुरानी त्रुटियाँ ठीक करें।</p></article></div>
  <p><strong>Mains:</strong> four descriptive papers, each 200 marks / 3 hours, total 800: GS I, GS II, General Hindi and Drafting, Hindi Essay. This cycle postpones dedicated mains work until prelims is secure. See the <a href="#mains">later roadmap</a>.</p>
</section>
<section id="daily" class="section">
  <div class="section-heading"><p class="eyebrow">Your daily workspace</p><h2>84 days, with the next task already chosen</h2><p>Open a day to read its five concrete tasks. Each PYQ block expands to real question/page links; materials sit beside the assigned reading.</p></div>
  <noscript><p class="callout">JavaScript is disabled. All 84 days, source links and native expand/collapse controls still work below. Progress tracking, date labels and filters need JavaScript.</p></noscript>
  <div id="storage-status" class="callout warning" role="status" hidden></div>
  <div class="planner enhanced-only">
    <div class="progress-head"><div><strong id="progress-label">0 of 84 days complete</strong><p class="small" id="task-progress">0 of 420 tasks complete</p></div><a class="button primary" id="resume" href="#day-1">Resume first unfinished day</a></div>
    <progress id="progress" max="420" value="0" aria-label="Completed study tasks">0%</progress>
    <div class="planner-controls"><label>Cycle start date<input id="start-date" type="date" aria-describedby="date-help"></label><label>Week<select id="week-filter"><option value="all">All 12 weeks</option>${weeks.map((w, i) => `<option value="${i+1}">Week ${i+1}: ${escape(w.title)}</option>`).join("")}</select></label><label>Show<select id="status-filter"><option value="all">All days</option><option value="unfinished">Unfinished days</option><option value="complete">Completed days</option></select></label><label>Find a topic<input id="search" type="search" placeholder="e.g. monsoon, हिन्दी, budget"></label></div>
    <p class="small" id="date-help">Optional start date adds calendar labels; it does not change the tasks, mark overdue work or assume an exam date. Progress is stored only in this browser, on this site. Clearing browser data removes it; local-file and hosted copies have separate storage.</p>
    <div class="toolbar"><button id="expand" type="button">Expand visible days</button><button id="collapse" type="button">Collapse visible days</button><button id="print" type="button">Print entire plan</button><button id="export" type="button">Export progress</button><label class="import-button">Import progress<input id="import" type="file" accept=".json,application/json"></label><button id="reset" type="button" class="quiet">Reset progress</button></div>
    <p class="small">Export contains only completion IDs and the optional start date. No names, notes or account data are collected. GitHub/linked sites have their own privacy policies.</p>
  </div>
  <nav class="week-nav" aria-label="Week shortcuts">${weeks.map((w,i) => `<a href="#week-${i+1}"><span>Week ${i+1}</span>${escape(w.title)}</a>`).join("")}</nav>
  <p id="filter-result" class="small enhanced-only" role="status">Showing all 84 days</p>
  <p id="no-results" class="callout" hidden>No matching days. Clear the search or select all weeks/days.</p>
  <div class="week-list">${weeks.map((week,i) => `<section class="week-block" id="week-${i+1}" aria-labelledby="week-title-${i+1}"><header class="week-heading"><div><p class="eyebrow">Week ${i+1} · Days ${i*7+1}–${i*7+7}</p><h3 id="week-title-${i+1}">${escape(week.title)}</h3></div><p>${escape(week.goal)}</p></header>${days.filter(day => day.week === i+1).map(renderDay).join("")}<p class="checkpoint"><strong>Week-end check:</strong> ${escape(week.checkpoint)} If recall is weak, repeat the smallest relevant block before adding new material.</p></section>`).join("")}</div>
</section>
<section id="method" class="section muted-section">
  <div class="section-heading"><p class="eyebrow">The work after an answer</p><h2>Review errors, not just scores</h2></div>
  <div class="three-grid">
    <article class="info-card"><h3>Before checking</h3><p>Write paper/file, question, your answer and confidence: known / reasoned / guessed / blank. Use a plain numbered answer sheet; do not peek at an annotated PDF's markings. Cover selections if possible. Already visible answers make the attempt a learning drill, not an unbiased diagnostic.</p></article>
    <article class="info-card"><h3>When reviewing</h3><p>Classify each error: concept, memory, question-reading, elimination/guessing or time. Write the correct rule and why each distractor fails. Use an authenticated official final key when available; this site does not provide one. A handwritten/coaching answer is not official. Verify with a trustworthy text/primary source; leave genuinely disputed questions unresolved.</p></article>
    <article class="info-card"><h3>After a delay</h3><p>Reattempt tomorrow, a week later and three weeks later. If the same rule fails twice, return to its short source section and make one comparison/diagram. Judge progress using accuracy and reduced repeat errors, not number of pages read or an invented “safe” score.</p></article>
  </div>
  <div class="table-wrap"><table><caption>Copy this error-log structure into your own private notebook</caption><thead><tr><th>Paper/file + Q</th><th>Topic + confidence</th><th>Error cause</th><th>Rule + source</th><th>Review queue</th></tr></thead><tbody><tr><td>Exact linked file and number</td><td>e.g. fundamental rights; guessed</td><td>Confused two provisions</td><td>Write the distinction and source location</td><td>+1 / +7 / +21 days; resolved or still uncertain</td></tr></tbody></table></div>
  <p><strong>Mocks:</strong> Weeks 5–8 have one full-paper session/week; Weeks 9–12 have two. Most later sessions are explicitly labelled <strong>retests</strong> of a limited lawful paper library. They measure retrieval and pacing, not fresh-paper readiness. Add an unseen, current 200-question / 180-minute mock from a lawful source you already use; check its syllabus and replace a scheduled retest rather than adding extra hours. No unverified commercial mock is recommended here.</p>
  <div class="score-box enhanced-only"><h3>Practice score calculator</h3><p class="small">Enter counts after resolving answers. Uses C − W/3; blanks have no penalty. This is a study estimate, not UPPSC's result or a cutoff prediction. Keep unresolved/disputed answers out and label any partial score.</p><form id="score-form"><label>Correct (0–200)<input id="correct" type="number" min="0" max="200" step="1" required></label><label>Wrong (0–200)<input id="wrong" type="number" min="0" max="200" step="1" required></label><button type="submit">Calculate</button></form><p id="score-result" role="status"></p></div>
  <p><strong>Paper-taking discipline:</strong> read the full stem, especially “not” and statement combinations; use two passes where helpful; reserve time for answer-sheet checking. Adjust GS/Hindi time from your practice evidence—there is no guaranteed attempt count. Multiple answers are penalised. Do not guess blindly to hit a target.</p>
  <p><strong>After Day 84:</strong> if the exam is still distant, keep one full paper/week plus repair, rolling CA and your weakest-topic cycle. If it is close, use the official date to taper new reading and prioritise recall/rest. If foundations remain weak, extend those weeks instead of pretending the entire syllabus is mastered.</p>
</section>
<section id="practice" class="section">
  <div class="section-heading"><p class="eyebrow">Questions first · answers hidden</p><h2>Text practice bank</h2></div>
  <p><strong>${questions.length} selected PYQ adaptations</strong> across GS and all six Hindi areas. These rephrase inspected 2025 questions/concepts with independently written options and explanations; they are <strong>not verbatim extraction of the full paper</strong>. Some simplify a matching/statement question into a focused concept question. Every card retains its exact original-file/page/question reference. This avoids bulk reproduction and makes marked scans unnecessary for the default practice experience.</p>
  <p>Choose an option and use <strong>Reveal answer</strong> / <strong>उत्तर दिखाएँ</strong>. Use the same button to hide it again. Answers are editorial, independently reasoned from the named study references, <strong>not an authenticated official key</strong>. No answer is preselected. Your choices are not uploaded or stored; day-task completion is separate.</p>
  <details class="practice-library"><summary>Open all ${questions.length} selected text questions</summary>${questions.map(q => renderQuestion(q,"bank")).join("")}</details>
  <p class="small">Daily cards select matching questions from this bank. A short embedded drill must not be reported as a full 200-question / 180-minute mock. <a href="#papers">Original paper files remain secondary references</a>.</p>
</section>
<section id="papers" class="section">
  <div class="section-heading"><p class="eyebrow">Open the actual papers</p><h2>Previous-year paper library</h2></div>
  <p>These are secondary provenance links, <strong>not the default practice surface</strong>; scans may already show selected answers. Use the hidden-answer <a href="#practice">text cards</a> instead for practice. The ${link("https://uppsc.up.nic.in/OuterPages/PreQuesPapers.aspx","official UPPSC previous-paper portal")} is preferred, but returned “Please try again after sometime” during verification. If a direct link fails, open ${link("https://uppsc.up.nic.in/","UPPSC home")} → previous question papers. The files below are <strong>third-party mirrors</strong>; none is represented as an official answer key.</p>
  <details class="secondary-paper"><summary>Show original-paper download references (may contain marked answers)</summary><div class="paper-grid">${Object.entries(papers).map(([id,paper]) => `<article class="paper-card" id="paper-${id}"><p class="eyebrow">Third-party PDF mirror</p><h3>${escape(paper.name)}</h3><p>${escape(paper.note)}</p><div>${paperLinks(id)}</div></article>`).join("")}</div></details>
  <p class="callout"><strong>2024 cancellation:</strong> the 11 February 2024 sitting was cancelled. ${link("https://www.careerpower.in/uppsc-ro-aro-previous-year-question-papers.html","The archive explains the cancellation and supplies additional papers")}. A cancelled paper is optional question practice, not a valid official-score benchmark. Its older exam-pattern summary should not override the revised notification.</p>
  <details><summary>Why question numbers differ between websites</summary><p>Question order may differ between booklet series, reordered scans and mirrors. We found even files labelled UNHSIV-01 with different order. The daily links bind to the <strong>exact 34-page CareerPower PDF</strong>, not just a year/booklet label. Match the question topic as well as the number. PDF page numbers here count from the first page; they are not a guess about another scan.</p></details>
  <details><summary>What is verified, and what remains uncertain?</summary><p>The current advertisement listing and full mirrored notification were inspected; the 2025 primary practice file's question numbers/pages were read, with Hindi pages visually checked. Paper/resource links were checked during publication. Third-party scans may contain annotations or OCR mistakes. Stable official full-advertisement and final-key download links were not established; no disputed answers or unverified topic weights are supplied. Recheck live portals for changes after ${checked}.</p></details>
</section>
<section id="materials" class="section muted-section">
  <div class="section-heading"><p class="eyebrow">Selective reading, not an endless book list</p><h2>Study materials and how to use them</h2></div>
  <p><strong>Start free:</strong> NCERT, official Constitution, budgets, Census, PIB, state portals and the linked papers. If you own Laxmikanth, Spectrum or a Hindi/UP GK book, use that edition selectively. Commercial catalogue links are optional purchases, not free PDFs. Existing Lucent GK can help revise science/ancient/medieval facts, but it is not necessary; use NCERT here rather than an unverified download or seller. Do not buy every item below.</p>
  <div class="resource-grid">${Object.entries(resources).map(([id,r]) => `<article class="resource-card" id="material-${id}"><p class="eyebrow">${escape(r.type)}</p><h3>${link(r.url,r.name)}</h3><p${id === "hindi" ? ' lang="hi"' : ""}>${escape(r.use)}</p></article>`).join("")}</div>
</section>
<section id="mains" class="section">
  <div class="section-heading"><p class="eyebrow">Later, not a distraction today</p><h2>The mains bridge and post-prelims roadmap</h2></div>
  <p>During this prelims cycle, keep only one optional <strong>≤30-minute/week</strong> overlap exercise inside revision: a 75-word original explanation or a five-line official-letter outline. Do not add daily essays, full descriptive tests or separate accounts preparation for RO General. Post-specific requirements belong to the official notification, not this general study routine.</p>
  <div class="table-wrap"><table><caption>Revised mains: 800 marks, four 3-hour descriptive papers</caption><thead><tr><th>Paper</th><th>Structure</th><th>Preparation after prelims</th></tr></thead><tbody>
    <tr><th>GS I · 200</th><td>10 × 8 marks / 75 words + 10 × 12 marks / 125 words</td><td>History/art/culture, modern 1757–1947, post-independence to 1965, society, India/UP geography, environment/disasters, science/technology.</td></tr>
    <tr><th>GS II · 200</th><td>Same short/long answer structure</td><td>Constitution/polity, governance, economy/agriculture, ethics/integrity and regional/national/international current affairs.</td></tr>
    <tr><th>General Hindi and Drafting · 200</th><td>Eight questions; some internal choice</td><td>Comprehension/title/explanation/précis; tabular summary and official correspondence; administrative/commercial translation; idioms/proverbs; grammar/punctuation/correction; sounds, vocabulary/word formation and computer basics.</td></tr>
    <tr><th>Hindi Essay · 200</th><td>One essay from each section: 800 words / 80 marks; 1,200 words / 120 marks</td><td>Section I: science/environment/technology, economy, agriculture/industry/trade, disasters. Section II: literature/culture, social/political issues, national/international events, development schemes/projects.</td></tr>
  </tbody></table></div>
  <div class="three-grid">
    <article class="info-card"><h3>Stage 1 · Convert notes into answers</h3><p>Use the actual time until mains, not an assumed fixed gap. Convert each prelims table into a short issue–evidence–conclusion note; add UP examples. Begin with one 75-word and one 125-word original answer/day, increasing only when content and structure improve. Cover society, post-independence and ethics gaps explicitly.</p><p>${resourceLinks(["ncert","constitution","ndma","budget"])}</p></article>
    <article class="info-card" lang="hi"><h3>Stage 2 · हिन्दी और आलेखन</h3><p>गद्यांश का शीर्षक, व्याख्या और संक्षेपण; शासकीय/अर्द्धशासकीय पत्र, कार्यालय आदेश, परिपत्र, अनुस्मारक, ज्ञापन, विज्ञप्ति, टिप्पण और प्रतिवेदन का अभ्यास करें। अर्थ सुरक्षित रखें, अनावश्यक शब्द हटाएँ। प्रशासनिक व वाणिज्यिक शब्दावली का दोनों दिशाओं में अनुवाद और मुहावरे/लोकोक्तियों का वाक्य-प्रयोग करें।</p><p>${resourceLinks(["hindi","cstt"])}</p></article>
    <article class="info-card"><h3>Stage 3 · Timed papers and essays</h3><p>Plan essays before writing: thesis, dimensions, evidence/UP example, counterpoint and constructive conclusion. Practise the notified 800/1,200-word lengths. Gradually reach full 3-hour descriptive tests and review relevance, word limits, handwriting/legibility and completion. Older mains papers are style practice, not the revised 800-mark template.</p><p>${link("https://www.careerpower.in/blog/wp-content/uploads/2025/07/17175228/UPPSC-RO-ARO-Mains-Exam-2014-GS-Paper.pdf","2014 mains GS mirror")} · ${link("https://www.careerpower.in/blog/wp-content/uploads/2025/07/17175243/UPPSC-RO-ARO-Mains-Exam-2014-Hindi-Paper.pdf","2014 mains Hindi mirror")}</p></article>
  </div>
</section>
</main>
<footer><p><strong>UPPSC RO/ARO Study Companion</strong> · Original study guidance with linked sources, not a solved-paper publisher.</p><p>Source check: ${checked}. Verify UPPSC updates/corrigenda. No guaranteed outcome, cutoff, topic weight or exam date. Public educational content only; no candidate information.</p><p>${link("https://github.com/kunal394/uppsc-ro-study-plan","Public repository")} · GitHub Pages hosting is free for this public site; optional books and any external courses are separate.</p></footer>
</body></html>`;
await writeFile(new URL("./index.html", import.meta.url), html);
console.log(`Built index.html with ${days.length} days and ${Object.keys(resources).length} resource entries.`);

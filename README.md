# UPPSC RO/ARO Study Companion

A descriptive, prelims-first **84-day scalable study cycle**, not a countdown
to an assumed exam date. Includes daily GS/Hindi tasks, concrete outputs,
material links, text-based PYQ adaptations with hidden/revealable answers,
exact original question/page references, current affairs, UP GK,
spaced revision, full-paper practice and a later mains roadmap.

**Website:** https://kunal394.github.io/uppsc-ro-study-plan/

Open `index.html` directly in a browser, or visit the hosted site. The hierarchy
is **home → prelims → subject → topic → practice**, with a separate
**plan → week → day** route. Each topic has a granular subtopic checklist,
original explanations/example, named reading sections and closed-book learning
objectives. Daily work starts with learning, not only question drills.

All study
content is static HTML and readable without JavaScript. JavaScript adds week/
topic/status filters, calendar labels, local checkboxes, progress backup/import,
a practice score calculator and a dedicated full-plan print view. No backend, account,
tracking scripts, paid hosting, external fonts or third-party JavaScript.

The embedded question bank is a **selected set of independently worded PYQ
adaptations**, not verbatim extraction of all 200 questions. Answers/explanations
are editorial, not an official key. Original marked scans are secondary source
references. A short embedded drill is not a full-paper mock.

## Content and provenance

- 56 prelims learning guides and four focused mains guides. The expanded
  subtopics are editorial guidance, distinct from official broad headings.
- Dedicated `analysis.html` compares complete exclusive primary
  classifications of all 140 GS questions in each exact 2025/2021 paper
  (280 questions); `analysis/2025.html` and `analysis/2021.html` expose
  the per-question audit. Counts are editorial, not official subject quotas.
- Sitting/cycle distinctions: July 2025 is the 2023 recruitment re-exam;
  December 2021 is the 2021 cycle; September 2020 is the 2016 recruitment
  re-exam. The 2020 paper is linked but not classified here.
- Official numeric category/post/stage-specific historical cutoffs and
  historical Hindi subdivision counts remain **unverified**. The evidence
  section states the gap and links the result/archive portals rather than
  substituting coaching estimates or inventing a safe score.

- Scheme basis: UPPSC advertisement **A-4/E-1/2026, 26 October 2026**,
  Appendix 2/3, PDF pages 7–8: one 200-question prelims paper (140 GS +
  60 Hindi), 200 marks, 3 hours, one-third wrong-answer penalty; four
  descriptive mains papers, 800 marks total.
- Official listing verified; the inspected full notification is a transparently
  labelled Prepp mirror. A stable official full-advertisement download and
  authenticated final answer-key link were not established.
- Daily locators bind to the **exact 34-page CareerPower 2025 PDF** linked
  in the website. Other mirrors can reorder questions even with the same
  printed booklet code. Handwritten/boxed selections are **not official keys**.
- Papers are externally linked, not reproduced/hosted here. Paid-book links
  go to publisher catalogues; official free alternatives are provided.
- Old current-affairs questions retain their historical dates. Later full-paper
  sessions are explicitly labelled retests; familiarity is not unseen readiness.
- Source/link check: **22 November 2026**. Recheck UPPSC updates/corrigenda.
  No exam date, cutoff, topic weight or guaranteed outcome is invented.

## Development

Requires Node.js 18+; no packages to install.

```sh
npm run build
npm test
```

Edit daily content in `plan.mjs`, topic lessons in `learning.mjs`, question
adaptations in `questions.mjs`, paper ledgers in `analysis.mjs` and layout in
`build.mjs`; run the build and commit all generated HTML pages. `styles.css` controls
responsive/print styling; `app.js` is progressive enhancement. Serve repository
root for browser testing, for example `python3 -m http.server 8000`.

GitHub Pages serves `main` at repository root; `.nojekyll` preserves plain static
assets. No paid domain is needed.

Old home-page `#day-N` / `#week-N` bookmarks redirect to focused pages with
JavaScript enabled. Without JavaScript, use the visible week/day navigation;
reading and native hidden-answer disclosure still work. Progress retains the
existing `uppsc-ro-study-v1` storage key and backup schema across all pages.

## Privacy and progress

Only educational material is public. The site collects no candidate identity,
contact details, application documents, employment information or transcripts.
Completion IDs and an optional cycle start date stay in browser localStorage;
export/import transfers only these fields. Clearing browser data removes
progress. Hosted/local-file origins and different browsers do not share it.
GitHub and external study sites have their own access logs/privacy policies.
Do not commit personal progress backups or notes.

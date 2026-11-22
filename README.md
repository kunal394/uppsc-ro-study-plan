# UPPSC RO/ARO Study Companion

A descriptive, prelims-first **84-day scalable study cycle**, not a countdown
to an assumed exam date. Includes daily GS/Hindi tasks, concrete outputs,
material links, text-based PYQ adaptations with hidden/revealable answers,
exact original question/page references, current affairs, UP GK,
spaced revision, full-paper practice and a later mains roadmap.

**Website:** https://kunal394.github.io/uppsc-ro-study-plan/

Open `index.html` directly in a browser, or visit the hosted site. All study
content is static HTML and readable without JavaScript. JavaScript adds week/
topic/status filters, calendar labels, local checkboxes, progress backup/import,
a practice score calculator and full-plan printing. No backend, account,
tracking scripts, paid hosting, external fonts or third-party JavaScript.

The embedded question bank is a **selected set of independently worded PYQ
adaptations**, not verbatim extraction of all 200 questions. Answers/explanations
are editorial, not an official key. Original marked scans are secondary source
references. A short embedded drill is not a full-paper mock.

## Content and provenance

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

Edit editorial content in `plan.mjs`, question adaptations in `questions.mjs`
and the static layout in `build.mjs`;
run the build and commit the generated `index.html`. `styles.css` controls
responsive/print styling; `app.js` is progressive enhancement. Serve repository
root for browser testing, for example `python3 -m http.server 8000`.

GitHub Pages serves `main` at repository root; `.nojekyll` preserves plain static
assets. No paid domain is needed.

## Privacy and progress

Only educational material is public. The site collects no candidate identity,
contact details, application documents, employment information or transcripts.
Completion IDs and an optional cycle start date stay in browser localStorage;
export/import transfers only these fields. Clearing browser data removes
progress. Hosted/local-file origins and different browsers do not share it.
GitHub and external study sites have their own access logs/privacy policies.
Do not commit personal progress backups or notes.

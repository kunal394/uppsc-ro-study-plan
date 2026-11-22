import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { runInNewContext } from "node:vm";
import { days, weeks, papers, resources, pyqGroups, paperURL } from "../plan.mjs";
import { questions } from "../questions.mjs";
const require = createRequire(import.meta.url);
const { validateState, validDate, dateForDay, score } = require("../app.js");

test("84 distinct progressive days have material and actual PYQ links", () => {
  assert.equal(weeks.length, 12);
  assert.equal(days.length, 84);
  assert.deepEqual(days.map(d => d.day), Array.from({ length: 84 }, (_, i) => i + 1));
  for (const day of days) {
    assert.ok(day.reading.length > 100, `Day ${day.day}: substantive reading`);
    assert.ok(day.output.length > 40, `Day ${day.day}: concrete output`);
    assert.ok(day.materials.length);
    assert.ok(day.groups.length);
    for (const resource of day.materials) assert.ok(resources[resource], resource);
    for (const group of day.groups) assert.ok(pyqGroups[group]?.refs.length, group);
    if (day.hindi[0] !== "mixed") assert.ok(pyqGroups[day.hindi[0]]?.refs.length);
    if (day.paper) assert.ok(papers[day.paper]?.urls.length);
  }
});

test("full-paper sessions follow the one/two-per-week structure and link both old sections", () => {
  for (let week = 1; week <= 12; week++) {
    const count = days.filter(d => d.week === week && d.subject === "Mock").length;
    assert.equal(count, week < 5 ? 0 : week < 9 ? 1 : 2, `Week ${week}`);
  }
  assert.equal(days[0].paper, "p2021");
  for (const id of ["p2020", "p2021", "p2013", "p2014"]) assert.equal(papers[id].urls.length, 2);
});

test("locators bind to the exact file and valid page/question ranges", () => {
  assert.equal(papers.p2025.urls[0], paperURL);
  for (const [name, group] of Object.entries(pyqGroups)) {
    assert.ok(group.scope.length > 25, name);
    for (const [page, qs, label] of group.refs) {
      assert.ok(page >= 2 && page <= 33, name);
      assert.ok(label);
      for (const number of qs.match(/\d+/g).map(Number)) assert.ok(number >= 1 && number <= 200);
    }
  }
});

test("generated HTML includes all content without JavaScript and has no broken local anchors", async () => {
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
  assert.equal((html.match(/class="day-card"/g) || []).length, 84);
  assert.equal((html.match(/data-task="/g) || []).length, 420);
  const ids = Array.from(html.matchAll(/\bid="([^"]+)"/g), m => m[1]);
  assert.equal(new Set(ids).size, ids.length, "IDs are unique");
  for (const match of html.matchAll(/href="#([^"]+)"/g)) assert.ok(ids.includes(match[1]), match[1]);
  for (const day of days) {
    const card = html.split(`id="day-${day.day}"`)[1].split('<div class="day-actions')[0];
    assert.ok(card.includes("https://"), `Day ${day.day}`);
    if (day.paper) {
      for (const url of papers[day.paper].urls) assert.ok(card.includes(url), `Day ${day.day}: assigned paper`);
    } else {
      assert.ok(card.includes("PYQ") && card.includes("#page="), `Day ${day.day}: direct page locators`);
    }
  }
});

test("progress import rejects malformed/cross-site IDs and excludes unknown personal fields", () => {
  const valid = { version: 1, startDate: "2026-11-22", done: ["1-gs", "84-recall", "1-gs"], name: "not retained" };
  assert.deepEqual(validateState(valid), { version: 1, startDate: "2026-11-22", done: ["1-gs", "84-recall"] });
  for (const invalid of [null, {}, { ...valid, version: 2 }, { ...valid, done: ["85-gs"] },
    { ...valid, done: ["01-gs"] }, { ...valid, done: ["1-secret"] }, { ...valid, done: [1] },
    { ...valid, startDate: "2026-02-30" }]) assert.throws(() => validateState(invalid));
});

test("calendar labels preserve local-date intent across leap days and timezone boundaries", () => {
  assert.equal(validDate("2024-02-29"), true);
  assert.equal(validDate("2026-02-29"), false);
  assert.equal(validDate("2026-13-01"), false);
  assert.equal(dateForDay("2024-02-28", 3), "2024-03-01");
  assert.equal(dateForDay("2026-11-22", 84), "2027-02-13");
  assert.throws(() => dateForDay("", 1));
  assert.throws(() => dateForDay("2026-11-22", 85));
});

test("score uses exact one-third penalty and rejects impossible counts", () => {
  assert.deepEqual(score(120, 30), { marks: 110, attempted: 150, accuracy: 80 });
  assert.equal(score(0, 3).marks, -1);
  assert.equal(score(0, 0).accuracy, null);
  assert.throws(() => score(180, 30));
  assert.throws(() => score(-1, 0));
  assert.throws(() => score(1.5, 0));
});

test("adapted question bank covers every assigned category with valid editorial answers", () => {
  assert.ok(questions.length >= 60);
  assert.equal(new Set(questions.map(q => q.id)).size, questions.length);
  for (const group of Object.keys(pyqGroups)) assert.ok(questions.some(q => q.groups.includes(group)), group);
  for (const q of questions) {
    assert.equal(q.options.length, 4);
    assert.equal(new Set(q.options).size, 4);
    assert.ok(Number.isInteger(q.correct) && q.correct >= 0 && q.correct <= 3);
    assert.ok(q.explanation.length > 40);
    assert.ok(resources[q.source]);
    assert.ok(q.number >= 1 && q.number <= 200 && q.page >= 2 && q.page <= 33);
  }
});

test("every rendered answer starts hidden and has an explicit accessible reveal control", async () => {
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
  const controls = Array.from(html.matchAll(/class="answer-toggle enhanced-only" aria-expanded="false" aria-controls="([^"]+)"/g));
  assert.ok(controls.length > 84);
  for (const control of controls) {
    assert.ok(html.includes(`class="question-answer" id="${control[1]}" hidden`), control[1]);
  }
  assert.equal((html.match(/type="radio"[^>]*checked/g) || []).length, 0);
  assert.ok(html.includes("not verbatim extraction of the full paper"));
});

test("one activation reveals an answer exactly once even with multiple completion inputs", async () => {
  class Element {
    constructor() {
      this.listeners = {};
      this.value = "";
      this.hidden = true;
      this.dataset = {};
      this.attributes = {};
      this.classList = { add() {}, toggle() {} };
    }
    addEventListener(type, handler) {
      (this.listeners[type] ||= []).push(handler);
    }
    getAttribute(name) { return this.attributes[name]; }
    setAttribute(name, value) { this.attributes[name] = value; }
    closest() { return { getAttribute: () => "en" }; }
    click() { (this.listeners.click || []).forEach(handler => handler()); }
  }
  const elements = new Map();
  const get = id => {
    if (!elements.has(id)) elements.set(id, new Element());
    return elements.get(id);
  };
  const button = new Element();
  button.attributes["aria-controls"] = "test-answer";
  button.attributes["aria-expanded"] = "false";
  const inputs = ["1-gs", "1-hindi", "1-pyq"].map(id => {
    const input = new Element();
    input.dataset.task = id;
    return input;
  });
  const storage = new Map();
  const document = {
    getElementById: get,
    querySelectorAll: selector => selector === "[data-task]" ? inputs :
      selector === ".answer-toggle" ? [button] : [],
    documentElement: { classList: { add() {} } },
    addEventListener() {}
  };
  const window = {
    location: { hash: "" },
    localStorage: { getItem: key => storage.get(key), setItem: (key, value) => storage.set(key, value) },
    addEventListener() {}
  };
  const app = await readFile(new URL("../app.js", import.meta.url), "utf8");
  runInNewContext(app, { document, window, console, Intl });
  assert.equal(get("test-answer").hidden, true);
  button.click();
  assert.equal(get("test-answer").hidden, false);
  assert.equal(button.getAttribute("aria-expanded"), "true");
  assert.equal(button.textContent, "Hide answer");
  button.click();
  assert.equal(get("test-answer").hidden, true);
  assert.equal(button.getAttribute("aria-expanded"), "false");
  inputs[0].checked = true;
  inputs[0].listeners.change[0]();
  assert.deepEqual(JSON.parse(storage.get("uppsc-ro-study-v1")).done, ["1-gs"]);
  assert.equal(get("test-answer").hidden, true, "progress changes never reveal answers");
});

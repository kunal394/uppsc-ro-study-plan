import test from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { dirname, resolve, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { runInNewContext } from "node:vm";
import { days, weeks, papers, resources, pyqGroups, paperURL } from "../plan.mjs";
import { questions } from "../questions.mjs";
import { topics, subjects, mainsTopics, topicIDsForDay, hindiTopicsForDay, topicQuestionIDs } from "../learning.mjs";
import { analyses, categories, countsFor } from "../analysis.mjs";
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

const root = fileURLToPath(new URL("..", import.meta.url));
async function htmlFiles(directory=root) {
  const entries=await readdir(directory,{withFileTypes:true});
  const files=[];
  for(const entry of entries) {
    if(entry.name.startsWith(".") || entry.name==="node_modules") continue;
    const path=resolve(directory,entry.name);
    if(entry.isDirectory()) files.push(...await htmlFiles(path));
    else if(entry.name.endsWith(".html")) files.push(path);
  }
  return files;
}

test("focused static hierarchy has valid routes, unique IDs and local anchors", async () => {
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
  assert.ok(html.length<20000,"home is compact");
  assert.equal((html.match(/data-task="/g)||[]).length,0,"home does not dump day tasks");
  const cache=new Map(await Promise.all((await htmlFiles()).map(async path=>[path,await readFile(path,"utf8")])));
  assert.ok(cache.size>200,"real focused page hierarchy");
  for(const [path,content] of cache) {
    const ids=Array.from(content.matchAll(/\bid="([^"]+)"/g),m=>m[1]);
    assert.equal(new Set(ids).size,ids.length,relative(root,path));
    assert.ok(content.includes('href="#main"'));
    for(const [,href] of content.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
      if(/^(https?:|data:)/.test(href)) continue;
      const [target,anchor]=href.split("#");
      const destination=target?resolve(dirname(path),target):path;
      assert.ok(!relative(root,destination).startsWith(".."),href);
      const destContent=cache.get(destination)??await readFile(destination,"utf8");
      if(anchor) assert.ok(destContent.includes(`id="${anchor}"`),`${relative(root,path)} -> ${href}`);
    }
  }
  for (const day of days) {
    const card=cache.get(resolve(root,`days/day-${String(day.day).padStart(2,"0")}.html`));
    assert.equal((card.match(/data-task="/g)||[]).length,5);
    assert.ok(card.includes("https://"), `Day ${day.day}`);
    if (day.paper) {
      for (const url of papers[day.paper].urls) assert.ok(card.includes(url), `Day ${day.day}: assigned paper`);
    } else {
      assert.ok(card.includes("PYQ") && card.includes("#page="), `Day ${day.day}: direct page locators`);
      assert.ok(card.indexOf("Learn the topic before solving")<card.indexOf('class="practice-question"'));
    }
  }
});

test("topic curriculum and daily learning links cover every subject and Hindi area", () => {
  assert.equal(new Set(topics.concat(mainsTopics).map(t=>t.id)).size,topics.length+mainsTopics.length);
  for(const subject of Object.keys(subjects)) assert.ok(topics.some(t=>t.subject===subject),subject);
  for(const t of topics.concat(mainsTopics)) {
    assert.ok(t.subtopics.length>=5,t.id);
    assert.ok(t.lesson.length>=2 && t.lesson.every(p=>p.length>100),t.id);
    assert.ok(t.example.length>100,t.id);
    assert.ok(t.checks.length>=3,t.id);
    for(const r of t.readings) assert.ok(resources[r.resource] && r.sections.length,t.id);
  }
  for(const d of days) {
    assert.ok(topicIDsForDay(d).length,d.day);
    for(const id of topicIDsForDay(d).concat(hindiTopicsForDay(d))) assert.ok(topics.some(t=>t.id===id),id);
  }
  for(const [topic,ids] of Object.entries(topicQuestionIDs)) {
    assert.ok(topics.some(t=>t.id===topic),topic);
    for(const id of ids) assert.ok(questions.some(q=>q.id===id),id);
  }
});

test("Hindi is discoverable from home, navigation, plan and materials with a complete learning hub", async () => {
  const hub=await readFile(resolve(root,"subjects/hindi.html"),"utf8");
  for(const anchor of ["hindi-breakdown","hindi-resources","hindi-daily"]) assert.ok(hub.includes(`id="${anchor}"`));
  assert.equal((hub.match(/<strong>10 प्रश्न \/ 10 अंक<\/strong>/g)||[]).length,6);
  for(const topic of topics.filter(t=>t.subject==="hindi")) {
    assert.ok(hub.includes(`../topics/${topic.id}.html`),topic.id);
    assert.ok(hub.includes(`../practice/${topic.id}.html`),topic.id);
    for(const subtopic of topic.subtopics) assert.ok(hub.includes(subtopic),subtopic);
  }
  assert.ok(hub.includes(resources.hindi.url));
  assert.ok(hub.includes(resources.ncert.url));
  assert.ok(hub.includes(resources.cstt.url));
  for(let n=1;n<=7;n++) assert.ok(hub.includes(`../days/day-${String(n).padStart(2,"0")}.html`));
  for(const file of ["index.html","plan.html","resources.html","days/day-03.html"]) {
    const html=await readFile(resolve(root,file),"utf8");
    const nav=html.split('<nav aria-label="Main navigation">')[1].split("</nav>")[0];
    assert.ok(nav.includes("सामान्य हिन्दी")&&nav.includes("subjects/hindi.html"),file);
    assert.ok(html.includes("subjects/hindi.html#hindi-resources"),`${file}: direct resources link`);
  }
});

test("published distribution comes from complete exclusive exact-file ledgers", () => {
  for(const x of analyses) {
    assert.equal(x.rows.length,140,x.year);
    assert.deepEqual(x.rows.map(r=>r.number),Array.from({length:140},(_,i)=>i+1));
    for(const r of x.rows) assert.ok(categories[r.primary] && r.label && r.page>=2 && r.page<=x.pages);
    assert.equal(Object.values(countsFor(x)).reduce((a,b)=>a+b,0),140);
  }
  const x=analyses.find(a=>a.year===2025);
  assert.equal(x.url,paperURL);
  for(const q of questions.filter(q=>q.number<=140)) assert.equal(x.rows[q.number-1].page,q.page,q.id);
  assert.equal(x.rows[128].primary,"geography","Q129 is an ocean current, not dated news");
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
  let total=0;
  for(const path of await htmlFiles()) {
    const html=await readFile(path,"utf8");
    const controls=Array.from(html.matchAll(/class="answer-toggle enhanced-only" type="button" aria-expanded="false" aria-controls="([^"]+)"/g));
    total+=controls.length;
    for(const control of controls) assert.ok(html.includes(`class="question-answer" id="${control[1]}" hidden`),control[1]);
    assert.equal((html.match(/type="radio"[^>]*checked/g)||[]).length,0);
    if(controls.length) assert.ok(html.includes("<noscript><details"),"native hidden-answer fallback");
  }
  assert.ok(total>84);
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

test("focused-page progress is global and import/reset/export retain safety guards", async () => {
  const elements=new Map();
  for(const id of ["storage-status","progress-label","task-progress","progress","resume","start-date","import","export","reset"]) {
    elements.set(id,{listeners:{},value:"",dataset:{dayBase:"days/"},classList:{toggle(){}},
      addEventListener(event,fn){this.listeners[event]=fn;}});
  }
  const state={version:1,startDate:"2024-02-28",done:["1-gs","1-hindi","1-pyq","1-current","1-recall"]};
  const storage=new Map([["uppsc-ro-study-v1",JSON.stringify(state)]]);
  let approved=false,confirmations=0,exported;
  const download={click(){},remove(){}};
  const document={
    getElementById:id=>elements.get(id)||null,querySelectorAll:()=>[],
    documentElement:{classList:{add(){}}},addEventListener(){},
    body:{appendChild(){}},createElement:()=>download
  };
  const window={
    location:{hash:"",pathname:"/plan.html"},addEventListener(){},setTimeout(fn){fn();},
    confirm(){confirmations++;return approved;},
    localStorage:{getItem:key=>storage.get(key),setItem:(key,value)=>storage.set(key,value)}
  };
  const app=await readFile(new URL("../app.js",import.meta.url),"utf8");
  runInNewContext(app,{document,window,Intl,console:{warn(){}},Blob:class{constructor(parts){this.parts=parts;}},
    URL:{createObjectURL(blob){exported=blob.parts[0];return "blob:test";},revokeObjectURL(){}}});
  assert.equal(elements.get("progress-label").textContent,"1 of 84 days complete","no rendered day cards required");
  assert.equal(elements.get("resume").href,"days/day-02.html");
  const importFile=async content=>elements.get("import").listeners.change({
    target:{value:"test.json",files:[{size:content.length,text:async()=>content}]}
  });
  await importFile('{"version":2}');
  assert.equal(confirmations,0,"invalid file never reaches replacement confirmation");
  assert.equal(storage.get("uppsc-ro-study-v1"),JSON.stringify(state));
  const replacement={version:1,startDate:"",done:["84-recall"]};
  await importFile(JSON.stringify(replacement));
  assert.equal(storage.get("uppsc-ro-study-v1"),JSON.stringify(state),"cancel preserves progress");
  approved=true;
  await importFile(JSON.stringify(replacement));
  assert.deepEqual(JSON.parse(storage.get("uppsc-ro-study-v1")),replacement);
  elements.get("export").listeners.click();
  assert.deepEqual(JSON.parse(exported),replacement);
  assert.equal(download.download,"uppsc-study-progress.json");
  approved=false;
  elements.get("reset").listeners.click();
  assert.deepEqual(JSON.parse(storage.get("uppsc-ro-study-v1")),replacement);
  approved=true;
  elements.get("reset").listeners.click();
  assert.deepEqual(JSON.parse(storage.get("uppsc-ro-study-v1")),{version:1,startDate:"",done:[]});
});

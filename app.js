(function () {
  "use strict";
  var KEY = "uppsc-ro-study-v1";
  var kinds = ["gs", "hindi", "pyq", "current", "recall"];

  function validDate(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    var date = new Date(value + "T12:00:00Z");
    return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
  }

  function validateState(value) {
    if (!value || value.version !== 1 || !Array.isArray(value.done) ||
        typeof value.startDate !== "string" || (value.startDate && !validDate(value.startDate))) {
      throw new Error("Invalid progress file: expected version 1, a completion list and a valid optional start date.");
    }
    if (value.done.length > 420 || value.done.some(function (id) {
      if (typeof id !== "string") return true;
      var match = /^([1-9]\d?)-(gs|hindi|pyq|current|recall)$/.exec(id);
      return !match || Number(match[1]) > 84;
    })) {
      throw new Error("Invalid progress file: completion IDs must belong to Days 1–84.");
    }
    return { version: 1, startDate: value.startDate, done: Array.from(new Set(value.done)) };
  }

  function dateForDay(startDate, day) {
    if (!validDate(startDate) || !Number.isInteger(day) || day < 1 || day > 84) {
      throw new Error("A valid start date and day between 1 and 84 are required.");
    }
    var date = new Date(startDate + "T12:00:00Z");
    date.setUTCDate(date.getUTCDate() + day - 1);
    return date.toISOString().slice(0, 10);
  }

  function score(correct, wrong) {
    if (![correct, wrong].every(function (n) { return Number.isInteger(n) && n >= 0; }) || correct + wrong > 200) {
      throw new Error("Use whole numbers from 0 to 200; correct + wrong cannot exceed 200.");
    }
    return { marks: correct - wrong / 3, attempted: correct + wrong,
      accuracy: correct + wrong ? correct / (correct + wrong) * 100 : null };
  }

  if (typeof module !== "undefined" && module.exports) {
    module.exports = { validateState: validateState, validDate: validDate, dateForDay: dateForDay, score: score };
  }
  if (typeof document === "undefined") return;

  var state = { version: 1, startDate: "", done: [] };
  var cards = Array.from(document.querySelectorAll(".day-card"));
  var inputs = Array.from(document.querySelectorAll("[data-task]"));
  var weekFilter = document.getElementById("week-filter");
  var statusFilter = document.getElementById("status-filter");
  var search = document.getElementById("search");
  var startInput = document.getElementById("start-date");
  var statusBox = document.getElementById("storage-status");
  var storageAvailable = true;
  var searchText = new Map(cards.map(function (card) { return [card, card.textContent.toLocaleLowerCase()]; }));

  function announce(message, isError) {
    statusBox.textContent = message;
    statusBox.hidden = false;
    statusBox.classList.toggle("warning", Boolean(isError));
  }

  function save() {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(state));
      if (!storageAvailable) {
        announce("Progress saving is available again. Export a backup before clearing browser data.", false);
      }
      storageAvailable = true;
      return true;
    } catch (error) {
      storageAvailable = false;
      console.warn("Local progress could not be saved.", error);
      announce("Progress cannot be saved in this browser. Checkboxes still work for this visit; export a backup before leaving.", true);
      return false;
    }
  }

  try {
    var stored = window.localStorage.getItem(KEY);
    if (stored) state = validateState(JSON.parse(stored));
  } catch (error) {
    console.warn("Saved progress could not be loaded.", error);
    announce("Saved progress could not be loaded. This visit starts empty; import a valid backup if you have one. No saved data has been overwritten yet.", true);
  }

  function applyFilters() {
    var term = search.value.trim().toLocaleLowerCase();
    var shown = 0;
    cards.forEach(function (card) {
      var complete = card.classList.contains("is-complete");
      var matches = (weekFilter.value === "all" || weekFilter.value === card.dataset.week) &&
        (statusFilter.value === "all" || (statusFilter.value === "complete" ? complete : !complete)) &&
        (!term || searchText.get(card).includes(term));
      card.hidden = !matches;
      if (matches) shown++;
    });
    document.querySelectorAll(".week-block").forEach(function (week) {
      week.hidden = !Array.from(week.querySelectorAll(".day-card")).some(function (card) { return !card.hidden; });
    });
    document.getElementById("filter-result").textContent = "Showing " + shown + " of 84 days";
    document.getElementById("no-results").hidden = shown > 0;
  }

  function update() {
    var done = new Set(state.done);
    inputs.forEach(function (input) { input.checked = done.has(input.dataset.task); });
    var completedDays = 0;
    cards.forEach(function (card) {
      var n = Number(card.dataset.day);
      var count = kinds.filter(function (kind) { return done.has(n + "-" + kind); }).length;
      card.querySelector(".day-status").textContent = count + "/5";
      card.classList.toggle("is-complete", count === 5);
      if (count === 5) completedDays++;
      var dateLabel = card.querySelector(".scheduled-date");
      dateLabel.textContent = state.startDate ? " · " + new Intl.DateTimeFormat(undefined, {
        month: "short", day: "numeric", year: "numeric", timeZone: "UTC"
      }).format(new Date(dateForDay(state.startDate, n) + "T12:00:00Z")) : "";
    });
    document.getElementById("progress-label").textContent = completedDays + " of 84 days complete";
    document.getElementById("task-progress").textContent = done.size + " of 420 tasks complete";
    document.getElementById("progress").value = done.size;
    var first = cards.find(function (card) { return !card.classList.contains("is-complete"); });
    document.getElementById("resume").href = first ? "#" + first.id : "#method";
    document.getElementById("resume").textContent = first ? "Resume first unfinished day" : "All days complete · plan next cycle";
    startInput.value = state.startDate;
    applyFilters();
  }

  function jumpToHash() {
    var match = /^#(day|week)-([1-9]\d?)$/.exec(window.location.hash);
    if (!match) return;
    var target = document.getElementById(match[1] + "-" + match[2]);
    if (!target) return;
    weekFilter.value = match[1] === "day" ? target.dataset.week : match[2];
    statusFilter.value = "all";
    search.value = "";
    applyFilters();
    if (match[1] === "day") target.open = true;
    target.scrollIntoView({ block: "start" });
  }

  inputs.forEach(function (input) {
    input.disabled = false;
    input.addEventListener("change", function () {
      var done = new Set(state.done);
      if (input.checked) done.add(input.dataset.task);
      else done.delete(input.dataset.task);
      state.done = Array.from(done);
      save();
      update();
    });
  });
  document.querySelectorAll(".answer-toggle").forEach(function (button) {
    button.addEventListener("click", function () {
      var answer = document.getElementById(button.getAttribute("aria-controls"));
      var reveal = answer.hidden;
      answer.hidden = !reveal;
      button.setAttribute("aria-expanded", String(reveal));
      var hindi = button.closest("[lang]").getAttribute("lang") === "hi";
      button.textContent = hindi ? reveal ? "उत्तर छिपाएँ" : "उत्तर दिखाएँ" : reveal ? "Hide answer" : "Reveal answer";
    });
  });
  document.querySelectorAll("[data-complete]").forEach(function (button) {
    button.addEventListener("click", function () {
      var done = new Set(state.done);
      kinds.forEach(function (kind) { done.add(button.dataset.complete + "-" + kind); });
      state.done = Array.from(done);
      var saved = save();
      update();
      if (saved) announce("Day " + button.dataset.complete + " marked complete. Uncheck individual tasks to undo.", false);
    });
  });
  [weekFilter, statusFilter].forEach(function (select) { select.addEventListener("change", applyFilters); });
  search.addEventListener("input", applyFilters);
  startInput.addEventListener("change", function () {
    if (startInput.value && !validDate(startInput.value)) {
      announce("Please use a valid calendar start date.", true);
      startInput.value = state.startDate;
      return;
    }
    state.startDate = startInput.value;
    save();
    update();
  });
  document.getElementById("expand").addEventListener("click", function () {
    cards.filter(function (card) { return !card.hidden; }).forEach(function (card) {
      card.open = true;
      card.querySelectorAll("details").forEach(function (details) { details.open = true; });
    });
  });
  document.getElementById("collapse").addEventListener("click", function () {
    cards.filter(function (card) { return !card.hidden; }).forEach(function (card) { card.open = false; });
  });
  document.getElementById("reset").addEventListener("click", function () {
    if (!window.confirm("Reset all task completion and the start date in this browser? Export a backup first if needed.")) return;
    state = { version: 1, startDate: "", done: [] };
    var saved = save();
    update();
    if (saved) announce("Progress and start date reset in this browser.", false);
  });
  document.getElementById("export").addEventListener("click", function () {
    var url = URL.createObjectURL(new Blob([JSON.stringify(state, null, 2)], { type: "application/json" }));
    var a = document.createElement("a");
    a.href = url;
    a.download = "uppsc-study-progress.json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  });
  document.getElementById("import").addEventListener("change", async function (event) {
    var file = event.target.files[0];
    if (!file) return;
    try {
      if (file.size > 100000) throw new Error("Progress files must be smaller than 100 KB.");
      var imported = validateState(JSON.parse(await file.text()));
      if (!window.confirm("Replace this browser's progress with the imported file?")) return;
      state = imported;
      var saved = save();
      update();
      if (saved) announce("Progress imported. Export another backup after future changes.", false);
    } catch (error) {
      console.warn("Progress import rejected.", error);
      announce("Import failed: " + error.message + " Existing progress was not changed.", true);
    } finally {
      event.target.value = "";
    }
  });
  document.getElementById("score-form").addEventListener("submit", function (event) {
    event.preventDefault();
    var result = document.getElementById("score-result");
    try {
      var values = score(Number(document.getElementById("correct").value), Number(document.getElementById("wrong").value));
      result.textContent = "Estimated marks: " + values.marks.toFixed(2) + " / 200 · Attempted: " + values.attempted +
        " · Accuracy: " + (values.accuracy === null ? "not applicable" : values.accuracy.toFixed(1) + "%") +
        ". Unresolved questions are excluded; this is not a cutoff prediction.";
    } catch (error) {
      result.textContent = error.message;
    }
  });
  var printState = null;
  function preparePrint() {
    if (printState) return;
    printState = Array.from(document.querySelectorAll("details:not(.question-source):not(.question-answer):not(.secondary-paper)")).map(function (details) { return [details, details.open]; });
    printState.forEach(function (entry) { entry[0].open = true; });
  }
  function restorePrint() {
    if (!printState) return;
    printState.forEach(function (entry) { entry[0].open = entry[1]; });
    printState = null;
  }
  window.addEventListener("beforeprint", preparePrint);
  window.addEventListener("afterprint", restorePrint);
  document.getElementById("print").addEventListener("click", function () {
    preparePrint();
    window.print();
    restorePrint();
  });
  window.addEventListener("hashchange", jumpToHash);
  document.addEventListener("click", function (event) {
    var anchor = event.target.closest("a[href^='#']");
    if (anchor && anchor.getAttribute("href") === window.location.hash) jumpToHash();
  });
  update();
  document.documentElement.classList.add("js");
  jumpToHash();
})();

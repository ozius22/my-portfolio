    const EXAM_JSON_PATH = "/exam/web-exam.json";
    const QUESTIONS_PER_PAGE = 1;

    const studentNameEl = document.getElementById("studentName");
    const progressFillEl = document.getElementById("progressFill");
    const progressTextEl = document.getElementById("progressText");
    const statusEl = document.getElementById("status");
    const examFormEl = document.getElementById("examForm");
    const resultsEl = document.getElementById("results");
    const submitBtn = document.getElementById("submitBtn");
    const prevBtn = document.getElementById("prevBtn");
    const nextBtn = document.getElementById("nextBtn");
    const pageIndicatorEl = document.getElementById("pageIndicator");
    const pageHeaderEl = document.getElementById("pageHeader");

    let examData = null;
    let renderedQuestions = [];
    let currentPage = 1;
    let totalPages = 1;
    let answers = {};
    let shuffledChoicesMap = {};
    let studentName = "";

    // ── Firebase setup ──────────────────────────────────────────────────────
    const FB_CONFIG = {
      apiKey: "AIzaSyA8saNig0Zm3iQ-OEkcT2SCgUMjIBGQPC0",
      authDomain: "sti-web-devs.firebaseapp.com",
      databaseURL: "https://sti-web-devs-default-rtdb.asia-southeast1.firebasedatabase.app/",
      projectId: "sti-web-devs",
      storageBucket: "sti-web-devs.firebasestorage.app",
      messagingSenderId: "563707672578",
      appId: "1:563707672578:web:249bfbccbfb59653394f1b"
    };

    async function firebasePush(path, data) {
      try {
        const url = `${FB_CONFIG.databaseURL}${path}.json`;
        await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data)
        });
      } catch (e) {
        console.warn("Firebase backup failed:", e);
      }
    }

    function getLocalStorageKey() {
      return examData ? `exam_answers__${examData.id}` : "exam_answers__default";
    }

    function persistAnswers() {
      try {
        localStorage.setItem(getLocalStorageKey(), JSON.stringify(answers));
      } catch (e) { /* quota or private mode */ }
    }

    function loadPersistedAnswers() {
      try {
        const raw = localStorage.getItem(getLocalStorageKey());
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && typeof parsed === "object") {
            answers = parsed;
          }
        }
      } catch (e) { /* ignore */ }
    }

    function setStatus(message, type = "") {
      statusEl.textContent = message;
      statusEl.className = "status" + (type ? " " + type : "");
    }

    function escapeHtml(value) {
      return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    }

    function normalizeString(value) {
      return String(value ?? "")
        .trim()
        .toLowerCase()
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, " ");
    }

    function shuffleArray(list) {
      const arr = [...list];
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    }

    function getSectionsMap(sections = []) {
      const map = {};
      sections.forEach(section => {
        map[section.id] = section;
      });
      return map;
    }

    function renderExam(examWrapper) {
      const exam = examWrapper.exam;
      examData = exam;
      resultsEl.classList.add("hidden");
      resultsEl.innerHTML = "";
      answers = {};
      currentPage = 1;

      let questions = Array.isArray(exam.questions) ? [...exam.questions] : [];
      if (exam.shuffleQuestions) {
        questions = shuffleArray(questions);
      }

      shuffledChoicesMap = {};
      questions.forEach(q => {
        if (exam.shuffleChoices && q.choices && q.choices.length) {
          shuffledChoicesMap[q.id] = shuffleArray(q.choices);
        }
        if (q.subItems) {
          q.subItems.forEach(sub => {
            const key = `${q.id}__${sub.id}`;
            if (exam.shuffleChoices && sub.choices && sub.choices.length) {
              shuffledChoicesMap[key] = shuffleArray(sub.choices);
            }
          });
        }
      });

      renderedQuestions = questions;
      totalPages = Math.max(1, Math.ceil(renderedQuestions.length / QUESTIONS_PER_PAGE));

      loadPersistedAnswers();

      renderPage();
      updateProgress();
    //   setStatus("Exam loaded successfully.", "good");
    }

    function renderPage() {
      examFormEl.innerHTML = "";
      pageHeaderEl.innerHTML = "";

      if (!examData || !renderedQuestions.length) {
        pageHeaderEl.innerHTML = "<h2 class='page-title'>No questions available</h2>";
        return;
      }

      const sectionsMap = getSectionsMap(examData.sections || []);
      const startIndex = (currentPage - 1) * QUESTIONS_PER_PAGE;
      const endIndex = Math.min(startIndex + QUESTIONS_PER_PAGE, renderedQuestions.length);
      const currentQuestions = renderedQuestions.slice(startIndex, endIndex);

      const sectionsInPage = [...new Set(currentQuestions.map(q => q.section).filter(Boolean))];
      const sectionTitles = sectionsInPage.map(id => sectionsMap[id]?.title || id);

      pageHeaderEl.innerHTML = `
        <h2 class="page-title">Page ${currentPage} of ${totalPages}</h2>
        <p class="page-subtitle">
          Questions ${startIndex + 1} to ${endIndex} of ${renderedQuestions.length}
          ${sectionTitles.length ? " • Sections: " + escapeHtml(sectionTitles.join(", ")) : ""}
        </p>
      `;

      currentQuestions.forEach((question, index) => {
        examFormEl.appendChild(renderQuestionCard(question, startIndex + index + 1));
      });

      pageIndicatorEl.textContent = `Page ${currentPage} of ${totalPages}`;
      prevBtn.disabled = currentPage === 1;
      nextBtn.disabled = currentPage === totalPages;

      submitBtn.classList.toggle("hidden", currentPage !== totalPages);

      restorePageAnswers();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    function renderQuestionCard(question, displayNumber) {
      const card = document.createElement("div");
      card.className = "question-card";
      card.dataset.questionId = question.id;

      const top = document.createElement("div");
      top.className = "question-top";

      const left = document.createElement("div");
      const title = document.createElement("div");
      title.className = "question-text";
      title.textContent = `${displayNumber}. ${question.question}`;
      left.appendChild(title);

      const right = document.createElement("div");
      right.className = "pill-wrap";
      right.innerHTML = `
        <span class="pill">${escapeHtml(question.type)}</span>
        <span class="pill">${escapeHtml(question.topic || "General")}</span>
        <span class="pill">${escapeHtml(question.difficulty || "mixed")}</span>
        <span class="pill">${escapeHtml((question.points ?? 1) + " pt" + ((question.points ?? 1) > 1 ? "s" : ""))}</span>
      `;

      top.appendChild(left);
      top.appendChild(right);
      card.appendChild(top);

      if (question.snippet) {
        const pre = document.createElement("pre");
        pre.className = "snippet";
        pre.textContent = question.snippet;
        card.appendChild(pre);
      }

      card.appendChild(renderQuestionInput(question));

      const feedback = document.createElement("div");
      feedback.className = "feedback hidden";
      feedback.id = `feedback-${question.id}`;
      card.appendChild(feedback);

      if (question.explanation) {
        const note = document.createElement("div");
        note.className = "small-note";
        note.textContent = "Explanation will appear after submission.";
        card.appendChild(note);
      }

      return card;
    }

    function renderQuestionInput(question) {
      switch (question.type) {
        case "single_choice":
        case "scenario":
        case "code_reading":
          return renderSingleChoice(question);
        case "multiple_select":
          return renderMultipleSelect(question);
        case "matching":
          return renderMatching(question);
        case "ordering":
          return renderOrdering(question);
        case "categorization":
          return renderCategorization(question);
        case "fill_in_the_blank":
        case "error_spotting":
          return renderFill(question);
        case "build_request":
          return renderBuildRequest(question);
        case "case_study":
          return renderCaseStudy(question);
        default:
          return renderUnsupported(question);
      }
    }

    function renderSingleChoice(question) {
      const wrap = document.createElement("div");
      wrap.className = "option-list";

      const choices = shuffledChoicesMap[question.id] || [...(question.choices || [])];

      choices.forEach(choice => {
        const item = document.createElement("div");
        item.className = "option-item";
        item.innerHTML = `
          <label>
            <input type="radio" name="${escapeHtml(question.id)}" value="${escapeHtml(choice)}">
            <span>${escapeHtml(choice)}</span>
          </label>
        `;
        wrap.appendChild(item);
      });

      return wrap;
    }

    function renderMultipleSelect(question) {
      const wrap = document.createElement("div");
      wrap.className = "option-list";

      const choices = shuffledChoicesMap[question.id] || [...(question.choices || [])];

      choices.forEach(choice => {
        const item = document.createElement("div");
        item.className = "option-item";
        item.innerHTML = `
          <label>
            <input type="checkbox" name="${escapeHtml(question.id)}" value="${escapeHtml(choice)}">
            <span>${escapeHtml(choice)}</span>
          </label>
        `;
        wrap.appendChild(item);
      });

      return wrap;
    }

    function renderMatching(question) {
      const wrap = document.createElement("div");
      wrap.className = "pair-grid";

      const rightItems = [...(question.rightItems || [])];

      (question.leftItems || []).forEach((leftItem, index) => {
        const row = document.createElement("div");
        row.className = "pair-row";

        const label = document.createElement("div");
        label.className = "pair-left";
        label.textContent = leftItem;

        const select = document.createElement("select");
        select.name = `${question.id}__${index}`;
        select.dataset.leftItem = leftItem;
        select.innerHTML = `<option value="">Select match</option>` +
          rightItems.map(item => `<option value="${escapeHtml(item)}">${escapeHtml(item)}</option>`).join("");

        wrap.appendChild(row);
        row.appendChild(label);
        row.appendChild(select);
      });

      return wrap;
    }

    function renderOrdering(question) {
      const wrap = document.createElement("div");
      wrap.className = "ordering-list";

      (question.items || []).forEach((item, index) => {
        const row = document.createElement("div");
        row.className = "ordering-item";
        row.innerHTML = `
          <div>${escapeHtml(item)}</div>
          <select name="${escapeHtml(question.id)}__${index}" data-order-item="${escapeHtml(item)}">
            <option value="">Position</option>
            ${(question.items || []).map((_, i) => `<option value="${i + 1}">${i + 1}</option>`).join("")}
          </select>
        `;
        wrap.appendChild(row);
      });

      return wrap;
    }

    function renderCategorization(question) {
      const wrap = document.createElement("div");
      wrap.className = "category-grid";

      (question.items || []).forEach((item, index) => {
        const row = document.createElement("div");
        row.className = "category-item";
        row.innerHTML = `
          <div>${escapeHtml(item)}</div>
          <select name="${escapeHtml(question.id)}__${index}" data-category-item="${escapeHtml(item)}">
            <option value="">Select category</option>
            ${(question.categories || []).map(cat => `<option value="${escapeHtml(cat)}">${escapeHtml(cat)}</option>`).join("")}
          </select>
        `;
        wrap.appendChild(row);
      });

      return wrap;
    }

    function renderFill(question) {
      const wrap = document.createElement("div");

      if (question.prompt) {
        const p = document.createElement("p");
        p.innerHTML = `<strong>${escapeHtml(question.prompt)}</strong>`;
        wrap.appendChild(p);
      }

      const input = document.createElement("input");
      input.type = "text";
      input.name = question.id;
      input.placeholder = "Type your answer here";
      wrap.appendChild(input);

      return wrap;
    }

    function renderBuildRequest(question) {
      const wrap = document.createElement("div");
      wrap.className = "build-grid";

      (question.fields || []).forEach(field => {
        const row = document.createElement("div");
        row.className = "build-row";

        const label = document.createElement("label");
        label.textContent = field.label || field.name || "Field";

        let control;
        if (field.type === "textarea") {
          control = document.createElement("textarea");
        } else {
          control = document.createElement("input");
          control.type = "text";
        }

        control.name = `${question.id}__${field.name}`;
        control.dataset.fieldName = field.name;

        row.appendChild(label);
        row.appendChild(control);
        wrap.appendChild(row);
      });

      return wrap;
    }

    function renderCaseStudy(question) {
      const wrap = document.createElement("div");
      wrap.className = "case-study";

      const subWrap = document.createElement("div");
      subWrap.className = "subitems-grid";

      (question.subItems || []).forEach((subItem, idx) => {
        const block = document.createElement("div");
        block.className = "question-card";
        block.style.marginBottom = "0";

        const title = document.createElement("div");
        title.className = "question-text";
        title.textContent = `${String.fromCharCode(97 + idx)}. ${subItem.question}`;
        block.appendChild(title);

        const normalizedSub = {
          ...subItem,
          id: `${question.id}__${subItem.id}`,
          topic: question.topic,
          difficulty: question.difficulty,
          points: 1,
          choices: shuffledChoicesMap[`${question.id}__${subItem.id}`] || subItem.choices
        };

        block.appendChild(renderQuestionInput(normalizedSub));
        subWrap.appendChild(block);
      });

      wrap.appendChild(subWrap);
      return wrap;
    }

    function renderUnsupported(question) {
      const div = document.createElement("div");
      div.innerHTML = `<em>Unsupported question type: ${escapeHtml(question.type)}</em>`;
      return div;
    }

    function saveCurrentPageAnswers() {
      const startIndex = (currentPage - 1) * QUESTIONS_PER_PAGE;
      const endIndex = Math.min(startIndex + QUESTIONS_PER_PAGE, renderedQuestions.length);
      const currentQuestions = renderedQuestions.slice(startIndex, endIndex);

      currentQuestions.forEach(question => {
        answers[question.id] = captureQuestionAnswer(question);
      });

      persistAnswers();
      updateProgress();
    }

    function captureQuestionAnswer(question) {
      switch (question.type) {
        case "single_choice":
        case "scenario":
        case "code_reading":
          return getSingleChoiceAnswer(question.id);

        case "multiple_select":
          return getMultipleSelectAnswer(question.id);

        case "matching":
          return getMatchingAnswer(question);

        case "ordering":
          return getOrderingAnswer(question);

        case "categorization":
          return getCategorizationAnswer(question);

        case "fill_in_the_blank":
        case "error_spotting":
          return getFillAnswer(question.id);

        case "build_request":
          return getBuildRequestAnswer(question);

        case "case_study":
          return getCaseStudyAnswer(question);

        default:
          return null;
      }
    }

    function restorePageAnswers() {
      const startIndex = (currentPage - 1) * QUESTIONS_PER_PAGE;
      const endIndex = Math.min(startIndex + QUESTIONS_PER_PAGE, renderedQuestions.length);
      const currentQuestions = renderedQuestions.slice(startIndex, endIndex);

      currentQuestions.forEach(question => {
        restoreQuestionAnswer(question, answers[question.id]);
      });
    }

    function restoreQuestionAnswer(question, saved) {
      if (saved == null) return;

      switch (question.type) {
        case "single_choice":
        case "scenario":
        case "code_reading": {
          const radio = document.querySelector(`input[name="${CSS.escape(question.id)}"][value="${CSS.escape(saved)}"]`);
          if (radio) radio.checked = true;
          break;
        }

        case "multiple_select": {
          if (!Array.isArray(saved)) break;
          saved.forEach(value => {
            const checkbox = document.querySelector(`input[name="${CSS.escape(question.id)}"][value="${CSS.escape(value)}"]`);
            if (checkbox) checkbox.checked = true;
          });
          break;
        }

        case "matching": {
          Object.entries(saved || {}).forEach(([leftItem, value]) => {
            const selects = document.querySelectorAll(`[name^="${CSS.escape(question.id)}__"]`);
            selects.forEach(select => {
              if (select.dataset.leftItem === leftItem) {
                select.value = value;
              }
            });
          });
          break;
        }

        case "ordering": {
          const selects = document.querySelectorAll(`[name^="${CSS.escape(question.id)}__"]`);
          selects.forEach(select => {
            const item = select.dataset.orderItem;
            const pos = Array.isArray(saved) ? saved.findIndex(x => x === item) + 1 : 0;
            select.value = pos || "";
          });
          break;
        }

        case "categorization": {
          Object.entries(saved || {}).forEach(([itemName, value]) => {
            const selects = document.querySelectorAll(`[name^="${CSS.escape(question.id)}__"]`);
            selects.forEach(select => {
              if (select.dataset.categoryItem === itemName) {
                select.value = value;
              }
            });
          });
          break;
        }

        case "fill_in_the_blank":
        case "error_spotting": {
          const input = document.querySelector(`[name="${CSS.escape(question.id)}"]`);
          if (input) input.value = saved;
          break;
        }

        case "build_request": {
          Object.entries(saved || {}).forEach(([fieldName, value]) => {
            const input = document.querySelector(`[name="${CSS.escape(question.id + "__" + fieldName)}"]`);
            if (input) input.value = value;
          });
          break;
        }

        case "case_study": {
          (question.subItems || []).forEach(subItem => {
            const subId = `${question.id}__${subItem.id}`;
            const subSaved = saved?.[subItem.id];

            if (["single_choice", "scenario", "code_reading"].includes(subItem.type)) {
              const radio = document.querySelector(`input[name="${CSS.escape(subId)}"][value="${CSS.escape(subSaved)}"]`);
              if (radio) radio.checked = true;
            } else if (subItem.type === "multiple_select") {
              (subSaved || []).forEach(value => {
                const checkbox = document.querySelector(`input[name="${CSS.escape(subId)}"][value="${CSS.escape(value)}"]`);
                if (checkbox) checkbox.checked = true;
              });
            } else {
              const input = document.querySelector(`[name="${CSS.escape(subId)}"]`);
              if (input) input.value = subSaved || "";
            }
          });
          break;
        }
      }
    }

    function getSingleChoiceAnswer(questionId) {
      const selected = document.querySelector(`input[name="${CSS.escape(questionId)}"]:checked`);
      return selected ? selected.value : "";
    }

    function getMultipleSelectAnswer(questionId) {
      return Array.from(document.querySelectorAll(`input[name="${CSS.escape(questionId)}"]:checked`))
        .map(el => el.value)
        .sort();
    }

    function getMatchingAnswer(question) {
      const answer = {};
      const selects = document.querySelectorAll(`[name^="${CSS.escape(question.id)}__"]`);
      selects.forEach(select => {
        answer[select.dataset.leftItem] = select.value;
      });
      return answer;
    }

    function getOrderingAnswer(question) {
      const positions = [];
      const selects = document.querySelectorAll(`[name^="${CSS.escape(question.id)}__"]`);
      selects.forEach(select => {
        const item = select.dataset.orderItem;
        const pos = Number(select.value);
        if (item && pos) {
          positions.push({ item, pos });
        }
      });
      positions.sort((a, b) => a.pos - b.pos);
      return positions.map(entry => entry.item);
    }

    function getCategorizationAnswer(question) {
      const answer = {};
      const selects = document.querySelectorAll(`[name^="${CSS.escape(question.id)}__"]`);
      selects.forEach(select => {
        answer[select.dataset.categoryItem] = select.value;
      });
      return answer;
    }

    function getFillAnswer(questionId) {
      const input = document.querySelector(`[name="${CSS.escape(questionId)}"]`);
      return input ? input.value.trim() : "";
    }

    function getBuildRequestAnswer(question) {
      const answer = {};
      (question.fields || []).forEach(field => {
        const input = document.querySelector(`[name="${CSS.escape(question.id + "__" + field.name)}"]`);
        answer[field.name] = input ? input.value.trim() : "";
      });
      return answer;
    }

    function getCaseStudyAnswer(question) {
      const result = {};
      (question.subItems || []).forEach(subItem => {
        const subId = `${question.id}__${subItem.id}`;
        if (["single_choice", "scenario", "code_reading"].includes(subItem.type)) {
          result[subItem.id] = getSingleChoiceAnswer(subId);
        } else if (subItem.type === "multiple_select") {
          result[subItem.id] = getMultipleSelectAnswer(subId);
        } else {
          result[subItem.id] = getFillAnswer(subId);
        }
      });
      return result;
    }

    function isQuestionAnswered(questionId) {
      const value = answers[questionId];

      if (value == null) return false;
      if (typeof value === "string") return value.trim() !== "";
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === "object") {
        const vals = Object.values(value);
        return vals.some(v => {
          if (typeof v === "string") return v.trim() !== "";
          if (Array.isArray(v)) return v.length > 0;
          if (typeof v === "object" && v != null) return Object.values(v).some(x => String(x).trim() !== "");
          return v != null && String(v).trim() !== "";
        });
      }

      return false;
    }

    function updateProgress() {
      const answeredCount = renderedQuestions.filter(q => isQuestionAnswered(q.id)).length;
      const total = renderedQuestions.length || 1;
      const percent = Math.round((answeredCount / total) * 100);

      progressFillEl.style.width = `${percent}%`;
      progressTextEl.textContent = `Progress: ${answeredCount} of ${total} main questions answered (${percent}%)`;
    }

    function arraysEqualNormalized(a, b) {
      if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) {
        return false;
      }

      const aa = a.map(normalizeString).sort();
      const bb = b.map(normalizeString).sort();

      return aa.every((value, index) => value === bb[index]);
    }

    function gradeQuestion(question) {
      const maxPoints = Number(question.points ?? 1);
      const savedAnswer = answers[question.id];

      switch (question.type) {
        case "single_choice":
        case "scenario":
        case "code_reading": {
          const correct = normalizeString(savedAnswer) === normalizeString(question.correctAnswer);
          return { correct, earned: correct ? maxPoints : 0, max: maxPoints, studentAnswer: savedAnswer || "(no answer)" };
        }

        case "multiple_select": {
          const answer = Array.isArray(savedAnswer) ? savedAnswer : [];
          const correct = arraysEqualNormalized(answer, question.correctAnswers || []);
          return { correct, earned: correct ? maxPoints : 0, max: maxPoints, studentAnswer: answer.length ? answer.join(", ") : "(no answer)" };
        }

        case "matching": {
          const answer = savedAnswer || {};
          const pairs = question.correctPairs || {};
          const total = Object.keys(pairs).length || 1;
          let matched = 0;

          Object.keys(pairs).forEach(left => {
            if (normalizeString(answer[left]) === normalizeString(pairs[left])) matched++;
          });

          return {
            correct: matched === total,
            earned: Math.round((matched / total) * maxPoints * 100) / 100,
            max: maxPoints,
            studentAnswer: JSON.stringify(answer)
          };
        }

        case "ordering": {
          const answer = Array.isArray(savedAnswer) ? savedAnswer : [];
          const correct = arraysEqualNormalized(answer, question.correctOrder || []);
          return { correct, earned: correct ? maxPoints : 0, max: maxPoints, studentAnswer: answer.length ? answer.join(" -> ") : "(incomplete)" };
        }

        case "categorization": {
          const answer = savedAnswer || {};
          const expected = question.correctCategories || {};
          const total = Object.keys(expected).length || 1;
          let matched = 0;

          Object.keys(expected).forEach(item => {
            if (normalizeString(answer[item]) === normalizeString(expected[item])) matched++;
          });

          return {
            correct: matched === total,
            earned: Math.round((matched / total) * maxPoints * 100) / 100,
            max: maxPoints,
            studentAnswer: JSON.stringify(answer)
          };
        }

        case "fill_in_the_blank":
        case "error_spotting": {
          const answer = String(savedAnswer || "").trim();
          const accepted = [
            ...(question.correctAnswers || []),
            ...(question.acceptableAnswers || []),
            ...(question.expectedAnswer ? [question.expectedAnswer] : [])
          ].map(normalizeString);

          const correct = accepted.includes(normalizeString(answer));
          return { correct, earned: correct ? maxPoints : 0, max: maxPoints, studentAnswer: answer || "(no answer)" };
        }

        case "build_request": {
          const answer = savedAnswer || {};
          const grading = question.grading || {};
          let checks = 0;
          let passed = 0;

          Object.keys(grading).forEach(key => {
            checks++;

            if (key === "method") {
              if ((grading.method || []).some(v => normalizeString(answer.method) === normalizeString(v))) passed++;
            }

            if (key === "contentType") {
              if ((grading.contentType || []).some(v => normalizeString(answer.contentType) === normalizeString(v))) passed++;
            }

            if (key === "acceptHeader") {
              if ((grading.acceptHeader || []).some(v => normalizeString(answer.acceptHeader) === normalizeString(v))) passed++;
            }

            if (key === "urlContains") {
              if ((grading.urlContains || []).every(v => normalizeString(answer.url).includes(normalizeString(v)))) passed++;
            }

            if (key === "endpointContains") {
              if ((grading.endpointContains || []).every(v => normalizeString(answer.endpoint).includes(normalizeString(v)))) passed++;
            }

            if (key === "authorizationStartsWith") {
              if ((grading.authorizationStartsWith || []).some(v => normalizeString(answer.authorization).startsWith(normalizeString(v)))) passed++;
            }
          });

          const ratio = checks ? passed / checks : 0;
          return {
            correct: checks > 0 && passed === checks,
            earned: Math.round(ratio * maxPoints * 100) / 100,
            max: maxPoints,
            studentAnswer: JSON.stringify(answer)
          };
        }

        case "case_study": {
          const subItems = question.subItems || [];
          const saved = savedAnswer || {};
          let earned = 0;
          let max = 0;
          let allCorrect = true;

          subItems.forEach(subItem => {
            const subSaved = saved[subItem.id];
            const synthetic = {
              ...subItem,
              id: `${question.id}__${subItem.id}`,
              points: 1
            };

            let res;
            if (["single_choice", "scenario", "code_reading"].includes(subItem.type)) {
              const correct = normalizeString(subSaved) === normalizeString(subItem.correctAnswer);
              res = { correct, earned: correct ? 1 : 0, max: 1 };
            } else if (subItem.type === "multiple_select") {
              const correct = arraysEqualNormalized(subSaved || [], subItem.correctAnswers || []);
              res = { correct, earned: correct ? 1 : 0, max: 1 };
            } else {
              const accepted = [
                ...(subItem.correctAnswers || []),
                ...(subItem.acceptableAnswers || []),
                ...(subItem.expectedAnswer ? [subItem.expectedAnswer] : []),
                ...(subItem.correctAnswer ? [subItem.correctAnswer] : [])
              ].map(normalizeString);
              const correct = accepted.includes(normalizeString(subSaved || ""));
              res = { correct, earned: correct ? 1 : 0, max: 1 };
            }

            earned += res.earned;
            max += res.max;
            if (!res.correct) allCorrect = false;
          });

          const finalMax = maxPoints;
          return {
            correct: allCorrect,
            earned: max > 0 ? Math.round((earned / max) * finalMax * 100) / 100 : 0,
            max: finalMax,
            studentAnswer: "Case study answered"
          };
        }

        default:
          return { correct: false, earned: 0, max: maxPoints, studentAnswer: "(unsupported type)" };
      }
    }

    function getCorrectAnswerText(question) {
      switch (question.type) {
        case "single_choice":
        case "scenario":
        case "code_reading":
          return String(question.correctAnswer ?? "");
        case "multiple_select":
          return (question.correctAnswers || []).join(", ");
        case "matching":
          return Object.entries(question.correctPairs || {}).map(([left, right]) => `${left} → ${right}`).join(" | ");
        case "ordering":
          return (question.correctOrder || []).join(" -> ");
        case "categorization":
          return Object.entries(question.correctCategories || {}).map(([item, category]) => `${item} → ${category}`).join(" | ");
        case "fill_in_the_blank":
          return (question.correctAnswers || []).join(" / ");
        case "error_spotting":
          return question.expectedAnswer || (question.acceptableAnswers || []).join(" / ");
        case "build_request":
          return JSON.stringify(question.sampleValidAnswer || question.grading || {});
        case "case_study":
          return (question.subItems || []).map(sub => `${sub.question} => ${sub.correctAnswer || (sub.correctAnswers || []).join(", ")}`).join(" | ");
        default:
          return "";
      }
    }

    function showAllFeedback() {
      renderedQuestions.forEach(question => {
        const card = document.querySelector(`[data-question-id="${CSS.escape(question.id)}"]`);
        if (!card) return;

        const result = gradeQuestion(question);
        const feedbackEl = document.getElementById(`feedback-${question.id}`);
        if (!feedbackEl) return;

        const explanation = question.explanation ? `<div style="margin-top:8px;"><strong>Explanation:</strong> ${escapeHtml(question.explanation)}</div>` : "";
        feedbackEl.classList.remove("hidden", "correct", "incorrect");
        feedbackEl.classList.add(result.correct ? "correct" : "incorrect");
        feedbackEl.innerHTML = `
          <div><strong>${result.correct ? "Correct" : "Not correct"}</strong></div>
          <div><strong>Your answer:</strong> ${escapeHtml(result.studentAnswer)}</div>
          <div><strong>Score:</strong> ${result.earned} / ${result.max}</div>
          ${explanation}
        `;
      });
    }

    async function submitExam() {
      if (!examData) {
        setStatus("Exam is not loaded yet.", "bad");
        return;
      }

      studentName = studentNameEl.value.trim();
      if (!studentName) {
        studentNameEl.focus();
        setStatus("Please enter your name before submitting.", "bad");
        return;
      }

      saveCurrentPageAnswers();

      let totalEarned = 0;
      let totalMax = 0;
      let correctCount = 0;

      renderedQuestions.forEach(question => {
        const result = gradeQuestion(question);
        totalEarned += result.earned;
        totalMax += result.max;
        if (result.correct) correctCount++;
      });

      const percentage = totalMax > 0 ? Math.round((totalEarned / totalMax) * 10000) / 100 : 0;
      const passed = examData.passingScore != null ? percentage >= examData.passingScore : null;

      // ── Firebase backup ──────────────────────────────────────────────────
      const submission = {
        name: studentName,
        examId: examData.id,
        examTitle: examData.title,
        submittedAt: new Date().toISOString(),
        totalEarned,
        totalMax,
        percentage,
        passed: passed ?? null,
        correctCount,
        totalQuestions: renderedQuestions.length,
        answers
      };
      await firebasePush(`/submissions/${examData.id}`, submission);

      try { localStorage.removeItem(getLocalStorageKey()); } catch (e) {}

      resultsEl.classList.remove("hidden");
      resultsEl.innerHTML = `
        <h2>Exam Results</h2>
        <div class="result-summary">
          <div class="result-item">
            <div class="meta-label">Student</div>
            <div><strong>${escapeHtml(studentName)}</strong></div>
          </div>
          <div class="result-item">
            <div class="meta-label">Total Score</div>
            <div><strong>${totalEarned} / ${totalMax}</strong></div>
          </div>
          <div class="result-item">
            <div class="meta-label">Percentage</div>
            <div><strong>${percentage}%</strong></div>
          </div>
          <div class="result-item">
            <div class="meta-label">Fully Correct Items</div>
            <div><strong>${correctCount} / ${renderedQuestions.length}</strong></div>
          </div>
        </div>
      `;

      setStatus(
        `Submitted. Final score: ${percentage}%. Answers saved.`,
        "good"
      );

      renderPage();
      showAllFeedback();
      resultsEl.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    function resetAnswers() {
      answers = {};
      try { localStorage.removeItem(getLocalStorageKey()); } catch (e) {}
      resultsEl.classList.add("hidden");
      resultsEl.innerHTML = "";
      renderPage();
      updateProgress();
      setStatus("All answers were reset.", "warn");
    }

    function goToPage(page) {
      saveCurrentPageAnswers();
      currentPage = Math.max(1, Math.min(page, totalPages));
      renderPage();
    }

    async function loadExam() {
    //   setStatus("Loading exam JSON...", "warn");

      try {
        const response = await fetch(EXAM_JSON_PATH, { cache: "no-store" });

        if (!response.ok) {
          throw new Error(`Failed to load exam JSON (${response.status})`);
        }

        const json = await response.json();

        if (!json || !json.exam || !Array.isArray(json.exam.questions)) {
          throw new Error("Invalid exam JSON structure. Expected { exam: { questions: [...] } }");
        }

        renderExam(json);
      } catch (error) {
        console.error(error);
        examFormEl.innerHTML = "";
        resultsEl.classList.add("hidden");
        examTitleEl.textContent = "Unable to load exam";
        progressFillEl.style.width = "0%";
        progressTextEl.textContent = "Progress: -";
        pageHeaderEl.innerHTML = "";
        pageIndicatorEl.textContent = "Page - of -";
        setStatus(error.message || "Failed to load exam.", "bad");
      }
    }

    submitBtn.addEventListener("click", submitExam);
    prevBtn.addEventListener("click", () => goToPage(currentPage - 1));
    nextBtn.addEventListener("click", () => goToPage(currentPage + 1));

    loadExam();
const quizPanel = document.querySelector("#quiz-panel");

const questionDefaults = [
  {
    prompt: "What is your favorite color?",
    choices: ["Blue", "Green", "Purple", "Red"],
  },
  {
    prompt: "What is your favorite food?",
    choices: ["Pizza", "Sushi", "Pasta", "Tacos"],
  },
  {
    prompt: "What is your favorite movie?",
    choices: ["Comedy", "Action", "Romance", "Animation"],
  },
  {
    prompt: "Who is your favorite artist?",
    choices: ["Pop", "Hip-hop", "R&B", "Rock"],
  },
  {
    prompt: "What is your dream job?",
    choices: ["Artist", "Teacher", "Doctor", "Entrepreneur"],
  },
  {
    prompt: "What is one of your biggest fears?",
    choices: ["Heights", "Spiders", "Darkness", "Failure"],
  },
  {
    prompt: "Where would you most like to travel?",
    choices: ["Beach", "City", "Mountains", "Countryside"],
  },
  {
    prompt: "What is your favorite hobby?",
    choices: ["Reading", "Sports", "Gaming", "Cooking"],
  },
  {
    prompt: "What is your favorite season?",
    choices: ["Spring", "Summer", "Autumn", "Winter"],
  },
  {
    prompt: "What makes you happiest?",
    choices: ["Friends", "Family", "Music", "Travel"],
  },
];

function makeButton(text, onClick, selected) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = `choice-button${selected ? " is-selected" : ""}`;
  button.textContent = text;
  button.setAttribute("aria-pressed", String(Boolean(selected)));
  button.addEventListener("click", onClick);
  return button;
}

function makeNameField(form, labelText, inputId) {
  const label = document.createElement("label");
  label.htmlFor = inputId;
  label.textContent = labelText;

  const input = document.createElement("input");
  input.id = inputId;
  input.name = inputId;
  input.type = "text";
  input.autocomplete = "name";
  input.required = true;

  form.append(label, input);
  return input;
}

function showCreator() {
  const form = document.createElement("form");
  form.className = "quiz-form";

  const heading = document.createElement("h1");
  heading.textContent = "Create your friendship quiz";
  form.append(heading);

  const creatorNameInput = makeNameField(form, "Your name", "creator-name");
  const questionStates = [];

  questionDefaults.forEach((question, index) => {
    const state = {
      choices: [...question.choices],
      answer: "",
    };
    questionStates.push(state);

    const fieldset = document.createElement("fieldset");
    fieldset.className = "quiz-question";

    const legend = document.createElement("legend");
    legend.textContent = question.prompt;

    const options = document.createElement("div");
    options.className = "choice-buttons";

    const addRow = document.createElement("div");
    addRow.className = "add-choice-row";

    const customInput = document.createElement("input");
    customInput.type = "text";
    customInput.placeholder = "Add your own option";
    customInput.setAttribute("aria-label", `Add an option for ${question.prompt}`);

    const status = document.createElement("p");
    status.className = "choice-status";
    status.setAttribute("aria-live", "polite");

    function renderOptions() {
      options.replaceChildren();

      state.choices.forEach((choice) => {
        const button = makeButton(
          state.answer === choice ? `${choice} (your answer)` : choice,
          () => {
            state.answer = choice;
            status.textContent = "";
            renderOptions();
          },
          state.answer === choice
        );
        options.append(button);
      });
    }

    const addButton = makeButton("Add option", () => {
      const choice = customInput.value.trim();
      customInput.setCustomValidity("");

      if (!choice) {
        customInput.setCustomValidity("Type an option first.");
        customInput.reportValidity();
        return;
      }

      if (state.choices.some((item) => item.toLowerCase() === choice.toLowerCase())) {
        customInput.setCustomValidity("That option is already listed.");
        customInput.reportValidity();
        return;
      }

      state.choices.push(choice);
      state.answer = choice;
      customInput.value = "";
      status.textContent = "";
      renderOptions();
    });

    addRow.append(customInput, addButton);
    fieldset.append(legend, options, addRow, status);
    form.append(fieldset);
    renderOptions();
  });

  const submitButton = document.createElement("button");
  submitButton.className = "startbtn";
  submitButton.type = "submit";
  submitButton.textContent = "Create share link";
  form.append(submitButton);

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const creatorName = creatorNameInput.value.trim();
    creatorNameInput.setCustomValidity(
      creatorName ? "" : "Please enter your name."
    );
    if (!creatorName) {
      creatorNameInput.reportValidity();
      return;
    }

    const unansweredIndex = questionStates.findIndex((state) => !state.answer);
    if (unansweredIndex !== -1) {
      const fieldset = form.querySelectorAll("fieldset")[unansweredIndex];
      fieldset.querySelector(".choice-status").textContent =
        "Choose one answer for this question.";
      fieldset.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    const quiz = {
      creatorName,
      questions: questionDefaults.map((question, index) => ({
        prompt: question.prompt,
        choices: questionStates[index].choices,
        answer: questionStates[index].answer,
      })),
    };

    const shareUrl = new URL(window.location.href);
    shareUrl.hash = new URLSearchParams({
      quiz: JSON.stringify(quiz),
    }).toString();
    showShareLink(shareUrl.href, quiz);
  });

  quizPanel.replaceChildren(form);
  creatorNameInput.focus();
}

function showShareLink(url, quiz) {
  const heading = document.createElement("h1");
  heading.textContent = "Your quiz is ready!";

  const message = document.createElement("p");
  message.textContent = "Copy this link and send it to your friends.";

  const linkInput = document.createElement("input");
  linkInput.type = "url";
  linkInput.value = url;
  linkInput.readOnly = true;
  linkInput.addEventListener("focus", () => linkInput.select());

  const copyButton = document.createElement("button");
  copyButton.className = "startbtn";
  copyButton.type = "button";
  copyButton.textContent = "Copy quiz link";

  const copyStatus = document.createElement("p");
  copyStatus.setAttribute("aria-live", "polite");

  const leaderboardButton = makeButton("View leaderboard", () => {
    showCreatorLeaderboard(url, quiz);
  });

  copyButton.addEventListener("click", async () => {
    if (!navigator.clipboard || !navigator.clipboard.writeText) {
      copyStatus.textContent =
        "Copying is unavailable here. Select the link above and copy it.";
      linkInput.focus();
      linkInput.select();
      return;
    }

    try {
      await navigator.clipboard.writeText(url);
      copyStatus.textContent = "Quiz link copied!";
    } catch {
      copyStatus.textContent =
        "Could not copy the link. Select the link above and copy it.";
      linkInput.focus();
      linkInput.select();
    }
  });

  quizPanel.replaceChildren(
    heading,
    message,
    linkInput,
    copyButton,
    copyStatus,
    leaderboardButton
  );
}

function showCreatorLeaderboard(url, quiz) {
  const heading = document.createElement("h1");
  heading.textContent = "Your quiz leaderboard";

  const note = document.createElement("p");
  note.textContent = "Scores are saved in this browser.";
  quizPanel.replaceChildren(heading, note);

  try {
    const leaderboard = loadLeaderboard(quiz);
    if (leaderboard.length === 0) {
      const emptyMessage = document.createElement("p");
      emptyMessage.textContent =
        "No one has taken this quiz in this browser yet.";
      quizPanel.append(emptyMessage);
    } else {
      quizPanel.append(createLeaderboardSection(leaderboard));
    }
  } catch {
    const errorMessage = document.createElement("p");
    errorMessage.className = "quiz-error";
    errorMessage.textContent =
      "The saved leaderboard could not be loaded from this browser.";
    quizPanel.append(errorMessage);
  }

  const backButton = document.createElement("button");
  backButton.className = "startbtn";
  backButton.type = "button";
  backButton.textContent = "Back to share link";
  backButton.addEventListener("click", () => showShareLink(url, quiz));
  quizPanel.append(backButton);
}

function validateQuiz(quiz) {
  const valid =
    quiz &&
    typeof quiz.creatorName === "string" &&
    Array.isArray(quiz.questions) &&
    quiz.questions.length > 0 &&
    quiz.questions.every(
      (question) =>
        typeof question.prompt === "string" &&
        Array.isArray(question.choices) &&
        question.choices.length >= 4 &&
        question.choices.every((choice) => typeof choice === "string") &&
        question.choices.includes(question.answer)
    );

  if (!valid) {
    throw new Error("The quiz link contains invalid quiz data.");
  }

  return quiz;
}

function showFriendQuiz(quiz) {
  const form = document.createElement("form");
  form.className = "quiz-form";

  const heading = document.createElement("h1");
  heading.textContent = `How well do you know ${quiz.creatorName}?`;
  form.append(heading);

  const friendNameInput = makeNameField(form, "Your name", "friend-name");
  const answers = Array(quiz.questions.length).fill("");

  quiz.questions.forEach((question, index) => {
    const fieldset = document.createElement("fieldset");
    fieldset.className = "quiz-question";

    const legend = document.createElement("legend");
    legend.textContent = question.prompt;

    const options = document.createElement("div");
    options.className = "choice-buttons";

    const addRow = document.createElement("div");
    addRow.className = "add-choice-row";

    const customInput = document.createElement("input");
    customInput.type = "text";
    customInput.placeholder = "Add your own answer";
    customInput.setAttribute("aria-label", `Add an answer for ${question.prompt}`);

    const status = document.createElement("p");
    status.className = "choice-status";
    status.setAttribute("aria-live", "polite");

    function selectAnswer(choice) {
      answers[index] = choice;
      options.querySelectorAll("button").forEach((button) => {
        const selected = button.dataset.answer === choice;
        button.classList.toggle("is-selected", selected);
        button.setAttribute("aria-pressed", String(selected));
      });
      status.textContent = "";
    }

    function addAnswerButton(choice) {
      const button = makeButton(choice, () => selectAnswer(choice), false);
      button.dataset.answer = choice;
      options.append(button);
      return button;
    }

    question.choices.forEach(addAnswerButton);

    const addButton = makeButton("Add my answer", () => {
      const choice = customInput.value.trim();
      customInput.setCustomValidity("");

      if (!choice) {
        customInput.setCustomValidity("Type your answer first.");
        customInput.reportValidity();
        return;
      }

      let existingButton = [...options.querySelectorAll("button")].find(
        (button) => button.dataset.answer.toLowerCase() === choice.toLowerCase()
      );

      if (!existingButton) {
        existingButton = addAnswerButton(choice);
      }

      selectAnswer(existingButton.dataset.answer);
      customInput.value = "";
    });

    addRow.append(customInput, addButton);
    fieldset.append(legend, options, addRow, status);
    fieldset.dataset.questionIndex = String(index);
    form.append(fieldset);
  });

  const submitButton = document.createElement("button");
  submitButton.className = "startbtn";
  submitButton.type = "submit";
  submitButton.textContent = "See my score";
  form.append(submitButton);

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const friendName = friendNameInput.value.trim();
    friendNameInput.setCustomValidity(
      friendName ? "" : "Please enter your name."
    );
    if (!friendName) {
      friendNameInput.reportValidity();
      return;
    }

    const unansweredIndex = answers.findIndex((answer) => !answer);
    if (unansweredIndex !== -1) {
      const fieldset = form.querySelector(
        `[data-question-index="${unansweredIndex}"]`
      );
      fieldset.querySelector(".choice-status").textContent =
        "Choose or add an answer before continuing.";
      fieldset.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    showResults(friendName, quiz, answers);
  });

  quizPanel.replaceChildren(form);
}

function showResults(friendName, quiz, answers) {
  const score = quiz.questions.reduce(
    (total, question, index) =>
      total + (answers[index] === question.answer ? 1 : 0),
    0
  );
  const total = quiz.questions.length;
  const percentage = Math.round((score / total) * 100);

  const heading = document.createElement("h1");
  heading.textContent = `Thanks, ${friendName}!`;

  const scoreMessage = document.createElement("p");
  scoreMessage.className = "score-summary";
  scoreMessage.textContent = `Your score: ${score} out of ${total} (${percentage}%)`;

  const homieMessage = document.createElement("p");
  homieMessage.className = "homie-message";
  homieMessage.textContent = getHomieMessage(percentage);

  quizPanel.replaceChildren(heading, scoreMessage, homieMessage);

  try {
    const leaderboard = saveAndSortScores(friendName, score, total, quiz);
    quizPanel.append(createLeaderboardSection(leaderboard));
  } catch {
    const storageError = document.createElement("p");
    storageError.className = "quiz-error";
    storageError.textContent =
      "Your score is shown, but it could not be saved to this browser's leaderboard.";
    quizPanel.append(storageError);
  }
}

function createLeaderboardSection(leaderboard) {
  const section = document.createElement("section");
  const heading = document.createElement("h2");
  heading.textContent = "Leaderboard";

  const list = document.createElement("ol");
  list.className = "leaderboard";
  leaderboard.forEach((entry) => {
    const item = document.createElement("li");
    const name = document.createElement("span");
    name.textContent = entry.name;

    const score = document.createElement("strong");
    const percentage = Math.round((entry.score / entry.total) * 100);
    score.textContent = `${entry.score}/${entry.total} (${percentage}%)`;

    item.append(name, score);
    list.append(item);
  });

  section.append(heading, list);
  return section;
}

function getHomieMessage(percentage) {
  if (percentage >= 90) {
    return "You're a real homie! You know them inside and out.";
  }
  if (percentage >= 70) {
    return "You're a great homie — you know them really well!";
  }
  if (percentage >= 50) {
    return "You're getting there, homie! Keep learning about each other.";
  }
  return "There's more to learn, homie. Keep making memories together!";
}

function saveAndSortScores(friendName, score, total, quiz) {
  const leaderboard = loadLeaderboard(quiz);

  const existingEntry = leaderboard.find(
    (entry) => entry.name.toLowerCase() === friendName.toLowerCase()
  );

  if (existingEntry) {
    existingEntry.name = friendName;
    existingEntry.total = total;
    existingEntry.score = Math.max(existingEntry.score, score);
  } else {
    leaderboard.push({ name: friendName, score, total });
  }

  sortLeaderboard(leaderboard);
  window.localStorage.setItem(getLeaderboardKey(quiz), JSON.stringify(leaderboard));
  return leaderboard;
}

function loadLeaderboard(quiz) {
  const savedScores = window.localStorage.getItem(getLeaderboardKey(quiz));
  const leaderboard = savedScores ? JSON.parse(savedScores) : [];

  if (
    !Array.isArray(leaderboard) ||
    !leaderboard.every(
      (entry) =>
        entry &&
        typeof entry.name === "string" &&
        Number.isInteger(entry.score) &&
        Number.isInteger(entry.total) &&
        entry.score >= 0 &&
        entry.total > 0 &&
        entry.score <= entry.total
    )
  ) {
    throw new Error("The saved leaderboard data is invalid.");
  }

  return sortLeaderboard(leaderboard);
}

function getLeaderboardKey(quiz) {
  return `homie-quiz-leaderboard:${encodeURIComponent(JSON.stringify(quiz))}`;
}

function sortLeaderboard(leaderboard) {
  return leaderboard.sort(
    (first, second) =>
      second.score - first.score || first.name.localeCompare(second.name)
  );
}

const sharedQuizData = new URLSearchParams(
  window.location.hash.slice(1)
).get("quiz");

if (sharedQuizData) {
  try {
    showFriendQuiz(validateQuiz(JSON.parse(sharedQuizData)));
  } catch {
    const errorMessage = document.createElement("p");
    errorMessage.className = "quiz-error";
    errorMessage.textContent =
      "This quiz link is invalid or could not be read.";
    quizPanel.replaceChildren(errorMessage);
  }
} else {
  showCreator();
}

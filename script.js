// ========================================
// MyLift
// ========================================

let workouts =
    JSON.parse(
        localStorage.getItem("myLiftWorkouts")
    ) || [];

let bodyWeight =
    localStorage.getItem("myLiftBodyWeight") || "63";

let setCount = 0;
let editSetCount = 0;

let progressChart = null;
let editingWorkoutId = null;


// ========================================
// START
// ========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        addSet();

        updateBodyWeightDisplay();

        refreshDashboard();

    }
);


// ========================================
// REFRESH EVERYTHING
// ========================================

function refreshDashboard() {

    updateDashboard();

    displayWorkouts();

    displayWorkoutHistory();

    updatePersonalRecords();

    updateExerciseDropdown();

    updateProgress();

}


// ========================================
// ADD SET
// ========================================

function addSet() {

    setCount++;

    const container =
        document.getElementById(
            "setsContainer"
        );

    const row =
        document.createElement("div");

    row.className =
        "set-row";

    row.innerHTML = `

        <div class="set-number">
            Set ${setCount}
        </div>

        <input
            type="number"
            class="weight-input"
            placeholder="Weight (kg)"
            min="0"
            step="0.5"
        >

        <input
            type="number"
            class="reps-input"
            placeholder="Reps"
            min="1"
        >

        <button
            class="remove-set-btn"
            onclick="removeSet(this)"
            type="button"
        >
            ×
        </button>

    `;

    container.appendChild(row);

}


// ========================================
// REMOVE SET
// ========================================

function removeSet(button) {

    button.parentElement.remove();

    renumberSets();

}


// ========================================
// RENUMBER SETS
// ========================================

function renumberSets() {

    const rows =
        document.querySelectorAll(
            "#setsContainer .set-row"
        );

    rows.forEach(
        function (row, index) {

            row.querySelector(
                ".set-number"
            ).textContent =
                "Set " + (index + 1);

        }
    );

    setCount =
        rows.length;

}


// ========================================
// ADD WORKOUT
// ========================================

function addWorkout() {

    const exercise =
        document.getElementById(
            "exercise"
        ).value.trim();

    if (!exercise) {

        alert(
            "Please enter an exercise name."
        );

        return;

    }

    const rows =
        document.querySelectorAll(
            "#setsContainer .set-row"
        );

    if (rows.length === 0) {

        alert(
            "Please add at least one set."
        );

        return;

    }

    const sets = [];

    let valid = true;

    rows.forEach(
        function (row) {

            const weight =
                Number(
                    row.querySelector(
                        ".weight-input"
                    ).value
                );

            const reps =
                Number(
                    row.querySelector(
                        ".reps-input"
                    ).value
                );

            if (
                weight <= 0 ||
                reps <= 0
            ) {

                valid = false;

            }

            sets.push({
                weight: weight,
                reps: reps
            });

        }
    );

    if (!valid) {

        alert(
            "Please enter weight and reps for every set."
        );

        return;

    }

    let volume = 0;

    sets.forEach(
        function (set) {

            volume +=
                set.weight *
                set.reps;

        }
    );

    const previousPR =
        getExercisePR(
            exercise
        );

    const newBest =
        Math.max(
            ...sets.map(
                function (set) {

                    return set.weight;

                }
            )
        );

    const workout = {

        id:
            Date.now(),

        date:
            new Date().toISOString(),

        exercise:
            exercise,

        sets:
            sets,

        volume:
            volume

    };

    workouts.push(workout);

    saveWorkouts();

    if (
        newBest > previousPR
    ) {

        alert(
            "🏆 NEW PERSONAL RECORD!\n\n" +
            exercise +
            "\n" +
            newBest +
            " kg"
        );

    } else {

        alert(
            "Workout saved! 💪"
        );

    }

    document.getElementById(
        "exercise"
    ).value = "";

    document.getElementById(
        "setsContainer"
    ).innerHTML = "";

    setCount = 0;

    addSet();

    refreshDashboard();

}


// ========================================
// SAVE WORKOUTS
// ========================================

function saveWorkouts() {

    localStorage.setItem(
        "myLiftWorkouts",
        JSON.stringify(workouts)
    );

}


// ========================================
// DASHBOARD STATS
// ========================================

function updateDashboard() {

    let totalSets = 0;

    let totalVolume = 0;

    workouts.forEach(
        function (workout) {

            if (!workout.sets) return;

            totalSets +=
                workout.sets.length;

            workout.sets.forEach(
                function (set) {

                    totalVolume +=
                        Number(set.weight) *
                        Number(set.reps);

                }
            );

        }
    );

    document.getElementById(
        "totalWorkouts"
    ).textContent =
        workouts.length;

    document.getElementById(
        "totalSets"
    ).textContent =
        totalSets;

    localStorage.setItem(
        "myLiftTotalVolume",
        totalVolume
    );

}


// ========================================
// DISPLAY RECENT WORKOUTS
// ========================================

function displayWorkouts() {

    const table =
        document.getElementById(
            "workoutTable"
        );

    const emptyMessage =
        document.getElementById(
            "emptyMessage"
        );

    table.innerHTML = "";

    if (
        workouts.length === 0
    ) {

        emptyMessage.style.display =
            "block";

        return;

    }

    emptyMessage.style.display =
        "none";

    const recent =
        [...workouts].reverse();

    recent.forEach(
        function (workout) {

            if (!workout.sets) return;

            workout.sets.forEach(
                function (set, index) {

                    const row =
                        document.createElement(
                            "tr"
                        );

                    row.innerHTML = `

                        <td>
                            ${escapeHTML(
                                workout.exercise
                            )}
                        </td>

                        <td>
                            ${index + 1}
                        </td>

                        <td>
                            ${set.weight} kg
                        </td>

                        <td>
                            ${set.reps}
                        </td>

                        <td>

                            ${
                                index === 0
                                    ? `
                                    <div class="action-buttons">

                                        <button
                                            class="edit-btn"
                                            onclick="openEditModal(${workout.id})"
                                            type="button"
                                        >
                                            Edit
                                        </button>

                                        <button
                                            class="delete-btn"
                                            onclick="deleteWorkout(${workout.id})"
                                            type="button"
                                        >
                                            Delete
                                        </button>

                                    </div>
                                    `
                                    : ""
                            }

                        </td>

                    `;

                    table.appendChild(row);

                }
            );

        }
    );

}


// ========================================
// WORKOUT HISTORY
// ========================================

function displayWorkoutHistory() {

    const container =
        document.getElementById(
            "historyContainer"
        );

    const empty =
        document.getElementById(
            "historyEmpty"
        );

    if (!container || !empty) return;

    container.innerHTML = "";

    if (
        workouts.length === 0
    ) {

        empty.style.display =
            "block";

        return;

    }

    empty.style.display =
        "none";

    const recent =
        [...workouts].reverse();

    recent.forEach(
        function (workout) {

            const item =
                document.createElement(
                    "div"
                );

            item.className =
                "history-item";

            const date =
                new Date(
                    workout.date
                );

            const formattedDate =
                date.toLocaleString(
                    undefined,
                    {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "numeric",
                        minute: "2-digit"
                    }
                );

            let setsHTML = "";

            workout.sets.forEach(
                function (set, index) {

                    setsHTML += `

                        <div class="history-set">

                            Set ${index + 1}:
                            ${set.weight} kg ×
                            ${set.reps} reps

                        </div>

                    `;

                }
            );

            item.innerHTML = `

                <div class="history-top">

                    <div>

                        <div class="history-exercise">

                            ${escapeHTML(
                                workout.exercise
                            )}

                        </div>

                        <div class="history-date">

                            ${formattedDate}

                        </div>

                    </div>

                </div>


                <div class="history-info">

                    ${setsHTML}

                </div>


                <div class="history-bottom">

                    <div class="history-volume">

                        Total Volume:
                        ${Number(
                            workout.volume || 0
                        ).toFixed(1)} kg

                    </div>


                    <div class="history-actions">

                        <button
                            class="edit-btn"
                            onclick="openEditModal(${workout.id})"
                            type="button"
                        >
                            Edit
                        </button>

                        <button
                            class="delete-btn"
                            onclick="deleteWorkout(${workout.id})"
                            type="button"
                        >
                            Delete
                        </button>

                    </div>

                </div>

            `;

            container.appendChild(item);

        }
    );

}


// ========================================
// DELETE WORKOUT
// ========================================

function deleteWorkout(id) {

    const workout =
        workouts.find(
            function (item) {

                return item.id === id;

            }
        );

    if (!workout) return;

    const confirmed =
        confirm(
            "Delete this workout?\n\n" +
            workout.exercise
        );

    if (!confirmed) return;

    workouts =
        workouts.filter(
            function (item) {

                return item.id !== id;

            }
        );

    saveWorkouts();

    refreshDashboard();

    alert(
        "Workout deleted."
    );

}


// ========================================
// OPEN EDIT MODAL
// ========================================

function openEditModal(id) {

    const workout =
        workouts.find(
            function (item) {

                return item.id === id;

            }
        );

    if (!workout) return;

    editingWorkoutId =
        id;

    document.getElementById(
        "editExercise"
    ).value =
        workout.exercise;

    const container =
        document.getElementById(
            "editSetsContainer"
        );

    container.innerHTML = "";

    editSetCount = 0;

    workout.sets.forEach(
        function (set) {

            addEditSet(
                set.weight,
                set.reps
            );

        }
    );

    document.getElementById(
        "editModal"
    ).classList.add(
        "show"
    );

}


// ========================================
// CLOSE EDIT MODAL
// ========================================

function closeEditModal() {

    editingWorkoutId = null;

    document.getElementById(
        "editModal"
    ).classList.remove(
        "show"
    );

}


// ========================================
// ADD EDIT SET
// ========================================

function addEditSet(
    weight = "",
    reps = ""
) {

    editSetCount++;

    const container =
        document.getElementById(
            "editSetsContainer"
        );

    const row =
        document.createElement(
            "div"
        );

    row.className =
        "set-row edit-set-row";

    row.innerHTML = `

        <div class="set-number">

            Set ${editSetCount}

        </div>


        <input
            type="number"
            class="weight-input edit-weight-input"
            placeholder="Weight (kg)"
            min="0"
            step="0.5"
            value="${weight}"
        >


        <input
            type="number"
            class="reps-input edit-reps-input"
            placeholder="Reps"
            min="1"
            value="${reps}"
        >


        <button
            class="remove-set-btn"
            onclick="removeEditSet(this)"
            type="button"
        >
            ×
        </button>

    `;

    container.appendChild(row);

}


// ========================================
// REMOVE EDIT SET
// ========================================

function removeEditSet(button) {

    button.parentElement.remove();

    renumberEditSets();

}


// ========================================
// RENUMBER EDIT SETS
// ========================================

function renumberEditSets() {

    const rows =
        document.querySelectorAll(
            "#editSetsContainer .set-row"
        );

    rows.forEach(
        function (row, index) {

            row.querySelector(
                ".set-number"
            ).textContent =
                "Set " + (index + 1);

        }
    );

    editSetCount =
        rows.length;

}


// ========================================
// SAVE EDITED WORKOUT
// ========================================

function saveEditedWorkout() {

    if (
        editingWorkoutId === null
    ) {

        return;

    }

    const exercise =
        document.getElementById(
            "editExercise"
        ).value.trim();

    if (!exercise) {

        alert(
            "Please enter an exercise name."
        );

        return;

    }

    const rows =
        document.querySelectorAll(
            "#editSetsContainer .set-row"
        );

    if (
        rows.length === 0
    ) {

        alert(
            "Please add at least one set."
        );

        return;

    }

    const sets = [];

    let valid = true;

    rows.forEach(
        function (row) {

            const weight =
                Number(
                    row.querySelector(
                        ".edit-weight-input"
                    ).value
                );

            const reps =
                Number(
                    row.querySelector(
                        ".edit-reps-input"
                    ).value
                );

            if (
                weight <= 0 ||
                reps <= 0
            ) {

                valid = false;

            }

            sets.push({

                weight:
                    weight,

                reps:
                    reps

            });

        }
    );

    if (!valid) {

        alert(
            "Please enter weight and reps for every set."
        );

        return;

    }

    let volume = 0;

    sets.forEach(
        function (set) {

            volume +=
                set.weight *
                set.reps;

        }
    );

    const workout =
        workouts.find(
            function (item) {

                return (
                    item.id ===
                    editingWorkoutId
                );

            }
        );

    if (!workout) return;

    workout.exercise =
        exercise;

    workout.sets =
        sets;

    workout.volume =
        volume;

    saveWorkouts();

    closeEditModal();

    refreshDashboard();

    alert(
        "Workout updated! 💪"
    );

}


// ========================================
// GET ALL EXERCISES
// ========================================

function getExercises() {

    const exercises = [];

    workouts.forEach(
        function (workout) {

            if (!workout.exercise) return;

            const name =
                workout.exercise.trim();

            const exists =
                exercises.some(
                    function (exercise) {

                        return (
                            exercise.toLowerCase()
                            ===
                            name.toLowerCase()
                        );

                    }
                );

            if (!exists) {

                exercises.push(name);

            }

        }
    );

    return exercises.sort(
        function (a, b) {

            return a.localeCompare(b);

        }
    );

}


// ========================================
// UPDATE EXERCISE DROPDOWN
// ========================================

function updateExerciseDropdown() {

    const select =
        document.getElementById(
            "progressExercise"
        );

    if (!select) return;

    const oldValue =
        select.value;

    select.innerHTML = `

        <option value="">
            Select Exercise
        </option>

    `;

    const exercises =
        getExercises();

    exercises.forEach(
        function (exercise) {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                exercise;

            option.textContent =
                exercise;

            select.appendChild(
                option
            );

        }
    );

    if (
        exercises.some(
            function (exercise) {

                return (
                    exercise.toLowerCase()
                    ===
                    oldValue.toLowerCase()
                );

            }
        )
    ) {

        select.value =
            oldValue;

    }

}


// ========================================
// GET PERSONAL RECORD
// ========================================

function getExercisePR(
    exercise
) {

    let best = 0;

    workouts.forEach(
        function (workout) {

            if (
                !workout.exercise ||
                !workout.sets
            ) {

                return;

            }

            if (
                workout.exercise
                    .trim()
                    .toLowerCase()
                ===
                exercise
                    .trim()
                    .toLowerCase()
            ) {

                workout.sets.forEach(
                    function (set) {

                        const weight =
                            Number(
                                set.weight
                            );

                        if (
                            weight > best
                        ) {

                            best =
                                weight;

                        }

                    }
                );

            }

        }
    );

    return best;

}


// ========================================
// PERSONAL RECORDS
// ========================================

function updatePersonalRecords() {

    const exercises =
        getExercises();

    let count = 0;

    exercises.forEach(
        function (exercise) {

            if (
                getExercisePR(
                    exercise
                ) > 0
            ) {

                count++;

            }

        }
    );

    const counter =
        document.getElementById(
            "personalRecords"
        );

    if (counter) {

        counter.textContent =
            count;

    }

    const container =
        document.getElementById(
            "personalRecordsList"
        );

    if (!container) return;

    container.innerHTML = "";

    if (
        exercises.length === 0
    ) {

        container.innerHTML = `

            <div class="empty-message">

                Start recording workouts to see
                your personal records.

            </div>

        `;

        return;

    }

    exercises.forEach(
        function (exercise) {

            const record =
                getExercisePR(
                    exercise
                );

            if (
                record <= 0
            ) {

                return;

            }

            const item =
                document.createElement(
                    "div"
                );

            item.className =
                "personal-record-item";

            item.innerHTML = `

                <div>

                    <div class="pr-exercise">

                        ${escapeHTML(
                            exercise
                        )}

                    </div>

                    <div class="pr-label">

                        Personal Best

                    </div>

                </div>


                <div class="pr-weight">

                    ${record} kg

                </div>

            `;

            container.appendChild(
                item
            );

        }
    );

}


// ========================================
// DRAW PROGRESS GRAPH
// ========================================

function drawProgressChart() {

    const select =
        document.getElementById(
            "progressExercise"
        );

    const canvas =
        document.getElementById(
            "progressChart"
        );

    const summary =
        document.getElementById(
            "progressSummary"
        );

    const exercise =
        select.value;

    if (!exercise) {

        if (progressChart) {

            progressChart.destroy();

            progressChart = null;

        }

        summary.textContent =
            "Select an exercise to see your progress.";

        return;

    }

    const exerciseWorkouts =
        workouts.filter(
            function (workout) {

                return (
                    workout.exercise &&
                    workout.exercise
                        .trim()
                        .toLowerCase()
                    ===
                    exercise
                        .trim()
                        .toLowerCase()
                );

            }
        );

    if (
        exerciseWorkouts.length === 0
    ) {

        summary.textContent =
            "No workouts recorded for " +
            exercise +
            " yet.";

        return;

    }

    const labels = [];

    const weights = [];

    exerciseWorkouts.forEach(
        function (workout) {

            if (
                !workout.sets ||
                workout.sets.length === 0
            ) {

                return;

            }

            const best =
                Math.max(
                    ...workout.sets.map(
                        function (set) {

                            return Number(
                                set.weight
                            );

                        }
                    )
                );

            const date =
                new Date(
                    workout.date
                );

            labels.push(
                date.toLocaleDateString(
                    undefined,
                    {
                        day: "numeric",
                        month: "short"
                    }
                )
            );

            weights.push(best);

        }
    );

    if (progressChart) {

        progressChart.destroy();

    }

    progressChart =
        new Chart(
            canvas.getContext("2d"),
            {

                type: "line",

                data: {

                    labels:
                        labels,

                    datasets: [

                        {

                            label:
                                exercise +
                                " Best Weight (kg)",

                            data:
                                weights,

                            tension:
                                0.3,

                            fill:
                                false,

                            borderWidth:
                                3,

                            pointRadius:
                                5

                        }

                    ]

                },

                options: {

                    responsive:
                        true,

                    maintainAspectRatio:
                        false,

                    scales: {

                        y: {

                            beginAtZero:
                                false,

                            title: {

                                display:
                                    true,

                                text:
                                    "Weight (kg)"

                            }

                        },

                        x: {

                            title: {

                                display:
                                    true,

                                text:
                                    "Workout Date"

                            }

                        }

                    }

                }

            }
        );

    const first =
        weights[0];

    const latest =
        weights[
            weights.length - 1
        ];

    const difference =
        latest - first;

    const percentage =
        first > 0
            ? (
                difference /
                first
            ) * 100
            : 0;

    if (difference > 0) {

        summary.textContent =
            `🔥 ${exercise}: ${latest} kg best — ` +
            `up ${difference.toFixed(1)} kg ` +
            `(${percentage.toFixed(1)}%) from your first workout.`;

    }

    else if (
        difference === 0
    ) {

        summary.textContent =
            `📊 ${exercise}: ${latest} kg best. Keep pushing!`;

    }

    else {

        summary.textContent =
            `💪 ${exercise}: current best is ${latest} kg. Keep training!`;

    }

}


// ========================================
// UPDATE PROGRESS
// ========================================

function updateProgress() {

    updateExerciseDropdown();

    const select =
        document.getElementById(
            "progressExercise"
        );

    if (
        select &&
        select.value
    ) {

        drawProgressChart();

    }

}


// ========================================
// BODY WEIGHT
// ========================================

function updateWeight() {

    const input =
        document.getElementById(
            "newWeight"
        );

    const weight =
        Number(
            input.value
        );

    if (
        !weight ||
        weight <= 0
    ) {

        alert(
            "Please enter a valid weight."
        );

        return;

    }

    bodyWeight =
        weight;

    localStorage.setItem(
        "myLiftBodyWeight",
        bodyWeight
    );

    updateBodyWeightDisplay();

    input.value = "";

    alert(
        "Body weight updated! ⚖️"
    );

}


// ========================================
// BODY WEIGHT DISPLAY
// ========================================

function updateBodyWeightDisplay() {

    const dashboardWeight =
        document.getElementById(
            "dashboardWeight"
        );

    const currentWeight =
        document.getElementById(
            "currentWeight"
        );

    if (dashboardWeight) {

        dashboardWeight.textContent =
            bodyWeight;

    }

    if (currentWeight) {

        currentWeight.textContent =
            bodyWeight +
            " kg";

    }

}


// ========================================
// SAFE TEXT
// ========================================

function escapeHTML(value) {

    const div =
        document.createElement(
            "div"
        );

    div.textContent =
        value;

    return div.innerHTML;

}


// ========================================
// CLOSE MODAL WHEN CLICKING OUTSIDE
// ========================================

document.addEventListener(
    "click",
    function (event) {

        const modal =
            document.getElementById(
                "editModal"
            );

        if (
            event.target === modal
        ) {

            closeEditModal();

        }

    }
);
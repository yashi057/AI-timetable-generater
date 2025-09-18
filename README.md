# AI Timetable Generator

An intelligent timetable (schedule) generation tool that automatically allocates classes, rooms, teachers, and time slots while respecting academic and logistical constraints. Useful for schools, colleges, training centers, bootcamps, and any structured learning program.

> Replace placeholder sections (⚠️ TODO) with details specific to your implementation as you build the project.

---

## 🔑 Key Features
- Constraint-aware scheduling (no teacher/room clashes)
- Room capacity + resource matching (e.g., Lab vs Lecture Hall)
- Multiple sections / batches / semesters
- Flexible time slot granularity (e.g. 30 / 45 / 60 mins)
- Soft vs hard constraint handling
- Optimization goals (e.g. balance daily load, minimize gaps)
- Export to CSV / JSON / (future: ICS calendar)
- Pluggable solving strategies (ILP / heuristic / evolutionary)
- CLI + (planned) Web UI

---

## 🧠 How It Works (High-Level Architecture)

| Layer | Responsibility |
|-------|----------------|
| Input Parsers | Load courses, teachers, rooms, constraints (JSON/CSV) |
| Preprocessor | Validates & normalizes input data |
| Solver Core | Applies optimization / constraint solving to build timetable |
| Conflict Detector | Finds and resolves violations |
| Exporters | Generates human-friendly outputs (table, CSV, JSON) |
| (Optional) Web API | Serve schedules on demand |

---

## 📂 Project Structure (Proposed)
```
AI-timetable-generater/
├─ data/
│  ├─ samples/
│  │  ├─ courses.sample.json
│  │  ├─ teachers.sample.json
│  │  ├─ rooms.sample.json
│  │  └─ constraints.sample.json
├─ src/
│  ├─ main.py
│  ├─ models/
│  ├─ solvers/
│  ├─ exporters/
│  ├─ validators/
│  └─ utils/
├─ tests/
├─ requirements.txt
├─ README.md
└─ LICENSE
```

> Adjust to match your actual code layout.

---

## 🚀 Quick Start

```bash
# 1. Clone
git clone https://github.com/yashi057/AI-timetable-generater.git
cd AI-timetable-generater

# 2. (Optional) Create virtual environment
python -m venv .venv
source .venv/bin/activate      # Linux / macOS
# or
.\.venv\Scripts\activate       # Windows

# 3. Install dependencies
pip install -r requirements.txt

# 4. Run generator (example)
python src/main.py --input data/samples --solver ilp --output out/
```

---

## 🧪 Example Input (courses.sample.json)
```json
[
  {
    "course_id": "CS101",
    "name": "Intro to CS",
    "teacher_id": "T01",
    "duration_blocks": 2,
    "sessions_per_week": 3,
    "group_id": "G1",
    "room_type": "LECTURE"
  }
]
```

## Example Constraints (constraints.sample.json)
```json
{
  "time_slots": ["MON-09", "MON-10", "MON-11", "TUE-09", "TUE-10"],
  "unavailable_teachers": {
    "T01": ["MON-11"]
  },
  "unavailable_rooms": {
    "LAB-A": ["TUE-09"]
  },
  "max_daily_load_per_group": 5,
  "soft_constraints": {
    "avoid_consecutive_for_teacher": true,
    "prefer_morning_for": ["CS101"]
  }
}
```

---

## 🧮 Solving Strategies (Planned / Current)
| Strategy | Status | Notes |
|----------|--------|-------|
| Integer Linear Programming (PuLP / OR-Tools) | ⚠️ TODO | Deterministic, good for small–medium cases |
| Backtracking + Pruning | ⚠️ TODO | Simple, may be slow for large instances |
| Genetic Algorithm | ⚠️ TODO | Good for large fuzzy constraint sets |
| Simulated Annealing | ⚠️ TODO | For incremental improvement |
| Hybrid (ILP seed + metaheuristic refinement) | ⚠️ TODO | Future enhancement |

---

## 🖥️ CLI Usage (Proposed)
```bash
python src/main.py \
  --courses data/samples/courses.sample.json \
  --teachers data/samples/teachers.sample.json \
  --rooms data/samples/rooms.sample.json \
  --constraints data/samples/constraints.sample.json \
  --solver ilp \
  --output out/
```

### Flags (Design Draft)
| Flag | Description | Default |
|------|-------------|---------|
| `--solver` | `ilp`, `ga`, `sa`, `bt` | `ilp` |
| `--max-iterations` | For heuristic solvers | 1000 |
| `--export-formats` | `json,csv,txt` | `json` |
| `--seed` | Random seed | None |

---

## 📤 Output
Example JSON (out/schedule.json):
```json

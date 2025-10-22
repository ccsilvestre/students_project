import React, { useEffect, useState, useMemo } from "react";
import "./App.css";

function App() {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [query, setQuery] = useState("");

  // Load students list from backend on mount (falls back to local sample)
  useEffect(() => {
    fetch("http://localhost:5000/students")
      .then((res) => {
        if (!res.ok) throw new Error("Network response not ok");
        return res.json();
      })
      .then((data) => {
        // Ensure each student at least has an age (fallback)
        const normalized = (data || []).map((s) => ({
          ...s,
          age: s.age ?? (18 + (s.id % 10)), // fallback age if backend doesn't include it
        }));
        setStudents(normalized);
      })
      .catch((err) => {
        console.warn("Backend fetch failed — using sample data.", err);
        // fallback sample data
        setStudents([
          { id: 1, name: "Sky", course: "BSIT", age: 19 },
          { id: 2, name: "Zephyr", course: "BSCpE", age: 20 },
          { id: 3, name: "Quinn", course: "BSCS", age: 21 },
          { id: 4, name: "Alexie", course: "BSOA", age: 22 },
        ]);
      });
  }, []);

  // Filtered list (search by name, course or id)
  const filteredStudents = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return students;
    return students.filter(
      (s) =>
        String(s.name).toLowerCase().includes(q) ||
        String(s.course).toLowerCase().includes(q) ||
        String(s.id).toLowerCase().includes(q)
    );
  }, [students, query]);

  // When clicking View: attempt to fetch detail from backend, otherwise use local data
  const viewStudent = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/students/${id}`);
      if (!res.ok) throw new Error("Fetch student failed");
      const data = await res.json();
      setSelectedStudent({ ...data, age: data.age ?? (18 + (data.id % 10)) });
      return;
    } catch (err) {
      // fallback to local list item
      const local = students.find((s) => s.id === id);
      setSelectedStudent(local ?? null);
    }
  };

  const closeModal = () => setSelectedStudent(null);
  const clearQuery = () => setQuery("");

  return (
    <div className="app">
      <div className="card">
        <h1 className="title">🎓 Students List</h1>

        {/* Search */}
        <div className="search-wrapper">
          <div className="search-box">
            <input
              type="search"
              className="search-input"
              placeholder="Search by name, course or id..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search students"
            />
            {query && (
              <span
                className="clear-icon"
                onClick={clearQuery}
                role="button"
                aria-label="Clear search"
                title="Clear"
              >
                ✕
              </span>
            )}
          </div>
        </div>

        <p className="results-summary">
          Showing {filteredStudents.length} of {students.length} student
          {students.length !== 1 ? "s" : ""}
        </p>

        {/* Student list */}
        {filteredStudents.length > 0 ? (
          <ul className="student-list">
            {filteredStudents.map((s) => (
              <li key={s.id} className="student-item">
                <div className="student-left">
                  <div className="student-name">{s.name}</div>
                  <div className="student-course">{s.course}</div>
                </div>
                <button
                  className="view-btn"
                  onClick={() => viewStudent(s.id)}
                  aria-label={`View ${s.name}`}
                >
                  View
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="loading-text">No students found.</p>
        )}

        {/* Modal */}
        {selectedStudent && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal profile-card" onClick={(e) => e.stopPropagation()}>
              <div className="profile-avatar">
                <img
                  src={`https://api.dicebear.com/9.x/adventurer/svg?seed=${encodeURIComponent(
                    selectedStudent.name
                  )}`}
                  alt={selectedStudent.name}
                />
              </div>

              <h2>{selectedStudent.name}</h2>
              <p className="course">
                <strong>Course: </strong>
                {selectedStudent.course}
              </p>

              {/* AGE — explicitly shown */}
              <p className="age">
                <strong>Age: </strong>
                {selectedStudent.age ?? "—"}
              </p>

              <button className="close-btn" onClick={closeModal}>
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;





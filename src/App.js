import React, { useState, useEffect } from "react";

const KanbanBoard = () => {
  const [tickets, setTickets] = useState([]);
  const [users, setUsers] = useState([]);
  const [grouping, setGrouping] = useState(
    localStorage.getItem("grouping") || "status"
  );
  const [sorting, setSorting] = useState(
    localStorage.getItem("sorting") || "priority"
  );
  const [isDisplayOpen, setIsDisplayOpen] = useState(false);

  useEffect(() => {
    fetchData();
    const savedGrouping = localStorage.getItem("grouping");
    const savedSorting = localStorage.getItem("sorting");
    if (savedGrouping) setGrouping(savedGrouping);
    if (savedSorting) setSorting(savedSorting);
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch(
        "https://api.quicksell.co/v1/internal/frontend-assignment"
      );
      const data = await response.json();
      setTickets(data.tickets);
      setUsers(data.users);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case "todo":
        return "○";
      case "in progress":
        return "○";
      case "done":
        return "✓";
      case "canceled":
        return "×";
      case "backlog":
        return "•";
      default:
        return "•";
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "todo":
        return "#e2e2e2";
      case "in progress":
        return "#f1c950";
      case "done":
        return "#5c6cff";
      case "canceled":
        return "#94a2b3";
      case "backlog":
        return "#e2e2e2";
      default:
        return "#e2e2e2";
    }
  };

  const sortTickets = (ticketsToSort) => {
    return [...ticketsToSort].sort((a, b) => {
      if (sorting === "priority") {
        return b.priority - a.priority;
      }
      return a.title.localeCompare(b.title);
    });
  };

  const groupTickets = () => {
    let groupedData = {};

    if (grouping === "status") {
      groupedData = {
        Todo: [],
        "In Progress": [],
        Done: [],
        Canceled: [],
        Backlog: [],
      };
      tickets.forEach((ticket) => {
        const status =
          ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1);
        if (groupedData[status]) {
          groupedData[status].push(ticket);
        }
      });
    } else if (grouping === "user") {
      users.forEach((user) => {
        groupedData[user.id] = [];
      });
      tickets.forEach((ticket) => {
        if (groupedData[ticket.userId]) {
          groupedData[ticket.userId].push(ticket);
        }
      });
    } else if (grouping === "priority") {
      groupedData = {
        4: [],
        3: [],
        2: [],
        1: [],
        0: [],
      };
      tickets.forEach((ticket) => {
        groupedData[ticket.priority].push(ticket);
      });
    }

    Object.keys(groupedData).forEach((key) => {
      groupedData[key] = sortTickets(groupedData[key]);
    });

    return groupedData;
  };

  const handleGroupingChange = (newGrouping) => {
    setGrouping(newGrouping);
    localStorage.setItem("grouping", newGrouping);
  };

  const handleSortingChange = (newSorting) => {
    setSorting(newSorting);
    localStorage.setItem("sorting", newSorting);
  };

  const getGroupTitle = (key) => {
    if (grouping === "user") {
      const user = users.find((u) => u.id === key);
      return user ? user.name : key;
    } else if (grouping === "priority") {
      return ["No Priority", "Low", "Medium", "High", "Urgent"][parseInt(key)];
    }
    return key;
  };

  return (
    <div
      style={{
        backgroundColor: "#f4f5f8",
        minHeight: "100vh",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* Header */}
      <div
        style={{
          borderBottom: "1px solid #e2e2e2",
          backgroundColor: "white",
          padding: "10px 20px",
        }}
      >
        <button
          onClick={() => setIsDisplayOpen(!isDisplayOpen)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "4px 12px",
            border: "1px solid #e2e2e2",
            borderRadius: "4px",
            backgroundColor: "white",
            cursor: "pointer",
          }}
        >
          <span>≡</span>
          <span style={{ marginRight: "8px" }}>Display</span>
          <span>▼</span>
        </button>

        {isDisplayOpen && (
          <div
            style={{
              position: "absolute",
              top: "50px",
              left: "20px",
              backgroundColor: "white",
              borderRadius: "8px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              padding: "16px",
              minWidth: "200px",
              border: "1px solid #e2e2e2",
              zIndex: 1000,
            }}
          >
            <div style={{ marginBottom: "16px" }}>
              <div
                style={{ marginBottom: "8px", fontSize: "14px", color: "#666" }}
              >
                Grouping
              </div>
              <select
                value={grouping}
                onChange={(e) => handleGroupingChange(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "1px solid #e2e2e2",
                  borderRadius: "4px",
                }}
              >
                <option value="status">Status</option>
                <option value="user">User</option>
                <option value="priority">Priority</option>
              </select>
            </div>
            <div>
              <div
                style={{ marginBottom: "8px", fontSize: "14px", color: "#666" }}
              >
                Ordering
              </div>
              <select
                value={sorting}
                onChange={(e) => handleSortingChange(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "1px solid #e2e2e2",
                  borderRadius: "4px",
                }}
              >
                <option value="priority">Priority</option>
                <option value="title">Title</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Board */}
      <div
        style={{
          padding: "20px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: "20px",
          alignItems: "start",
        }}
      >
        {Object.entries(groupTickets()).map(([key, groupTickets]) => (
          <div key={key}>
            {/* Column Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "16px",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <span
                  style={{
                    color: getStatusColor(key),
                    fontSize: "16px",
                  }}
                >
                  {getStatusIcon(key)}
                </span>
                <span style={{ fontWeight: 500 }}>{getGroupTitle(key)}</span>
                <span style={{ color: "#666" }}>{groupTickets.length}</span>
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  style={{
                    border: "none",
                    background: "none",
                    cursor: "pointer",
                    fontSize: "18px",
                    color: "#666",
                  }}
                >
                  +
                </button>
                <button
                  style={{
                    border: "none",
                    background: "none",
                    cursor: "pointer",
                    fontSize: "18px",
                    color: "#666",
                  }}
                >
                  •••
                </button>
              </div>
            </div>

            {/* Tickets */}
            <div
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              {groupTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  style={{
                    backgroundColor: "white",
                    borderRadius: "8px",
                    padding: "16px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                    border: "1px solid #e2e2e2",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "8px",
                    }}
                  >
                    <span style={{ color: "#666", fontSize: "14px" }}>
                      {ticket.id}
                    </span>
                    <div
                      style={{
                        width: "24px",
                        height: "24px",
                        borderRadius: "50%",
                        backgroundColor: "#e2e2e2",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "12px",
                      }}
                    >
                      👤
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: 500,
                      marginBottom: "12px",
                    }}
                  >
                    {ticket.title}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                      alignItems: "center",
                    }}
                  >
                    {ticket.tag.map((tag, index) => (
                      <span
                        key={index}
                        style={{
                          padding: "2px 8px",
                          borderRadius: "4px",
                          backgroundColor: "#f4f5f8",
                          fontSize: "12px",
                          color: "#666",
                          border: "1px solid #e2e2e2",
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KanbanBoard;

import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import "../css/ManageRoutes.css";

const RouteApp = () => {
  const [routes, setRoutes] = useState([]);
  const [availablePoints, setAvailablePoints] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPointsModal, setShowPointsModal] = useState(false);
  const [editingRoute, setEditingRoute] = useState(null);

  // Form state
  const [routeName, setRouteName] = useState("");
  const [routePoints, setRoutePoints] = useState([{ stopId: "", time: "" }]);

  // Delete modal state
  const [selectedForDelete, setSelectedForDelete] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  // Points modal state
  const [newPointName, setNewPointName] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [routesRes, stopsRes] = await Promise.all([
        fetch("http://localhost:3000/routes"),
        fetch("http://localhost:3000/stops"),
      ]);
      if (!routesRes.ok || !stopsRes.ok) {
        throw new Error("Failed to fetch data");
      }
      const routesData = await routesRes.json();
      const stopsData = await stopsRes.json();
      setRoutes(routesData);
      setAvailablePoints(stopsData);
    } catch (error) {
      console.error("Error fetching data:", error);
      Swal.fire("Error", "Could not load data from server.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const closeModalAndReset = () => {
    setShowCreateModal(false);
    setEditingRoute(null);
    setRouteName("");
    setRoutePoints([{ stopId: "", time: "" }]);
  };

  const handleCreateRoute = () => {
    setShowCreateModal(true);
    setEditingRoute(null);
    setRouteName("");
    setRoutePoints([{ stopId: "", time: "" }]);
  };

  const handleEditRoute = (route) => {
    setEditingRoute(route);
    setRouteName(route.name);
    const pointsToSet =
      route.points && route.points.length > 0
        ? route.points.map((p) => ({
            stopId: p.stopId.toString(),
            time: p.time ? p.time.toString() : "",
          }))
        : [{ stopId: "", time: "" }];
    setRoutePoints(pointsToSet);
    setShowCreateModal(true);
  };

  const addPoint = () => {
    setRoutePoints([...routePoints, { stopId: "", time: "" }]);
  };

  const updatePoint = (index, field, value) => {
    const newPoints = [...routePoints];
    newPoints[index][field] = value;
    setRoutePoints(newPoints);
  };

  const removePoint = (index) => {
    if (routePoints.length > 1) {
      setRoutePoints(routePoints.filter((_, i) => i !== index));
    }
  };

  const confirmRoute = async () => {
    if (!routeName.trim()) {
      Swal.fire("ข้อมูลไม่ครบ", "กรุณากรอกชื่อเส้นทาง", "warning");
      return;
    }

    const finalPoints = routePoints.map((p) => ({
      stopId: parseInt(p.stopId, 10),
      time: parseInt(p.time, 10),
    }));

    if (finalPoints.some((p) => !p.stopId || isNaN(p.time) || p.time < 0)) {
      Swal.fire(
        "ข้อมูลไม่ครบ",
        "กรุณากรอกข้อมูลจุดจอดและเวลาให้ถูกต้อง",
        "warning"
      );
      return;
    }

    const routeData = {
      routeName: routeName,
      points: finalPoints,
    };

    const url = editingRoute
      ? `http://localhost:3000/routes/${editingRoute.id}`
      : "http://localhost:3000/routes";
    const method = editingRoute ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(routeData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save route");
      }

      Swal.fire(
        "สำเร็จ!",
        `เส้นทางถูก${editingRoute ? "แก้ไข" : "สร้าง"}เรียบร้อยแล้ว`,
        "success"
      );
      closeModalAndReset();
      fetchData(); // Re-fetch all data to update the UI
    } catch (error) {
      console.error("Error saving route:", error);
      Swal.fire("ผิดพลาด", error.message, "error");
    }
  };

  const handleDeleteRoutes = () => {
    setSelectedForDelete([]);
    setSelectAll(false);
    setShowDeleteModal(true);
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedForDelete([]);
    } else {
      setSelectedForDelete(routes.map((r) => r.id));
    }
    setSelectAll(!selectAll);
  };

  const toggleSelectRoute = (routeId) => {
    if (selectedForDelete.includes(routeId)) {
      setSelectedForDelete(selectedForDelete.filter((id) => id !== routeId));
    } else {
      setSelectedForDelete([...selectedForDelete, routeId]);
    }
  };

  const confirmDelete = async () => {
    if (selectedForDelete.length === 0) {
      Swal.fire("ไม่ได้เลือก", "กรุณาเลือกเส้นทางที่ต้องการลบ", "warning");
      return;
    }

    const result = await Swal.fire({
      title: "คุณแน่ใจหรือไม่?",
      text: `คุณกำลังจะลบ ${selectedForDelete.length} เส้นทาง`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ใช่, ลบเลย!",
      cancelButtonText: "ยกเลิก",
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch("http://localhost:3000/routes", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids: selectedForDelete }),
        });
        if (!response.ok) throw new Error("Failed to delete routes.");
        Swal.fire("ลบแล้ว!", "เส้นทางที่เลือกถูกลบเรียบร้อยแล้ว", "success");
        setShowDeleteModal(false);
        fetchData();
      } catch (error) {
        Swal.fire("ผิดพลาด", error.message, "error");
      }
    }
  };

  const handleManagePoints = () => {
    setNewPointName("");
    setShowPointsModal(true);
  };

  const addNewPoint = async () => {
    if (!newPointName.trim()) {
      Swal.fire("ข้อมูลไม่ครบ", "กรุณากรอกชื่อจุด", "warning");
      return;
    }
    try {
      const response = await fetch("http://localhost:3000/stops", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stopName: newPointName.trim() }),
      });
      if (!response.ok) throw new Error("Failed to add new point.");
      setNewPointName("");
      const stopsRes = await fetch("http://localhost:3000/stops");
      setAvailablePoints(await stopsRes.json());
      Swal.fire("สำเร็จ!", "เพิ่มจุดใหม่เรียบร้อยแล้ว", "success");
    } catch (error) {
      Swal.fire("ผิดพลาด", error.message, "error");
    }
  };

  const deletePoint = async (pointId) => {
    const result = await Swal.fire({
      title: "คุณแน่ใจหรือไม่?",
      text: "คุณกำลังจะลบจุดนี้",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ใช่, ลบเลย!",
      cancelButtonText: "ยกเลิก",
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`http://localhost:3000/stops/${pointId}`, {
          method: "DELETE",
        });
        if (!response.ok)
          throw new Error(
            "Failed to delete point. It might be used in a route."
          );
        setAvailablePoints(availablePoints.filter((p) => p.id !== pointId));
        Swal.fire("ลบแล้ว!", "จุดถูกลบเรียบร้อยแล้ว", "success");
      } catch (error) {
        Swal.fire("ผิดพลาด", error.message, "error");
      }
    }
  };

  return (
    <div className="route-app">
      <div className="header">
        <h2>จัดการเส้นทาง</h2>
        <div className="header-buttons">
          <button className="btn btn-yellow" onClick={handleManagePoints}>
            จัดการจุดทั้งหมด
          </button>
          <button className="btn btn-red" onClick={handleDeleteRoutes}>
            ลบเส้นทาง
          </button>
          <button className="btn btn-green" onClick={handleCreateRoute}>
            สร้างเส้นทางใหม่
          </button>
        </div>
      </div>

      <div className="routes-container">
        {loading ? (
          <div className="no-routes">กำลังโหลดข้อมูล...</div>
        ) : routes.length === 0 ? (
          <div className="no-routes">
            ยังไม่มีเส้นทาง กรุณากดปุ่ม "สร้างเส้นทางใหม่"
          </div>
        ) : (
          <div className="routes-grid">
            {routes.map((route, index) => (
              <div key={route.id} className="route-table">
                <div className="route-header">
                  <span>เส้นทางที่ {index + 1}</span>
                  <button
                    className="btn-edit"
                    onClick={() => handleEditRoute(route)}
                  >
                    Edit
                  </button>
                </div>
                <div className="route-info">
                  <div>ชื่อเส้นทาง: {route.name}</div>
                  <div>เวลารวม: {route.totalTime} นาที</div>
                </div>
                <table className="route-points-table">
                  <thead>
                    <tr>
                      <th>ลำดับ</th>
                      <th>ชื่อจุด</th>
                      <th>เวลา (นาที)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {route.points.map((point, pointIndex) => (
                      <tr key={pointIndex}>
                        <td>จุดที่ {pointIndex + 1}</td>
                        <td>{point.point || `Stop ID: ${point.stopId}`}</td>
                        <td>
                          {parseInt(point.time) > 0
                            ? `${point.time} นาที`
                            : "0 นาที"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Route Modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>{editingRoute ? "แก้ไขเส้นทาง" : "สร้างเส้นทางใหม่"}</h3>
            <div className="form-group">
              <label>ชื่อเส้นทาง:</label>
              <input
                type="text"
                value={routeName}
                onChange={(e) => setRouteName(e.target.value)}
                placeholder="เส้นทาง 1"
              />
            </div>

            <div className="points-container">
              {routePoints.map((point, index) => (
                <div key={index} className="point-row">
                  <span>จุดที่ {index + 1}</span>
                  <select
                    value={point.stopId}
                    onChange={(e) =>
                      updatePoint(index, "stopId", e.target.value)
                    }
                  >
                    <option value="">เลือกจุด</option>
                    {availablePoints.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    value={point.time}
                    onChange={(e) => updatePoint(index, "time", e.target.value)}
                    placeholder="เวลา"
                  />
                  <span>นาที</span>
                  {routePoints.length > 1 && (
                    <button
                      className="btn-remove"
                      onClick={() => removePoint(index)}
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button className="btn btn-add-point" onClick={addPoint}>
              + เพิ่มจุด
            </button>

            <div className="modal-buttons">
              <button className="btn btn-cancel" onClick={closeModalAndReset}>
                ยกเลิก
              </button>
              <button className="btn btn-confirm" onClick={confirmRoute}>
                ยืนยัน
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Routes Modal */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>ลบเส้นทาง</h3>
            <div className="routes-list">
              <div className="select-all">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={toggleSelectAll}
                />
                <label>เลือกทั้งหมด</label>
              </div>
              {routes.map((route, index) => (
                <div key={route.id} className="route-item">
                  <input
                    type="checkbox"
                    checked={selectedForDelete.includes(route.id)}
                    onChange={() => toggleSelectRoute(route.id)}
                  />
                  <label>
                    {index + 1}. เส้นทางที่ {index + 1}
                  </label>
                </div>
              ))}
            </div>
            <div className="modal-buttons">
              <button
                className="btn btn-cancel"
                onClick={() => setShowDeleteModal(false)}
              >
                ยกเลิก
              </button>
              <button
                className="btn btn-confirm-delete"
                onClick={confirmDelete}
              >
                ยืนยัน
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manage Points Modal */}
      {showPointsModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>จัดการจุดทั้งหมด</h3>
            <div className="points-management">
              <div className="current-points">
                <h4>จุดที่มีอยู่:</h4>
                {availablePoints.map((point) => (
                  <div key={point.id} className="point-item">
                    <span>{point.name}</span>
                    <button
                      className="btn-delete-point"
                      onClick={() => deletePoint(point.id)}
                    >
                      ลบ
                    </button>
                  </div>
                ))}
              </div>

              <div className="add-point-section">
                <h4>เพิ่มจุดใหม่:</h4>
                <div className="add-point-form">
                  <input
                    type="text"
                    value={newPointName}
                    onChange={(e) => setNewPointName(e.target.value)}
                    placeholder="ชื่อจุดใหม่"
                  />
                  <button className="btn btn-add" onClick={addNewPoint}>
                    เพิ่ม
                  </button>
                </div>
              </div>
            </div>

            <div className="modal-buttons">
              <button
                className="btn btn-cancel"
                onClick={() => setShowPointsModal(false)}
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RouteApp;

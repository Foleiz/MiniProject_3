import React, { useState } from 'react';
import '../css/ManageRoutes.css';

const RouteApp = () => {
  const [routes, setRoutes] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPointsModal, setShowPointsModal] = useState(false);
  const [editingRoute, setEditingRoute] = useState(null);
  
  // Available points (mock data)
  const [availablePoints, setAvailablePoints] = useState([
    'มาวิทยาลัยเทคโนโลยีมหานคร',
    'โลตัสหนองจอก',
    'ตลาดหนองจอก',
    'บิ๊กซีหนองจอก',
    'สวนสาธารณหนองจอก'
  ]);

  // Form state
  const [routeName, setRouteName] = useState('');
  const [routePoints, setRoutePoints] = useState([{ point: '', time: '' }]);
  
  // Delete modal state
  const [selectedForDelete, setSelectedForDelete] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  // Points modal state
  const [newPointName, setNewPointName] = useState('');

  const handleCreateRoute = () => {
    setShowCreateModal(true);
    setEditingRoute(null);
    setRouteName('');
    setRoutePoints([{ point: '', time: '' }]);
  };

  const handleEditRoute = (route) => {
    setEditingRoute(route);
    setRouteName(route.name);
    setRoutePoints(route.points);
    setShowCreateModal(true);
  };

  const addPoint = () => {
    setRoutePoints([...routePoints, { point: '', time: '' }]);
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

  const calculateTotalTime = () => {
    return routePoints.reduce((total, point) => {
      return total + (parseInt(point.time) || 0);
    }, 0);
  };

  const confirmRoute = () => {
    if (!routeName.trim()) {
      alert('กรุณากรอกชื่อเส้นทาง');
      return;
    }

    const hasEmptyPoints = routePoints.some(p => !p.point || !p.time);
    if (hasEmptyPoints) {
      alert('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    const newRoute = {
      id: editingRoute ? editingRoute.id : Date.now(),
      name: routeName,
      points: [...routePoints],
      totalTime: calculateTotalTime()
    };

    if (editingRoute) {
      setRoutes(routes.map(r => r.id === editingRoute.id ? newRoute : r));
    } else {
      setRoutes([...routes, newRoute]);
    }

    setShowCreateModal(false);
    setRouteName('');
    setRoutePoints([{ point: '', time: '' }]);
    setEditingRoute(null);
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
      setSelectedForDelete(routes.map(r => r.id));
    }
    setSelectAll(!selectAll);
  };

  const toggleSelectRoute = (routeId) => {
    if (selectedForDelete.includes(routeId)) {
      setSelectedForDelete(selectedForDelete.filter(id => id !== routeId));
    } else {
      setSelectedForDelete([...selectedForDelete, routeId]);
    }
  };

  const confirmDelete = () => {
    if (selectedForDelete.length === 0) {
      alert('กรุณาเลือกเส้นทางที่ต้องการลบ');
      return;
    }

    const confirmMessage = `คุณต้องการลบเส้นทาง ${selectedForDelete.length} เส้นทางหรือไม่?`;
    if (window.confirm(confirmMessage)) {
      setRoutes(routes.filter(r => !selectedForDelete.includes(r.id)));
      setShowDeleteModal(false);
      setSelectedForDelete([]);
      setSelectAll(false);
    }
  };

  const handleManagePoints = () => {
    setNewPointName('');
    setShowPointsModal(true);
  };

  const addNewPoint = () => {
    if (!newPointName.trim()) {
      alert('กรุณากรอกชื่อจุด');
      return;
    }

    if (availablePoints.includes(newPointName.trim())) {
      alert('จุดนี้มีอยู่แล้ว');
      return;
    }

    setAvailablePoints([...availablePoints, newPointName.trim()]);
    setNewPointName('');
  };

  const deletePoint = (pointName) => {
    if (window.confirm(`คุณต้องการลบจุด "${pointName}" หรือไม่?`)) {
      setAvailablePoints(availablePoints.filter(p => p !== pointName));
    }
  };

  return (
    <div className="route-app">
      <div className="header">
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
        {routes.length === 0 ? (
          <div className="no-routes">
            ยังไม่มีเส้นทาง กรุณากดปุ่ม "สร้างเส้นทางใหม่"
          </div>
        ) : (
          <div className="routes-grid">
            {routes.map((route, index) => (
              <div key={route.id} className="route-table">
                <div className="route-header">
                  <span>เส้นทางที่ {index + 1}</span>
                  <button className="btn-edit" onClick={() => handleEditRoute(route)}>
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
                      <th>จุด</th>
                      <th>ชื่อเส้นทาง</th>
                      <th>เวลารวม</th>
                    </tr>
                  </thead>
                  <tbody>
                    {route.points.map((point, pointIndex) => (
                      <tr key={pointIndex}>
                        <td>จุดที่ {pointIndex + 1}</td>
                        <td>{point.point}</td>
                        <td>{point.time} นาที</td>
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
            <h3>{editingRoute ? 'แก้ไขเส้นทาง' : 'สร้างเส้นทางใหม่'}</h3>
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
                    value={point.point}
                    onChange={(e) => updatePoint(index, 'point', e.target.value)}
                  >
                    <option value="">เลือกจุด</option>
                    {availablePoints.map((p, i) => (
                      <option key={i} value={p}>{p}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    value={point.time}
                    onChange={(e) => updatePoint(index, 'time', e.target.value)}
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
              <button className="btn btn-cancel" onClick={() => setShowCreateModal(false)}>
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
                  <label>{index + 1}. เส้นทางที่ {index + 1}</label>
                </div>
              ))}
            </div>
            <div className="modal-buttons">
              <button className="btn btn-cancel" onClick={() => setShowDeleteModal(false)}>
                ยกเลิก
              </button>
              <button className="btn btn-confirm-delete" onClick={confirmDelete}>
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
                {availablePoints.map((point, index) => (
                  <div key={index} className="point-item">
                    <span>{index + 1}. {point}</span>
                    <button
                      className="btn-delete-point"
                      onClick={() => deletePoint(point)}
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
              <button className="btn btn-cancel" onClick={() => setShowPointsModal(false)}>
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
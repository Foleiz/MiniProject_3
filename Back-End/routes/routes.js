const express = require("express");

/**
 * @param {() => Promise<import('oracledb').Connection>} getConnection
 */
module.exports = (getConnection) => {
  const router = express.Router();

  // GET all routes and their stops (Optimized with JOIN)
  router.get("/", async (req, res) => {
    let connection;
    try {
      connection = await getConnection();
      const result = await connection.execute(
        `SELECT r.ROUTEID, r.ROUTENAME, s.STOPID, s.STOPNAME, rs.TIMETONEXT, rs.STOPORDER
         FROM "ROUTE" r
         LEFT JOIN "ROUTE_STOP" rs ON r.ROUTEID = rs.ROUTEID
         LEFT JOIN "STOP" s ON rs.STOPID = s.STOPID
         ORDER BY r.ROUTEID, rs.STOPORDER`
      );

      const routesMap = new Map();
      result.rows.forEach((row) => {
        const [routeId, routeName, stopId, stopName, timeToNext] = row;

        if (!routesMap.has(routeId)) {
          routesMap.set(routeId, {
            id: routeId,
            name: routeName,
            points: [],
            totalTime: 0,
          });
        }

        const route = routesMap.get(routeId);
        if (stopId !== null) {
          // Handle routes that might not have stops
          route.points.push({
            stopId: stopId,
            point: stopName,
            time: timeToNext,
          });
          route.totalTime += timeToNext || 0;
        }
      });

      res.json(Array.from(routesMap.values()));
    } catch (err) {
      console.error("Error fetching routes:", err);
      res.status(500).send("Server error on fetching routes");
    } finally {
      if (connection) {
        try {
          await connection.close();
        } catch (err) {
          console.error("Error closing connection:", err);
        }
      }
    }
  });

  // POST a new route with its stops
  router.post("/", async (req, res) => {
    const { routeName, points } = req.body; // points: [{ stopId: number, time: number }]
    if (
      !routeName ||
      !points ||
      !Array.isArray(points) ||
      points.length === 0
    ) {
      return res
        .status(400)
        .json({ error: "Route name and points are required." });
    }

    let connection;
    try {
      connection = await getConnection();

      // 1. Create the new ROUTE
      const routeIdResult = await connection.execute(
        `SELECT NVL(MAX(ROUTEID), 0) + 1 FROM "ROUTE"`
      );
      const newRouteId = routeIdResult.rows[0][0];

      await connection.execute(
        `INSERT INTO "ROUTE" (ROUTEID, ROUTENAME) VALUES (:id, :name)`,
        [newRouteId, routeName]
      );

      // 2. Create the ROUTE_STOP entries
      for (let i = 0; i < points.length; i++) {
        const point = points[i];
        await connection.execute(
          `INSERT INTO "ROUTE_STOP" (ROUTEID, STOPID, STOPORDER, TIMETONEXT)
           VALUES (:routeId, :stopId, :stopOrder, :timeToNext)`,
          {
            routeId: newRouteId,
            stopId: point.stopId,
            stopOrder: i + 1, // STOPORDER starts from 1
            timeToNext: point.time,
          }
        );
      }

      await connection.commit();

      // Enrich points with names for the response
      const stopIds = points.map((p) => p.stopId);
      const stopsResult = await connection.execute(
        `SELECT STOPID, STOPNAME FROM "STOP" WHERE STOPID IN (${stopIds
          .map((_, i) => `:id${i}`)
          .join(",")})`,
        stopIds
      );
      const stopsMap = new Map(stopsResult.rows.map((r) => [r[0], r[1]]));
      const enrichedPoints = points.map((p) => ({
        stopId: p.stopId,
        point: stopsMap.get(p.stopId),
        time: p.time,
      }));

      res.status(201).json({
        id: newRouteId,
        name: routeName,
        points: enrichedPoints,
        totalTime: points.reduce((total, p) => total + (p.time || 0), 0),
      });
    } catch (err) {
      if (connection) await connection.rollback();
      console.error("Error creating route:", err);
      res.status(500).send("Server error on creating route");
    } finally {
      if (connection) {
        try {
          await connection.close();
        } catch (err) {
          console.error("Error closing connection:", err);
        }
      }
    }
  });

  // PUT: Update an existing route
  router.put("/:id", async (req, res) => {
    const { id } = req.params;
    const { routeName, points } = req.body; // points: [{ stopId: number, time: number }]

    if (
      !routeName ||
      !points ||
      !Array.isArray(points) ||
      points.length === 0
    ) {
      return res
        .status(400)
        .json({ error: "Route name and points are required." });
    }

    let connection;
    try {
      connection = await getConnection();

      // 1. Update the ROUTE table
      await connection.execute(
        `UPDATE "ROUTE" SET ROUTENAME = :routeName WHERE ROUTEID = :id`,
        [routeName, id]
      );

      // 2. Delete old ROUTE_STOP entries
      await connection.execute(`DELETE FROM "ROUTE_STOP" WHERE ROUTEID = :id`, [
        id,
      ]);

      // 3. Insert new ROUTE_STOP entries
      for (let i = 0; i < points.length; i++) {
        const point = points[i];
        await connection.execute(
          `INSERT INTO "ROUTE_STOP" (ROUTEID, STOPID, STOPORDER, TIMETONEXT)
           VALUES (:routeId, :stopId, :stopOrder, :timeToNext)`,
          [id, point.stopId, i + 1, point.time]
        );
      }

      // 4. Fetch stop names for response
      const stopIds = points.map((p) => p.stopId);
      let enrichedPoints = [];
      if (stopIds.length > 0) {
        const stopsResult = await connection.execute(
          `SELECT STOPID, STOPNAME FROM "STOP" WHERE STOPID IN (${stopIds
            .map((_, i) => `:id${i}`)
            .join(",")})`,
          stopIds
        );
        const stopsMap = new Map(stopsResult.rows.map((r) => [r[0], r[1]]));
        enrichedPoints = points.map((p) => ({
          stopId: p.stopId,
          point: stopsMap.get(p.stopId),
          time: p.time,
        }));
      }

      await connection.commit();

      res.status(200).json({
        id: Number(id),
        name: routeName,
        points: enrichedPoints,
        totalTime: points.reduce((total, p) => total + (p.time || 0), 0),
      });
    } catch (err) {
      if (connection) await connection.rollback();
      console.error(`Error updating route ${id}:`, err);
      res.status(500).send("Server error on updating route");
    } finally {
      if (connection) {
        try {
          await connection.close();
        } catch (err) {
          console.error("Error closing connection:", err);
        }
      }
    }
  });

  // DELETE multiple routes
  router.delete("/", async (req, res) => {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: "Route IDs are required" });
    }

    let connection;
    try {
      connection = await getConnection();

      // Delete from ROUTE_STOP first due to foreign key constraint
      const deleteStopsSql = `DELETE FROM "ROUTE_STOP" WHERE ROUTEID IN (${ids
        .map((_, i) => `:id${i}`)
        .join(",")})`;
      await connection.execute(deleteStopsSql, ids);

      // Then delete from ROUTE
      const deleteRoutesSql = `DELETE FROM "ROUTE" WHERE ROUTEID IN (${ids
        .map((_, i) => `:id${i}`)
        .join(",")})`;
      const result = await connection.execute(deleteRoutesSql, ids);

      await connection.commit();

      res.status(200).json({
        message: `${result.rowsAffected} routes deleted successfully.`,
      });
    } catch (err) {
      if (connection) await connection.rollback();
      console.error("Error deleting routes:", err);
      res.status(500).send("Server error on deleting routes");
    } finally {
      if (connection) {
        try {
          await connection.close();
        } catch (err) {
          console.error("Error closing connection:", err);
        }
      }
    }
  });

  return router;
};

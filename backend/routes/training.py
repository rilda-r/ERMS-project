from fastapi import APIRouter, HTTPException
from database import get_connection, get_cursor
from models.schemas import TrainingCreate

router = APIRouter(prefix="/trainings", tags=["Trainings"])

# ── GET ALL ──
@router.get("/")
def get_trainings():
    conn = get_connection()
    cur = get_cursor(conn)
    try:
        cur.execute("SELECT * FROM TRAINING ORDER BY trainingID")
        return cur.fetchall()
    finally:
        cur.close()
        conn.close()

# ── GET ONE ──
@router.get("/{trainingID}")
def get_training(trainingID: str):
    conn = get_connection()
    cur = get_cursor(conn)
    try:
        cur.execute("SELECT * FROM TRAINING WHERE trainingID = %s", (trainingID,))
        training = cur.fetchone()
        if not training:
            raise HTTPException(status_code=404, detail="Training not found")
        return training
    finally:
        cur.close()
        conn.close()

# ── CREATE ──
@router.post("/")
def create_training(training: TrainingCreate):
    conn = get_connection()
    cur = get_cursor(conn)
    try:
        cur.execute(
            "INSERT INTO TRAINING VALUES (%s, %s, %s)",
            (training.trainingID, training.duration, training.simulatorused)
        )
        conn.commit()
        return {"message": f"Training {training.trainingID} created successfully"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cur.close()
        conn.close()

# ── UPDATE ──
@router.put("/{trainingID}")
def update_training(trainingID: str, training: TrainingCreate):
    conn = get_connection()
    cur = get_cursor(conn)
    try:
        cur.execute(
            "UPDATE TRAINING SET duration=%s, simulatorused=%s WHERE trainingID=%s",
            (training.duration, training.simulatorused, trainingID)
        )
        conn.commit()
        if cur.rowcount == 0:
            raise HTTPException(status_code=404, detail="Training not found")
        return {"message": f"Training {trainingID} updated successfully"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cur.close()
        conn.close()

# ── DELETE ──
@router.delete("/{trainingID}")
def delete_training(trainingID: str):
    conn = get_connection()
    cur = get_cursor(conn)
    try:
        cur.execute("DELETE FROM TRAINING WHERE trainingID = %s", (trainingID,))
        conn.commit()
        if cur.rowcount == 0:
            raise HTTPException(status_code=404, detail="Training not found")
        return {"message": f"Training {trainingID} deleted successfully"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cur.close()
        conn.close()
from fastapi import APIRouter, HTTPException
from database import get_connection, get_cursor
from models.schemas import EmployeeTrainingCreate

router = APIRouter(prefix="/employee-training", tags=["Employee Training"])

# ── GET ALL ──
@router.get("/")
def get_employee_trainings():
    conn = get_connection()
    cur = get_cursor(conn)
    try:
        cur.execute("""
            SELECT et.*, e.name as employeename,
                   t.simulatorused, t.duration
            FROM EMPLOYEE_TRAINING et
            LEFT JOIN EMPLOYEE e ON et.employeeID = e.employeeID
            LEFT JOIN TRAINING t ON et.trainingID = t.trainingID
            ORDER BY et.employeeID, et.trainingID
        """)
        return cur.fetchall()
    finally:
        cur.close()
        conn.close()

# ── GET BY EMPLOYEE ──
@router.get("/{employeeID}")
def get_trainings_by_employee(employeeID: str):
    conn = get_connection()
    cur = get_cursor(conn)
    try:
        cur.execute("""
            SELECT et.*, e.name as employeename,
                   t.simulatorused, t.duration
            FROM EMPLOYEE_TRAINING et
            LEFT JOIN EMPLOYEE e ON et.employeeID = e.employeeID
            LEFT JOIN TRAINING t ON et.trainingID = t.trainingID
            WHERE et.employeeID = %s
            ORDER BY et.trainingID
        """, (employeeID,))
        trainings = cur.fetchall()
        if not trainings:
            raise HTTPException(status_code=404, detail="No trainings found for this employee")
        return trainings
    finally:
        cur.close()
        conn.close()

# ── CREATE ──
@router.post("/")
def create_employee_training(et: EmployeeTrainingCreate):
    conn = get_connection()
    cur = get_cursor(conn)
    try:
        cur.execute("""
            INSERT INTO EMPLOYEE_TRAINING (employeeID, trainingID)
            VALUES (%s, %s)
        """, (et.employeeID, et.trainingID))
        conn.commit()
        return {"message": f"Employee {et.employeeID} enrolled in training {et.trainingID} successfully"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cur.close()
        conn.close()

# ── DELETE ──
@router.delete("/{employeeID}/{trainingID}")
def delete_employee_training(employeeID: str, trainingID: str):
    conn = get_connection()
    cur = get_cursor(conn)
    try:
        cur.execute("""
            DELETE FROM EMPLOYEE_TRAINING
            WHERE employeeID = %s AND trainingID = %s
        """, (employeeID, trainingID))
        conn.commit()
        if cur.rowcount == 0:
            raise HTTPException(status_code=404, detail="Enrollment not found")
        return {"message": f"Enrollment for {employeeID} in {trainingID} deleted successfully"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cur.close()
        conn.close()
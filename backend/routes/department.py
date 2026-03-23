from fastapi import APIRouter, HTTPException
from database import get_connection, get_cursor
from models.schemas import DepartmentCreate

router = APIRouter(prefix="/departments", tags=["Departments"])

# ── GET ALL ──
@router.get("/")
def get_departments():
    conn = get_connection()
    cur = get_cursor(conn)
    try:
        cur.execute("SELECT * FROM DEPARTMENT ORDER BY deptID")
        return cur.fetchall()
    finally:
        cur.close()
        conn.close()

# ── GET ONE ──
@router.get("/{deptID}")
def get_department(deptID: str):
    conn = get_connection()
    cur = get_cursor(conn)
    try:
        cur.execute("SELECT * FROM DEPARTMENT WHERE deptID = %s", (deptID,))
        dept = cur.fetchone()
        if not dept:
            raise HTTPException(status_code=404, detail="Department not found")
        return dept
    finally:
        cur.close()
        conn.close()

# ── CREATE ──
@router.post("/")
def create_department(dept: DepartmentCreate):
    conn = get_connection()
    cur = get_cursor(conn)
    try:
        cur.execute(
            "INSERT INTO DEPARTMENT VALUES (%s, %s, %s)",
            (dept.deptID, dept.deptname, dept.location)
        )
        conn.commit()
        return {"message": f"Department {dept.deptID} created successfully"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cur.close()
        conn.close()

# ── UPDATE ──
@router.put("/{deptID}")
def update_department(deptID: str, dept: DepartmentCreate):
    conn = get_connection()
    cur = get_cursor(conn)
    try:
        cur.execute(
            "UPDATE DEPARTMENT SET deptname=%s, location=%s WHERE deptID=%s",
            (dept.deptname, dept.location, deptID)
        )
        conn.commit()
        if cur.rowcount == 0:
            raise HTTPException(status_code=404, detail="Department not found")
        return {"message": f"Department {deptID} updated successfully"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cur.close()
        conn.close()

# ── DELETE ──
@router.delete("/{deptID}")
def delete_department(deptID: str):
    conn = get_connection()
    cur = get_cursor(conn)
    try:
        cur.execute("DELETE FROM DEPARTMENT WHERE deptID = %s", (deptID,))
        conn.commit()
        if cur.rowcount == 0:
            raise HTTPException(status_code=404, detail="Department not found")
        return {"message": f"Department {deptID} deleted successfully"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cur.close()
        conn.close()
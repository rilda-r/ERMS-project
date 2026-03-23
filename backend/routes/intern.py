from fastapi import APIRouter, HTTPException
from database import get_connection, get_cursor
from models.schemas import InternCreate

router = APIRouter(prefix="/interns", tags=["Interns"])

# ── GET ALL ──
@router.get("/")
def get_interns():
    conn = get_connection()
    cur = get_cursor(conn)
    try:
        cur.execute("""
            SELECT i.*, e.name, e.deptID,
                   d.deptname
            FROM INTERN i
            LEFT JOIN EMPLOYEE e ON i.employeeID = e.employeeID
            LEFT JOIN DEPARTMENT d ON e.deptID = d.deptID
            ORDER BY i.employeeID
        """)
        return cur.fetchall()
    finally:
        cur.close()
        conn.close()

# ── GET ONE ──
@router.get("/{employeeID}")
def get_intern(employeeID: str):
    conn = get_connection()
    cur = get_cursor(conn)
    try:
        cur.execute("""
            SELECT i.*, e.name, e.deptID,
                   d.deptname
            FROM INTERN i
            LEFT JOIN EMPLOYEE e ON i.employeeID = e.employeeID
            LEFT JOIN DEPARTMENT d ON e.deptID = d.deptID
            WHERE i.employeeID = %s
        """, (employeeID,))
        intern = cur.fetchone()
        if not intern:
            raise HTTPException(status_code=404, detail="Intern record not found")
        return intern
    finally:
        cur.close()
        conn.close()

# ── CREATE ──
@router.post("/")
def create_intern(intern: InternCreate):
    conn = get_connection()
    cur = get_cursor(conn)
    try:
        cur.execute(
            "INSERT INTO INTERN VALUES (%s, %s)",
            (intern.employeeID, intern.duration)
        )
        conn.commit()
        return {"message": f"Intern record for {intern.employeeID} created successfully"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cur.close()
        conn.close()

# ── UPDATE ──
@router.put("/{employeeID}")
def update_intern(employeeID: str, intern: InternCreate):
    conn = get_connection()
    cur = get_cursor(conn)
    try:
        cur.execute(
            "UPDATE INTERN SET duration=%s WHERE employeeID=%s",
            (intern.duration, employeeID)
        )
        conn.commit()
        if cur.rowcount == 0:
            raise HTTPException(status_code=404, detail="Intern record not found")
        return {"message": f"Intern record for {employeeID} updated successfully"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cur.close()
        conn.close()

# ── DELETE ──
@router.delete("/{employeeID}")
def delete_intern(employeeID: str):
    conn = get_connection()
    cur = get_cursor(conn)
    try:
        cur.execute("DELETE FROM INTERN WHERE employeeID = %s", (employeeID,))
        conn.commit()
        if cur.rowcount == 0:
            raise HTTPException(status_code=404, detail="Intern record not found")
        return {"message": f"Intern record for {employeeID} deleted successfully"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cur.close()
        conn.close()
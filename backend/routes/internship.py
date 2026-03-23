from fastapi import APIRouter, HTTPException
from database import get_connection, get_cursor
from models.schemas import InternshipAssignmentCreate

router = APIRouter(prefix="/internships", tags=["Internship Assignment"])

# ── GET ALL ──
@router.get("/")
def get_internships():
    conn = get_connection()
    cur = get_cursor(conn)
    try:
        cur.execute("""
            SELECT ia.*, e.name as internname,
                   d.deptname, c.collegename, c.branch
            FROM INTERNSHIP_ASSIGNMENT ia
            LEFT JOIN EMPLOYEE e ON ia.employeeID = e.employeeID
            LEFT JOIN DEPARTMENT d ON ia.deptID = d.deptID
            LEFT JOIN COLLEGE c ON ia.collegeID = c.collegeID
            ORDER BY ia.employeeID
        """)
        return cur.fetchall()
    finally:
        cur.close()
        conn.close()

# ── GET BY EMPLOYEE ──
@router.get("/{employeeID}")
def get_internship_by_employee(employeeID: str):
    conn = get_connection()
    cur = get_cursor(conn)
    try:
        cur.execute("""
            SELECT ia.*, e.name as internname,
                   d.deptname, c.collegename, c.branch
            FROM INTERNSHIP_ASSIGNMENT ia
            LEFT JOIN EMPLOYEE e ON ia.employeeID = e.employeeID
            LEFT JOIN DEPARTMENT d ON ia.deptID = d.deptID
            LEFT JOIN COLLEGE c ON ia.collegeID = c.collegeID
            WHERE ia.employeeID = %s
        """, (employeeID,))
        internship = cur.fetchone()
        if not internship:
            raise HTTPException(status_code=404, detail="Internship assignment not found")
        return internship
    finally:
        cur.close()
        conn.close()

# ── CREATE ──
@router.post("/")
def create_internship(ia: InternshipAssignmentCreate):
    conn = get_connection()
    cur = get_cursor(conn)
    try:
        cur.execute("""
            INSERT INTO INTERNSHIP_ASSIGNMENT (employeeID, deptID, collegeID)
            VALUES (%s, %s, %s)
        """, (ia.employeeID, ia.deptID, ia.collegeID))
        conn.commit()
        return {"message": f"Internship assignment for {ia.employeeID} created successfully"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cur.close()
        conn.close()

# ── DELETE ──
@router.delete("/{employeeID}/{deptID}/{collegeID}")
def delete_internship(employeeID: str, deptID: str, collegeID: str):
    conn = get_connection()
    cur = get_cursor(conn)
    try:
        cur.execute("""
            DELETE FROM INTERNSHIP_ASSIGNMENT
            WHERE employeeID = %s AND deptID = %s AND collegeID = %s
        """, (employeeID, deptID, collegeID))
        conn.commit()
        if cur.rowcount == 0:
            raise HTTPException(status_code=404, detail="Internship assignment not found")
        return {"message": f"Internship assignment for {employeeID} deleted successfully"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cur.close()
        conn.close()
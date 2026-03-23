from fastapi import APIRouter, HTTPException
from database import get_connection, get_cursor
from models.schemas import CollegeCreate

router = APIRouter(prefix="/colleges", tags=["Colleges"])

# ── GET ALL ──
@router.get("/")
def get_colleges():
    conn = get_connection()
    cur = get_cursor(conn)
    try:
        cur.execute("SELECT * FROM COLLEGE ORDER BY collegeID")
        return cur.fetchall()
    finally:
        cur.close()
        conn.close()

# ── GET ONE ──
@router.get("/{collegeID}")
def get_college(collegeID: str):
    conn = get_connection()
    cur = get_cursor(conn)
    try:
        cur.execute("SELECT * FROM COLLEGE WHERE collegeID = %s", (collegeID,))
        college = cur.fetchone()
        if not college:
            raise HTTPException(status_code=404, detail="College not found")
        return college
    finally:
        cur.close()
        conn.close()

# ── CREATE ──
@router.post("/")
def create_college(college: CollegeCreate):
    conn = get_connection()
    cur = get_cursor(conn)
    try:
        cur.execute(
            "INSERT INTO COLLEGE VALUES (%s, %s, %s)",
            (college.collegeID, college.collegename, college.branch)
        )
        conn.commit()
        return {"message": f"College {college.collegeID} created successfully"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cur.close()
        conn.close()

# ── UPDATE ──
@router.put("/{collegeID}")
def update_college(collegeID: str, college: CollegeCreate):
    conn = get_connection()
    cur = get_cursor(conn)
    try:
        cur.execute(
            "UPDATE COLLEGE SET collegename=%s, branch=%s WHERE collegeID=%s",
            (college.collegename, college.branch, collegeID)
        )
        conn.commit()
        if cur.rowcount == 0:
            raise HTTPException(status_code=404, detail="College not found")
        return {"message": f"College {collegeID} updated successfully"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cur.close()
        conn.close()

# ── DELETE ──
@router.delete("/{collegeID}")
def delete_college(collegeID: str):
    conn = get_connection()
    cur = get_cursor(conn)
    try:
        cur.execute("DELETE FROM COLLEGE WHERE collegeID = %s", (collegeID,))
        conn.commit()
        if cur.rowcount == 0:
            raise HTTPException(status_code=404, detail="College not found")
        return {"message": f"College {collegeID} deleted successfully"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cur.close()
        conn.close()
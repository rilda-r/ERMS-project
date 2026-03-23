from fastapi import APIRouter, HTTPException
from database import get_connection, get_cursor
from models.schemas import FullTimeCreate

router = APIRouter(prefix="/fulltime", tags=["Full Time"])

# ── GET ALL ──
@router.get("/")
def get_fulltime():
    conn = get_connection()
    cur = get_cursor(conn)
    try:
        cur.execute("""
            SELECT ft.*, e.name, e.salary, e.deptID,
                   h.housetype, h.block
            FROM FULL_TIME ft
            LEFT JOIN EMPLOYEE e ON ft.employeeID = e.employeeID
            LEFT JOIN HOUSE h ON ft.houseID = h.houseID
            ORDER BY ft.employeeID
        """)
        return cur.fetchall()
    finally:
        cur.close()
        conn.close()

# ── GET ONE ──
@router.get("/{employeeID}")
def get_fulltime_employee(employeeID: str):
    conn = get_connection()
    cur = get_cursor(conn)
    try:
        cur.execute("""
            SELECT ft.*, e.name, e.salary, e.deptID,
                   h.housetype, h.block
            FROM FULL_TIME ft
            LEFT JOIN EMPLOYEE e ON ft.employeeID = e.employeeID
            LEFT JOIN HOUSE h ON ft.houseID = h.houseID
            WHERE ft.employeeID = %s
        """, (employeeID,))
        ft = cur.fetchone()
        if not ft:
            raise HTTPException(status_code=404, detail="Full time record not found")
        return ft
    finally:
        cur.close()
        conn.close()

# ── CREATE ──
@router.post("/")
def create_fulltime(ft: FullTimeCreate):
    conn = get_connection()
    cur = get_cursor(conn)
    try:
        cur.execute(
            "INSERT INTO FULL_TIME VALUES (%s, %s)",
            (ft.employeeID, ft.houseID)
        )
        conn.commit()
        return {"message": f"Full time record for {ft.employeeID} created successfully"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cur.close()
        conn.close()

# ── UPDATE ──
@router.put("/{employeeID}")
def update_fulltime(employeeID: str, ft: FullTimeCreate):
    conn = get_connection()
    cur = get_cursor(conn)
    try:
        cur.execute(
            "UPDATE FULL_TIME SET houseID=%s WHERE employeeID=%s",
            (ft.houseID, employeeID)
        )
        conn.commit()
        if cur.rowcount == 0:
            raise HTTPException(status_code=404, detail="Full time record not found")
        return {"message": f"Full time record for {employeeID} updated successfully"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cur.close()
        conn.close()

# ── DELETE ──
@router.delete("/{employeeID}")
def delete_fulltime(employeeID: str):
    conn = get_connection()
    cur = get_cursor(conn)
    try:
        cur.execute("DELETE FROM FULL_TIME WHERE employeeID = %s", (employeeID,))
        conn.commit()
        if cur.rowcount == 0:
            raise HTTPException(status_code=404, detail="Full time record not found")
        return {"message": f"Full time record for {employeeID} deleted successfully"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cur.close()
        conn.close()
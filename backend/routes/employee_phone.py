from fastapi import APIRouter, HTTPException
from database import get_connection, get_cursor
from models.schemas import EmployeePhoneCreate

router = APIRouter(prefix="/phones", tags=["Employee Phone"])

# ── GET ALL ──
@router.get("/")
def get_phones():
    conn = get_connection()
    cur = get_cursor(conn)
    try:
        cur.execute("""
            SELECT ep.*, e.name
            FROM EMPLOYEE_PHONE ep
            LEFT JOIN EMPLOYEE e ON ep.employeeID = e.employeeID
            ORDER BY ep.employeeID
        """)
        return cur.fetchall()
    finally:
        cur.close()
        conn.close()

# ── GET BY EMPLOYEE ──
@router.get("/{employeeID}")
def get_phones_by_employee(employeeID: str):
    conn = get_connection()
    cur = get_cursor(conn)
    try:
        cur.execute("""
            SELECT ep.*, e.name
            FROM EMPLOYEE_PHONE ep
            LEFT JOIN EMPLOYEE e ON ep.employeeID = e.employeeID
            WHERE ep.employeeID = %s
            ORDER BY ep.phonenumber
        """, (employeeID,))
        phones = cur.fetchall()
        if not phones:
            raise HTTPException(status_code=404, detail="No phone numbers found for this employee")
        return phones
    finally:
        cur.close()
        conn.close()

# ── CREATE ──
@router.post("/")
def create_phone(phone: EmployeePhoneCreate):
    conn = get_connection()
    cur = get_cursor(conn)
    try:
        cur.execute("""
            INSERT INTO EMPLOYEE_PHONE (employeeID, phonenumber)
            VALUES (%s, %s)
        """, (phone.employeeID, phone.phonenumber))
        conn.commit()
        return {"message": f"Phone number {phone.phonenumber} added successfully"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cur.close()
        conn.close()

# ── DELETE ──
@router.delete("/{employeeID}/{phonenumber}")
def delete_phone(employeeID: str, phonenumber: str):
    conn = get_connection()
    cur = get_cursor(conn)
    try:
        cur.execute("""
            DELETE FROM EMPLOYEE_PHONE
            WHERE employeeID = %s AND phonenumber = %s
        """, (employeeID, phonenumber))
        conn.commit()
        if cur.rowcount == 0:
            raise HTTPException(status_code=404, detail="Phone number not found")
        return {"message": f"Phone number {phonenumber} deleted successfully"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cur.close()
        conn.close()
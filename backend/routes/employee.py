from fastapi import APIRouter, HTTPException
from database import get_connection, get_cursor
from models.schemas import EmployeeCreate

router = APIRouter(prefix="/employees", tags=["Employees"])

# ── GET ALL ──
@router.get("/")
def get_employees():
    conn = get_connection()
    cur = get_cursor(conn)
    try:
        cur.execute("""
            SELECT e.*, d.deptname 
            FROM EMPLOYEE e
            LEFT JOIN DEPARTMENT d ON e.deptID = d.deptID
            ORDER BY e.employeeID
        """)
        return cur.fetchall()
    finally:
        cur.close()
        conn.close()

# ── GET ONE ──
@router.get("/{employeeID}")
def get_employee(employeeID: str):
    conn = get_connection()
    cur = get_cursor(conn)
    try:
        cur.execute("""
            SELECT e.*, d.deptname 
            FROM EMPLOYEE e
            LEFT JOIN DEPARTMENT d ON e.deptID = d.deptID
            WHERE e.employeeID = %s
        """, (employeeID,))
        emp = cur.fetchone()
        if not emp:
            raise HTTPException(status_code=404, detail="Employee not found")
        return emp
    finally:
        cur.close()
        conn.close()

# ── CREATE ──
@router.post("/")
def create_employee(emp: EmployeeCreate):
    conn = get_connection()
    cur = get_cursor(conn)
    try:
        cur.execute("""
            INSERT INTO EMPLOYEE 
            (employeeID, name, DOB, gender, joindate, salary, deptID)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (
            emp.employeeID, emp.name, emp.DOB,
            emp.gender, emp.joindate, emp.salary, emp.deptID
        ))
        conn.commit()
        return {"message": f"Employee {emp.employeeID} created successfully"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cur.close()
        conn.close()

# ── UPDATE ──
@router.put("/{employeeID}")
def update_employee(employeeID: str, emp: EmployeeCreate):
    conn = get_connection()
    cur = get_cursor(conn)
    try:
        cur.execute("""
            UPDATE EMPLOYEE 
            SET name=%s, DOB=%s, gender=%s, joindate=%s, salary=%s, deptID=%s
            WHERE employeeID=%s
        """, (
            emp.name, emp.DOB, emp.gender,
            emp.joindate, emp.salary, emp.deptID, employeeID
        ))
        conn.commit()
        if cur.rowcount == 0:
            raise HTTPException(status_code=404, detail="Employee not found")
        return {"message": f"Employee {employeeID} updated successfully"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cur.close()
        conn.close()

# ── DELETE ──
@router.delete("/{employeeID}")
def delete_employee(employeeID: str):
    conn = get_connection()
    cur = get_cursor(conn)
    try:
        cur.execute("DELETE FROM EMPLOYEE WHERE employeeID = %s", (employeeID,))
        conn.commit()
        if cur.rowcount == 0:
            raise HTTPException(status_code=404, detail="Employee not found")
        return {"message": f"Employee {employeeID} deleted successfully"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cur.close()
        conn.close()     
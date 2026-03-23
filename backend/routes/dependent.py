from fastapi import APIRouter, HTTPException
from database import get_connection, get_cursor
from models.schemas import DependentCreate

router = APIRouter(prefix="/dependents", tags=["Dependents"])

# ── GET ALL ──
@router.get("/")
def get_dependents():
    conn = get_connection()
    cur = get_cursor(conn)
    try:
        cur.execute("""
            SELECT d.*, e.name as employeename
            FROM DEPENDENT d
            LEFT JOIN EMPLOYEE e ON d.employeeID = e.employeeID
            ORDER BY d.employeeID, d.dependentname
        """)
        return cur.fetchall()
    finally:
        cur.close()
        conn.close()

# ── GET BY EMPLOYEE ──
@router.get("/{employeeID}")
def get_dependents_by_employee(employeeID: str):
    conn = get_connection()
    cur = get_cursor(conn)
    try:
        cur.execute("""
            SELECT d.*, e.name as employeename
            FROM DEPENDENT d
            LEFT JOIN EMPLOYEE e ON d.employeeID = e.employeeID
            WHERE d.employeeID = %s
            ORDER BY d.dependentname
        """, (employeeID,))
        dependents = cur.fetchall()
        if not dependents:
            raise HTTPException(status_code=404, detail="No dependents found for this employee")
        return dependents
    finally:
        cur.close()
        conn.close()

# ── GET ONE ──
@router.get("/{employeeID}/{dependentname}")
def get_dependent(employeeID: str, dependentname: str):
    conn = get_connection()
    cur = get_cursor(conn)
    try:
        cur.execute("""
            SELECT d.*, e.name as employeename
            FROM DEPENDENT d
            LEFT JOIN EMPLOYEE e ON d.employeeID = e.employeeID
            WHERE d.employeeID = %s AND d.dependentname = %s
        """, (employeeID, dependentname))
        dependent = cur.fetchone()
        if not dependent:
            raise HTTPException(status_code=404, detail="Dependent not found")
        return dependent
    finally:
        cur.close()
        conn.close()

# ── CREATE ──
@router.post("/")
def create_dependent(dependent: DependentCreate):
    conn = get_connection()
    cur = get_cursor(conn)
    try:
        cur.execute("""
            INSERT INTO DEPENDENT (employeeID, dependentname, age, relation)
            VALUES (%s, %s, %s, %s)
        """, (
            dependent.employeeID, dependent.dependentname,
            dependent.age, dependent.relation
        ))
        conn.commit()
        return {"message": f"Dependent {dependent.dependentname} created successfully"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cur.close()
        conn.close()

# ── UPDATE ──
@router.put("/{employeeID}/{dependentname}")
def update_dependent(employeeID: str, dependentname: str, dependent: DependentCreate):
    conn = get_connection()
    cur = get_cursor(conn)
    try:
        cur.execute("""
            UPDATE DEPENDENT 
            SET age=%s, relation=%s
            WHERE employeeID=%s AND dependentname=%s
        """, (
            dependent.age, dependent.relation,
            employeeID, dependentname
        ))
        conn.commit()
        if cur.rowcount == 0:
            raise HTTPException(status_code=404, detail="Dependent not found")
        return {"message": f"Dependent {dependentname} updated successfully"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cur.close()
        conn.close()

# ── DELETE ──
@router.delete("/{employeeID}/{dependentname}")
def delete_dependent(employeeID: str, dependentname: str):
    conn = get_connection()
    cur = get_cursor(conn)
    try:
        cur.execute("""
            DELETE FROM DEPENDENT 
            WHERE employeeID = %s AND dependentname = %s
        """, (employeeID, dependentname))
        conn.commit()
        if cur.rowcount == 0:
            raise HTTPException(status_code=404, detail="Dependent not found")
        return {"message": f"Dependent {dependentname} deleted successfully"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cur.close()
        conn.close()
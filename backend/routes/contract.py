from fastapi import APIRouter, HTTPException
from database import get_connection, get_cursor
from models.schemas import ContractCreate

router = APIRouter(prefix="/contracts", tags=["Contracts"])

# ── GET ALL ──
@router.get("/")
def get_contracts():
    conn = get_connection()
    cur = get_cursor(conn)
    try:
        cur.execute("""
            SELECT c.*, e.name, e.salary, e.deptID,
                   d.deptname
            FROM CONTRACT c
            LEFT JOIN EMPLOYEE e ON c.employeeID = e.employeeID
            LEFT JOIN DEPARTMENT d ON e.deptID = d.deptID
            ORDER BY c.employeeID
        """)
        return cur.fetchall()
    finally:
        cur.close()
        conn.close()

# ── GET ONE ──
@router.get("/{employeeID}")
def get_contract(employeeID: str):
    conn = get_connection()
    cur = get_cursor(conn)
    try:
        cur.execute("""
            SELECT c.*, e.name, e.salary, e.deptID,
                   d.deptname
            FROM CONTRACT c
            LEFT JOIN EMPLOYEE e ON c.employeeID = e.employeeID
            LEFT JOIN DEPARTMENT d ON e.deptID = d.deptID
            WHERE c.employeeID = %s
        """, (employeeID,))
        contract = cur.fetchone()
        if not contract:
            raise HTTPException(status_code=404, detail="Contract record not found")
        return contract
    finally:
        cur.close()
        conn.close()

# ── CREATE ──
@router.post("/")
def create_contract(contract: ContractCreate):
    conn = get_connection()
    cur = get_cursor(conn)
    try:
        cur.execute(
            "INSERT INTO CONTRACT VALUES (%s, %s)",
            (contract.employeeID, contract.enddate)
        )
        conn.commit()
        return {"message": f"Contract record for {contract.employeeID} created successfully"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cur.close()
        conn.close()

# ── UPDATE ──
@router.put("/{employeeID}")
def update_contract(employeeID: str, contract: ContractCreate):
    conn = get_connection()
    cur = get_cursor(conn)
    try:
        cur.execute(
            "UPDATE CONTRACT SET enddate=%s WHERE employeeID=%s",
            (contract.enddate, employeeID)
        )
        conn.commit()
        if cur.rowcount == 0:
            raise HTTPException(status_code=404, detail="Contract record not found")
        return {"message": f"Contract record for {employeeID} updated successfully"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cur.close()
        conn.close()

# ── DELETE ──
@router.delete("/{employeeID}")
def delete_contract(employeeID: str):
    conn = get_connection()
    cur = get_cursor(conn)
    try:
        cur.execute("DELETE FROM CONTRACT WHERE employeeID = %s", (employeeID,))
        conn.commit()
        if cur.rowcount == 0:
            raise HTTPException(status_code=404, detail="Contract record not found")
        return {"message": f"Contract record for {employeeID} deleted successfully"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cur.close()
        conn.close()
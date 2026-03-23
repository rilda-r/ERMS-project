from fastapi import APIRouter, HTTPException
from database import get_connection, get_cursor
from models.schemas import HouseCreate

router = APIRouter(prefix="/houses", tags=["Houses"])

# ── GET ALL ──
@router.get("/")
def get_houses():
    conn = get_connection()
    cur = get_cursor(conn)
    try:
        cur.execute("""
            SELECT h.*, ft.employeeID, e.name as occupant
            FROM HOUSE h
            LEFT JOIN FULL_TIME ft ON h.houseID = ft.houseID
            LEFT JOIN EMPLOYEE e ON ft.employeeID = e.employeeID
            ORDER BY h.houseID
        """)
        return cur.fetchall()
    finally:
        cur.close()
        conn.close()

# ── GET ONE ──
@router.get("/{houseID}")
def get_house(houseID: str):
    conn = get_connection()
    cur = get_cursor(conn)
    try:
        cur.execute("SELECT * FROM HOUSE WHERE houseID = %s", (houseID,))
        house = cur.fetchone()
        if not house:
            raise HTTPException(status_code=404, detail="House not found")
        return house
    finally:
        cur.close()
        conn.close()

# ── CREATE ──
@router.post("/")
def create_house(house: HouseCreate):
    conn = get_connection()
    cur = get_cursor(conn)
    try:
        cur.execute(
            "INSERT INTO HOUSE VALUES (%s, %s, %s)",
            (house.houseID, house.housetype, house.block)
        )
        conn.commit()
        return {"message": f"House {house.houseID} created successfully"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cur.close()
        conn.close()

# ── UPDATE ──
@router.put("/{houseID}")
def update_house(houseID: str, house: HouseCreate):
    conn = get_connection()
    cur = get_cursor(conn)
    try:
        cur.execute(
            "UPDATE HOUSE SET housetype=%s, block=%s WHERE houseID=%s",
            (house.housetype, house.block, houseID)
        )
        conn.commit()
        if cur.rowcount == 0:
            raise HTTPException(status_code=404, detail="House not found")
        return {"message": f"House {houseID} updated successfully"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cur.close()
        conn.close()

# ── DELETE ──
@router.delete("/{houseID}")
def delete_house(houseID: str):
    conn = get_connection()
    cur = get_cursor(conn)
    try:
        cur.execute("DELETE FROM HOUSE WHERE houseID = %s", (houseID,))
        conn.commit()
        if cur.rowcount == 0:
            raise HTTPException(status_code=404, detail="House not found")
        return {"message": f"House {houseID} deleted successfully"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cur.close()
        conn.close()
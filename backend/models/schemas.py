from pydantic import BaseModel, field_validator
from typing import Optional
from datetime import date
import re

# ── DEPARTMENT ──
class DepartmentBase(BaseModel):
    deptname: str
    location: str

class DepartmentCreate(DepartmentBase):
    deptID: str

class Department(DepartmentCreate):
    class Config:
        from_attributes = True

# ── HOUSE ──
class HouseBase(BaseModel):
    housetype: str
    block: str

class HouseCreate(HouseBase):
    houseID: str

class House(HouseCreate):
    class Config:
        from_attributes = True

# ── COLLEGE ──
class CollegeBase(BaseModel):
    collegename: str
    branch: str

class CollegeCreate(CollegeBase):
    collegeID: str

class College(CollegeCreate):
    class Config:
        from_attributes = True

# ── TRAINING ──
class TrainingBase(BaseModel):
    duration: int
    simulatorused: str

    @field_validator('duration')
    def duration_must_be_positive(cls, v):
        if v <= 0:
            raise ValueError('Duration must be positive')
        return v

class TrainingCreate(TrainingBase):
    trainingID: str

class Training(TrainingCreate):
    class Config:
        from_attributes = True

# ── EMPLOYEE ──
class EmployeeBase(BaseModel):
    name: str
    DOB: date
    gender: str
    joindate: date
    salary: float
    deptID: str

    @field_validator('gender')
    def gender_must_be_valid(cls, v):
        if v not in ['Male', 'Female', 'Other']:
            raise ValueError('Gender must be Male, Female or Other')
        return v

    @field_validator('salary')
    def salary_must_be_positive(cls, v):
        if v <= 0:
            raise ValueError('Salary must be positive')
        return v

class EmployeeCreate(EmployeeBase):
    employeeID: str

class Employee(EmployeeCreate):
    class Config:
        from_attributes = True

# ── FULL TIME ──
class FullTimeBase(BaseModel):
    houseID: Optional[str] = None

class FullTimeCreate(FullTimeBase):
    employeeID: str

class FullTime(FullTimeCreate):
    class Config:
        from_attributes = True

# ── CONTRACT ──
class ContractBase(BaseModel):
    enddate: date

class ContractCreate(ContractBase):
    employeeID: str

class Contract(ContractCreate):
    class Config:
        from_attributes = True

# ── INTERN ──
class InternBase(BaseModel):
    duration: int

    @field_validator('duration')
    def duration_must_be_valid(cls, v):
        if v < 2 or v > 5:
            raise ValueError('Intern duration must be between 2 and 5 months')
        return v

class InternCreate(InternBase):
    employeeID: str

class Intern(InternCreate):
    class Config:
        from_attributes = True

# ── DEPENDENT ──
class DependentBase(BaseModel):
    age: int
    relation: str

    @field_validator('age')
    def age_must_be_valid(cls, v):
        if v <= 0 or v >= 120:
            raise ValueError('Age must be between 1 and 119')
        return v

class DependentCreate(DependentBase):
    employeeID: str
    dependentname: str

class Dependent(DependentCreate):
    class Config:
        from_attributes = True

# ── EMPLOYEE TRAINING ──
class EmployeeTrainingCreate(BaseModel):
    employeeID: str
    trainingID: str

class EmployeeTraining(EmployeeTrainingCreate):
    class Config:
        from_attributes = True

# ── EMPLOYEE PHONE ──
class EmployeePhoneCreate(BaseModel):
    employeeID: str
    phonenumber: str

    @field_validator('phonenumber')
    def phone_must_be_valid(cls, v):
        if not re.match(r'^[0-9]{10}$', v):
            raise ValueError('Phone number must be exactly 10 digits')
        return v

class EmployeePhone(EmployeePhoneCreate):
    class Config:
        from_attributes = True

# ── INTERNSHIP ASSIGNMENT ──
class InternshipAssignmentCreate(BaseModel):
    employeeID: str
    deptID: str
    collegeID: str

class InternshipAssignment(InternshipAssignmentCreate):
    class Config:
        from_attributes = True
-- ============================================================
-- EMPLOYEE RESOURCE MANAGEMENT SYSTEM (ERMS)
-- PostgreSQL Schema — All 12 Tables
-- Author: R. Rilda | 24BAI1497
-- ============================================================

-- Drop tables in reverse order (child first, parent last)
DROP TABLE IF EXISTS INTERNSHIP_ASSIGNMENT;
DROP TABLE IF EXISTS EMPLOYEE_PHONE;
DROP TABLE IF EXISTS EMPLOYEE_TRAINING;
DROP TABLE IF EXISTS DEPENDENT;
DROP TABLE IF EXISTS INTERN;
DROP TABLE IF EXISTS CONTRACT;
DROP TABLE IF EXISTS FULL_TIME;
DROP TABLE IF EXISTS EMPLOYEE;
DROP TABLE IF EXISTS TRAINING;
DROP TABLE IF EXISTS COLLEGE;
DROP TABLE IF EXISTS HOUSE;
DROP TABLE IF EXISTS DEPARTMENT;

-- ============================================================
-- 1. DEPARTMENT
-- Strong entity, no dependencies
-- ============================================================
CREATE TABLE DEPARTMENT (
    deptID      VARCHAR(10)     PRIMARY KEY,
    deptname    VARCHAR(100)    NOT NULL,
    location    VARCHAR(100)    NOT NULL
);

-- ============================================================
-- 2. HOUSE
-- Strong entity, no dependencies
-- ============================================================
CREATE TABLE HOUSE (
    houseID     VARCHAR(10)     PRIMARY KEY,
    housetype   VARCHAR(50)     NOT NULL,
    block       VARCHAR(10)     NOT NULL
);

-- ============================================================
-- 3. COLLEGE
-- Strong entity, no dependencies
-- ============================================================
CREATE TABLE COLLEGE (
    collegeID   VARCHAR(10)     PRIMARY KEY,
    collegename VARCHAR(150)    NOT NULL,
    branch      VARCHAR(100)    NOT NULL
);

-- ============================================================
-- 4. TRAINING
-- Strong entity, no dependencies
-- ============================================================
CREATE TABLE TRAINING (
    trainingID      VARCHAR(10)     PRIMARY KEY,
    duration        INTEGER         NOT NULL CHECK (duration > 0),
    simulatorused   VARCHAR(100)    NOT NULL
);

-- ============================================================
-- 5. EMPLOYEE
-- Superclass — depends on DEPARTMENT
-- ============================================================
CREATE TABLE EMPLOYEE (
    employeeID      VARCHAR(15)     PRIMARY KEY,
    name            VARCHAR(100)    NOT NULL,
    DOB             DATE            NOT NULL,
    gender          VARCHAR(10)     NOT NULL CHECK (gender IN ('Male', 'Female', 'Other')),
    joindate        DATE            NOT NULL,
    salary          DECIMAL(10,2)   NOT NULL CHECK (salary > 0),
    deptID          VARCHAR(10)     NOT NULL,

    CONSTRAINT fk_emp_dept FOREIGN KEY (deptID) REFERENCES DEPARTMENT(deptID)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
);

-- ============================================================
-- 6. FULL_TIME
-- Subclass of EMPLOYEE — depends on EMPLOYEE, HOUSE
-- ============================================================
CREATE TABLE FULL_TIME (
    employeeID      VARCHAR(15)     PRIMARY KEY,
    houseID         VARCHAR(10),

    CONSTRAINT fk_ft_emp  FOREIGN KEY (employeeID) REFERENCES EMPLOYEE(employeeID)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT fk_ft_house FOREIGN KEY (houseID) REFERENCES HOUSE(houseID)
        ON DELETE SET NULL
        ON UPDATE CASCADE
);

-- ============================================================
-- 7. CONTRACT
-- Subclass of EMPLOYEE — depends on EMPLOYEE
-- ============================================================
CREATE TABLE CONTRACT (
    employeeID      VARCHAR(15)     PRIMARY KEY,
    enddate         DATE            NOT NULL,

    CONSTRAINT fk_contract_emp FOREIGN KEY (employeeID) REFERENCES EMPLOYEE(employeeID)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- ============================================================
-- 8. INTERN
-- Subclass of EMPLOYEE — depends on EMPLOYEE
-- ============================================================
CREATE TABLE INTERN (
    employeeID      VARCHAR(15)     PRIMARY KEY,
    duration        INTEGER         NOT NULL CHECK (duration > 0),

    CONSTRAINT fk_intern_emp FOREIGN KEY (employeeID) REFERENCES EMPLOYEE(employeeID)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- ============================================================
-- 9. DEPENDENT
-- Weak entity — depends on EMPLOYEE
-- Composite PK: (employeeID + dependentname)
-- ============================================================
CREATE TABLE DEPENDENT (
    employeeID      VARCHAR(15)     NOT NULL,
    dependentname   VARCHAR(100)    NOT NULL,
    age             INTEGER         NOT NULL CHECK (age > 0),
    relation        VARCHAR(50)     NOT NULL,

    PRIMARY KEY (employeeID, dependentname),
    CONSTRAINT fk_dep_emp FOREIGN KEY (employeeID) REFERENCES EMPLOYEE(employeeID)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- ============================================================
-- 10. EMPLOYEE_TRAINING
-- M:N relationship — depends on EMPLOYEE, TRAINING
-- Composite PK: (employeeID + trainingID)
-- ============================================================
CREATE TABLE EMPLOYEE_TRAINING (
    employeeID      VARCHAR(15)     NOT NULL,
    trainingID      VARCHAR(10)     NOT NULL,

    PRIMARY KEY (employeeID, trainingID),
    CONSTRAINT fk_et_emp      FOREIGN KEY (employeeID) REFERENCES EMPLOYEE(employeeID)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT fk_et_training FOREIGN KEY (trainingID) REFERENCES TRAINING(trainingID)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- ============================================================
-- 11. EMPLOYEE_PHONE
-- Multivalued attribute — depends on EMPLOYEE
-- Composite PK: (employeeID + phonenumber)
-- ============================================================
CREATE TABLE EMPLOYEE_PHONE (
    employeeID      VARCHAR(15)     NOT NULL,
    phonenumber     VARCHAR(15)     NOT NULL,

    PRIMARY KEY (employeeID, phonenumber),
    CONSTRAINT fk_phone_emp FOREIGN KEY (employeeID) REFERENCES EMPLOYEE(employeeID)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT chk_phone CHECK (phonenumber ~ '^[0-9]{10}$')
);

-- ============================================================
-- 12. INTERNSHIP_ASSIGNMENT
-- Ternary relationship — depends on EMPLOYEE, DEPARTMENT, COLLEGE
-- Composite PK: (employeeID + deptID + collegeID)
-- ============================================================
CREATE TABLE INTERNSHIP_ASSIGNMENT (
    employeeID      VARCHAR(15)     NOT NULL,
    deptID          VARCHAR(10)     NOT NULL,
    collegeID       VARCHAR(10)     NOT NULL,

    PRIMARY KEY (employeeID, deptID, collegeID),
    CONSTRAINT fk_ia_emp     FOREIGN KEY (employeeID) REFERENCES EMPLOYEE(employeeID)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT fk_ia_dept    FOREIGN KEY (deptID) REFERENCES DEPARTMENT(deptID)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    CONSTRAINT fk_ia_college FOREIGN KEY (collegeID) REFERENCES COLLEGE(collegeID)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
);

-- ============================================================
-- SAMPLE DATA
-- ============================================================

-- Departments
INSERT INTO DEPARTMENT VALUES ('D001', 'Turbine Operations', 'Block A');
INSERT INTO DEPARTMENT VALUES ('D002', 'Electrical Systems', 'Block B');
INSERT INTO DEPARTMENT VALUES ('D003', 'Safety & Compliance', 'Block C');
INSERT INTO DEPARTMENT VALUES ('D004', 'Maintenance', 'Block D');

-- Houses
INSERT INTO HOUSE VALUES ('H001', 'Type A', 'Block X');
INSERT INTO HOUSE VALUES ('H002', 'Type B', 'Block X');
INSERT INTO HOUSE VALUES ('H003', 'Type A', 'Block Y');
INSERT INTO HOUSE VALUES ('H004', 'Type C', 'Block Y');

-- Colleges
INSERT INTO COLLEGE VALUES ('C001', 'VIT University', 'Computer Science');
INSERT INTO COLLEGE VALUES ('C002', 'Anna University', 'Electrical Engineering');
INSERT INTO COLLEGE VALUES ('C003', 'PSG College', 'Mechanical Engineering');

-- Training Programs
INSERT INTO TRAINING VALUES ('T001', 30, 'Safety Simulator Pro');
INSERT INTO TRAINING VALUES ('T002', 45, 'Turbine Control Sim');
INSERT INTO TRAINING VALUES ('T003', 20, 'Electrical Grid Sim');

-- Employees (Full Time)
INSERT INTO EMPLOYEE VALUES ('FT001', 'Arjun Kumar',   '1990-05-12', 'Male',   '2015-06-01', 75000.00, 'D001');
INSERT INTO EMPLOYEE VALUES ('FT002', 'Priya Sharma',  '1988-08-23', 'Female', '2013-03-15', 82000.00, 'D002');
INSERT INTO EMPLOYEE VALUES ('FT003', 'Ramesh Babu',   '1992-11-30', 'Male',   '2018-07-20', 68000.00, 'D003');

-- Employees (Contract)
INSERT INTO EMPLOYEE VALUES ('CT001', 'Sneha Nair',    '1995-02-14', 'Female', '2023-01-01', 45000.00, 'D004');
INSERT INTO EMPLOYEE VALUES ('CT002', 'Vikram Singh',  '1993-07-08', 'Male',   '2023-06-01', 50000.00, 'D001');

-- Employees (Intern)
INSERT INTO EMPLOYEE VALUES ('IN001', 'Rilda R',       '2004-03-10', 'Female', '2024-01-15', 15000.00, 'D002');
INSERT INTO EMPLOYEE VALUES ('IN002', 'Arun Prasad',   '2003-09-22', 'Male',   '2024-01-15', 15000.00, 'D003');
INSERT INTO EMPLOYEE VALUES ('IN003', 'Kavya Menon',   '2004-06-05', 'Female', '2024-02-01', 15000.00, 'D001');

-- Full Time details
INSERT INTO FULL_TIME VALUES ('FT001', 'H001');
INSERT INTO FULL_TIME VALUES ('FT002', 'H002');
INSERT INTO FULL_TIME VALUES ('FT003', 'H003');

-- Contract details
INSERT INTO CONTRACT VALUES ('CT001', '2024-12-31');
INSERT INTO CONTRACT VALUES ('CT002', '2024-06-30');

-- Intern details
INSERT INTO INTERN VALUES ('IN001', 3);
INSERT INTO INTERN VALUES ('IN002', 5);
INSERT INTO INTERN VALUES ('IN003', 2);

-- Dependents
INSERT INTO DEPENDENT VALUES ('FT001', 'Meena Kumar',  35, 'Spouse');
INSERT INTO DEPENDENT VALUES ('FT001', 'Raj Kumar',     8, 'Child');
INSERT INTO DEPENDENT VALUES ('FT002', 'Suresh Sharma', 62, 'Parent');

-- Employee Training
INSERT INTO EMPLOYEE_TRAINING VALUES ('FT001', 'T001');
INSERT INTO EMPLOYEE_TRAINING VALUES ('FT001', 'T002');
INSERT INTO EMPLOYEE_TRAINING VALUES ('FT002', 'T003');
INSERT INTO EMPLOYEE_TRAINING VALUES ('CT001', 'T001');

-- Employee Phone
INSERT INTO EMPLOYEE_PHONE VALUES ('FT001', '9876543210');
INSERT INTO EMPLOYEE_PHONE VALUES ('FT001', '8765432109');
INSERT INTO EMPLOYEE_PHONE VALUES ('FT002', '9988776655');
INSERT INTO EMPLOYEE_PHONE VALUES ('IN001', '9123456789');

-- Internship Assignment
INSERT INTO INTERNSHIP_ASSIGNMENT VALUES ('IN001', 'D002', 'C001');
INSERT INTO INTERNSHIP_ASSIGNMENT VALUES ('IN002', 'D003', 'C002');
INSERT INTO INTERNSHIP_ASSIGNMENT VALUES ('IN003', 'D001', 'C003');
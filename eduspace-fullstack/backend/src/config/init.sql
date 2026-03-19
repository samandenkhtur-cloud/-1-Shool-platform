-- EduSpace initial DB setup
-- This runs once when the MySQL Docker container is first created

CREATE DATABASE IF NOT EXISTS eduspace_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE eduspace_db;

-- Sequelize will create all tables via sync()
-- This file just ensures the DB and charset are correct.

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

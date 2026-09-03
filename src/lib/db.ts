import mysql from 'mysql2/promise';
import { FormData as FormDataType } from '@/lib/types';

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'basketbol_cochabamba',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: { rejectUnauthorized: true },
});

export async function initializeDatabase() {
  const connection = await pool.getConnection();
  try {
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS form_submissions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        tipo ENUM('entrenador', 'arbitro') NOT NULL,
        nombres VARCHAR(100) NOT NULL,
        apellido_paterno VARCHAR(100) NOT NULL,
        apellido_materno VARCHAR(100) NOT NULL,
        genero ENUM('masculino', 'femenino', 'otro') NOT NULL,
        ci VARCHAR(20) NOT NULL,
        nivel VARCHAR(100) NOT NULL,
        ultimo_curso VARCHAR(200),
        tiempo_experiencia VARCHAR(500) NOT NULL,
        club_entrena VARCHAR(200),
        telefono VARCHAR(14) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('Database initialized successfully');
  } finally {
    connection.release();
  }
}

export async function submitForm(data: FormDataType) {
  const connection = await pool.getConnection();
  try {
    const [result] = await connection.execute(
      `INSERT INTO form_submissions 
       (tipo, nombres, apellido_paterno, apellido_materno, genero, ci, nivel, ultimo_curso, tiempo_experiencia, club_entrena, telefono)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.tipo,
        data.nombres,
        data.apellido_paterno,
        data.apellido_materno,
        data.genero,
        data.ci,
        data.nivel,
        data.ultimo_curso || null,
        data.tiempo_experiencia,
        data.club_entrena || null,
        data.telefono,
      ]
    );
    return result;
  } finally {
    connection.release();
  }
}

export async function getAllSubmissions() {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.execute(
      `SELECT * FROM form_submissions ORDER BY apellido_paterno ASC, apellido_materno ASC, nombres ASC`
    );
    return rows;
  } finally {
    connection.release();
  }
}

export async function getSubmissionById(id: number) {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.execute(
      `SELECT * FROM form_submissions WHERE id = ?`,
      [id]
    );
    return rows;
  } finally {
    connection.release();
  }
}

export async function getSubmissionCount() {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.execute(
      `SELECT COUNT(*) as count FROM form_submissions`
    );
    return rows;
  } finally {
    connection.release();
  }
}
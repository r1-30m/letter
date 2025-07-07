require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 4001;

// 모든 요청 로그 출력 미들웨어 추가
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// 미들웨어
app.use(cors());
app.use(express.json());

// PostgreSQL Pool 생성
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// 테이블 생성 (초기화)
async function initTables() {
  await pool.query(`CREATE TABLE IF NOT EXISTS trainee (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    birth TEXT NOT NULL,
    enter_date TEXT NOT NULL,
    userid TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL
  )`);
  await pool.query(`CREATE TABLE IF NOT EXISTS letter (
    id SERIAL PRIMARY KEY,
    trainee_id INTEGER NOT NULL REFERENCES trainee(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    sender TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TEXT NOT NULL
  )`);
}
initTables();

app.get('/', (req, res) => {
  res.send('훈련소 인편 서비스 백엔드 서버 동작 중');
});

// 회원가입 API
app.post('/api/register', async (req, res) => {
  const { name, birth, enter_date, userid, password } = req.body;
  if (!name || !birth || !enter_date || !userid || !password) {
    return res.status(400).json({ success: false, message: '모든 항목을 입력하세요.' });
  }
  try {
    // 이름, 생년월일, 입소일자가 모두 동일한 사용자가 이미 있는지 확인
    const checkSql = 'SELECT * FROM trainee WHERE name = $1 AND birth = $2 AND enter_date = $3';
    const checkResult = await pool.query(checkSql, [name, birth, enter_date]);
    if (checkResult.rows.length > 0) {
      return res.status(409).json({ success: false, message: '이미 가입된 사용자입니다.' });
    }
    // ID 중복 체크 및 실제 등록
    const sql = 'INSERT INTO trainee (name, birth, enter_date, userid, password) VALUES ($1, $2, $3, $4, $5) RETURNING id';
    const insertResult = await pool.query(sql, [name, birth, enter_date, userid, password]);
    return res.json({ success: true, id: insertResult.rows[0].id });
  } catch (err) {
    if (err.code === '23505') { // unique violation
      return res.status(409).json({ success: false, message: '이미 존재하는 아이디입니다.' });
    }
    return res.status(500).json({ success: false, message: 'DB 오류', error: err.message });
  }
});

// 로그인 API
app.post('/api/login', async (req, res) => {
  const { userid, password } = req.body;
  if (!userid || !password) {
    return res.status(400).json({ success: false, message: '아이디와 비밀번호를 입력하세요.' });
  }
  try {
    const sql = 'SELECT * FROM trainee WHERE userid = $1 AND password = $2';
    const result = await pool.query(sql, [userid, password]);
    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: '존재하지 않는 계정입니다. 아이디, 비밀번호를 확인해주세요.' });
    }
    const row = result.rows[0];
    return res.json({ success: true, name: row.name, userid: row.userid, trainee_id: row.id });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'DB 오류', error: err.message });
  }
});

// 훈련병 조회 API
app.post('/api/search-trainee', async (req, res) => {
  const { name, birth, enter_date } = req.body;
  if (!name || !birth || !enter_date) {
    return res.status(400).json({ success: false, message: '모든 항목을 입력하세요.' });
  }
  try {
    const sql = 'SELECT * FROM trainee WHERE name = $1 AND birth = $2 AND enter_date = $3';
    const result = await pool.query(sql, [name, birth, enter_date]);
    if (result.rows.length === 0) {
      return res.json({ success: false, message: '조회된 훈련병이 없습니다.' });
    }
    const { id, name: rName, birth: rBirth, enter_date: rEnter } = result.rows[0];
    return res.json({ success: true, trainee: { id, name: rName, birth: rBirth, enter_date: rEnter } });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'DB 오류', error: err.message });
  }
});

// ID 중복 확인 API
app.post('/api/check-id', async (req, res) => {
  const { userid } = req.body;
  if (!userid) {
    return res.status(400).json({ success: false, message: '아이디를 입력하세요.' });
  }
  try {
    const sql = 'SELECT * FROM trainee WHERE userid = $1';
    const result = await pool.query(sql, [userid]);
    if (result.rows.length > 0) {
      return res.json({ success: false, message: '이미 존재하는 ID입니다.' });
    }
    return res.json({ success: true, message: '사용 가능한 ID입니다.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'DB 오류', error: err.message });
  }
});

// 모든 훈련병 정보 초기화(삭제) API (임시)
app.post('/api/reset-trainees', async (req, res) => {
  try {
    await pool.query('DELETE FROM trainee');
    return res.json({ success: true, message: '모든 훈련병 정보가 삭제되었습니다.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'DB 오류', error: err.message });
  }
});

// 편지 전송(저장) API
app.post('/api/send-letter', async (req, res) => {
  const { trainee_id, title, sender, content } = req.body;
  console.log('[send-letter] 받은 데이터:', trainee_id, title, sender, content);
  if (!trainee_id || !title || !sender || !content) {
    return res.status(400).json({ success: false, message: '모든 항목을 입력하세요.' });
  }
  const created_at = new Date().toISOString();
  try {
    const sql = 'INSERT INTO letter (trainee_id, title, sender, content, created_at) VALUES ($1, $2, $3, $4, $5) RETURNING id';
    await pool.query(sql, [trainee_id, title, sender, content, created_at]);
    console.log('편지 저장 성공!');
    return res.json({ success: true, message: '편지가 성공적으로 전송되었습니다.' });
  } catch (err) {
    console.log('DB 오류:', err);
    return res.status(500).json({ success: false, message: 'DB 오류', error: err.message });
  }
});

// 메일함(받은 편지함) 편지 목록 조회 API
app.post('/api/letters', async (req, res) => {
  const { trainee_id } = req.body;
  if (!trainee_id) {
    return res.status(400).json({ success: false, message: 'trainee_id가 필요합니다.' });
  }
  try {
    const sql = 'SELECT id, title, sender, content, created_at FROM letter WHERE trainee_id = $1 ORDER BY created_at DESC';
    const result = await pool.query(sql, [trainee_id]);
    return res.json({ success: true, letters: result.rows });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'DB 오류', error: err.message });
  }
});

// 편지 삭제 API
app.post('/api/delete-letter', async (req, res) => {
  const { letter_id } = req.body;
  if (!letter_id) {
    return res.status(400).json({ success: false, message: 'letter_id가 필요합니다.' });
  }
  try {
    const result = await pool.query('DELETE FROM letter WHERE id = $1', [letter_id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: '해당 편지를 찾을 수 없습니다.' });
    }
    return res.json({ success: true, message: '편지가 삭제되었습니다.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'DB 오류', error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
}); 
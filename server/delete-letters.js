const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('military.db');

db.get("SELECT id FROM trainee WHERE name='정승민' AND userid='test1'", (err, row) => {
  if (err) {
    console.error('trainee_id 조회 실패:', err.message);
    db.close();
    return;
  }
  if (!row) {
    console.log('정승민(test1) 회원을 찾을 수 없습니다.');
    db.close();
    return;
  }
  const trainee_id = row.id;
  console.log('정승민(test1) trainee_id:', trainee_id);
  db.run(
    'DELETE FROM letter WHERE trainee_id = ?',
    [trainee_id],
    function(err) {
      if (err) {
        console.error('삭제 실패:', err.message);
      } else {
        console.log('삭제 완료! 삭제된 행 수:', this.changes);
      }
      db.close();
    }
  );
}); 
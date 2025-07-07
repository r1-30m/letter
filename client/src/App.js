import React, { useState, useEffect } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
// import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

const GlobalStyle = createGlobalStyle`
  body {
    background: #111;
    min-height: 100vh;
    margin: 0;
    font-family: 'Segoe UI', Arial, sans-serif;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

const CenterBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Title = styled.h1`
  color: #fff;
  font-size: 2.2rem;
  font-weight: 700;
  margin-bottom: 40px;
`;

const MainButton = styled.button`
  background: #fff;
  color: #111;
  border: none;
  border-radius: 10px;
  padding: 16px 0;
  width: 240px;
  font-size: 1.1rem;
  font-weight: bold;
  margin: 12px 0;
  cursor: pointer;
  box-shadow: 0 2px 8px #0004;
  transition: background 0.2s, color 0.2s, transform 0.1s;
  &:hover {
    background: #eee;
    color: #111;
    transform: scale(1.03);
  }
`;

const PopupOverlay = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const PopupBox = styled.div`
  background: #181818;
  border-radius: 16px;
  padding: 36px 32px 28px 32px;
  min-width: 320px;
  box-shadow: 0 4px 32px #000a;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
`;

const PopupTitle = styled.h2`
  color: #fff;
  font-size: 1.3rem;
  margin-bottom: 24px;
`;

const Input = styled.input`
  width: 220px;
  padding: 12px;
  margin-bottom: 16px;
  border-radius: 8px;
  border: 1px solid #333;
  background: #222;
  color: #fff;
  font-size: 1rem;
`;

const PopupButton = styled.button`
  background: #fff;
  color: #111;
  border: none;
  border-radius: 8px;
  padding: 12px 0;
  width: 100%;
  font-size: 1rem;
  font-weight: bold;
  margin-top: 8px;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
  &:hover {
    background: #eee;
  }
`;

const CloseBtn = styled.button`
  position: absolute;
  top: 18px;
  right: 22px;
  background: none;
  border: none;
  color: #fff;
  font-size: 1.3rem;
  cursor: pointer;
`;

// API 기본 URL 설정
const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://letter-production.up.railway.app/api' // 실제 Railway 백엔드 주소로 변경
  : 'http://localhost:4001/api';

// API 호출 함수들
export const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });
  return response.json();
};

function App() {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [loginId, setLoginId] = useState('');
  const [loginPw, setLoginPw] = useState('');

  // 회원가입 입력값 상태
  const [regName, setRegName] = useState('');
  const [regBirth, setRegBirth] = useState('');
  const [regEnter, setRegEnter] = useState('');
  const [regId, setRegId] = useState('');
  const [regPw, setRegPw] = useState('');

  // 메일함 진입 상태
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mailboxName, setMailboxName] = useState('');
  const [traineeId, setTraineeId] = useState(null);

  // 편지 보내기 상태
  const [showLetterModal, setShowLetterModal] = useState(false);
  const [searchName, setSearchName] = useState('');
  const [searchBirth, setSearchBirth] = useState('');
  const [searchEnter, setSearchEnter] = useState('');
  const [searchResult, setSearchResult] = useState(null); // null: 조회 전, []: 없음, {}: 있음
  const [searching, setSearching] = useState(false);

  // ID 중복 확인 상태
  const [idCheckResult, setIdCheckResult] = useState(null); // null: 미확인, true: 사용 가능, false: 중복
  const [idChecking, setIdChecking] = useState(false);

  // 편지 작성 상태
  const [selectedTrainee, setSelectedTrainee] = useState(null);
  const [letterTitle, setLetterTitle] = useState('');
  const [letterSender, setLetterSender] = useState('');
  const [letterContent, setLetterContent] = useState('');
  const [sendingLetter, setSendingLetter] = useState(false);
  const [sendResult, setSendResult] = useState(null);

  // 메일함 편지 목록 상태
  const [letters, setLetters] = useState([]);
  const [loadingLetters, setLoadingLetters] = useState(false);
  // 페이징 상태
  const [currentPage, setCurrentPage] = useState(1);
  const LETTERS_PER_PAGE = 10;

  // 상세보기용 편지 상태 추가
  const [selectedLetter, setSelectedLetter] = useState(null);
  const [showLetterDetailModal, setShowLetterDetailModal] = useState(false);

  const openLogin = () => setShowLogin(true);
  const closeLogin = () => setShowLogin(false);
  const openRegister = () => setShowRegister(true);
  const closeRegister = () => setShowRegister(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    // 서버에 로그인 요청
    try {
      const data = await apiCall('/login', {
        method: 'POST',
        body: JSON.stringify({
          userid: loginId,
          password: loginPw
        })
      });
      if (data.success) {
        setIsLoggedIn(true);
        setMailboxName(data.name); // 이름으로 메일함 표시
        setTraineeId(data.trainee_id); // trainee_id 저장
        closeLogin();
        setLoginId(''); setLoginPw('');
      } else {
        alert(data.message || '로그인 실패');
      }
    } catch (err) {
      alert('서버 오류: ' + err.message);
    }
  };
  const handleRegister = async (e) => {
    e.preventDefault();
    // 서버에 회원가입 요청
    try {
      const data = await apiCall('/register', {
        method: 'POST',
        body: JSON.stringify({
          name: regName,
          birth: regBirth,
          enter_date: regEnter,
          userid: regId,
          password: regPw
        })
      });
      if (
        (data.status === 409 && data.message === '이미 가입된 사용자입니다.') ||
        (data.success === false && data.message === '이미 가입된 사용자입니다.')
      ) {
        alert('이미 가입된 사용자입니다.');
        return;
      }
      if (data.success) {
        setIsLoggedIn(true);
        setMailboxName(regName);
        closeRegister();
        setRegName(''); setRegBirth(''); setRegEnter(''); setRegId(''); setRegPw('');
      } else {
        alert(data.message || '회원가입 실패');
      }
    } catch (err) {
      alert('서버 오류: ' + err.message);
    }
  };
  const handleWriteLetter = () => {
    setShowLetterModal(true);
    setSearchName(''); setSearchBirth(''); setSearchEnter('');
    setSearchResult(null);
  };

  const handleSearchTrainee = async (e) => {
    e.preventDefault();
    setSearching(true);
    setSearchResult(null);
    try {
      const data = await apiCall('/search-trainee', {
        method: 'POST',
        body: JSON.stringify({
          name: searchName,
          birth: searchBirth,
          enter_date: searchEnter
        })
      });
      if (data.success && data.trainee) {
        setSearchResult(data.trainee);
      } else {
        setSearchResult([]);
      }
    } catch (err) {
      setSearchResult([]);
    }
    setSearching(false);
  };

  const handleCheckId = async () => {
    if (!regId) {
      setIdCheckResult('아이디를 입력하세요.');
      return;
    }
    setIdChecking(true);
    setIdCheckResult(null);
    try {
      const data = await apiCall('/check-id', {
        method: 'POST',
        body: JSON.stringify({ userid: regId })
      });
      setIdCheckResult(data.message);
    } catch (err) {
      setIdCheckResult('서버 오류');
    }
    setIdChecking(false);
  };

  // 편지 작성 폼에서 뒤로가기
  const handleBackToSearch = () => {
    setSelectedTrainee(null);
    setLetterTitle('');
    setLetterSender('');
    setLetterContent('');
    setSendResult(null);
  };

  // 메일함 편지 목록 불러오기
  const fetchLetters = async (trainee_id) => {
    setLoadingLetters(true);
    setLetters([]);
    try {
      const data = await apiCall('/letters', {
        method: 'POST',
        body: JSON.stringify({ trainee_id })
      });
      if (data.success) {
        setLetters(data.letters);
      } else {
        setLetters([]);
      }
    } catch (err) {
      setLetters([]);
    }
    setLoadingLetters(false);
  };

  // 로그인 시 메일함 편지 목록 불러오기
  useEffect(() => {
    if (isLoggedIn && traineeId) {
      fetchLetters(traineeId);
    }
  }, [isLoggedIn, traineeId]);

  useEffect(() => {
    // 편지 목록이 바뀌면 첫 페이지로 이동
    setCurrentPage(1);
  }, [letters.length]);

  // 날짜 포맷 함수 추가
  function formatDate(dateStr) {
    const d = new Date(dateStr);
    const yy = String(d.getFullYear()).slice(2);
    const mm = String(d.getMonth()+1).padStart(2,'0');
    const dd = String(d.getDate()).padStart(2,'0');
    return `${yy}/${mm}/${dd}`;
  }

  // 삭제 요청 함수 추가
  async function handleDeleteLetter(letterId) {
    if (!window.confirm('정말 이 편지를 삭제하시겠습니까?')) return;
    try {
      const data = await apiCall('/delete-letter', {
        method: 'POST',
        body: JSON.stringify({ letter_id: letterId })
      });
      if (data.success) {
        // 삭제 후 목록 갱신
        setLetters(letters => letters.filter(l => l.id !== letterId));
        if (selectedLetter && selectedLetter.id === letterId) {
          setShowLetterDetailModal(false);
          setSelectedLetter(null);
        }
      } else {
        alert(data.message || '삭제 실패');
      }
    } catch (err) {
      alert('서버 오류: ' + err.message);
    }
  }

  return (
    <>
      {/* 상세보기 모달: 항상 렌더링 */}
      {showLetterDetailModal && selectedLetter && (
        <div style={{position:'fixed',top:0,left:0,width:'100vw',height:'100vh',background:'rgba(0,0,0,0.45)',zIndex:9999,display:'flex',alignItems:'center',justifyContent:'center'}}>
          <div style={{background:'#181818',borderRadius:18,padding:'38px 44px 32px 44px',boxShadow:'0 4px 32px rgba(0,0,0,0.22)',minWidth:340,maxWidth:480,width:'100%',color:'#fff',position:'relative'}}>
            <button onClick={() => { setShowLetterDetailModal(false); setSelectedLetter(null); }} style={{position:'absolute',top:18,right:22,background:'none',color:'#fff',border:'none',fontSize:'2rem',fontWeight:'bold',cursor:'pointer',zIndex:10000}}>&times;</button>
            <div style={{fontSize:'1.3rem',fontWeight:'bold',marginBottom:18}}>편지 상세보기</div>
            <div style={{marginBottom:12, textAlign:'left'}}><b>제목:</b> {selectedLetter.title}</div>
            <div style={{marginBottom:12, textAlign:'left'}}><b>발신자:</b> {selectedLetter.sender}</div>
            <div style={{
              marginTop:18,
              whiteSpace:'pre-line',
              background:'#222',
              padding:'18px',
              borderRadius:8,
              textAlign:'left',
              maxHeight:300,
              overflowY:'auto',
              wordBreak:'break-all'
            }}>{selectedLetter.content}</div>
            <div style={{marginTop:18, color:'#bbb', fontSize:'0.98rem', textAlign:'left'}}><b>보낸 날짜:</b> {formatDate(selectedLetter.created_at)}</div>
          </div>
        </div>
      )}
      <GlobalStyle />
      {isLoggedIn ? (
        <CenterBox>
          <Title>{mailboxName}님의 메일함</Title>
          <div style={{marginTop:24}}>
            {loadingLetters ? (
              <div style={{color:'#bbb'}}>편지 목록을 불러오는 중...</div>
            ) : letters.length === 0 ? (
              <div style={{color:'#bbb'}}>받은 편지가 없습니다.</div>
            ) : (
              <>
                <table style={{width:'100%',background:'#222',color:'#fff',borderRadius:12,boxShadow:'0 2px 12px rgba(0,0,0,0.13)',overflow:'hidden',fontSize:'1.05rem'}}>
                  <thead>
                    <tr style={{background:'#181818',color:'#aaa',fontWeight:'bold'}}>
                      <th style={{padding:'14px 10px',textAlign:'left'}}>발신자</th>
                      <th style={{padding:'14px 10px',textAlign:'left'}}>제목</th>
                      <th style={{padding:'14px 10px',textAlign:'left'}}>보낸 날짜</th>
                      <th style={{padding:'14px 10px',textAlign:'left'}}>열람</th>
                      <th style={{padding:'14px 10px',textAlign:'left'}}>삭제</th>
                    </tr>
                  </thead>
                  <tbody>
                    {letters.slice((currentPage-1)*LETTERS_PER_PAGE, currentPage*LETTERS_PER_PAGE).map(letter => (
                      <tr key={letter.id} style={{borderBottom:'1px solid #333'}}>
                        <td style={{padding:'12px 10px',textAlign:'left'}}>{letter.sender}</td>
                        <td style={{padding:'12px 10px',textAlign:'left'}}>{letter.title}</td>
                        <td style={{padding:'12px 10px',textAlign:'left'}}>{formatDate(letter.created_at)}</td>
                        <td style={{padding:'12px 10px',textAlign:'left'}}>
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              setSelectedLetter(letter);
                              setShowLetterDetailModal(true);
                            }}
                            style={{
                              padding:'6px 16px',
                              borderRadius:6,
                              border:'none',
                              background:'#fff',
                              color:'#222',
                              fontWeight:'bold',
                              cursor:'pointer'
                            }}
                          >
                            열람
                          </button>
                        </td>
                        <td style={{padding:'12px 10px',textAlign:'left'}}>
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              handleDeleteLetter(letter.id);
                            }}
                            style={{
                              padding:'6px 16px',
                              borderRadius:6,
                              border:'none',
                              background:'#f55',
                              color:'#fff',
                              fontWeight:'bold',
                              cursor:'pointer'
                            }}
                          >
                            삭제
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {/* 페이징 컨트롤 */}
                <div style={{display:'flex',justifyContent:'center',alignItems:'center',marginTop:18,gap:16}}>
                  <button onClick={()=>setCurrentPage(p=>Math.max(1,p-1))} disabled={currentPage===1} style={{padding:'8px 18px',borderRadius:6,border:'none',background:'#333',color:'#fff',fontWeight:'bold',cursor:currentPage===1?'not-allowed':'pointer',opacity:currentPage===1?0.5:1}}>이전</button>
                  <span style={{color:'#fff',fontSize:'1.1rem'}}>페이지 {currentPage} / {Math.ceil(letters.length/LETTERS_PER_PAGE)}</span>
                  <button onClick={()=>setCurrentPage(p=>Math.min(Math.ceil(letters.length/LETTERS_PER_PAGE),p+1))} disabled={currentPage===Math.ceil(letters.length/LETTERS_PER_PAGE)||letters.length===0} style={{padding:'8px 18px',borderRadius:6,border:'none',background:'#333',color:'#fff',fontWeight:'bold',cursor:currentPage===Math.ceil(letters.length/LETTERS_PER_PAGE)||letters.length===0?'not-allowed':'pointer',opacity:currentPage===Math.ceil(letters.length/LETTERS_PER_PAGE)||letters.length===0?0.5:1}}>다음</button>
                </div>
              </>
            )}
          </div>
          <MainButton onClick={() => {
            setIsLoggedIn(false);
            setMailboxName('');
            setSelectedLetter(null);
            setShowLetterDetailModal(false);
          }} style={{marginTop:32}}>로그아웃</MainButton>
        </CenterBox>
      ) : (
        <>
          <CenterBox>
            <Title>훈련소 인편 서비스</Title>
            <MainButton onClick={openLogin}>훈련병 로그인</MainButton>
            <MainButton onClick={openRegister}>훈련병 가입</MainButton>
            <MainButton onClick={handleWriteLetter}>편지 보내기</MainButton>
          </CenterBox>
          {showLogin && (
            <PopupOverlay>
              <PopupBox>
                <CloseBtn onClick={closeLogin}>&times;</CloseBtn>
                <PopupTitle>훈련병 로그인</PopupTitle>
                <form onSubmit={handleLogin} style={{display:'flex',flexDirection:'column',alignItems:'stretch',width:'100%'}}>
                  <label style={{marginBottom:4}}>아이디</label>
                  <Input
                    type="text"
                    placeholder="아이디"
                    value={loginId}
                    onChange={e => setLoginId(e.target.value)}
                    autoFocus
                    required
                  />
                  <label style={{marginBottom:4}}>비밀번호</label>
                  <Input
                    type="password"
                    name="userpw"
                    autoComplete="off"
                    placeholder="비밀번호"
                    value={loginPw}
                    onChange={e => setLoginPw(e.target.value)}
                    required
                  />
                  <PopupButton type="submit">로그인</PopupButton>
                </form>
              </PopupBox>
            </PopupOverlay>
          )}
          {showRegister && (
            <PopupOverlay>
              <PopupBox>
                <CloseBtn onClick={closeRegister}>&times;</CloseBtn>
                <PopupTitle>훈련병 가입</PopupTitle>
                <form onSubmit={handleRegister} style={{display:'flex',flexDirection:'column',alignItems:'stretch',width:'100%'}}>
                  <label style={{marginBottom:4}}>이름</label>
                  <Input
                    type="text"
                    placeholder="이름"
                    value={regName}
                    onChange={e => setRegName(e.target.value)}
                    autoFocus
                    required
                  />
                  <label style={{marginBottom:4}}>생년월일</label>
                  <Input
                    type="text"
                    placeholder="생년월일(6자리, YYMMDD)"
                    value={regBirth}
                    onChange={e => {
                      const v = e.target.value.replace(/[^0-9]/g, '').slice(0,6);
                      setRegBirth(v);
                    }}
                    required
                    maxLength={6}
                    inputMode="numeric"
                  />
                  <label style={{marginBottom:4}}>입소일자</label>
                  <Input
                    type="date"
                    placeholder="입소일자"
                    value={regEnter}
                    onChange={e => setRegEnter(e.target.value)}
                    required
                  />
                  <label style={{marginBottom:4}}>아이디</label>
                  <div style={{display:'flex',gap:8,alignItems:'center'}}>
                  <Input
                    type="text"
                    placeholder="아이디"
                    value={regId}
                    onChange={e => { setRegId(e.target.value); setIdCheckResult(null); }}
                    required
                    style={{flex:1}}
                  />
                    <PopupButton type="button" onClick={handleCheckId} disabled={idChecking} style={{minWidth:90}}>
                      {idChecking ? '확인 중...' : 'ID 확인'}
                    </PopupButton>
                  </div>
                  {idCheckResult && (
                    <div style={{marginTop:4, color: idCheckResult.includes('사용 가능') ? '#2a8' : '#f55'}}>{idCheckResult}</div>
                  )}
                  <label style={{marginBottom:4}}>비밀번호</label>
                  <Input
                    type="password"
                    name="userpw"
                    autoComplete="off"
                    placeholder="비밀번호"
                    value={regPw}
                    onChange={e => setRegPw(e.target.value)}
                    required
                  />
                  <PopupButton type="submit">가입</PopupButton>
                </form>
              </PopupBox>
            </PopupOverlay>
          )}
          {showLetterModal && (
            <PopupOverlay>
              <PopupBox>
                <CloseBtn onClick={() => { setShowLetterModal(false); setSelectedTrainee(null); }}>&times;</CloseBtn>
                <PopupTitle>{selectedTrainee ? '편지 작성' : '훈련병 조회'}</PopupTitle>
                {/* 편지 작성 폼만 보이도록 분기 */}
                {selectedTrainee ? (
                  <div style={{
                    background:'#222',
                    color:'#fff',
                    borderRadius:16,
                    padding:'40px 48px 36px 48px',
                    boxShadow:'0 4px 32px rgba(0,0,0,0.22)',
                    maxWidth:700,
                    minWidth:380,
                    width:'100%',
                    marginLeft:'auto',
                    marginRight:'auto',
                    minHeight:520,
                    display:'flex',
                    flexDirection:'column',
                    justifyContent:'center',
                    alignItems:'stretch',
                  }}>
                    <button onClick={handleBackToSearch} style={{position:'absolute',top:18,left:22,background:'#fff',color:'#222',border:'none',borderRadius:6,padding:'6px 16px',fontWeight:'bold',cursor:'pointer',fontSize:'1rem',boxShadow:'0 1px 4px rgba(0,0,0,0.08)'}}>뒤로가기</button>
                    <form onSubmit={async e => {
                      e.preventDefault();
                      if (!selectedTrainee || !selectedTrainee.id) {
                        alert('받는 훈련병을 먼저 선택해 주세요.');
                        setSendingLetter(false);
                        return;
                      }
                      setSendingLetter(true);
                      setSendResult(null);
                      try {
                        const data = await apiCall('/send-letter', {
                          method: 'POST',
                          body: JSON.stringify({
                            trainee_id: selectedTrainee.id,
                            title: letterTitle.trim(),
                            sender: letterSender.trim(),
                            content: letterContent.trim()
                          })
                        });
                        console.log('send-letter 응답:', data);
                        setSendResult(data);
                        if (data.success) {
                          setLetterTitle('');
                          setLetterSender('');
                          setLetterContent('');
                        }
                      } catch (err) {
                        setSendResult({ success: false, message: '서버 오류' });
                      }
                      setSendingLetter(false);
                    }}>
                      <div style={{marginBottom:16,fontSize:'1.1rem'}}><b>받는 훈련병:</b> {selectedTrainee.name}</div>
                      {/* 제목과 보내는 사람을 한 줄에 배치 */}
                      <div style={{display:'flex',gap:20,marginBottom:16}}>
                        <div style={{flex:2}}>
                          <label style={{marginBottom:4,display:'block'}}>제목</label>
                          <Input
                            type="text"
                            placeholder="제목"
                            value={letterTitle}
                            onChange={e => setLetterTitle(e.target.value)}
                            required
                            maxLength={50}
                            style={{fontSize:'1.1rem',padding:'14px 12px'}}
                          />
                        </div>
                        <div style={{flex:1}}>
                          <label style={{marginBottom:4,display:'block'}}>보내는 사람</label>
                          <Input
                            type="text"
                            placeholder="보내는 사람"
                            value={letterSender}
                            onChange={e => setLetterSender(e.target.value)}
                            required
                            maxLength={20}
                            style={{fontSize:'1.1rem',padding:'14px 12px'}}
                          />
                        </div>
                      </div>
                      <label style={{marginBottom:4}}>내용</label>
                      <textarea
                        placeholder="내용을 입력하세요 (최대 1500자)"
                        value={letterContent}
                        onChange={e => {
                          if (e.target.value.length <= 1500) setLetterContent(e.target.value);
                        }}
                        required
                        maxLength={1500}
                        style={{resize:'vertical',minHeight:320,maxHeight:700,marginBottom:12,padding:18,borderRadius:10,border:'1.5px solid #333',background:'#222',color:'#fff',fontSize:'1.13rem',lineHeight:'1.7',width:'100%'}}
                      />
                      <div style={{textAlign:'right',fontSize:'1rem',color:'#bbb',marginBottom:10}}>{letterContent.length} / 1500자</div>
                      <PopupButton type="submit" disabled={sendingLetter} style={{marginTop:18,fontSize:'1.1rem',padding:'16px 0'}}>
                        {sendingLetter ? '전송 중...' : '편지 보내기'}
                      </PopupButton>
                      {sendResult && (
                        <div style={{marginTop:10, color: sendResult.success ? '#2a8' : '#f55',fontSize:'1.05rem'}}>{sendResult.message}</div>
                      )}
                    </form>
                  </div>
                ) : (
                  <form onSubmit={handleSearchTrainee} style={{display:'flex',flexDirection:'column',alignItems:'stretch',width:'100%'}}>
                    <label style={{marginBottom:4}}>이름</label>
                    <Input
                      type="text"
                      placeholder="이름"
                      value={searchName}
                      onChange={e => setSearchName(e.target.value)}
                      required
                    />
                    <label style={{marginBottom:4}}>생년월일</label>
                    <Input
                      type="text"
                      placeholder="생년월일(6자리, YYMMDD)"
                      value={searchBirth}
                      onChange={e => {
                        const v = e.target.value.replace(/[^0-9]/g, '').slice(0,6);
                        setSearchBirth(v);
                      }}
                      required
                      maxLength={6}
                      inputMode="numeric"
                    />
                    <label style={{marginBottom:4}}>입소일자</label>
                    <Input
                      type="date"
                      placeholder="입소일자"
                      value={searchEnter}
                      onChange={e => setSearchEnter(e.target.value)}
                      required
                    />
                    <PopupButton type="submit" disabled={searching} style={{marginTop:16}}>
                      {searching ? '조회 중...' : '조회'}
                    </PopupButton>
                  </form>
                )}
                {/* 조회 결과 표시 (selectedTrainee가 없을 때만) */}
                {!selectedTrainee && searchResult !== null && (
                  <div style={{marginTop:24}}>
                    {Array.isArray(searchResult) ? (
                      <div style={{color:'#f55'}}>조회된 훈련병이 없습니다</div>
                    ) : (
                      <div style={{
                        background:'#222',
                        color:'#fff',
                        borderRadius: '12px',
                        padding: '20px 28px',
                        boxShadow: '0 2px 12px rgba(0,0,0,0.18)',
                        display: 'inline-block',
                        minWidth: '220px',
                        margin: '0 auto',
                        textAlign: 'left',
                        fontSize: '1.1rem',
                        letterSpacing: '0.02em',
                        position: 'relative',
                      }}>
                        <div style={{fontWeight:'bold',fontSize:'1.2rem',marginBottom:8}}>훈련병 정보</div>
                        <div><b>이름</b>: {searchResult.name}</div>
                        <div><b>생년월일</b>: {searchResult.birth}</div>
                        <div><b>입소일자</b>: {searchResult.enter_date}</div>
                        <button
                          style={{
                            position: 'absolute',
                            top: 16,
                            right: 16,
                            background: '#fff',
                            color: '#222',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '6px 16px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            fontSize: '1rem',
                            boxShadow: '0 1px 4px rgba(0,0,0,0.08)'
                          }}
                          onClick={() => setSelectedTrainee(searchResult)}
                        >선택</button>
                      </div>
                    )}
                  </div>
                )}
              </PopupBox>
            </PopupOverlay>
          )}
        </>
      )}
    </>
  );
}

export default App;

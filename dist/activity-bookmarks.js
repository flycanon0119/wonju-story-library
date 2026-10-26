// Activity notes stay in the existing owner-only notes collection.
export function joinBookmarkNotes(notes, meetings, uid, bookId) {
  if (!uid) return [];
  return notes.flatMap(note => {
    if (!note.id || typeof note.summary !== 'string' || typeof note.nextGoal !== 'string') return [];
    const meeting = meetings.find(m => m.id === note.id);
    if (meeting && (meeting.menteeUid !== uid || meeting.status !== 'completed')) return [];
    const id = meeting?.bookId || meeting?.mentorUid;
    if (bookId && id !== bookId) return [];
    return [{ note, meeting, bookId: id }];
  }).sort((a,b) => String(b.meeting?.meetingDate || '').localeCompare(String(a.meeting?.meetingDate || '')) || a.note.id.localeCompare(b.note.id));
}

export function installActivityBookmarks(cloud, edit, redraw) {
  const entries = bookId => cloud.notesOwner === cloud.user?.uid
    ? joinBookmarkNotes(cloud.notes, cloud.meetings, cloud.user?.uid, bookId) : [];
  const completed = bookId => cloud.meetings.filter(m => m.status === 'completed' && m.menteeUid === cloud.user?.uid && (!bookId || (m.bookId || m.mentorUid) === bookId));
  const label = entry => getBook(entry.bookId);
  const title = book => book ? String(book.title).replaceAll('\n',' ') : '만남 뒤에 남긴 이야기';
  const short = text => text.length > 110 ? text.slice(0,110) + '…' : text;
  function paper(entry, full = false, example = false) {
    const b = label(entry), n = entry.note;
    return `<article class="activity-bookmark ${full?'activity-bookmark-full':''}" ${example?'':'data-private-bookmark'}>
      <span class="activity-ribbon" aria-hidden="true">${icon('bookmark')}</span>
      <div class="activity-paper-meta">${example?'모양을 살펴보는 예시':'나만 보는 책갈피'}${entry.meeting?.meetingDate?' · '+esc(entry.meeting.meetingDate):''}</div>
      <h3>${example?'이야기에서 발견한 나의 힌트':esc(b?b.name+'님의 사람책':'나의 만남 기록')}</h3>
      <p class="activity-book-title">${esc(title(b))}</p>
      <dl><div><dt>오늘 얻은 힌트</dt><dd>${esc(full?n.summary:short(n.summary))}</dd></div>
      <div><dt>다음에 해보고 싶은 활동</dt><dd>${esc(full?n.nextGoal:short(n.nextGoal))}</dd></div></dl>
      ${!full?`<button class="text-link" data-action="activity-view" data-id="${esc(n.id)}">책갈피 펼치기 ${icon('arrow')}</button>`:''}
    </article>`;
  }
  function empty(bookId) {
    const eligible = completed(bookId).filter(m => !cloud.notes.some(n => n.id === m.id));
    return `<div class="activity-bookmark-empty"><span class="activity-empty-icon">${icon('bookmark')}</span>
      <h3>${cloud.user?'만남의 기억을 이 책에 꽂아두세요.':'나의 경험도 책갈피가 돼요.'}</h3>
      <p>멘토링에서 배운 점과 해보고 싶은 활동을 적으면,<br>그 사람의 책에 나만의 책갈피로 남아요.</p>
      <div class="actions">${eligible.length?`<button class="btn primary" data-action="activity-write" data-id="${esc(bookId||'')}">책갈피 남기기</button>`:cloud.user?'<a class="btn" href="#meetings" data-action="activity-meetings">완료한 만남 보기</a>':'<button class="btn" data-action="account">로그인하고 내 책갈피 보기</button>'}
      <button class="text-link" data-action="activity-preview" data-id="${esc(bookId||'')}">책갈피 미리보기 ${icon('arrow')}</button></div></div>`;
  }
  function content(bookId) {
    if (cloud.user && !cloud.notesReady) return '<p class="pill-note" role="status">내 책갈피를 불러오는 중이에요…</p>';
    if (cloud.user && cloud.notesError) return '<p class="form-error" role="status">책갈피를 불러오지 못했어요. 연결을 확인한 뒤 다시 열어주세요.</p>';
    const list = entries(bookId);
    return list.length?`<div class="activity-bookmark-grid">${list.map(e=>paper(e)).join('')}</div>${completed(bookId).some(m=>!cloud.notes.some(n=>n.id===m.id))?`<button class="btn" data-action="activity-write" data-id="${esc(bookId||'')}">다른 만남의 책갈피 남기기</button>`:''}`:empty(bookId);
  }
  function shelfSection() {
    return `<section class="activity-bookmark-shelf" aria-labelledby="activity-shelf-heading"><div class="section-line"><div><span class="eyebrow">MY STORY BOOKMARKS</span><h2 id="activity-shelf-heading">나만의 책갈피 ${cloud.user&&cloud.notesReady?`<small>${entries().length}개</small>`:''}</h2></div><span class="activity-private-label">${icon('shield')} 나만 보기</span></div><p class="activity-section-intro">만남에서 얻은 힌트와 다음 활동을 사람책에 꽂아두었어요.</p>${content()}</section>`;
  }
  function bookSection(id) {
    return `<section id="activity-bookmarks-in-book" class="activity-bookmark-section" data-book="${esc(id)}" data-private-bookmark><div class="section-line"><h3>이 책에 꽂아둔 나만의 책갈피</h3><span class="activity-private-label">${icon('shield')} 나만 보기</span></div>${content(id)}</section>`;
  }
  function show(id) {
    if (!cloud.user) { accountPageModal(); return; }
    const entry = entries().find(e=>e.note.id===id);
    if (!entry) { toast('책갈피를 불러오는 중이에요. 잠시 후 다시 열어주세요.'); return; }
    openModal('책에 꽂아둔 나만의 책갈피',`<div class="modal-body" data-private-bookmark>${paper(entry,true)}<p class="activity-privacy-note">이 힌트와 활동 기록은 본인만 볼 수 있어요. 공개 후기는 별도로 관리해요.</p><div class="actions">${entry.bookId&&getBook(entry.bookId)?`<button class="btn" data-action="read" data-id="${esc(entry.bookId)}">사람책에서 보기</button>`:''}${entry.meeting?`<button class="btn primary" data-action="cloud-review" data-id="${esc(id)}">책갈피·후기 수정</button>`:''}</div></div>`);
  }
  function preview(id) {
    const b = getBook(id) || books[1];
    const entry = {bookId:b?.id,note:{summary:'좋아하는 일을 작은 활동으로 시작해봐도 된다는 걸 배웠어요.',nextGoal:'이번 주에 관심 있는 활동 하나를 해보고, 즐거웠던 순간을 적어볼래요.'}};
    openModal('나만의 책갈피 미리보기',`<div class="modal-body"><p class="activity-example-label">예시 책갈피 · 실제 기록으로 저장되지 않아요</p>${paper(entry,true,true)}<p class="activity-privacy-note">실제 만남이 끝나면 직접 적은 힌트와 활동이 해당 사람책에 남아요. 내 공간에서도 다시 펼칠 수 있어요.</p>${id&&getBook(id)?`<button class="btn full" data-action="read" data-id="${esc(id)}">이 사람책으로 돌아가기</button>`:'<button class="btn full" data-action="close">둘러보던 화면으로</button>'}</div>`);
  }
  function write(bookId) {
    const list = completed(bookId).filter(m=>!cloud.notes.some(n=>n.id===m.id));
    if (list.length===1) { edit(list[0].id); return; }
    if (!list.length) { toast('완료한 내 만남에서 책갈피를 남길 수 있어요.'); return; }
    openModal('어떤 만남에 책갈피를 꽂을까요?',`<div class="modal-body activity-meeting-choices">${list.map(m=>`<button class="btn" data-action="cloud-review" data-id="${esc(m.id)}">${esc(getBook(m.bookId||m.mentorUid)?.name||'멘토')}님 · ${esc(m.slotLabel||m.meetingDate)}</button>`).join('')}</div>`);
  }
  const originalShelf = shelf;
  shelf = () => {
    let html = originalShelf().replace('이 브라우저에 저장돼요',cloud.user?'로그인한 계정에 저장돼요':'로그인 후 책장에 담을 수 있어요');
    const at = html.indexOf('<div class="result-meta">');
    return at<0?html+shelfSection():html.slice(0,at)+shelfSection()+html.slice(at);
  };
  const originalRead = readBook;
  const originalSpine = spine;
  spine = (book,index) => {
    const html = originalSpine(book,index), count = entries(book.id).length;
    return count ? html.replace('<span class="spine-bands"',`<span class="activity-spine-ribbon" aria-label="내 활동 책갈피 ${count}개">${icon('bookmark')}</span><span class="spine-bands"`) : html;
  };
  readBook = id => {
    originalRead(id);
    if (!getBook(id)) return;
    const host = $('.reader-reviews', $('#dialog')) || $('.reader-actions', $('#dialog'));
    host?.insertAdjacentHTML('beforebegin',bookSection(id));
    $('.reader-tags', $('#dialog'))?.insertAdjacentHTML('afterend',`<button class="activity-bookmark-jump" data-action="activity-jump" data-id="${esc(id)}">${icon('bookmark')}<span>나만의 책갈피${entries(id).length?' '+entries(id).length:''}</span></button>`);
  };
  function refresh() {
    redraw();
    const current = $('#activity-bookmarks-in-book');
    if (current) { const id=current.dataset.book; current.outerHTML=bookSection(id); const badge=$('.activity-bookmark-jump span');if(badge)badge.textContent='나만의 책갈피'+(entries(id).length?' '+entries(id).length:''); }
  }
  document.addEventListener('click',e=>{
    const el=e.target.closest('[data-action^="activity-"]');if(!el)return;
    e.preventDefault();e.stopImmediatePropagation();const id=el.dataset.id;
    if(el.dataset.action==='activity-preview')preview(id);
    if(el.dataset.action==='activity-view')show(id);
    if(el.dataset.action==='activity-write')write(id);
    if(el.dataset.action==='activity-jump')$('#activity-bookmarks-in-book')?.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});
    if(el.dataset.action==='activity-meetings'){closeModal();location.hash='meetings';}
  },true);
  return {show,refresh};
}

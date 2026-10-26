const escapeHtml=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

// Display-only serial. Authentication and database access continue to use Firebase Auth.
export function membershipNumber(uid){
 if(!uid)return '';
 let hash=14695981039346656037n;
 for(const character of String(uid))hash=BigInt.asUintN(64,(hash^BigInt(character.codePointAt(0)))*1099511628211n);
 return 'WJ '+hash.toString(16).padStart(16,'0').slice(0,12).toUpperCase().match(/.{4}/g).join(' ');
}

export function renderMembershipCard({user=null,nickname='',mentorName='',role='멘티'}={}){
 const preview=!user;
 const name=preview?'이야기를 만날 당신':mentorName||nickname||user.displayName||'독자';
 const created=new Date(user?.metadata?.creationTime||'');
 const issued=Number.isNaN(created.getTime())?'가입 후 발급':new Intl.DateTimeFormat('ko-KR',{year:'numeric',month:'2-digit',day:'2-digit',timeZone:'Asia/Seoul'}).format(created);
 const number=membershipNumber(user?.uid);
 const book='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M3 4c4-1 7 0 9 2 2-2 5-3 9-2v15c-4-1-7 0-9 2-2-2-5-3-9-2z M12 6v15"/></svg>';
 return `<figure class="membership-card-wrap"><div class="membership-card ${preview?'is-preview':''}" aria-label="${preview?'도서관 회원증 미리보기':'나의 도서관 회원증'}">
  <div class="membership-watermark" aria-hidden="true">${book}</div>
  <header class="membership-card-header"><div class="membership-brand"><span class="membership-mark">${book}</span><div><strong>원주도서관</strong><small>HUMAN STORY LIBRARY</small></div></div><span class="membership-edition">${preview?'미리보기':'LIBRARY CARD'}</span></header>
  <div class="membership-owner"><span class="membership-owner-label">이야기를 함께 읽는 사람</span><div><h2>${escapeHtml(name)}</h2><span class="membership-role">${preview?'예비 독자':escapeHtml(role)}</span></div></div>
  <dl class="membership-details"><div><dt>회원번호</dt><dd class="membership-number">${preview?'WJ · · · · · · · · · · · ·':escapeHtml(number)}</dd></div><div><dt>발급일</dt><dd>${escapeHtml(issued)}</dd></div></dl>
  <div class="membership-card-bottom"><div class="membership-code" aria-hidden="true"><span></span><small>WONJU · MEMBERSHIP</small></div><span class="membership-status ${user?.emailVerified?'is-verified':''}"><i aria-hidden="true"></i>${preview?'가입하고 내 회원증 받기':user.emailVerified?'이메일 인증 완료':'이메일 인증 대기'}</span></div>
  <footer class="membership-card-band"><span>한 사람을 읽는 시간</span><span>YOUR NEXT CHAPTER</span></footer>
 </div><figcaption>${preview?'회원가입하면 나만의 도서관 회원증이 만들어져요.':'다음 이야기를 만나러 갈 때, 언제든 꺼내보세요.'}</figcaption></figure>`;
}

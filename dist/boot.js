// Do not fall back to the old browser-local simulation if the live SDK cannot load.
window.libraryReady=false;
const loading=document.createElement('div');loading.id='connection-loading';loading.setAttribute('role','status');loading.style.cssText='position:fixed;inset:0;z-index:2147483647;background:#f9f8f3;display:grid;place-content:center;text-align:center;color:#214f43;font:14px/2 system-ui';loading.textContent='도서관을 열고 있어요…';document.body.append(loading);
for(const type of ['click','submit'])document.addEventListener(type,e=>{if(!window.libraryReady&&!e.target.closest('#connection-loading')){e.preventDefault();e.stopImmediatePropagation()}},true);
setTimeout(()=>{if(!window.libraryReady)loading.innerHTML='<p>서버 연결을 확인해주세요.</p><p>네트워크 연결 후 새로고침하면 다시 열 수 있어요.</p>'},12000);

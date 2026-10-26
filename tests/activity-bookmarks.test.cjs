const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {pathToFileURL}=require('node:url');
const root=path.resolve(__dirname,'../dist');
(async()=>{
 const {joinBookmarkNotes}=await import(pathToFileURL(path.join(root,'activity-bookmarks.js')));
 const note={id:'meeting-a',summary:'배운 내용',nextGoal:'다음 활동',rating:4,publicNote:'공개 후기',publicConsent:true};
 const meeting={id:'meeting-a',bookId:'book-a',mentorUid:'mentor-a',menteeUid:'reader-a',status:'completed',meetingDate:'2026-10-20'};
 assert.equal(joinBookmarkNotes([note],[meeting],null).length,0,'Anonymous sessions cannot see notes');
 assert.equal(joinBookmarkNotes([note],[meeting],'reader-b').length,0,'Other participants cannot attach this note');
 assert.equal(joinBookmarkNotes([note],[{...meeting,status:'confirmed'}],'reader-a').length,0,'Unfinished meetings do not receive activity bookmarks');
 assert.equal(joinBookmarkNotes([note],[meeting],'reader-a','book-b').length,0,'Bookmarks attach only to their associated book');
 assert.equal(joinBookmarkNotes([note],[meeting],'reader-a','book-a')[0].note.summary,note.summary,'Legacy private records retain their content');
 assert.equal(joinBookmarkNotes([note],[],'reader-a')[0].note.nextGoal,note.nextGoal,'Older records remain readable when meeting metadata is not in the current list');
 const source=fs.readFileSync(path.join(root,'cloud.js'),'utf8');
 const fn=source.slice(source.indexOf('async function saveActivityBookmark('),source.indexOf('async function reviewCloud('));
 async function run(mode){
  const writes=[],shown=[],messages=[];
  const cloud={user:{uid:'reader-a'},profile:{nickname:'독자'},notes:[]};
  const context={cloud,db:{},writeBatch:()=>({set:(ref,data)=>writes.push({ref,data}),commit:async()=>{if(mode==='fail')throw Error('network failure');if(mode==='logout')cloud.user=null;}}),doc:(_db,...parts)=>parts.join('/'),serverTimestamp:()=>({serverTime:true}),activityBookmarks:{show:id=>shown.push(id)},toast:message=>messages.push(message)};
  vm.runInNewContext(fn+';this.save=saveActivityBookmark;',context);
  const data={...note};delete data.id;
  if(mode==='fail')await assert.rejects(context.save(meeting,data),/network failure/);else await context.save(meeting,data);
  return {writes,shown,messages,cloud};
 }
 const ok=await run('success');
 assert.equal(ok.writes.length,2,'Private note and public review are committed in one batch');
 assert.equal(ok.writes[0].ref,'users/reader-a/notes/meeting-a');
 assert.equal(ok.writes[1].ref,'reviews/meeting-a');
 assert.equal(ok.writes[0].data.summary,note.summary);
 assert.equal(ok.writes[1].data.body,note.publicNote);
 assert.equal('summary' in ok.writes[1].data,false,'Learning notes never enter the public review');
 assert.equal('nextGoal' in ok.writes[1].data,false,'Next activities never enter the public review');
 assert.equal(ok.shown[0],'meeting-a');
 const failure=await run('fail');
 assert.equal(failure.cloud.notes.length,0,'Failed writes do not replace the saved private notes');
 assert.equal(failure.messages.length,0,'Failed writes do not show a saved confirmation');
 const logout=await run('logout');
 assert.equal(logout.shown.length,0,'Signing out during a save does not expose the previous account record');
 console.log('PASS: association, legacy notes, owner scope, atomic save, private/public separation, failed save, account switching.');
})().catch(e=>{console.error(e);process.exitCode=1});


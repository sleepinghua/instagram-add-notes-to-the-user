// ==UserScript==
// @name         Instagram 用户备注（终极完整稳定版）
// @namespace    ig-note-ultimate-complete
// @version      3.1.0
// @description  Instagram 用户备注：分组、颜色、统一入口、管理、同步（最终定稿）
// @match        https://www.instagram.com/*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_listValues
// @grant        GM_addStyle
// ==/UserScript==

(function () {
  'use strict';

  const GROUP_KEY = '__ig_note_groups__';

  /* ================= 数据 ================= */

  function getGroups() {
    return GM_getValue(GROUP_KEY, {
      default: { name: '默认', color: '#336699' }
    });
  }
  function saveGroups(g) { GM_setValue(GROUP_KEY, g); }

  function getNote(u) {
    const v = GM_getValue(u);
    if (!v) return null;
    if (typeof v === 'string') return { text: v, group: 'default' };
    return v;
  }
  function setNote(u, n) { GM_setValue(u, n); }

  /* ================= 样式 ================= */

  GM_addStyle(`
    .ig-note-btn{margin-left:6px;cursor:pointer;opacity:.6}
    .ig-note-btn:hover{opacity:1}

    .ig-note-text{
      margin-left:6px;padding:2px 6px;border-radius:6px;
      color:#fff;font-size:12px;white-space:nowrap
    }

    .ig-float-btn{
      position:fixed;right:20px;bottom:20px;
      width:44px;height:44px;border-radius:50%;
      background:#336699;color:#fff;
      display:flex;align-items:center;justify-content:center;
      cursor:pointer;z-index:999999;
      box-shadow:0 4px 12px rgba(0,0,0,.3);
      font-size:20px
    }

    .ig-panel{
      position:fixed;top:8%;left:50%;transform:translateX(-50%);
      width:540px;max-height:75%;
      background:#fff;color:#000;
      border-radius:8px;
      box-shadow:0 10px 30px rgba(0,0,0,.3);
      padding:16px;
      z-index:1000000;
      overflow:auto;font-size:14px
    }

    .ig-close{float:right;cursor:pointer;font-weight:bold}

    .ig-form{
      display:grid;
      grid-template-columns:120px 1fr;
      gap:10px;
      align-items:center
    }

    /* make controls layout inline inside forms to avoid vertical stacking */
    .ig-form .ig-control{display:flex;align-items:center;gap:8px}
    .ig-form .ig-control input[type="text"], .ig-form .ig-control input[type="color"], .ig-form .ig-control select{flex:1}
    .ig-form{margin-bottom:8px}

    .ig-control input,
    .ig-control select,
    .ig-control button{
      width:100%;padding:6px;font-size:14px;box-sizing:border-box;display:block
    }

    .ig-color-row input[type="color"]{width:46px;flex:0 0 46px;padding:0;border:none}
    .ig-color-row .ig-color-options{flex:1;display:flex;gap:6px;flex-wrap:wrap}

    .ig-row input,.ig-row select{width:100%;box-sizing:border-box;padding:6px;font-size:14px}

    .ig-color-row{display:flex;align-items:center;gap:8px}
    .ig-color-options{display:flex;gap:6px;flex-wrap:wrap}
    #note_newPalette{display:flex;gap:6px;flex-wrap:wrap;margin-top:6px}
    .ig-color-dot{
      width:22px;height:22px;border-radius:50%;
      border:1px solid #aaa;cursor:pointer
    }

    .ig-list{display:flex;flex-direction:column;gap:6px}
    .ig-row{
      display:grid;
      grid-template-columns:120px 1fr 150px 60px;
      gap:6px;
      align-items:center;
      border-bottom:1px solid #eee;
      padding:4px 0
    }

    .ig-user{font-weight:bold}
    .ig-group{display:flex;align-items:center;gap:6px}
    .ig-dot{width:10px;height:10px;border-radius:50%}
  `);

  /* ================= 工具 ================= */

  function getUsernameFromAnchor(a) {
    const m = a.href?.match(/^https:\/\/www\.instagram\.com\/([a-zA-Z0-9._]+)\/$/);
    return m ? m[1] : null;
  }

  /* ================= 页面显示 ================= */

  function createNote(note) {
    const g = getGroups()[note.group] || getGroups().default;
    const s = document.createElement('span');
    s.className = 'ig-note-text';
    s.style.background = g.color;
    s.textContent = note.group === 'default'
      ? note.text
      : `${note.text} [${g.name}]`;
    return s;
  }

  function createBtn(u, refresh) {
    const b = document.createElement('span');
    b.textContent = '📝';
    b.className = 'ig-note-btn';
    b.onclick = e => {
      e.preventDefault(); e.stopPropagation();
      openEditPanel(u, refresh);
    };
    return b;
  }

  /* ================= 备注编辑 ================= */

  function openEditPanel(username, refresh) {
    const groups = getGroups();
    const old = getNote(username);

    const p = panel(`
      <h3>${old ? '编辑' : '新增'} @${username} 备注</h3>
      <div class="ig-form">
        <label>备注名</label>
        <div class="ig-control"><input id="note"></div>

        <label>分组</label>
        <div class="ig-control"><select id="group"></select></div>

        <label>新建分组</label>
        <div class="ig-control"><input id="newGroup" placeholder="可选"></div>

        <label>分组颜色</label>
        <div class="ig-control ig-color-row">
          <input id="color" type="color">
          <div class="ig-color-options"></div>
        </div>
      </div>
      <br><button id="save">保存</button> <button id="closeEdit">关闭</button>
    `);

    const noteI = p.querySelector('#note');
    const sel = p.querySelector('#group');
    const newG = p.querySelector('#newGroup');
    const colorI = p.querySelector('#color');
    const box = p.querySelector('.ig-color-options');

    Object.entries(groups).forEach(([id,g])=>{
      const o=document.createElement('option');
      o.value=id;o.textContent=g.name;
      sel.appendChild(o);
    });

    ['#336699','#2ECC71','#3498DB','#9B59B6','#E67E22',
     '#E74C3C','#1ABC9C','#F1C40F','#7F8C8D','#34495E']
    .forEach(c=>{
      const d=document.createElement('div');
      d.className='ig-color-dot';
      d.style.background=c;
      d.onclick=()=>colorI.value=c;
      box.appendChild(d);
    });

    if (old) {
      noteI.value = old.text;
      sel.value = old.group;
      colorI.value = groups[old.group].color;
    }

    sel.onchange = () => colorI.value = groups[sel.value].color;

    p.querySelector('#save').onclick = () => {
      const text = noteI.value.trim();
      if (!text) { showMsg(p,'备注不能为空'); return; }
      const gid = newG.value.trim() || sel.value;
      const all = getGroups();
      if (!all[gid]) all[gid] = { name: gid, color: colorI.value };
      else all[gid].color = colorI.value;
      saveGroups(all);
      setNote(username, { text, group: gid });
      refresh();
      p.remove();
    };
    p.querySelector('#closeEdit').onclick = ()=>p.remove();
  }

  /* ================= 注入 ================= */

  function applyAnchor(a) {
    if (a.dataset.igDone) return;
    const u = getUsernameFromAnchor(a);
    if (!u) return;
    a.dataset.igDone = '1';

    const w=document.createElement('span');
    const render=()=>{
      w.innerHTML='';
      w.append(createBtn(u, render));
      const n=getNote(u);
      if(n) w.append(createNote(n));
    };
    render();
    a.after(w);
  }

  function applyProfile() {
    const u=location.pathname.split('/')[1];
    const h2=document.querySelector('h2');
    if(!u||!h2||h2.dataset.igDone) return;
    h2.dataset.igDone='1';

    const box=document.createElement('div');
    const render=()=>{
      box.innerHTML='';
      box.append(createBtn(u, render));
      const n=getNote(u);
      if(n) box.append(createNote(n));
    };
    render();
    h2.after(box);
  }

  new MutationObserver(()=>{
    document.querySelectorAll('a[href^="/"]').forEach(applyAnchor);
    applyProfile();
  }).observe(document.body,{childList:true,subtree:true});

  /* ================= 面板工具 ================= */

  function panel(html) {
    const p=document.createElement('div');
    p.className='ig-panel';
    p.innerHTML=`<span class="ig-close">✖</span>${html}`;
    p.querySelector('.ig-close').onclick=()=>p.remove();
    document.body.appendChild(p);
    return p;
  }

  function showMsg(panelEl, msg) {
    try{
      const m = document.createElement('div');
      m.className = 'ig-msg';
      m.textContent = msg;
      Object.assign(m.style,{
        position:'absolute',right:'16px',top:'12px',background:'#222',color:'#fff',padding:'6px 10px',borderRadius:'6px',opacity:'0.95',zIndex:1000001
      });
      panelEl.appendChild(m);
      setTimeout(()=>{m.style.transition='opacity 300ms';m.style.opacity='0';setTimeout(()=>m.remove(),300);},1500);
    }catch(e){/*ignore*/}
  }

  /* ================= 悬浮入口 ================= */

  const btn=document.createElement('div');
  btn.className='ig-float-btn';
  btn.textContent='⚙️';
  btn.onclick = () => {
    const p = panel(`
      <h3>备注设置</h3>
      <button id="openNotes">📒 备注名管理</button>
      <button id="openGroups">🗂️ 分组管理</button>
      <button id="openSync">🔄 导入 / 导出</button>
      <button id="closeSettings">关闭</button>
    `);
    const n = p.querySelector('#openNotes');
    const g = p.querySelector('#openGroups');
    const s = p.querySelector('#openSync');
    const c = p.querySelector('#closeSettings');
    n && (n.onclick = () => window.openNoteManager && window.openNoteManager());
    g && (g.onclick = () => window.openGroupManager && window.openGroupManager());
    s && (s.onclick = () => window.openSyncPanel && window.openSyncPanel());
    c && (c.onclick = () => p.remove());
  };
  document.body.appendChild(btn);

  /* ================= 备注名管理 ================= */

  window.openNoteManager = function () {
    const p = panel('<h3>备注名管理</h3>\n      <div class="ig-form">\n        <label>新分组 ID</label><div class="ig-control"><input id="note_newId" placeholder="支持中文/符号"></div>\n        <label>颜色</label><div class="ig-control"><input id="note_newColor" type="color" value="#336699"></div>\n      </div>\n      <div class="ig-color-options" id="note_newPalette"></div>\n      <br><button id="addNoteGroup">新建分组</button> <button id="saveNotes">保存</button> <button id="closeNotes">关闭</button><br><div class="ig-list"></div>');
    const list=p.querySelector('.ig-list');
    const groups=getGroups();

    GM_listValues().forEach(k=>{
      if(k===GROUP_KEY) return;
      const n=getNote(k);
      if(!n) return;

      const r=document.createElement('div');
      r.className='ig-row';
      r.dataset.user = k;
      r.innerHTML=`
        <div class="ig-user">@${k}</div>
        <input value="${n.text}">
        <div class="ig-group">
          <select></select><span class="ig-dot"></span>
        </div>
        <button>删</button>
      `;

      const input=r.querySelector('input');
      input.onchange=()=>{n.text=input.value;setNote(k,n);};// keep immediate feedback

      const sel=r.querySelector('select');
      Object.entries(groups).forEach(([id,g])=>{
        const o=document.createElement('option');
        o.value=id;o.textContent=g.name;
        sel.appendChild(o);
      });

      // add an option to create new group from the dropdown
      const newOpt=document.createElement('option');
      newOpt.value='__new__';newOpt.textContent='新建分组...';
      sel.appendChild(newOpt);

      sel.value=n.group;

      const dot=r.querySelector('.ig-dot');
      dot.style.background=groups[n.group].color;

      sel.onchange=()=>{
        if(sel.value==='__new__'){
          // use inline new-group form: mark pending user and focus newId
          p.dataset.pendingUser = k;
          p.querySelector('#note_newId').focus();
          sel.value = n.group;
          return;
        }

        n.group=sel.value;
        dot.style.background=groups[sel.value].color;
        setNote(k,n);
      };

      r.querySelector('button').onclick=()=>{
        if(confirm(`删除 @${k}?`)){GM_setValue(k,null);r.remove();}
      };

      list.appendChild(r);
    });

    // build recommended palette for note manager new-group form
    ['#336699','#2ECC71','#3498DB','#9B59B6','#E67E22','#E74C3C','#1ABC9C','#F1C40F','#7F8C8D','#34495E'].forEach(c=>{
      const d=document.createElement('div');d.className='ig-color-dot';d.style.background=c;d.onclick=()=>p.querySelector('#note_newColor').value=c;p.querySelector('#note_newPalette').appendChild(d);
    });

    p.querySelector('#addNoteGroup').onclick = () => {
      const id = p.querySelector('#note_newId').value.trim();
      if(!id){ showMsg(p,'请输入分组 ID'); return; }
      const all = getGroups();
      if(all[id]){ showMsg(p,'分组已存在'); return; }
      const name = id;
      const color = p.querySelector('#note_newColor').value || '#336699';
      all[id] = { name, color };
      saveGroups(all);
      // add to all selects and update groups obj
      document.querySelectorAll('select').forEach(s=>{
        const ex = Array.from(s.options).some(o=>o.value===id);
        if(!ex){
          const o=document.createElement('option');o.value=id;o.textContent=name;const newOpt = s.querySelector('option[value="__new__"]'); if(newOpt) s.insertBefore(o,newOpt); else s.appendChild(o);
        }
      });
      // if a select asked for new group, set it
      const pending = p.dataset.pendingUser;
      if(pending){
        const row = p.querySelector(`.ig-row[data-user="${pending}"]`);
        if(row){
          const sel = row.querySelector('select');
          sel.value = id;
          const dot = row.querySelector('.ig-dot');
          dot.style.background = color;
          const n = getNote(pending);
          if(n){ n.group = id; setNote(pending,n); }
        }
        delete p.dataset.pendingUser;
      }
      // clear form
      p.querySelector('#note_newId').value='';
      showMsg(p,'已创建分组');
    };

    p.querySelector('#saveNotes').onclick = () => {
      // re-save all rows to ensure persisted state
      list.querySelectorAll('.ig-row').forEach(r=>{
        const user = r.dataset.user;
        const input = r.querySelector('input');
        const sel = r.querySelector('select');
        const n = getNote(user) || { text:'', group:'default' };
        n.text = input.value;
        n.group = sel.value==='__new__'?n.group:sel.value;
        setNote(user,n);
      });
      saveGroups(getGroups());
      showMsg(p,'已保存');
    };
    p.querySelector('#closeNotes').onclick = ()=>p.remove();
  };

  /* ================= 分组管理 ================= */

  window.openGroupManager = function () {
    const p = panel('<h3>分组管理</h3><div class="ig-list"></div><br><div class="ig-form"><label>新分组 ID</label><div class="ig-control"><input id="newId" placeholder="支持中文/符号"></div><label>颜色</label><div class="ig-control"><input id="newColor" type="color" value="#336699"></div></div><div class="ig-color-options" id="group_newPalette"></div><br><button id="addGroup">新建分组</button> <button id="saveGroups">保存</button>');
    const list=p.querySelector('.ig-list');
    const groups=getGroups();

    Object.entries(groups).forEach(([id,g])=>{
      const r=document.createElement('div');
      r.className='ig-row';
      r.dataset.group = id;
      r.innerHTML=`
          <div class="ig-user">${id}</div>
          <input type="text" value="${g.name}">
          <div><input type="color" value="${g.color}"></div>
          ${id==='default'?'':'<button>删</button>'}
        `;

        const name=r.querySelector('input[type="text"]');
        const color=r.querySelector('input[type="color"]');
        name.onchange=()=>{g.name=name.value;};
      color.onchange=()=>{g.color=color.value;};

      const del=r.querySelector('button');
      del && (del.onclick=()=>{
        if(!confirm('删除分组？成员将转入默认'))return;
        GM_listValues().forEach(k=>{
          const n=getNote(k);
          if(n&&n.group===id){n.group='default';setNote(k,n);}        
        });
        delete groups[id];
        saveGroups(groups);
        p.remove();
      });

      list.appendChild(r);
    });

    // build recommended palette for new-group color picker (horizontal)
    ['#336699','#2ECC71','#3498DB','#9B59B6','#E67E22','#E74C3C','#1ABC9C','#F1C40F','#7F8C8D','#34495E'].forEach(c=>{
      const d=document.createElement('div');d.className='ig-color-dot';d.style.background=c;d.onclick=()=>p.querySelector('#newColor').value=c; p.querySelector('#group_newPalette').appendChild(d);
    });

    p.querySelector('#addGroup').onclick = () => {
      const id = p.querySelector('#newId').value.trim();
      if(!id){ showMsg(p,'请输入分组 ID'); return; }
      if(groups[id]){ showMsg(p,'分组已存在'); return; }
      const name = id;
      const color = p.querySelector('#newColor').value || '#336699';
      groups[id] = { name, color };
      saveGroups(groups);
      // append to list
      const r=document.createElement('div');
      r.className='ig-row';
      r.dataset.group = id;
      r.innerHTML=`
          <div class="ig-user">${id}</div>
          <input type="text" value="${name}">
          <div><input type="color" value="${color}"></div>
          <button>删</button>
        `;
      const nameI=r.querySelector('input[type="text"]');
      const colorI=r.querySelector('input[type="color"]');
      nameI.onchange=()=>{groups[id].name=nameI.value;};
      colorI.onchange=()=>{groups[id].color=colorI.value;};
      r.querySelector('button').onclick=()=>{ if(confirm('删除分组？')){ delete groups[id]; saveGroups(groups); r.remove(); } };
      list.appendChild(r);
      p.querySelector('#newId').value='';
      showMsg(p,'已创建分组');
    };

    p.querySelector('#saveGroups').onclick = () => {
      // collect edits
      list.querySelectorAll('.ig-row').forEach(r=>{
        const id = r.dataset.group;
        const name = r.querySelector('input[type="text"]').value;
        const color = r.querySelector('input[type="color"]').value;
        if(groups[id]){ groups[id].name = name; groups[id].color = color; }
      });
      saveGroups(groups);
      showMsg(p,'已保存分组设置');
    };

    p.querySelector('#closeGroups')?.remove?.();
    // add close button behavior
    const closeBtn = document.createElement('button'); closeBtn.textContent='关闭'; closeBtn.style.marginLeft='8px';
    p.querySelector('#saveGroups').after(closeBtn);
    closeBtn.onclick = ()=>p.remove();
  };

  /* ================= 同步 ================= */

  window.openSyncPanel = function () {
    const data={groups:getGroups(),notes:{}};
    GM_listValues().forEach(k=>{
      if(k!==GROUP_KEY){
        const n=getNote(k);
        if(n) data.notes[k]=n;
      }
    });
    prompt('导入 / 导出 JSON（覆盖）：',JSON.stringify(data,null,2));
  };

})();

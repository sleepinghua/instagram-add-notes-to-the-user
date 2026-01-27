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

    .ig-control input,
    .ig-control select,
    .ig-control button{
      width:100%;padding:6px;font-size:14px
    }

    .ig-color-row{display:flex;align-items:center;gap:8px}
    .ig-color-options{display:flex;gap:6px;flex-wrap:wrap}
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
      <br><button id="save">保存</button>
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
      if (!text) return alert('备注不能为空');
      const gid = newG.value.trim() || sel.value;
      const all = getGroups();
      if (!all[gid]) all[gid] = { name: gid, color: colorI.value };
      else all[gid].color = colorI.value;
      saveGroups(all);
      setNote(username, { text, group: gid });
      refresh();
      p.remove();
    };
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

  /* ================= 悬浮入口 ================= */

  const btn=document.createElement('div');
  btn.className='ig-float-btn';
  btn.textContent='⚙️';
  btn.onclick=()=>panel(`
    <h3>备注设置</h3>
    <button onclick="(${openNoteManager})()">📒 备注名管理</button>
    <button onclick="(${openGroupManager})()">🗂️ 分组管理</button>
    <button onclick="(${openSyncPanel})()">🔄 导入 / 导出</button>
  `);
  document.body.appendChild(btn);

  /* ================= 备注名管理 ================= */

  window.openNoteManager = function () {
    const p = panel('<h3>备注名管理</h3><div class="ig-list"></div>');
    const list=p.querySelector('.ig-list');
    const groups=getGroups();

    GM_listValues().forEach(k=>{
      if(k===GROUP_KEY) return;
      const n=getNote(k);
      if(!n) return;

      const r=document.createElement('div');
      r.className='ig-row';
      r.innerHTML=`
        <div class="ig-user">@${k}</div>
        <input value="${n.text}">
        <div class="ig-group">
          <select></select><span class="ig-dot"></span>
        </div>
        <button>删</button>
      `;

      const input=r.querySelector('input');
      input.onchange=()=>{n.text=input.value;setNote(k,n);};

      const sel=r.querySelector('select');
      Object.entries(groups).forEach(([id,g])=>{
        const o=document.createElement('option');
        o.value=id;o.textContent=g.name;
        sel.appendChild(o);
      });
      sel.value=n.group;

      const dot=r.querySelector('.ig-dot');
      dot.style.background=groups[n.group].color;

      sel.onchange=()=>{
        n.group=sel.value;
        dot.style.background=groups[sel.value].color;
        setNote(k,n);
      };

      r.querySelector('button').onclick=()=>{
        if(confirm(`删除 @${k}?`)){GM_setValue(k,null);r.remove();}
      };

      list.appendChild(r);
    });
  };

  /* ================= 分组管理 ================= */

  window.openGroupManager = function () {
    const p = panel('<h3>分组管理</h3><div class="ig-list"></div>');
    const list=p.querySelector('.ig-list');
    const groups=getGroups();

    Object.entries(groups).forEach(([id,g])=>{
      const r=document.createElement('div');
      r.className='ig-row';
      r.innerHTML=`
        <div class="ig-user">${id}</div>
        <input value="${g.name}">
        <div><input type="color" value="${g.color}"></div>
        ${id==='default'?'':'<button>删</button>'}
      `;

      const name=r.querySelector('input[type=text]');
      const color=r.querySelector('input[type=color]');
      name.onchange=()=>{g.name=name.value;saveGroups(groups);};
      color.onchange=()=>{g.color=color.value;saveGroups(groups);};

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

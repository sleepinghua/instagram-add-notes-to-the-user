// ==UserScript==
// @name         Instagram 用户备注（分组 + 颜色自定义 + 新建分组）
// @namespace    ig-note-full
// @version      1.6.0
// @description  Instagram 备注：点击按钮弹出面板输入备注，选择或新建分组，自定义颜色，10个备选颜色
// @match        https://www.instagram.com/*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_listValues
// @grant        GM_registerMenuCommand
// @grant        GM_addStyle
// ==/UserScript==

(function () {
  'use strict';

  const GROUP_KEY = '__ig_note_groups__';

  function getGroups() {
    return GM_getValue(GROUP_KEY, {
      default: { name: '默认', color: '#336699' }
    });
  }

  function saveGroups(groups) {
    GM_setValue(GROUP_KEY, groups);
  }

  GM_addStyle(`
    .ig-note-btn { margin-left:6px; cursor:pointer; font-size:14px; opacity:0.6; user-select:none; }
    .ig-note-btn:hover { opacity:1; }
    .ig-note-text { margin-left:6px; padding:2px 6px; border-radius:6px; color:#fff; font-size:12px; white-space:nowrap; }
    .ig-note-panel { position:fixed; top:10%; left:50%; transform:translateX(-50%); background:#fff; color:#000; border-radius:8px; box-shadow:0 10px 30px rgba(0,0,0,.3); padding:16px; z-index:999999; width:480px; max-height:70%; overflow:auto; font-size:14px; }
    .ig-note-panel input, .ig-note-panel select, .ig-note-panel button { width:100%; margin-bottom:8px; padding:6px; }
    .ig-note-panel input[type="color"] { width:40px; height:30px; border:none; cursor:pointer; display:inline-block; margin-right:5px; }
    .ig-note-close { float:right; cursor:pointer; font-weight:bold; }
    .ig-note-color-options { display:flex; flex-wrap:wrap; margin-top:5px; gap:4px; }
    .ig-note-color-option { width:30px; height:30px; border-radius:50%; cursor:pointer; border:1px solid #999; }
  `);

  function getUsernameFromAnchor(a) {
    if (!a?.href) return null;
    const m = a.href.match(/^https:\/\/www\.instagram\.com\/([a-zA-Z0-9._]+)\/$/);
    return m ? m[1] : null;
  }

  function getNote(username) {
    const raw = GM_getValue(username);
    if (!raw) return null;
    if (typeof raw === 'string') return { text: raw, group: 'default' };
    return raw;
  }

  function setNote(username, obj) {
    GM_setValue(username, obj);
  }

  function createBtn(username, refreshFn) {
    const btn = document.createElement('span');
    btn.textContent = '📝';
    btn.className = 'ig-note-btn';
    btn.onclick = e => {
      e.preventDefault();
      e.stopPropagation();
      const old = getNote(username);
      const oldVal = old ? `${old.text} | ${old.group}` : '';
      showNoteInputPanel(username, oldVal, refreshFn);
    };
    return btn;
  }

  function createNote(note) {
    const groups = getGroups();
    const group = groups[note.group] || groups.default;
    const span = document.createElement('span');
    span.className = 'ig-note-text';
    span.textContent = note.text;
    span.style.backgroundColor = group.color;
    span.title = group.name;
    return span;
  }

  function showNoteInputPanel(username, oldVal, refreshFn) {
    const groups = getGroups();
    const panel = document.createElement('div');
    panel.className = 'ig-note-panel';

    panel.innerHTML = `
      <span class="ig-note-close">✖</span>
      <h3>设置 @${username} 备注</h3>
      <input id="noteText" placeholder="输入备注内容" value="${oldVal.split(' | ')[0] || ''}">
      <select id="groupSelect"></select>
      <input id="newGroupName" placeholder="新建分组名称（可选）" />
      <input id="groupColor" type="color" value="${groups[oldVal.split(' | ')[1] || 'default']?.color || '#336699'}">
      <div class="ig-note-color-options"></div>
      <button id="saveBtn">保存备注</button>
    `;

    panel.querySelector('.ig-note-close').onclick = () => panel.remove();

    const groupSelect = panel.querySelector('#groupSelect');
    const newGroupNameInput = panel.querySelector('#newGroupName');
    const colorInput = panel.querySelector('#groupColor');
    const colorOptionsDiv = panel.querySelector('.ig-note-color-options');

    function populateGroupSelect() {
      groupSelect.innerHTML = '';
      Object.keys(groups).forEach(gid => {
        const opt = document.createElement('option');
        opt.value = gid;
        opt.textContent = groups[gid].name;
        groupSelect.appendChild(opt);
      });
    }

    // 备选颜色
    const presetColors = ['#FF5733','#FFBF00','#33FF57','#57A0FF','#8E44AD','#E67E22','#1ABC9C','#D35400','#C0392B','#2ECC71'];
    presetColors.forEach(c => {
      const div = document.createElement('div');
      div.className = 'ig-note-color-option';
      div.style.backgroundColor = c;
      div.dataset.color = c;
      div.onclick = () => colorInput.value = c;
      colorOptionsDiv.appendChild(div);
    });

    populateGroupSelect();

    panel.querySelector('#saveBtn').onclick = () => {
      const noteText = panel.querySelector('#noteText').value.trim();
      let groupId = newGroupNameInput.value.trim();
      const groupColor = colorInput.value.trim();
      if (!noteText) { alert('备注不能为空'); return; }
      if (!groupId) groupId = groupSelect.value;
      const groupsNow = getGroups();
      if (!groupsNow[groupId]) { groupsNow[groupId] = { name: groupId, color: groupColor }; }
      else { groupsNow[groupId].color = groupColor; }
      saveGroups(groupsNow);
      setNote(username, { text: noteText, group: groupId });
      refreshFn();
      panel.remove();
    };

    document.body.appendChild(panel);
  }

  function applyAnchor(a) {
    if (a.dataset.igNoteDone) return;
    const username = getUsernameFromAnchor(a);
    if (!username) return;
    a.dataset.igNoteDone = '1';
    const wrap = document.createElement('span');
    wrap.dataset.user = username;
    const render = () => {
      wrap.innerHTML = '';
      wrap.appendChild(createBtn(username, render));
      const note = getNote(username);
      if (note) wrap.appendChild(createNote(note));
    };
    render();
    a.after(wrap);
  }

  function applyProfilePage() {
    const username = location.pathname.split('/')[1];
    if (!username) return;
    const h2 = document.querySelector('h2');
    if (!h2 || h2.dataset.igNoteDone) return;
    h2.dataset.igNoteDone = '1';
    const box = document.createElement('div');
    box.style.marginTop = '6px';
    const render = () => {
      box.innerHTML = '';
      box.appendChild(createBtn(username, render));
      const note = getNote(username);
      if (note) box.appendChild(createNote(note));
    };
    render();
    h2.after(box);
  }

  const observer = new MutationObserver(() => {
    document.querySelectorAll('a[href^="/"]').forEach(applyAnchor);
    applyProfilePage();
  });
  observer.observe(document.body, { childList:true, subtree:true });
})();

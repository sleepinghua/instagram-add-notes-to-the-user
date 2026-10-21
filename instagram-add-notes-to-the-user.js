// ==UserScript==
// @name                Instagram - 为用户添加备注(别名/标签) 修复版
// @name:zh-CN          Instagram - 为用户添加备注(别名/标签) 修复版
// @name:en             Instagram - Add notes to the user (Fixed)
// @namespace           https://greasyfork.org/zh-CN/scripts/601215
// @homepageURL         https://github.com/sleepinghua/instagram-add-notes-to-the-user
// @icon                data:image/svg+xml;base64,PHN2ZyByb2xlPSJpbWciIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgd2lkdGg9IjI0cHgiIGhlaWdodD0iMjRweCIgdmlld0JveD0iMCAwIDI0IDI0IiBhcmlhLWxhYmVsbGVkYnk9Im5ld0ljb25UaXRsZSIgc3Ryb2tlPSJyZ2JhKDI5LDE2MSwyNDIsMS4wMCkiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InNxdWFyZSIgc3Ryb2tlLWxpbmVqb2luPSJtaXRlciIgZmlsbD0ibm9uZSIgY29sb3I9InJnYmEoMjksMTYxLDI0MiwxLjAwKSI+IDx0aXRsZSBpZD0ibmV3SWNvblRpdGxlIj5OZXc8L3RpdGxlPiA8cGF0aCBkPSJNMTkgMTRWMjJIMi45OTk5N1Y0SDEzIi8+IDxwYXRoIGQ9Ik0xNy40NjA4IDQuMDM5MjFDMTguMjQxOCAzLjI1ODE3IDE5LjUwODIgMy4yNTgxNiAyMC4yODkyIDQuMDM5MjFMMjAuOTYwOCA0LjcxMDc5QzIxLjc0MTggNS40OTE4NCAyMS43NDE4IDYuNzU4MTcgMjAuOTYwOCA3LjUzOTIxTDExLjU4NTggMTYuOTE0MkMxMS4yMTA3IDE3LjI4OTMgMTAuNzAyIDE3LjUgMTAuMTcxNiAxNy41TDcuNSAxNy41TDcuNSAxNC44Mjg0QzcuNSAxNC4yOTggNy43MTA3MSAxMy43ODkzIDguMDg1NzkgMTMuNDE0MkwxNy40NjA4IDQuMDM5MjFaIi8+IDxwYXRoIGQ9Ik0xNi4yNSA1LjI1TDE5Ljc1IDguNzUiLz4gPC9zdmc+
// @version             6.3.4
// @description         为 Instagram 用户添加备注(别名/标签)，支持分组、自定义颜色与 WebDAV 同步。修复 2026 年新版页面结构导致的整体失效，可切换「替换用户名 / 用户名 + 胶囊」。
// @description:zh-CN   为 Instagram 用户添加备注(别名/标签)，支持分组、自定义颜色与 WebDAV 同步。修复 2026 年新版页面结构导致的失效，可切换「替换用户名 / 用户名 + 胶囊」两种呈现。
// @description:en      Add notes (aliases/tags) for Instagram users, with groups, custom colors and WebDAV sync. Fixed for the 2026 Instagram DOM; switchable between "replace username" and "username + pill".
// @license             GNU General Public License v3.0 or later
// @author              pana, sleepinghua
// @compatible          chrome
// @compatible          firefox
// @match               *://*.instagram.com/*
// @require             https://gcore.jsdelivr.net/gh/LightAPIs/greasy-fork-library@da0437e6a856e05158df61225f2b9ea9943ad9ef/Note_Obj.js
// @connect             *
// @noframes
// @grant               GM_info
// @grant               GM_getValue
// @grant               GM_setValue
// @grant               GM_deleteValue
// @grant               GM_listValues
// @grant               GM_openInTab
// @grant               GM_xmlhttpRequest
// @grant               GM_setClipboard
// @grant               GM_addStyle
// @grant               GM_registerMenuCommand
// @grant               GM_unregisterMenuCommand
// @grant               GM_addValueChangeListener
// @grant               GM_removeValueChangeListener
// ==/UserScript==

(function() {
  "use strict";
  if (typeof Note_Obj === "undefined") {
    console.error("[IG-Note] Note_Obj 依赖未加载，脚本无法运行。\n" + "请检查能否打开：https://gcore.jsdelivr.net/gh/LightAPIs/greasy-fork-library@da0437e6a856e05158df61225f2b9ea9943ad9ef/Note_Obj.js\n" + "若打不开可换成 https://fastly.jsdelivr.net/gh/LightAPIs/greasy-fork-library@da0437e6a856e05158df61225f2b9ea9943ad9ef/Note_Obj.js");
    return;
  }
  const UPDATED = "2026-10-20";
  const IG_VERSION = "6.3.4";
  const INS_ICON = {
    NOTE_BLACK: "url(data:image/svg+xml;base64,PHN2ZyByb2xlPSJpbWciIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgd2lkdGg9IjI0cHgiIGhlaWdodD0iMjRweCIgdmlld0JveD0iMCAwIDI0IDI0IiBhcmlhLWxhYmVsbGVkYnk9Im5ld0ljb25UaXRsZSIgc3Ryb2tlPSJyZ2IoMzgsIDM4LCAzOCkiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InNxdWFyZSIgc3Ryb2tlLWxpbmVqb2luPSJtaXRlciIgZmlsbD0ibm9uZSIgY29sb3I9InJnYigzOCwgMzgsIDM4KSI+IDx0aXRsZSBpZD0ibmV3SWNvblRpdGxlIj5OZXc8L3RpdGxlPiA8cGF0aCBkPSJNMTkgMTRWMjJIMi45OTk5N1Y0SDEzIi8+IDxwYXRoIGQ9Ik0xNy40NjA4IDQuMDM5MjFDMTguMjQxOCAzLjI1ODE3IDE5LjUwODIgMy4yNTgxNiAyMC4yODkyIDQuMDM5MjFMMjAuOTYwOCA0LjcxMDc5QzIxLjc0MTggNS40OTE4NCAyMS43NDE4IDYuNzU4MTcgMjAuOTYwOCA3LjUzOTIxTDExLjU4NTggMTYuOTE0MkMxMS4yMTA3IDE3LjI4OTMgMTAuNzAyIDE3LjUgMTAuMTcxNiAxNy41TDcuNSAxNy41TDcuNSAxNC44Mjg0QzcuNSAxNC4yOTggNy43MTA3MSAxMy43ODkzIDguMDg1NzkgMTMuNDE0MkwxNy40NjA4IDQuMDM5MjFaIi8+IDxwYXRoIGQ9Ik0xNi4yNSA1LjI1TDE5Ljc1IDguNzUiLz4gPC9zdmc+)"
  };
  const HAS_HAS = (() => {
    try {
      document.querySelector(":has(*)");
      return true;
    } catch (e) {
      return false;
    }
  })();
  const selector = {
    homepage: {
      article: "article",
      header: "header",
      section: "section"
    },
    homepageStories: {
      idShell: HAS_HAS ? "main li:has(canvas)" : ""
    },
    userPage: {
      header: "main header",
      id: "h2",
      infoAt: "header a[href]"
    },
    watchList: {
      item: '[role="dialog"] [role="listitem"], [role="dialog"] [role="row"]'
    },
    stories: {
      frame: "section"
    },
    dialog: {
      frame: '[role="dialog"] article'
    },
    sidebar: {
      recommend: "aside a[href]"
    }
  };
  const nameSet = {
    backgroundBox: "note-obj-ins-background-box",
    userpageTag: "note-obj-ins-userpage-tag",
    fontBold: "note-obj-ins-font-bold",
    addBtn: "note-obj-ins-add-btn",
    homepageBtn: "note-obj-ins-homepage-btn",
    userpageBtn: "note-obj-ins-userpage-btn"
  };
  const INS_STYLE = `\n    .${nameSet.backgroundBox} {\n      display: inline-block;\n      vertical-align: middle;\n      align-items: center;\n      white-space: nowrap;\n      \n      font-size: 13px;\n      font-weight: 400;\n      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;\n      line-height: 1.6;\n      padding: 1px 8px;\n      \n      max-width: 12em;\n      overflow: hidden;\n      text-overflow: ellipsis;\n      border-radius: 50px;\n      background-color: #336699;\n      color: #fff;\n    }\n    .${nameSet.addBtn} {\n      \n      display: inline-block;\n      vertical-align: middle;\n      flex: 0 0 auto;\n      \n      border-radius: 4px;\n      background-color: rgba(255, 255, 255, .82);\n      box-shadow: 0 0 0 1px rgba(0, 0, 0, .10);\n      background-image: ${INS_ICON.NOTE_BLACK};\n      \n      background-size: 18px;\n      background-repeat: no-repeat;\n      background-position: center;\n      margin-left: 5px;\n      cursor: pointer;\n      width: 18px;\n      height: 18px;\n      min-width: 18px;\n      min-height: 18px;\n    }\n    .${nameSet.homepageBtn} {\n      margin: 6px !important;\n    }\n    .${nameSet.homepageBtn}:hover {\n      opacity: 0.5;\n    }\n    .${nameSet.userpageBtn} {\n      \n      align-self: center;\n      vertical-align: middle;\n      position: relative;\n      top: -1px;\n      margin: 0 0 0 5px;\n    }\n    .ig-note-toast {\n      position: fixed; left: 50%; transform: translateX(-50%); bottom: 24px;\n      z-index: 2147483647; background: #262626; color: #fff; padding: 8px 16px;\n      border-radius: 20px; font: 13px/1.4 system-ui, -apple-system, "Segoe UI", sans-serif;\n      box-shadow: 0 4px 18px rgba(0, 0, 0, .3);\n    }\n    \n    .ig-note-profile-text {\n      font-size: 14px;\n      font-weight: 400;\n    }\n    \n    .ig-note-profile-pill {\n      \n      margin-left: 6px;\n    }\n    \n    .note-obj-ins-clip {\n      display: inline-block;\n      vertical-align: middle;\n      max-width: 12em;\n      overflow: hidden;\n      text-overflow: ellipsis;\n      white-space: nowrap;\n    }\n    .note-obj-settings-frame-card label {\n      color: #2f2f2f;\n    }\n    .note-obj-interface-dark .note-obj-settings-frame-card label {\n      color: #fff;\n    }\n    .note-obj-group-frame-tbody input,\n    .note-obj-webdav-frame-form-item input {\n      color: #000;\n    }`;
  const noteObj = new Note_Obj({
    id: "myInstagramNote",
    script: {
      author: {
        name: "pana",
        homepage: "https://greasyfork.org/zh-CN/users/193133-pana"
      },
      url: "https://greasyfork.org/scripts/387871",
      updated: UPDATED
    },
    style: INS_STYLE,
    primaryColor: "#336699",
    settings: {
      replaceHomepageID: {
        type: "checkbox",
        lang: {
          en: "Allow replacing user IDs on the home page",
          zhHans: "允许替换首页上的用户 ID",
          zhHant: "允許替換首頁上的使用者 ID"
        },
        default: true,
        event: instagramHomepageEvent
      }
    },
    changeEvent: instagramChangeEvent
  });
  const RESERVED_PATH = new Set([ "p", "reel", "reels", "tv", "explore", "stories", "direct", "accounts", "about", "legal", "api", "developer", "directory", "privacy", "terms", "challenge", "emails", "session", "settings", "your_activity", "help", "web", "graphql", "ajax", "oauth", "login", "logout", "download" ]);
  const USER_RE = /^[A-Za-z0-9._]{1,30}$/;
  function isUserId(id) {
    return typeof id === "string" && USER_RE.test(id) && !RESERVED_PATH.has(id.toLowerCase());
  }
  const hrefIdCache = new Map;
  function userIdFromAnchor(a) {
    if (!a || !a.getAttribute) return "";
    const href = a.getAttribute("href");
    if (!href || href.charAt(0) === "#" || /^javascript:/i.test(href)) return "";
    if (hrefIdCache.has(href)) return hrefIdCache.get(href);
    let id = "";
    let url;
    try {
      url = new URL(href, location.origin);
    } catch (e) {
      url = null;
    }
    if (url && url.hostname.replace(/^www\./, "") === location.hostname.replace(/^www\./, "")) {
      const seg = url.pathname.split("/").filter(Boolean);
      if (seg.length === 1) {
        let raw;
        try {
          raw = decodeURIComponent(seg[0]);
        } catch (e) {
          raw = "";
        }
        if (isUserId(raw)) id = raw;
      }
    }
    if (hrefIdCache.size > 2e3) hrefIdCache.clear();
    hrefIdCache.set(href, id);
    return id;
  }
  function hasVisual(a) {
    return !!(a.querySelector && a.querySelector("img, canvas, video, picture"));
  }
  function hasIcon(a) {
    return !!(a.querySelector && a.querySelector("svg, img, canvas, video, picture"));
  }
  function pickUserAnchor(root) {
    if (!root) return null;
    let fallback = null;
    for (const a of root.querySelectorAll("a[href]")) {
      if (!userIdFromAnchor(a)) continue;
      if (!fallback) fallback = a;
      if (hasVisual(a)) continue;
      if ((a.textContent || "").trim()) return a;
    }
    return fallback;
  }
  function isMention(a) {
    return /^@/.test((a.textContent || "").trim());
  }
  function headerOf(root) {
    return root ? root.querySelector(selector.homepage.header) : null;
  }
  function pickHeaderAction(header) {
    if (!header) return null;
    const btns = header.querySelectorAll('button, [role="button"]');
    return btns.length ? btns[btns.length - 1] : null;
  }
  function usernameFromNode(root) {
    if (!root) return "";
    const img = root.querySelector("img[alt]");
    if (img) {
      const alt = (img.getAttribute("alt") || "").replace(/[\u2019']s profile picture$/i, "").replace(/的头像$/, "").replace(/profile picture$/i, "").trim();
      if (isUserId(alt)) return alt;
    }
    for (const a of root.querySelectorAll("a[href]")) {
      const id = userIdFromAnchor(a);
      if (id) return id;
    }
    const txt = (root.textContent || "").trim();
    return isUserId(txt) ? txt : "";
  }
  function resolveDisplayName(root, username) {
    if (!root) return "";
    for (const el of root.querySelectorAll('[dir="auto"]')) {
      if (el.closest('ul, button, [role="button"]')) continue;
      if (el.querySelector('[dir="auto"]')) continue;
      const t = (el.textContent || "").trim();
      if (!t || t === username) continue;
      if (t.length > 60) continue;
      if (/^[\d.,\s]+$/.test(t)) continue;
      return t;
    }
    return "";
  }
  const MODE_KEY = "igNote.replaceID";
  function readMode() {
    let v = null;
    try {
      v = GM_getValue(MODE_KEY, null);
    } catch (e) {
      v = null;
    }
    if (typeof v === "boolean") return v;
    try {
      return noteObj.getOtherConfig().replaceHomepageID === true;
    } catch (e) {
      return true;
    }
  }
  function writeMode(v) {
    try {
      GM_setValue(MODE_KEY, v);
    } catch (e) {
      console.warn("[IG-Note] 保存开关失败", e);
    }
  }
  function toast(msg) {
    try {
      const t = document.createElement("div");
      t.className = "ig-note-toast";
      t.textContent = msg;
      document.body.appendChild(t);
      window.setTimeout(() => t.remove(), 2600);
    } catch (e) {}
  }
  function findMyPill(anchor) {
    const n = anchor.nextElementSibling;
    return n && n.nodeType === 1 && n.hasAttribute("data-ig-note-feed") ? n : null;
  }
  function ensureMyPill(anchor, id, text) {
    if (!anchor.parentElement) return;
    let pill = findMyPill(anchor);
    if (!pill) {
      pill = document.createElement("span");
      pill.className = nameSet.backgroundBox;
      pill.setAttribute("data-ig-note-feed", "1");
      anchor.insertAdjacentElement("afterend", pill);
    }
    if (pill.textContent !== text) pill.textContent = text;
    let color = "";
    try {
      color = noteObj.getPrimaryColor(id) || "";
    } catch (e) {
      color = "";
    }
    if (color) pill.style.backgroundColor = color;
    if (pill.title !== text) pill.title = text;
  }
  function removeMyPill(anchor) {
    let n = anchor.nextElementSibling;
    while (n && n.nodeType === 1 && n.hasAttribute("data-ig-note-feed")) {
      const next = n.nextElementSibling;
      n.remove();
      n = next;
    }
  }
  function resetAnchorText(anchor, id) {
    if (anchor.dataset.igNoteApplied !== "1") return;
    if (hasIcon(anchor)) {
      delete anchor.dataset.igNoteApplied;
      delete anchor.dataset.igNoteUser;
      anchor.classList.remove("note-obj-ins-clip");
      return;
    }
    anchor.textContent = id;
    delete anchor.dataset.igNoteApplied;
    delete anchor.dataset.igNoteUser;
    anchor.classList.remove("note-obj-ins-clip");
    anchor.removeAttribute("title");
  }
  function renderTextNote(id, anchor, opts) {
    if (!anchor) return;
    const pillMode = !!(opts && opts.add);
    const tag = noteObj.getUserTag(id);
    if (!tag) {
      resetAnchorText(anchor, id);
      removeMyPill(anchor);
      return;
    }
    if (pillMode) {
      if (!hasIcon(anchor) && (anchor.textContent || "").trim() !== id) {
        anchor.textContent = id;
      }
      delete anchor.dataset.igNoteApplied;
      delete anchor.dataset.igNoteUser;
      anchor.classList.remove("note-obj-ins-clip");
      ensureMyPill(anchor, id, tag);
      return;
    }
    removeMyPill(anchor);
    const raw = (anchor.textContent || "").trim();
    const applied = anchor.dataset.igNoteApplied === "1";
    const isNameLink = applied || raw === id || opts && opts.prefix && raw === opts.prefix + id;
    if (!isNameLink) {
      if (anchor.title !== tag) anchor.title = tag;
      return;
    }
    if (hasIcon(anchor)) {
      ensureMyPill(anchor, id, tag);
      return;
    }
    const want = opts && opts.prefix ? opts.prefix + tag : tag;
    if (!applied) {
      anchor.dataset.igNoteApplied = "1";
      anchor.dataset.igNoteUser = id;
    }
    if ((anchor.textContent || "") !== want) anchor.textContent = want;
    anchor.classList.add("note-obj-ins-clip");
    if (anchor.title !== tag) anchor.title = tag;
  }
  function safe(name, fn) {
    try {
      fn();
    } catch (e) {
      console.warn("[IG-Note] " + name + " 执行失败：", e);
    }
  }
  function mountArticleBtn(root, userId) {
    const header = headerOf(root);
    const scope = header || root;
    if (!scope) return;
    if (scope.querySelector("." + nameSet.homepageBtn)) return;
    const btn = noteObj.createNoteBtn(userId, undefined, [ nameSet.addBtn, nameSet.homepageBtn ], "span");
    const action = pickHeaderAction(header);
    if (action) {
      action.insertAdjacentElement("beforebegin", btn);
      return;
    }
    const authorAnchor = pickUserAnchor(scope);
    if (authorAnchor) authorAnchor.insertAdjacentElement("afterend", btn); else scope.insertAdjacentElement("afterbegin", btn);
  }
  function findUsernameLeaf(root, userId) {
    if (!root) return null;
    const nodes = root.querySelectorAll("span, div, a, h1, h2");
    for (const el of nodes) {
      if (el.children.length) continue;
      if (el.closest('nav, [role="dialog"]')) continue;
      if ((el.textContent || "").trim() !== userId) continue;
      return el;
    }
    return null;
  }
  function mountProfileBtn(leaf, userId) {
    if (!leaf || !leaf.parentElement) return;
    if (leaf.parentElement.querySelector("." + nameSet.userpageBtn)) return;
    const host = leaf.closest("header") || leaf.parentElement;
    const userNameText = resolveDisplayName(host, userId);
    const btn = noteObj.createNoteBtn(userId, userNameText, [ nameSet.addBtn, nameSet.userpageBtn ]);
    leaf.insertAdjacentElement("afterend", btn);
  }
  function homepageNote(ele, changeId) {
    const scope = headerOf(ele) || ele;
    const user = pickUserAnchor(scope);
    if (!user) return;
    const eleId = userIdFromAnchor(user);
    if (!eleId) return;
    mountArticleBtn(ele, eleId);
    if (changeId && changeId !== eleId) return;
    const replaceHomepageID = readMode();
    renderTextNote(eleId, user, replaceHomepageID ? undefined : {
      add: "span",
      className: [ nameSet.backgroundBox ]
    });
  }
  function articleCommentAnchors(article) {
    const list = [];
    for (const a of article.querySelectorAll("section a[href]")) {
      if (hasVisual(a)) continue;
      if (!userIdFromAnchor(a)) continue;
      list.push(a);
    }
    return list;
  }
  function homepageCommentNote(ele, changeId) {
    const authorAnchor = pickUserAnchor(headerOf(ele) || ele);
    for (const comment of articleCommentAnchors(ele)) {
      if (authorAnchor && comment === authorAnchor) continue;
      const commentId = userIdFromAnchor(comment);
      if (changeId && changeId !== commentId) continue;
      if (isMention(comment)) {
        renderTextNote(commentId, comment, {
          prefix: "@",
          title: true
        });
        continue;
      }
      renderTextNote(commentId, comment);
    }
  }
  function homepageStoriesNote(ele, changeId) {
    const homepageStoriesId = usernameFromNode(ele);
    if (!homepageStoriesId) return;
    if (changeId && changeId !== homepageStoriesId) return;
    ele.title = noteObj.getUserTag(homepageStoriesId);
  }
  function anchorElementNote(ele, changeId) {
    if (ele.closest("h1, h2, nav, button")) return;
    const itemId = userIdFromAnchor(ele);
    if (!itemId) return;
    if (changeId && changeId !== itemId) return;
    renderTextNote(itemId, ele);
  }
  function renderProfileNote(leaf, userPageId) {
    if (!leaf) return;
    clearProfileTags();
    const host = leaf.closest("header") || leaf.parentElement || document.body;
    let pill = host.querySelector('[data-ig-note-profile="1"]') || document.querySelector('[data-ig-note-profile="1"]');
    const replace = readMode();
    if (replace) {
      if (pill) pill.remove();
      leaf.classList.add("ig-note-profile-text");
      renderTextNote(userPageId, leaf, undefined);
      return;
    }
    leaf.classList.remove("ig-note-profile-text");
    resetAnchorText(leaf, userPageId);
    const tagText = noteObj.getUserTag(userPageId);
    if (!tagText) {
      if (pill) pill.remove();
      return;
    }
    if (!pill) {
      pill = document.createElement("span");
      pill.className = nameSet.backgroundBox + " ig-note-profile-pill";
      pill.dataset.igNoteProfile = "1";
      leaf.insertAdjacentElement("afterend", pill);
    }
    if (pill.textContent !== tagText) pill.textContent = tagText;
    let color = "";
    try {
      color = noteObj.getPrimaryColor(userPageId) || "";
    } catch (e) {
      color = "";
    }
    if (color) pill.style.backgroundColor = color;
    pill.title = tagText;
  }
  function clearProfileTags() {
    document.querySelectorAll("." + nameSet.userpageTag).forEach(n => n.remove());
  }
  let profileTries = 0;
  function sweepProfile() {
    const username = profileUserFromPath();
    if (!username) return;
    handleProfileHeader(document.querySelector(selector.userPage.header));
  }
  function userPageCommonNote(root, userPageId, changeId) {
    for (const a of root.querySelectorAll(selector.userPage.infoAt)) {
      if (a.closest("h1, h2, ul")) continue;
      if (hasVisual(a) || isMention(a)) continue;
      const commonUserId = userIdFromAnchor(a);
      if (!commonUserId) continue;
      if (changeId && changeId !== commonUserId) continue;
      noteObj.handler(commonUserId, a, undefined, {
        title: true,
        notModify: true
      });
    }
  }
  function userPageInfoAtNote(root, changeId) {
    for (const a of root.querySelectorAll(selector.userPage.infoAt)) {
      if (a.closest("h1, h2, ul")) continue;
      if (hasVisual(a) || !isMention(a)) continue;
      const infoAtUserId = userIdFromAnchor(a);
      if (!infoAtUserId) continue;
      if (changeId && changeId !== infoAtUserId) continue;
      renderTextNote(infoAtUserId, a, {
        prefix: "@",
        title: true
      });
    }
  }
  function storiesNote(ele, changeId) {
    const header = headerOf(ele);
    const item = header ? pickUserAnchor(header) : null;
    if (item) {
      const itemId = userIdFromAnchor(item);
      if (itemId && (!changeId || changeId === itemId)) {
        noteObj.handler(itemId, item);
      }
    }
    for (const el of ele.querySelectorAll('header [dir="auto"]')) {
      if (el.querySelector('[dir="auto"]')) continue;
      const t = (el.textContent || "").trim();
      if (!isUserId(t)) continue;
      if (changeId && changeId !== t) continue;
      const tag = noteObj.getUserTag(t);
      if (tag) el.title = tag;
    }
  }
  function watchListItemNote(ele, changeId) {
    const item = pickUserAnchor(ele);
    if (!item) return;
    const itemId = userIdFromAnchor(item);
    if (!itemId) return;
    if (changeId && changeId !== itemId) return;
    renderTextNote(itemId, item);
  }
  function profileUserFromPath() {
    const seg = location.pathname.split("/").filter(Boolean);
    if (seg.length !== 1) return "";
    return isUserId(seg[0]) ? seg[0] : "";
  }
  function handleProfileHeader(header, changeId) {
    const main = document.querySelector("main") || document.body;
    let userPageId = profileUserFromPath();
    if (!isUserId(userPageId)) {
      const h2 = (header || main).querySelector(selector.userPage.id);
      userPageId = (h2 && h2.textContent || "").trim();
    }
    if (!isUserId(userPageId)) return;
    let leaf = document.querySelector('[data-ig-note-profile-leaf="1"]');
    if (!leaf || !main.contains(leaf)) leaf = findUsernameLeaf(main, userPageId);
    if (!leaf) return;
    leaf.dataset.igNoteProfileLeaf = "1";
    mountProfileBtn(leaf, userPageId);
    renderProfileNote(leaf, userPageId);
    if (header) {
      userPageCommonNote(header, userPageId, changeId);
      userPageInfoAtNote(header, changeId);
    }
  }
  function handleArticle(article, changeId) {
    safe("article-note", () => homepageNote(article, changeId));
    safe("article-comments", () => homepageCommentNote(article, changeId));
  }
  function refreshArticle(article, btn) {
    if (btn && !zeroSizeWarned.has(btn)) {
      const r = btn.getBoundingClientRect();
      if (r.width === 0 && r.height === 0) {
        zeroSizeWarned.add(btn);
        console.warn("[IG-Note] 按钮存在但尺寸为 0，可能被页面样式覆盖。display =", window.getComputedStyle(btn).display, "｜ class =", btn.className);
      }
    }
    const author = pickUserAnchor(headerOf(article) || article);
    if (author) {
      const id = userIdFromAnchor(author);
      if (id && (noteObj.judgeUsers(id) || author.dataset.igNoteApplied === "1")) {
        safe("refresh-author", () => homepageNote(article));
      }
    }
    for (const a of article.querySelectorAll(selector.homepage.section + " a[href]")) {
      if (hasIcon(a)) continue;
      if (author && a === author) continue;
      const id = userIdFromAnchor(a);
      if (!id) continue;
      if (!noteObj.judgeUsers(id) && a.dataset.igNoteApplied !== "1") continue;
      if (isMention(a)) renderTextNote(id, a, {
        prefix: "@",
        title: true
      }); else renderTextNote(id, a);
    }
  }
  function scanAll(changeId) {
    for (const article of document.querySelectorAll(selector.homepage.article)) {
      handleArticle(article, changeId);
    }
    for (const dialog of document.querySelectorAll(selector.dialog.frame)) {
      safe("dialog", () => handleArticle(dialog, changeId));
    }
    for (const header of document.querySelectorAll(selector.userPage.header)) {
      safe("profile", () => handleProfileHeader(header, changeId));
    }
    for (const section of document.querySelectorAll(selector.stories.frame)) {
      if (!section.querySelector("header")) continue;
      safe("stories", () => storiesNote(section, changeId));
    }
    for (const row of document.querySelectorAll(selector.watchList.item)) {
      safe("watchlist", () => watchListItemNote(row, changeId));
    }
    for (const a of document.querySelectorAll(selector.sidebar.recommend)) {
      safe("sidebar", () => anchorElementNote(a, changeId));
    }
  }
  function instagramChangeEvent(changeId) {
    scanAll(changeId);
  }
  let sweepBusy = false;
  const perf = {
    light: 0,
    full: 0,
    sweepMs: 0,
    sweepMax: 0
  };
  const sweepTries = new WeakMap;
  const zeroSizeWarned = new WeakSet;
  function sweep(light) {
    if (sweepBusy) return;
    if (document.hidden) return;
    sweepBusy = true;
    const t0 = (window.performance || Date).now();
    try {
      try {
        sweepProfile();
      } catch (e) {
        warnOnce("sweep-profile", e);
      }
      for (const article of document.querySelectorAll(selector.homepage.article)) {
        try {
          const btn = article.querySelector("." + nameSet.homepageBtn);
          if (!btn) {
            const tries = (sweepTries.get(article) || 0) + 1;
            if (tries > 10) continue;
            sweepTries.set(article, tries);
            handleArticle(article);
            if (tries === 10) {
              console.warn("[IG-Note] 这篇帖子连续 10 次没挂上按钮。前几个链接：", [ ...article.querySelectorAll("a[href]") ].slice(0, 6).map(a => a.getAttribute("href")));
            }
            continue;
          }
          if (!light) refreshArticle(article, btn);
        } catch (e) {
          warnOnce("sweep-article", e);
        }
      }
      if (light) return;
      try {
        if (document.querySelector('[role="dialog"]')) {
          for (const row of document.querySelectorAll(selector.watchList.item)) watchListItemNote(row);
        }
      } catch (e) {
        warnOnce("sweep-watchlist", e);
      }
      try {
        if (selector.homepageStories.idShell) {
          for (const item of document.querySelectorAll(selector.homepageStories.idShell)) homepageStoriesNote(item);
        }
      } catch (e) {
        warnOnce("sweep-tray", e);
      }
      try {
        for (const a of document.querySelectorAll(selector.sidebar.recommend)) anchorElementNote(a);
      } catch (e) {
        warnOnce("sweep-sidebar", e);
      }
    } finally {
      perf.sweepMs = Math.round(((window.performance || Date).now() - t0) * 10) / 10;
      if (perf.sweepMs > perf.sweepMax) perf.sweepMax = perf.sweepMs;
      if (light) perf.light++; else perf.full++;
      sweepBusy = false;
    }
  }
  let warned = {};
  function warnOnce(where, e) {
    if (warned[where]) return;
    warned[where] = 1;
    console.warn("[IG-Note] " + where + " 失败：", e);
  }
  function instagramHomepageEvent(newValue) {
    writeMode(newValue === true);
    sweep(false);
  }
  let moPending = false;
  function scheduleSweep() {
    if (moPending) return;
    moPending = true;
    window.setTimeout(() => {
      moPending = false;
      sweep(true);
    }, 300);
  }
  function registerMenus() {
    if (typeof GM_registerMenuCommand !== "function") return;
    GM_registerMenuCommand("切换备注呈现（替换用户名 / 胶囊）", () => {
      const next = !readMode();
      writeMode(next);
      sweep(false);
      toast("已切换为：" + (next ? "替换用户名" : "用户名 + 胶囊"));
    });
    GM_registerMenuCommand("立即重新扫描页面", () => {
      sweep(false);
      toast("已重新扫描");
    });
  }
  function initInstagram() {
    try {
      document.documentElement.setAttribute("data-ig-note", IG_VERSION);
      const badge = document.createElement("div");
      badge.textContent = "IG 备注 " + IG_VERSION + " 已启动";
      badge.style.cssText = "position:fixed;right:12px;bottom:12px;z-index:2147483647;" + "background:#262626;color:#fff;font:12px/1.5 system-ui,-apple-system,sans-serif;" + "padding:6px 12px;border-radius:16px;opacity:.92;pointer-events:none";
      document.body.appendChild(badge);
      window.setTimeout(() => badge.remove(), 3e3);
    } catch (e) {}
    registerMenus();
    if (typeof MutationObserver !== "undefined" && document.body) {
      const mo = new MutationObserver(scheduleSweep);
      mo.observe(document.body, {
        childList: true,
        subtree: true
      });
    }
    window.setTimeout(() => {
      sweep(false);
      window.setInterval(() => sweep(false), 2500);
    }, 1200);
  }
  window.__igNoteSweep = () => sweep(false);
  window.__igNoteDiag = function() {
    const report = {
      "帖子 <article>": document.querySelectorAll("article").length,
      "帖子头部 <header>": document.querySelectorAll("article header").length,
      "头部用户名链接": document.querySelectorAll("article header a[href]").length,
      "正文/评论用户链接": document.querySelectorAll("article section a[href]").length,
      "主页头部(含 h2)": document.querySelectorAll(selector.userPage.header).length,
      "故事 <section>": [ ...document.querySelectorAll("section") ].filter(s => s.querySelector("header")).length,
      "列表弹窗行": document.querySelectorAll(selector.watchList.item).length,
      "侧栏推荐": document.querySelectorAll(selector.sidebar.recommend).length,
      ":has() 支持": HAS_HAS,
      "被改写的用户名数": document.querySelectorAll("[data-ig-note-applied]").length,
      "胶囊数": document.querySelectorAll("." + nameSet.backgroundBox).length,
      "铅笔按钮数": document.querySelectorAll("." + nameSet.addBtn).length,
      "当前呈现": readMode() ? "替换用户名" : "用户名 + 胶囊",
      "作者状态(前5篇)": [ ...document.querySelectorAll(selector.homepage.article) ].slice(0, 5).map(a => {
        const au = pickUserAnchor(headerOf(a) || a);
        if (!au) return "(无作者)";
        const uid = userIdFromAnchor(au) || "?";
        const pill = findMyPill(au);
        return uid + "｜文字=" + JSON.stringify((au.textContent || "").trim().slice(0, 8)) + (au.dataset.igNoteApplied === "1" ? "｜已替换" : "") + (pill ? "｜有胶囊" : "");
      }),
      "扫描次数(轻/全)": perf.light + " / " + perf.full,
      "最近一次耗时(ms)": perf.sweepMs,
      "最大一次耗时(ms)": perf.sweepMax
    };
    console.table(report);
    console.table([ ...document.querySelectorAll("[data-ig-note-applied]") ].map((el, i) => {
      const p = el.parentElement;
      const r = p ? p.getBoundingClientRect() : {
        width: 0,
        height: 0
      };
      return {
        "#": i + 1,
        "用户": el.getAttribute("data-ig-note-user") || "",
        "标签": el.tagName.toLowerCase(),
        "当前文字": (el.textContent || "").slice(0, 12),
        "父级尺寸": Math.round(r.width) + "×" + Math.round(r.height)
      };
    }));
    return report;
  };
  initInstagram();
  window.setTimeout(() => {
    console.info("[IG-Note] " + IG_VERSION + " 已启动 · 帖子 " + document.querySelectorAll("article").length + " · 已挂按钮 " + document.querySelectorAll("." + nameSet.homepageBtn).length + " · 可执行 __igNoteDiag() 自检");
  }, 3e3);
})();

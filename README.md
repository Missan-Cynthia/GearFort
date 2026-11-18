# GearFort
齒輪堡壘攻防戰

## 移動城堡大戰 V1.0

使用 Node.js 在本機啟動，然後以瀏覽器開啟 http://127.0.0.1:4173/。

```powershell
node serve.mjs
```

- 觸控或滑鼠可點選底部武器，也可點藍色城堡的隊員。鍵盤按 **1–7** 出招，按 **Esc** 暫停或繼續。
- 建議橫向遊玩。關卡解鎖與音效偏好會存在目前瀏覽器內。
- 要在手機或平板測試安裝，請從 HTTPS 站點開啟。Android 可使用遊戲首頁的安裝按鈕（瀏覽器支援時）或瀏覽器選單。iPhone、iPad 可從 Safari 的分享選單加入主畫面。首次載入完成後可離線遊玩。
- GitHub Pages 可直接發布專案目錄。若選擇儲存庫子目錄作為發布來源，請將 HTML、CSS、JavaScript、manifest 和兩個 PNG 圖示放在同一個目錄。遊戲使用相對路徑，可從儲存庫子路徑執行。

### 自動測試

```powershell
node --test
```

武器與關卡設定在 `config.js`。武器操作在 `combat.js`，攻擊資格在 `eligibility.js`，傷害與修復在 `damage.js`，動畫在 `effects.js`。

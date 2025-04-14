const { google } = require("googleapis");

// 🔑 .envの値を使ってJWT認証クライアントを構築
const auth = new google.auth.JWT({
  email: process.env.GOOGLE_CLIENT_EMAIL,
  key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'), // ← ここ重要！
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const sheets = google.sheets({ version: "v4", auth });
const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID; // .envから読み込むように変更

// ユーザー一覧取得（Usersシート）
async function getUsersFromSheet() {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: "Users!A2:C",
  });

  return res.data.values.map(([user_id, email, password]) => ({
    user_id,
    email,
    password,
  }));
}

// 製造記録を追加（Recordsシート）
async function appendProductionData({ user_id, date, item, quantity }) {
  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: "Records!A:D",
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    requestBody: {
      values: [[user_id, date, item, quantity]],
    },
  });
}

// 指定ユーザーの製造履歴を取得
async function getProductionRecordsByUser(user_id) {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: "Records!A2:D",
  });

  const rows = res.data.values || [];

  return rows
    .map(([uid, date, item, quantity], i) => ({
      user_id: uid,
      date,
      item,
      quantity: Number(quantity),
      _rowIndex: i + 2,
    }))
    .filter((r) => r.user_id === user_id);
}

// 数量を更新
async function updateProductionQuantity({ user_id, date, item, quantity }) {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: "Records!A2:D",
  });

  const rows = res.data.values || [];

  for (let i = 0; i < rows.length; i++) {
    const [uid, rDate, rItem] = rows[i];
    if (uid === user_id && rDate === date && rItem === item) {
      const rowIndex = i + 2;
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `Records!D${rowIndex}`,
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: [[quantity]],
        },
      });
      return { updated: true };
    }
  }

  return { updated: false };
}

module.exports = {
  getUsersFromSheet,
  appendProductionData,
  getProductionRecordsByUser,
  updateProductionQuantity,
};

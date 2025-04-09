const { google } = require("googleapis");

const auth = new google.auth.GoogleAuth({
  keyFile: "voice-ui-455107-7bafd2889df2.json",
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const sheets = google.sheets({ version: "v4", auth });

const SPREADSHEET_ID = "18QXDj4YtrO20_eZ4KhNBQ0d2ZMeBQwHRet9L1Vuwrn4";

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
  const authClient = await auth.getClient();
  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: "Records!A:D",
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    auth: authClient,
    requestBody: {
      values: [[user_id, date, item, quantity]],
    },
  });
}

// 指定ユーザーの製造履歴を取得
async function getProductionRecordsByUser(user_id) {
  const authClient = await auth.getClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: "Records!A2:D",
    auth: authClient,
  });

  const rows = res.data.values || [];

  return rows
    .map(([uid, date, item, quantity], i) => ({
      user_id: uid,
      date,
      item,
      quantity: Number(quantity),
      _rowIndex: i + 2, // 行番号を保持（A2:D だから +2）
    }))
    .filter((r) => r.user_id === user_id);
}

// レコードを更新（該当行のquantityを書き換え）
async function updateProductionQuantity({ user_id, date, item, quantity }) {
  const authClient = await auth.getClient();

  // 全ユーザーの記録取得（+ 行番号）
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: "Records!A2:D",
    auth: authClient,
  });

  const rows = res.data.values || [];

  // 該当行を探す
  for (let i = 0; i < rows.length; i++) {
    const [uid, rDate, rItem] = rows[i];
    if (uid === user_id && rDate === date && rItem === item) {
      const rowIndex = i + 2; // A2:D は2行目がスタートなので +2
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `Records!D${rowIndex}`, // D列（quantity）
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: [[quantity]],
        },
        auth: authClient,
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

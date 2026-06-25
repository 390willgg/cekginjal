// INSTRUKSI:
// 1. Buka https://script.google.com → New Project
// 2. Hapus kode default, paste seluruh kode ini
// 3. Klik Deploy → New deployment → Web app
//    - Execute as: Me
//    - Who has access: Anyone
// 4. Klik Deploy, copy URL-nya
// 5. Di GitHub repo → Settings → Secrets → Actions
//    Tambah secret: VITE_SHEETS_URL = <URL yang dicopy>
// 6. Re-run GitHub Actions workflow

const SPREADSHEET_ID = '1SEqyExVLrKKrI7-ZYbgNj67OWQ-KBwjsXScLzJnj0Ds';
const SHEET_NAME = 'Skrining'; // ganti jika nama sheet berbeda

function doPost(e) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
    }

    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        'Tanggal Skrining', 'Nama', 'Umur (th)', 'Jenis Kelamin',
        'Tinggi (cm)', 'Berat (kg)', 'BMI', 'Kategori BMI',
        'Gula Darah (mg/dL)', 'Jenis GD', 'Tgl Cek GD', 'Kategori GD',
        'Sistolik (mmHg)', 'Diastolik (mmHg)', 'Tgl Ukur TD', 'Kategori TD',
        'Diabetes', 'Tipe DM', 'Hipertensi', 'Riwayat Keluarga Ginjal', 'Penyakit Jantung',
        'Aktivitas Fisik', 'Risiko CKD (%)', 'Kategori Risiko', 'Keyakinan Data (%)'
      ]);
    }

    const d = JSON.parse(e.postData.contents);
    sheet.appendRow([
      d.tanggal,
      d.nama,
      d.umur,
      d.gender === 'L' ? 'Laki-laki' : d.gender === 'P' ? 'Perempuan' : '',
      d.tinggi,
      d.berat,
      d.bmi,
      d.bmiCat,
      d.gdValue,
      d.gdType === 'puasa' ? 'Gula Darah Puasa' : 'Gula Darah Sewaktu',
      d.gdDate,
      d.gdCat,
      d.sys,
      d.dia,
      d.bpDate,
      d.bpCat,
      d.diabetes ? 'Ya' : 'Tidak',
      d.diabetes ? (d.dmType === 'tipe1' ? 'Tipe 1' : 'Tipe 2') : '-',
      d.hipertensi ? 'Ya' : 'Tidak',
      d.keluarga ? 'Ya' : 'Tidak',
      d.jantung ? 'Ya' : 'Tidak',
      d.aktivitas,
      d.riskPct,
      d.riskCat,
      d.confidencePct,
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  return ContentService
    .createTextOutput('CekGinjal Sheets API aktif')
    .setMimeType(ContentService.MimeType.TEXT);
}

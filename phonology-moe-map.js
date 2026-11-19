/* 語音工具：IPA → 教育部臺灣客語拼音（海陸腔）對照表。
   元音表與韻母配字表的原始資料（phonology-rimes-data.js）取自論文附錄，以IPA記錄；
   網站顯示時依本表轉寫成教育部拼音。要修正某個對應，只改這個檔，左邊是原表的IPA，右邊是顯示的拼音。
   IPA的送氣符號一律用上標 ʰ。 */
window.HakkaMoeMap = {
  // 聲母（22個）。[ŋ]與[ɲ]在拼音方案同寫作 ng。
  initials: {
    "p": "b", "pʰ": "p", "m": "m", "f": "f", "v": "v", "t": "d",
    "tʰ": "t", "n": "n", "l": "l", "k": "g", "kʰ": "k", "ŋ": "ng",
    "h": "h", "ɲ": "ng", "tʃ": "zh", "tʃʰ": "ch", "ʃ": "sh", "ts": "z",
    "tsʰ": "c", "s": "s", "ʒ": "rh", "Ø": "Ø"
  },
  // 韻母（70個）。[a]與[ɑ]同寫作 a；[ɨ]寫作 ii；[ŋ]寫作 ng；入聲韻尾 -p -t -k 寫作 -b -d -g；[ə]寫作 er。
  finals: {
    "a": "a", "e": "e", "o": "o", "ɨ": "ii", "u": "u", "i": "i", "ai": "ai",
    "ɑm": "am", "an": "an", "ɑŋ": "ang", "ɑu": "au", "ap": "ab", "at": "ad", "ɑk": "ag",
    "em": "em", "en": "en", "eu": "eu", "ep": "eb", "et": "ed", "ia": "ia", "ie": "ie",
    "im": "im", "in": "in", "io": "io", "iu": "iu", "it": "id", "iai": "iai", "iɑm": "iam",
    "iɑŋ": "iang", "iɑu": "iau", "iap": "iab", "iat": "iad", "iɑk": "iag", "iem": "iem", "ien": "ien",
    "ieu": "ieu", "iep": "ieb", "iet": "ied", "ioi": "ioi", "ion": "ion", "ioŋ": "iong", "iot": "iod",
    "iok": "iog", "iun": "iun", "iuŋ": "iung", "iut": "iud", "iuk": "iug", "oi": "oi", "on": "on",
    "oŋ": "ong", "ot": "od", "ok": "og", "uɑ": "ua", "ue": "ue", "ui": "ui", "un": "un",
    "uŋ": "ung", "ut": "ud", "uk": "ug", "uai": "uai", "uan": "uan", "uɑŋ": "uang", "uat": "uad",
    "uɑk": "uag", "uen": "uen", "uet": "ued", "ə": "er", "m̩": "m", "n̩": "n", "ŋ̍": "ng"
  }
};

# 🌿 ルクスキル Web | GitHub ＆ Vercel 完全無料公開マニュアル

この `web_app` フォルダは、スマホやPCからアクセスして音声・テキストから「note」「Substack」「Spotify」用の記事を一括作成できるWebアプリケーションです。

**費用は永久に完全0円（完全無償）** です。

---

## 🚀 3ステップでWeb上に公開する方法（完全無料）

### ステップ1：GitHub にリポジトリを作成してコードを上げる

1. [GitHub](https://github.com/) にログイン（アカウントがない場合は無料作成）。
2. 右上の「＋」アイコン → **「New repository」** をクリック。
3. リポジトリ名に `rukuskill-web` と入力。
4. **Private（非公開）** または **Public（公開）** を選択（Privateでも完全無料です）。
5. 「Create repository」をクリック。
6. この `web_app` フォルダ内のファイル一式（`index.html`, `style.css`, `app.js`, `manifest.json`, `icons/`）を、GitHubの画面上にドラッグ＆ドロップしてアップロード（または `git push`）します。

---

### ステップ2：Vercel に連携してURLを発行する

1. [Vercel](https://vercel.com/) にログイン（「Continue with GitHub」をクリックするだけでアカウント作成完了）。
2. ダッシュボードの **「Add New...」** → **「Project」** をクリック。
3. 先ほど作成した `rukuskill-web` リポジトリの横にある **「Import」** をクリック。
4. 設定変更は不要です。そのまま **「Deploy」** ボタンを押します。
5. **約10〜20秒で完了し、あなた専用の無料WebサイトURL**（例: `https://rukuskill-web.vercel.app`）が即座に発行されます！

---

### ステップ3：Gemini API キー（無料）をセットして使い始める

1. [Google AI Studio](https://aistudio.google.com/app/apikey) にアクセス。
2. **「Create API key」** をクリックして無料のAPIキー（`AIzaSy...`）をコピー。
3. 発行されたVercelのWebサイト（`https://rukuskill-web.vercel.app`）を開く。
4. 画面右上の **「⚙️ 設定」** ボタンを押し、コピーしたAPIキーを貼り付けて「保存」。
5. **完了！** これでスマホやPCからいつでも無料で使えます。

---

## 📱 スマホ（iPhone / Android）でアプリ化する方法

1. スマホの Safari（iPhone）または Chrome（Android）で、VercelのWebサイトURLを開きます。
2. ブラウザの共有ボタン（またはメニュー）をタップ。
3. **「ホーム画面に追加」** を選択。
4. ホーム画面に専用のアプリアイコンが配置され、タップするだけで本物のスマホアプリのように起動できます！

---

## 🔒 セキュリティ・プライバシーについて
* ご自身の Gemini API キーは、お使いのスマホ・PCのブラウザ内（`localStorage`）にのみ安全に保管されます。外部のサーバーや第三者に送信されることは一切ありません。

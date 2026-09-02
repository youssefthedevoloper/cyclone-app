@echo off
setlocal

set "APK_URL=%~1"
if "%APK_URL%"=="" (
  echo Usage: rebuild-apk.cmd https://your-tunnel.trycloudflare.com
  echo.
  echo 1. Start backend + tunnel (run start-cloud.cmd first)
  echo 2. Copy the tunnel URL
  echo 3. Run: rebuild-apk.cmd https://....trycloudflare.com
  pause
  exit /b 1
)

echo.
echo ========================================
echo  CYCLONE APK Builder
echo  Target: %APK_URL%
echo ========================================
echo.

set "TOKTXT=protocol=https^&host=github.com^&"
for /f "tokens=2 delims==" %%A in ('echo %TOKTXT% ^| git credential fill 2^>nul ^| findstr "password="') do set "GTOK=%%A"

echo [1/4] Setting GitHub secret API_BASE_URL ...
python -c "import base64,nacl.public,urllib.request,json; pk_data=json.loads(urllib.request.urlopen('https://api.github.com/repos/youssefthedevoloper/cyclone-app/actions/secrets/public-key',headers={'Authorization':'Bearer %GTOK%','User-Agent':'opencode'}).read()); pk=nacl.public.PublicKey(base64.b64decode(pk_data['key'])); sealed=nacl.public.SealedBox(pk); ct=sealed.encrypt(b'%APK_URL%'); enc=base64.b64encode(ct).decode(); req=urllib.request.Request('https://api.github.com/repos/youssefthedevoloper/cyclone-app/actions/secrets/API_BASE_URL',data=json.dumps({'encrypted_value':enc,'key_id':pk_data['key_id']}).encode(),headers={'Authorization':'Bearer %GTOK%','Content-Type':'application/json','User-Agent':'opencode','X-GitHub-Api-Version':'2022-11-28'},method='PUT'); urllib.request.urlopen(req); print('OK')"

echo [2/4] Pushing code ...
git add -A && git commit -m "rebuild APK for %APK_URL%" 2>nul
set "HAS_CHANGES=%ERRORLEVEL%"
if "%HAS_CHANGES%"=="0" (
  git push
) else (
  echo No code changes to push
)

echo [3/4] Triggering GitHub Actions build ...
python -c "import urllib.request,json; req=urllib.request.Request('https://api.github.com/repos/youssefthedevoloper/cyclone-app/actions/workflows/build-android.yml/dispatches',data=json.dumps({'ref':'main'}).encode(),headers={'Authorization':'Bearer %GTOK%','Content-Type':'application/json','User-Agent':'opencode','X-GitHub-Api-Version':'2022-11-28'},method='POST'); urllib.request.urlopen(req); print('Build triggered')"

echo [4/4] Waiting for build (~4 min) ...
python -c "import urllib.request,json,time; h={'Authorization':'Bearer %GTOK%','User-Agent':'opencode','X-GitHub-Api-Version':'2022-11-28'}; runs=json.loads(urllib.request.urlopen('https://api.github.com/repos/youssefthedevoloper/cyclone-app/actions/workflows/build-android.yml/runs?per_page=1',headers=h).read()); run_id=runs['workflow_runs'][0]['id']; print(f'Run ID: {run_id}'); [time.sleep(20) for _ in range(60) if json.loads(urllib.request.urlopen(f'https://api.github.com/repos/youssefthedevoloper/cyclone-app/actions/runs/{run_id}',headers=h).read())['status']!='completed']; r=json.loads(urllib.request.urlopen(f'https://api.github.com/repos/youssefthedevoloper/cyclone-app/actions/runs/{run_id}',headers=h).read()); print(f'Result: {r[\"conclusion\"]}')"

echo.
echo Downloading APK ...
python -c "import urllib.request,json,zipfile,os; h={'Authorization':'Bearer %GTOK%','User-Agent':'opencode','X-GitHub-Api-Version':'2022-11-28'}; runs=json.loads(urllib.request.urlopen('https://api.github.com/repos/youssefthedevoloper/cyclone-app/actions/workflows/build-android.yml/runs?per_page=1',headers=h).read()); rid=runs['workflow_runs'][0]['id']; arts=json.loads(urllib.request.urlopen(f'https://api.github.com/repos/youssefthedevoloper/cyclone-app/actions/runs/{rid}/artifacts',headers=h).read()); aid=[a['id'] for a in arts['artifacts'] if a['name']=='cyclone-apk'][0]; urllib.request.urlretrieve(f'https://api.github.com/repos/youssefthedevoloper/cyclone-app/actions/artifacts/{aid}/zip','cyclone-apk.zip'); os.makedirs('apk-output',exist_ok=True); zipfile.ZipFile('cyclone-apk.zip').extractall('apk-output'); print('APK saved to apk-output/app-release.apk')"

echo.
echo ========================================
echo  DONE! APK at: apk-output\app-release.apk
echo  Install it on your phone.
echo ========================================
pause
